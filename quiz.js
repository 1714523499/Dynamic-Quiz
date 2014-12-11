/**
 * Created by oilyenko on 9/16/2014.
 */

var allQuestions,
    i = -1,
    goNext = (function () {
        return function () {
            return allQuestions[++i];
        };
    })(),

    goPrevious = (function () {
        return function () {
            if (i === 0) {
                return allQuestions[i];
            }
            return allQuestions[--i];
        };
    })(),

    changeHtml = function (obj) {
        $('.question').fadeOut(function () {
            $(this).text(obj.question)
        }).add($('input').fadeOut()).add($('label[for=qa]').fadeOut(function () {
            $(this).html(obj.choices[0])
        })).add($('label[for=qb]').fadeOut(function () {
            $(this).html(obj.choices[1])
        })).add($('label[for=qc]').fadeOut(function () {
            $(this).html(obj.choices[2])
        })).add($('label[for=qd]').fadeOut(function () {
            $(this).html(obj.choices[3])
        })).fadeIn();
        setTimeout(function () {
            $('#' + sessionStorage[allQuestions.indexOf(obj)]).prop("checked", true);
        }, 600);
    },

    uncheck = function (checkedBox) {
        setTimeout(function () {
            checkedBox.removeAttr('checked');
        }, 300);
    };

$(document).ready(function () {

    $.ajax({
        url: 'questions.json',
        datatype: 'json',
        type: 'get',
        cache: false,
        async: false,
        success: function (data) {
            allQuestions = data.questions;
        }
    });
    var currentObject,
        $quiz = $(".quiz"),
        $greet = $(".greetings"),
        $logoff = $('.logoff'),
        $message = $('.message'),
        $signedin = $('.signedIn'),
        $registrationForm = $('.registrationForm'),
        $loginForm = $('.loginForm'),
        $succeed = $(".succeed"),
        passwordFirst = "You should enter your login first!",
        loginFirst = "You should enter your login first!",
        login = ("; " + document.cookie).split("; login=").pop().split(";").shift(),
        loginAction = function (login) {
            currentObject = goNext();
            var name = localStorage.getItem(login + "_name");
            $message.empty().append("Hello, " + name + "!")
                .append($("<p>")).append("Welcome again!");
            $loginForm.hide().replaceWith($greet);
            $greet.fadeIn().delay(500).fadeOut();
            changeHtml(currentObject);
            $signedin.empty().append("You're signed in as " + name);
            setTimeout(function () {
                $quiz.fadeIn("slow");
                $logoff.fadeIn("slow");
            }, 1500);
        };


    if (localStorage.getItem(login + "_name")) {
        loginAction(login);
    }

    $loginForm.submit(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var login = $(this).find('input[name=login]').val();
        if (!login) {
            alert(loginFirst);
            return false;
        }
        var password = $(this).find('input[name=password]').val();
        if (!password) {
            alert(passwordFirst);
            return false;
        }
        if (!localStorage.getItem(login + "_name") || localStorage.getItem(login + "_password") !== password) {
            alert("Incorrect username or password");
            return false;
        }

        if ($("input[id=remember_me]:checked").length > 0) {
            document.cookie = "login=" + login + "; expires=Fri, 3 Aug 2016 20:47:11 UTC";
        }
        loginAction(login);
    });

    $('#logoffBtn').on('click', function () {
        sessionStorage.clear();
        document.cookie = "login=; expires=Fri, 3 Aug 2000 20:47:11 UTC";
    });

    $('#goRegister').on('click', function () {
        $(this).closest('form').find("input[type=text], textarea").val("");
        $loginForm.hide();
        $registrationForm.fadeIn();
    });

    $('#cancel').on('click', function () {
        $(this).closest('form').find("input[type=text], textarea").val("");
        $registrationForm.hide();
        $loginForm.fadeIn();
    });


    $registrationForm.submit(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var name = $(this).find('input[name=rname]').val();
        if (!name) {
            alert("You should enter your name!");
            return false;
        }
        var login = $(this).find('input[name=rlogin]').val();
        if (!login) {
            alert(loginFirst);
            return false;
        }
        var password = $(this).find('input[name=rpassword]').val();
        if (!password) {
            alert(passwordFirst);
            return false;
        }
        var cpassword = $(this).find('input[name=cpassword]').val();
        if (!cpassword) {
            alert("You should enter your password confirmation!");
            return false;
        }

        if (password !== cpassword) {
            alert("Your password and password confirmation does not match!");
            return false;
        }

        if (login.length < 5) {
            alert("You specified too short login! Use at least 5 symbols");
            return false;
        }

        if (password.length < 5) {
            alert("You specified too short password! Use at least 5 symbols");
            return false;
        }

        if (localStorage.getItem(login + "_name")) {
            alert("User with such username already exists! Please choose another one.");
            return false;
        }

        localStorage.setItem(login + "_password", password);
        localStorage.setItem(login + "_name", name);
        $message.empty().append("Congratulations, " + name + "!").append($("<p>")).append("You have successfully registered to Quiz!");
        $(this).fadeOut("slow").replaceWith($succeed);
        $signedin.empty().append("You're signed in as " + name);
        $succeed.fadeIn();
    });

    $('#goToQuiz').on('click', function () {
        currentObject = goNext();
        $succeed.fadeOut();
        changeHtml(currentObject);
        setTimeout(function () {
            $quiz.fadeIn("slow");
            $logoff.fadeIn("slow");
        }, 800);
    });

    $('#next').on('click', function () {
            var $checkedBox = $('input[name=q]:radio:checked');
            if ($checkedBox.length === 0) {
                alert("Please choose the answer!");
                return;
            }
            sessionStorage[allQuestions.indexOf(currentObject)] = $checkedBox.attr('id');
            uncheck($checkedBox);
            currentObject = goNext();
            if (currentObject) {
                changeHtml(currentObject);
            } else {
                $('.answers').add('.buttons').fadeOut().remove();
                for (var j = 0, all = allQuestions.length, correct = 0; j < all; j++) {
                    var answer;
                    switch (sessionStorage[j]) {
                        case "qa":
                            answer = 0;
                            break;
                        case "qb":
                            answer = 1;
                            break;
                        case "qc":
                            answer = 2;
                            break;
                        case "qd":
                            answer = 3;
                            break;
                    }
                    if (answer === allQuestions[j].correctAnswer) {
                        correct++;
                    }
                }
                $('.question').fadeOut(function () {
                    $(this).empty().text("You did it!").append("<h5>You have answered correctly " + correct + " of " + all + " questions</h5>")
                }).fadeIn();
            }
        }
    );

    $('#back').on('click', function () {
        var $checkedBox = $('input[name=q]:radio:checked');
        sessionStorage[allQuestions.indexOf(currentObject)] = $checkedBox.attr('id');
        var tmp = currentObject;
        currentObject = goPrevious();
        if (currentObject !== tmp) {
            uncheck($checkedBox);
            changeHtml(currentObject);
        }
    });
});

$(window).on('unload', function () {
    sessionStorage.clear();
});

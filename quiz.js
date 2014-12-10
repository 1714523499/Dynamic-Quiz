/**
 * Created by oilyenko on 9/16/2014.
 */

var allQuestions;
var i = -1;
var goNext = (function () {
    return function () {
        return allQuestions[++i];
    };
})();

var goPrevious = (function () {
    return function () {
        if (i === 0) {
            return allQuestions[i];
        }
        return allQuestions[--i];
    };
})();

var changeHtml = function (obj) {
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
};

var uncheck = function (checkedBox) {
    setTimeout(function () {
        checkedBox.removeAttr('checked');
    }, 300);
};

var saveFormState = function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
}

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
    sessionStorage.clear();
    var currentObject;
    $('.loginForm').submit(function (e) {
        var login = $(this).find('input[name=login]').val();
        if (!login) {
            alert("You should enter your login first!");
            saveFormState(e);
            return false;
        }
        var password = $(this).find('input[name=password]').val();
        if (!password) {
            alert("You should enter your password first!");
            saveFormState(e);
            return false;
        }
        if (!localStorage.getItem(login + "_name") || localStorage.getItem(login + "_password") !== password) {
            alert("Incorrect username or password");
            saveFormState(e);
            return false;
        }
        var checked = $(this).find('#remember_me').attr("checked");
        saveFormState(e);
        currentObject = goNext();
        var $quiz = $(".quiz");
        var $greet = $(".greetings");
        $('.message').append("Hello, " + localStorage.getItem(login + "_name") + "!").append($("<p>")).append("Welcome again!");
        $(this).fadeOut("slow").replaceWith($greet);
        $greet.fadeIn().delay(500).fadeOut();
        changeHtml(currentObject);
        setTimeout(function () {
            $quiz.fadeIn("slow");
        }, 2000);
    });

    $('#goRegister').on('click', function () {
        $(this).closest('form').find("input[type=text], textarea").val("");
        $('.loginForm').hide().delay(100);
        $('.registrationForm').fadeIn();
    });

    $('#cancel').on('click', function () {
        $(this).closest('form').find("input[type=text], textarea").val("");
        $('.registrationForm').hide().delay(100);
        $('.loginForm').fadeIn();
    });


    $('.registrationForm').submit(function (e) {
        var name = $(this).find('input[name=rname]').val();
        if (!name) {
            alert("You should enter your name!");
            saveFormState(e);
            return false;
        }
        var login = $(this).find('input[name=rlogin]').val();
        if (!login) {
            alert("You should enter your login!");
            saveFormState(e);
            return false;
        }
        var password = $(this).find('input[name=rpassword]').val();
        if (!password) {
            alert("You should enter your password!");
            saveFormState(e);
            return false;
        }
        var cpassword = $(this).find('input[name=cpassword]').val();
        if (!cpassword) {
            alert("You should enter your password confirmation!");
            saveFormState(e);
            return false;
        }

        if (password !== cpassword) {
            alert("Your password and password confirmation does not match!");
            saveFormState(e);
            return false;
        }

        if (login.length < 5){
            alert("You specified too short login! Use at least 5 symbols");
            saveFormState(e);
            return false;
        }

        if (password.length < 5){
            alert("You specified too short password! Use at least 5 symbols");
            saveFormState(e);
            return false;
        }

        if (localStorage.getItem(login + "_name")) {
            alert("User with such username already exists! Please choose another one.");
            saveFormState(e);
            return false;
        }

        localStorage.setItem(login + "_password", password);
        localStorage.setItem(login + "_name", name);
        saveFormState(e);
        var $succeed = $(".succeed");
        $('.message').append("Congratulations, " + name + "!").append($("<p>")).append("You have successfully registered to Quiz!");
        $(this).fadeOut("slow").replaceWith($succeed);
        $succeed.fadeIn();
    });

    $('#goToQuiz').on('click', function () {
        currentObject = goNext();
        $(".succeed").fadeOut();
        changeHtml(currentObject);
        setTimeout(function () {
            $(".quiz").fadeIn("slow");
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
                $('.answers').add('.buttons').remove();
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
                $('.answers').add('.buttons').fadeOut().remove();
                $('.question').fadeOut(function () {
                    $(this).text("You did it!").append("<h5>You have answered correctly " + correct + " of " + all + " questions</h5>")
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

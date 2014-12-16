/**
 * Created by ailyenko on 9/16/2014.
 */

var allQuestions, globalLogin, currentObject

$.ajax({
    url: 'resources/questions.json',
    datatype: 'json',
    type: 'get',
    cache: false,
    async: false,
    success: function (data) {
        allQuestions = data.questions
    }
})

$(document).ready(function () {
    var passwordFirst = "You should enter your password first!",
        loginFirst = "You should enter your login first!",
        login = ("; " + document.cookie).split("; login=").pop().split(";").shift(),
        MOVE = {
            position: -1,
            goNext: (function () {
                return function () {
                    return allQuestions[++this.position]
                }
            })(),
            goPrevious: (function () {
                return function () {
                    if (this.position === 0) {
                        return allQuestions[this.position]
                    }
                    return allQuestions[--this.position]
                }
            })()
        },

        $quiz = $(".quiz"),
        $greet = $(".greetings"),
        $logoff = $('.logoff'),
        $message = $('.message'),
        $signedin = $('.signedIn'),
        $registrationForm = $('.registrationForm'),
        $loginForm = $('.loginForm'),
        $succeed = $(".succeed"),
        $question = $('.question'),
        $answers = $('.answers'),
        $buttons = $('.buttons')

    if (localStorage.getItem(login + "_name")) {
        loginAction(login)
    }

    $loginForm.submit(function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        var login = $(this).find('input[name=login]').val()
        if (!login) {
            alert(loginFirst)
            return false
        }
        var password = $(this).find('input[name=password]').val()
        if (!password) {
            alert(passwordFirst)
            return false
        }
        if (!localStorage.getItem(login + "_name") ||
            localStorage.getItem(login + "_password") !== password) {
            alert("Incorrect username or password")
            return false
        }

        if ($("input[id=remember_me]:checked").length > 0) {
            saveLoginAsCookie(login)
        }
        loginAction(login)
    })

    $('#logoffBtn').on('click', function () {
        saveAnswers(globalLogin)
        saveLoginAsCookie("")
    })

    $('#goRegister').on('click', function () {
        $(this).closest('form').find("input[type=text], textarea").val("")
        $loginForm.hide()
        $registrationForm.fadeIn()
    })

    $('#cancel').on('click', function () {
        $(this).closest('form').find("input[type=text], textarea").val("")
        $registrationForm.hide()
        $loginForm.fadeIn()
    })


    $registrationForm.submit(function (e) {
        e.preventDefault()
        e.stopImmediatePropagation()
        var name = $(this).find('input[name=rname]').val()
        if (!name) {
            alert("You should enter your name!")
            return false
        }
        var login = $(this).find('input[name=rlogin]').val()
        if (!login) {
            alert(loginFirst)
            return false
        }
        var password = $(this).find('input[name=rpassword]').val()
        if (!password) {
            alert(passwordFirst)
            return false
        }
        var cpassword = $(this).find('input[name=cpassword]').val()
        if (!cpassword) {
            alert("You should enter your password confirmation!")
            return false
        }

        if (password !== cpassword) {
            alert("Your password and password confirmation does not match!")
            return false
        }

        if (login.length < 5) {
            alert("You specified too short login! Use at least 5 symbols")
            return false
        }

        if (password.length < 5) {
            alert("You specified too short password! Use at least 5 symbols")
            return false
        }

        if (localStorage.getItem(login + "_name")) {
            alert("User with such username already exists! Please choose another one.")
            return false
        }

        localStorage.setItem(login + "_password", password)
        localStorage.setItem(login + "_name", name)
        $message.empty().append("Congratulations, " + name + "!")
            .append($("<p>")).append("You have successfully registered to Quiz!")
        $(this).fadeOut("slow").replaceWith($succeed)
        $signedin.empty().append("You're signed in as " + name)
        $succeed.fadeIn()
        saveLoginAsCookie(login)
        globalLogin = login
    })

    $('#goToQuiz').on('click', function () {
        currentObject = MOVE.goNext()
        $succeed.fadeOut()
        changeHtml(currentObject)
        setTimeout(function () {
            $quiz.add($logoff).fadeIn()
        }, 800)
    })

    $('#next').on('click', function () {
            var $checkedBox = $('input[name=q]:radio:checked')
            if ($checkedBox.length === 0) {
                alert("Please choose the answer!")
            } else {
                $.blockUI({message: null})
                sessionStorage[allQuestions.indexOf(currentObject)] = $checkedBox.attr('id')
                currentObject = MOVE.goNext()
                if (currentObject) {
                    changeHtml(currentObject)
                } else {
                    $answers.add($buttons).fadeOut()
                    for (var j = 0, all = allQuestions.length, correct = 0; j < all; j++) {
                        var answer
                        switch (sessionStorage[j]) {
                            case "qa":
                                answer = 0
                                break
                            case "qb":
                                answer = 1
                                break
                            case "qc":
                                answer = 2
                                break
                            case "qd":
                                answer = 3
                                break
                        }
                        if (answer === allQuestions[j].correctAnswer) {
                            correct++
                        }
                    }
                    sessionStorage.clear()
                    $question.fadeOut(function () {
                        var scores = (correct / all) * 100, finalMsg, color
                        if (scores === 100) {
                            finalMsg = "Perfect, "
                            color = "green"
                        } else if (scores > 60) {
                            finalMsg = "Good result, "
                            color = "blue"
                        } else {
                            finalMsg = "You can do it better, "
                            color = "red"
                        }
                        $(this).empty().text(finalMsg + localStorage.getItem(globalLogin + "_name") + "!")
                            .append("<h4>Your score is <div class=\"" + color + "\"><b>"
                            + scores.toFixed(0) + "</b></div> points!</h4>")
                            .append("<button type=\"button\" id=\"startOver\">Start over</button>")
                    }).fadeIn()
                }
            }
            unBlockUIinMsec(180)
        }
    )


    $quiz.on('click', '#startOver', function () {
        $.blockUI({
            message: "<h3><img src=\"resources/busy.gif\" /> Reloading questions...</h3>"
        })
        MOVE.position = -1
        currentObject = MOVE.goNext()
        changeHtml(currentObject)
        $answers.add($buttons).fadeIn()
        unBlockUIinMsec(500)
    })

    $('#back').on('click', function (e) {
        sessionStorage[allQuestions.indexOf(currentObject)] = $(
            'input[name=q]:radio:checked'
        ).attr('id')
        var tmp = currentObject
        currentObject = MOVE.goPrevious()
        if (tmp == currentObject) {
            return
        }
        $.blockUI({message: null})
        changeHtml(currentObject)
        unBlockUIinMsec(100)
    })

    function changeHtml(obj) {
        $('.question').fadeOut(function () {
            $(this).empty().text(obj.question)
        }).add($('input[name=q]').fadeOut(function () {
            $(this).prop('checked', false)
        })).add($('label[for=qa]').fadeOut(function () {
            $(this).html(obj.choices[0])
        })).add($('label[for=qb]').fadeOut(function () {
            $(this).html(obj.choices[1])
        })).add($('label[for=qc]').fadeOut(function () {
            $(this).html(obj.choices[2])
        })).add($('label[for=qd]').fadeOut(function () {
            $(this).html(obj.choices[3])
        })).fadeIn("fast", function () {
            $('#' + sessionStorage[allQuestions.indexOf(obj)]).prop("checked", true)
        })
    }

    function loginAction(login) {
        globalLogin = login
        loadAnswers(login)
        currentObject = MOVE.goNext()
        var name = localStorage.getItem(login + "_name")
        $message.empty().append("Hello, " + name + "!")
            .append($("<p>")).append("Welcome again!")
        $loginForm.hide().replaceWith($greet)
        $greet.fadeIn().delay(500).fadeOut()
        changeHtml(currentObject)
        $signedin.empty().append("You're signed in as " + name)
        setTimeout(function () {
            $quiz.add($logoff).fadeIn("slow")
        }, 1500)
    }

    function saveLoginAsCookie(login) {
        var year = 2016
        if (!login) {
            year = 2000
        }
        document.cookie = "login=" + login + "; expires=Fri, 3 Aug " + year + " 20:47:11 UTC"
    }

    function loadAnswers(login) {
        var answerArray = localStorage.getItem(login + "_answers")
        if (answerArray) {
            answerArray.split("~").forEach(function (ans, index) {
                sessionStorage.setItem(index, ans)
            })
            localStorage.removeItem(login + "_answers")
        }
    }

    function unBlockUIinMsec(msec) {
        setTimeout(function () {
            $.unblockUI()
        }, msec)
    }
})

$(window).unload(function () {
    saveAnswers(globalLogin)
})

function saveAnswers(login) {
    var id = $('input[name=q]:radio:checked').attr('id'),
        answerString = ""
    if (id && sessionStorage[allQuestions.indexOf(currentObject)] !== id) {
        sessionStorage[allQuestions.indexOf(currentObject)] = id;
    }
    for (var m = 0; m < allQuestions.length; m++) {
        if (!sessionStorage.getItem(m)) {
            break
        }
        answerString += sessionStorage.getItem(m) + "~"
    }
    if (answerString) {
        localStorage.setItem(login + "_answers", answerString)
    }
    sessionStorage.clear()
}

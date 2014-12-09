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
    $(".quiz").hide().delay(400).fadeIn();
    sessionStorage.clear();
    var currentObject = goNext();
    changeHtml(currentObject);

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
        uncheck($checkedBox);
        currentObject = goPrevious();
        changeHtml(currentObject);
    });
});

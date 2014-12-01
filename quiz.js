/**
 * Created by oilyenko on 9/16/2014.
 */
var allQuestions = [
    {question: "Who is Prime Minister of the United Kingdom?",
        choices: ["David Cameron", "Gordon Brown", "Winston Churchill", "Tony Blair"],
        correctAnswer: 0},
    {question: "Who is the father of Geometry?",
        choices: ["Aristotle", "Euclid", "Pythagoras", "Kepler"],
        correctAnswer: 1},
    {question: "The Homolographic projection has the correct representation of",
        choices: ["shape", "area", "baring", "distance"],
        correctAnswer: 1},
    {question: "The hazards of radiation belts include",
        choices: ["deterioration of electronic circuits", "damage of solar cells of spacecraft", "adverse effect on living organisms", "All of the above"],
        correctAnswer: 3},
    {question: "The great Victoria Desert is located in",
        choices: ["Canada", "West Africa", "Australia", "North America"],
        correctAnswer: 2},
    {question: "Which of the following is tropical grassland?",
        choices: ["Taiga", "Savannah", "Pampas", "Prairies"],
        correctAnswer: 1},
    {question: "With the disintegration of USSR in end 1991, comprised of ____ Union Republics.",
        choices: ["15", "10", "5", "25"],
        correctAnswer: 1},
    {question: "The temperature increases rapidly after",
        choices: ["ionosphere", "exosphere", "stratosphere", "troposphere"],
        correctAnswer: 1},
    {question: "The largest gold producing country in the world(in 2006) is",
        choices: ["China", "Canada", "South Africa", "USA"],
        correctAnswer: 2},
    {question: "The largest country of the world by geographical area is",
        choices: ["Russia", "Vatican City", "Australia", "USA"],
        correctAnswer: 1}
];

var getObject = (function () {
    var i = 0;
    return function () {
        return allQuestions[i++];
    };
})();

var changeHtml = function (question) {
    $('.question').text(question.question);
    $('label[for=qa]').html(question.choices[0]);
    $('label[for=qb]').html(question.choices[1]);
    $('label[for=qc]').html(question.choices[2]);
    $('label[for=qd]').html(question.choices[3]);
};

$(document).ready(function () {
    var correct = 0;
    var all = allQuestions.length;
    var currentObject = getObject();
    changeHtml(currentObject);
    $('#next').on('click', function () {
        var $checkedBox = $('input[name=q]:radio:checked');
        if ($checkedBox.length === 0) {
            alert("Please choose the answer!");
            return;
        }
        $checkedBox.removeAttr('checked');
        if ($('label[for=' + $checkedBox.attr('id') + ']').html() === currentObject.choices[currentObject.correctAnswer]) {
            correct++;
        }
        currentObject = getObject();
        if (currentObject) {
            changeHtml(currentObject);
        } else {
            $('.answers').remove();
            $(this).remove();
            $('.question').text("You did it!").append("<h5>You answered correctly " + correct + " of " + all + " questions</h5>");
        }
    });
});
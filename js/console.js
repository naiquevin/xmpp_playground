(function (window, $, Strophe, XPG, undefined) {

    "use strict";

    var XMLConsole = {
        rawInput: function (data) {
            $('<li></li>').append(document.createTextNode('RECV: ' + data)).appendTo($("#console"));
        },
        rawOutput: function (data) {
            $('<li></li>').append(document.createTextNode('SENT: ' + data)).appendTo($("#console"));
        },
        log: function (msg) {
            $('<li></li>').append(document.createTextNode(msg)).appendTo($("#log"));
        }
    };

    XPG.XMLConsole = XMLConsole;

    $.get(DIR_BASE + 'html/_console.html', function (resp) {
        $(".container").append(resp);
    });

}) (window, jQuery, Strophe, XPG);

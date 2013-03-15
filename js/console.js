(function (window, $, Strophe, undefined) {
    
    "use strict";

    var $xmlconsole = $("#console");
    var $log = $("#log");

    var XMLConsole = {
        rawInput: function (data) {
            $('<li></li>').append(document.createTextNode('RECV: ' + data)).appendTo($xmlconsole);
        },
        rawOutput: function (data) {
            $('<li></li>').append(document.createTextNode('SENT: ' + data)).appendTo($xmlconsole);
        },
        log: function (msg) {
            $('<li></li>').append(document.createTextNode(msg)).appendTo($log);
        }
    };

    window.XMLConsole = XMLConsole;

}) (window, jQuery, Strophe);

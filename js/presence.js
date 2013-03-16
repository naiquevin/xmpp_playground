(function (window, $, Strophe, XPG, undefined) {
    
    "use strict";

    var XMLConsole = XPG.XMLConsole;
    var log = XMLConsole.log;

    var connection = XPG.connection;

    XPG.Presence = {
        
        send: function (attr) {
            if (attr) {
                connection.send($pres(attr));
            } else {
                connection.send($pres());
            }
        },

        probe: function (to) {
            connection.send($pres({type: 'probe', from: XPG.connection.jid, to: to}));
        }
    }

}) (window, jQuery, Strophe, XPG);

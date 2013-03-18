(function (window, $, Strophe, XPG, undefined) {

    "use strict";

    XPG.Presence = {

        init: function () {
            XPG.connection.addHandler(function (msg) {
                var from = msg.getAttribute('from');
                var type = msg.getAttribute('type');
                XPG.XMLConsole.log('Received presence of type ' + type + ' from ' + from);
                return true;
            }, null, 'presence', null, null,  null);
        },

        send: function (attr) {
            if (attr) {
                XPG.connection.send($pres(attr));
            } else {
                XPG.connection.send($pres());
            }
        },

        sendAvailable: function () {
            XPG.Presence.send();
        },

        sendUnavailable: function () {
            XPG.Presence.send({type: 'unavailable'});
        },

        probe: function (to) {
            XPG.Presence({type: 'probe', from: XPG.connection.jid, to: to});
        }
    };

    $.ajax({
        url: '_presencePanel.html',
        success: function (resp) {
            var p = XPG.Presence;
            $("#controls").append(resp);
            p.init();
            $(".sendAvailableBtn").click(function () {
                p.sendAvailable();
            });
            $(".sendUnavailableBtn").click(function () {
                p.sendUnavailable();
            });
            $(".sendProbeBtn").click(function () {
                p.probe($("input[name='probeTo']").val());
            });
        }
    });

}) (window, jQuery, Strophe, XPG);

(function (window, $, Strophe, XPG, undefined) {

    "use strict";

    var XMLConsole = XPG.XMLConsole;
    var log = XMLConsole.log;

    var connection = XPG.connection;

    XPG.Roster = {

        get: function (processItem) {
            var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
            XPG.connection.sendIQ(iq, function (iq) {
                $(iq).find('item').each(function () {
                    var jid = $(this).attr('jid');
                    var name = $(this).attr('name') || jid;
                    log('In roster: ' + jid + ' (' + name + ')');
                    if (typeof(processItem) === 'function') {
                        processItem.call(this, jid, name);
                    }
                });
            }, function () {
                log('IQ get request failed!');
            });
        }
    };

    $.ajax({
        url: '_rosterPanel.html',
        success: function (resp) {
            $("#controls").append(resp);
            $(".getRosterBtn").click(XPG.Roster.get);
        }
    });

}) (window, jQuery, Strophe, XPG);

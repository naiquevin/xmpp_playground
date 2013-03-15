(function (window, $, Strophe, undefined) {
    
    "use strict";

    var XMLConsole = window.XMLConsole;
    var log = XMLConsole.log;

    $("form#attachForm").submit(function (e) {
        e.preventDefault();

        var $form = $(e.target);
        
        var sid = $("input[name='sid']").val();
        var rid = parseInt($("input[name='rid']").val()) + 1;
        var jid = $("input[name='jid']").val();
        
        $(document).trigger('attach', {
            jid: jid,
            sid: sid,
            rid: rid
        });
    });

    var connection = new Strophe.Connection(BOSH_SERVICE);
    connection.rawInput = XMLConsole.rawInput;
    connection.rawOutput = XMLConsole.rawOutput;

    $(document).bind('attach', function (e, data) {
        connection.attach(data.jid, data.sid, data.rid, function (status) {
            console.log(status);
            if (status == Strophe.Status.DISCONNECTED) {
	        log('Strophe is disconnected.');
            } else if (status == Strophe.Status.CONNECTED) {
	        log('Strophe is attached.');
	        connection.disconnect();
            }
        });

        log('Strophe is attached.');

        var iq = $iq({type: 'get'}).c('query', {xmlns: 'jabber:iq:roster'});
        connection.sendIQ(iq, function () {
            log('roster iq success');
        }, function () {
            log('roster iq error');
        });

        // connection.send($pres());

    });

    window.con = connection;

    $(document).bind('disconnect', function (data) {
        connection.disconnect();
    });

    $(document).bind('send_presence', function (data) {
        connection.send($pres({}));
    });

}) (window, jQuery, Strophe);

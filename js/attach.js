(function (window, $, Strophe, XPG, undefined) {
    
    "use strict";

    var XMLConsole = XPG.XMLConsole;
    var log = XMLConsole.log;

    $("form#attachForm").submit(function (e) {
        e.preventDefault();

        var $form = $(e.target);
        
        var sid = $("input[name='sid']").val();
        var rid = $("input[name='rid']").val();
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

    // add connection object to the global namespace
    XPG.connection = connection;

    $(document).bind('attach', function (e, data) {
        var startTime = new Date();
        connection.attach(data.jid, data.sid, data.rid, function (status) {
            if (status == Strophe.Status.DISCONNECTED) {
	        log('Strophe is disconnected (status: ' + status + ')');
            } else if (status == Strophe.Status.CONNECTED) {
	        log('Strophe is attached (status: ' + status + ')');
	        connection.disconnect();
            }
        });

        var time_taken = new Date() - startTime;
        log('Strophe is attached. Time taken: ' + time_taken + 'ms');
    });

    $(document).bind('disconnect', function (data) {
        connection.disconnect();
    });

}) (window, jQuery, Strophe, XPG);

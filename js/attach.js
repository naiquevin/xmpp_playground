(function (window, $, Strophe, docCookies, XPG, undefined) {

    "use strict";

    var XMLConsole = XPG.XMLConsole;
    var log = XMLConsole.log;

    var init = function () {

        if (docCookies.hasItem('sid')) {
            $("input[name='jid']").val(docCookies.getItem('jid'));
            $("input[name='sid']").val(docCookies.getItem('sid'));
            $("input[name='rid']").val(docCookies.getItem('rid'));
        }

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

        $("form#attachForm .disconnectBtn").click(function () {
            $(document).trigger('disconnect');
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

        $("form#attachForm .saveCookieBtn").click(function () {
            docCookies.setItem('jid', connection.jid);
            docCookies.setItem('sid', connection.sid);
            window.onbeforeunload = function () {
                docCookies.setItem('rid', parseInt(connection.rid));
            };
        });

        $("form#attachForm .clearCookieBtn").click(function () {
            docCookies.removeItem('jid');
            docCookies.removeItem('sid');
            docCookies.removeItem('rid');
            $("input", $(this).parent()).val('');
        });

        $("form#createSessionForm .createSessionBtn").click(function () {
            var startTime = new Date();
            var username = $("input[name='username']").val();
            var password = $("input[name='password']").val();
            if (username && password) {
                $.ajax({
                    url: BOSH_SESSION_SERVICE,
                    data: {'username': username, 'password': password},
                    dataType: 'jsonp',
                    success: function (resp) {
                        resp = JSON.parse(resp);
                        $("input[name='jid']").val(resp.full_jid);
                        $("input[name='sid']").val(resp.sid);
                        $("input[name='rid']").val(resp.rid);
                        var endTime = new Date();
                        log('Session creation via jsonp took: ' + (endTime - startTime) + 'ms');
                    }
                });
            }
        });
    };

    $.ajax({
        url: '_attachForm.html',
        success: function (resp) {
            $("#controls").append(resp);
            init();
        }
    });

}) (window, jQuery, Strophe, docCookies, XPG);

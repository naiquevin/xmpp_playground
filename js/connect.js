(function (window, $, Strophe, XPG, undefined) {

    "use strict";

    var XMLConsole = XPG.XMLConsole;
    var log = XMLConsole.log;

    var init = function () {

        $("input[name='username']").val(USERNAME);
        $("input[name='domain']").val(DOMAIN);
        $("input[name='password']").val(PASSWORD);

        $("form#authForm").submit(function (e) {
            e.preventDefault();

            var $form = $(e.target);

            var username = $("input[name='username']").val();
            var domain = $("input[name='domain']").val();
            var password = $("input[name='password']").val();

            var jid = username + '@' + domain;

            $(document).trigger('connect', {
                jid: jid,
                password: password
            });
        });

        $("form#authForm .disconnectBtn").click(function () {
            $(document).trigger('disconnect');
        });

        var connection = new Strophe.Connection(BOSH_SERVICE);
        connection.rawInput = XMLConsole.rawInput;
        connection.rawOutput = XMLConsole.rawOutput;

        // add connection object to the global namespace
        XPG.connection = connection;

        $(document).bind('connect', function (e, data) {
            var startTime = new Date();
            connection.connect(data.jid, data.password, function (status) {
                if (status == Strophe.Status.CONNECTING) {
	            log('Strophe is connecting (status: ' + status + ')');
                } else if (status == Strophe.Status.CONNFAIL) {
	            log('Strophe failed to connect (status: ' + status + ')');
                } else if (status == Strophe.Status.DISCONNECTING) {
	            log('Strophe is disconnecting (status: ' + status + ')');
                } else if (status == Strophe.Status.DISCONNECTED) {
	            log('Strophe is disconnected (status: ' + status + ')');
                } else if (status == Strophe.Status.CONNECTED) {
                    var time_taken = new Date() - startTime;
	            log('Strophe is connected (status: ' + status + '). Time taken: ' + time_taken + 'ms');
                }
            });
        });

        $(document).bind('disconnect', function (data) {
            connection.disconnect();
        });
    };

    $.ajax({
        url: '/html/_authForm.html',
        success: function (resp) {
            $("#controls").append(resp);
            init();
        }
    });

}) (window, jQuery, Strophe, XPG);

(function (window, $, Strophe, undefined) {
    
    "use strict";

    var XMLConsole = window.XMLConsole;
    var log = XMLConsole.log;

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

    $("form#authForm button[type='button']").click(function () {
        $(document).trigger('disconnect');
    });

    var connection = new Strophe.Connection(BOSH_SERVICE);
    connection.rawInput = XMLConsole.rawInput;
    connection.rawOutput = XMLConsole.rawOutput;

    $(document).bind('connect', function (e, data) {
        connection.connect(data.jid, data.password, function (status) {
            if (status == Strophe.Status.CONNECTING) {
	        log('Strophe is connecting.');
            } else if (status == Strophe.Status.CONNFAIL) {
	        log('Strophe failed to connect.');
            } else if (status == Strophe.Status.DISCONNECTING) {
	        log('Strophe is disconnecting.');
            } else if (status == Strophe.Status.DISCONNECTED) {
	        log('Strophe is disconnected.');
            } else if (status == Strophe.Status.CONNECTED) {
	        log('Strophe is connected.');
            }
        });
    });

    $(document).bind('disconnect', function (data) {
        connection.disconnect();
    });

    $(document).bind('send_presence', function (data) {
        connection.send($pres({}));
    });

}) (window, jQuery, Strophe);

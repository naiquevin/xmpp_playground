BOSH_SERVICE = 'http://fake';

module("Testing Strophe connect using Sinon", {
    setup: function () {
        this.xhr = sinon.useFakeXMLHttpRequest();
        var requests = this.requests = [];

        this.xhr.onCreate = function (xhr) {
            requests.push(xhr);
        };
    },
    teardown: function () {
        this.xhr.restore();
    }
});

test("A random test", function () {
    $(document).trigger('connect', {jid: 'fake@fake', password: 'fake'});
    this.requests[0].respond(200, 
                             {'Content-Type': 'text/xml; charset=utf-8', 'Access-Control-Allow-Origin': '*'},
                             "<body xmlns='http://jabber.org/protocol/httpbind' sid='14bf03266244ede322352a04ecc32f1c58124d1a' wait='60' requests='2' inactivity='30' maxpause='120' polling='2' ver='1.8' from='localhost' secure='true' authid='731673226' xmlns:xmpp='urn:xmpp:xbosh' xmlns:stream='http://etherx.jabber.org/streams' xmpp:version='1.0'><stream:features xmlns:stream='http://etherx.jabber.org/streams'><mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'><mechanism>PLAIN</mechanism><mechanism>DIGEST-MD5</mechanism><mechanism>SCRAM-SHA-1</mechanism></mechanisms><c xmlns='http://jabber.org/protocol/caps' hash='sha-1' node='http://www.process-one.net/en/ejabberd/' ver='U5DC02T7iwEqfov5b3KpIVgA5+I='/><register xmlns='http://jabber.org/features/iq-register'/></stream:features></body>");
    console.log(this.requests);
    expect(0);    
});

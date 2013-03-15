import sys
from base64 import b64encode
from random import randint
from xml.dom import minidom
from contextlib import contextmanager
from urlparse import urlparse
import requests


BOSH_SERVICE = 'http://localhost/http-bind'
parsed_bosh_service = urlparse(BOSH_SERVICE)


## Public API

def http_bind(username, domain, password):
    with session() as s:
        jid = '%s@%s' % (username, domain)
        rid = randint(0, 1000000000)
        r1 = http_bind_request(s, create_session(rid))
        d1 = document(r1.content)
        sid = get_sid(d1)
        mechanisms = get_mechanisms(d1)
        print 'After Session creation request: ', sid, mechanisms
        rid += 1
        r2 = http_bind_request(s, auth(username, password, sid, rid))
        d2 = document(r2.content)
        if is_success(d2):
            print 'Auth is successful'
            rid += 1
            r3 = http_bind_request(s, request_restart(sid, rid))
            rid += 1
            if r3.status_code == 200:
                r4 = http_bind_request(s, bind_resource(sid, rid, 'httpclient'))
                print r4.content
        else:
            raise Exception('Auth failed with status_code: %r and reason: %r' % (r2.status_code, r2.reason))
    return (jid, sid, rid)


## Internals

@contextmanager
def session():
    s = requests.Session()
    s.headers.update({"Content-type": "text/plain; charset=UTF-8",
                      "Accept": "text/xml"})
    yield s
    s.close()    


def http_bind_request(s, stanza):
    r = s.post(BOSH_SERVICE, data=stanza)
    return r


## Sequence of payloads

def create_session(rid):
    parsed_url = parsed_bosh_service
    return (
        "<body rid='%d' "
        "xmlns='http://jabber.org/protocol/httpbind' "
        "to='%s' "
        "xml:lang='en' "
        "wait='60' "
        "hold='1' "
        "content='text/xml; charset=utf-8' "
        "ver='1.6' "
        "xmpp:version='1.0' "
        "xmlns:xmpp='urn:xmpp:xbosh'/>"
        ) % (rid, parsed_url.netloc)

def auth(username, password, sid, rid):
    auth_token = b64encode('\0%s\0%s' % (username, password))
    return (
        "<body rid='%d' "
        "xmlns='http://jabber.org/protocol/httpbind' "
        "sid='%s'>"
        "<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='PLAIN'>%s</auth>"
        "</body>"
        ) % (rid, sid, auth_token)

def request_restart(sid, rid):
    return (
        "<body rid='%d' "
        "sid='%s' "
        "to='%s' "
        "xml:lang='en' "
        "xmpp:restart='true' "
        "xmlns='http://jabber.org/protocol/httpbind' "
        "xmlns:xmpp='urn:xmpp:xbosh'/>"
    ) % (rid, sid, parsed_bosh_service.netloc)

def bind_resource(sid, rid, resource):
    return (
        "<body rid='%d' "
        "sid='%s' "
        "xmlns='http://jabber.org/protocol/httpbind'>"
        "<iq id='bind_1' "
        "type='set' "
        "xmlns='jabber:client'>"
        "<bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'>"
        "<resource>%s</resource>"
        "</bind>"
        "</iq>"
        "</body>"
    ) % (rid, sid, resource)


## Utility functions for parsing XML

def document(xml_str):
    d = minidom.parseString(xml_str)
    return d.documentElement

def xml_attr(de, attr):
    return de.getAttribute(attr)

def get_sid(de):
    return xml_attr(de, 'sid')

def get_mechanisms(de):
    stream_features = de.firstChild
    node = stream_features.getElementsByTagNameNS('urn:ietf:params:xml:ns:xmpp-sasl', 'mechanisms')[0]
    if node.hasChildNodes():
        mechanisms = [child.firstChild.data for child in node.childNodes]
    else:
        mechanisms = []
    return mechanisms

def is_success(de):
    return de.firstChild.nodeName == 'success' and \
        de.firstChild.namespaceURI == 'urn:ietf:params:xml:ns:xmpp-sasl'

if __name__ == '__main__':
    script, username, domain, password = sys.argv
    jid, sid, rid = http_bind(username, domain, password)


import sys
from base64 import b64encode
from random import randint
from xml.dom import minidom
from contextlib import contextmanager
from urlparse import urlparse
import requests
from functools import partial, wraps


## Public API

def http_bind(bosh_service, username, domain, password):
    bs = urlparse(bosh_service)
    to = bs.netloc

    with session() as s:
        rid = randint(0, 1000000000)

        send_request = partial(http_bind_request,
                               bosh_service=bosh_service,
                               session=s)

        sid, mechanisms = create_session(to, rid, send_request)
        print 'After Session creation request: ', sid, mechanisms
        rid += 1
        auth_success = auth(username, password, sid, rid, send_request)
        if auth_success:
            print 'Auth is successful'
            rid += 1
            request_restart(to, sid, rid, send_request)
            rid +=1
            full_jid = bind_resource(sid, rid, 'httpclient', send_request)
            rid +=1
            if bind_session(sid, rid, send_request):
                return (full_jid, sid, rid+1)
        else:
            raise BoshClientException('Auth failed')


## Internals

@contextmanager
def session():
    s = requests.Session()
    s.headers.update({"Content-type": "text/plain; charset=UTF-8",
                      "Accept": "text/xml"})
    yield s
    s.close()


def resp_doc(func):
    @wraps(func)
    def dec(stanza, bosh_service, session):
        r = func(stanza, bosh_service, session)
        if r.status_code != 200:
            msg = (
                'Response failed with '
                'Status Code: %s, '
                'Reason: %s'
            ) % (r.status_code, r.reason)
            raise BoshClientException(msg)
        return document(r.content)
    return dec


@resp_doc
def http_bind_request(stanza, bosh_service, session):
    request = session.post(bosh_service, data=stanza)
    return request


## Exceptions

class BoshClientException(Exception):
    pass


## Functions to send requests

def create_session(to, rid, send_func):
    stanza = create_session_stanza(to, rid)
    doc_elem = send_func(stanza)    
    sid = get_sid(doc_elem)
    mechanisms = get_mechanisms(doc_elem)
    return (sid, mechanisms)


def auth(username, password, sid, rid, send_func):
    stanza = auth_stanza(username, password, sid, rid)
    doc_elem = send_func(stanza)
    return is_success(doc_elem)


def request_restart(to, sid, rid, send_func):
    stanza = request_restart_stanza(to, sid, rid)
    doc_elem = send_func(stanza)
    return doc_elem


def bind_resource(sid, rid, resource, send_func):
    stanza = bind_resource_stanza(sid, rid, resource)
    doc_elem = send_func(stanza)
    return get_bound_jid(doc_elem)


def bind_session(sid, rid, send_func):
    stanza = bind_session_stanza(sid, rid)
    doc_elem = send_func(stanza)
    return is_session(doc_elem)


## Functions to build different payloads

def create_session_stanza(to, rid):
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
        ) % (rid, to)


def auth_stanza(username, password, sid, rid):
    auth_token = b64encode('\0%s\0%s' % (username, password))
    return (
        "<body rid='%d' "
        "xmlns='http://jabber.org/protocol/httpbind' "
        "sid='%s'>"
        "<auth xmlns='urn:ietf:params:xml:ns:xmpp-sasl' mechanism='PLAIN'>%s</auth>"
        "</body>"
        ) % (rid, sid, auth_token)


def request_restart_stanza(to, sid, rid):
    return (
        "<body rid='%d' "
        "sid='%s' "
        "to='%s' "
        "xml:lang='en' "
        "xmpp:restart='true' "
        "xmlns='http://jabber.org/protocol/httpbind' "
        "xmlns:xmpp='urn:xmpp:xbosh'/>"
    ) % (rid, sid, to)


def bind_resource_stanza(sid, rid, resource):
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


def bind_session_stanza(sid, rid):
    return (
        "<body rid='%s' "
        "xmlns='http://jabber.org/protocol/httpbind' "
        "sid='%s'>"
        "<iq type='set' "
        "id='_session_auth' "
        "xmlns='jabber:client'>"
        "<session xmlns='urn:ietf:params:xml:ns:xmpp-session'/>"
        "</iq>"
        "</body>"
        ) % (rid, sid)


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


def get_bound_jid(de):
    iq = de.firstChild
    if iq.nodeName == 'iq' and xml_attr(iq, 'type') == 'result':
        jid = iq.firstChild.firstChild.firstChild.data
        return jid


def is_session(de):
    iq = de.firstChild
    return iq.firstChild.nodeName == 'session'


if __name__ == '__main__':
    script, username, domain, password = sys.argv
    bosh_service = 'http://%s/http-bind' % (domain,)
    jid, sid, rid = http_bind(bosh_service, username, domain, password)
    print 'Jid: %s' % jid
    print 'Sid: %s' % sid
    print 'Rid: %s' % rid


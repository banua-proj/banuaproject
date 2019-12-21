/*
 * cloudflare's email-decode.js
 *
 * (manually) "decrypted" by antipatico (github.com/antipatico)
 *
 * All Wrongs Reversed (Ↄ), 2018
 */
! function() {
    "use strict";

    var HEADER            = "/cdn-cgi/l/email-protection#",
        SPECIAL_SELECTOR  = ".__cf_email__",
        SPECIAL_ATTRIBUTE = "data-cfemail",
        DIV               = document.createElement("div");

    function error(e) {
        try {
            if ("undefined" == typeof console) return;
            "error" in console ? console.error(e) : console.log(e)
        } catch (e) {}
    }

    function sanitize(e) {
        DIV.innerHTML = '<a href="' + e.replace(/"/g, "&quot;") + '"></a>';
        return DIV.childNodes[0].getAttribute("href") || ""
    }

    function nextHex(hexstr, skip) {
        return parseInt(hexstr.substr(skip, 2), 16)
    }

    function decrypt(ciphertext, skip) {
        for (var out = "", magic = nextHex(ciphertext, skip), i = skip + 2; i < ciphertext.length; i += 2) {
            var hex = nextHex(ciphertext, i) ^ magic;
            out += String.fromCharCode(hex)
        }
        try {
            out = decodeURIComponent(escape(out))
        } catch (err) {
            error(err)
        }
        return sanitize(out)
    }

    function decryptLinks(doc) {
        for (var links = doc.querySelectorAll("a"), c = 0; c < links.length; c++) try {
            var currentLink = links[c];
            var a = currentLink.href.indexOf(HEADER);
            a > -1 && (currentLink.href = "mailto:" + decrypt(currentLink.href, a + HEADER.length))
        } catch (err) {
            error(err)
        }
    }

    function decryptOthers(doc) {
        for (var specials = doc.querySelectorAll(SPECIAL_SELECTOR), c = 0; c < specials.length; c++) try {
            var current    = specials[c],
                parent     = current.parentNode,
                ciphertext = current.getAttribute(SPECIAL_ATTRIBUTE);
            if (ciphertext) {
                var email  = decrypt(ciphertext, 0),
                    tmpDOM = document.createTextNode(email);
                parent.replaceChild(tmpDOM, current)
            }
        } catch (err) {
            error(err)
        }
    }

    function decryptTemplates(doc) {
        for (var templates = doc.querySelectorAll("template"), n = 0; n < templates.length; n++) try {
            init(templates[n].content)
        } catch (err) {
            error(err)
        }
    }

    function init(doc) {
        try {
            decryptLinks(doc);
            decryptOthers(doc);
            decryptTemplates(doc);
        } catch (err) {
            error(err)
        }
    }

    init(document);

}();

/*
 * Sienna's Grid and Base Styles
 *
 * Javascript (jQuery) definitions
 *
 * Copyright (C) Sienna M. Wood 2016
 * 14 June 2016
 */


/* show/hide nav for narrow widths */
function toggleshow(id) {
    if ($(id).hasClass('show')) {
        $(id).removeClass('show').attr('aria-expanded', 'false');
    } else {
        $(id).addClass('show').attr('aria-expanded', 'true');
    }
}


/* add .focus to li ancestors of current link */
function togglefocus(elem) {
    elem.parents('li').toggleClass('focus');
}

/* regularize URLs to compare them */
function regularizeURL(x) {

    // get root (protocol and domain) as string
    var root = window.location.protocol.toString() + '//' + window.location.host.toString();

    // if only directory is given, append 'index.html'
    if (x.charAt(x.length - 1) == '/') {
        x = x.concat('index.html');
    }

    // strip domain name, if present, leaving only initial '/'
    if (x.indexOf(root) != -1) {
        x = x.replace(root, '');
    }

    return x;
}

$(document).ready(function () {

    /* ARIA attributes and listeners */

    /* aria-haspopup on parent li elements */
    $('ul#nav-menu ul').each(function () {
        $(this).parent('li').attr('aria-haspopup', 'true');
    });

    /* event listeners on links */
    $('ul#nav-menu a').on("focus blur", function () {
        togglefocus($(this));
    })


    /* Change class of link according to current page */

    // remove 'active' class from all anchors
    $('a').removeClass('active');

    // get url as a string
    var page = window.location.toString();

    // regularize url for comparison
    page = regularizeURL(page);

    // compare anchors to url to determine which is/are active
    $('a').addClass(function (index, currentClass) {
        var newClass;
        var link = $(this).attr('href');
        if (link === undefined) {
            // do nothing
        } else {
            link = regularizeURL(link);
            if (link == page) {
                newClass = "active";
            }
        }
        return newClass;
    })

});

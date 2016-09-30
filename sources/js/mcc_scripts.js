/*
 *******************************************************************************
 JavaScript (jQuery) definitions for MusicCrashCourses.com by Sienna M. Wood
 *******************************************************************************
 */

///////////////////////
/* Verovio Functions */
///////////////////////
var vrvToolkit = new verovio.toolkit();
var all_scores = [];

/////////////////////////////////////////////////////////////////////////////////////////////
/* Function to insert a score with Verovio including playback controls and page navigation */
/////////////////////////////////////////////////////////////////////////////////////////////

function scoreInsert(target, fileurl, soundurl = '', paginated = false) {
    /*
     * target: string; ID of div that will contain the score, including initial '#'
     * fileurl: string; URL of MEI or image (.jpg, .png, etc.) file containing notation data
     * audiourl: string; URL of audio file to be embedded with score OR 'midi' for automatic midi playback (not yet implemented)
     * paginated: boolean; if false, sets pageHeight to maximum allowed by Verovio to avoid pagination where possible;
     *      pagination should be used with large files to avoid long load times
     */

    var prefix = target.slice(1); // remove # to create unique id for object and prefix for elements (to allow multiple scores on a page)

    var fileExt = fileurl.slice(fileurl.lastIndexOf('.') + 1);

    // pagination defaults to false, and is always false for scores that are not MEI
    if (fileExt !== 'mei') {
        paginated = false;
    }

    var zoom = 45;

    var score = {
        id: prefix,
        url: fileurl,
        type: fileExt,
        soundurl: soundurl,
        target: target,
        page: 1,
        paginated: paginated,
        zoom: zoom,
        pageHeight: 500,  // default, actual value is calculated after html elements are rendered
        pageWidth: 500,   // default, actual value is calculated after html elements are rendered 
        data: '',
        svg: '',
        // midi: '',
        pagecount: 1
    };

    // if MEI and no soundurl given, generate MIDI data and MIDI player
    // if (soundurl === '' && score.type === 'mei') {
    //     score.midi = 'data:audio/midi;base64,' + vrvToolkit.renderToMidi();
    // }

    all_scores.push(score); // add new score to master array of scores

    create_html(score);

    if (score.type === 'mei') {
        load_file(score); // loads svg into #[prefix]-svg-output

        $(window).resize(function () {
            score.pageWidth = $(score.target).width() * 100 / zoom;
            load_data(score);
        });
    }
}

// create HTML structures to contain and control Verovio output
function create_html(score) {

    $(score.target).addClass('score');

    $(score.target)
        .append('<div id="' + score.id + '-score-controls" class="score-controls"></div>');


    if (score.type === 'mei') {

        $(score.target)
            .append('<div id="' + score.id + '-svg-output" class="svg-output"></div>');

        // FontAwesome required for page nav symbols
        if (score.paginated === true) {
            $(score.target + '-score-controls')
                .append('<div id="' + score.id + '-page-nav" class="page-nav"></div>');
            $(score.target + '-page-nav')
                .append('<button type="button" id="' + score.id + '-firstpg-button" class="firstpg-button" title="First Page" onclick="toPage(\'' + score.id + '\', \'first\')"><i class="fa fa-fast-backward" aria-hidden="true"></i><span class="sr-only">First Page</span></button>')
                .append('<button type="button" id="' + score.id + '-prevpg-button" class="prevpg-button" title="Previous Page" onclick="toPage(\'' + score.id + '\', \'prev\')"><i class="fa fa-step-backward" aria-hidden="true"></i><span class="sr-only">Previous Page</span></button>')
                .append('<div id="' + score.id + '-pgcount" class="pgcount"></div>')
                .append('<button type="button" id="' + score.id + '-nextpg-button" class="nextpg-button" title="Next Page" onclick="toPage(\'' + score.id + '\', \'next\')"><i class="fa fa-step-forward" aria-hidden="true"></i><span class="sr-only">Next Page</span></button>')
                .append('<button type="button" id="' + score.id + '-lastpg-button" class="lastpg-button" title="Last Page" onclick="toPage(\'' + score.id + '\', \'last\')"><i class="fa fa-fast-forward" aria-hidden="true"></i><span class="sr-only">Last Page</span></span></button>');
        }


    } else {
        $(score.target)
            .append('<img src="' + score.url + '" id="' + score.id + '-score-img" class="score-img" alt="' + score.id + '" />');
    }

    // render audio controls if soundurl is given
    if (score.soundurl !== '') {
        $(score.target + '-score-controls').append('<div id="' + score.id + '-playback-controls" class="playback-controls">' +
            '<audio controls><source src="' + score.soundurl + '" type="audio/mp3">' +
            'Sorry, your browser does not support the audio element.</audio></div>');
    // if format is MEI and MIDI has been rendered, append HTML structures needed to play back the MIDI
    // } else if (score.midi !== '') {
    }

    // if soundurl is provided and music is paginated (both #[prefix]-page-nav and #[prefix]-playback-controls are
    // visible) add .half-width class to both
    if (score.paginated === true && score.soundurl !== '') {
        $(score.target + '-page-nav').addClass('half-width');
        $(score.target + '-playback-controls').addClass('half-width');
    }
}


/////////////////////////////////////////
/* Verovio functions for loading score */
/////////////////////////////////////////

function set_options(score) {

    // calculate page width and height
    var pageWidth = $(score.target + '-svg-output').width() * 100 / score.zoom;
    score.pageWidth = pageWidth;

    if (score.paginated == true) {
        score.pageHeight = pageWidth;
    } else {
        score.pageHeight = 60000; // max height allowed by Verovio, creates long load times for large files!
    }


    options = JSON.stringify({
        inputFormat: 'mei',
        border: 50,
        adjustPageHeight: 1,
        ignoreLayout: 1,
        pageWidth: score.pageWidth,
        pageHeight: score.pageHeight,
        scale: score.zoom
    });

    vrvToolkit.setOptions(options);
}

function load_file(score) {
    $.ajax({
        url: score.url,
        dataType: "text",
        success: function (data) {
            score.data = data;
            load_data(score);
        }
    });
}

function load_data(score) {
    set_options(score);
    vrvToolkit.loadData(score.data);
    score.pagecount = vrvToolkit.getPageCount();
    if (score.page > score.pagecount) {
        score.page = score.pagecount;
    }

    load_page(score);
}

function load_page(score) {
    score.svg = vrvToolkit.renderPage(score.page, "");
    $(score.target + '-svg-output').html(score.svg);

    // if pagination controls were created, but there is only one page, hide them
    // otherwise, show them
    if (score.paginated == true) {
        if (score.pagecount == 1) {
            $(score.target + '-page-nav').addClass('hide_me');

            // if #[prefix]-playback-controls exists, remove .half-width class while #[prefix]-page-nav is hidden
            if ($(score.target + '-playback-controls')) {
                $(score.target + '-playback-controls').removeClass('half-width');
            }
        } else {
            $(score.target + '-page-nav').removeClass('hide_me');
            // if #[prefix]-playback-controls exists, add .half-width class while #[prefix]-page-nav is shown
            if ($(score.target + '-playback-controls')) {
                $(score.target + '-playback-controls').addClass('half-width');
            }
        }
    }

    pageXofY(score);

}

///////////////////////////////////////
/* Verovio page navigation functions */
///////////////////////////////////////

// update page count display
function pageXofY(score) {
    $(score.target + '-pgcount').html('Page ' + score.page + ' of ' + score.pagecount);
}

// get score object by score.id
function getScoreById(scoreid) {

    function findScore(score) {
        return score.id === scoreid;
    }

    return all_scores.find(findScore);
}

// navigate to new page
function toPage(scoreid, targetpg) {

    var thisScore = getScoreById(scoreid);

    var pgcount = thisScore.pagecount;
    var targetpage = targetpg;

    if ($.isNumeric(targetpage)) {
        targetpage = Math.abs(Math.round(targetpage));
        if (targetpage > 0 && targetpage <= pgcount) {
            thisScore.page = targetpage;
        }
    } else {
        targetpage = targetpage.toLowerCase();
        if (targetpage == 'first') {
            thisScore.page = 1
        } else if (targetpage == 'last') {
            thisScore.page = pgcount
        } else if (targetpage == 'next') {
            if (thisScore.page < pgcount) {
                thisScore.page++;
            }
        } else if (targetpage == 'prev') {
            if (thisScore.page > 1) {
                thisScore.page--;
            }
        } else {
            // do nothing
        }
    }

    //console.log(thisScore.page);

    load_page(thisScore);
}


///////////////////////////
/* non-Verovio functions */
///////////////////////////


// Function to clone a list and append it to a destination
// used for /index.html and /lessons/index.html to populate page content from nav menus
function clonelist(sourceobj, destinationobj) {
    var item_list = $(sourceobj).clone();
    item_list.each(function () {
        $(this).find('a').each(function () {
            if ($(this).attr('href') == "#") {
                $(this).contents().unwrap();
            }
        })
    });
    item_list.appendTo(destinationobj);
    if ($(sourceobj).prop("tagName") != "UL") {
        item_list.wrap("<ul></ul>");
    }
}

// Function to play/pause audio recordings (for waveform playback) by audio ID
function togglePlay(sourceID) {
    audioSource = document.getElementById(sourceID);
    if (audioSource.paused == false) {
        audioSource.pause();
    } else {
        audioSource.play();
    }
}

$(document).ready(function () {

    // Marquee **************************

    // hide #marquee_place_holder and show #marquee
    //(prevent multiple quotes from appearing on page if JavaScript is disabled)
    $("#marquee_placeholder").addClass("hide_me");
    $("#marquee").removeClass("hide_me");


    // Anchors ******************************

    // add anchors before heading tags using heading text to facilitate navigation
    $('h1, h2, h3, h4, h5, h6').each(function (index, elem) {
        //use heading text as anchor names and ids
        var anchorName = $(elem).html().toString().toLowerCase();
        anchorName = anchorName.replace(/ /g, '-'); // replace spaces with dashes
        anchorName = encodeURIComponent(anchorName);
        var newAnchor = $('<a id=\"' + anchorName + '\" name=\"' + anchorName + '\">');
        newAnchor.insertBefore($(elem));
    });
});

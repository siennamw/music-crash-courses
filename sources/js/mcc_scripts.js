/*
 *******************************************************************************
 JavaScript (jQuery) definitions for MusicCrashCourses.com by Sienna M. Wood
 *******************************************************************************
 */

///////////////////////
/* Verovio Functions */
///////////////////////
let vrvToolkit;
document.addEventListener('DOMContentLoaded', (event) => {
  verovio.module.onRuntimeInitialized = () => {
    vrvToolkit = new verovio.toolkit();
    vrvToolkit.setOptions({
      adjustPageHeight: true,
      svgViewBox: true,
    });
    console.log('Verovio has loaded.');
  };
});

// [{ id: string, currentPage: number, pages: string[], target: string }]
const allScores = [];

// TODO: implement MIDI playback for MEI files (see https://book.verovio.org/interactive-notation/playing-midi.html)
// TODO: allow user to adjust zoom for rendered pages (see https://book.verovio.org/toolkit-reference/toolkit-methods.html#redolayout)

/*
* Function to insert a score with Verovio including playback controls and page navigation
*
* target: string; ID of div that will contain the score, including initial '#'
* fileUrl: string; URL of MEI or image (.jpg, .png, etc.) file containing notation data
* soundUrl: string; URL of audio file to be embedded with score
*/
function scoreInsert(target, fileUrl, soundUrl = '') {
  if (!vrvToolkit) {
    // if the Verovio toolkit instance hasn't been initialized, wait 1 second and re-call self with the same args
    setTimeout(() => {
      console.log('Waiting for Verovio to load...');
      scoreInsert(target, fileUrl, soundUrl);
    }, 1000);
    return;
  }

  // remove # to create unique id for object and prefix for elements (to allow multiple scores on a page)
  const id = target.slice(1);
  const fileExt = fileUrl.slice(fileUrl.lastIndexOf('.') + 1);

  if (fileExt === 'mei') {
    $.ajax({
      url: fileUrl,
      dataType: 'text',
      success: function (data) {
        vrvToolkit.loadData(data);
        const pageCount = vrvToolkit.getPageCount();

        // render all pages
        const pages = [];
        let p = 0;
        while (p < pageCount) {
          const svg = vrvToolkit.renderToSVG(p + 1);
          pages.push(svg);
          p += 1;
        }

        const score = {
          id: id,
          currentPage: 0,
          pages: pages,
          target: target
        };

        createHtml(id, target, fileExt, soundUrl, pageCount);

        setNewPage(0, score);

        allScores.push(score);
      },
    });

    return;
  }

  createHtml(id, target, fileExt, soundUrl);
}

// create HTML structures to contain and control Verovio output
function createHtml(id, target, fileExt, soundUrl, pageCount = 1) {
  const hasMultiplePages = pageCount && pageCount > 1;

  $(target)
    .addClass('score');

  $(target)
    .append('<div id="' + id + '-score-controls" class="score-controls"></div>');

  if (fileExt === 'mei') {
    $(target)
      .append('<div id="' + id + '-svg-output" class="svg-output"></div>');

    if (hasMultiplePages) {
      // pagination
      $(target + '-score-controls')
        .append('<div id="' + id + '-page-nav" class="page-nav"></div>');
      $(target + '-page-nav')
        .append('<button type="button" id="' + id +
          '-firstpg-button" class="firstpg-button" title="First Page" onclick="toPage(\'' + id +
          '\', \'first\')"><i class="fa fa-fast-backward" aria-hidden="true"></i><span class="sr-only">First Page</span></button>')
        .append('<button type="button" id="' + id +
          '-prevpg-button" class="prevpg-button" title="Previous Page" onclick="toPage(\'' + id +
          '\', \'prev\')"><i class="fa fa-step-backward" aria-hidden="true"></i><span class="sr-only">Previous Page</span></button>')
        .append('<div id="' + id + '-pgcount" class="pgcount"></div>')
        .append('<button type="button" id="' + id +
          '-nextpg-button" class="nextpg-button" title="Next Page" onclick="toPage(\'' + id +
          '\', \'next\')"><i class="fa fa-step-forward" aria-hidden="true"></i><span class="sr-only">Next Page</span></button>')
        .append('<button type="button" id="' + id +
          '-lastpg-button" class="lastpg-button" title="Last Page" onclick="toPage(\'' + id +
          '\', \'last\')"><i class="fa fa-fast-forward" aria-hidden="true"></i><span class="sr-only">Last Page</span></span></button>');
    }
  } else {
    $(target)
      .append('<img src="' + url + '" id="' + id + '-score-img" class="score-img" alt="' + id + '" />');
  }

  // render audio controls if soundUrl is given
  if (soundUrl !== '') {
    $(target + '-score-controls')
      .append('<div id="' + id + '-playback-controls" class="playback-controls">' + '<audio controls><source src="' +
        soundUrl + '" type="audio/mp3">' + 'Sorry, your browser does not support the audio element.</audio></div>');
  }

  // if soundUrl is provided, format is MEI, and there are multiple pages (both #[prefix]-page-nav and
  // #[prefix]-playback-controls are visible) add .half-width class to both
  if (fileExt === 'mei' && hasMultiplePages && soundUrl !== '') {
    $(target + '-page-nav')
      .addClass('half-width');
    $(target + '-playback-controls')
      .addClass('half-width');
  }
}

// navigate to new page; targetPage is 'first', 'last', 'next' or 'previous'
function toPage(scoreId, targetPage) {
  if (!vrvToolkit) return;

  const score = allScores.find(t => t.id === scoreId);

  if (!score) {
    throw new Error('Failed to find score ' + scoreId);
  }

  const pageCount = score.pages.length;

  let requestedPageNumber;

  // resolve 'first', 'last', 'next' or 'previous' to page index
  switch (targetPage.toLowerCase()) {
    case 'first':
      requestedPageNumber = 0;
      break;
    case 'last':
      requestedPageNumber = pageCount - 1;
      break;
    case 'next':
      if (score.currentPage + 1 < pageCount - 1) {
        requestedPageNumber = score.currentPage + 1;
      } else {
        requestedPageNumber = pageCount - 1; // last page
      }
      break;
    case 'prev':
      if (score.currentPage - 1 >= 0) {
        requestedPageNumber = score.currentPage - 1;
      } else {
        requestedPageNumber = 0; // first page
      }
      break;
    default:
      requestedPageNumber = score.currentPage; // no change
  }

  if (requestedPageNumber !== score.currentPage) {
    setNewPage(requestedPageNumber, score);
  }
}

function setNewPage(requestedPageNumber, score) {
  score.currentPage = requestedPageNumber;
  // inject SVG into HTML element
  $(score.target + '-svg-output')
    .html(score.pages[requestedPageNumber]);
}

///////////////////////////
/* non-Verovio functions */
///////////////////////////


// Function to embed a YouTube video
function embedYouTube(targetSelector, videoID) {
  const target = $(targetSelector);
  target.append('<div class="noprint"><iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoID +
    '" frameborder="0" allowfullscreen></iframe></div>');
  target.append('<p class="forprint">https://youtu.be/' + videoID + '</p>');
}

// Function to clone a list and append it to a destination
// used for /index.html and /lessons/index.html to populate page content from nav menus
function clonelist(sourceObj, destinationObj) {
  const item_list = $(sourceObj)
    .clone();
  item_list.each(function () {
    $(this)
      .find('a')
      .each(function () {
        if ($(this)
          .attr('href') === '#') {
          $(this)
            .contents()
            .unwrap();
        }
      });
  });
  item_list.appendTo(destinationObj);
  if ($(sourceObj)
    .prop('tagName') !== 'UL') {
    item_list.wrap('<ul></ul>');
  }
}

// Function to play/pause audio recordings (for waveform playback) by audio ID
function togglePlay(sourceID) {
  const audioSource = document.getElementById(sourceID);

  if (audioSource.paused === false) {
    audioSource.pause();
  } else {
    audioSource.play();
  }
}

$(document)
  .ready(function () {

    // Marquee **************************

    // hide #marquee_place_holder and show #marquee
    //(prevent multiple quotes from appearing on page if JavaScript is disabled)
    $('#marquee_placeholder')
      .addClass('hide_me');
    $('#marquee')
      .removeClass('hide_me');


    // Anchors ******************************

    // add anchors before heading tags using heading text to facilitate navigation
    $('h1, h2, h3, h4, h5, h6')
      .each(function (index, elem) {
        //use heading text as anchor names and ids
        let anchorName = $(elem)
          .html()
          .toString()
          .toLowerCase();
        anchorName = anchorName.replace(/ /g, '-'); // replace spaces with dashes
        anchorName = encodeURIComponent(anchorName);
        const newAnchor = $('<a id=\"' + anchorName + '\" name=\"' + anchorName + '\">');
        newAnchor.insertBefore($(elem));
      });

    // Copyright ***************************

    // add current year to copyright notice in footer
    const currentYear = new Date().getFullYear();
    $('#footer-copyright')
      .append('-' + currentYear);
  });

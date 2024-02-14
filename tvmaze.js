"use strict";

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $epidsodelist = $('#episodesList');
const $searchForm = $("#searchForm");
const DEFAULT_IMG = 'https://tinyurl.com/tv-missing';
const API_URL = "https://api.tvmaze.com";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(searchTerm) {
  const qs = new URLSearchParams({ q: searchTerm });
  const response = await fetch(`${API_URL}/search/shows?${qs}`);
  const rawShowData = await response.json();

  // Transforms each element of rawShowData to be formatted correctly
  return rawShowData.map(data => {
    return {
      id: data.show.id,
      name: data.show.name,
      summary: data.show.summary,
      image: (data.show.image) ? data.show.image.medium : DEFAULT_IMG
    };
  });
}


/** Given list of shows, create markup for each and append to DOM.
 *
 * A show is {id, name, summary, image}
 * */

function displayShows(shows) {
  $showsList.empty();

  for (const show of shows) {
    const $show = $(`
        <div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchShowsAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  displayShows(shows);
}

$searchForm.on("submit", async function handleSearchForm(evt) {
  evt.preventDefault();
  await searchShowsAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await fetch(`${API_URL}/shows/${id}/episodes`);
  const rawEpisodeData = await response.json();

  // Transforms each element of rawEpisodeData to be formatted correctly
  return rawEpisodeData.map(data => {
    return {
      id: data.id,
      name: data.name,
      season: data.season,
      number: data.number
    };
  });

}

/** Given list of episodes, create markup for each and append to DOM.
 *
 * An episode is {id, name, season, number}
 * */

function displayEpisodes(episodes) {
  $epidsodelist.empty();
  for (let episode of episodes) {
    const $episode = $(`<li>${episode.name}, (season ${episode.season}, number ${episode.number})</li>}`);
    $epidsodelist.append($episode);
  }
}


/** Takes in show ID and
 * shows episodes area, gets episodes from API, and displays.
 */

async function getEpisodesAndDisplay(showID) {
  const episodes = await getEpisodesOfShow(showID);
  $episodesArea.show();
  displayEpisodes(episodes);
}

/** Handles button click event, gets show id from parent and
 * calls getEpisodesAndDisplay with that show id as a parameter
 */
async function handleClick(evt) {
  const $parentShow = $(evt.target).closest(".Show");
  await getEpisodesAndDisplay($parentShow.data("show-id"));
}

$showsList.on("click", "button", handleClick);

/* eslint-disable no-undef */
/**
 * sidebar replacing popup
 */

// config map
let config = {
  minZoom: 7,
  maxZoom: 18,
};
// magnification with which the map will start
const zoom = 9;
// co-ordinates

const lat = 56.22977;
const lng = 9.01178;


//NY**
const points = [
  [57.228785157729114, 10.006867885589603, "A", "point 1"],
  [57.22923201880194, 10.00897073745728, "B", "point 2"],
  [57.22963944703663, 10.01091265678406, "C", "point 3"],
  [57.229928587386496, 10.01218938827515, "D", "point 4"],
//NY**
  
  
// calling map
const map = L.map("map", config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
// Most tile servers require attribution, which you can set under `Layer`
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// **NY**
//we create an array of markers
// each marker has a unique title
// of course this could be another parameter
const container = document.querySelector(".container");
const featureGroups = [];
for (let i = 0; i < points.length; i++) {
  const [lat, lng, title] = points[i];
  featureGroups.push(L.marker([lat, lng], { title: title }).bindPopup(title));
  const el = document.createElement("a");
  el.id = title;
  el.className = "marker-click";
  el.href = "#";
  el.textContent = `Marker ${title}`;
  container.appendChild(el);
}



// we add markers to the map
for (let i = 0; i < featureGroups.length; i++) {
  featureGroups[i].addTo(map);
}

// ------------------------------------------------------------
// async function to get data from json
async function fetchData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}
// function that opens a popup with text at the marker
// and transfers latLng coordinates of the opened marker
// to the centering function
function markerOpen(id) {
  for (let i in featureGroups) {
    const markerId = featureGroups[i].options.title;
    if (markerId === id) {
      featureGroups[i].openPopup();
      centerMarker(featureGroups[i].getLatLng());
    }
  }
}

// function centering the map on the marker
function centerMarker(latlng) {
  const marker = L.marker([latlng.lat, latlng.lng]);
  let group = new L.featureGroup([marker]);
  map.fitBounds(group.getBounds());
}

// all marker-click classes from html
document.addEventListener("DOMContentLoaded", () => {
  const markersDiv = document.querySelectorAll(".marker-click");

  markersDiv.forEach((marker) => {
    marker.addEventListener("click", () => {
      // the click event transfers to the function
      // id = title of the marker
      markerOpen(marker.id);
    });





// **NY**









// --------------------------------------------------
// button to close sidebar
const buttonClose = document.querySelector(".close-button");

let featureGroups = [];
let groupBounds;
let latlngs = [];

// function to add markers to map
fetchData("./places.json")
  .then((data) => {
    // create markers width "marker-options-id"
    data.map((marker) => {
      featureGroups.push(
        L.marker(marker.coords, {
          icon: L.divIcon({
            className: "leaflet-marker-icon",
            html: `${marker.id}`,
            iconSize: L.point(30, 30),
            popupAnchor: [3, -5],
          }),
          "marker-options-id": marker.id,
        })
      );
      latlngs.push(marker.coords);
    });

    // add polyline to map
    L.polyline(latlngs, {
      color: "#ff3939",
      weight: 2,
    }).addTo(map);

    return data;
  })
  .then((data) => {
    // create feature group
    // add markers to map
    featureGroups.map((marker) => {
      marker.addTo(map);
    });

    // create feature group with markers
    groupBounds = new L.featureGroup(featureGroups);

    // fitBounds of feature group to map
    map.fitBounds(groupBounds.getBounds(), {
      padding: [50, 50],
    });

    // add event listener to markers to open sidebar
    groupBounds.on("click", function (e) {
      if (e.layer instanceof L.Marker) {
        showSidebarWidthText(e.layer.options["marker-options-id"]);
      }
    });

    // add comment to sodebar depending on marker id
    function showSidebarWidthText(id) {
      data.filter((marker) => {
        if (marker.id === id) {
          document.body.classList.add("active-sidebar");
          addContentToSidebar(marker);
        }
      });
    }
  });

// --------------------------------------------------
// close when click esc
document.addEventListener("keydown", function (event) {
  // close sidebar when press esc
  if (event.key === "Escape") {
    closeSidebar();
  }
});

// close sidebar when click on close button
buttonClose.addEventListener("click", () => {
  // close sidebar when click on close button
  closeSidebar();
});

// close sidebar when click outside
// document.addEventListener("click", (e) => {
//   const target = e.target;
//   if (
//     !target.closest(".sidebar") &&
//     !target.classList.contains("leaflet-marker-icon")
//   ) {
//     closeSidebar();
//   }
// });

// --------------------------------------------------
// close sidebar

function closeSidebar() {
  // remove class active-sidebar
  document.body.classList.remove("active-sidebar");

  // bounds map to default
  boundsMap();
}

// --------------------------------------------------
// add content to sidebar

function addContentToSidebar(marker) {
  const { id, title, small, description, img, coords } = marker;
  const smallInfo = small !== undefined ? `<small>${small}</small>` : "";

  // create sidebar content
  const sidebarTemplate = `
    <article class="sidebar-content">
      <h1>${title}</h1>
      <div class="marker-id">${id}</div>
      <div class="info-content">
        <img class="img-zoom" src="${img.src}" alt="${img.alt}">
        ${smallInfo}
        <div class="info-description">${description}</div>
      </div>
    </article>
  `;

  const sidebar = document.querySelector(".sidebar");
  const sidebarContent = document.querySelector(".sidebar-content");

  // always remove content before adding new one
  sidebarContent?.remove();

  // add content to sidebar
  sidebar.insertAdjacentHTML("beforeend", sidebarTemplate);

  // set bounds depending on marker coords
  boundsMap(coords);
}

// --------------------------------------------------
// bounds map when sidebar is open
function boundsMap(coords) {
  const sidebar = document.querySelector(".sidebar").offsetWidth;

  const marker = L.marker(coords);
  const group = L.featureGroup([marker]);

  // bounds depending on whether we have a marker or not
  const bounds = coords ? group.getBounds() : groupBounds.getBounds();

  // set bounds of map depending on sidebar
  // width and feature group bounds
  map.fitBounds(bounds, {
    paddingTopLeft: [coords ? sidebar : 0, 10],
  });
}

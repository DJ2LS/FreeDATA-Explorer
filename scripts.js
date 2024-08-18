function createIcon(color) {
  return new L.Icon({
    iconUrl: `assets/leaflet-color-markers-master/img/marker-icon-2x-${color}.png`,
    shadowUrl: "assets/leaflet-color-markers-master/img/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

const icons = {
  green: createIcon("green"),
  yellow: createIcon("yellow"),
  orange: createIcon("orange"),
  red: createIcon("red"),
  grey: createIcon("grey"),
};

var map = L.map("map").setView([51.505, -0.09], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 12,
  minZoom: 0,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

L.control.scale().addTo(map);

var terminator = L.terminator({
  fillOpacity: 0.4,
  fillColor: "#7f7f7f",
}).addTo(map);

var Marker6m = L.layerGroup().addTo(map);
var Marker10m = L.layerGroup().addTo(map);
var Marker11m = L.layerGroup().addTo(map);
var Marker12m = L.layerGroup().addTo(map);
var Marker15m = L.layerGroup().addTo(map);
var Marker17m = L.layerGroup().addTo(map);
var Marker20m = L.layerGroup().addTo(map);
var Marker30m = L.layerGroup().addTo(map);
var Marker40m = L.layerGroup().addTo(map);
var Marker60m = L.layerGroup().addTo(map);
var Marker80m = L.layerGroup().addTo(map);
var Marker160m = L.layerGroup().addTo(map);
var MarkerOthers = L.layerGroup().addTo(map);
var Lines = L.layerGroup().addTo(map);

var legend = L.control({ position: "bottomright" });
legend.onAdd = function (map) {
  var div = L.DomUtil.create("div", "legend");
  div.innerHTML +=
    "<h6> Last Heard </h6>" +
    '<p style="background:green; color:white "> within 5 min</p>' +
    '<p style="background:yellow; color:black "> older 5 min</p>' +
    '<p style="background:orange; color:white "> older 60 min</p>' +
    '<p style="background:red; color:white "> older 6 h</p>' +
    '<p style="background:grey; color:white "> older 12 h</p>';
  return div;
};
legend.addTo(map);

function determineMarkerColor(timeElapsedMinutes) {
  if (timeElapsedMinutes <= 5) return icons.green;
  if (timeElapsedMinutes > 5 && timeElapsedMinutes < 60) return icons.yellow;
  if (timeElapsedMinutes > 60 && timeElapsedMinutes < 360) return icons.orange;
  if (timeElapsedMinutes > 360 && timeElapsedMinutes < 720) return icons.red;
  return icons.grey;
}

function processFrequencyMarkers(
  latlon,
  frequency,
  popup,
  colorIcon,
  bandLayer,
) {
  L.marker([latlon[0], latlon[1]], { icon: colorIcon })
    .addTo(bandLayer)
    .bindPopup(popup, {
      maxWidth: 560,
    });
}
const layerMap = {
  Marker6m,
  Marker10m,
  Marker11m,
  Marker12m,
  Marker15m,
  Marker17m,
  Marker20m,
  Marker30m,
  Marker40m,
  Marker60m,
  Marker80m,
  Marker160m,
  MarkerOthers,
};

function getBandLayer(frequency) {
  const frequencyKHz = frequency / 1000;
  if (frequencyKHz >= 50000 && frequencyKHz <= 54000) return layerMap.Marker6m;
  if (frequencyKHz >= 28000 && frequencyKHz <= 28500) return layerMap.Marker10m;
  if (frequencyKHz >= 27000 && frequencyKHz <= 27900) return layerMap.Marker11m;
  if (frequencyKHz >= 24000 && frequencyKHz <= 24500) return layerMap.Marker12m;
  if (frequencyKHz >= 21000 && frequencyKHz <= 21500) return layerMap.Marker15m;
  if (frequencyKHz >= 18000 && frequencyKHz <= 18500) return layerMap.Marker17m;
  if (frequencyKHz >= 14000 && frequencyKHz <= 14500) return layerMap.Marker20m;
  if (frequencyKHz >= 10000 && frequencyKHz <= 10500) return layerMap.Marker30m;
  if (frequencyKHz >= 7000 && frequencyKHz <= 7200) return layerMap.Marker40m;
  if (frequencyKHz >= 5300 && frequencyKHz <= 5360) return layerMap.Marker60m;
  if (frequencyKHz >= 3500 && frequencyKHz <= 3800) return layerMap.Marker80m;
  if (frequencyKHz >= 1800 && frequencyKHz <= 2000) return layerMap.Marker160m;
  return layerMap.MarkerOthers;
}

function generatePopupContent(data, timestamp) {
  const locale = navigator.language;
  return `<b>${data.callsign}</b> ( ${data.gridsquare} )<br>
    ${timestamp.toLocaleString(locale)} / (${Math.floor((Date.now() - timestamp.getTime()) / 1000 / 60)} min ago)
    <hr>
    <b>Frequency: </b>${data.frequency / 1000} kHz / ${data.band}<br>
    <b>TX bandwidth: </b>${data.bandwidth}<br>
    <b>Beacon: </b>${data.beacon}<br>
    <b>Local noise: </b>${data.strength}<br>
    <b>Version: </b>${data.version}`;
}


function addMinutes(date, minutes) {
  date.setMinutes(date.getMinutes() + minutes);


function update_data() {
  //Get locale from browser for properly formatted date/time stamps
  var locale = navigator.language;

  //Timestamps from API are Europe/Berlin; determine offset for proper conversion
  var deOffset = getTZOffset("Europe/Berlin", new Date());

  //Get clients timezone offset
  var timezone = new Date().getTimezoneOffset();


  $.getJSON({
    url: "https://api.freedata.app/explorer.php",
    type: "GET",
    dataType: "jsonp", // JSONP if server supports it
    error: function (xhr, status, error) {
      console.error("Error fetching data:", error);
    },
    success: function (data) {
      // Clear all layers
      [
        Marker6m,
        Marker10m,
        Marker11m,
        Marker12m,
        Marker15m,
        Marker17m,
        Marker20m,
        Marker30m,
        Marker40m,
        Marker60m,
        Marker80m,
        Marker160m,
        MarkerOthers,
        Lines,
      ].forEach((layer) => layer.clearLayers());
      var callsign_list = [];
      var gridsquare_list = [];

      // Prepare lists of callsigns and gridsquares
      data.forEach((item) => {
        callsign_list.push(item.callsign);
        gridsquare_list.push(item.gridsquare.toUpperCase());
      });

      // Calculate widest distance
      const widestDistance = calculateWidestDistance(data);
      // Process the data and create markers
      data.forEach((item) => {
        try {
          const latlon = gridSquareToLatLon(item.gridsquare);
          const timestamp = new Date(item.timestamp);
          const now = new Date();
          const timeElapsedMinutes = Math.floor(
            (now - timestamp) / (1000 * 60),
          ); // Elapsed time in minutes
          const colorIcon = determineMarkerColor(timeElapsedMinutes);

          let lastHeardTable = ``;
          let lastHeard = item["lastheard"];

          if (lastHeard !== "" && lastHeard !== "null") {
            try {
              try {
                if (lastHeard && lastHeard !== "null") {
                  lastHeard = JSON.parse(lastHeard);
                } else {
                  lastHeard = []; // Handle null or empty case
                }
              } catch (err) {
                lastHeard = item["lastheard"];
              }
              if (!Array.isArray(lastHeard)) {
                console.warn(
                  "Expected lastHeard to be an array, got:",
                  lastHeard,
                );
                return;
              }
              // Sort heard list by newest first
              lastHeard = lastHeard.sort(sortByPropertyDesc("timestamp"));

              lastHeard.forEach((heard) => {
                try {
                  // Validate required fields
                  if (
                    !heard.callsign ||
                    !heard.grid ||
                    heard.grid === "------"
                  ) {
                    console.warn(
                      "Invalid or missing grid or callsign in heard station:",
                      heard,
                    );
                    return;
                  }

                  if (
                    heard.callsign.split("-", 1)[0] ===
                      item.callsign.split("-", 1)[0] &&
                    heard.grid.toLowerCase() === item.gridsquare.toLowerCase()
                  ) {
                    return; // Skip stations with the same callsign and grid square
                  }

                  const latlon_dx = gridSquareToLatLon(heard.grid);
                  if (
                    !latlon_dx ||
                    (latlon_dx[0] === 0 && latlon_dx[1] === 0)
                  ) {
                    console.warn(
                      "Invalid latlon_dx for heard station:",
                      heard.grid,
                    );
                    return;
                  }

                  const dist_KM = Math.round(
                    distance(
                      latlon[0],
                      latlon[1],
                      latlon_dx[0],
                      latlon_dx[1],
                      "K",
                    ),
                  );
                  const dist_NM = Math.round(
                    distance(
                      latlon[0],
                      latlon[1],
                      latlon_dx[0],
                      latlon_dx[1],
                      "N",
                    ),
                  );

                  if (dist_KM > 0 && callsign_list.includes(heard.callsign)) {
                    const latlngs = [
                      [latlon[0], latlon[1]],
                      [latlon_dx[0], latlon_dx[1]],
                    ];

                    let LineColor;
                    if (heard.snr >= 15) LineColor = "green";
                    else if (heard.snr >= 10) LineColor = "green";
                    else if (heard.snr >= 5) LineColor = "yellow";
                    else if (heard.snr >= 2) LineColor = "orange";
                    else if (heard.snr >= 0) LineColor = "red";
                    else LineColor = "grey";

                    L.polyline(latlngs, {
                      color: LineColor,
                      weight: 2,
                      opacity: 0.5,
                      smoothFactor: 1,
                    }).addTo(Lines);
                  }

                  let lastHeardFrequency = heard.frequency || "-----";
                  const formattedTime = new Date(heard.timestamp * 1000,).toLocaleString(locale);

                  lastHeardTable += `
              <tr>
                <td>${formattedTime}</td>
                <td>${heard.callsign}</td>
                <td>${lastHeardFrequency / 1000} kHz</td>
                <td>${heard.grid}</td>
                <td>${dist_KM}km / ${dist_NM}nm</td>
                <td>${heard.snr}dB</td>
              </tr>
            `;
                } catch (err) {
                  console.error(
                    "Error processing last heard station:",
                    heard,
                    err,
                  );
                }
              });
            } catch (err) {
              console.error("Error parsing lastHeard JSON:", lastHeard, err);
            }
          }

               //Convert to date and subtract DE offset; should now be GMT
        var timestamp = addMinutes(new Date(stimestamp), -deOffset);
        //Now add offset for dispaying correct local time
        timestamp = addMinutes(timestamp, -timezone);
        //console.log(timestamp);

        var timeElapsed = Date.now() - timestamp.getTime();
        var timeElapsedSeconds = Math.floor(timeElapsed / 1000);
        var timeElapsedMinutes = Math.floor(timeElapsedSeconds / 60);

          const popupContent = `
      <b>${item.callsign}</b> (${item.gridsquare})<br>
      ${timestamp.toLocaleString(locale)} / (${timeElapsedMinutes} min ago)
      <hr>
      <b>Frequency: </b>${item.frequency / 1000} kHz / ${item.band}<br>
      <b>TX bandwidth: </b>${item.bandwidth}<br>
      <b>Beacon: </b>${item.beacon}<br>
      <b>Local noise: </b>${item.strength}<br>
      <b>Version: </b>${item.version}
      <hr>
      <b>Last heard: </b><br>
      <table class="table ms-0 me-0">
        <tbody>
          ${lastHeardTable}
        </tbody>
      </table>
      <br>
    `;

          processFrequencyMarkers(
            latlon,
            item.frequency,
            popupContent,
            colorIcon,
            getBandLayer(item.frequency),
          );
        } catch (err) {
          console.error("Error processing station:", item, err);
        }
      });
      // Update statistics in the navbar
      updateStatistics(data.length, widestDistance);
    },
  });
}
// Filter change handler using layerMap
function handleFilterChange() {
  document.querySelectorAll(".filter").forEach(function (filterCheckbox) {
    filterCheckbox.addEventListener("change", function () {
      const layerName = filterCheckbox.id.split("-").pop();
      const layer =
        layerMap[
          `Marker${layerName.charAt(0).toUpperCase() + layerName.slice(1)}`
        ];
      if (filterCheckbox.checked) {
        map.addLayer(layer);
      } else {
        map.removeLayer(layer);
      }
    });
  });
}

function getTZOffset(timeZone, date = new Date()) {
  let tempdate = date.toISOString();
  const tz = date
    .toLocaleString("en", { timeZone, timeStyle: "long" })
    .split(" ")
    .slice(-1)[0];
  let tzoffset = "+00:00";
  const dateString = tempdate
    .toString()
    .substring(0, tempdate.toString().length - 1);
  switch (tz) {
    case "GMT+1":
      tzoffset = "+01:00";
      break;
    case "GMT+2":
      tzoffset = "+02:00";
      break;
    case "GMT-2":
      tzoffset = "-02:00";
      break;
    case "GMT-1":
      tzoffset = "-01:00";
      break;
    default:
      console.error("Warning, could not find an offset for " + tz);
  }
  const offset =
    Date.parse(`${dateString}Z`) - Date.parse(`${dateString}${tzoffset}`);

  return offset / 1000 / 60;
}

function distance(lat1, lon1, lat2, lon2, unit) {
  var radlat1 = (Math.PI * lat1) / 180;
  var radlat2 = (Math.PI * lat2) / 180;
  var theta = lon1 - lon2;
  var radtheta = (Math.PI * theta) / 180;
  var dist =
    Math.sin(radlat1) * Math.sin(radlat2) +
    Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = (dist * 180) / Math.PI;
  dist = dist * 60 * 1.1515;
  if (unit == "K") {
    dist = dist * 1.609344;
  }
  if (unit == "N") {
    dist = dist * 0.8684;
  }
  return dist;
}

// Event Listeners for Filters
document.querySelectorAll(".filter").forEach(function (filterCheckbox) {
  filterCheckbox.addEventListener("change", function () {
    const layerName = filterCheckbox.id.split("-").pop();
    const layer = eval(
      `Marker${layerName.charAt(0).toUpperCase() + layerName.slice(1)}`,
    );
    if (filterCheckbox.checked) {
      map.addLayer(layer);
    } else {
      map.removeLayer(layer);
    }
  });
});

//https://medium.com/@asadise/sorting-a-json-array-according-one-property-in-javascript-18b1d22cd9e9
function sortByProperty(property) {
  return function (a, b) {
    if (a[property] > b[property]) return 1;
    else if (a[property] < b[property]) return -1;

    return 0;
  };
}
function sortByPropertyDesc(property) {
  return function (a, b) {
    if (a[property] < b[property]) return 1;
    else if (a[property] > b[property]) return -1;

    return 0;
  };
}

// Function to update the Total Stations and Widest Distance badges in the navbar
function updateStatistics(totalStations, widestDistance) {
  document.getElementById("total-stations").innerText = totalStations;
  document.getElementById("widest-distance").innerText = `${widestDistance} km`;
}

// Function to calculate the widest distance between any two stations
function calculateWidestDistance(stations) {
  let maxDistance = 0;

  // Loop through all pairs of stations to find the maximum distance
  for (let i = 0; i < stations.length; i++) {
    for (let j = i + 1; j < stations.length; j++) {
      const latlon1 = gridSquareToLatLon(stations[i].gridsquare);
      const latlon2 = gridSquareToLatLon(stations[j].gridsquare);

      const dist = distance(
        latlon1[0],
        latlon1[1],
        latlon2[0],
        latlon2[1],
        "K",
      );

      if (dist > maxDistance) {
        maxDistance = dist;
      }
    }
  }

  return maxDistance.toFixed(2); // Return the widest distance as a formatted string
}

// Call handleFilterChange to initialize filter functionality
handleFilterChange();

// Set the map to refresh every 60 seconds
setInterval(update_data, 60000);

// Initialize the map with data
update_data();

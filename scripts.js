var greenIcon = new L.Icon({
  iconUrl: "assets/leaflet-color-markers-master/img/marker-icon-2x-green.png",
  shadowUrl: "assets/leaflet-color-markers-master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var yellowIcon = new L.Icon({
  iconUrl: "assets/leaflet-color-markers-master/img/marker-icon-2x-yellow.png",
  shadowUrl: "assets/leaflet-color-markers-master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var orangeIcon = new L.Icon({
  iconUrl: "assets/leaflet-color-markers-master/img/marker-icon-2x-orange.png",
  shadowUrl: "assets/leaflet-color-markers-master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var redIcon = new L.Icon({
  iconUrl: "assets/leaflet-color-markers-master/img/marker-icon-2x-red.png",
  shadowUrl: "assets/leaflet-color-markers-master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var greyIcon = new L.Icon({
  iconUrl: "assets/leaflet-color-markers-master/img/marker-icon-2x-grey.png",
  shadowUrl: "assets/leaflet-color-markers-master/img/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

var map = L.map("map").setView([51.505, -0.09], 5);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 12,
  minZoom: 0,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

// show map scale
L.control.scale().addTo(map);

// show greyline
var terminator = L.terminator({
  fillOpacity: 0.4,
  fillColor: "#7f7f7f",
}).addTo(map);

var Marker10m = L.layerGroup().addTo(map);
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

//initial show map data
update_data();

var userLocation = map.locate({ setView: true });
console.log(userLocation["_lastCenter"]);

// LEGENDE GARSTELLEN
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

function addMinutes(date, minutes) {
  date.setMinutes(date.getMinutes() + minutes);

  return date;
}

function update_data() {
  $.getJSON({
    url: "https://api.freedata.app/explorer.php",
    type: "GET",
    dataType: "jsonp",
    error: function (xhr, status, error) {
      console.log(error);
    },
    success: function (data) {
      var callsign_list = [];
      Marker10m.clearLayers();
      Marker12m.clearLayers();
      Marker15m.clearLayers();
      Marker17m.clearLayers();
      Marker20m.clearLayers();
      Marker30m.clearLayers();
      Marker40m.clearLayers();
      Marker60m.clearLayers();
      Marker80m.clearLayers();
      Marker160m.clearLayers();
      MarkerOthers.clearLayers();
      Lines.clearLayers();

      // create a callsign list with all callsigns
      // we want to check against this later, so we can be sure we are
      // only creating polylines between callsigns who enabled explorer sharing
      for (var i = 0; i < data.length; i++) {
        var callsign = data[i]["callsign"];
        callsign_list.push(callsign);
      }
      console.log(callsign_list);

      //Get locale from browser for properly formatted date/time stamps
      var locale = navigator.language;

      for (var i = 0; i < data.length; i++) {
        console.log(data[i]);
        var callsign = data[i]["callsign"];
        var timestamp = data[i]["timestamp"];
        var strength = data[i]["strength"];
        var frequency = parseInt(data[i]["frequency"]);
        var band = data[i]["band"];
        var version = data[i]["version"];
        var bandwidth = data[i]["bandwidth"];
        if (bandwidth == "True") {
          bandwidth = "563";
        } else {
          bandwidth = "2000";
        }

        var beacon = data[i]["beacon"];
        if (beacon == "True") {
          beacon = "True";
        } else {
          beacon = "False";
        }

        try {
          var gridsquare = data[i]["gridsquare"];
          var latlon = gridSquareToLatLon(gridsquare);
        } catch (e) {
          console.log(e);
          var latlon = [0.0, 0.0];
        }
        //Seems to be UTC+1
        var timezone = new Date().getTimezoneOffset();
        timestamp = addMinutes(new Date(timestamp), -(timezone + 60));
        //console.log(timezone);
        var unixTimestamp = timestamp.getTime();
        var timeElapsed = Date.now() - unixTimestamp;
        var timeElapsedSeconds = Math.floor(timeElapsed / 1000);
        var timeElapsedMinutes = Math.floor(timeElapsedSeconds / 60);

        if (timeElapsedMinutes <= 5) {
          var iconColor = greenIcon;
        } else if (timeElapsedMinutes > 5 && timeElapsedMinutes < 60) {
          var iconColor = yellowIcon;
        } else if (timeElapsedMinutes > 60 && timeElapsedMinutes < 360) {
          var iconColor = orangeIcon;
        } else if (timeElapsedMinutes > 360 && timeElapsedMinutes < 720) {
          var iconColor = redIcon;
        } else {
          var iconColor = greyIcon;
        }

        var lastHeardTable = ``;
        var lastHeard = data[i]["lastheard"];
        if (lastHeard !== "" && lastHeard !== "null") {
          try {
            lastHeard = JSON.parse(lastHeard);

            for (const x in lastHeard) {
              //Filter out heard stations with same callsign and grid square
              if (
                lastHeard[x]["callsign"].split("-", 1)[0] ==
                  callsign.split("-", 1)[0] &&
                (lastHeard[x]["grid"].toLowerCase() ==
                  gridsquare.toLowerCase() ||
                  lastHeard[x]["grid"] == "------")
              )
                continue;
              try {
                var latlon_dx = gridSquareToLatLon(lastHeard[x]["grid"]);
                var dist_KM = Math.round(
                  distance(
                    latlon[0],
                    latlon[1],
                    latlon_dx[0],
                    latlon_dx[1],
                    "K"
                  )
                );
                var dist_NM = Math.round(
                  distance(
                    latlon[0],
                    latlon[1],
                    latlon_dx[0],
                    latlon_dx[1],
                    "N"
                  )
                );
              } catch (e) {
                console.log(e);
                var dist = 0;
                var dist_KM = "------";
                var dist_NM = "------";
              }
              //Recorded as UTC
              var timestampLastHeard = new Date(
                lastHeard[x]["timestamp"]
              ).getTime();
              var formattedTime = new Date(
                timestampLastHeard * 1000
              ).toLocaleTimeString(locale);

              if (x < 10) {
                var pointA = new L.LatLng(latlon[0], latlon[1]);
                var pointB = new L.LatLng(latlon_dx[0], latlon_dx[1]);
                var pointList = [pointA, pointB];

                var latlngs = [
                  [latlon[0], latlon[1]],
                  [latlon_dx[0], latlon_dx[1]],
                ];

                if (lastHeard[x]["snr"] >= 15) {
                  var LineColor = "green";
                } else if (
                  lastHeard[x]["snr"] >= 10 &&
                  lastHeard[x]["snr"] <= 15
                ) {
                  var LineColor = "green";
                } else if (
                  lastHeard[x]["snr"] >= 5 &&
                  lastHeard[x]["snr"] <= 10
                ) {
                  var LineColor = "green";
                } else if (
                  lastHeard[x]["snr"] >= 2 &&
                  lastHeard[x]["snr"] <= 5
                ) {
                  var LineColor = "yellow";
                } else if (
                  lastHeard[x]["snr"] >= 0 &&
                  lastHeard[x]["snr"] <= 2
                ) {
                  var LineColor = "orange";
                } else if (
                  lastHeard[x]["snr"] >= -5 &&
                  lastHeard[x]["snr"] <= 0
                ) {
                  var LineColor = "red";
                } else {
                  var LineColor = "grey";
                }

                // draw only if callsign list contains callsign of heard station
                //and distance > 0 to prevent phantom lines
                if (
                  dist_KM > 0 &&
                  callsign_list.includes(lastHeard[x]["callsign"])
                ) {
                  var polyline = L.polyline(latlngs, {
                    color: LineColor,
                    weight: 2,
                    opacity: 0.5,
                    smoothFactor: 1,
                  }).addTo(Lines);
                }

                lastHeardTable += `
							<tr>
							  <td>${formattedTime}</td>							  
							  <td>${lastHeard[x]["callsign"]}</td>
							  <td>${lastHeard[x]["grid"]}</td>
							  <td>${dist_KM}km / ${dist_NM}nm</td>
							  <td>${lastHeard[x]["snr"]}dB</td>
							</tr>  
								`;
              }
            }
          } catch (e) {
            console.log(e);
          }
        }

        var popup = `<b>${callsign}</b> ( ${gridsquare} )<br>
			${timestamp.toLocaleString(locale)} / (${timeElapsedMinutes} min ago)
			<hr>
			<b>Frequency: </b>${frequency} Hz / ${band}<br> 
			<b>Bandwidth: </b>${bandwidth} Hz<br> 	
			<b>Beacon: </b>${beacon}<br> 
			<b>Strength: </b>${strength}<br> 
			<b>Version: </b>${version}
			<hr>
			<b>Last heard: </b><br> 
			<table class="table ms-0 me-0">
			  <tbody>
				${lastHeardTable}
			  </tbody>
			</table>
			<br>
		`;

        if (frequency >= 28000000 && frequency <= 28500000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker10m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 24000000 && frequency <= 24500000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker12m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 21000000 && frequency <= 21500000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker15m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 18000000 && frequency <= 18500000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker17m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 14000000 && frequency <= 14500000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker20m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 10000000 && frequency <= 10500000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker30m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 7000000 && frequency <= 7200000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker40m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 5300000 && frequency <= 5360000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker60m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 3500000 && frequency <= 3800000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker80m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else if (frequency >= 1800000 && frequency <= 2000000) {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(Marker160m)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        } else {
          L.marker([latlon[0], latlon[1]], { icon: iconColor })
            .addTo(MarkerOthers)
            .bindPopup(popup, {
              maxWidth: 560,
            });
        }
      }
    },
  });
}

// set map refresh interval
setInterval(function () {
  update_data();
}, 60000);

var enableFilterButton10m = document.getElementById("enable-filter-10m");
enableFilterButton10m.addEventListener("change", function () {
  if (enableFilterButton10m.checked) {
    map.addLayer(Marker10m);
  } else {
    map.removeLayer(Marker10m);
  }
});

var enableFilterButton12m = document.getElementById("enable-filter-12m");
enableFilterButton12m.addEventListener("change", function () {
  if (enableFilterButton12m.checked) {
    map.addLayer(Marker12m);
  } else {
    map.removeLayer(Marker12m);
  }
});

var enableFilterButton15m = document.getElementById("enable-filter-15m");
enableFilterButton15m.addEventListener("change", function () {
  if (enableFilterButton15m.checked) {
    map.addLayer(Marker15m);
  } else {
    map.removeLayer(Marker15m);
  }
});

var enableFilterButton17m = document.getElementById("enable-filter-17m");
enableFilterButton17m.addEventListener("change", function () {
  if (enableFilterButton17m.checked) {
    map.addLayer(Marker17m);
  } else {
    map.removeLayer(Marker17m);
  }
});

var enableFilterButton20m = document.getElementById("enable-filter-20m");
enableFilterButton20m.addEventListener("change", function () {
  if (enableFilterButton20m.checked) {
    map.addLayer(Marker20m);
  } else {
    map.removeLayer(Marker20m);
  }
});

var enableFilterButton30m = document.getElementById("enable-filter-30m");
enableFilterButton30m.addEventListener("change", function () {
  if (enableFilterButton30m.checked) {
    map.addLayer(Marker30m);
  } else {
    map.removeLayer(Marker30m);
  }
});

var enableFilterButton40m = document.getElementById("enable-filter-40m");
enableFilterButton40m.addEventListener("change", function () {
  if (enableFilterButton40m.checked) {
    map.addLayer(Marker40m);
  } else {
    map.removeLayer(Marker40m);
  }
});

var enableFilterButton60m = document.getElementById("enable-filter-60m");
enableFilterButton60m.addEventListener("change", function () {
  if (enableFilterButton60m.checked) {
    map.addLayer(Marker60m);
  } else {
    map.removeLayer(Marker60m);
  }
});

var enableFilterButton80m = document.getElementById("enable-filter-80m");
enableFilterButton80m.addEventListener("change", function () {
  if (enableFilterButton80m.checked) {
    map.addLayer(Marker80m);
  } else {
    map.removeLayer(Marker80m);
  }
});

var enableFilterButton160m = document.getElementById("enable-filter-160m");
enableFilterButton160m.addEventListener("change", function () {
  if (enableFilterButton160m.checked) {
    map.addLayer(Marker160m);
  } else {
    map.removeLayer(Marker160m);
  }
});

var enableFilterButtonOthers = document.getElementById("enable-filter-others");
enableFilterButtonOthers.addEventListener("change", function () {
  if (enableFilterButtonOthers.checked) {
    map.addLayer(MarkerOthers);
  } else {
    map.removeLayer(MarkerOthers);
  }
});

var enableFilterButtonLines = document.getElementById("enable-filter-lines");
enableFilterButtonLines.addEventListener("change", function () {
  if (enableFilterButtonLines.checked) {
    map.addLayer(Lines);
  } else {
    map.removeLayer(Lines);
  }
});

//https://stackoverflow.com/a/52211669
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

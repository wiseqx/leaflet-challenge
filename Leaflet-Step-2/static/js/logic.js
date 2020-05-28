var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json";


function getColor(mag){
  return mag > 5 ? "#DC2626":
      mag > 4 ? "#DC6F26":
      mag > 3 ? "#ff8000":
      mag > 2 ? "#ffff33":
      mag > 1 ? "#b2ff66":
                "#66ff66";
}

function markerSize(mag){
  return mag * 50000
}

d3.json(earthquakeURL, function(data) {
  createFeatures(data.features);
});


function createFeatures(earthquakeData) {
  function onEachFeature(feature, layer){
    layer.bindPopup("<h3>Location: "+ feature.properties.place + "</h3><hr> Magnitude: " + feature.properties.mag +
    "<br> Time: " + feature.properties.time)
}

  function pointToLayer(feature, latlng) {
      return L.circle(latlng, {
          fillOpacity: 0.75,
          color: "black",
          weight: 0.3,
          fillColor: getColor(feature.properties.mag),
          radius: markerSize(feature.properties.mag)
  })}

  var earthquakes = L.geoJson(earthquakeData, {
      onEachFeature: onEachFeature,
      pointToLayer: pointToLayer
});

  createMap(earthquakes);
}


function createMap(earthquakes) {

  var satelliteMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "satellite-v9",
    accessToken: API_KEY
  });

  var grayscaleMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "light-v10",
      accessToken: API_KEY
  });

  var outdoorsMap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
      maxZoom: 18,
      id: "outdoors-v11",
      accessToken: API_KEY
  });

  var baseMaps = {
      "Satellite": satelliteMap,
      "Grayscale": grayscaleMap,
      "Outdoors": outdoorsMap
  };


  var tectonicPlates = new L.LayerGroup();

  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 3,
    layers: [satelliteMap, earthquakes, tectonicPlates]
  }); 

  
  d3.json(tectonicPlatesURL, function(plateData) {
    L.geoJson(plateData, {
      color: "yellow",
      weight: 2
    }).addTo(tectonicPlates);
  });


  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  

  //Create a legend 
  var legend = L.control({position: 'bottomright'});

    legend.onAdd = function (myMap) {var div = L.DomUtil.create('div', 'info legend'); return div;}
    legend.addTo(myMap);
    var grades = [0, 1, 2, 3, 4, 5];
    var labels = ["<strong>Density</strong>"];

    for (var i = 0; i < grades.length; i++){
        var from = grades [i];
        var to = grades [i+1]-1;
        labels.push('<i style="background:' + getColor(from + 1) + '"></i> ' + from + (to ? '&ndash;' + to : '+'));
    }

    var legendText = labels.join("<br>")
    d3.select(".legend.leaflet-control").html(legendText);

}

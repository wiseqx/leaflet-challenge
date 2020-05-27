var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

var tectonicplatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"



function markerSize(mag) {
    return mag * 20000;
}


// function getColor(mag){
//     return mag > 5 ? "#F21E1E":
//     mag > 4 ? "#F2331E":
//     mag > 3 ? "#F26B1E":
//     mag > 2 ? "#F2AB1E":
//     mag > 1 ? "#EBF21E":
//               "#C0F21E";
// }

function getColor(d){
    return  d > 5 ? '#e31a1c':
            d > 4 ? '#fc4e2a':
            d > 3 ? '#fd8d3c':
            d > 2 ? '#feb24c':
            d > 1 ? '#fed976':
                    '#ffffcc';
}


d3.json(earthquakeURL, function(response){
    createFeatures(response.features);
});

function createFeatures(earthquakeData){
    function onEachFeature(feature, layer){
        layer.bindPopup("Location: "+ feature.properties.place + "<hr> Magnitude: " + feature.properties.mag +
        "<hr> Time: " + feature.properties.time)
    }

    function pointToLayer(feature, latlng) {
        return L.circle(latlng, {
            fillOpacity: 0.75,
            color: "transparent",
            fillColor: getColor(feature.properties.mag),
            radius: markerSize(feature.properties.mag)
    })}

    var earthquakes = L.geoJson(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: pointToLayer
    });

    createMap(earthquakes);
}


function createMap(earthquakes){
    // Define streetmap and darkmap layers
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

    d3.json(tectonicplatesURL, function(tectonicData){
        L.geoJson(tectonicData, {
            color: "yellow",
            weight: 2
        }).addTo(tectonicPlates);
    });


    var overlayMaps = {
        "earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    var myMap = L.map("map", {
        center: [34.0522, -118.2437],
        zoom: 3,
        layers: [outdoorsMap, earthquakes, tectonicPlates]
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

  //Create a legend on the bottom right
    var legend = L.control({position: 'bottomright'});

    legend.onAdd = function(myMap){
      var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 1, 2, 3, 4, 5],
        labels = ["Earthquake density"];

  // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };

    legend.addTo(myMap);


}



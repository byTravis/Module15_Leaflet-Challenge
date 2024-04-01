//  Get geoJSON Data
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
let tectonicData = "static/data/PB2002_boundaries.json"

const colorScale = {
    depthScale: [10, 30, 50, 70, 90, 10000],
    color: ["#F9E0A2", "#F6D173", "#F4C145", "#F0AB00", "#EC7A08","#A30000"]
};



   ////////////Create Tectonic Plate Layer////////////
   let tectonicPlates = new L.LayerGroup();

   // Pull in the data 
   d3.json("static/data/PB2002_boundaries.json").then(function(platedata) {
           
       // Add the data to the tectonicplates layer
       L.geoJson(platedata, {
           color: "blue", 
           weight: 1}
           ).addTo(tectonicPlates);

       //Then add the tectonicplates layer to the map.
       
       tectonicPlates.addTo(myMap);
   });


d3.json(url).then( earthquakes => {  
    createFeatures(earthquakes, colorScale);
});


// Create Features
function createFeatures(earthquakes, colorScale) {

    var earthquakeCircles = earthquakes.features.map(feature => {
        return L.circleMarker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            radius: feature.properties.mag * 5,
            fillColor: markerColor(feature.geometry.coordinates[2], colorScale),
            color: "#000",
            weight: 1,
            opacity: .3,
            fillOpacity: .7
        }).bindPopup(`<h2 style="margin-bottom: 0px;"><b>${feature.properties.place}</b></h2>
        <span style="font-size: 11px; color: grey;">${Date(feature.properties.time)}</span><hr />        
        <b>Magnitude:</b> ${feature.properties.mag}<br />
        <b>Depth:</b>  ${feature.geometry.coordinates[2]} km<br />
        <a href = ${feature.properties.url} target= _blank>More Information</a>`
                    );
    });

    var earthquakesLayer = L.layerGroup(earthquakeCircles);

    createMap(earthquakesLayer, colorScale);
    // createLegend(colorScale);
};





//  Sets circle colors
function markerColor(depth, colorScale) {
    for (let i = 0; i < colorScale.depthScale.length; i++) {
        
        if (depth < colorScale.depthScale[i]) {
            return colorScale.color[i];
            break;
        };
    };



};







//  Create Map Layers
function createMap(earthquakes, colorScale) {
    let standard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
      });
    
    let satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
        maxZoom: 20,
        subdomains:['mt0','mt1','mt2','mt3']
        });



    let baseMaps = {Street: standard, Satellite:  satellite, Topographic:  topo, };    
    let overlayMaps = {Earthquakes: earthquakes, };

    let myMap = L.map(map, {
        center: [37.8283, -98.5795],
        zoom: 4.5,
        layers: [standard, earthquakes] 
    });

    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
        }).addTo(myMap);




 




    // Create legend 
    var legend = L.control({ position: "bottomright" });

    legend.onAdd = function (myMap) {
        var div = L.DomUtil.create("div", "legend");
        div.innerHTML += "<h3 style='text-align: center'>Depth (km)</h3>";
        div.innerHTML += "<ul>";

        for (let i = 0; i < colorScale.depthScale.length; i++) { 
            if (i == 0) { 
                    div.innerHTML += `<li><span class = "colorBlock" style="background: ${colorScale.color[i]}"></span>< ${colorScale.depthScale[i]} </li>`}
                else if (i == colorScale.depthScale.length-1) {
                    div.innerHTML += `<li><span class = "colorBlock" style="background: ${colorScale.color[i]}"></span>${colorScale.depthScale[i-1]} +</li>`}
                else {div.innerHTML += `<li><span class = "colorBlock" style="background: ${colorScale.color[i]}"></span>${colorScale.depthScale[i-1]} - ${colorScale.depthScale[i]}</li>`}

       };
       div.innerHTML += "</ul>";

           return div;
   };

   legend.addTo(myMap);
   
   
};




   






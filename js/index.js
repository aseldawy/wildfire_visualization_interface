// elements that make up the popup
const container = document.getElementById("popup");
const content = document.getElementById("popup-content");
const closer = document.getElementById("popup-closer");

// create overlay to anchor popup to map
const overlay = new ol.Overlay({
  element: container,
  autoPan: true,
  autoPanAnimation: {
    duration: 250,
  }
});

// add click handler to hide popup
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
}

var style = new ol.style.Style({
  image: new ol.style.Icon({
    scale: 0.05,
    src: "data/media/wildfire_icon.png"
  })
});

// style object for polygons
var polygonStyle = new ol.style.Style({
  stroke: new ol.style.Stroke({
    color: "ff00ff",
    width: 1
  })
});

function makeDynamicGETRequest(map) {
  // get geojson data
  var url = "http://localhost:8080/vectors/states.geojson";

  // extents object to send to back-end
  minx = map.getView().calculateExtent()[0];
  miny = map.getView().calculateExtent()[1];
  maxx = map.getView().calculateExtent()[2];
  maxy = map.getView().calculateExtent()[3];

  //console.log(ol.proj.toLonLat([minx, miny]));
  //console.log(ol.proj.toLonLat([maxx, maxy]));

  let extentsObj = {
    minx: ol.proj.toLonLat([minx, miny])[0],
    miny: ol.proj.toLonLat([minx, miny])[1],
    maxx: ol.proj.toLonLat([maxx, maxy])[0],
    maxy: ol.proj.toLonLat([maxx, maxy])[1]
  };

  console.log("extents:");
  console.log(extentsObj);

  // make GET request with extents
  $.get(url, extentsObj, function (data, status) {

    console.log("status:");
    console.log(status);

    // clear all current vector layers first
    //map.setLayerGroup([]);

    // add geospatial data to map
    let geoJSONObj = data;
    console.log("geoJSONObj");
    console.log(geoJSONObj);

    // make vector layer using geojson obj
    let vLayer = new ol.layer.Vector({
      // temporarily commented out
      //minZoom: 9,
      source: new ol.source.Vector({
        // {featureProjection: "EPSG:3857"} is necessary for the code to work with UCR-Star data
        features: new ol.format.GeoJSON({featureProjection: "EPSG:3857"}).readFeatures(geoJSONObj)
      }),
      style: function(feature) {
        //style.getText().setText(feature.get("NAME"));
        return polygonStyle;
      }
    });
    
    // add vector layer to map
    map.addLayer(vLayer);
  });
}

$(document).ready(function () {

  // create map
  var map = new ol.Map({
    target: "map",
    layers: [

      // OpenStreetMap
      new ol.layer.Tile({
        source: new ol.source.OSM()
      }),

      // multilevel visualization
      // TEMPORARILY REMOVED
      /*new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: "data/multilevel/tile-{z}-{x}-{y}.png",
          tileSize: [256, 256],
          attributions: '<a href="https://davinci.cs.ucr.edu">&copy;DaVinci</a>'
        }),
        maxZoom: 9
      })*/
    ],
    overlays: [overlay],
    view: new ol.View({
      center: [-13694686.259677762, 4715193.587946976],
      zoom: 6
    })
  });

  makeDynamicGETRequest(map);

  // add hover handler to render popup
  map.on("pointermove", function (evt) {

    var p = evt.pixel;
    var feature = map.forEachFeatureAtPixel(p, function(feature) {
      return feature;
    });
    if (feature) {

      // if we're hovering over a feature, display feature information
      let popupContent = `
        acq_date: ${feature.get("acq_date")}
        <br>
        frp: ${feature.get("frp")}
        <br>
        TEMP_ave: ${feature.get("TEMP_ave")}
        <br>
        WSPD_ave: ${feature.get("WSPD_ave")}
      `;
      content.innerHTML = popupContent;
      //console.log(feature.get("acq_date"));
      //console.log(feature.get("acq_time"));
      // set pos of overlay at click coordinate
      const coordinate = evt.coordinate;
      overlay.setPosition(coordinate);

      // reset bottom info
      document.getElementById("acq_date").innerHTML = "";
    } else {
      //overlay.setPosition(undefined);
      //closer.blur();
    }
  });

  // on singleclick, display current feature info at bottom of map
  map.on("singleclick", function (evt) {
    var p = evt.pixel;
    console.log(evt.coordinate);
    var feature = map.forEachFeatureAtPixel(p, function(feature) {
      return feature;
    });
    if (feature) {

      // if we're clicking on a feature, display more info at the bottom
      document.getElementById("acq_date").innerHTML = feature.get("acq_date");
      document.getElementById("acq_time").innerHTML = feature.get("acq_time");
      document.getElementById("frp").innerHTML = feature.get("frp");
      document.getElementById("TEMP_ave").innerHTML = feature.get("TEMP_ave");
      document.getElementById("TEMP_min").innerHTML = feature.get("TEMP_min");
      document.getElementById("TEMP_max").innerHTML = feature.get("TEMP_max");
      document.getElementById("PRCP").innerHTML = feature.get("PRCP");
      document.getElementById("SNOW").innerHTML = feature.get("SNOW");
      document.getElementById("WDIR_ave").innerHTML = feature.get("WDIR_ave");
      document.getElementById("WSPD_ave").innerHTML = feature.get("WSPD_ave");
      document.getElementById("PRES_ave").innerHTML = feature.get("PRES_ave");
      document.getElementById("WCOMP").innerHTML = feature.get("WCOMP");
      document.getElementById("ELEV_max").innerHTML = feature.get("ELEV_max");
      document.getElementById("ELEV_min").innerHTML = feature.get("ELEV_min");
      document.getElementById("ELEV_median").innerHTML = feature.get("ELEV_median");
      document.getElementById("ELEV_mode").innerHTML = feature.get("ELEV_mode");
      document.getElementById("ELEV_sum").innerHTML = feature.get("ELEV_sum");
      document.getElementById("ELEV_mean").innerHTML = feature.get("ELEV_mean");
    }
  });
/*
  // make dynamic GET request at end of map move event
  map.on("moveend", function() {
    makeDynamicGETRequest(map);
  });*/
});
import React from "react";
import { useState, useEffect } from "react";
import ReactMapGL, { Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { connect } from "react-redux";
// import { SET_PANELJSON } from "../../../constants/actionTypes";

const Map = (props) => {
  const [geoJsonData, setGeoJsonData] = useState({});

  const [viewport, setViewport] = useState({
    latitude: -26.950723227778283,
    longitude: 120.13289871412707,
    zoom: 19,
    width: window.innerWidth,
    height: window.innerHeight,
    // pitch: 40,
  });

  const handleClick = (event, index) => {
    let data = event.features[0];
    console.log("geoJsonData", geoJsonData.features);
    console.log("event", data);
    const panelId = event.features[0].properties.panel_id;
    const clickedPanel = geoJsonData.features.findIndex((value) => {
      return value.properties.panel_id === panelId;
    });
    console.log("Filter Data", clickedPanel);
    // console.log("id", geoJsonData.features[clickedPanel].properties.panel_id);

    if (clickedPanel !== -1) {
      setGeoJsonData((prevData) => {
        prevData.features[clickedPanel].properties.panel_id = "";
        return prevData;
      });
    } else {
      console.log("Hello World");
    }

    return alert("Panel id is: " + data.properties.panel_id);

    // props.setPanelJson(geoJsonData);

    // return console.log("GeoJsonData *****", geoJsonData);
  };

  const resizeHandler = () => {
    setViewport((state) => ({
      ...state,
      width: window.innerWidth,
      height: window.innerHeight,
    }));
  };

  useEffect(() => {
    // const POLYGON_URL =
    // 	"https://airprobedevelopment.s3.ap-south-1.amazonaws.com/random_data/plant_replica/defects_polygon.geojson";
    // const { data: GEO_JSON } = await Axios.get(POLYGON_URL);
    // console.log("geoJsonData **** ", GEO_JSON);

    setGeoJsonData(props.panelJson);
    console.log("data **** ", props.panelJson);
    // setGeoJsonData(GEO_JSON);
    window.addEventListener("resize", resizeHandler);
    return () => window.removeEventListener("resize", resizeHandler);
  }, [props.panelJson]);

  return (
    <div>
      <ReactMapGL
        mapStyle={"mapbox://styles/mapbox/light-v10"}
        mapboxApiAccessToken={
          "pk.eyJ1Ijoic2hhc2hhbmsxMDMiLCJhIjoiY2t1cDRzbHR5MGEzZDJ1czd4b3RiendpeiJ9.z7HVtO4Fc2lFrvsYT0mXPw"
        }
        {...viewport}
        onViewportChange={(newView) => {
          setViewport(newView);
        }}
        onClick={handleClick}
      >
        <Source id="table" type="geojson" data={geoJsonData} />
        <Layer
          id="table-panels"
          type="fill"
          source="table"
          paint={{
            "fill-color": "white",
            "fill-outline-color": "#757D75",
            "fill-opacity": 0.6,
          }}
          filter={["any", ["==", "panel_type", "healthy"]]}
        />
        <Layer
          id="faults-panel"
          type="fill"
          source="table"
          paint={{
            "fill-color": {
              type: "identity",
              property: "defect_color",
            },
            "fill-outline-color": "#ADD8E6",
          }}
          filter={["all", ["==", "panel_type", "defected"]]}
        />
        <Layer
          id="table-border"
          type="line"
          source="table"
          layout={{
            "line-join": "round",
            "line-cap": "round",
          }}
          paint={{
            "line-color": "#005aff",
            "line-width": 2,
          }}
          filter={["==", "$type", "LineString"]}
        />
        <Layer
          id="table-text"
          type="symbol"
          source="table"
          layout={{
            "text-field": ["get", "table_id"],
            "text-offset": [0, viewport.zoom / (viewport.zoom + 10)],
            "text-size": viewport.zoom > 17 ? viewport.zoom / 2.3 : 0,
            "text-allow-overlap": true,
          }}
          filter={["==", "$type", "LineString"]}
        />
        <Layer
          id="label-style"
          type="symbol"
          source="table"
          layout={{
            "text-field": ["get", "panel_position"],
            "text-allow-overlap": true,
            "text-size": viewport.zoom >= 19.5 ? viewport.zoom / 2.1 : 0,
          }}
          paint={{
            "text-color": "#ffffff",
          }}
          filter={["==", "panel_type", "defected"]}
        />
      </ReactMapGL>
    </div>
  );
};

const mapStateToProps = (state) => ({
  panelJson: state.panelJson.panelJson,
});

const mapDispatchToProps = (dispatch) => ({
  setPanelJson: (value) => dispatch({ type: SET_PANELJSON, payload: value }),
});

export default connect(mapStateToProps, mapDispatchToProps)(Map);

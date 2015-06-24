(function(){
'use strict';

angular.module('signalizator')
.constant('leafletConfig', {
    center: {
        lat: 50.08,
        lng: 14.41,
        zoom: 12
    },
    defaults: {
        minZoom: 11
    },
    maxbounds: {
        northEast: {
            lat: 50.20,
            lng: 15.00
        },
        southWest: {
            lat: 49.90,
            lng: 14.00
        }
    },
    layers: {
        overlays: {
            locations: {
                name: "Lokace",
                type: "markercluster",
                visible: true,
                layerOptions: {
                    showCoverageOnHover: false,
                    removeOutsideVisibleBounds: true,
                    zoomToBoundsOnClick: false,
                    spiderfyOnMaxZoom: false
                }
            }
        },
        baselayers: {
            googleRoadmap: {
                name: 'Google Streets',
                layerType: 'ROADMAP',
                type: 'google'
            },
            googleTerrain: {
                name: 'Google Terrain',
                layerType: 'TERRAIN',
                type: 'google'
            },
            googleHybrid: {
                name: 'Google Hybrid',
                layerType: 'HYBRID',
                type: 'google'
            },
            bingAerial: {
                name: 'Bing Aerial',
                type: 'bing',
                key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
                layerOptions: {
                    type: 'Aerial'
                }
            },
            bingRoad: {
                name: 'Bing Road',
                type: 'bing',
                key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
                layerOptions: {
                    type: 'Road'
                }
            },
            bingAerialWithLabels: {
                name: 'Bing Aerial With Labels',
                type: 'bing',
                key: 'Aj6XtE1Q1rIvehmjn2Rh1LR2qvMGZ-8vPS9Hn3jCeUiToM77JFnf-kFRzyMELDol',
                layerOptions: {
                    type: 'AerialWithLabels'
                }
            },
        }
    },
    controls: {
        position: 'topleft',
        draw: {
            circle: false,
            marker: false,
            polyline: false,
            polygon: false,
            rectangle: true
        },
        fullscreen: {
            position: 'topleft'
        }
    },
    events: {
        markers: {
            enable: ['click', 'mouseover', 'mouseout'],
        },
        map: {
            enable: ['zoomend', 'dragend'],
            logic: 'emit'
        }
    },
    icons: {
        false: L.AwesomeMarkers.icon({"icon": 'tag', "markerColor": 'orange'}),
        true: L.AwesomeMarkers.icon({"icon": 'tag', "markerColor": 'blue'})
    }
});

})();

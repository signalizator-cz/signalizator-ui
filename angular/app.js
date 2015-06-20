var app = angular.module("signalizator", ["leaflet-directive", 'ui.bootstrap']);

app.controller("GoogleMapsFullsizeController",
    [ "$scope", "$element", '$anchorScroll', '$location', "leafletData", "leafletMarkersHelpers", "leafletEvents", "feedService", "subscribeService",
    function($scope, $element, $anchorScroll, $location, leafletData, leafletMarkersHelpers, leafletEvents, feedService, subscribeService) {

    angular.extend($scope, {
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
                        zoomToBoundsOnClick: false
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
            disable: [],
            // markers: {
            //     enable: leafletEvents.getAvailableMarkerEvents(),
            // },
            // map: {
            //     enable: ['zoomend', 'dragend'],
            //     logic: 'emit'
            // }
        },

        icons: {
            false: 'orange',
            true: 'blue'
        },

        city: {
            lat: 50.08,
            lng: 14.41,
            zoom: 12
        },
        circle: {
            lat: 50.08,
            lng: 14.41,
            radius: 13
        },
        selectedRecords: [],
        areaSelected: false,

        refreshRecords: function(bounds) {
            leafletMarkersHelpers.resetMarkerGroups();
            $scope.selectedAreaBounds = bounds;
            feedService.records(bounds).then(function(data) {
                $scope.records = data.records;
                $scope.markersMap = {};
                $scope.markers = _.flatten(_.map(data.records, function(record) {
                    return _.map(_.values(record.markers), function(marker) {
                        marker.rid = record.id;
                        marker.icon = {"type": 'awesomeMarker', "icon": 'tag', "markerColor": $scope.icons[false]};
                        marker.layer = 'locations';
                        $scope.markersMap[record.id + '-' + marker.id] = marker;
                        return marker;
                    });
                    }));
            });
        },

        selectRecord: function(record, $event) {
            for (var i = 0; i < $scope.selectedRecords.length; i++) {
                prevSelectedRec = $scope.selectedRecords[i];
                prevSelectedRec.selected = false;
                $scope.setSelectedMarkers(prevSelectedRec, false);
            }
            record.selected = true;
            $scope.selectedRecords = [record];
            $scope.setSelectedMarkers(record, true);
            $scope.gotoAnchor(record.id);
        },

        setSelectedMarkers: function(record, selected) {
            markersArr = _.values(record.markers);
            for (var i = 0; i < markersArr.length; i++) {
                marker = markersArr[i];
                $scope.markersMap[record.id + '-' + marker.id].icon.markerColor = $scope.icons[selected];
            }
        },

        gotoAnchor: function(rid) {
            var newHash = 'record-' + rid;
            if ($location.hash() !== newHash) {
                $location.hash(newHash);
            } else {
                $anchorScroll();
            }
        },

        subscribe: function() {
            console.log("subscribe");
            console.log($scope.emailValue);
            subscribeService.register($scope.selectedAreaBounds, $scope.emailValue).then(function(data) {
                console.log(data);
            });
            $scope.addAlert();
        },

        alerts: [],

        addAlert: function() {
            $scope.alerts.push({type: "success", msg: 'Odesláno.'});
        },

        closeAlert: function(index) {
            $scope.alerts.splice(index, 1);
        }
    });

leafletData.getMap('mainMap').then(function(map) {
    var drawnItems = $scope.controls.edit.featureGroup;

    map.on('draw:deleted', function (e) {
        $scope.areaSelected = false;
        leafletData.getMap('mainMap').then(function(map) {
            $scope.refreshRecords(map.getBounds());
        });
    });
    map.on('draw:created', function (e) {
        var layer = e.layer;
        drawnItems.clearLayers();
        drawnItems.addLayer(layer);
        $scope.areaSelected = true;
        $scope.refreshRecords(layer.getBounds());
    });


    $scope.rectangleDraw = new L.Draw.Rectangle(map);
    $scope.enableDraw = function() {
        console.log($scope.rectangleDraw);
        $scope.rectangleDraw.enable();
    };
});

leafletData.getLayers('mainMap').then(function(layers) {
    markers = layers.overlays.locations;

    markers.on('clusterclick', function(event, args){
        event.layer.getAllChildMarkers()
    });
    markers.on('clusterdblclick', function(event, args){
        event.layer.zoomToBounds();
    });
});

$scope.$on('leafletDirectiveMarker.click', function (event, args) {
    $scope.selectRecord($scope.records[args.model.rid]);
});
$scope.$on('leafletDirectiveMap.zoomend', function(event, args){
    if (!$scope.areaSelected) {
        leafletData.getMap('mainMap').then(function(map) {
            $scope.refreshRecords(map.getBounds());
        });
    }
});
$scope.$on('leafletDirectiveMap.dragend', function(event, args){
    if (!$scope.areaSelected) {
        leafletData.getMap('mainMap').then(function(map) {
            $scope.refreshRecords(map.getBounds());
        });
    }
});

$scope.$on('clusterclick', function(event, args){
    console.log('clusterclick');
    console.log(event);
});
}]);

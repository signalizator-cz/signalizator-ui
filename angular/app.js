var app = angular.module("signalizator", ["leaflet-directive"]);

app.factory('feedService', ['$http', function($http) {

    var dummy_data = false;

    if (dummy_data) {
        var entrypoint = "http://localhost/signalizator/dummy_data/feed";
        var suffix = ".json";
    } else {
        var entrypoint = "http://signalizatorrest.azurewebsites.net/";
        var suffix = "";
    }

    return {
        records: function(bounds) {
            var getParams = {
                'x1':bounds.getWest(),
                'y1':bounds.getSouth(),
                'x2':bounds.getEast(),
                'y2':bounds.getNorth()
            };

            var url = entrypoint + suffix;
            var promise = $http.get(url, {params: getParams})
                .then(function (response) {
                    return response.data;
            });
            return promise;
        },

        record: function(id) {
            var url = entrypoint + "/" + id + suffix;
            var promise = $http.get(url, {params: area_of_interest})
                .then(function (response) {
                    return response.data;
            });
            return promise;
        }
  };
}]);

app.controller("GoogleMapsFullsizeController",
    [ "$scope", "$element", '$anchorScroll', '$location', "leafletData", "leafletMarkersHelpers", "leafletEvents", "feedService",
    function($scope, $element, $anchorScroll, $location, leafletData, leafletMarkersHelpers, leafletEvents, feedService) {

    angular.extend($scope, {
        // maxbounds: {
        //     northEast: {
        //         lat: 52.00,
        //         lng: 15.00
        //     },
        //     southWest: {
        //         lat: 50.00,
        //         lng: 14.20
        //     }
        // },
        layers: {
            overlays: {
                locations: {
                    name: "Lokace",
                    type: "markercluster",
                    visible: false,
                    layerOptions: {
                        showCoverageOnHover: false,
                        removeOutsideVisibleBounds: true
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
                circle: true,
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
                enable: leafletEvents.getAvailableMarkerEvents(),
            },
            map: {
                enable: ['zoomend', 'dragend', 'viewreset'],
                logic: 'emit'
            }
        },

        icons: {
            false: 'red',
            true: 'green'
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

        refreshRecords: function(coordinates) {
            leafletMarkersHelpers.resetMarkerGroups();
            feedService.records(coordinates).then(function(data) {
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
        }
    });

leafletData.getMap('mainMap').then(function(map) {
  var drawnItems = $scope.controls.edit.featureGroup;
  map.on('draw:created', function (e) {
    var layer = e.layer;
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);
    $scope.refreshRecords(layer.getBounds());
});
});

$scope.$on('leafletDirectiveMarker.click', function (event, args) {
    $scope.selectRecord($scope.records[args.model.rid]);
});
$scope.$on('leafletDirectiveMap.zoomend', function(event, args){
    leafletData.getMap('mainMap').then(function(map) {
        $scope.refreshRecords(map.getBounds());
    });
});
$scope.$on('leafletDirectiveMap.dragend', function(event, args){
    leafletData.getMap('mainMap').then(function(map) {
        $scope.refreshRecords(map.getBounds());
    });
});

}]);


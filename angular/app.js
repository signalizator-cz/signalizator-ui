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
        records: function(area_of_interest) {
            var url = entrypoint + suffix;
            var promise = $http.get(url, {params: area_of_interest})
                .then(function (response) {
                    console.log("Response for " + url + ": " + JSON.stringify(response));
                    return response.data;
            });
            return promise;
        },

        record: function(id) {
            var url = entrypoint + "/" + id + suffix;
            var promise = $http.get(url, {params: area_of_interest})
                .then(function (response) {
                    console.log("Response for " + url + ": " + JSON.stringify(response));
                    return response.data;
            });
            return promise;
        }
  };
}]);

app.controller("GoogleMapsFullsizeController",
    [ "$scope", "$element", "leafletData", "leafletEvents", "feedService",
    function($scope, $element, leafletData, leafletEvents, feedService) {

    angular.extend($scope, {
        layers: {
            baselayers: {
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
                googleRoadmap: {
                    name: 'Google Streets',
                    layerType: 'ROADMAP',
                    type: 'google'
                }
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
            }
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

        refreshRecords: function() {
            feedService.records().then(function(data) {
                $scope.records = data.records;
            $scope.markers = _.flatten(_.map(data.records, function(record) {
                return _.map(_.values(record.markers), function(marker) {
                    marker.rid = record.id;
                    marker.icon = {"type": 'awesomeMarker', "icon": 'tag', "markerColor": 'red'};
                    return marker;
                });
            }));
            });
        },

        selectRecord: function(record, $event) {
            console.log(record);
            console.log($event);
            record.selected = true;
        }
    });

leafletData.getMap().then(function(map) {
  var drawnItems = $scope.controls.edit.featureGroup;
  map.on('draw:created', function (e) {
    var layer = e.layer;
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);
    console.log("Drawn item: " + JSON.stringify(layer.toGeoJSON()));
});
});

$scope.refreshRecords();

$scope.$on('leafletDirectiveMarker.click', function (e, args) {
    $scope.selectRecord($scope.records[args.model.rid]);
});

}]);


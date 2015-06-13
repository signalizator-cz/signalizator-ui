var app = angular.module("signalizator", ["leaflet-directive"]);

app.factory('feedService', ['$http', function($http) {
    var entrypoint = "http://localhost/signalizator/dummy_data/feed";
    var suffix = ".json";

    return {
        feed: function(area_of_interest) {
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
            zoom: 13
        },
        circle: {
            lat: 50.08,
            lng: 14.41,
            radius: 13
        },

        refreshFeed: function() {
            feedService.feed().then(function(data) {
                $scope.feed = data.feed;
            $scope.markers = _.flatten(_.map(data.feed, function(record) {
                return _.map(record.markers, function(marker) {
                    marker.rid = record.id;
                    return marker;
                });
            }));
            });
        }
    });


leafletData.getMap().then(function(map) {
  var drawnItems = $scope.controls.edit.featureGroup;
  map.on('draw:created', function (e) {
    var layer = e.layer;
    drawnItems.clearLayers();
    drawnItems.addLayer(layer);
    console.log("Drawn item: " + JSON.stringify(layer.toGeoJSON()));

    if (layer instanceof L.Circle) {
        $scope.shape.circle = layer.getLatLng();
        $scope.shape.circle.radius = layer.getRadius();
    } else if (layer instanceof L.Rectangle) {
        $scope.shape.rect = {};
    }
});
});

$scope.refreshFeed();

$scope.$on('leafletDirectiveMarker.click', function (e, args) {
    console.log(e);
    console.log(args);
    console.log(this);
});

}]);


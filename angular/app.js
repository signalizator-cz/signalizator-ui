(function(){
'use strict';

angular.module("signalizator", ["leaflet-directive", 'ui.bootstrap'])
.controller("GoogleMapsFullsizeController",
    [ "$scope", "$element", '$anchorScroll', '$location', "leafletData", "leafletMarkersHelpers", "leafletEvents", "feedService", "subscribeService", "leafletConfig",
    function($scope, $element, $anchorScroll, $location, leafletData, leafletMarkersHelpers, leafletEvents, feedService, subscribeService, leafletConfig) {

    angular.extend($scope, leafletConfig);

    angular.extend($scope, {

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
                var prevSelectedRec = $scope.selectedRecords[i];
                prevSelectedRec.selected = false;
                $scope.setSelectedMarkers(prevSelectedRec, false);
            }
            record.selected = true;
            $scope.selectedRecords = [record];
            $scope.setSelectedMarkers(record, true);
            $scope.gotoAnchor(record.id);
        },

        setSelectedMarkers: function(record, selected) {
            var markersArr = _.values(record.markers);
            for (var i = 0; i < markersArr.length; i++) {
                var marker = markersArr[i];
                $scope.markersMap[record.id + '-' + marker.id].icon.markerColor = $scope.icons[selected];
            }
        },

        gotoAnchor: function(rid) {
            var newHash = 'record-' + rid;
            if ($location.hash() !== newHash) {
                $location.path("");
                $location.hash(newHash);
            } else {
                $anchorScroll();
            }
        },

        subscribe: function(email) {
            subscribeService.register($scope.selectedAreaBounds, email).then(function(data) {
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
    var markers = layers.overlays.locations;

    markers.on('clusterclick', function(event, args){
        event.layer.getAllChildMarkers();
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

})();

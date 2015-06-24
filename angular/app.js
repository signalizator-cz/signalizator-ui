(function(){
'use strict';

angular.module("signalizator", ["leaflet-directive", 'ui.bootstrap'])
.controller("GoogleMapsFullsizeController",
    [ "$scope", "$element", '$anchorScroll', '$location', "$timeout", "leafletData", "leafletMarkersHelpers", "leafletEvents", "feedService", "subscribeService", "leafletConfig",
    function($scope, $element, $anchorScroll, $location, $timeout, leafletData, leafletMarkersHelpers, leafletEvents, feedService, subscribeService, leafletConfig) {

    angular.extend($scope, leafletConfig);

    angular.extend($scope, {

        selectedRecords: [],
        areaSelected: false,

        refreshRecords: function(bounds) {
            $scope.selectedAreaBounds = bounds;
            feedService.records(bounds).then(function(data) {
                $scope.records = data.records;
                $scope.markers = _.flatten(_.map(data.records, function(record) {
                    return _.map(_.values(record.markers), function(marker) {
                        marker.rid = record.id;
                        marker.layer = 'locations';
                        marker.title = marker.rid + '-' + marker.id;
                        return marker;
                    });
                    }));

                $timeout(function() {
                    $scope.markersMap = {};
                    leafletData.getMarkers().then(function(markers) {
                        var markersArr = _.values(markers);
                        for (var i = 0; i < markersArr.length; i++) {
                            var marker = markersArr[i];
                            marker.setIcon($scope.icons[false]);
                            $scope.markersMap[marker.options.rid + '-' + marker.options.id] = marker;
                        }
                    });
                }, 100);

            });
        },

        selectRecords: function(records, $event) {
            for (var i = 0; i < $scope.selectedRecords.length; i++) {
                var prevSelectedRec = $scope.selectedRecords[i];
                prevSelectedRec.selected = false;
                console.log("record deselected: " + prevSelectedRec.id);
                $scope.setSelectedMarkers(prevSelectedRec, false);
            }
            for (var j = 0; j < records.length; j++) {
                records[j].selected = true;
                $scope.setSelectedMarkers(records[j], true);
                console.log("record selected: " + records[j].id);
            }
            $scope.selectedRecords = records;
            $scope.gotoAnchor(records[0].id);
            _.defer(function(){$scope.$apply();});
        },

        setSelectedMarkers: function(record, selected) {
            var markersArr = _.values(record.markers);
            for (var i = 0; i < markersArr.length; i++) {
                var marker = markersArr[i];
                console.log("marker " + record.id + '-' + marker.id + " selected set: " + selected);
                $scope.markersMap[record.id + '-' + marker.id].setIcon($scope.icons[selected]);
            }
        },

        setSelectedCluster: function (rmid) {
            var marker = $scope.markersMap[rmid];
            parent = marker.__parent._group;
            var visibleCluster = parent.getVisibleParent(marker);
            visibleCluster._icon.className += " selected";
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
        console.log(event);
        // event.layer._icon.className += " selected";

        $scope.selectRecords(
        _.map(_.uniq(_.map(event.layer.getAllChildMarkers(),'options.rid')),
            function(rid) {
                return $scope.records[rid];
            }));
    });
    markers.on('clusterdblclick', function(event, args){
        event.layer.zoomToBounds();
    });
});

$scope.$on('leafletDirectiveMarker.click', function (event, args) {
    console.log("marker clicked: " + args.model.rid + "-" + args.model.id);
    $scope.selectRecords([$scope.records[args.model.rid]]);
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
}]);

})();

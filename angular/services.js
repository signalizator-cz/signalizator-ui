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
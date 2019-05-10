/*const url = 'http://172.20.4.42:8081/cockpit/api/thumbnails?X-User=a';

export function getThumbnails (){
  return fetch(url, {
    method : 'GET',
    transformResponse: function (data){
      if(data){
        var response = data.toString();
        if(response.indexOf(PREFIX_JSON_PROTECTION) !== -1){
          response = JSON.parse(response.replace(PREFIX_JSON_PROTECTION, ''));
        }
      }
      return data
    }
  })
  .then((response) => response.json())
  .catch((error) => console.error(error));
}

var PREFIX_JSON_PROTECTION = ")]}',";

var parseData = function (data) {
  return JSON.parse(JSON.stringify(data));
};*/

/*recoverThumbnailsOfPremise: function () {
  return $http.get($rootScope.endPointApi + '/thumbnails', {
    method: 'GET',
    transformResponse: function (data) {
      if (data) {
        var response = data.toString();
        if (response.indexOf(PREFIX_JSON_PROTECTION) !== -1) {
          response = JSON.parse(response.replace(PREFIX_JSON_PROTECTION, ''));
          if (!response.authentified && !response.hostmode) {
            window.location.href = '/cockpit/login';
          }
        }
        return angular.fromJson(data);
      }
      return data;
    }
  });
},

recoverDetailsOfThumbnail: function (thumbnail) {
  return $http.get($rootScope.endPointApi + '/thumbnails/' + thumbnail.id);
},*/
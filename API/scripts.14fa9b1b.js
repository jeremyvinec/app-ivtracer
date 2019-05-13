'use strict';

angular
  .module('ivtracerOverviewPanel', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'jm.i18next',
    'btford.socket-io',
    'ui.bootstrap',
    'highcharts-ng'
  ])
  .config(function ($httpProvider, $locationProvider, $routeProvider) {
    $httpProvider.interceptors.push('HttpRequestTimeoutInterceptor');
    $locationProvider.hashPrefix('');

    $routeProvider
      .when('/hub', {
        templateUrl: 'views/hub/hub.html',
        controller: 'HubCtrl'
      })
      .otherwise({
        redirectTo: '/hub'
      })
  })
  .run(function ($rootScope, config) {
    $rootScope.endPointApi = config.endPointApi;
    $rootScope.endPointSocketIo = config.endPointSocketIo;
    $rootScope.locale = config.locale;
    $rootScope.intervalRefreshThumbnails = config.intervalRefreshThumbnails;
    $rootScope.intervalRefreshCurves = config.intervalRefreshCurves;
    $rootScope.intervalRefreshReconnection = config.intervalRefreshReconnection;
  })
  .run(function ($rootScope, $log, DataAccessor) {
    window.i18next.use(window.i18nextXHRBackend);

    window.i18next.init({
      debug: false,
      fallbackLng: '',
      lng: $rootScope.locale,
      initImmediate: false,
      backend: {
        loadPath: './locales/{{lng}}/translation.json'
      },
      useCookie: false,
      useLocalStorage: false
    }, function (err) {
      if (err) { $log.error('error load translation', err); }
      $log.log('Translation loaded');
    });

    // Polyfill : https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/String/includes
    if (!String.prototype.includes) {
      String.prototype.includes = function(search, start) {
        if (typeof start !== 'number') {
          start = 0;
        }

        if (start + search.length > this.length) {
          return false;
        } else {
          return this.indexOf(search,start) !== -1;
        }
      };
    }

    DataAccessor.recoverPredefinedComments().then(function (response) {
      $rootScope.predefinedComments = response.data;
    }, function (response) {
      $log.error('Unable to recover predefined comments', response);
    });
  });

'use strict';

angular.module('ivtracerOverviewPanel').factory('Utilities', ['$timeout', function ($timeout) {

  var Utilities = {

    isNull: function (val) {
      return val === null;
    },

    isEmpty: function (value) {
      return Utilities.isNull(value) || angular.isUndefined(value) || value === [] || value === '' || value.length === 0;
    },

    naturalCancelRequest: function (status) {
      return status !== -1 || Utilities.isEmpty(status);
    },

    cancelTimeout: function (timeout) {
      if (angular.isDefined(timeout)) {
        timeout = $timeout.cancel(timeout);
      }
      timeout = null;
      return timeout;
    },

    timeoutIsDefined: function (timeout) {
      return !Utilities.isNull(timeout);
    }

  };

  return Utilities;
}]);

'use strict';

var PREFIX_JSON_PROTECTION = ")]}',";

angular.module('ivtracerOverviewPanel').factory('DataAccessor', function ($rootScope, $http) {
  return {

    recoverPredefinedComments: function () {
      return $http.get($rootScope.endPointApi + '/predefinedComments');
    },

    recoverThumbnailsOfPremise: function () {
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
    },

    recoverCurvesOfThumbnail: function (thumbnail) {
      return $http.get($rootScope.endPointApi + '/curves/' + thumbnail.id);
    },

    ackAlarms: function (formData) {
      return $http.post($rootScope.endPointApi + '/probes/alarms/ack', formData);
    }

  };
});

'use strict';

/* Service permettant de gérer les requêtes en cours */
angular.module('ivtracerOverviewPanel').factory('HttpPendingRequests', ['$q', function ($q) {
  /* Variable globale du service */
  var cancelPromises = [];

  /* Fonction qui ajoute un timeout */
  var newTimeout = function () {
    var cancelPromise = $q.defer();
    cancelPromises.push(cancelPromise);
    var returned = {};
    returned.promise = cancelPromise.promise;
    returned.index = cancelPromises.indexOf(cancelPromise);
    return returned;
  };

  /* Fonction qui arrête les requêtes */
  var cancelAll = function () {
    angular.forEach(cancelPromises, function (cancelPromise) {
      cancelPromise.promise.isGloballyCancelled = true;
      cancelPromise.resolve();
    });
    cancelPromises.length = 0;
  };

  var removeResolvedRequest = function (index) {
    if (cancelPromises[index]) {
      cancelPromises[index].promise.isGloballyCancelled = true;
      cancelPromises[index].resolve();
    }
  };

  /* Fonctions disponibles du service */
  return {
    newTimeout: newTimeout,
    cancelAll: cancelAll,
    removeResolvedRequest: removeResolvedRequest
  };
}]);

'use strict';

/* Service permettant de reformatter les requêtes http */
angular.module('ivtracerOverviewPanel').factory('HttpRequestTimeoutInterceptor', ['$q', 'HttpPendingRequests', function ($q, HttpPendingRequests) {
  return {

    request: function (config) {
        config = config || {};
        if (config.timeout === undefined && !config.noCancelOnRouteChange && config.url.indexOf('workspace') === -1 && config.url.indexOf('.html') === -1) {
          var temp = HttpPendingRequests.newTimeout();
          config.timeout = temp.promise;
          config.stopIdentifier = temp.index;
        }
        return config;
    },

    response: function (response) {
      HttpPendingRequests.removeResolvedRequest(response.config.stopIdentifier);
      return response;
    }

  };
}]);

'use strict';

angular.module('ivtracerOverviewPanel').factory('DataManager', function ($log, DateManager, Utilities) {

  var listRegistered = {}

  var register = function (dataType, list) {
    listRegistered[dataType] = list;
    $log.log('DataManager - register new type : ' + dataType);
  }

  var find = function (list, itemSearch) {
    var itemFind = false;
    if (typeof itemSearch === 'object' && !Utilities.isNull(itemSearch)) {
      if (itemSearch.id) {
        angular.forEach(list, function (item) {
          if (item.id === itemSearch.id) {
            itemFind = true;
          }
        });
      }
    }
    return itemFind;
  };

  var upd = function (list, itemUpdate) {
    if (find(list, itemUpdate)) {
      angular.forEach(list, function (item, index) {
        if (item.id === itemUpdate.id) {
          list[index] = itemUpdate;
        }
      });
    }
    return list;
  };

  var computeListAlarmsToBeAck = function (alarms) {
    if (alarms && typeof alarms === 'object') {
      var listAlarmsToBeAck = [];
      angular.forEach(alarms, function (alarm) {
        if (alarm.begin && !alarm.ack) {
          listAlarmsToBeAck.push(alarm);
        }
      });
      return listAlarmsToBeAck;
    }
  };

  var computePriorityThumbnailsList = function (list) {
    var alarmsNotAck = [], prealarmsNotAck = [], notAck = [], alarms = [], prealarms = [], others = [];

    if (list) {
      for (var index = 0; index < list.length; index++) {
        var thumbnail = list[index];
        if (thumbnail.priority && !Utilities.isEmpty(thumbnail.states)) {
          if (thumbnail.states.includes('prealarm') && thumbnail.states.includes('notack')) {
            prealarmsNotAck.push(thumbnail);
          } else if (thumbnail.states.includes('alarm') && thumbnail.states.includes('notack')) {
            alarmsNotAck.push(thumbnail);
          } else if (thumbnail.states.includes('notack')) {
            notAck.push(thumbnail);
          } else if (thumbnail.states.includes('prealarm')) {
            prealarms.push(thumbnail);
          } else if (thumbnail.states.includes('alarm')) {
            alarms.push(thumbnail);
          } else {
            others.push(thumbnail);
          }
        }
      }
    }

    var filteredPriorityThumbnailsList = [].concat(alarmsNotAck);
    filteredPriorityThumbnailsList = filteredPriorityThumbnailsList.concat(prealarmsNotAck);
    filteredPriorityThumbnailsList = filteredPriorityThumbnailsList.concat(notAck);
    filteredPriorityThumbnailsList = filteredPriorityThumbnailsList.concat(alarms);
    filteredPriorityThumbnailsList = filteredPriorityThumbnailsList.concat(prealarms);
    filteredPriorityThumbnailsList = filteredPriorityThumbnailsList.concat(others);

    return filteredPriorityThumbnailsList;
  };

  var computeNbAlarmsDuringLast24Hours = function (alarms) {
    if (alarms && typeof alarms === 'object') {
      var nbAlarmsDuringLast24Hours = 0;

      angular.forEach(alarms, function (alarm) {
        if (!Utilities.isEmpty(alarm.begin)) {
          if (moment(alarm.begin).valueOf() >= DateManager.getToday() || Utilities.isNull(alarm.end) || moment(alarm.end).valueOf() >= (DateManager.getToday() - DateManager.ONE_DAY_IN_MS)) {
            nbAlarmsDuringLast24Hours++;
          }
        }
      });

      return nbAlarmsDuringLast24Hours;
    }
  };

  var verifyThumbnailNotExistInListPriorityThumbnails = function (list, thumbnailSelected) {
    var priorityThumbnailsList = computePriorityThumbnailsList(list);
    if (priorityThumbnailsList) {
      return !find(priorityThumbnailsList, thumbnailSelected);
    } else {
      return true;
    }
  };

  var deselectAllThumbnails = function (thumbnails) {
    if (thumbnails) {
      var isValidList = false;

      angular.forEach(thumbnails, function (thumbnail) {
        if (thumbnail.id) {
          isValidList = true;
          thumbnail.selected = false;
        }
      });

      return isValidList ? thumbnails : -1;
    } else {
      return -1;
    }
  };

  var displayQualityParametersOfTypeIfExist = function (qualityParameters, type)  {
    if (type === 'alarm' || type === 'prealarm') {
      if (qualityParameters) {
        var showQualityParams = false;
        angular.forEach(qualityParameters, function (qualityParameter) {
          if (!angular.isUndefined(qualityParameter[type]) && !Utilities.isNull(qualityParameter[type])) {
            showQualityParams = true;
          }
        });
        return showQualityParams;
      }
    }
  };

  return {
    register: register,
    find: find,
    upd: upd,
    computePriorityThumbnailsList: computePriorityThumbnailsList,
    computeListAlarmsToBeAck: computeListAlarmsToBeAck,
    computeNbAlarmsDuringLast24Hours: computeNbAlarmsDuringLast24Hours,
    verifyThumbnailNotExistInListPriorityThumbnails: verifyThumbnailNotExistInListPriorityThumbnails,
    deselectAllThumbnails: deselectAllThumbnails,
    displayQualityParametersOfTypeIfExist: displayQualityParametersOfTypeIfExist
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').factory('DateManager', function ($i18next, Utilities) {

  var ONE_DAY_IN_MS = 86400000;

  var isValidDateIso = function (dateIso) {
    return moment(dateIso).isValid();
  };

  var getDate = function () {
    return new Date();
  };

  var computeDuration = function (alarm) {
    if (!Utilities.isEmpty(alarm.begin) && isValidDateIso(alarm.begin)) {
      if (!Utilities.isEmpty(alarm.end) && isValidDateIso(alarm.end)) {
        return moment.duration(moment(alarm.end).valueOf() - moment(alarm.begin).valueOf());
      } else {
        return moment.duration(getDate().getTime() - moment(alarm.begin).valueOf());
      }
    }
    return null;
  };

  var formatDate = function (moment) {
    return moment.format($i18next.t('format.date'));
  };

  var formatTime = function (moment) {
    return moment.format($i18next.t('format.time'));
  };

  var formatFullTime = function (moment) {
    return moment.format($i18next.t('format.fullTime'));
  };

  var getDatetime = function (dateIso) {
    if (isValidDateIso(dateIso)) {
      return moment(dateIso).format($i18next.t('format.datetime'));
    }
  };

  var getDuration = function (alarm) {
    if (!Utilities.isEmpty(alarm)) {
      var duration = computeDuration(alarm);
      if (!Utilities.isNull(duration)) {
        return duration.asSeconds();
      }
    }
    return '';
  };

  var getFormattedDuration = function (duration) {
    var formattedDuration = numeral(duration).format('00:00:00');
    if (formattedDuration.length === 7) {
      formattedDuration = '0' + formattedDuration;
    }
    return formattedDuration;
  };

  var getMoment = function () {
    return moment();
  };

  var getTime = function (dateIso) {
    if (isValidDateIso(dateIso)) {
      return moment(dateIso).format($i18next.t('format.time'));
    }
  };

  var getToday = function () {
    return parseInt(moment().unix() + '000');
  }

  return {
    computeDuration: computeDuration,
    formatDate: formatDate,
    formatTime: formatTime,
    formatFullTime: formatFullTime,
    getDate: getDate,
    getDatetime: getDatetime,
    getDuration: getDuration,
    getFormattedDuration: getFormattedDuration,
    getMoment: getMoment,
    getTime: getTime,
    getToday: getToday,
    isValidDateIso: isValidDateIso,
    ONE_DAY_IN_MS: ONE_DAY_IN_MS
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').factory('Curves', ['$i18next', '$log', '$rootScope', '$q', '$timeout', 'DataAccessor', 'DateManager', 'Utilities',
function ($i18next, $log, $rootScope, $q, $timeout, DataAccessor, DateManager, Utilities) {

  var GREEN = '#84EF42';
  var RED = '#ff0000';
  var BLUE = '#0000ff';
  var LIGHT_BLUE = '#10B0F0';
  var BREAK_POINT = 1200;

  var timeoutId;
  var selectedProbeId = null;

  var isLandscape = function () {
    return (window.innerWidth > window.innerHeight);
  }

  var responsiveHeight = function () {
    var screenWidth = $(document).innerWidth();
    var screenHeight = $(window).height();
    if (isLandscape()) {
      if (screenWidth > BREAK_POINT) {
        return screenWidth / 6;
      } else {
        return screenWidth / 4;
      }
    } else {
      if (screenHeight > BREAK_POINT) {
        return screenHeight / 4;
      } else {
        return screenHeight / 2.5;
      }
    }
  };

  var generateTooltip = function (self, curveData) {
    var decimalFormat = new DecimalFormat("##.##");
    var unit = curveData.unit;
    var isTor = false;
    if (Utilities.isNull(unit) || unit == "null") {
      unit = "";
      isTor = true;
    }
    if (curveData.format) { //le format peut être du type +#0.0;-#0.0, donc split
      decimalFormat = new DecimalFormat(curveData.format.split(";")[0]);
    }
    var html;
    html = '<span>' + DateManager.getDatetime(self.x) + '</span>';
    html = html + '<table>';
    $.each(self.points, function () {
      html = html + '<tr>';
      if (this.series.name == $i18next.t('probeCurve.inAlarm')) {
        html = html + '<td style="align:left"><span style="color:' + this.series.color + '"><b>' + this.series.name + '</b></span></td><td></td>';
      } else if (this.series.name == $i18next.t('probeCurve.inProd')) {
        html = html + '<td style="align:left"><span style="color:#73C740"><b>' + $i18next.t('probeCurve.inProd') + '</b></span></td><td></td>';
      } else {
        if (isTor) {
          var val;
          if (this.y == 0) {
            val = "OFF";
          } else {
            val = "ON";
          }
          html = html + '<td style="text-align:left"><span style="color:' + this.series.color + '">' + this.series.name + ' :</td><td style="text-align:right;width:75%">' + val + '</td>';
        } else {
          html = html + '<td style="text-align:left"><span style="color:' + this.series.color + '">' + this.series.name + ' :</td><td style="text-align:right;width:75%">' + decimalFormat.format(this.y) + ' ' + unit + '</td>';
        }
      }
      html = html + '</tr>';
    });
    html = html + '</table>';
    return html;
  };

  var getLoopChartOptions = function (curveData) {
    var height = responsiveHeight();
    var width = $('.curves-container').innerWidth();
    return {
      chart: {
        height: height,
        resetZoomButton: {
          position: {
            x: -30,
            y: -10
          }
        },
        type: 'spline',
        zoomType: 'x',
        width: width
      },
      credits: { enabled: false },
      chartOptions: {
        plotOptions: {
          series: {
            dataLabels: {
              enabled: true
            }
          }
        }
      },
      title: { text: '' },
      xAxis: {
        dateTimeLabelFormats: {
          hour: $i18next.t('highcharts.hour')
        },
        type: 'datetime'
      },
      yAxis: [
        {
          alternateGridColor: null,
          gridLineWidth: 0,
          height: height - 98,
          id: 'valeurs',
          title: { text: curveData.unit }
        },
        {
          alternateGridColor: null,
          gridLineWidth: 0,
          height: 8,
          id: 'prod',
          labels: { enabled: false },
          lineColor: 'transparent',
          lineWidth: 0,
          max: 1,
          min: 0,
          minorGridLineWidth: 0,
          minorTickLength: 0,
          title: { text: null },
          tickLength: 0,
          top: height - 83
        },
        {
          alternateGridColor: null,
          gridLineWidth: 0,
          height: 8,
          id: 'alarme',
          labels: { enabled: false },
          lineColor: 'transparent',
          lineWidth: 0,
          max: 1,
          min: 0,
          minorGridLineWidth: 0,
          minorTickLength: 0,
          tickLength: 0,
          title: { text: null },
          top: height - 75
        }
      ],
      tooltip: {
        shared: true,
        useHTML: true,
        formatter: function () {
          return generateTooltip(this, curveData);
        }
      },
      plotOptions: {
        spline: {
          animation: false,
          lineWidth: 4,
          marker: {
            enabled: false,
            lineWidth: 0,
            states: {
              hover: {
                enabled: true,
                symbol: 'circle',
                radius: 5,
                lineWidth: 1
              }
            }
          },
          states: {
            hover: { lineWidth: 1 }
          }
        }
      },
      navigation: {
        menuItemStyle: { fontSize: '10px' }
      }
    };
  };

  var getLoopChartSeries = function (curveData) {
    if (curveData.highTh) {
      return [
        {
          name: $i18next.t('probeCurve.avg'),
          color: LIGHT_BLUE,
          yAxis: 'valeurs',
          lineWidth: 1,
          shadow: false,
          tooltip: { valueSuffix: curveData.unit },
          data: JSON.parse(JSON.stringify(curveData.avgVal))
        },
        {
          name: $i18next.t('probeCurve.highTh'),
          color: RED,
          yAxis: 'valeurs',
          lineWidth: 1,
          shadow: false,
          tooltip: { valueSuffix: curveData.unit },
          data: JSON.parse(JSON.stringify(curveData.highTh))
        },
        {
          name: $i18next.t('probeCurve.lowTh'),
          color: BLUE,
          yAxis: 'valeurs',
          lineWidth: 1,
          shadow: false,
          tooltip: { valueSuffix: curveData.unit },
          data: JSON.parse(JSON.stringify(curveData.lowTh))
        },
        {
          name: $i18next.t('probeCurve.inProd'),
          yAxis: 'prod',
          color: GREEN,
          lineWidth: 8,
          tooltip: { valueSuffix: '' },
          data: JSON.parse(JSON.stringify(curveData.inProd))
        },
        {
          name: $i18next.t('probeCurve.inAlarm'),
          yAxis: 'alarme',
          color: RED,
          lineWidth: 8,
          tooltip: { valueSuffix: '' },
          data: JSON.parse(JSON.stringify(curveData.alarm))
        }
      ];
    } else {
      return [
        {
          name: $i18next.t('probeCurve.avg'),
          color: LIGHT_BLUE,
          yAxis: 'valeurs',
          lineWidth: 1,
          shadow: false,
          data: JSON.parse(JSON.stringify(curveData.avgVal)),
          tooltip: { valueSuffix: curveData.unit },
        },
        {
          name: $i18next.t('probeCurve.inProd'),
          yAxis: 'prod',
          color: GREEN,
          lineWidth: 8,
          tooltip: { valueSuffix: '' },
          data: JSON.parse(JSON.stringify(curveData.inProd))
        },
        {
          name: $i18next.t('probeCurve.inAlarm'),
          yAxis: 'alarme',
          color: RED,
          lineWidth: 8,
          tooltip: { valueSuffix: '' },
          data: JSON.parse(JSON.stringify(curveData.alarm))
        }
      ];
    }
  };

  var initCurvesOptions = function () {
    return {
      chart: {
        type: 'line',
        height: responsiveHeight(),
        width: $('.curves-container').innerWidth()
      },
      credits: { enabled: false },
      global: { useUTC: false },
      exporting: { enabled: false },
      title: { text: '' },
      series: [],
      responsive: true,
      maintainAspectRatio: true
    };
  };

  var initCurves = function (scope) {
    Highcharts.setOptions({
      global: { useUTC: false },
      lang: {
        months: $i18next.t('highcharts.months').split(','),
        weekdays: $i18next.t('highcharts.weekdays').split(','),
        shortMonths: $i18next.t('highcharts.shortMonths').split(','),
        decimalPoint: $i18next.t('highcharts.decimalPoint'),
        printChart: $i18next.t('highcharts.printChart'),
        downloadPNG: $i18next.t('highcharts.downloadPNG'),
        downloadJPEG: $i18next.t('highcharts.downloadJPEG'),
        downloadPDF: $i18next.t('highcharts.downloadPDF'),
        downloadSVG: $i18next.t('highcharts.downloadSVG'),
        loading: $i18next.t('highcharts.loading'),
        contextButtonTitle: $i18next.t('highcharts.contextButtonTitle'),
        resetZoom: $i18next.t('highcharts.resetZoom'),
        resetZoomTitle: $i18next.t('highcharts.resetZoomTitle'),
        thousandsSep: $i18next.t('highcharts.thousandsSep'),
        noData: $i18next.t('highcharts.noData')
      }
    });

    scope.chart = initCurvesOptions();
    scope.loadingChart = true;
  };

  var parseData = function (data) {
    return JSON.parse(JSON.stringify(data));
  };

  var updateSeries = function (scope, data) {
    var series = angular.copy(scope.chart.series);

    series[0].data = parseData(data.avgVal);
    if (data.highTh) {
      series[1].data = parseData(data.highTh);
      series[2].data = parseData(data.lowTh);
      series[3].data = parseData(data.inProd);
      series[4].data = parseData(data.alarm);
    } else {
      series[1].data = parseData(data.inProd);
      series[2].data = parseData(data.alarm);
    }

    scope.chart.series = series;
  };

  var createCurves = function (scope) {
    var deferred = $q.defer();
    DataAccessor.recoverCurvesOfThumbnail(scope.selectedThumbnail).then(function (response) {
      if (!Array.isArray(response.data) && !angular.isUndefined(response.data)) {
        selectedProbeId = scope.selectedThumbnail.id;
        scope.chart = getLoopChartOptions(response.data);
        scope.chart.series = getLoopChartSeries(response.data);
        scope.loadingChart = false;
      } else {
        scope.displayGraph = false;
        scope.loadingChart = false;
        if (Utilities.naturalCancelRequest(response.status)) {
          scope.errorDetailsThumbnail = {
            icon: 'warning-sign',
            message: 'error.errorDetailsThumbnailGraph',
            hide: 'graph'
          };
        }
      }
      deferred.resolve();
    }, function (response) {
      scope.displayGraph = false;
      scope.loadingChart = false;
      if (Utilities.naturalCancelRequest(response.status)) {
        if (!scope.errorDetailsThumbnail) {
          scope.errorDetailsThumbnail = {
            icon: 'warning-sign',
            message: 'error.errorDetailsThumbnailGraph',
            hide: 'graph'
          };
        } else {
          scope.errorDetailsThumbnail.message = 'error.errorAllDetailsThumbnail';
        }
        $log.error('Unable to recover curves for thumbnail : ' + scope.selectedThumbnail.id + ' for create graph', response);
      }
      deferred.resolve();
    });
    return deferred.promise;
  };

  var updateCurves = function (scope) {
    var deferred = $q.defer();
    DataAccessor.recoverCurvesOfThumbnail(scope.selectedThumbnail).then(function (response) {
      $log.debug('Successfull recover loop data');
      updateSeries(scope, response.data);
      scope.loadingChart = false;
      deferred.resolve();
    }, function (response) {
      scope.displayGraph = false;
      scope.loadingChart = false;
      if (Utilities.naturalCancelRequest(response.status)) {
        if (!scope.errorDetailsThumbnail) {
          scope.errorDetailsThumbnail = {
            icon: 'warning-sign',
            message: 'error.errorDetailsThumbnailGraph',
            hide: 'graph'
          };
        } else {
          scope.errorDetailsThumbnail.message = 'error.errorAllDetailsThumbnail';
        }
        $log.error('Unable to recover curves for thumbnail : ' + scope.selectedThumbnail.id + ' for update graph', response);
      }
      deferred.resolve();
    });
    return deferred.promise;
  };

  var managesCurvesRealTime = function (scope) {
    if (Utilities.timeoutIsDefined(timeoutId)) {
      updateCurves(scope).then(function () {
        if (Utilities.timeoutIsDefined(timeoutId)) {
          $log.debug('Restart request update curves');
          timeoutId = $timeout(function () {
            managesCurvesRealTime(scope)
          }, $rootScope.intervalRefreshCurves);
        }
      });
    }
  };

  var stopManagesPreviousCurves = function () {
    if (timeoutId) {
      timeoutId = Utilities.cancelTimeout(timeoutId);
    }
  };

  var displayCurvesOfSelectedProbe = function (scope) {
    $log.debug('Init dislay curves of selected probe ' + scope.selectedThumbnail.id);
    createCurves(scope).then(function () {
      if (Utilities.timeoutIsDefined(timeoutId)) {
        $timeout(function () {
          managesCurvesRealTime(scope);
        }, $rootScope.intervalRefreshCurves);
      }
    });

    $(document).resize(function () {
      scope.myChart.setSize($(document).innerWidth() * 70 / 100, 350, false);
    });
  };

  var getSelectedProbeId = function () {
    return selectedProbeId;
  };

  return {
    getLoopChartOptions: getLoopChartOptions,
    getLoopChartSeries: getLoopChartSeries,
    initCurves: initCurves,
    createCurves: createCurves,
    updateCurves: updateCurves,
    managesCurvesRealTime: managesCurvesRealTime,
    stopManagesPreviousCurves: stopManagesPreviousCurves,
    getSelectedProbeId: getSelectedProbeId,
    displayCurvesOfSelectedProbe: displayCurvesOfSelectedProbe
  };

}]);

'use strict';

/**
 * @class DecimalFormat
 * @constructor
 * @param {String} formatStr
 * @author Oskan Savli
 */
function DecimalFormat(formatStr) {
  /**
   * @fieldOf DecimalFormat
   * @type String
   */
  this.prefix = '';
  /**
   * @fieldOf DecimalFormat
   * @type String
   */
  this.suffix = '';
  /**
   * @description Grouping size
   * @fieldOf DecimalFormat
   * @type String
   */
  this.comma = 0;
  /**
   * @description Minimum integer digits to be displayed
   * @fieldOf DecimalFormat
   * @type Number
   */
  this.minInt = 1;
  /**
   * @description Minimum fractional digits to be displayed
   * @fieldOf DecimalFormat
   * @type String
   */
  this.minFrac = 0;
  /**
   * @description Maximum fractional digits to be displayed
   * @fieldOf DecimalFormat
   * @type String
   */
  this.maxFrac = 0;

  // get prefix
  for (var i = 0; i < formatStr.length; i++) {
    if (formatStr.charAt(i) == '#' || formatStr.charAt(i) == '0') {
      this.prefix = formatStr.substring(0, i);
      formatStr = formatStr.substring(i);
      break;
    }
  }

  // get suffix
  this.suffix = formatStr.replace(/[#]|[0]|[,]|[.]/g, '');

  // get number as string
  var numberStr = formatStr.replace(/[^0#,.]/g, '');

  var intStr = '';
  var fracStr = '';
  var point = numberStr.indexOf('.');
  if (point != -1) {
    intStr = numberStr.substring(0, point);
    fracStr = numberStr.substring(point + 1);
  } else {
    intStr = numberStr;
  }

  var commaPos = intStr.lastIndexOf(',');
  if (commaPos != -1) {
    this.comma = intStr.length - 1 - commaPos;
  }

  intStr = intStr.replace(/[,]/g, ''); // remove commas

  fracStr = fracStr.replace(/[,]|[.]+/g, '');

  this.maxFrac = fracStr.length;
  var tmp = intStr.replace(/[^0]/g, ''); // remove all except zero
  if (tmp.length > this.minInt) {
    this.minInt = tmp.length;
  }
  tmp = fracStr.replace(/[^0]/g, '');
  this.minFrac = tmp.length;
}

/**
 * @description Formats given value
 * @methodOf DecimalFormat
 * @param {String} numberStr
 * @return {String} Formatted number
 * @author Oskan Savli
 */
DecimalFormat.prototype.format = function(numStr) { // 1223.06 --> $1,223.06
  // remove prefix, suffix and commas
  var numberStr = this.formatBack(numStr).toLowerCase();

  // do not format if not a number
  if (isNaN(numberStr) || numberStr.length == 0)
    return numStr;

  //scientific numbers
  if (i = numberStr.indexOf("e") != -1) {
    var n = Number(numberStr);
    if (n == "Infinity" || n == "-Infinity") { return numberStr;}
    numberStr = n + "";
    if (numberStr.indexOf('e') != -1) { return numberStr;}
  }

  var negative = false;
  // remove sign
  if (numberStr.charAt(0) == '-') {
    negative = true;
    numberStr = numberStr.substring(1);
  } else if (numberStr.charAt(0) == '+') {
    numberStr = numberStr.substring(1);
  }

  var point = numberStr.indexOf('.'); // position of point character
  var intStr = '';
  var fracStr = '';
  if (point != -1) {
    intStr = numberStr.substring(0, point);
    fracStr = numberStr.substring(point + 1);
  } else {
    intStr = numberStr;
  }
  fracStr = fracStr.replace(/[.]/, ''); // remove other point characters

  var isPercentage = this.suffix && this.suffix.charAt(0) === '%';
  // if percentage, number will be multiplied by 100.
  var minInt = this.minInt,
    minFrac = this.minFrac,
    maxFrac = this.maxFrac;
  if (isPercentage) {
    minInt -= 2;
    minFrac += 2;
    maxFrac += 2;
  }

  if (fracStr.length > maxFrac) { // round
    //case 6143
    var num = new Number('0.' + fracStr);
    num = (maxFrac == 0) ? Math.round(num) : num.toFixed(maxFrac);
    // toFixed method has bugs on IE (0.7 --> 0)
    fracStr = num.toString(10).substr(2);
    var c = (num >= 1) ? 1 : 0; //carry
    var x, i = intStr.length - 1;
    while (c) { //increment intStr
      if (i == -1) {
        intStr = '1' + intStr;
        break;
      } else {
        x = intStr.charAt(i);
        if (x == 9) {
          x = '0';
          c = 1;
        } else {
          x = (++x) + '';
          c = 0;
        }
        intStr = intStr.substring(0, i) + x + intStr.substring(i + 1, intStr.length);
        i--;
      }
    }
  }
  for (var i = fracStr.length; i < minFrac; i++) { // if minFrac=4 then 1.12 --> 1.1200
    fracStr = fracStr + '0';
  }
  while (fracStr.length > minFrac && fracStr.charAt(fracStr.length - 1) == '0') { // if minInt=4 then 00034 --> 0034)
    fracStr = fracStr.substring(0, fracStr.length - 1);
  }

  for (var i = intStr.length; i < minInt; i++) { // if minInt=4 then 034 --> 0034
    intStr = '0' + intStr;
  }
  while (intStr.length > minInt && intStr.charAt(0) == '0') { // if minInt=4 then 00034 --> 0034)
    intStr = intStr.substring(1);
  }

  if (isPercentage) { // multiply by 100
    intStr += fracStr.substring(0, 2);
    fracStr = fracStr.substring(2);
  }

  var j = 0;
  for (var i = intStr.length; i > 0; i--) { // add commas
    if (j != 0 && j % this.comma == 0) {
      intStr = intStr.substring(0, i) + ',' + intStr.substring(i);
      j = 0;
    }
    j++;
  }

  var formattedValue;
  if (fracStr.length > 0)
    formattedValue = this.prefix + intStr + '.' + fracStr + this.suffix;
  else
    formattedValue = this.prefix + intStr + this.suffix;

  if (negative) {
    //Ajout APE je ne veux pas de -+valeur dans le format
    if (formattedValue.indexOf("+") != -1)
      formattedValue = formattedValue.replace("+", "");
    formattedValue = '-' + formattedValue;
  }
  return formattedValue;
};


/**
 * @description Converts formatted value back to non-formatted value
 * @methodOf DecimalFormat
 * @param {String} fNumberStr Formatted number
 * @return {String} Original number
 * @author Oskan Savli
 */
DecimalFormat.prototype.formatBack = function(fNumStr) { // $1,223.06 --> 1223.06
  fNumStr += ''; //ensure it is string
  if (!fNumStr) return ''; //do not return undefined or null
  if (!isNaN(fNumStr)) return this.getNumericString(fNumStr);
  var fNumberStr = fNumStr;
  var negative = false;
  if (fNumStr.charAt(0) == '-') {
    fNumberStr = fNumberStr.substr(1);
    negative = true;
  }
  var pIndex = fNumberStr.indexOf(this.prefix);
  var sIndex = (this.suffix == '') ? fNumberStr.length : fNumberStr.indexOf(this.suffix, this.prefix.length + 1);
  if (pIndex == 0 && sIndex > 0) {
    // remove suffix
    fNumberStr = fNumberStr.substr(0, sIndex);
    // remove prefix
    fNumberStr = fNumberStr.substr(this.prefix.length);
    // remove commas
    fNumberStr = fNumberStr.replace(/,/g, '');
    if (negative)
      fNumberStr = '-' + fNumberStr;
    if (!isNaN(fNumberStr))
      return this.getNumericString(fNumberStr);
  }
  return fNumStr;
};
/**
 * @description We shouldn't return strings like 1.000 in formatBack method.
 * However, using only Number(str) is not enough, because it omits . in big numbers
 * like 23423423423342234.34 => 23423423423342236 . There's a conflict in cases
 * 6143 and 6541.
 * @methodOf DecimalFormat
 * @param {String} str Numberic string
 * @return {String} Corrected numeric string
 * @author Serdar Bicer
 */
DecimalFormat.prototype.getNumericString = function(str) {
  //first convert to number
  var num = new Number(str);
  //check if there is a missing dot
  var numStr = num + '';
  if (str.indexOf('.') > -1 && numStr.indexOf('.') < 0) {
    //check if original string has all zeros after dot or not
    for (var i = str.indexOf('.') + 1; i < str.length; i++) {
      //if not, this means we lost precision
      if (str.charAt(i) !== '0') { return str;}
    }
    return numStr;
  }
  return str;
};

'use strict';

angular.module('ivtracerOverviewPanel').component('spinner', {
  templateUrl: 'views/commons/components/spinner.html'
});

'use strict';

angular.module('ivtracerOverviewPanel').component('typeIcon', {
  bindings: {
    type: '=',
    color: '='
  },
  templateUrl: 'views/commons/components/type-icon.html'
});

'use strict';

angular.module('ivtracerOverviewPanel').component('stateIcon', {
  bindings: {
    type: '<',
    color: '<'
  },
  templateUrl: 'views/commons/components/state-icon.html'
});

'use strict';

angular.module('ivtracerOverviewPanel').filter('makeDatetime', function (DateManager) {
  return function (dateIso) {
    if (dateIso) {
      return DateManager.getDatetime(dateIso);
    }
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').filter('makeDuration', ['DateManager', 'Utilities', function (DateManager, Utilities) {
  return function (alarm) {
    if (!Utilities.isEmpty(alarm) && typeof alarm === 'object') {
      alarm.duration = DateManager.getDuration(alarm);
      return alarm.duration;
    }
  };
}]);

'use strict';

angular.module('ivtracerOverviewPanel').filter('makeFormattedDuration', ['DateManager', function (DateManager) {
  return function (duration) {
    if (duration && typeof duration === 'number') {
      return DateManager.getFormattedDuration(duration);
    }
  };
}]);

'use strict';

angular.module('ivtracerOverviewPanel').filter('makeTime', function (DateManager) {
  return function (timestamp) {
    if (timestamp) {
      return DateManager.getTime(timestamp);
    }
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').controller('HubCtrl', function () {});

'use strict';

angular.module('ivtracerOverviewPanel').directive('listThumbnails', ['$filter', '$log', '$q', '$rootScope', '$timeout', 'DataAccessor', 'DataManager', 'DateManager', 'Utilities',
function ($filter, $log, $q, $rootScope, $timeout, DataAccessor, DataManager, DateManager, Utilities) {
  return {
    restrict: 'E',
    templateUrl: 'views/hub/list-thumbnails.html',
    link: function (scope) {

      var originalList = [], originalInfo, intervalRefreshThumbnails, intervalTestReconnection;
      scope.thumbnails = [];
      DataManager.register('thumbnail', scope.thumbnails);

      var generateServerError = function () {
        var date = DateManager.getMoment();

        if (Utilities.isEmpty($rootScope.serverError)) {
          $rootScope.serverError = {
            date: DateManager.formatDate(date),
            time: DateManager.formatFullTime(date)
          }
        }
      };

      var processThumbnails = function () {
        scope.thumbnails = originalList;
        scope.overviewPanel = originalInfo;

        if (scope.selectedThumbnail) {
          angular.forEach(scope.thumbnails, function (thumbnail) {
            if (scope.selectedThumbnail.id === thumbnail.id) {
              thumbnail.selected = true;
              scope.selectThumbnail(thumbnail);
            }
          });
        }

      };

      var recoverThumbnails = function () {
        var deferred = $q.defer();
        $log.debug('Start recover thumbnails');
        DataAccessor.recoverThumbnailsOfPremise().then(function (response) {
          scope.mainLoading = false;
          scope.errorRecoverThumbnails = false;
          $rootScope.unreachableServer = false;
          $rootScope.serverError = null;

          $rootScope.noDataDisplayedDueToConfigurationOrIVTracerServerConnection = Utilities.isEmpty(response.data.thumbnails);

          originalList = [];
          originalInfo = response.data.info;
          Array.prototype.push.apply(originalList, response.data.thumbnails);

          deferred.resolve();
        }, function (response) {
          scope.overviewPanel = [];
          if (scope.mainLoading) {
            $rootScope.unreachableServer = true;
          }

          $log.error('Unable to recover thumbnails', response);
          scope.mainLoading = false;
          scope.errorRecoverThumbnails = true;
          $rootScope.noDataDisplayedDueToConfigurationOrIVTracerServerConnection = false;
          generateServerError();
          deferred.reject(response.status);
        });
        return deferred.promise;
      };

      scope.loadThumbnails = function () {
        var promises = [];
        var thumbnails = recoverThumbnails();
        promises.push(thumbnails);

        $q.all(promises).then(function () {
          processThumbnails();
          if (Utilities.timeoutIsDefined(intervalRefreshThumbnails)) {
            intervalRefreshThumbnails = Utilities.cancelTimeout(intervalRefreshThumbnails);
            intervalRefreshThumbnails = $timeout(scope.loadThumbnails, $rootScope.intervalRefreshThumbnails);
          }
        }, function () {
          if (Utilities.naturalCancelRequest(promises[0].value)) {
            $log.error('Unable to load thumbnails');
          }
          intervalTestReconnection = Utilities.cancelTimeout(intervalTestReconnection);
          intervalTestReconnection = $timeout(scope.loadThumbnails, $rootScope.intervalRefreshReconnection);
        });
      };

      scope.mainLoading = true;
      scope.detailsPanelOpened = false;
      scope.loadThumbnails();

      scope.$on('$destroy', function () {
        $log.log('Destroy interval resfresh thumbnails');
        intervalRefreshThumbnails = Utilities.cancelTimeout(intervalRefreshThumbnails);
      });

    }
  };
}]);

'use strict';

angular.module('ivtracerOverviewPanel').component('thumbnail', {
  bindings: {
    thumbnail: '='
  },
  templateUrl: 'views/hub/thumbnail.html'
});

'use strict';

angular.module('ivtracerOverviewPanel').directive('detailsPanel', ['$interval', '$log', '$q', '$rootScope', '$timeout', 'Curves', 'DataAccessor', 'DataManager', 'HttpPendingRequests', 'Utilities',
function ($interval, $log, $q, $rootScope, $timeout, Curves, DataAccessor, DataManager, HttpPendingRequests, Utilities) {
  return {
    restrict: 'E',
    templateUrl: 'views/detailsPanel/details-panel.html',
    link: function (scope) {

      var intervalRefreshDetailsThumbnail, intervalRefreshReconnectionDetails, intervalRefreshAlarmsDuration;

      var reflow = function () {
        void($(window).offsetHeight);
      };

      var initDisplayCurves = function () {
        scope.displayGraph = false;
        Curves.initCurves(scope);

        $timeout(function () {
          Curves.displayCurvesOfSelectedProbe(scope);
          scope.displayGraph = true;
        }, 550);
      };

      var computeTitleForAlarmsTable = function () {
        var alarmsOfThumbnails = scope.detailsThumbnail.alarms;
        scope.nbAlarmsToBeAck = DataManager.computeListAlarmsToBeAck(alarmsOfThumbnails).length;
        scope.nbAlarmsDuringLast24Hours = DataManager.computeNbAlarmsDuringLast24Hours(alarmsOfThumbnails);
      };

      var deselectAllThumbnails = function (thumbnails) {
        scope.displaySeparetedSelectedThumbnail = false;
        var listThumbnailsDeselected = DataManager.deselectAllThumbnails(thumbnails);
        if (listThumbnailsDeselected !== -1) {
          return listThumbnailsDeselected;
        } else {
          $log.error('Invalid list thumbnails', thumbnails);
          return [];
        }
      };

      var recoverDetailsOfThumbnail = function (thumbnail) {
        var deferred = $q.defer();
        $log.debug('Start recover details of thumbnail ' + thumbnail.id);

        DataAccessor.recoverDetailsOfThumbnail(thumbnail).then(function (response) {
          if (!angular.equals(scope.detailsThumbnail, response.data)) {
            scope.detailsThumbnail = response.data;
          }
          scope.errorDetailsThumbnail = null;
          scope.loadingDetailsThumbnail = false;
          deferred.resolve();
        }, function (response) {
          scope.detailsThumbnail = null;
          if (Utilities.naturalCancelRequest(response.status)) {
            scope.loadingDetailsThumbnail = false;
            scope.errorDetailsThumbnail = {
              icon: 'warning-sign',
              message: 'error.errorDetailsThumbnail',
              hide: 'details'
            };
            $log.error('Unable to recover details of thumbnail ' + thumbnail.id, response);
            deferred.reject(response.status);
          } else {
            deferred.reject(-1);
          }
        });
        return deferred.promise;
      };

      var loadDetailsOfThumbnail = function (thumbnail) {
        var promises = [];

        if (thumbnail.id === scope.selectedThumbnail.id) {
          var detailsThumbnail = recoverDetailsOfThumbnail(thumbnail);
          promises.push(detailsThumbnail);

          $q.all(promises).then(function () {
            computeTitleForAlarmsTable();
            scope.showPrealarmQualityParams = DataManager.displayQualityParametersOfTypeIfExist(scope.detailsThumbnail.qualityParameters, 'prealarm');

            $log.debug('Start refresh details of thumbnail', thumbnail);
            intervalRefreshDetailsThumbnail = $timeout(function () {
              loadDetailsOfThumbnail(thumbnail);
              scope.displaySeparetedSelectedThumbnail = DataManager.verifyThumbnailNotExistInListPriorityThumbnails(scope.thumbnails, scope.selectedThumbnail);
              scope.priorityThumbnailsList = DataManager.computePriorityThumbnailsList(scope.thumbnails);
            }, $rootScope.intervalRefreshThumbnails);
          }, function (result) {
            if (Utilities.naturalCancelRequest(result)) {
              $log.debug('Unable to load details of thumbnail', thumbnail);
              intervalRefreshReconnectionDetails = Utilities.cancelTimeout(intervalRefreshReconnectionDetails);
              intervalRefreshReconnectionDetails = $timeout(function () {
                Curves.stopManagesPreviousCurves();
                initDisplayCurves();
                loadDetailsOfThumbnail(thumbnail);
              }, $rootScope.intervalRefreshReconnection);
            }
          });
        }
      };

      scope.selectThumbnail = function (thumbnail) {
        reflow();
        scope.thumbnails = deselectAllThumbnails(scope.thumbnails);
        intervalRefreshAlarmsDuration = $interval.cancel(intervalRefreshAlarmsDuration);

        if (scope.selectedThumbnail && thumbnail.id !== scope.selectedThumbnail.id) {
          HttpPendingRequests.cancelAll();
          scope.clearFormAuth();
          scope.formAuthStatus = '';
          scope.detailsThumbnail = null;
          scope.loadingDetailsThumbnail = true;
        }

        if (!scope.detailsPanelOpened || thumbnail.id !== scope.selectedThumbnail.id) {
          initDisplayCurves();
        }

        scope.onlyPriority = true;
        scope.detailsPanelOpened = true;

        if (!scope.selectedThumbnail || thumbnail.id !== scope.selectedThumbnail.id) {
          scope.selectedThumbnail = thumbnail;
          scope.loadingDetailsThumbnail = true;
          loadDetailsOfThumbnail(scope.selectedThumbnail);
        }

        intervalRefreshAlarmsDuration = $interval(function () {}, 1000);

        scope.selectedThumbnail = thumbnail;
        scope.selectedThumbnail.selected = true;
        scope.displaySeparetedSelectedThumbnail = DataManager.verifyThumbnailNotExistInListPriorityThumbnails(scope.thumbnails, scope.selectedThumbnail);
        scope.priorityThumbnailsList = DataManager.computePriorityThumbnailsList(scope.thumbnails);
      };

      scope.closeDetailsPanel = function () {
        $log.log('Destroy all resfresh intervals');
        reflow();
        intervalRefreshDetailsThumbnail = Utilities.cancelTimeout(intervalRefreshDetailsThumbnail);
        intervalRefreshAlarmsDuration = $interval.cancel(intervalRefreshAlarmsDuration);
        intervalRefreshAlarmsDuration = null;
        Curves.stopManagesPreviousCurves();
        HttpPendingRequests.cancelAll();
        scope.clearFormAuth();
        scope.thumbnails = deselectAllThumbnails(scope.thumbnails);
        scope.priorityThumbnailsList = undefined;
        scope.onlyPriority = false;
        scope.detailsPanelOpened = false;
        scope.selectedThumbnail = undefined;
        scope.loadThumbnails();
      };
    }
  };
}]);

'use strict';

angular.module('ivtracerOverviewPanel').directive('detailsPanelHeader', function () {
  return {
    restrict: 'E',
    templateUrl: 'views/detailsPanel/details-panel-header.html'
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').directive('tableAlarms', function () {
  return {
    restrict: 'E',
    templateUrl: 'views/detailsPanel/table-alarms.html'
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').directive('formAuth', function ($rootScope, $timeout, $log, $i18next, DataAccessor) {
  return {
    restrict: 'E',
    templateUrl: 'views/detailsPanel/form-auth.html',
    link: function (scope) {

      scope.comment = '';

      var managesAcknowledgmentReturn = function (probe, response) {
        switch (response.data[0].code) {
          case 0:
            $log.log('Sucessfull ack probe ' + probe.id);
            scope.formAuthStatus = {
              status: response.status,
              icon: 'ok',
              type: 'success',
              message: $i18next.t('formAuth.ackSuccess', { count: scope.nbAlarmsToBeAck })
            };
            scope.clearFormAuth();
            break;

          case 2:
            $log.log('Invalide identification, unable ack probe ' + probe.id, response);
            scope.formAuthStatus = {
              status: 401,
              icon: 'exclamation-sign',
              type: 'danger',
              message: $i18next.t('formAuth.invalidIdentification')
            };
            scope.password = null;
            break;

          case 6:
            $log.error('User unable to ack alarms', response);
            scope.formAuthStatus = {
              status: 403,
              icon: 'exclamation-sign',
              type: 'danger',
              message: $i18next.t('formAuth.userUnableAck')
            };
            scope.clearFormAuth();
            break;
          default:
            $log.error('Unable to ack alarms', response);
            scope.formAuthStatus = {
              status: 400,
              icon: 'exclamation-sign',
              type: 'danger',
              message: $i18next.t('formAuth.unableAck')
            };
            scope.clearFormAuth();
        }
      }

      scope.openDropdonwPredefinedComments = function () {
        $('#comment').focus();
      };

      scope.updateComment = function (comment) {
        scope.comment = comment;
      };

      scope.clearFormAuth = function () {
        scope.identifier = null;
        scope.password = null;
        scope.comment = '';
      };

      scope.ackAlarms = function (probe) {
        if (scope.formAuth.$valid && probe.alarms.length > 0) {
          var formData = {
            userId: scope.identifier,
            psw: scope.password,
            comment: scope.comment,
            probesIds: probe.id
          };

          DataAccessor.ackAlarms(formData).then(function (response) {
            if (response.data) {
              managesAcknowledgmentReturn(probe, response);
            }
          }, function (response) {
            $log.error('Unable to ack alarms', response);
            scope.formAuthStatus = {
              status: response.status,
              icon: 'exclamation-sign',
              type: 'danger',
              message: $i18next.t('formAuth.ackError')
            };
            scope.clearFormAuth();
          });

          $timeout(function () {
            scope.formAuthStatus = null;
          }, $rootScope.intervalRefreshThumbnails);

        }
      };

    }
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').directive('qualityParameters', function () {
  return {
    restrict: 'E',
    templateUrl: 'views/detailsPanel/quality-parameters.html'
  };
});

'use strict';

angular.module('ivtracerOverviewPanel').constant('config', {
  'endPointApi': '/cockpit/api',
  'endPointSocketIo': 'http://localhost:3200/api',
  'intervalRefreshThumbnails': 5000,
  'intervalRefreshCurves': 30000,
  'intervalRefreshReconnection': 5000,
  'locale': 'fr'
});

angular.module('ivtracerOverviewPanel').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/detailsPanel/details-panel-header.html',
    "<div class=\"details-panel-header {{selectedThumbnail.states}} container-fluid\" ng-style=\"{'background': detailsThumbnail.bgColor}\"> <span class=\"glyphicon details-panel-close-icon\" ng-click=\"closeDetailsPanel()\" title=\"{{'closePanel' | i18next}}\">&times;</span> <div class=\"row\" ng-hide=\"loadingDetailsThumbnail\" ng-style=\"{'border-bottom': detailsThumbnail.bgColor ? '1px solid ' + detailsThumbnail.bgColor : ''}\"> <div class=\"col-xs-1 col-sm-1 col-md-1 details-panel-type-icon\"> <type-icon type=\"selectedThumbnail.type\" color=\"selectedThumbnail.style.typeColor\"></type-icon> </div> <div class=\"col-xs-11 col-sm-11 col-md-11 container-fluid details-panel-header-content\"> <div class=\"row first-line\"> <div class=\"col-xs-7 col-sm-7 col-md-7\"> <h1 class=\"thumbnail-name {{selectedThumbnail.style.fontStyle}}\"> {{selectedThumbnail.name}} <span class=\"production-mode prod\"> ({{'productionMode.prod' | i18next}})</span> <span class=\"production-mode qai\"> ({{'productionMode.qai' | i18next}})</span> <span class=\"production-mode qaa\"> ({{'productionMode.qaa' | i18next}})</span> <span class=\"production-mode hs\"> ({{'productionMode.hs' | i18next}})</span> </h1> </div> <div class=\"col-xs-5 col-sm-5 col-md-5\"> <h1 class=\"thumbnail-value text-right {{selectedThumbnail.style.fontStyle}}\">{{selectedThumbnail.value}} {{selectedThumbnail.unit}}</h1> </div> </div> <div class=\"row second-line\"> <div class=\"col-xs-5 col-sm-5 col-md-4\"> <p>{{detailsThumbnail.location}}</p> </div> <div class=\"col-xs-7 col-sm-7 col-md-8 text-right\"> <div class=\"thumbnail-state-container\"> <span class=\"thumbnail-label-state alarm {{selectedThumbnail.style.fontStyle}}\">{{'alarm' | i18next}} {{'inProgress' | i18next}}</span> <span class=\"thumbnail-label-state alarm high {{selectedThumbnail.style.fontStyle}}\">{{'highAlarm' | i18next}}</span> <span class=\"thumbnail-label-state alarm low {{selectedThumbnail.style.fontStyle}}\">{{'lowAlarm' | i18next}}</span> <span class=\"thumbnail-label-state prealarm {{selectedThumbnail.style.fontStyle}}\">{{'prealarm' | i18next}} {{'inProgress' | i18next}}</span> <span class=\"thumbnail-label-state prealarm high {{selectedThumbnail.style.fontStyle}}\">{{'highPrealarm' | i18next}}</span> <span class=\"thumbnail-label-state prealarm low {{selectedThumbnail.style.fontStyle}}\">{{'lowPrealarm' | i18next}}</span> <span class=\"thumbnail-label-state offline {{selectedThumbnail.style.fontStyle}}\">{{'offline' | i18next}}</span> <span class=\"thumbnail-label-state room-out-of-prod {{selectedThumbnail.style.fontStyle}}\">{{'roomOutOfProd' | i18next}}</span> <span class=\"thumbnail-label-state ok {{selectedThumbnail.style.fontStyle}}\">{{'noAlarm' | i18next}}</span> <state-icon class=\"thumbnail-icon-state\"></state-icon> </div> </div> </div> </div> </div> </div> "
  );


  $templateCache.put('views/detailsPanel/details-panel.html',
    "<div class=\"details-panel\" ng-class=\"detailsPanelOpened ? 'details-panel-show' : 'details-panel-hidden'\"> <div> <details-panel-header></details-panel-header> <div ng-hide=\"loadingDetailsThumbnail\" class=\"details-panel-content container-fluid\"> <div ng-if=\"errorDetailsThumbnail\" class=\"alert alert-danger\"> <span class=\"glyphicon glyphicon-{{errorDetailsThumbnail.icon}}\"></span> {{'error.errorToRecover' | i18next}} {{errorDetailsThumbnail.message | i18next}} </div> <div ng-show=\"detailsThumbnail.alarms.length !== 0 || detailsThumbnail.qualityParameters.length !== 0\" ng-hide=\"errorDetailsThumbnail.hide === 'details'\" class=\"row\"> <div class=\"col-md-7 col-lg-8 alarms-not-ack-container\"> <table-alarms></table-alarms> <form-auth></form-auth> </div> <div class=\"col-md-5 col-lg-4 quality-parameters-container\"> <quality-parameters></quality-parameters> </div> </div> <div ng-if=\"displayGraph\" class=\"curves-container\"> <p ng-if=\"loadingChart\" class=\"loading-chart\">{{'highcharts.loading' | i18next}}</p> <highchart ng-if=\"!loadingChart\" config=\"chart\"></highchart> </div> </div> </div> <spinner ng-show=\"loadingDetailsThumbnail\"></spinner> </div> "
  );


  $templateCache.put('views/detailsPanel/form-auth.html',
    "<div class=\"form-auth\"> <div ng-show=\"formAuthStatus\" class=\"alert alert-{{formAuthStatus.type}}\" role=\"alert\"> <button type=\"button\" class=\"close\" data-dismiss=\"alert\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <p><span class=\"glyphicon glyphicon-{{formAuthStatus.icon}}\"></span> {{formAuthStatus.message}}</p> </div> <form name=\"formAuth\" ng-submit=\"ackAlarms(detailsThumbnail)\" ng-show=\"nbAlarmsToBeAck > 0 && formAuthStatus.status !== 200\" class=\"form-horizontal\"> <div class=\"form-group\"> <label class=\"control-label col-sm-2 col-md-3 col-lg-2\" for=\"identifier\">{{'formAuth.identifier' | i18next}}</label> <div class=\"col-sm-3 col-md-5\"> <input type=\"text\" ng-model=\"identifier\" id=\"identifier\" class=\"form-control\" placeholder=\"{{'formAuth.identifier' | i18next}}\" required> </div> </div> <div class=\"form-group\"> <label class=\"control-label col-sm-2 col-md-3 col-lg-2\" for=\"password\">{{'formAuth.password' | i18next}}</label> <div class=\"col-sm-3 col-md-5\"> <input type=\"password\" ng-model=\"password\" id=\"password\" class=\"form-control\" placeholder=\"{{'formAuth.password' | i18next}}\" required> </div> </div> <div class=\"form-group\"> <label class=\"control-label col-sm-2 col-md-3 col-lg-2\" for=\"comment\">{{'formAuth.comment' | i18next}}</label> <div class=\"col-sm-8 col-md-9\"> <div ng-class=\"predefinedComments !== null ? 'input-group': ''\"> <input type=\"text\" ng-model=\"comment\" id=\"comment\" class=\"form-control\" ng-minlength=\"5\" autocomplete=\"off\" placeholder=\"{{'formAuth.comment' | i18next}}\" uib-typeahead=\"predefinedComment for predefinedComment in ::predefinedComments | filter:$viewValue\" typeahead-min-length=\"0\" required> <div ng-show=\"predefinedComments\" id=\"signedActionCommentShowAll\" class=\"dropdown dropdown-comments add-on input-group-btn\"> <a class=\"dropdown-toggle btn btn-default\" data-toggle=\"dropdown\" href=\"#\" target=\"_self\" ng-click=\"openDropdonwPredefinedComments()\"> <span class=\"glyphicon glyphicon-option-horizontal\"></span> </a> </div> </div> </div> </div> <div class=\"form-group\"> <div class=\"col-sm-4 col-md-4 col-sm-offset-2 col-md-offset-3 col-lg-offset-2\"> <button type=\"submit\" class=\"btn btn-ack\" ng-disabled=\"formAuth.$invalid\">{{'actions.ack' | i18next | uppercase}}</button> </div> </div> </form> </div> "
  );


  $templateCache.put('views/detailsPanel/quality-parameters.html',
    "<h4 ng-show=\"detailsThumbnail.qualityParameters\" class=\"text-uppercase bold\"> {{'qualityParameters.qualityParameters' | i18next}} (<span ng-class=\"{'provisional-quality-parameters': detailsThumbnail.qualificationMode}\">{{'qualityParameters.' + (detailsThumbnail.qualificationMode ? 'provisional' : 'validated') | i18next}}</span>) </h4> <div ng-show=\"detailsThumbnail.qualityParameters\" class=\"quality-parameters\"> <div class=\"row separator\"> <div class=\"text-right bold no-padding\" ng-class=\"showPrealarmQualityParams ? 'col-xs-3 col-sm-3 col-md-3 col-xs-offset-5 col-sm-offset-5 col-md-offset-5' : 'col-xs-5 col-sm-5 col-md-5 col-xs-offset-6 col-sm-offset-6 col-md-offset-6'\"> {{'alarm' | i18next | uppercase}} </div> <div class=\"col-xs-4 col-sm-4 col-md-4 text-right bold\" ng-if=\"showPrealarmQualityParams\"> {{'prealarm' | i18next | uppercase}} </div> </div> <div class=\"row\" ng-class=\"{'separator': $index === 2 || $index >= 5}\" ng-repeat=\"parameter in detailsThumbnail.qualityParameters track by $index\"> <div class=\"col-xs-5 col-sm-5 col-md-5 parameter-label\"> <p>{{'qualityParameters.' + parameter.key | i18next}}</p> </div> <div class=\"text-right no-padding\" ng-class=\"showPrealarmQualityParams ? 'col-xs-3 col-sm-3 col-md-3' : 'col-xs-5 col-sm-5 col-md-6'\"> <p class=\"parameter-value\" ng-class=\"{'provisional-parameter': parameter.tooltip }\" tooltip-placement=\"left\" tooltip-enable=\"parameter.tooltip\" uib-tooltip=\"{{'validatedValue' | i18next}} {{parameter.tooltip}} {{parameter.unit}}\"> {{parameter.alarm | i18next}} <span ng-if=\"parameter.alarm\">{{parameter.unit}}</span> </p> </div> <div class=\"col-xs-4 col-sm-4 col-md-4 text-right\" ng-if=\"showPrealarmQualityParams\"> <p class=\"parameter-value\">{{parameter.prealarm | i18next}} <span ng-if=\"parameter.prealarm\">{{parameter.unit}}</span></p> </div> </div> </div> "
  );


  $templateCache.put('views/detailsPanel/table-alarms.html',
    "<div class=\"table-alarms\"> <h4 class=\"text-uppercase bold\"> <span ng-i18next=\"[i18next]({ count: nbAlarmsDuringLast24Hours})alarmDuringTheLast24Hours\"></span> <span ng-if=\"nbAlarmsToBeAck > 0\"> - </span> <span ng-if=\"nbAlarmsToBeAck > 0\" ng-i18next=\"[i18next]({ count: nbAlarmsToBeAck})alarmToBeAck\"></span> </h4> <table ng-show=\"detailsThumbnail.alarms.length > 0\" class=\"table table-responsive table-fixed\"> <thead> <th>{{'tableHeader.begin' | i18next}}</th> <th>{{'tableHeader.ack' | i18next}}</th> <th>{{'tableHeader.end' | i18next}}</th> <th class=\"text-center\">{{'tableHeader.duration' | i18next}}</th> <th>{{'tableHeader.text' | i18next}}</th> <th></th> </thead> <tbody> <tr ng-repeat=\"alarm in detailsThumbnail.alarms track by $index\"> <td class=\"{{!alarm.end ? alarm.preAlarm ? 'prealarm' : 'alarm' : ''}}\" ng-class=\"{'notack': !alarm.ack && alarm.end, 'bold': !alarm.end}\"> {{alarm.begin | makeDatetime}} </td> <td class=\"{{!alarm.end ? alarm.preAlarm ? 'prealarm' : 'alarm' : ''}}\" ng-class=\"{'notack': !alarm.ack && alarm.end, 'bold': !alarm.end}\"> {{alarm.ack | makeDatetime}} </td> <td class=\"{{!alarm.end ? alarm.preAlarm ? 'prealarm' : 'alarm' : ''}}\" ng-class=\"{'notack': !alarm.ack && alarm.end, 'bold': !alarm.end}\"> {{alarm.end | makeDatetime}} </td> <td class=\"alarm-duration text-right {{!alarm.end ? alarm.preAlarm ? 'prealarm' : 'alarm' : ''}}\" ng-class=\"{'notack': !alarm.ack && alarm.end, 'bold': !alarm.end}\"> {{alarm | makeDuration | makeFormattedDuration}} </td> <td class=\"{{!alarm.end ? alarm.preAlarm ? 'prealarm' : 'alarm' : ''}}\" ng-class=\"{'notack': !alarm.ack && alarm.end, 'bold': !alarm.end}\"> {{alarm.text}} </td> <td class=\"{{!alarm.end ? alarm.preAlarm ? 'prealarm' : 'alarm' : ''}}\" ng-class=\"{'notack': !alarm.ack && alarm.end, 'bold': !alarm.end}\"> <state-icon class=\"state-icon-element {{alarm.preAlarm ? 'prealarm' : 'alarm'}}\" ng-class=\"{'blink': !alarm.ack, 'high': alarm.type.indexOf('HIGH') > -1, 'low': alarm.type.indexOf('LOW') > -1}\"></state-icon> </td> </tr> <tr ng-if=\"detailsThumbnail.alarms.length === 0\"> <td colspan=\"3\" class=\"text-center full-row\">{{'noAlarmToDisplay' | i18next}}</td> </tr> </tbody> </table> </div> "
  );


  $templateCache.put('views/hub/hub.html',
    "<div class=\"container-fluid\"> <div class=\"hub\" ng-class=\"{'hub-reduced': detailsPanelOpened}\"> <div class=\"row hub-title\"> <div class=\"col-xs-3 col-sm-3 col-md-2\"> <img src=\"images/logo-ivtracer.ae19f3d5.png\" alt=\"logo ivtracer\" class=\"logo\"> </div> <div class=\"col-xs-6 col-sm-6 col-md-4 col-md-offset-2 text-center\"> <h1 class=\"hub-info\" ng-bind-html=\"overviewPanel.title\"></h1> </div> <div class=\"col-xs-3 col-sm-3 col-md-2 col-md-offset-2 text-right\"> <h1 class=\"hub-info\">{{overviewPanel.time | makeTime}}</h1> </div> </div> <div ng-if=\"selectedThumbnail && displaySeparetedSelectedThumbnail\" class=\"thumbnail-out selected-thumbnail\" ng-class=\"{'selected': selectedThumbnail.selected}\"> <thumbnail thumbnail=\"selectedThumbnail\" class=\"thumbnail-container {{selectedThumbnail.states}}\"></thumbnail> </div> <h4 ng-if=\"detailsPanelOpened && priorityThumbnailsList.length > 0\" ng-i18next=\"[i18next]({ count: priorityThumbnailsList.length})probeInAlarmAndOrNeedAck\"></h4> <div ng-if=\"errorRecoverThumbnails\" class=\"alert alert-danger\"> <p> <span class=\"glyphicon glyphicon-warning-sign\"></span> <span ng-i18next=\"[html]({ date: serverError.date, time: serverError.time })error.unreacheableServerSinceDateTime\"></span> </p> <p> {{'appActions.applicationWillReconnect' | i18next}} <a href=\"javascript:location.reload();\" title=\"{{'appActions.applicationWillManualUpdate' | i18next}}\"> {{'appActions.applicationWillUpdate' | i18next}}</a> {{'appActions.applicationWillUpdateAutomatically' | i18next}}. </p> </div> <div ng-if=\"noDataDisplayedDueToConfigurationOrIVTracerServerConnection\" class=\"alert alert-warning\"> <p><span class=\"glyphicon glyphicon-info-sign\"></span> {{'error.noDataDisplayedCheckConfigurationAndServerConnection' | i18next}}</p> </div> <list-thumbnails></list-thumbnails> </div> </div> <details-panel class=\"detail-panel-element\"></details-panel> "
  );


  $templateCache.put('views/hub/list-thumbnails.html',
    "<ul class=\"list-thumbnails\"> <spinner ng-if=\"mainLoading\"></spinner> <li ng-if=\"!priorityThumbnailsList\" ng-repeat=\"thumbnail in thumbnails | orderBy: ['type', 'name'] track by $index\" class=\"thumbnail-out\" ng-class=\"{'selected': thumbnail.selected}\"> <thumbnail thumbnail=\"thumbnail\" class=\"thumbnail-container animate-repeat {{thumbnail.states}}\" ng-click=\"selectThumbnail(thumbnail)\"></thumbnail> </li> <li ng-if=\"priorityThumbnailsList\" ng-repeat=\"thumbnail in priorityThumbnailsList track by $index\" class=\"thumbnail-out\" ng-class=\"{'selected': thumbnail.selected}\"> <thumbnail thumbnail=\"thumbnail\" class=\"thumbnail-container animate-repeat {{thumbnail.states}}\" ng-click=\"selectThumbnail(thumbnail)\"></thumbnail> </li> </ul> "
  );


  $templateCache.put('views/hub/thumbnail.html',
    "<div class=\"thumbnail-content\"> <div class=\"row no-margin\"> <div class=\"col-xs-2 col-sm-2 col-md-2 col-lg-2 no-padding\"> <type-icon type=\"$ctrl.thumbnail.type\"></type-icon> </div> <div class=\"col-xs-10 col-sm-10 col-md-10 col-lg-10 no-padding\"> <p class=\"thumbnail-name\">{{$ctrl.thumbnail.name}}</p> </div> </div> <div class=\"row\"> <div class=\"col-xs-8 col-xs-offset-2 col-sm-8 col-sm-offset-2 col-md-7 col-md-offset-2 col-lg-7 col-lg-offset-2 no-padding\"> <span class=\"thumbnail-value\">{{$ctrl.thumbnail.value}} {{$ctrl.thumbnail.unit}}</span> </div> <div class=\"col-xs-2 col-sm-2 col-md-3 col-lg-3 no-padding\"> <state-icon></state-icon> </div> </div> </div> "
  );

}]);

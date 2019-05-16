export function DataManager($log, DateManager, Utilities){
    
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

  // Génère la liste des vignettes affichées à gauche du panneau détail d'une boucle
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
}
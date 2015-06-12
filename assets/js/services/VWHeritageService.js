jumplink.cms.service('VWHeritageService', function ($rootScope, $log, $sailsSocket) {

  var resolveCatalogProductList = function(cb, next) {
    var errors = [
      "Error: On trying to resolve VWHeritage Catalog Products List",
      "Warn: On trying to resolve VWHeritage Catalog Products List! Not found, Products are empty!"
    ];

    var url = '/vwheritage/catalog_product_list';

    return $sailsSocket.get(url).then (function (resp) {
      if(angular.isUndefined(resp) || angular.isUndefined(resp.data)) {
        $log.warn(errors[1]);
        return null;
      }

      if(next) resp.data = next(resp.data);

      if(cb) {
        cb(null, resp.data);
      } else {
        return resp.data;
      }
    }, function error (resp){
      $log.error(errors[0], resp);
      
      if(angular.isUndefined(resp) || angular.isUndefined(resp.data)) {
        $log.warn(errors[1]);
        return null;
      }

      if(next) resp.data = next(resp.data);

      if(cb) {
        cb(null, resp.data);
      } else {
        return resp.data;
      }
    });
  };

  return {
    resolveCatalogProductList: resolveCatalogProductList,
  };
});
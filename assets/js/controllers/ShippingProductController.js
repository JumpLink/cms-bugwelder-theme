jumplink.cms.controller('ShippingProductController', function($rootScope, product, $scope, $mdBottomSheet, $sailsSocket, $log) {

  $scope.product = product;
  // console.log($scope);

  $scope.hide = function() {
    $mdBottomSheet.hide("TODO");
  };

  var saveInfo = function (cb) {
    // $log.debug(product);
    $sailsSocket.put('/magento/catalog_product_update/'+$scope.product.product_id+"?id="+$scope.product.product_id+"&storeview=shop_de&site="+$rootScope.site, {storeview: "shop_de", product:$scope.product, site:$rootScope.site}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        // $log.debug ("stock save result", data);
        if(cb) cb(null, data);
      } else {
        $log.error ("Error");
        if(cb) cb("Error")
      }
    }).error(function (data, status, headers, config) {
      $log.error(data, status, headers, config);
      if(cb) cb(data);
    });
  }

  var saveStock = function (cb) {
    // $log.debug(product);
    $sailsSocket.put('/magento/catalog_product_stock_update/'+$scope.product.product_id+"?id="+$scope.product.product_id+"&storeview=shop_de&site="+$rootScope.site, {storeview: "shop_de", product:$scope.product, site:$rootScope.site}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        // $log.debug ("stock save result", data);
        if(cb) cb(null, data);
      } else {
        $log.error ("Error");
        if(cb) cb("Error")
      }
    }).error(function (data, status, headers, config) {
      $log.error(data, status, headers, config);
      if(cb) cb(data);
    });
  }

  $scope.save = function(cb) {
    // if($rootScope.authenticated) {
      saveInfo(function(err, res) {
        if(!err && res) {

        } else {
          $rootScope.pop('error', 'Produktattribute nicht gespeichert!', $scope.product.sku);
          if(cb) cb(err, res);
        }
        saveStock(function(err, res) {
          if(!err && res) {
            $rootScope.pop('success', 'Produkt gespeichert.', $scope.product.sku);
            if(cb) cb(err, res);
          } else {
            $rootScope.pop('error', 'Produkt Lagerstand nicht gespeichert!', $scope.product.sku);
            if(cb) cb(err, res);
          }
        });
      });
    // } else {
    //   $rootScope.pop('error', 'Es ist dir nicht erlaubt Produkte zu verändern.', $scope.product.sku);
    // }
  };

  var loadStock  = function (cb) {
    // $log.debug(product);
    $sailsSocket.get('/magento/catalog_product_stock_list/'+$scope.product.product_id+"?id="+$scope.product.product_id+"&storeview=shop_de&site="+$rootScope.site, {storeview: "shop_de", id:$scope.product.id, site:$rootScope.site}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        // $log.debug ("stock", data);
        $scope.qty = data[0].qty;
        $scope.is_in_stock = data[0].is_in_stock;
        if(cb) cb(null, data);
      } else {
        $log.error ("Error");
        if(cb) cb("Error")
      }
    }).error(function (data, status, headers, config) {
      $log.error(data, status, headers, config);
      if(cb) cb(data);
    });
  }

  var loadInfo  = function (cb) {
    // $log.debug(product);
    $sailsSocket.get('/magento/catalog_product_info/'+$scope.product.product_id+"?id="+$scope.product.product_id+"&storeview=shop_de&site="+$rootScope.site, {storeview: "shop_de", id:$scope.product.id, site:$rootScope.site}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        // $log.debug (data);
        if(data.images) data.images = $scope.product.images;
        $scope.product = data;
        $scope.product.stock_strichweg_qty = Number($scope.product.stock_strichweg_qty);
        $scope.product.stock_vwheritage_qty = Number($scope.product.stock_vwheritage_qty);
        $scope.product.qty = $scope.product.stock_strichweg_qty + $scope.product.stock_vwheritage_qty;
        $log.debug ($scope.product);
        if(cb) cb(null, data);
      } else {
        $log.error ("Error");
        if(cb) cb("Error")
      }
    }).error(function (data, status, headers, config) {
      $log.error(data, status, headers, config);
      if(cb) cb(data);
    });
  }

  loadInfo(function (err, res) {
    loadStock(function(err, res) {

    });
  });
  

  $scope.$watch('product.stock_vwheritage_qty', function(newValue, oldValue) {
    $scope.product.qty = $scope.product.stock_vwheritage_qty + $scope.product.stock_strichweg_qty;
  });

  $scope.$watch('product.stock_strichweg_qty', function(newValue, oldValue) {
    $scope.product.qty = $scope.product.stock_vwheritage_qty + $scope.product.stock_strichweg_qty;
  });

  $scope.$watch('product.qty', function(newValue, oldValue) {
    if(newValue > 0) $scope.product.is_in_stock = true;
    else $scope.product.is_in_stock = false;
  });

});
jumplink.cms.controller('ShippingContentController', function($rootScope, $scope, $sailsSocket, $mdBottomSheet, $async, $log) {

  $scope.search = "";
  $scope.products = [];

  var loadImage  = function (product, cb) {
    $log.debug(product);
    $sailsSocket.get('/magento/catalog_product_attribute_media_list/'+product.product_id+"?id="+product.product_id+"&storeview=shop_de&site="+$rootScope.site, {storeview: "shop_de", id:product.id, site:$rootScope.site}).success(function(data, status, headers, config) {
      if(data != null && typeof(data) !== "undefined") {
        $log.debug (data);
        // $scope.products = data;
        product.images = data;
        $log.debug (product);
        cb(null, data);
      } else {
        $log.error ("Error");
        cb("Error")
      }
    }).error(function (data, status, headers, config) {
      $log.error(data, status, headers, config);
      cb(data)
    });
  }

  var loadImages  = function (products, cb) {
    $async.map(products, loadImage, function(err, results) {
      if(err) $log.error ("Can't save image");
      $log.debug (results);
    });
  }

  var loadSkus = function (sku, cb) {
    $log.debug(event, $scope.search);
    if(event.keyIdentifier === "Enter") {
      $sailsSocket.get('/magento/catalog_product_list/'+sku+"?storeview=shop_de&site="+$rootScope.site, {storeview: "shop_de", id:sku, site:$rootScope.site}).success(function(data, status, headers, config) {
        if(data != null && typeof(data) !== "undefined") {
          $log.debug (data);
          $scope.products = data;
          // loadImages($scope.products);
        } else {
          $log.error ("Can't save image");
        }
      }).error(function (data, status, headers, config) {
        $log.error(data, status, headers, config);
      });
    }
  }

  $scope.checkInput = function (input) {
    var inputString = input || $scope.search;
    if(inputString.length >= 3) {
      loadSkus(inputString);
    } else {
      $rootScope.pop("error", "Sie müssen mindestens 3 Zeichen eingeben.")
    }
    
  }

  $scope.checkInputEvent = function (event, search) {
    $log.debug(event, search, $scope.search);
    if(event && event.keyIdentifier === "Enter") {
      $scope.checkInput(search);
    }
  }

  $scope.showProduct = function (product, $event) {
    $scope.product = product;
    $mdBottomSheet.show({
      templateUrl: 'shipping/bottom-sheet',
      controller: 'ShippingProductController',
      targetEvent: $event,
      // scope: $scope,
      locals: {product: $scope.product}
    }).then(function(parameter) {
      console.log(parameter);
    }, function (error) {
      console.log(error);
    });
  }
});
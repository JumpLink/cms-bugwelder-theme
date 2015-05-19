jumplink.cms.controller('AppController', function($rootScope, $scope, $state, $window, $timeout, Fullscreen, $sailsSocket, $location, $anchorScroll, $mdUtil, $log, $mdSidenav, $mdToast) {

  // fix scroll to top on route change
/*  $scope.$on("$stateChangeSuccess", function () {
    $anchorScroll();
  });*/

  /**
   * Build handler to open/close a SideNav; when animation finishes
   * report completion in console
   */
  function buildToggler(navID) {
    var debounceFn =  $mdUtil.debounce(function(){
          $mdSidenav(navID)
            .toggle()
            .then(function () {
              $log.debug("toggle " + navID + " is done");
            });
        },300);
    return debounceFn;
  }

  $scope.toggleLeft = buildToggler('left');
  $scope.toggleRight = buildToggler('right');

  // WORKAROUND wait until image is loaded to fix bs-sidebar
/*  angular.element($window).imagesLoaded(function() {
    angular.element($window).triggerHandler('resize');
  });*/

  // https://material.angularjs.org/#/api/material.components.toast/service/$mdToast
  $rootScope.pop = function(type, title, body, timeout, bodyOutputType, clickHandler) {
    // toaster.pop(type, title, body, timeout, bodyOutputType, clickHandler);
    console.log("toaster", type, title, body, timeout, bodyOutputType, clickHandler);

    $mdToast.show({
      controller: 'ToastController',
      templateUrl: 'toast',
      locals: {type: type, title: title, body: body},
      hideDelay: timeout || 6000,
      position: 'top right'
    });
  };

  var generalSubscribes = function () {

    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){

      // react to subscripe from server: http://sailsjs.org/#/documentation/reference/websockets/sails.io.js/io.socket.on.html
      $sailsSocket.subscribe('connect', function(msg){
        $log.debug('socket.io is connected');
      });

      $sailsSocket.subscribe('disconnect', function(msg){
        $rootScope.pop('error', 'Verbindung zum Server verloren', "");
        // $rootScope.authenticated = false; TODO
      });

      $sailsSocket.subscribe('reconnect', function(msg){
        $rootScope.pop('info', 'Sie sind wieder mit dem Server verbunden', "");
      });

    });

  }

  var adminSubscribes = function() {
    // subscripe on server
    $sailsSocket.post('/session/subscribe', {}).success(function(data, status, headers, config){

      // called on any sended email from server
      $sailsSocket.subscribe('email', function(email){

        var body = ''
          +'<dl>'
            +'<dt>Absender</dt>'
            +'<dd><a href="mailto:'+email.from+'">'+email.from+'</a></dd>'
            +'<dt>Betreff</dt>'
            +'<dd>'+email.subject+'</dd>';
            if(email.attachments) {
              body += ''
              +'<dt>Anhänge</dt>'
              +'<dd>'+email.attachments.length+'</dd>';
            }
            body += ''
          +'</dl>';

        $rootScope.pop('info', 'Eine E-Mail wurde versendet.', body, null, 'trustedHtml');
      });

      // admin room
      $sailsSocket.subscribe('admins', function(msg){
        $log.debug(msg);
      });

    });
  }

  // http://stackoverflow.com/questions/18608161/angularjs-variable-set-in-ng-init-undefined-in-scope
  // $rootScope.$watch('authenticated', function () {
  //   $log.debug("authenticated: "+$rootScope.authenticated);
  //   if($rootScope.authenticated) {
  //     $rootScope.mainStyle = {'padding-bottom':'50px'};
  //     $rootScope.toasterPositionClass = 'toast-bottom-right-with-toolbar';
  //     adminSubscribes();
  //   } else {
  //     $rootScope.mainStyle = {'padding-bottom':'0px'};
  //     $rootScope.toasterPositionClass = 'toast-bottom-right';
  //   }
  // });
  generalSubscribes();

  $rootScope.fullscreenIsSupported = Fullscreen.isSupported();
  $rootScope.isFullscreen = false;
  Fullscreen.$on('FBFullscreen.change', function(evt, isFullscreenEnabled){
    $rootScope.isFullscreen = isFullscreenEnabled == true;
    $rootScope.$apply();
  });

  $rootScope.toggleFullscreen = function () {
    if (Fullscreen.isEnabled()) {
      Fullscreen.cancel();
    } else {
      Fullscreen.all();
    }
  };

  // TODO loading animation on $stateChangeStart
    $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams){
     $rootScope.loadclass = 'loading';
  });

  // on new url
  $rootScope.$on('$stateChangeSuccess',
  function(event, toState, toParams, fromState, fromParams){
    $rootScope.loadclass = 'finish';
    switch(toState.name) {
      case "layout.shipping":
        $rootScope.bodyclass = 'shipping';
      break;
      case "layout.gallery":
        $rootScope.bodyclass = 'gallery';
      break;
      case "layout.gallery-slider":
        $rootScope.bodyclass = 'gallery-slider';
      break;
      default:
        $rootScope.bodyclass = toState.name;
      break;
    }
  });

  $rootScope.getWindowDimensions = function () {
    return { 'height': angular.element($window).height, 'width': angular.element($window).width };
  };

  angular.element($window).bind('resize', function () {
    // $timeout(function(){
    //   $rootScope.$apply();
    // });
    // $rootScope.$apply();
  });

  // http://stackoverflow.com/questions/641857/javascript-window-resize-event
  if(angular.element($window).onresize) { // if jQuery is used
    angular.element($window).onresize = function(event) {
      $timeout(function(){
        $rootScope.$apply();
      });
    };
  }

  // http://stackoverflow.com/questions/22991481/window-orientationchange-event-in-angular
  angular.element($window).bind('orientationchange', function () {
    $timeout(function(){
      $rootScope.$apply();
    });
  });

  angular.element($window).bind('deviceorientation', function () {
    $timeout(function(){
      $rootScope.$apply();
    });
  });

  $rootScope.$watch($rootScope.getWindowDimensions, function (newValue, oldValue) {
    $rootScope.windowHeight = newValue.height;
    $rootScope.windowWidth = newValue.width;
    $timeout(function(){
      $rootScope.$apply();
    });
  }, true);

  $rootScope.logout = function() {
    $sailsSocket.post("/session/destroy", {}).success(function(data, status, headers, config) {
      // $rootScope.authenticated = false; TODO
      $rootScope.pop('success', 'Erfolgreich abgemeldet', "");
    });
  }

  $scope.goToState = function (to, params, options) {
    $state.go(to, params, options)
  }

});

jumplink.cms.controller('LayoutController', function($scope) {
});

jumplink.cms.controller('ToastController', function($scope, $mdToast, type, title, body) {
  $scope.type = type;
  $scope.title = title;
  $scope.body = body;
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});



jumplink.cms.controller('LeftSidenavController', function($scope, $mdSidenav, $log) {
  $scope.close = function () {
    $mdSidenav('left').close()
      .then(function () {
        $log.debug("close LEFT is done");
      });
  };

});

jumplink.cms.controller('RightSidenavController', function($scope, $mdSidenav, $log) {
  $scope.close = function () {
    $mdSidenav('right').close()
      .then(function () {
        $log.debug("close RIGHT is done");
      });
  };

});

jumplink.cms.controller('FooterController', function($scope) {

});

jumplink.cms.controller('ErrorContentController', function($scope, $stateParams) {
  console.log($stateParams);
  $scope.error = $stateParams.error;
});


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

  $scope.checkInputEvent = function (event) {
    $log.debug(event, $scope.search);
    if(event && event.keyIdentifier === "Enter") {
      $scope.checkInput($scope.search);
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
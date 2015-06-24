jumplink.cms.controller('VWHeritageContentController', function($rootScope, $scope, $log, products, $state) {
  $scope.products = products;
  $log.debug($scope.products);

  $scope.showProduct = function (sku, event) {
    var index = $scope.products.CODE.indexOf(sku);
    var id = $scope.products.ITEMID[index];
    $state.go('layout.vwheritage-product', {id:id});
  };
});
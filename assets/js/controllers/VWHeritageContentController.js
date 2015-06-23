jumplink.cms.controller('VWHeritageContentController', function($rootScope, $scope, $log, products, $state) {
  $scope.products = products;
  $log.debug($scope.products);

  $scope.showProduct = function (id, event) {
    $state.go('layout.vwheritage-product', {id:id});
  };
});
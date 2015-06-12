jumplink.cms.controller('VWHeritageContentController', function($rootScope, $scope, $log, products) {
  $scope.products = products;
  $log.debug($scope.products);
});
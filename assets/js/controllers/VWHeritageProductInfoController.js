jumplink.cms.controller('VWHeritageProductInfoController', function($rootScope, $scope, $log, product, images) {
  $scope.product = product;
  $scope.images = images;
  $scope.isArray = angular.isArray;
  $log.debug("product", $scope.product);
  $log.debug("images", $scope.images);
});
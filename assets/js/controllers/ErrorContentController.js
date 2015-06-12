jumplink.cms.controller('ErrorContentController', function($scope, $stateParams) {
  console.log($stateParams);
  $scope.error = $stateParams.error;
});
jumplink.cms.controller('ErrorContentController', function($scope, $rootScope, $stateParams, $state, SigninService, $log) {
  console.log($stateParams);
  $scope.error = $stateParams.error;

  $scope.signin = function (user) {
    $log.debug($scope.user);
    // $scope.user.role = 'superadmin';
    SigninService.signin($scope.user, false, function (error, result) {
      if(error) {
        $scope.error = error;
        return $scope.error ;
      }
      $rootScope.authenticated = result.authenticated;
      $rootScope.user = result.user;
      $rootScope.site = result.site;
      $log.debug("[SigninController.signin]", result);
      $state.go('layout.shipping')
    });
  };
});
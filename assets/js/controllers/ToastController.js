jumplink.cms.controller('ToastController', function($scope, $mdToast, type, title, body) {
  $scope.type = type;
  $scope.title = title;
  $scope.body = body;
  $scope.closeToast = function() {
    $mdToast.hide();
  };
});
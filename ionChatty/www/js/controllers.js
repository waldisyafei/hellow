app.controller('overviewCtrl',['$scope','$ionicModal','ioFactory','$ionicPopup',function($scope, $ionicModal,ioFactory,$ionicPopup){
    $scope.username = '';

    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.login = modal;
      $scope.login.show();
    });

    $scope.$on('overview.update', function () {
      $scope.users = ioFactory.users();
      $scope.$apply();
    });

    $scope.$on('overview.notification', function () {
      console.log(ioFactory.notif());

      if (!ioFactory.notif())
      {
        $scope.showAlert('NOTIFICATION','USERNAME HAS BEEN REGISTERED');
      }
      else
      {
        $scope.showAlert('NOTIFICATION','THANKS FOR REGISTERED. ENJOY :)');
        // $scope.addNotification('title','message');

        //console.log('berhasil disimpan');
      }
      //$scope.$apply();
    });

    $scope.$on('messages.update', function () {
        $scope.$apply();
    });

    $scope.sendLogin = function(username){
      $scope.login.hide();
      ioFactory.login(username);
    }

    $scope.showAlert = function(title,message) {
     var alertPopup = $ionicPopup.alert({
       title: title,
       template: message
     });
     alertPopup.then(function(res) {
       console.log('Thank you for not eating my delicious ice cream cone');
     });
   };

    // $scope.addNotification = function(tit, msg) {
    //   window.plugin.notification.local.add({
    //       id: 'MYLN',
    //       title:   tit,
    //       message: msg,
    //       icon:      'ic_notification',
    //       smallIcon: 'ic_notification_small',
    // })};

    // $scope.register = function(username,password,email,hp){
    //   //console.log('tes');
    //   ioFactory.register(username,password,email,hp);

    //   $scope.register.hide();
    //   $ionicModal.fromTemplateUrl('templates/login.html', {
    //     scope: $scope,
    //     backdropClickToClose: false,
    //     animation: 'slide-in-up'
    //   }).then(function(modal) {
    //     $scope.login = modal;
    //     $scope.login.show();
    //   });
    // }

    $scope.registration = function(username,password,email,hp){      
      ioFactory.register(username,password,email,hp);

      $scope.register.hide();
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.login = modal;
        $scope.login.show();
      });
    }

    $scope.registerback = function(){
      $scope.register.hide();
      
      $ionicModal.fromTemplateUrl('templates/login.html', {
        scope: $scope,
        backdropClickToClose: false,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.login = modal;
        $scope.login.show();
      });
    }

    $scope.viewRegister = function(){
      $ionicModal.fromTemplateUrl('templates/register.html', {
        scope: $scope,
        backdropClickToClose: false,
        animation: 'slide-in-up'
      }).then(function(modal) {
        $scope.login.hide();
        $scope.register = modal;
        $scope.register.show();
      });
    }

    // $scope.$watch('password', function(scope) {
    //     //$scope.strength = 'strong';
    //     // console.log(scope);

    //     // console.log($scope.password);

    //     // if ($scope.password!==undefined) {
    //     //     console.log('yes');
    //     //     if ($scope.password.length > 8) {
    //     //         $scope.strength = 'strong';
    //     //     } else if ($scope.password.length > 3) {
    //     //         $scope.strength = 'medium';
    //     //     } else {
    //     //         $scope.strength = 'weak';
    //     //     }
    //     // }
    //     // else
    //     // {
    //     //     $scope.strength = 'weak';          
    //     // }

    //     //$scope.strength = 'weak';
    // });

    $scope.getUndreadedMessages = function(userId){
        return ioFactory.messages(userId).filter(function(m){ return m.isRead === false }).length;
    };

    $scope.isMe = function(userId){
        return (userId == ioFactory.UserId());
    }
}]);
app.controller('chatCtrl',['$scope','$stateParams','ioFactory','$ionicScrollDelegate' ,function($scope,$stateParams,ioFactory, $ionicScrollDelegate){
    $scope.userId = socket.io.engine.id;
    $scope.partnerId = $stateParams.UserID;
    $scope.messages = ioFactory.messages($scope.partnerId);


    $scope.$on('messages.update', function () {
      $scope.messages = ioFactory.messages($scope.partnerId);
      setMessagesToRead();
      $ionicScrollDelegate.$getByHandle('content').scrollBottom(true);
      $scope.$apply();
    });

    var setMessagesToRead = function(){
          var unreaded = $scope.messages.filter(function(uread){ return !uread.isRead});
          for (i = 0; i < unreaded.length; i++) {
            unreaded[i].isRead = true;
          }
    };

    $scope.sendMessage = function(){
      if($scope.message != undefined || $scope.message != '')
      {
        var mess = {
          "userId" : $scope.userId,
          "text": $scope.message,
          "isRead": true
        };
        ioFactory.send($scope.partnerId, mess);
        $ionicScrollDelegate.$getByHandle('content').scrollBottom(true);
        $scope.message = '';
      }
    };

    setMessagesToRead();
    $ionicScrollDelegate.$getByHandle('content').scrollBottom(true);
}]);

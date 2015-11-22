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

    $scope.$on('login.notification', function () {
      // if ($scope.isMe(socket.io.engine.id))
      // {
      // $scope.userId = socket.io.engine.id;
      // console.log($scope.userId);
        //console.log(socket.io.engine.id);

        if (ioFactory.notif())
        {
          //$scope.login.hide();
          $scope.users = ioFactory.users();
          //$scope.showAlert('Login Success','Just ask us for virtual assistant');
          $scope.$apply();
        }
        else
        {
          $scope.showAlert('Login Failed','Username or password not match');
          $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope,
            backdropClickToClose: false,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.login = modal;
            $scope.login.show();
          });
        }
      //}
    });

    $scope.$on('register.notification', function () {
      if (ioFactory.notif())
      {
        $scope.showAlert('NOTIFICATION','USERNAME HAS BEEN REGISTERED');
      }
      else
      {
        $scope.showAlert('NOTIFICATION','THANKS FOR REGISTERED. ENJOY :)');

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
    });

    $scope.$on('messages.update', function () {
        $scope.$apply();
    });

    $scope.sendLogin = function(form,input){
      if(form.$valid) {
        $scope.login.hide();
        ioFactory.login(input.username, input.password);
      }
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

    $scope.registration = function(form,input){
      if(form.$valid) {
        ioFactory.register(input.email,input.password,input.name,input.contact);
      }
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

    $scope.getUndreadedMessages = function(userId){
        return ioFactory.messages(userId).filter(function(m){ return m.isRead === false }).length;
    };

    $scope.isMe = function(userId){
        return (userId == ioFactory.UserId());
    }

    $scope.userid = function(userId){
        return (ioFactory.UserId());
    }

    $scope.roles = function(userId, alluser){
        data = alluser.filter(function (el) {
          return el.Id == userId
        });
        return (data[0].role);
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

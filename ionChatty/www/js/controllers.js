app.controller('overviewCtrl',['$scope','$ionicModal','ioFactory','$ionicPopup', '$state', '$ionicHistory','Auth',function($scope, $ionicModal,ioFactory,$ionicPopup, $state, $ionicHistory, Auth){
    $scope.username = '';

    $scope.loging = function (form,user) {
      if(form.$valid) {
        Auth.login(user.username, user.password).then(function(data) {
          if(data.success) {
            console.log('auth was successful.');
            //$state.go('app');
          } else {
            alert('Username / Password not valid. Try again');
          }
        })
      }
    };

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
        if (ioFactory.notif()==false)
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
        else
        {          
          var user = ioFactory.users().filter(function(val) {
              return val.Id === ioFactory.clientid();
          });

          if(user[0].role==='user')
          {
            var admin = ioFactory.users().filter(function(val) {
                return val.role === 'admin';
            });

            $ionicHistory.nextViewOptions({
              disableBack: true
            });

            // $state.go("chat", { UserID: admin[0].Id , email: user[0].Name } );
            $state.go("chat", { UserID: admin[0].Id } );
            console.log(user[0].Name);
            $scope.$apply();
          }

          $scope.users = ioFactory.users();
          $scope.$apply();
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

    $scope.roles = function(){
        //console.log('tes');
        //console.log(ioFactory.users());
        //console.log(ioFactory.UserId());

        data = ioFactory.users().filter(function (el) {
          return el.Id == ioFactory.UserId();
        });

        if (data[0].role==undefined)
        {
          return null;
        }
        else
        {
          return data[0].role;
        }
    }
}]);

app.controller('chatCtrl',['$scope','$stateParams','ioFactory','$ionicScrollDelegate', '$ionicPopup', '$state' ,function($scope,$stateParams,ioFactory, $ionicScrollDelegate, $ionicPopup, $state){
    $scope.userId = socket.io.engine.id;
    $scope.partnerId = $stateParams.UserID;
    $scope.messages = ioFactory.messages($scope.partnerId);

    $scope.$on('messages.update', function () {
      //$scope.messages = ioFactory.messages($scope.partnerId);
      setMessagesToRead();
      $ionicScrollDelegate.$getByHandle('content').scrollBottom(true);
      $scope.$apply();
    });

    $scope.cart = function() {
      $state.go('orderdetail', { 'UserID':$scope.userId });
    };

    var setMessagesToRead = function(){
      var unreaded = $scope.messages.filter(function(uread){ return !uread.isRead});
      for (i = 0; i < unreaded.length; i++) {
        unreaded[i].isRead = true;
      }
    };

    $scope.sendMessage = function(){

      data = ioFactory.users().filter(function (el) {
        return el.Id == ioFactory.UserId();
      });

      if($scope.message != undefined || $scope.message != '')
      {
        var mess = {
          "userId" : $scope.userId,
          "text": $scope.message,
          "isRead": true
        };

        ioFactory.send($scope.partnerId, mess, data[0].role);
        $ionicScrollDelegate.$getByHandle('content').scrollBottom(true);
        $scope.message = '';
      }
    };

    setMessagesToRead();
    $ionicScrollDelegate.$getByHandle('content').scrollBottom(true);
}]);

app.controller('orderCtrl',['$scope','$stateParams','ioFactory','$ionicScrollDelegate', '$ionicPopup' ,function($scope,$stateParams,ioFactory, $ionicScrollDelegate, $ionicPopup){
    $scope.userId = socket.io.engine.id;
    $scope.partnerId = $stateParams.UserID;
    //$scope.messages = ioFactory.messages($scope.partnerId);

    $scope.$on('order.notification', function () {
      if (ioFactory.notif())
      {
        $scope.showAlert('NOTIFICATION','ORDER SUCCESS');
      }
      else
      {
        $scope.showAlert('NOTIFICATION','ORDER FAILED');
      }
    });

    $scope.saveorder = function(form,input){
      if(form.$valid) {
        ioFactory.order($scope.partnerId, input.items, input.amount, input.remark);
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

    $scope.$on('overview.update', function () {
      $scope.users = ioFactory.users();
      $scope.$apply();
    });
}]);

app.controller('orderdetailCtrl',['$scope','$stateParams','ioFactory','$ionicScrollDelegate', '$ionicPopup', '$ionicLoading', '$timeout' ,function($scope,$stateParams,ioFactory, $ionicScrollDelegate, $ionicPopup, $ionicLoading, $timeout){
    $scope.partnerId = $stateParams.UserID;
    $scope.userId = socket.io.engine.id;

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    $timeout(function () {
      $scope.orders = ioFactory.orders($scope.partnerId)[0];
      $ionicLoading.hide();
    }, 1000);

    $scope.roles = function(){
        data = ioFactory.users().filter(function (el) {
          return el.Id == ioFactory.UserId();
        });

        if (data[0].role==undefined)
        {
          return null;
        }
        else
        {
          return data[0].role;
        }
    }
}]);

app.controller('changestatusCtrl',['$scope','$stateParams','ioFactory','$ionicScrollDelegate', '$ionicPopup', '$ionicLoading', '$timeout' ,function($scope,$stateParams,ioFactory, $ionicScrollDelegate, $ionicPopup, $ionicLoading, $timeout){
    $scope.id = $stateParams.id;
    $scope.userId = socket.io.engine.id;
    $scope.status = ioFactory.status();

    $scope.savestatus = function(form,input){
      if(form.$valid) {
        ioFactory.updatestatus($scope.id, $scope.userId, input.status, input.remark);
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

    $scope.$on('status.notification', function () {
      if (ioFactory.notif())
      {
        $scope.showAlert('NOTIFICATION','UPDATE STATUS SUCCESS');
      }
      else
      {
        $scope.showAlert('NOTIFICATION','UPDATE STATUS FAILED');
      }
    });
}]);
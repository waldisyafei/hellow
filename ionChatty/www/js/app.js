var app = angular.module('app', ['ionic'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }

    // if (window.cordova) {
    //   document.addEventListener("deviceready", function() {
    //     window.plugin.notification.local.onadd = app.onReminderAdd;
    //     window.plugin.notification.local.onclick = app.onReminderClick;
    //     window.plugin.notification.local.oncancel = app.onReminderCancel;
    //     window.plugin.notification.local.ontrigger = app.onReminderTrigger;
    //  }, false)
    // };
  });
})


app.config(function($stateProvider,$urlRouterProvider) {
  $urlRouterProvider.otherwise('/');
  $stateProvider
  .state('overview', {
    url: '/',
    controller: 'overviewCtrl',
    templateUrl: 'templates/overview.html'
  })
  .state('chat', {
    url: '/chat/:UserID',
    controller: 'chatCtrl',
    templateUrl: 'templates/chat.html',
  })
  .state('order', {
    url: '/order/:UserID',
    controller: 'orderCtrl',
    templateUrl: 'templates/order.html',
  })
  .state('orderdetail', {
    url: '/orderdetail/:UserID',
    controller: 'orderdetailCtrl',
    templateUrl: 'templates/orderdetail.html',
  })
  .state('changestatus', {
    url: '/changestatus/:id',
    controller: 'changestatusCtrl',
    templateUrl: 'templates/changestatus.html',
  });
});

var app = angular.module('app', ['ionic'])
.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // if(window.cordova && window.cordova.plugins.Keyboard) {
    //   cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    // }
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
    templateUrl: 'templates/chat.html'
  });
});

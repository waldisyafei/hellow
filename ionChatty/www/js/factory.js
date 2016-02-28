var baseUrl = 'http://localhost:3333/';

app.service('ioFactory', function ($rootScope) {
  var Users = [];
  var messages = {};
  var notif = {};
  var clientId = {};
  var email={};
  var orders = {};
  var status = [];

  socket.on("update", function(online){
      Users = online;
      $rootScope.$broadcast('overview.update');
  });

  socket.on("notification", function(msg){
      notif = msg;
      $rootScope.$broadcast('register.notification');
  });

  socket.on("ordernotif", function(msg){
      notif = msg;
      $rootScope.$broadcast('order.notification');
  });

  socket.on("statusnotif", function(msg){
      notif = msg;
      $rootScope.$broadcast('status.notification');
  });

  socket.on("listorder", function(order,id){
    // if(orders[id] == undefined){
      orders[id] = [];
    // }
    orders[id].push(order);
  });

  socket.on("liststatus", function(stat){
    status = stat;
  });

  socket.on("login", function(msg, user, clientid){
      var admin = user.filter(function(val) {
          return val.role === 'admin';
      });

      msg = "Silahkan masukkan angka sesuai kebutuhan anda dibawah ini:<br/>" + msg;

      var mess = {
        "userId" : admin[0].Id,
        "text": msg,
        "isRead": true
      };

      var id = admin[0].Id;
      if(messages[id] == undefined){
        messages[id] = [];
      }
      messages[id].push(mess);

      notif = msg;
      Users = user;
      clientId = clientid;

      $rootScope.$broadcast('login.notification');
  });

  socket.on("incomming", function(fromUser, message){
      var mess = {
        "userId" : fromUser,
        "text": message,
        "isRead": false
      };

      if(messages[fromUser] == undefined){
        messages[fromUser] = [];
      }

      messages[fromUser].push(mess);
      $rootScope.$broadcast('messages.update');
  });

  return {
      users: function(){
        return Users;
      },
      UserId: function(){
        return socket.io.engine.id;
      },
      login: function(username,password){
        socket.emit("login", username, password);
      },
      loging: function(username,password){
       var deferred = $rootScope.defer();

        var url = baseUrl + 'login';
        var postData = { name: name, password: password };

        $http.post(url, postData).success(function(response) {
          if(response.success && (response.success == true || response.success == "true")) {
            user = { name: response.name, id: response.id };
            window.localStorage.setItem('user', JSON.stringify(user));
            return deferred.resolve(response);
          } else {
            return deferred.resolve('No user found');
          }
        }).error(function(error) {
          //Fail our promise.
          deferred.reject(error);
        })

        return deferred.promise;
      },
      order: function(partnerId,items,amount, remark){
        socket.emit("order", socket.io.engine.id, partnerId, items, amount, remark);
      },
      register: function(email,password,name,contact){
        socket.emit("register", email, password, name, contact);
      },
      messages: function(partnerId){
        if(messages[partnerId] == undefined){
          messages[partnerId] = [];
        }
        return messages[partnerId];
      },
      orders: function(partnerId){
        if(orders[partnerId] == undefined){
          orders[partnerId] = [];
        }
        return orders[partnerId];
      },
      status: function(){
        return status;
      },
      updatestatus: function(orderid, fromUser, remark){
        socket.emit("updatestatus", orderid, fromUser, remark);
      },
      notif: function(){
        return notif;
      },
      clientid: function(){
        return clientId;
      },
      send: function(partner, message, role){
        if(messages[partner] == undefined){
          messages[partner] = [];
        }
        messages[partner].push(message);
        socket.emit("send", socket.io.engine.id, partner, message.text, role);
      }
  };
});

app.service('Auth', function ($q, $http) {
  var user = null;

  try {
    user = JSON.parse(window.localStorage.getItem('user'));
  } catch(ex) { /* Silently fail, no user */ }

  var login = function login(name, password) {
    var deferred = $q.defer();

    var url = baseUrl + 'login';
    var postData = { name: name, password: password };

    $http.post(url, postData).success(function(response) {
      if(response.success && (response.success == true || response.success == "true")) {
        user = { name: response.name, id: response.id };
        window.localStorage.setItem('user', JSON.stringify(user));
        return deferred.resolve(response);
      } else {
        return deferred.resolve('No user found');
      }
    }).error(function(error) {
      //Fail our promise.
      deferred.reject(error);
    })

    return deferred.promise;
  }

  var currentUser = function currentUser() {
    return user;
  }

  var logout = function logout() {
    user = null;
    window.localStorage.removeItem('user');
  }

  return {
    login: login,
    logout: logout,
    currentUser: currentUser
  };
});
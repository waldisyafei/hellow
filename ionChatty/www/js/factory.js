app.service('ioFactory', function ($rootScope) {
  var Users = [];
  var messages = {};
  var notif = {};
  var clientId = {};
  var email={};

  socket.on("update", function(online){
      Users = online;
      $rootScope.$broadcast('overview.update');
  });

  socket.on("notification", function(msg){
      notif = msg;
      $rootScope.$broadcast('register.notification');
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

      //console.log(Users);

      //console.log(Users);
      // socket.io.engine.id = Users.id;
      // console.log(socket.io.engine.id);

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
      register: function(email,password,name,contact){
        socket.emit("register", email, password, name, contact);
      },
      messages: function(partnerId){
        console.log(partnerId);

        if(messages[partnerId] == undefined){
          messages[partnerId] = [];
        }
        return messages[partnerId];
      },
      notif: function(){
        return notif;
      },
      clientid: function(){
        return clientId;
      },
      send: function(partner, message){
        if(messages[partner] == undefined){
          messages[partner] = [];
        }
        messages[partner].push(message);
        socket.emit("send", socket.io.engine.id, partner, message.text);
      }
  };
});

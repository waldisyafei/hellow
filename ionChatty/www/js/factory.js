app.service('ioFactory', function ($rootScope) {
  var Users = [];
  var messages = {};
  var notif = {};

  socket.on("update", function(online){
      Users = online;
      $rootScope.$broadcast('overview.update');
  });

  socket.on("notification", function(msg){
      notif = msg;
      $rootScope.$broadcast('register.notification');
  });

  socket.on("login", function(msg, user){
      notif = msg;
      Users = user;
      $rootScope.$broadcast('login.notification');
  });

  socket.on("incomming", function(fromUser, message){
      var mess = {
        "userId" : fromUser,
        "text": message,
        "isRead": false
      };

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
      send: function(partner, message){
        if(messages[partner] == undefined){
          messages[partner] = [];
        }
        messages[partner].push(message);
        socket.emit("send", socket.io.engine.id, partner, message.text);
      }
  };
});

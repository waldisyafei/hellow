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
      $rootScope.$broadcast('overview.notification');
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
      login: function(username){
        socket.emit("login", username);
      },
      register: function(username,password,email,hp){
        socket.emit("register", username, password, email, hp);
      },
      messages: function(partnerId){
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

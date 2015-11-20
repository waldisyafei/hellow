var express = require('express');
var socket = require('socket.io');

var app = express();
var http = require('http').Server(app);
var users = [];
var userSockets = {};
var db = require('./database.js');

app.use(express.static(__dirname + '/ionChatty/www/'));
app.use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "X-Requested-With");
        res.header("Access-Control-Allow-Headers", "Content-Type");
        res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
        next();
    });
app.get('/', function(req, res){
  res.sendFile(__dirname + '/ionChatty/www/index.html');
});


http.listen(3333, function(){
  console.log('WebServer listening on *:3333');
});

//var io = socket.listen(3333)

var io = require('socket.io').listen(http);

io.on('connection', function(client){
  console.log('User Connected -> ' + client.id);

  client.on("login", function(name){
    var user = {};
    user.Name = name;
    user.Id = client.id;

    userSockets[client.id] = client;
    users.push(user);
    io.sockets.emit("update", users);
  });

  client.on("register", function(username, password, email, hp){
    var query = "INSERT INTO ??(??,??,??,??,??) VALUES (?,?,?,?,?)";
    var now = new Date();
    var params = ["users", "username", "password", "email", "NoHP", "dateCreated", username, password, email, hp, now];
    
    db.exec(query, params, function(err, results,test) {
      console.log(test);
      if (err) { // If unexpected error then send 500
        io.sockets.emit("notification", err);
      } else {
        io.sockets.emit("notification", err);
      }
    });
  });

  client.on("send", function(fromUser, toUser, msg){
    console.log('From -> ' + fromUser + ' To -> ' + toUser + ' Message: ' + msg);

    var from = users.filter( function(user){return (user.Id==fromUser);});
    var to = users.filter( function(user){return (user.Id==toUser);});

    var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
    var now = new Date();
    var params = ["messages", "messageBody", "senderId", "receiverId", "messageDate", msg, from[0].Name, to[0].Name, now];
    
    db.exec(query, params, function(err, results) {
      if (err) { // If unexpected error then send 500
        userSockets[toUser].emit("incomming", fromUser , err);
      } else {
        userSockets[toUser].emit("incomming", fromUser , msg);
      }
    });
  });

  client.on("disconnect", function(){
      console.log('User Disconnected -> ' + client.id);
      var index = users.map(function(e) { return e.Id; }).indexOf(client.id);
      if(index > -1 ){
        users.splice(index,1);
      }

      delete userSockets[client.id];
      io.sockets.emit("update", users);
  });

});

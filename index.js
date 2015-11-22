var express = require('express');
var socket = require('socket.io');

var app = express();
var http = require('http').Server(app);
var users = [];
var userSockets = {};
var db = require('./database.js');
var md5 = require('md5');

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

var io = require('socket.io').listen(http);

io.on('connection', function(client){
  console.log('User Connected -> ' + client.id);

  client.on("login", function(email, password){
    var user = {};
    //user.Name = email;
    user.Id = client.id;

    var query = "select count(role)hitung, role, contact, name from users where email=? and password=?";
    var params = [email, md5(password)];
    
    db.exec(query, params, function(err, results) {
      if (results[0].hitung) { // If unexpected error then send 500
        user.role = results[0].role;
        user.contact = results[0].contact;
        user.Name = results[0].name;

        userSockets[client.id] = client;
        users.push(user);

        //userSockets[client.id].emit("login", true, users);
        io.sockets.emit("login", true, users);

      } else {
        userSockets[client.id] = client;
        users.push(user);

        userSockets[client.id].emit("login", false);
        //userSockets[client.id].emit("login", err);
      }
    });
  });

  client.on("register", function(email, password, name, contact){
    var query = "INSERT INTO users (email, password, name, contact, dateCreated, role) VALUES (?,?,?,?,?,?)";
    var now = new Date();
    var params = [email, md5(password), name, contact, now, 'user'];

    userSockets[client.id] = client;
    
    db.exec(query, params, function(err, results) {
      if (err) { // If unexpected error then send 500
        //io.sockets.emit("notification", err);
        userSockets[client.id].emit("notification", err);
      } else {
        userSockets[client.id].emit("notification", err);
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

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
io.set('transports', [ 'xhr-polling', 'jsonp-polling', 'htmlfile', 'websocket', 'flashsocket', 'xhr-multipart', 'polling' ]);

function IsNumeric(input){
    var RE = /^-{0,1}\d*\.{0,1}\d+$/;
    return (RE.test(input));
}

io.on('connection', function(client){
  console.log('User Connected -> ' + client.id);

  client.on("login", function(email, password){
    var user = {};
    user.Name = email;
    
    var query = "select count(role)hitung, role, contact, name from users where email=? and password=?";
    var params = [email, md5(password)];
    
    db.exec(query, params, function(err, results) {
      if (results[0].hitung) { // If unexpected error then send 500
        user.role = results[0].role;
        user.contact = results[0].contact;
        user.Id = client.id;

        userSockets[client.id] = client;
        users.push(user);

        query = "insert into loginhistory(email, socketid, date) values(?,?,NOW())";
        params = [email, client.id];
        db.exec(query, params, function(err, results) {
          if (!err) { // If unexpected error then send 500
            query = "select group_concat(CONCAT(id, '. ', name) separator '<br />') categories from categories where parentid is null";
            db.exec(query, params, function(err, results) {
              if (err) { // If unexpected error then send 500
                //io.sockets.emit("notification", err);
                userSockets[client.id].emit("login", false);
              } else {
                userSockets[client.id].emit("login", results[0].categories, users, client.id);
              }
            });
          }
        });

        //userSockets[client.id].emit("login", true, users, client.id);

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
    // console.log('From -> ' + fromUser + ' To -> ' + toUser + ' Message: ' + msg);

    // var from = users.filter( function(user){return (user.Id==fromUser);});
    // var to = users.filter( function(user){return (user.Id==toUser);});

    // var query = "INSERT INTO ??(??,??,??,??) VALUES (?,?,?,?)";
    // var now = new Date();
    // var params = ["messages", "messageBody", "senderId", "receiverId", "messageDate", msg, from[0].Name, to[0].Name, now];
    
    // db.exec(query, params, function(err, results) {
    //   if (err) { // If unexpected error then send 500
    //     userSockets[toUser].emit("incomming", fromUser , err);
    //   } else {
    //     userSockets[toUser].emit("incomming", fromUser , msg);
    //   }
    // });

    var query = "";
    var params = "";
    var chat = 0;

    query = "select chat from loginhistory a where a.socketid=?";
    params = [fromUser];
    db.exec(query, params, function(err, results) {
      chat = results[0].chat;
      if(chat==0)
      {
        if (msg==0)
        {
          msg=null;
          query = "select group_concat(CONCAT(id, '. ', name) separator '<br />') categories from categories where parentid is "+ msg +"";
        }
        else
        {
          query = "select CASE WHEN b.id is null then CONCAT(group_concat(CONCAT(a.id, '. ', a.name) separator '<br />'),'<br/>0. Menu Utama') else a.name end categories, b.id from categories a left join (select parent.id from categories parent left join categories child on parent.id = child.parentid where child.id is null)b on a.id=b.id where a.parentid = ?";
          params = [msg];
        }

        db.exec(query, params, function(err, results) {
          if (err) { // If unexpected error then send 500
            userSockets[fromUser].emit("incomming", toUser , err);
          } else {
            if(results[0].id!=null)
            {
              query = "update loginhistory set chat = 1 where socketid=?";
              params = [fromUser];
              db.exec(query, params, function(err, results) {
                
              });
            }
            userSockets[fromUser].emit("incomming", toUser , results[0].categories);
          }
        });
      }
      else
      {
        if (IsNumeric(msg))
        {
          query = "update loginhistory set chat = 0 where socketid=?";
          params = [fromUser];
          db.exec(query, params, function(err, results) {
            if (msg==0)
            {
              msg=null;
              query = "select group_concat(CONCAT(id, '. ', name) separator '<br />') categories from categories where parentid is "+ msg +"";
            }
            else
            {
              query = "select CASE WHEN b.id is null then CONCAT(group_concat(CONCAT(a.id, '. ', a.name) separator '<br />'),'<br/>0. Menu Utama') else a.name end categories, b.id from categories a left join (select parent.id from categories parent left join categories child on parent.id = child.parentid where child.id is null)b on a.id=b.id where a.parentid = ?";
              params = [msg];
            }

            db.exec(query, params, function(err, results) {
              if (err) { // If unexpected error then send 500
                userSockets[fromUser].emit("incomming", toUser , err);
              } else {
                if(results[0].id!=null)
                {
                  query = "update loginhistory set chat = 1 where socketid=?";
                  params = [fromUser];
                  db.exec(query, params, function(err, results) {
                    
                  });
                }
                userSockets[fromUser].emit("incomming", toUser , results[0].categories);
              }
            });
          });
        }
        else
        {
          var from = users.filter( function(user){return (user.Id==fromUser);});
          var to = users.filter( function(user){return (user.Id==toUser);});

          var from = from[0].Name
          var to = to[0].Name

          query = "insert into messages (`messageBody`, `senderId`, `receiverId`, `messageDate`) values(?,?,?,NOW())";
          params = [msg, from, to];
          db.exec(query, params, function(err, results) {
            query = "update loginhistory set chat = 0 where socketid=?";
            params = [fromUser];
            db.exec(query, params, function(err, results) {
              
            });
            userSockets[fromUser].emit("incomming", toUser , "Terima kasih, Permintaan anda akan segera kami proses. Selanjutnya akan kami kabari dalam beberapa menit");
          });
        }   
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

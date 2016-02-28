var express = require('express');
var socket = require('socket.io');

var app = express();
var http = require('http').Server(app);
var users = [];
var orders = [];
var status = [];
var userSockets = {};
var db = require('./database.js');
var md5 = require('md5');
var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded())

// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

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

app.post('/login', function(req, resp) {
  // console.log(req.param('name'));
  var name = req.param('name');
  var password = req.param('password');

  console.log(name);
  console.log(password);

  if(!name || !password) {
    resp.send('No username or password given. Please give correct credientials');
    return;
  }

  console.log('here');


  // console.log('Password attempt by: ' + name + ' at: ' + moment() );
  // if(password && password == 'letmein') {
  //   //Add redis key for users
  //   var userKey = 'user:' + name;
  //   redisClient.set(userKey, moment(), redis.print);
  // }
  resp.send({success: true, name: name});
})


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
    user.email = email;
    user.categories = "";
    user.status = 0;
    
    var query = "select count(role)hitung, (select count(email)hitung from orders where status not in (99,100) and email=?)message, role, contact, name from users where email=? and password=?";
    var params = [email, email, md5(password)];
    
    db.exec(query, params, function(err, results) {
      if (results[0].hitung) { // If unexpected error then send 500

        if (results[0].message>0)
        {
          user.message = 1;
        }
        else
        {
          user.message = 0;
        }

        user.Name = results[0].name;
        user.role = results[0].role;
        user.contact = results[0].contact;
        user.Id = client.id;
        user.chat = 0;

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

        query = "select id, items, amount, remark, b.name, a.date, a.status from orders a inner join status b on a.status = b.statusid where a.email = ? ";
        params = [email];
        db.exec(query, params, function(err, results) {
          if (!err) { // If unexpected error then send 500
            io.sockets.emit("listorder",  results, client.id);
          }
        });

        if (user.role=="admin")
        {
          query = "select * from ??";
          params = ["status"];
          db.exec(query, params, function(err, results) {
            if (!err) { // If unexpected error then send 500
              // userSockets[client.id].emit("listorder",  results, client.id);
              userSockets[client.id].emit("liststatus", results);
            }
          });
        }
      } else {
        userSockets[client.id] = client;
        users.push(user);

        userSockets[client.id].emit("login", false);
      }

      io.sockets.emit("update", users);
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

  client.on("send", function(fromUser, toUser, msg, role){
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

    var chat = users.filter( function(user){return (user.Id==fromUser);})[0].chat;

    if(role=='user')
    {
      // query = "select chat from loginhistory a where a.socketid=?";
      // params = [fromUser];
      // db.exec(query, params, function(err, results) {
      //   chat = results[0].chat;
        if(chat==0)
        {
          if (IsNumeric(msg))
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
                  users.forEach(function(item, i) { if (item.Id == fromUser) { users[i].chat = 1; users[i].categories = msg } });

                  // query = "update loginhistory set chat = 1 where socketid=?";
                  // params = [fromUser];
                  // db.exec(query, params, function(err, results) {
                    
                  // });
                }
                userSockets[fromUser].emit("incomming", toUser , results[0].categories);
              }
            });
          }
          else
          {
            userSockets[fromUser].emit("incomming", toUser , 'Format Salah. Harap masukkan format sesuai dengan menu diatas.');
          }
        }
        else
        {
          if (IsNumeric(msg))
          {
            // query = "update loginhistory set chat = 0 where socketid=?";
            // params = [fromUser];
            // db.exec(query, params, function(err, results) {

              users.forEach(function(item, i) { if (item.Id == fromUser) users[i].chat = 0; });
              
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
                    users.forEach(function(item, i) { if (item.Id == fromUser) users[i].chat = 0; });

                    // query = "update loginhistory set chat = 0 where socketid=?";
                    // params = [fromUser];
                    // db.exec(query, params, function(err, results) {
                      
                    // });
                  }
                  userSockets[fromUser].emit("incomming", toUser , results[0].categories);
                }
              });
            // });
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
              userSockets[toUser].emit("incomming", fromUser , msg);
              userSockets[fromUser].emit("incomming", toUser , "Terima kasih, Permintaan anda akan segera kami proses. Selanjutnya akan kami kabari dalam beberapa menit. Apabila terdapat keterangan tambahan, silahkan dikirimkan setelah pesan ini.");
            });

            //data.forEach(function(item, i) { if (item == 3452) a[i] = 1010; });
            users.forEach(function(item, i) { if (item.Id == fromUser) users[i].message = 1; });
            io.sockets.emit("update", users);

            // var i = items.indexOf(3452);
            // items[i] = 1010;



            // data = users.filter(function (el) {
            //   return el.Id == fromUser;
            // });

            // var admin = users.filter(function (el) {
            //   return el.Id == toUser;
            // });

            // data.push.apply(data, admin);

            // //filter get all by ID
            // // var filter = [fromUser,toUser];
            // // data = users.filter(function (el) {
            // //   //return el.Id == fromUser;
            // //   return filter.indexOf(el.Id)!==-1;
            // // });

            // io.sockets.emit("update", data);
          }
        }
      // });
    }
    else if (role=='admin')
    {
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
    }
  });

  client.on("order", function(fromUser, toUser, items, amount, remark){
    var order = {};

    var user = users.filter( function(user){return (user.Id==toUser);});

    var email = user[0].email;
    var categories = user[0].categories;

    var query = "insert into orders (email, categoriesid, items, amount, date, status, remark) values(?, ?, ?, ?, NOW(), 1, ?)";
    var params = [email, categories, items, amount, remark];
    
    db.exec(query, params, function(err, results) {
        userSockets[fromUser].emit("ordernotif", true);
        userSockets[toUser].emit("incomming", fromUser , "ORDER ON PROGRESS");

        query = "select id, items, amount, remark, b.name, a.date, a.status from orders a inner join status b on a.status = b.statusid where a.email = ? ";
        params = [email];
        db.exec(query, params, function(err, results) {
          if (!err) { // If unexpected error then send 500
            io.sockets.emit("listorder",  results, toUser);
          }
        });
    });
  });

  client.on("updatestatus", function(orderid, fromUser, stat, remark){    
    query = "select * from orders a inner join (select a.email, a.socketid from loginhistory a inner join (select email, max(date)dates from loginhistory a group by email)b on a.email = b.email and a.date = b.dates)c on a.email = c.email where a.id = ?";
    params = [orderid];
    db.exec(query, params, function(err, results) {
      if (!err) { // If unexpected error then send 500
        var toUser = results[0].socketid;
        var email = results[0].email;

        query = "update orders set status = ? where id = ?";
        params = [stat,orderid];
        db.exec(query, params, function(err, results) {
          if (!err) { // If unexpected error then send 500
            userSockets[fromUser].emit("statusnotif", true);

            query = "select id, items, amount, remark, b.name, a.date, a.status from orders a inner join status b on a.status = b.statusid where a.email = ? ";
            params = [email];
            db.exec(query, params, function(err, results) {
              if (!err) { // If unexpected error then send 500
                io.sockets.emit("listorder", results, toUser);
              }
            });
          }
        });
      }

      query = "select UPPER(name)name from status where statusid = ? ";
      params = [stat];
      db.exec(query, params, function(err, results) {
        if (!err) { // If unexpected error then send 500
          userSockets[toUser].emit("incomming", fromUser, results[0].name);
        }
      });

      if (stat==100)
      {
        query = "select count(email)hitung from orders where status not in (99,100) and email=?";
        params = [email];
        db.exec(query, params, function(err, results) {
          if (!err) { // If unexpected error then send 500
            if (results[0].message>0)
            {
              users.forEach(function(user, i) { if (user.email == email) users[i].message = 1; });
            }
            else
            {
              users.forEach(function(user, i) { if (user.email == email) users[i].message = 0; });
            }

            io.sockets.emit("update", users);
          }
        });
      }
    });
    

    

    //console.log(myorder);

    // var email = user[0].email;
    // var categories = user[0].categories;

    // var query = "insert into orders (email, categoriesid, items, amount, date, status) values(?, ?, ?, ?, NOW(), 1)";
    // var params = [email, categories, items, amount];
    
    // db.exec(query, params, function(err, results) {
    //     userSockets[fromUser].emit("ordernotif", err);
    //     userSockets[toUser].emit("incomming", fromUser , "ORDER ON PROGRESS");
    // });
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

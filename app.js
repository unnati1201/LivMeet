const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const { v4: uuidv4 } = require('uuid');
const http = require("http");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const { PeerServer } = require('peer');

const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const peerServer = PeerServer({
  debug: true,
  path: "/myapp",
  port: 9000,
  ssl: {
  key: fs.readFileSync('./key.pem', 'utf8'),
  cert: fs.readFileSync('./server.crt', 'utf8')
}
});


app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json())
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs",peerServer);

app.use(session({
  secret: "A secret code for meeting application clone",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://adminUnnati:adminUnnati@cluster0.uyyhq.mongodb.net/livMeetDB", {useNewUrlParser: true,  useUnifiedTopology: true });
// mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true,  useUnifiedTopology: true });
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const messageSchema = new mongoose.Schema ({
  text: String,
  username: String,
  timestamp: String,
  received: Boolean
})

const roomSchema = new mongoose.Schema({
  roomId: String,
  roomName: String,
  users: [String]
})

const chatSchema = new mongoose.Schema ({
  message: [messageSchema],
  room: [roomSchema]
})

const userSchema = new mongoose.Schema ({
  name: String,
  username: {
    type: String,
    unique: true
  },
  password: {
    type: String
  },
  chatGroups: [chatSchema]
});

userSchema.plugin(passportLocalMongoose);

const Room = new mongoose.model("Room", roomSchema);
const Message = new mongoose.model("Message", messageSchema);
const Chat = new mongoose.model("Chat", chatSchema);
const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

//routes

//home
app.get("/", (req,res)=>{
  res.render("home");
})

app.get("/user/:userId", (req,res)=>{
  if(req.isAuthenticated()){
    const userId = req.params.userId;
    res.render("home", { userId : userId });
  }else{
    res.redirect("/login");
  }
})

//login
app.get("/login", (req,res)=>{
  res.render("login");
})

app.post("/login", (req,res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password
  });

  req.login(user, (err) => {
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res ,() => {
        res.redirect("/user/"+req.user._id);
      })
    }
  })
})

//signup
app.post("/signup", (req,res) => {
  User.register({username: req.body.username},  req.body.password, (err, user) => {
    if(err){
      console.log(err);
      res.redirect("/login");
    }else{
      passport.authenticate("local")(req,res, () => {
        User.updateOne({_id: req.user._id}, {name: req.body.name}, (err) => {
          if(err){
            console.log(err);
          }
        })
        user.name = req.body.name;
        res.redirect("/user/" + user._id);
      })
    }
  })
})

//logout
app.get("/logout", (req,res) => {
  req.logout();
  res.redirect("/");
})

//chat
app.get("/chat/:id", (req,res)=>{
  if(req.isAuthenticated()){
    const id = req.params.id;
    User.findOne({_id: id}, (err, user)=>{
      if(err){
        console.log(err);
        res.redirect("/login")
      }else{
        res.render("chat", {dataList: user});
      }
    })

  }else{
    res.redirect("/login");
  }
})

//meeting
app.post("/joiningNewMeeting", (req,res) => {
  let id = uuidv4();
  res.redirect("/" + id);
})

app.post("/joiningMeeting", (req,res) => {
  res.redirect("/" + req.body.link);
})

app.post("/meetingEnd", (req,res) => {
  res.render("callEnded",{ id : req.body.meetingId });
})

app.post("/rejoin", (req,res) => {
  res.redirect("/" + req.body.meetingId);
})

app.get("/meetingFull", (req,res) => {
  res.render("meetingFull");
})

app.get("/:id", (req,res)=>{
  if(req.isAuthenticated()){
    const id = req.params.id;
    res.render("videocall", { id : id });
  }else{
    res.redirect("/login");
  }
})


//socket.io
const users = {};

io.of("/chat").on("connection", (socket) => {

    socket.on("make-new-group", data => {
      var roomId = uuidv4();
      const room = new Room({
        users: data.users,
        roomName: data.groupName,
        roomId: roomId
      })
      for(var i=0; i<data.users.length; i++){
        User.findOne({username: data.users[i]}, (err,user) => {
          if(err){
            console.log(err);
          }else{
            if(user != null){
              var newGroup = {
                room: room
              }
              room.save();
              user.chatGroups.push(newGroup);
              user.save();
            }
          }
        })
      }
      var sendData = {
        roomId: roomId,
        roomName: data.groupName
      }
      socket.broadcast.emit("new-group-done",{ data: sendData });
      socket.emit("new-group-done",{ data: sendData });
    })

    socket.on("get-chat-meeting", message => {
      var messageToOthers = {
        text: message.text,
        username: message.username,
        timestamp: message.timestamp,
        received: true,
        roomId: message.roomId,
        userId: message.userId
      }
      socket.broadcast.emit("chat-message",{ message: messageToOthers });
      socket.emit("chat-message",{ message: message });
    })

    socket.on("send-chat-message", message => {

      const newMessage = new Message ({
        text: message.text,
        username: message.username,
        timestamp: message.timestamp,
        received: message.received
      })

      const newOtherMessage = new Message ({
        text: message.text,
        username: message.username,
        timestamp: message.timestamp,
        received: true
      })

      var messageToOthers = {
        text: message.text,
        username: message.username,
        timestamp: message.timestamp,
        received: true,
        roomId: message.roomId,
        userId: message.userId
      }


      User.findOne({_id: message.userId}, (err, user)=>{
        if(err){
          console.log(err);
        }else{
          for(var i=0; i<user.chatGroups.length; i++){

            if(user.chatGroups[i].room[0].roomId == message.roomId){

              user.chatGroups[i].message.push(newMessage);

              user.chatGroups[i].room[0].users.forEach((connectedUser) => {

                User.findOne({username: connectedUser}, (err, foundUser)=>{
                  if(err){
                    console.log(err);
                  }else{
                    if(foundUser != null){
                      for(var i=0; i<foundUser.chatGroups.length; i++){
                        if(foundUser.chatGroups[i].room[0].roomId == message.roomId && foundUser._id != message.userId){
                          foundUser.chatGroups[i].message.push(newOtherMessage);
                          break;
                        }
                      }
                      foundUser.save();
                    }
                  }
                });

              })
              break;
            }

          }
          user.save();
          socket.broadcast.emit("chat-message",{ message: messageToOthers });
          socket.emit("chat-message",{ message: message });
        }
      })

    })
})

io.of("/").on('connection', (socket) => {

  socket.on('new-user', name => {
    users[socket.id] = name;
  })

  socket.on('join-room', (id,userId)=>{
    if( socket.client.conn.server.clientsCount > 9){
      socket.emit("redirect","/meetingFull");
    }else{
      socket.join(id);

      var userList = [];

      for(let [key, value] of io.sockets.adapter.rooms){
        if(key == id){
          for (const k of value) {
            var obj = {
              userId : k,
              username: users[k]
            }
            userList.push(obj);
          }
        }
      }

      //user-connected
      socket.broadcast.to(id).emit('user-connected', userId)

      //participants
      io.sockets.in(id).emit("participants", userList);

      //hand-raise
      socket.on("hand-raise", userId => {
        socket.broadcast.emit("person-raised-hand", userId );
      });
      socket.on("hand-down", userId => {
        socket.broadcast.emit("person-down-hand", userId );
      });

      //chat
      socket.on("send-chat-message", message => {

        var today = new Date();
        var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
        var time = today.getHours() + ":" + today.getMinutes();
        var dateTime = date+' '+time;

        Room.findOne({roomId: id}, (err,thisroom) => {
          if(err){
            console.log(err);
          }else{

            var messageClient = {
              text: message,
              username: users[socket.id],
              timestamp: dateTime,
              roomId: id
            }

            var messageToOthers = {
              text: message,
              username: users[socket.id],
              received: true,
              timestamp: dateTime
            }
            var messageToMe = {
              text: message,
              username: users[socket.id],
              received: false,
              timestamp: dateTime
            }

            for(var i=0; i<thisroom.users.length; i++){
              User.findOne({username: thisroom.users[i]}, (err,user) => {
                if(err){
                  console.log(err);
                }else{
                  if(user != null){
                    if(user.username == users[socket.id]){
                      for(var j=0; j<user.chatGroups.length; j++){
                        if(user.chatGroups[j].room[0].roomId == id){
                          user.chatGroups[j].message.push(messageToMe);
                          user.save();
                          break;
                        }
                      }
                    }else{
                      for(var j=0; j<user.chatGroups.length; j++){
                        if(user.chatGroups[j].room[0].roomId == id){
                          user.chatGroups[j].message.push(messageToOthers);
                          user.save();
                          break;
                        }
                      }
                    }
                  }
                }
              })
            }
            io.of('/chat').emit("send-chat-meeting", {message: messageClient});
          }
        })
        io.sockets.in(id).emit("chat-message",{ message: message, name: users[socket.id]});
      })

      //speech detect
      socket.on("voice-detected", userId => {
        socket.broadcast.emit("voice-received",userId);
      })
      socket.on("voice-notDetect", userId => {
        socket.broadcast.emit("voice-notReceived",userId);
      })

      //breakout-room
      socket.on("join-breakout-room", (data) => {
        io.to(data.userId).emit("breakout-room-accept", data.id);
      })

      //breakout-room annoucenment
      socket.on("send-message-to-BoRooms", (message) => {
        io.to(id + "?room=1").to(id + "?room=2").to(id + "?room=3").to(id + "?room=4").emit("receive-annoucement", message);
      })

      //breakout-room-destroy
      socket.on("rejoin-main-room", data => {
        io.to(id + "?room=1").to(id + "?room=2").to(id + "?room=3").to(id + "?room=4").emit('rejoin-main-room-accept', id);
      })

      //user-disconnected
      socket.on('disconnect', () => {
        socket.leave(id);
        userList = userList.filter((item) => item.userId !== socket.id);
        delete users[socket.id]
        io.sockets.in(id).emit("participants", userList);
        socket.broadcast.to(id).emit('user-disconnected', userId);
      })
    }
  })
});

// io.of("/").on('connection', (socket) => {
//
//   socket.on('new-user', name => {
//     users[socket.id] = name
//   })
//
//   socket.on('join-room', (id,userId)=>{
//     if( socket.client.conn.server.clientsCount > 9){
//       socket.emit("redirect","/meetingFull");
//     }else{
//       socket.join(id);
//
//       var userList = [];
//
//       for(let [key, value] of io.sockets.adapter.rooms){
//         if(key == id){
//           for (const k of value) {
//             var obj = {
//               userId : k,
//               username: users[k]
//             }
//             userList.push(obj);
//           }
//         }
//       }
//
//       //user-connected
//       socket.broadcast.to(id).emit('user-connected', userId)
//
//       //participants
//       io.sockets.in(id).emit("participants", userList);
//
//       //hand-raise
//       socket.on("hand-raise", userId => {
//         socket.broadcast.emit("person-raised-hand", userId );
//       });
//       socket.on("hand-down", userId => {
//         socket.broadcast.emit("person-down-hand", userId );
//       });
//
//       //chat
//       socket.on("send-chat-message", message => {
//         io.sockets.in(id).emit("chat-message",{ message: message, name: users[socket.id]});
//       })
//
//       //speech detect
//       socket.on("voice-detected", userId => {
//         socket.broadcast.emit("voice-received",userId);
//       })
//       socket.on("voice-notDetect", userId => {
//         socket.broadcast.emit("voice-notReceived",userId);
//       })
//
//       //breakout-room
//       socket.on("join-breakout-room", (data) => {
//         io.to(data.userId).emit("breakout-room-accept", data.id);
//       })
//
//       //breakout-room annoucenment
//       socket.on("send-message-to-BoRooms", (message) => {
//         io.to(id + "?room=1").to(id + "?room=2").to(id + "?room=3").to(id + "?room=4").emit("receive-annoucement", message);
//       })
//
//       //breakout-room-destroy
//       socket.on("rejoin-main-room", data => {
//         io.to(id + "?room=1").to(id + "?room=2").to(id + "?room=3").to(id + "?room=4").emit('rejoin-main-room-accept', id);
//       })
//
//       //user-disconnected
//       socket.on('disconnect', () => {
//         socket.leave(id);
//         userList = userList.filter((item) => item.userId !== socket.id);
//         delete users[socket.id]
//         io.sockets.in(id).emit("participants", userList);
//         socket.broadcast.to(id).emit('user-disconnected', userId);
//       })
//     }
//   })
// });

peerServer.on("connection", (client) => {
  console.log(client.id + " connected");
})

peerServer.on("disconnect", (client) => {
  console.log(client.id + " disconnected");
})

let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
server.listen(port, ()=>{
  console.log("Listening on port " + port);
});

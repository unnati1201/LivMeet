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
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs",peerServer);

app.get("/", (req,res)=>{
  res.render("home");
})

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
  const id = req.params.id;
  res.render("videocall", { id : id });
})

const users = {}

io.on('connection', (socket) => {
  socket.on('new-user', name => {
    users[socket.id] = name
  })
  socket.on('join-room', (id,userId)=>{
    if( socket.client.conn.server.clientsCount > 9){
      socket.emit("redirect","/meetingFull");
    }else{
      socket.join(id);
      socket.broadcast.to(id).emit('user-connected', userId)
      socket.on("send-chat-message", message => {
        socket.broadcast.emit("chat-message",{ message: message, name: users[socket.id]});
      })
      socket.on('disconnect', () => {
        socket.leave(id);
        socket.broadcast.to(id).emit('user-disconnected', userId);
        delete users[socket.id]
      })
    }
  })
});

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

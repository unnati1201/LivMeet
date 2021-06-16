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

const peerServer = PeerServer({ port: 443, path: '/' });

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/", (req,res)=>{
  let id = uuidv4();
  res.redirect("/" + id);
})

app.get("/:id", (req,res)=>{
  const id = req.params.id;
  res.render("videocall", { id : id });
})

io.on('connection', (socket) => {
  socket.on('join-room', (id,userId)=>{
    socket.join(id);
    socket.broadcast.to(id).emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.broadcast.to(id).emit('user-disconnected', userId)
    })
  })
});
let port = process.env.PORT;
if(port == null || port == ""){
  port = 3000;
}
server.listen(port);

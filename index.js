const PORT = process.env.PORT||5000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;

app.use('/assets', express.static('assets'))

const url='mongodb://localhost:27017/node_chat';

MongoClient.connect(url, function(err,db){
  const database = db.db('node_chat');
  const messagesCollection = database.collection('messages');
  io.on('connection', function(socket){
    console.log('a user connected');

    messagesCollection.find().toArray().then((docs)=>{
      socket.emit("chatHistory",docs);
    });

    socket.on('disconnect', function(){
      console.log('user disconnected');
    });
    socket.on('chat message', function(msg){
      messagesCollection.insertOne({text:msg,function(err,res){
        console.log("Inserted");
      }});
      io.emit('chat message', msg);
    });
  });
})
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(PORT, function(){
  console.log('listening on *:5000');
});

const PORT = process.env.PORT||5000;
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const MongoClient = require('mongodb').MongoClient;
const Canvas = require('canvas')
const crypto = require('crypto');

const helper = require('sendgrid').mail;
const fromEmail = new helper.Email('passwordRecovering@superchat.ru');
const sg = require('sendgrid')('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');

app.use('/assets', express.static('assets'))

const url='mongodb://localhost:27017/node_chat';

MongoClient.connect(url, function(err,db){
  const database = db.db('node_chat');
  const messagesCollection = database.collection('messages');
  const usersCollection = database.collection('users');
  const onlineCollection=database.collection('online');

  io.on('connection', function(socket){

    socket.on('disconnect', function(){
      if (socket._login){
        usersCollection.findOne({'login':socket._login}).then((has)=>{
          const reducedTab=has.Tab-1;
          usersCollection.updateOne({'login':socket._login}, {$set: {Tab:reducedTab}});
          if(reducedTab==0){
            io.emit("UserDisconnected",socket._login);
            onlineCollection.remove({user:socket._login});
          }
        });
      }
    });

    socket.on('SendToMail',function(email){
      usersCollection.findOne({'Email':email}).then((has)=>{
        if(has){
            const toEmail = new helper.Email(has.Email);
            const subject = 'SuperChat Log/Pass';
            const content = new helper.Content('text/plain', `Do not forget them anymore :)
                                                              login: ${has.login}
                                                              password:${has.password}`);
            const mail = new helper.Mail(fromEmail, subject, toEmail, content);
            var request = sg.emptyRequest({
            method: 'POST',
            path: '/v3/mail/send',
            body: mail.toJSON()
            });

            sg.API(request);
            socket.emit("LPSended");
        }else{
          socket.emit('noEmail');
        }
      });
    });

    socket.on('login form',function(form,option){
        if(form.login!=""&&form.password!=""){
        usersCollection.findOne({'login':form.login,'password':form.password}).then((has)=>{
            if(has!=null){
              const newUserUpdate=async ()=>{
                if(+has.Tab==0){
                  await function(){
                    onlineCollection.insertOne({user:form.login})
                    socket.broadcast.emit('newOnlineUser',form.login);
                  }();
                }
                await function(){
                  onlineCollection.find().toArray().then((docs)=>{
                    socket.emit("onlineHistory",docs);
                  });
                }();
              }
              newUserUpdate();

              usersCollection.updateOne({'login':form.login}, {$set: {Tab:has.Tab+1}});
              socket.emit("Successful validation",option);
              socket._login=form.login;
              socket.on('chat message', function(msg){
                if(msg!=""){
                  messagesCollection.insertOne({Author:form.login,text: msg, msgColor:has.Color});
                  io.emit('chat message', '<span style="color:rgb('+has.Color[0]+','+has.Color[1]+','+has.Color[2]+');font-weight:bold;">'+form.login+': '+'</span>'+msg);
                }
              });
              messagesCollection.find().toArray().then((docs)=>{
                socket.emit("chatHistory",docs);
              });
            }else if (option=="ls"){
              socket.emit('needToL/R');
            }else{
              socket.emit('error log',"Invalid login-password combination");
            }
        });
      }
    });





    socket.on('registration form',function(form){

        usersCollection.findOne({$or:[{'login':form.login},{'Email':form.Email}]}).then((has)=>{
          if(has!=null){
            if(has.login==form.login)socket.send('Sorry, but this username is already reserved :(');
            else if(has.Email==form.Email)socket.send('Sorry, but this Email is already reserved :(');
          }else{
            socket.emit("Successful registration");
            let code;
            function createCaptcha() {
              let charsArray =
              "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ@!#$%^&*";
              let lengthOtp = 6;
              let captcha = [];
              for (let i = 0; i < lengthOtp; i++) {
                let index = Math.floor(Math.random() * charsArray.length + 1);
                if (captcha.indexOf(charsArray[index]) == -1)
                  captcha.push(charsArray[index]);
                else i--;
              }
              let canvas = Canvas.createCanvas(110, 50);
              let ctx = canvas.getContext("2d");
              ctx.font = "25px Georgia";
              ctx.strokeText(captcha.join(""), 0, 30);
              code = captcha.join("");
              return(canvas.toDataURL('image/png',1));
            }

            socket.emit('createCaptcha',createCaptcha());
            socket.on('validateCaptcha',function(userCaptcha){
              let colorArray=[0,0,0];

              do{
                colorArray=[Math.floor(Math.random() *256),Math.floor(Math.random() *256),Math.floor(Math.random() *256)];
              }while(colorArray.reduce(function(sum,a){return sum+a;},0)>600);

              if(userCaptcha==code){
                 usersCollection.insertOne({login:form.login,
                                            password:form.password,
                                            Email:form.Email,
                                            Tab:0,
                                            Color:colorArray});
                socket.emit("Successful validation");


                onlineCollection.insertOne({user:form.login});
                socket.broadcast.emit('newOnlineUser',form.login);

                onlineCollection.find().toArray().then((docs)=>{
                  socket.emit("onlineHistory",docs);
                });


                socket.on('chat message', function(msg){
                  if(msg!=""){
                    messagesCollection.insertOne({Author:form.login,text:msg, msgColor:colorArray});
                    io.emit('chat message', '<span style="color:rgb('+colorArray[0]+','+colorArray[1]+','+colorArray[2]+');font-weight:bold;">'+form.login+': '+'</span>'+msg);
                  }
                });
                messagesCollection.find().toArray().then((docs)=>{
                  socket.emit("chatHistory",docs);
                });
              }else{
                socket.emit('createCaptcha',createCaptcha());
              }


            });

          }
        });
    })
  });
})
app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});


http.listen(PORT, function(){
  console.log('listening on *:5000');
});

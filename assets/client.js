function printError(mes,from){
  $(from).find('.errormes').remove();
  $(from).append($('<div class="errormes">').text(mes));
}
function exitButtonClick(){
  localStorage.removeItem('superchat_login');
  localStorage.removeItem('superchat_password');
  window.location.reload();
}
function showForgotPasswordForm(option){
  $('.forgotPasswordForm').animate({
    'top': option.top
  }, {
    duration: option.duration,
    specialEasing: {
      top: option.easing}
    });
  }

function reglog(){
  const socket = io();
  socket.emit('login form',{'login':localStorage.getItem('superchat_login'),
                            'password':localStorage.getItem('superchat_password')
  },'ls');
  socket.on('needToL/R',function(){
    makeform();

    $('.LPtoMailButton').on('click',function(e){
      $('#FPFcontainer').find($('.errormes')).remove();
      const val=$('#LPtoMailInput').val();
      $('#LPtoMailInput').css("background",(!val)?"repeating-linear-gradient(125deg,rgba(255, 0, 0, 0.3), rgba(255, 255, 255, 0.3),rgba(255, 0, 0, 0.3) 5px)":"rgba(0, 0, 0, 0.1)");
      if(val){
        socket.emit("SendToMail",val);
        console.log(val);
      }
    });

    socket.on('noEmail',()=>printError("Mail not found",$('#FPFcontainer')));
    socket.on('LPSended',()=>{
      const fpcontainer=document.getElementById('FPFcontainer');
      while (fpcontainer.children.length>1){
        fpcontainer.removeChild(fpcontainer.lastElementChild);
      }
      const done=document.querySelector('.LPtoMailHeader');
      done.innerHTML="<h1 style='color:green'>Sended! check your email</h1>";
      done.style.position="absolute";
      done.style.top=85;
    });
    const panelOne = $('.form-panel.two').height(),
    panelTwo = $('.form-panel.two')[0].scrollHeight;
    const loginUsername= $('[name="loginUsername"]');
    const loginPassword= $('[name="loginPassword"]');
    const registerUsername = $('[name="registerUsername"]');
    const registerPassword = $('[name="registerPassword"]');
    const registerCpassword = $('[name="registerCpassword"]');
    const registerEmail = $('[name="registerEmail"]');
    const regfields=$(".regfield");//
    const loginfields=$(".loginfield");
    $('.form-panel.two').not('.form-panel.two.active').on('click', function(e) {
      $('.form-toggle').addClass('visible');
      $('.form-panel.one').addClass('hidden');
      $('.form-panel.two').addClass('active');
      $('.form').animate({
        'height': panelTwo
        }, 200);
      });

      $('.form-toggle').on('click', function(e) {
      $(this).removeClass('visible');
      $('.form-panel.one').removeClass('hidden');
      $('.form-panel.two').removeClass('active');
      $('.form').animate({
        'height': "420px"
        }, 200);
    });

      $('.loginButton').on('click',function(e){
        e.preventDefault();

        $('.loginForm').find('.errormes').remove();
          loginfields.each(function(_,item){
            $(item).css("background",($(item).val()=="")?"repeating-linear-gradient(125deg,rgba(255, 0, 0, 0.3), rgba(255, 255, 255, 0.3),rgba(255, 0, 0, 0.3) 5px)":"rgba(0, 0, 0, 0.1)");
          });
          if(loginUsername.val()&&loginPassword.val())
          socket.emit('login form',{'login':loginUsername.val(),
                                    'password':loginPassword.val()
          });
      });

      $('.registerButton').click(function(e){
          e.preventDefault();
          $('.regForm').find('.errormes').remove();
          regfields.each(function(_,item){
            $(item).css("background",($(item).val()=="")?"repeating-linear-gradient(125deg,rgba(255, 0, 0, 0.3), rgba(255, 255, 255, 0.3),rgba(255, 0, 0, 0.3) 5px)":"rgba(0, 0, 0, 0.1)");
          });
          if (registerPassword.val()!=registerCpassword.val()){
            printError("Passwords do not match",'.regForm');
          }
          else if(registerUsername.val()&&registerEmail.val()){
            socket.emit('registration form',{'login':registerUsername.val(),
                                             'password':registerPassword.val(),
                                             'Email':registerEmail.val()
            });
        }
      });
      socket.on('error log',function(mes){
        $('.loginForm').append($('<div class="errormes">').text(mes));
      });

      socket.on('message', function (message) {
        printError(message,'.regForm');
      });
      socket.on('Successful registration',function(){
        $('.registerButton').remove();
        $(".regfield").each(function(_,item){
          $(item).css("background","repeating-linear-gradient(125deg,rgba(36, 96, 44, 0.5), rgba(255, 255, 255, 0.3),rgba(36, 96, 44, 0.5) 5px)");
          $(item).prop("readOnly",true);
        });
        document.querySelector('.regContent').insertAdjacentHTML('beforeEnd',`<form onsubmit="validateCaptcha()">
                                                                                <div class="captchaContainer">
                                                                                      <img id="captcha" src=""/>
                                                                                      <input class="captchaInput" type="text" placeholder="Captcha" id="captchaTextBox"/>
                                                                                      <button class="captchaButton" type="button">Submit</button>
                                                                                </div>
                                                                              </form>`);
        $('.captchaButton').click(function(e){
          const captchaValue=$('.captchaInput').val();
          socket.emit('validateCaptcha',captchaValue);
        });
        socket.on('createCaptcha',function(canv){
          document.getElementById("captcha").src=canv;
        });
      });
  });

    socket.on('Successful validation',function(option){
      if (option!="ls"){
        localStorage.setItem('superchat_login', $('[name="loginUsername"]').val()||$('[name="registerUsername"]').val());
        localStorage.setItem('superchat_password',$('[name="loginPassword"]').val()||$('[name="registerPassword"]').val());
      }
      $('.form,.pen-footer,.forgotPasswordForm').remove();
      launchChat(socket);
    });
}


function launchChat(socket) {
  document.body.insertAdjacentHTML('beforeEnd',`<div id="chatContainer">
                                                  <div id="backToLogin"><div class="backToLoginButton" onclick="exitButtonClick()">&times</div></div>
                                                  <div id="dialogNamesContainer"></div><div id="currentlyOnline"><h1 class="onlineSpan">Currently online:</h1></div>
                                                  <ul id="messages"></ul>
                                                  <div class="margin"></div>
                                                <form id="chatForm" action="">
                                                  <input id="m" autocomplete="off" /><button>Send</button>
                                                 </form><div class="backgr"></div></div>`);
  const curOnline = document.getElementById("currentlyOnline");
  const messages=document.getElementById('messages');

  $('#chatForm').submit(function(e){
    e.preventDefault(); // предотвращает перезагрузку страницы
    socket.emit('chat message', $('#m').val()); //получаем сообщение из поля
    $('#m').val(''); //очищаем инпут
    return false;
  });

  socket.on('chat message', function(msg){
    messages.insertAdjacentHTML('beforeEnd',`<li>${msg}</li>`);
    messages.scrollTo(0,messages.scrollHeight);
  });

  socket.on('newOnlineUser',function(name){
    console.log("NewUser");
    let p = document.createElement("p");
    p.classList.add(name);
    p.classList.add("onlineUser");
    p.innerHTML=name;
    curOnline.appendChild(p);
  });
  socket.on("UserDisconnected",function(name){
    let p=document.querySelector(`.${name}`);
    curOnline.removeChild(p);
  });
  socket.on("onlineHistory",function(data){
    $.each(data, function(){
      $('#currentlyOnline').append($(`<p class="${this.user} onlineUser">`).text(this.user));//добавляем сообщения из базы данных
    });
  });
  socket.on('chatHistory', function(data){
    $.each(data, function(){
      document.getElementById('messages').insertAdjacentHTML('beforeEnd',`<li><span style="color:rgb(${this.msgColor[0]},${this.msgColor[1]},${this.msgColor[2]});font-weight:bold;">${this.Author}: </span>${this.text}</li>`);
    });
    messages.scrollTo(0,messages.scrollHeight);
  });

};

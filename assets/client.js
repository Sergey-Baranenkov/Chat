function printError(mes,from){
  $(from).find('.errormes').remove();
  $(from).append($('<div class="errormes">').text(mes));
}

function reglog(){
  const socket = io();
  socket.emit('login form',{'login':localStorage.getItem('superchat_login'),
                            'password':localStorage.getItem('superchat_password')
  },'ls');
  socket.on('needToL/R',function(){
    makeform();
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
        'height': panelOne
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
        localStorage.setItem('superchat_login', $('[name="loginUsername"]').val());
        localStorage.setItem('superchat_password',$('[name="loginPassword"]').val());
      }
      $('.form,.pen-footer').remove();
      launchChat(socket);
    });

}


function launchChat(socket) {
  document.body.insertAdjacentHTML('beforeEnd',`<ul id="messages"></ul>
                                                <div class="margin"></div>
                                                <form id="chatForm" action="">
                                                  <input id="m" autocomplete="off" /><button>Send</button>
                                                 </form>`);
  $('#chatForm').submit(function(e){
    e.preventDefault(); // предотвращает перезагрузку страницы
    socket.emit('chat message', $('#m').val()); //получаем сообщение из поля
    $('#m').val(''); //очищаем инпут
    return false;
  });

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
    window.scrollTo(0,document.body.scrollHeight);
  });

  socket.on('chatHistory', function(data){
    $('#messages').find('li').remove();
    $.each(data, function(){
      $('#messages').append($('<li>').text(this.text));//добавляем сообщения из базы данных
    });
    window.scrollTo(0,document.body.scrollHeight);
  });

};

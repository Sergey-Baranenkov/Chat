function printError(mes){
  $('.regForm').find('.errormes').remove();
  $('.regForm').append($('<div class="errormes">').text(mes));
}

function reglog(){
  const socket = io();

  socket.on('message', function (message) {
    registerUsername.css("border","3px dashed rgba(164, 35, 0, 0.88)");
    printError(message);
  });

  const panelOne = $('.form-panel.two').height(),
  panelTwo = $('.form-panel.two')[0].scrollHeight;
  const loginUsername= $('[name="loginUsername"]');
  const loginPassword= $('[name="loginPassword"]');

  const registerUsername = $('[name="registerUsername"]');
  const registerPassword = $('[name="registerPassword"]');
  const registerCpassword = $('[name="registerCpassword"]');
  const registerEmail = $('[name="registerEmail"]');


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
  $('.registerButton').click(function(e){
    e.preventDefault();
      const regfields=$(".regfield");
      regfields.each(function(_,item){
        $(item).css("border",($(item).val()=="")?"3px dashed rgba(164, 35, 0, 0.88)":"");
      });
      if (registerPassword.val()!=registerCpassword.val()){

        printError("Passwords do not match");
        registerPassword.style.border=
        registerCpassword.style.border=
        "3px dashed rgba(164, 35, 0, 0.88)";
      }
      else if(registerUsername.val()&&registerEmail.val()){
      $('.registerButton').remove();


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
      socket.on('validateCaptcha',function(res){
        alert(res);
      });
      socket.emit('registration form',{'login':registerUsername.val(),
                                       'password':registerPassword.val(),
                                       'Email':registerEmail.val()
      });}

  });

  socket.on('createCaptcha',function(canv){
    document.getElementById("captcha").src=canv;
  });

  launchChat(socket);
}


function launchChat(socket) {
  $('#chatForm').submit(function(e){
    e.preventDefault(); // предотвращает перезагрузку страницы
    socket.emit('chat message', $('#m').val()); //получаем сообщение из поля
    $('#m').val(''); //очищаем инпут
    return false;
  });

  socket.on('chat message', function(msg){
    $('#messages').append($('<li>').text(msg));
  });

  socket.on('chatHistory', function(data){
    $('#messages').find('li').remove();
    $.each(data, function(){
      $('#messages').append($('<li>').text(this.text));//добавляем сообщения из базы данных
    });
  });


};

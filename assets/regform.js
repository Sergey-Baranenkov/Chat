function makeform(){
  document.body.insertAdjacentHTML('afterbegin',`
    <div class="forgotPasswordForm">
      <div class="closeFPFButton" onclick="showForgotPasswordForm({'top':'-425px','duration':100,'easing':'swing'})">&times</div>
      <div id="FPFcontainer" class="form-group">
        <div class="form-header LPtoMailHeader"><h1>Enter the account Email</h1></div>
        <label for="email" class="form-group">Email:</label>
        <input type="email" id="LPtoMailInput" class="form-group" required="required"/><button class="LPtoMailButton">Send data to the Email</button>
      </div>
    </div>
    <div class="form">
      <div class="form-toggle"></div>
      <div class="form-panel one">
        <div class="form-header">
          <h1>Welcome to our chat!</h1>
        </div>
        <div class="form-content">
          <form class="loginForm">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" name="loginUsername" class="loginfield" required="required"/>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" name="loginPassword" class="loginfield" required="required"/>
            </div>
            <div class="form-group">
              <button class="loginButton" type="button">Log In</button>
            </div>
            <div class="forgotPassword" onclick="showForgotPasswordForm({'top':'100','duration':300,'easing':'swing'})">Forgot password?</div>
          </form>
        </div>
      </div>
      <div class="form-panel two">
        <div class="form-header">
          <h1>Register Account</h1>
        </div>
        <div class="form-content regContent">
          <form class="regForm">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" class="regfield" name="registerUsername" required="required"/>
            </div>
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password"  class="regfield" name="registerPassword" required="required"/>
            </div>
            <div class="form-group">
              <label for="cpassword">Confirm Password</label>
              <input type="password" id="cpassword"  class="regfield" name="registerCpassword" required="required"/>
            </div>
            <div class="form-group">
              <label for="email">Email Address</label>
              <input type="email" id="email"  class="regfield" name="registerEmail" required="required"/>
            </div>
            <div class="form-group">
              <button class="registerButton"  type="button">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>
    <div class="pen-footer">
    </div>
  `);
}

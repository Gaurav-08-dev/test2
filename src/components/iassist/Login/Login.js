import React, { useState } from 'react';
import "./Login.scss";
import alertService from '../../../services/alertService';
import APIService from '../../../services/apiService';
import SHA512 from 'crypto-js/sha512';
import Base64 from 'crypto-js/enc-base64';
import { getUserDetailsFromToken, setDesktopUserSession } from '../../../utils/Common';
import * as Constants from '../../Constants';

const LoginPage = ({setAuthentication,setIsLoggedIn, setLoader}) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');


  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();
    setLoader(true);
    let error_msg = '';

    //Input Validations
    if (!email) { error_msg = 'Username is required'; }
    if (!password) { error_msg = 'Password is required'; }
    if (!email && !password) { error_msg = 'Username/Password is required'; }

    //if there is error return after giving message
    if (error_msg !== '') {
      alertService.showToast('error', error_msg);

      return false;
    }




    //Send Login Request
    const hashPassword = SHA512(password);
    const hasedPassword = hashPassword.toString(Base64);
    const loginPayLoad = {
      username: email,
      password: hasedPassword,
    };

  

    APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'iassist/login/', loginPayLoad, false, 'POST', null, false)
      .then(response => {
        if (response.access_token && response.access_token !== '') {
          //Redirect to home page after succcessful login
           let user_details = getUserDetailsFromToken(response.access_token);

          setDesktopUserSession(response.access_token, user_details); //Set token and user details in session
          
          setTimeout(()=>{
            setAuthentication(true)
            setIsLoggedIn(true);
            console.log('Successfully Login');
          });
          
        } else {
alertService.showToast('error', 'Invalid Username/Password');
        }
      })
      .catch(err => {
        alertService.showToast('error', err.msg);

      });
  }
  // width: 450px;
  // position: fixed;
  // top: 0px;
  // bottom: 5px;
  // right: 0;
  // overflow: hidden;
  // background: #232931;
  // color: #fff;
  // border-radius: 2px 0px 0px 2px;
  // text-align: left;
  // display: flex;
  // flex-direction: column;
  // align-items: center;
  // // margin-top: 50px;
  // justify-content: center;

  return (
    <div className='iassist-end-user-login-page' style={{width: '450px', position: 'fixed', top:'0px', bottom: '5px', right: '0px', overflow: 'hidden', background: '#232931',
    color: '#fff', borderRadius: '2px 0px 0px 2px', textAlign: 'left', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          {/* Email: */}
          <input autoComplete="off" placeholder='Enter Email' type="email" value={email} onChange={handleEmailChange} />
        </label>
        <label>
          {/* Password: */}
          <input autoComplete="off" placeholder='Enter Password' type="password" value={password} onChange={handlePasswordChange} />
        </label>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
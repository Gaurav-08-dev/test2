import React, { useState } from 'react';
import "./Login.scss";
import alertService from '../../../services/alertService';
import APIService from '../../../services/apiService';
import SHA512 from 'crypto-js/sha512';
import Base64 from 'crypto-js/enc-base64';
import { getUserDetailsFromToken, setDesktopUserSession } from '../../../utils/Common';
import * as Constants from '../../Constants';

const LoginPage = ({setAuthentication,setIsLoggedIn}) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appName, setAppName] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [inProgress, setInProgress] = useState('');


  const handleAppNameChange = (event) => {
    setAppName(event.target.value);
  }
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // const handleSubmit = (event) => {
  //   event.preventDefault();
  //   setAuthentication(true)
  //   setIsLoggedIn(true)
  // };

  const handleSubmit = (evt) => {
    console.log('submit')
    evt.preventDefault();
    let error_msg = '';

    //Input Validations
    if (!email) { error_msg = 'Username is required'; }
    if (!password) { error_msg = 'Password is required'; }
    if (!email && !password) { error_msg = 'Username/Password is required'; }

    //if there is error return after giving message
    if (error_msg !== '') {
      alertService.showToast('error', error_msg);
      setErrMsg(error_msg)
      return false;
    }

    setErrMsg(error_msg);
    setInProgress(true);

    //Send Login Request
    const hashPassword = SHA512(password);
    const hasedPassword = hashPassword.toString(Base64);
    const loginPayLoad = {
      username: email,
      password: hasedPassword,
    };

  
    // https://support-dev-api.bydata.com/
    APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'iassist/login/', loginPayLoad, false, 'POST', null, false)
      .then(response => {
        console.log('response', response);
        if (response.access_token && response.access_token !== '') {
          //Redirect to home page after succcessful login
           let user_details = getUserDetailsFromToken(response.access_token);
          // let user_details = getUserDetailsFromToken(access_token);
          // let user_info = user_details.identity;
          // user_info.default_home_url = "/";
          // this.getSmallToken(response.access_token);
          setDesktopUserSession(response.access_token, user_details); //Set token and user details in session
          
          setTimeout(()=>{
            console.log('Successfully Login');
            setAuthentication(true)
            setIsLoggedIn(true)
          });
          
        } else {
            setErrMsg(response.msg);
            setInProgress(false);
        }
      })
      .catch(err => {
        setErrMsg(err.msg);
        setInProgress(false);
      });
  }


  return (
    <div className='login-page'>
      <h1>Login</h1>
      <form onSubmit={handleSubmit}>
        <label>
          {/* Application Name: */}
          <input autoComplete="off"  placeholder='Enter Application Name' type="text" value={appName} onChange={handleAppNameChange} />
        </label>
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
import React, { useState } from 'react';
import "./Login.scss"

const LoginPage = ({setOpenSupport,setIsLoggedIn}) => {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appName, setAppName] = useState('');



  const handleAppNameChange = (event) => {
    setAppName(event.target.value)
  }
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setOpenSupport(true)
    setIsLoggedIn(true)
  };



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
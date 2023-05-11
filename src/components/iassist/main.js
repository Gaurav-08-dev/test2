import React, { memo, useEffect, useRef, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getDesktopToken, getTokenClient, getUserDetailsFromToken, removeUserSession, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss';
import alertService from '../../services/alertService';
import APIService from '../../services/apiService';
import LoginPage from "./Login/Login";
import SupportContainer from "./SupportContainer";
import { isElectron } from "./Utilityfunction";
let webSocket;

const Main = () => {
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [isElectronApp,setIsElectronApp] = useState(false);
    const [isAuthenticationSuccess, setIsAuthenticationSuccess] = useState(false);



    useEffect(() => {
        console.log('useeffe')
        const checkIsElectron = isElectron();
        if (checkIsElectron && getDesktopToken()) {
            setIsAuthenticationSuccess(true);
            setIsLoggedIn(true);
        }
        setIsElectronApp(checkIsElectron)
    }, []) //eslint-disable-line

    const Logout = () => {
        removeUserSession();
        setIsAuthenticationSuccess(false);
        setIsLoggedIn(false);
    }

    return (
        <>
            {/* {btnId.current === 'btn-support-wrapper' && <div id="btn-support-wrapper"> <button>Open</button></div>} */}
            <button onClick={isAuthenticationSuccess?() => Logout(): (e) => {e.preventDefault()}}>{isAuthenticationSuccess? 'Logout': 'Login'}</button>
            {(isAuthenticationSuccess || !isElectronApp) && 
            <SupportContainer />}

            {
                isElectronApp && !isLoggedIn && <LoginPage 
                    setAuthentication={setIsAuthenticationSuccess}
                    setIsLoggedIn={setIsLoggedIn}
                />
            }
        </>

    )
}

export default Main;





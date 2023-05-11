import React, { memo, useEffect, useRef, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, removeUserSession, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss';
import alertService from '../../services/alertService';
import APIService from '../../services/apiService';
import LoginPage from "./Login/Login";
import SupportContainer from "./SupportContainer";
let webSocket;

const Main = () => {
    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [isElectronApp,setIsElectronApp] = useState(false);
    const [isAuthenticationSuccess, setIsAuthenticationSuccess] = useState(false);

    function isElectron() {
        // Renderer process
        if (typeof window !== 'undefined' && typeof window.process === 'object' && window.process.type === 'renderer') {
            // return true;
            setIsElectronApp(true)
        }

        // Main process
        if (typeof process !== 'undefined' && typeof process.versions === 'object' && !!process.versions.electron) {
            // return true;
            setIsElectronApp(true)

        }

        // Detect the user agent when the `nodeIntegration` option is set to true
        if (typeof navigator === 'object' && typeof navigator.userAgent === 'string' && navigator.userAgent.indexOf('Electron') >= 0) {
            // return true;
            setIsElectronApp(true)

        }
        console.log('not electron')
        // return false;
        setIsAuthenticationSuccess(true)
        setIsElectronApp(false)

    }

    useEffect(() => {
        console.log('useeffe')
        isElectron()
    }, []) //eslint-disable-line

    const Logout = () => {
        removeUserSession();
        setIsAuthenticationSuccess(false);
        setIsLoggedIn(false);
    }

    return (
        <>
            {/* {btnId.current === 'btn-support-wrapper' && <div id="btn-support-wrapper"> <button>Open</button></div>} */}
            <button onClick={isAuthenticationSuccess? Logout: {}}>{isAuthenticationSuccess? 'Logout': 'Login'}</button>
            {(isAuthenticationSuccess || !isElectronApp) && <SupportContainer />}

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





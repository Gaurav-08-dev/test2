import React, { useEffect, useState } from "react";
import { getDesktopToken, removeUserSession } from "../../utils/Common";
import '../../style/Global.scss';
import LoginPage from "./Login/Login";
import SupportContainer from "./SupportContainer";
import { isElectron } from "./Utilityfunction";
import './Main.scss';

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
        setIsElectronApp(checkIsElectron);
    }, []) //eslint-disable-line

    const logout = () => {
        removeUserSession();
        setIsAuthenticationSuccess(false);
        setIsLoggedIn(false);
    }

    return (
        <>
            {/* {btnId.current === 'btn-support-wrapper' && <div id="btn-support-wrapper"> <button>Open</button></div>} */}
            {/* {isAuthenticationSuccess && <button className="iassist-logout" onClick={() => Logout()}>Logout</button>} */}
            {(isAuthenticationSuccess || !isElectronApp) && <SupportContainer logOut={logout} />}

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





import React, { useEffect, useState } from "react";
import { getDesktopToken, removeUserSession } from "../../utils/Common";
import '../../style/Global.scss';
import LoginPage from "./Login/Login";
import SupportContainer from "./SupportContainer";
import { isElectron } from "./Utilityfunction";


const Main = () => {

    const [isLoggedIn,setIsLoggedIn]=useState(false);
    const [isElectronApp,setIsElectronApp] = useState(false);
    const [isAuthenticationSuccess, setIsAuthenticationSuccess] = useState(false);
    const [loader, setLoader] = useState(true);

    useEffect(() => {
        const bodyElement = document.getElementsByTagName('body')[0];
        const linkTag = document.createElement("link");
        linkTag.href = 'https://iassist-assets.s3.us-east-2.amazonaws.com/css/iassist.css';
        linkTag.rel = "stylesheet";
        linkTag.id = "iassist-css";
        bodyElement.append(linkTag);
        
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
            {(isAuthenticationSuccess || !isElectronApp) && <SupportContainer logOut={logout} setLoader={setLoader}/>}

            {isElectronApp && loader && isLoggedIn && <div style={{color: '#fff',display:'flex', alignItems:'center', justifyContent:'center', height:'95vh'}}>Loading...</div> }

            {
                isElectronApp && !isLoggedIn && <LoginPage 
                    setAuthentication={setIsAuthenticationSuccess}
                    setIsLoggedIn={setIsLoggedIn}
                    setLoader={setLoader}
                />
            }
        </>

    )
}

export default Main;








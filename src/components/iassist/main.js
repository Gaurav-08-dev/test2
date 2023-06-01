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
        
        const checkIsElectron = isElectron();
        if (checkIsElectron && getDesktopToken()) {
            setIsAuthenticationSuccess(true);
            setIsLoggedIn(true);
        }
        setIsElectronApp(checkIsElectron);

            // caches.keys().then((names) => {
            //     names.forEach((name) => {
            //         caches.delete(name);
            //     });
            // });
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








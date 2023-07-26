import React, { useEffect, useRef, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss';
import alertService from '../../services/alertService';
import APIService from '../../services/apiService';
import { isElectron } from "./Utilityfunction";
import VersionMessage from "./VersionMessage";
import { updateScriptTag } from "../../services/apiService";
let webSocket;


const SupportContainer = ({ logOut, setLoader }) => {

    const [openSupport, setOpenSupport] = useState(false);
    const [platformId, setPlatformId] = useState('');
    const AppId = useRef(window?.iAssistAppId);
    const tokenConstant = useRef('');
    const btnId = useRef('btn-support-wrapper');
    const panelPosition = useRef('Right');
    const top = useRef('');
    const checkApptype = useRef(isElectron());
    const [configLoader, setConfigLoader] = useState(false);
    const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);
    const [isButtonClick, setIsButtonClick] = useState(false);


    const handleVersionAvailable = () => {
        setIsNewVersionAvailable(true);
    }


    const getConfigDetails = async () => {

        setConfigLoader(true);

        if (AppId.current) {
            const tokens = `Bearer ${AppId.current}`;
            APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `config/`, null, false, 'GET', null, tokens, handleVersionAvailable)
                .then(response => {

                    if (JSON.stringify(response) === "{}") {
                        return;
                    }
                    if (response) {
                        // setConfigData(response)
                        tokenConstant.current = response?.application_parameters.user_session_key;
                        btnId.current = response?.application_parameters.button_id;
                        panelPosition.current = response?.application_parameters.app_position;
                        top.current = response?.application_parameters.top_position;
                        setPlatformId(response?.id);

                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'platform', response?.application_parameters?.platform);
                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'buttonId', btnId.current);
                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'config_app_id', response?.id);

                        simplifyToken();
                        setConfigLoader(false);

                    }
                })
                .catch(err => {
                    setConfigLoader(false);
                });
        }
    }

    const simplifyToken = async () => {

        const token = localStorage.getItem(tokenConstant.current);
        const user = getUserDetailsFromToken(token);
        const userData = user?.identity || user;
        setUserData(userData);

        if (token) {
            const tokens = `Bearer ${token}`;
            const res = await fetch(Constants.API_IASSIST_BASE_URL + `auth/client/`, {
                method: 'GET',
                headers: {
                    'Authorization': tokens,
                    'App-Version': Constants.IASSIST_SITE_VERSION
                }
            })
            const result = await res.json();
            setUserToken(result.token)
            connectSocket();
        }
    }

    const connectSocket = () => {

        const tokenFromLocalStorage = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token');

        if (tokenFromLocalStorage && tokenFromLocalStorage !== 'undefined') {
            if (webSocket === undefined || (webSocket.readyState !== WebSocket.OPEN && webSocket.readyState !== WebSocket.CONNECTING)) {
                if (webSocket === undefined || webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING) {
                    const jwt_token = getTokenClient();

                    webSocket = new WebSocket(Constants.API_WEBSOCKET_URL + `listenreply/`, jwt_token);
                    //    setOpenSupport(true) // when we have to open without click

                }
                let buttonElement = document.getElementById(btnId.current);
                if (buttonElement && buttonElement.children.length > 0) buttonElement.children[0].disabled = false;
                console.log('listen connection');
            }
            webSocket.onmessage = function (evt) {
                let received_msg = JSON.parse(evt.data);
                if (received_msg.type === 'count') {
                    let isUnread = received_msg.unread_tickets_count > 0 ? true : false;
                    sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(received_msg.unread_tickets))
                    changeValue(isUnread);
                }
                if (received_msg.type === 'chat') {
                    changeValue(true);
                    if (document.getElementsByClassName('toast-wrapper')[0]) return;
                    alertService.showToast('info', `New Message Arrived on topic id: ${received_msg.topic_id}`);
                }
                if (received_msg.type === 'version') {
                    const { version } = received_msg.data;

                    console.log(version , Constants.IASSIST_SITE_VERSION)
                    if (version !== Constants.IASSIST_SITE_VERSION) {

                        alertService.showToast('info', 'iAssist New update is available, Please Refresh',{autoClose:true},5000);

                        setTimeout(()=>{
                            updateScriptTag()
                        },[6000])
                    }

                    console.log(version, Constants.IASSIST_SITE_VERSION)
                }
            };

            webSocket.onopen = function () {
                console.log("websocket listen connected")
                if (checkApptype.current) {
                    setOpenSupport(true);
                    setLoader(false);
                }
            };

            webSocket.onclose = function () {
                connectSocket();
                console.log("connection listen Closed");
            };
        }
    }

    const changeValue = (unread) => {

        if (unread) {
            let btn = document.getElementById(btnId.current);
            let span = document.createElement('span');
            span.id = 'iassist-unread';
            span.style.backgroundColor = 'red';
            span.style.position = 'absolute';
            span.style.width = '6px';
            span.style.height = '6px';
            span.style.marginLeft = '3px';
            span.style.borderRadius = '50%';
            span.style.marginTop = '-16px';
            // span.style.top = '6px';
            if (btn) btn.append(span);
        }
    }

    const closePane = () => {
        setOpenSupport(false);
    }

    const supportButtonClick = (e) => {

        setIsButtonClick(true)
        const triggerButton = document.getElementById(btnId.current);


        if (triggerButton?.contains(e.target) && webSocket) {
            e.preventDefault();
            setOpenSupport(true);
            setIsButtonClick(false)
            setIsNewVersionAvailable(false)
        } else {


            if (!webSocket && triggerButton?.contains(e.target)) {

                setIsButtonClick(true)
                // getConfigDetails('onButtonClick');
                if (!configLoader) getConfigDetails();
                const toast = document.getElementsByClassName('toast-wrapper');
                if (toast && toast.length > 0 && toast[0]) return;
                //   alertService.showToast('process', 'Loading...');
            }
        }
    }

    useEffect(() => {

        if (localStorage.length) {
            getConfigDetails();
        }

        return (() => {

            if (webSocket) { webSocket.close(); }
            setIsButtonClick(false)
            setIsNewVersionAvailable(false)
            setOpenSupport(false)
        })

    }, []) //eslint-disable-line

    useEffect(() => {

        // alertService.showToast('info', `New Message Arrived on topic id: ${''}`,{autoClose:true},10000)
        const prevAppId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'appid');
        const configDetails = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config'));

        if (prevAppId === AppId.current && configDetails) {

            tokenConstant.current = configDetails.user_session_key;
            btnId.current = configDetails.button_id;
            panelPosition.current = configDetails.app_position;
            top.current = configDetails.top_position;
            simplifyToken();

            if (!webSocket) {
                let buttonElement = document.getElementById(btnId.current);
                if (buttonElement && buttonElement.children.length > 0) buttonElement.children[0].disabled = true;
            }
            if (webSocket && (webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING)) {

                if (sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
                    simplifyToken();
                }

                setTimeout(() => {
                    connectSocket();

                }, 200);

            }
        }


    }, [btnId.current, tokenConstant.current]) // eslint-disable-line 

    useEffect(() => {

        document.addEventListener('click', supportButtonClick);

        return () => {
            document.removeEventListener('click', supportButtonClick);
        }
    }, []) // eslint-disable-line 
    return (
        <>
            {/* {btnId.current === 'btn-support-wrapper' && <div id="btn-support-wrapper"> <button>Open</button></div>} */}

            {/* {isNewVersionAvailable && isButtonClick && <div className="iassist-version-change-message">
                <p>New Version is available, please update app before start using it</p>
                <p>To update:</p>
                <ul>
                    <li>Mac: Cmd + Shift + r</li>
                    <li>Windows: Ctrl + Shift + r</li>
                </ul>
                <button className='iassist-header-close-message' onClick={() => setIsNewVersionAvailable(false)}></button>
            </div>} */}

            {openSupport &&
                <Support
                    closePane={closePane}
                    webSocket={webSocket}
                    panelPosition={panelPosition.current}
                    platformId={platformId}
                    logOut={logOut}
                // setIsNewVersionAvailable={setIsNewVersionAvailable}
                />}

            {isNewVersionAvailable && isButtonClick &&
                <VersionMessage
                    setIsNewVersionAvailable={setIsNewVersionAvailable}
                />
            }

            {openSupport &&
                <Support
                    closePane={closePane}
                    webSocket={webSocket}
                    panelPosition={panelPosition.current}
                    platformId={platformId}
                    logOut={logOut}
                />}

        </>

    )
}

export default SupportContainer;





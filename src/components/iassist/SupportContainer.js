import React, {useEffect, useRef, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss';
import alertService from '../../services/alertService';
import APIService from '../../services/apiService';
import { isElectron } from "./Utilityfunction";
let webSocket;

const SupportContainer = ({logOut, setLoader}) => {


    const [openSupport, setOpenSupport] = useState(false);
    const [platformId, setPlatformId] = useState('');
    const AppId = useRef(window?.iAssistAppId);
    const tokenConstant = useRef('');
    const btnId = useRef('btn-support-wrapper');
    const panelPosition = useRef('Right');
    const top = useRef('');
    // const [storedTicket, setStoredTicket] = useState({Active : [], Resolved : []});
    const checkApptype = useRef(isElectron());
    // const [configData, setConfigData] = useState('');
    const [configLoader, setConfigLoader] = useState(false);

    const getConfigDetails = async (type) => {

        // app_id=${AppId.current}
        setConfigLoader(true);

        if (AppId.current) {
            const tokens = `Bearer ${AppId.current}`;
            APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `config/`, null, false, 'GET', null, tokens)
                .then(response => {

                    if (response) {
                        // setConfigData(response)
                        tokenConstant.current = response.application_parameters.user_session_key;
                        btnId.current = response.application_parameters.button_id;
                        panelPosition.current = response.application_parameters.app_position;
                        top.current = response.application_parameters.top_position;
                        setPlatformId(response?.id);

                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'platform', response?.application_parameters?.platform);
                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'buttonId', btnId.current);
                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'config_app_id', response?.id);
                        simplifyToken();
                        setConfigLoader(false);
                        // if (type === 'onButtonClick') setOpenSupport(true)
                    }
                })
                .catch(err => {
                    setConfigLoader(false);
                    if (document.getElementsByClassName('toast-wrapper')[0]) return;
                    alertService.showToast('error', err.msg);
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
                } if (received_msg.type === 'chat') {
                    changeValue(true);
                    if (document.getElementsByClassName('toast-wrapper')[0]) return;
                    alertService.showToast('info', `New Message Arrived on topic id: ${received_msg.topic_id}`);
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

        const triggerButton = document.getElementById(btnId.current);

        if (triggerButton?.contains(e.target) && webSocket) {
            e.preventDefault();
            setOpenSupport(true);
        } else {
            if (!webSocket && triggerButton?.contains(e.target)) {

                console.log("here4")
                // getConfigDetails('onButtonClick');
                if (!configLoader) getConfigDetails();
                if (document.getElementsByClassName('toast-wrapper')[0]) return;
                alertService.showToast('process', 'Loading...');
            }
        }
    }

    useEffect(() => {


        // const prevAppId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'appid');
        // const configDetails = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config'));

        // if (prevAppId !== AppId.current || !configDetails) {
        if (localStorage.length) {
            getConfigDetails();
        }

        

        return (() => {

            if (webSocket) {webSocket.close();}
            setOpenSupport(false)
        })

    }, []) //eslint-disable-line

    useEffect(() => {

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





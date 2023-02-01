import React, { memo, useEffect, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss'


let webSocket;
let tokenConstant = document.getElementById("iassist-panel-wrapper").getAttribute("data-token") || 'sight_';

let btnId = document.getElementById("iassist-panel-wrapper").getAttribute("data-buttonid") || 'btn';


const SupportContainer = () => {

    const [OpenSupport, setOpenSupport] = useState(false);

    // if (webSocket === undefined) {
    //     let buttonElement = document.getElementById(btnId);
    //     if(buttonElement && buttonElement.children.length > 0)buttonElement.children[0].disabled = true;
    // }

    const simplifyToken = async () => {
        let token = localStorage.getItem(tokenConstant + 'token');
        const user = getUserDetailsFromToken(token);
        let userData = user?.identity || user;
        setUserData(userData);
        if (token) {
            const tokens = `Bearer ${token}`;
            // let url = tokenConstant === 'iassist' ? `auth/support/`: `auth/client/`;
            let res = await fetch(Constants.API_IASSIST_BASE_URL + `auth/client/`, {
                method: 'GET',
                headers: {
                    'Authorization': tokens
                }
            })
            let result = await res.json();
            setUserToken(result.token)
            connectSocket();
        }

    }

    const connectSocket = () => {
        if (localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
            if (webSocket === undefined || (webSocket.readyState !== WebSocket.OPEN && webSocket.readyState !== WebSocket.CONNECTING)) {
                if (webSocket === undefined || webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING) {
                    const jwt_token = getTokenClient();

                    webSocket = new WebSocket(Constants.API_WEBSOCKET_URL + `listenreply/`, jwt_token);
                    //    setOpenSupport(true) // when we have to open without click

                }
                let buttonElement = document.getElementById(btnId);
                if (buttonElement && buttonElement.children.length > 0) buttonElement.children[0].disabled = false;
                console.log('listen connection');
            }
            webSocket.onmessage = function (evt) {
                var received_msg = JSON.parse(evt.data);
                if (received_msg.type === 'count') {
                    let isUnread = received_msg.unread_tickets_count > 0 ? true : false;
                    localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(received_msg.unread_tickets))
                    changeValue(isUnread);
                } if (received_msg.type === 'chat') {
                    changeValue(true);
                }
            };

            webSocket.onopen = function () {
                console.log("websocket listen connected")
            };

            webSocket.onclose = function () {
                console.log("connection listen Closed");
            };
        }
    }

    const changeValue = (unread) => {

        if (unread) {
            let btn = document.getElementById(btnId);
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

        // if(document.getElementById('iassist-css'))document.getElementById('iassist-css').remove();
        // if(document.getElementById('iassist-html'))document.getElementById('iassist-html').remove();
        setOpenSupport(false);
        // if(document.getElementById('test-div'))document.getElementById('test-div').remove();

    }

    useEffect(() => {

        if (!webSocket) {
            let buttonElement = document.getElementById(btnId);
            if (buttonElement && buttonElement.children.length > 0) buttonElement.children[0].disabled = true;
        }

        const bodyElement = document.getElementsByTagName('body')[0];

        const linkTag = document.createElement("link");
        linkTag.href = 'https://iassist-assets.s3.us-east-2.amazonaws.com/css/iassist.css';
        linkTag.rel = "stylesheet";
        linkTag.id = "iassist-css";
        bodyElement.append(linkTag);

        if (webSocket && (webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING)) {
            if (localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
                simplifyToken();
            }

            setTimeout(() => {
                connectSocket();

            }, 200);

        }


        //    console.log(document.getElementById(btnId))
        document.getElementById(btnId)?.addEventListener('click', supportButtonClick)

    }, [])

    const supportButtonClick = (e) => {
        e.preventDefault();
        setOpenSupport(true);
    }

    useEffect(() => {

        simplifyToken();
        let container = document.getElementById('support-main-conatiner');

        //     if (container && position) {
        //         if (position.toLowerCase() === 'left') {
        //             container.style.left = 0;
        //         } else if (position.toUpperCase() === 'right') {
        //             container.style.right = '10px';
        //         } else if (position.toUpperCase() === 'center') {
        //             container.style.left = '40%';
        //         }
        //     }

        document.addEventListener('mouseup', (event) => {
            let container = document.getElementById('support-main-conatiner');


            let buttonIcon = document.getElementById(btnId);

            let recorderWrapper = document.getElementById('video-record-wrapper');

            if ((container && !(container.contains(event.target))) && buttonIcon && !(buttonIcon.contains(event.target)) && !recorderWrapper) {

                closePane();

            }
        })

    }, [])


    return (
        <div id="support-main-conatiner">

            {btnId === 'btn' && <div id="btn"> <button>one</button></div>}
            {OpenSupport && <Support closePane={closePane} webSocket={webSocket} />}
        </div>

    )
}

export default memo(SupportContainer);
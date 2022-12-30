import React, { memo, useEffect, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss'


let webSocket;
let tokenConstant = document.getElementById("test-div").getAttribute("data-token") || 'sight';

let btnId = document.getElementById("test-div").getAttribute("data-buttonid") || 'btn';

console.log('btn', btnId);

const SupportContainer = () => {

    const [OpenSupport, setOpenSupport] = useState(false);

    const simplifyToken = async() => {
        let token = localStorage.getItem(tokenConstant + '_token');
        const user = getUserDetailsFromToken(token);
        setUserData(user?.identity);
        if (token) {
            const tokens = `Bearer ${token}`;
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
            if (webSocket=== undefined || (webSocket.readyState !== WebSocket.OPEN && webSocket.readyState !== WebSocket.CONNECTING)) {
            if (webSocket=== undefined || webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING) {
                const jwt_token = getTokenClient();
                console.log("here")
                webSocket= new WebSocket(Constants.API_WEBSOCKET_URL + `listenreply/`, jwt_token);
            //    setOpenSupport(true) // when we have to open without click

            }
            console.log('listen connection');
            }
            webSocket.onmessage = function (evt) {
                var received_msg = JSON.parse(evt.data);
                if(received_msg.type === 'count') {
                    let isUnread = received_msg.unread_tickets_count > 0? true: false;
                    localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(received_msg.unread_tickets))
                    changeValue(isUnread);
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
                span.style.marginTop = '-2px';
                // span.style.top = '6px';
                if(btn) btn.append(span);
            }
        }
  

    const closePane = () => {
        
            // if(document.getElementById('iassist-css'))document.getElementById('iassist-css').remove();
            // if(document.getElementById('iassist-html'))document.getElementById('iassist-html').remove();
            setOpenSupport(false);
            // if(document.getElementById('test-div'))document.getElementById('test-div').remove();
        
    }
  
    useEffect(() => {
        
        if (webSocket && (webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING)) {
            if (localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
                simplifyToken();
            }
            
            setTimeout(() => {
            connectSocket();

        }, 200);
           
       }


       console.log(document.getElementById(btnId))
       document.getElementById(btnId).addEventListener('click', supportButtonClick)

    },[])

    const supportButtonClick = (e) => {
        e.preventDefault();
        setOpenSupport(true);
    }

    useEffect(() => {

        simplifyToken();

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
       

            { btnId === 'btn' && <button id="btn">one</button>}
            {OpenSupport && <Support closePane={closePane} webSocket={webSocket}/>}

        </div>
    )
}

export default memo(SupportContainer);
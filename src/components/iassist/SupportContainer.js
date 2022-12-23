import React, { memo, useEffect, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, setUserData, setUserToken } from "../../utils/Common";
import ClickOutsideListener from './ClickOutsideListener';

let open = false;
let webSocket;
let token = Constants.jwt_token;
const SupportContainer = ( {btnId} ) => {

    const [OpenSupport, setOpenSupport] = useState(false);

    const simplifyToken = async() => {
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

    const connectSocket = () => {
        if (localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
            if (webSocket=== undefined || (webSocket.readyState !== WebSocket.OPEN && webSocket.readyState !== WebSocket.CONNECTING)) {
            if (webSocket=== undefined || webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING) {
                const jwt_token = getTokenClient();
                console.log("here")
                webSocket= new WebSocket(Constants.API_WEBSOCKET_URL + `listenreply/`, jwt_token);
        setOpenSupport(true)

            }
            console.log('listen connection');
            }
            webSocket.onmessage = function (evt) {
                var received_msg = JSON.parse(evt.data);
                if(received_msg.type === 'count') {
                    let isUnread = received_msg.unread_tickets_count > 0? true: false;
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
                span.style.backgroundColor = 'red';
                span.style.position = 'absolute';
                span.style.width = '6px';
                span.style.height = '6px';
                span.style.marginLeft = '3px';
                span.style.borderRadius = '50%';
                span.style.top = '6px';
                if(btn) btn.append(span);
            }
        }
  

    const closePane = () => {
        // open = false;
        // if (OpenSupport) {

        // console.log(document.getElementById('iassist-css'))
            if(document.getElementById('iassist-css'))document.getElementById('iassist-css').remove();
            if(document.getElementById('iassist-html'))document.getElementById('iassist-html').remove();

            setOpenSupport(false);
        // }
        
    }
    // const handleClick = (e) => {
    //     console.log(e);
    //     e.stopPropagation();
    //     e.preventDefault();
    //     if (!OpenSupport)
    //     setOpenSupport(true)
    // }
    useEffect(() => {
        
        if (webSocket && (webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING)) {
            if (localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
                simplifyToken();
            }
            
            setTimeout(() => {
            connectSocket();

        }, 200);
           
       }

    },[])

    useEffect(() => {

        const user = getUserDetailsFromToken(token);
        setUserData(user?.identity);

        simplifyToken();

        console.log(btnId)
        // let buttonIassistNavigate = document.getElementById(btnId);
        // buttonIassistNavigate.addEventListener('click', handleClick)

        

        document.addEventListener('mouseup', (event) => {
            let container = document.getElementById('support-main-conatiner');
            let buttonIcon = document.getElementById(btnId);

            if ((container && !(container.contains(event.target))) && buttonIcon && !(buttonIcon.contains(event.target))) {

                closePane();

            }
        })


    }, [])

    
    return (
    //    <ClickOutsideListener onOutsideClick={setOpenSupport}>
        <div id="support-main-conatiner">
       
            {OpenSupport && <Support closePane={closePane} webSocket={webSocket}/>}

        </div>
            // </ClickOutsideListener>
    )
}

export default memo(SupportContainer);
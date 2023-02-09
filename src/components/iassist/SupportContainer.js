import React, { memo, useEffect, useRef, useState } from "react";
import Support from "./Support";
import * as Constants from '../Constants';
import { getTokenClient, getUserDetailsFromToken, setUserData, setUserToken } from "../../utils/Common";
import '../../style/Global.scss';
import alertService from '../../services/alertService';
import APIService from '../../services/apiService';

let webSocket;

const staticToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE2NzU5MTgxMjAsIm5iZiI6MTY3NTkxODEyMCwianRpIjoiMWViYzRhY2EtOGRkYS00Yjc0LWIxNTYtYTM0ZDkwYjVkMjY1IiwiZXhwIjoyNTM5OTE4MTIwLCJpZGVudGl0eSI6eyJpZCI6MjI2LCJ1c2VyX25hbWUiOiJ0aGFudmVlckBhc2NlbmRldW0uY29tIiwiY291bnRyeSI6bnVsbCwiZW1haWwiOiJ0aGFudmVlckBhc2NlbmRldW0uY29tIiwiZmlyc3RfbmFtZSI6IlRoYW52ZWVyIiwicGhvbmUiOm51bGwsIm1pZGRsZV9uYW1lIjpudWxsLCJsYXN0X25hbWUiOm51bGwsIm9yZ2FuaXphdGlvbl9pZCI6MSwicGFyZW50X29yZ2FuaXphdGlvbl9pZCI6MCwiYXR0cmlidXRlcyI6W3t9XSwicmV2X3NoYXJlX3BlcmNlbnRfbDIiOjEuMCwicnQiOiI5RDl6dlF5bkltbk5ER3RzUUtoaVpyRCIsIm9yZ2FuaXphdGlvbiI6IkFzY2VuZGV1bSIsInByaXZpbGVnZXMiOnsic2VsbHNpZGUiOlsiVklFV19JTkRFWCIsIkNVU1RPTV9SRVBPUlRTIiwiU0lHSFRfSE9NRSIsIkFOQUxZU0lTX0hPTUUiLCJESUNUSU9OQVJZIiwiVklFV19QRVJGT1JNQU5DRSIsIlZJRVdfV0VCQU5BTFlUSUNTIiwiVklFV19BRFNFUlZFUiIsIlZJRVdfQURWRVJUSVNFUiIsIlNBVkVfUElWT1RfVklFVyIsIkNIQU5HRV9QQVNTV09SRCIsIlVQREFURV9QUk9GSUxFIiwiQ1JFQVRFX1VTRVIiLCJUUkVORF9NQVNURVJfRURJVE9SIiwiREFUQV9HUklEX0VESVRPUiIsIlZJRVdfRVZFTlRTIiwiVklFV19URUxFTUVUUlkiLCJWSUVXX0NISUxEX09SRyIsIkRBVEFfU1RSRUFNIiwiU0FWRV9QSVZPVF9WSUVXX01ZT1JHIiwiQUNDT1VOVFNfUkVDRUlWQUJMRSIsIkRFTEVURV9VU0VSIiwiTU9ESUZZX1VTRVIiXX0sImNsaWVudHMiOlt7ImlkIjowLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwMDAwIiwibmFtZSI6IkFzY2VuZGV1bSJ9LHsiaWQiOjEsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTAwNDUiLCJuYW1lIjoiQ3JhenlHYW1lcyJ9LHsiaWQiOjIsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTAxMDgiLCJuYW1lIjoiVHJhY2tlck5ldHdvcmsifSx7ImlkIjozLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwMTg5IiwibmFtZSI6IlVQSSJ9LHsiaWQiOjQsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTAyODgiLCJuYW1lIjoiRW11UGFyYWRpc2UifSx7ImlkIjo2LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwNTQwIiwibmFtZSI6IlN0YW5kczQifSx7ImlkIjo3LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkwNjkzIiwibmFtZSI6IkdhbWVQcmVzcyJ9LHsiaWQiOjksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTEwNTMiLCJuYW1lIjoiQm9sZGUifSx7ImlkIjoxMCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5MTI2MCIsIm5hbWUiOiJHcmVldGluZ3NJc2xhbmQifSx7ImlkIjoxMSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5MTQ4NSIsIm5hbWUiOiIyNDdHYW1lcyJ9LHsiaWQiOjEyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzkxNzI4IiwibmFtZSI6IldlaGNvIn0seyJpZCI6MTMsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTE5ODkiLCJuYW1lIjoiS29yZWFib28ifSx7ImlkIjoxOCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5MzU2NCIsIm5hbWUiOiJDZWxlYnNQdWxzZSJ9LHsiaWQiOjIwLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzk0MzIwIiwibmFtZSI6IkVsZXBoYW50Sm91cm5hbCJ9LHsiaWQiOjIxLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzk0NzI1IiwibmFtZSI6IkZpc2NhbE5vdGUifSx7ImlkIjoyMiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5NTE0OCIsIm5hbWUiOiJUZW1wdGFsaWEifSx7ImlkIjoyMywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5NTU4OSIsIm5hbWUiOiJXZUJsb2cifSx7ImlkIjoyNCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5NjA0OCIsIm5hbWUiOiJUaGVDaGl2ZSJ9LHsiaWQiOjI1LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzk2NTI1IiwibmFtZSI6Ikt1ZWV6In0seyJpZCI6MjYsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTcwMjAiLCJuYW1lIjoiVGhlTGF5b2ZmIn0seyJpZCI6MjcsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTc1MzMiLCJuYW1lIjoiVE5NYXJrZXRpbmcifSx7ImlkIjoyOCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5ODA2NCIsIm5hbWUiOiJUaGVTb3VyY2UifSx7ImlkIjozMCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2M5OTE4MCIsIm5hbWUiOiJRdWl6b255In0seyJpZCI6MzEsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjOTk3NjUiLCJuYW1lIjoiVGhlMTgifSx7ImlkIjozMiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDAzNjgiLCJuYW1lIjoiTGFrZUxpbmsifSx7ImlkIjozNCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDE2MjgiLCJuYW1lIjoiVm9sYXJlTm92ZWxzIn0seyJpZCI6MzUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTAyMjg1IiwibmFtZSI6IlNjb3Jlc0luTGl2ZSJ9LHsiaWQiOjM3LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwMzY1MyIsIm5hbWUiOiJFbnRodXNlZERpZ2l0YWwifSx7ImlkIjozOCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDQzNjQiLCJuYW1lIjoiWW91bmdIb2xseXdvb2QifSx7ImlkIjozOSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMDUwOTMiLCJuYW1lIjoiTWFtYXNVbmN1dCJ9LHsiaWQiOjQyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwNzM4OCIsIm5hbWUiOiJQdWJPY2VhbiJ9LHsiaWQiOjQzLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwODE4OSIsIm5hbWUiOiJTVlRQZXJmb3JtYW5jZSJ9LHsiaWQiOjQ0LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwOTAwOCIsIm5hbWUiOiJUaGVEYWlseURvdCJ9LHsiaWQiOjQ1LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEwOTg0NSIsIm5hbWUiOiJFeGNlbEpldCJ9LHsiaWQiOjQ2LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzExMDcwMCIsIm5hbWUiOiJGbGlja3IifSx7ImlkIjo0OCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMTI0NjQiLCJuYW1lIjoiUXppbmdvIn0seyJpZCI6NDksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTEzMzczIiwibmFtZSI6IlZlcnN1cyJ9LHsiaWQiOjUwLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzExNDMwMCIsIm5hbWUiOiJJbnF1aXJlcm5ldCJ9LHsiaWQiOjUxLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzExNTI0NSIsIm5hbWUiOiJNZWRpYVBhcnRuZXJzIn0seyJpZCI6NTIsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTE2MjA4IiwibmFtZSI6IlF1aXpsZXQifSx7ImlkIjo1NCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMTgxODgiLCJuYW1lIjoiRWlnaHRpZXNLaWRzIn0seyJpZCI6NTUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTE5MjA1IiwibmFtZSI6IkxvbGFEaWdpdGFsTWVkaWEifSx7ImlkIjo1NiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjAyNDAiLCJuYW1lIjoiU2Nyb2xsaW4ifSx7ImlkIjo1NywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjEyOTMiLCJuYW1lIjoiTGV0c1J1biJ9LHsiaWQiOjU4LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyMjM2NCIsIm5hbWUiOiJJbWd1ciJ9LHsiaWQiOjU5LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyMzQ1MyIsIm5hbWUiOiJKdW5nbGVDcmVhdGlvbnMifSx7ImlkIjo2MCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjQ1NjAiLCJuYW1lIjoiUGlqcGVyUHVibGlzaGluZyJ9LHsiaWQiOjYxLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyNTY4NSIsIm5hbWUiOiJEYWlseUhlcmFsZCJ9LHsiaWQiOjYyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEyNjgyOCIsIm5hbWUiOiJDb250ZW50SVEifSx7ImlkIjo2MywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjc5ODkiLCJuYW1lIjoiTWVldE1pbmRmdWwifSx7ImlkIjo2NCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMjkxNjgiLCJuYW1lIjoiVGVzdCA1In0seyJpZCI6NjUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTMwMzY1IiwibmFtZSI6IkRlbW8ifSx7ImlkIjo2NiwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzE1ODAiLCJuYW1lIjoiQ2FsY3VsYXRvclNvdXAifSx7ImlkIjo2NywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzI4MTMiLCJuYW1lIjoiVGhlR3JhZENhZmUifSx7ImlkIjo2OCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzQwNjQiLCJuYW1lIjoiRGVjaWRvIn0seyJpZCI6NjksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTM1MzMzIiwibmFtZSI6IlN0dWR5VG9uaWdodCJ9LHsiaWQiOjcwLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzEzNjYyMCIsIm5hbWUiOiJHYXRlMkhvbWUifSx7ImlkIjo3MSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxMzc5MjUiLCJuYW1lIjoiOUdBRyJ9LHsiaWQiOjczLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzE0MDU4OSIsIm5hbWUiOiJNZWRTdHVkZW50c09ubGluZSJ9LHsiaWQiOjc0LCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzE0MTk0OCIsIm5hbWUiOiJIVE1lZGlhIn0seyJpZCI6NzUsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTQzMzI1IiwibmFtZSI6IkZyZWVjb252ZXJ0In0seyJpZCI6NzYsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTQ0NzIwIiwibmFtZSI6IlNjaG5hZXBwY2hlbmZ1Y2hzIn0seyJpZCI6NzcsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTQ2MTMzIiwibmFtZSI6Ik9CVjIifSx7ImlkIjo3OCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNDc1NjQiLCJuYW1lIjoiUGhvdG9DaXJjbGUifSx7ImlkIjo4MCwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNTA0ODAiLCJuYW1lIjoiT2FyZXgifSx7ImlkIjo4MSwiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNTE5NjUiLCJuYW1lIjoiSmV0cHVuayJ9LHsiaWQiOjgyLCJkaXNwbGF5X2NsaWVudF9pZCI6ImFzYzE1MzQ2OCIsIm5hbWUiOiJQbHVnc2hhcmUifSx7ImlkIjo4MywiZGlzcGxheV9jbGllbnRfaWQiOiJhc2MxNTQ5ODkiLCJuYW1lIjoiVHJhY2t5b3VyRGl2aWRlbmRzIn0seyJpZCI6ODQsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTU2NTI4IiwibmFtZSI6IlRlc3RDbGllbnQxIn0seyJpZCI6ODYsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTU5NjYwIiwibmFtZSI6IlRlc3RDbGllbnQyIn0seyJpZCI6ODcsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTYxMjUzIiwibmFtZSI6IlRlc3RDbGllbnQzIn0seyJpZCI6ODgsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTYyODY0IiwibmFtZSI6IlRlc3RDbGllbnQ0In0seyJpZCI6ODksImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY0NDkzIiwibmFtZSI6IlRlc3RDbGllbnQ1In0seyJpZCI6OTAsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY2MTQwIiwibmFtZSI6IlRlc3RDbGllbnQ2In0seyJpZCI6OTEsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY3ODA1IiwibmFtZSI6IlRlc3RDbGllbnQ3In0seyJpZCI6OTIsImRpc3BsYXlfY2xpZW50X2lkIjoiYXNjMTY5NDg4IiwibmFtZSI6IlRlc3RDbGllbnQ4In1dLCJsMiI6MS4wLCJsYXN0X2ZldGNoZWRfY2xpZW50IjoxfSwiZnJlc2giOmZhbHNlLCJ0eXBlIjoiYWNjZXNzIn0.mIUt6Wpg9DsrSJ4smIHdP51QWjQdX3Yg_ZjFagG1NFU';

const SupportContainer = () => {

    const [OpenSupport, setOpenSupport] = useState(false);
    const AppId = useRef(window?.iAssist);
    // || 'were-wrww-rssf-2dsw'
    const tokenConstant = useRef('');
    const btnId = useRef('trigger-btn');
    const panelPosition = useRef('Right');
    const top = useRef('');
    const [configData, setConfigData] = useState('');

    const getConfigDetails = async () => {
        if (staticToken) {
            const tokens = `Bearer ${staticToken}`;
            APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `config/?app_id=${AppId.current}`, null, false, 'GET', null, tokens)
                    .then(response => {

                        if (response) {
                            setConfigData(response)
                            tokenConstant.current = response.user_session_key;
                            btnId.current = response.button_id;
                            panelPosition.current = response.app_position;
                            top.current = response.top_position;
                            console.log(response)
                            localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'appid', AppId.current);
                            localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'config',JSON.stringify(response));
                            simplifyToken()

                        }

                    })
                    .catch(err => {

                        alertService.showToast('error', err.msg);

                    });
        }
    }

    const simplifyToken = async () => {
        let token = localStorage.getItem(tokenConstant.current);
        const user = getUserDetailsFromToken(token);
        let userData = user?.identity || user;
        setUserData(userData);
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

        // if(document.getElementById('iassist-css'))document.getElementById('iassist-css').remove();
        // if(document.getElementById('iassist-html'))document.getElementById('iassist-html').remove();
        setOpenSupport(false);
        // if(document.getElementById('test-div'))document.getElementById('test-div').remove();

    }

    useEffect(() => {
        const PrevAppId = localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'appid');
        console.log('prevappid', PrevAppId);
        const configDetails = JSON.parse(localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config'));
        console.log(configDetails, 'prvconfig', configDetails);

        if (PrevAppId !== AppId.current || !configDetails) {
            getConfigDetails();
        }

        const bodyElement = document.getElementsByTagName('body')[0];

        const linkTag = document.createElement("link");
        linkTag.href = 'https://gaurav-08-dev.github.io/test2/index.css';
        linkTag.rel = "stylesheet";
        linkTag.id = "iassist-css";
        bodyElement.append(linkTag);

    }, [])

    useEffect(() => {
        const PrevAppId = localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'appid');
        const configDetails = JSON.parse(localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config'));
        if (PrevAppId === AppId.current && configDetails) {
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
                if (localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') && localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'token') !== 'undefined') {
                    simplifyToken();
                }

                setTimeout(() => {
                    connectSocket();

                }, 200);

            }
        }

        //    console.log(document.getElementById(btnId))
        document.addEventListener('click', supportButtonClick);

    }, [btnId.current])

    const supportButtonClick = (e) => {
        const triggeredButton = document.getElementById(btnId.current);
        if (triggeredButton?.contains(e.target)) {
            e.preventDefault();
            console.log('click');
            setOpenSupport(true);
        }
    }


    return (
        // support-main-conatiner
        <>

            {/* {btnId.current === 'trigger-btn' && <div id="trigger-btn"> <button>one</button></div>} */}
            {OpenSupport && <Support closePane={closePane} webSocket={webSocket} />}
        </>

    )
}

export default memo(SupportContainer);
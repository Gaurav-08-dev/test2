import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import debounce from "lodash.debounce";
import './newRoom.scss';
import * as Constants from '../Constants';
import { getTokenClient, getUser } from '../../utils/Common';
import alertService from '../../services/alertService';
// import Support from './Support';
import Avatar from '../Avatar/Avatar';
import LoadingScreen from './loader/Loading';
import APIService from '../../services/apiService';
import UserList from './userlist/UserList';
import FeedBack from './feedback/Feedback';
import TicketReopen from './feedback/TicketReopen';
import Detail from './userlist/Detail';
import Delete from './DeleteConfirmation/Delete';
import Player from './Player/Player';
import VideoRecord from './VideoRecord/VideoRecord';
import PlayButton from './Player/PlayButton';
import RecordOption from './MediaOption/RecordOption';
import Steno from 'react-steno';
import parse from 'html-react-parser';
import { getUserNameBasedOnId, getUserNameImage, getTimeZone, isElectron } from "./Utilityfunction";


const pageNumber = 1;
const pageSize = 10;
let msg = [];
let ws;
let scrollHeight = 0;
let totalCount = 0;
let borderChatId = '';
let parent_note_id = 0;
let collabId = [];
let takeSupportId = [];
let playerType = '';
let clickBackButton = false;
let singleScroll = false;

const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.m4v', '.webm'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg', '.webp'];


const otherExtensions = [
    // Document extensions
    '.doc', '.docx', '.pdf', '.txt', '.rtf', '.xls', '.xlsx', '.ppt', '.pptx',

    // Audio extensions
    '.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma',

    // Archive extensions
    '.zip', '.rar', '.tar', '.gz', '.7z', '.iso',

    // Code extensions
    '.html', '.css', '.js', '.py', '.java', '.cpp', '.php', '.rb', '.json',

    // Font extensions
    '.ttf', '.otf', '.woff', '.woff2',

    // Data extensions
    '.csv', '.xml', '.json', '.sql'
];







const ChatRoom = ({
    closePane,
    chatIds,
    unRead,
    topicDetail,
    allUser,
    allAccount,
    type,
    activity,
    refresh,
    refreshState,
    // socketDetail, 
    panelPosition,
    // platformId, 
    closeChatScreen,
    getTopicsBasedOnFilter
}) => {

    const bodyRef = useRef();
    const currentSelectId = useRef('');
    const topScroll = useRef();
    const prevSearchValue = useRef();
    const topic = useRef(topicDetail);
    const chatActivity = useRef((topic.current.activity_collaborate || topic.current.activity_chat) ? true : false);
    const editorRef = useRef();
    const fnRef = useRef();
    const replyEditorRef = useRef();
    const editEditorRef = useRef();
    const editFnRef = useRef()
    const fnReplyRef = useRef();
    const getMessageHeight = useRef();
    const [editedMessage, setEditedMessage] = useState('');
    const Size = useRef(pageSize);
    const fetchedClientUsers = useRef([]);

    const draftReplyId = useRef([]);

    const checkApptype = useRef(isElectron());

    const [messageList, setMessageList] = useState([]);

    const [message, setMessage] = useState("");

    //Don't remove borderChat
    const [borderChat, setBorderChat] = useState('');  // eslint-disable-line 

    const [showMainMenu, setShowMainMenu] = useState(false);

    const [chatId, setChatId] = useState('');

    const [showReply, setShowReply] = useState(false);

    const [replyMessage, setReplyMessage] = useState('');

    const [sendRepliesList, setSendRepliesList] = useState([]);

    const [hideReply, setHideReply] = useState(false);

    const [scrolls, setScrolls] = useState(false);

    const [navigateHome, setNavigateHome] = useState(false);

    const [searchString, setSearchString] = useState('');


    const [showSearch, setShowSearch] = useState(false);

    const [searchscroll, setSearchScroll] = useState(false);

    const [noneRead, setNoneRead] = useState(unRead);

    const [showLoader, setShowLoader] = useState(false);

    const controller = new AbortController();

    const [editId, setEditId] = useState('');

    const [editAccess, setEditAccess] = useState(false);

    const [showUserPane, setShowUserPane] = useState(false);

    const [userData, setUserData] = useState([]);

    const [showFeedback, setShowFeedback] = useState(false);

    const [showReopen, setShowReopen] = useState(false);

    const [confirmDelete, setConfirmDelete] = useState(false);

    const [currentUserId, setCurrentUserId] = useState('');

    const [showExpand, setShowExpand] = useState(false);

    const [showFeedbackMessage, setShowFeedbackMessage] = useState(false);

    const [feedId, setFeedId] = useState(0);

    const [messageUserDetails, setMessageUserDetails] = useState([]);

    const [openPopupPlayer, setOpenPopupPlayer] = useState(false);

    const [playerUrl, setPlayerUrl] = useState();

    const [showScreenButton, setShowScreenButton] = useState(false);

    const [showReplyScreenButton, setShowReplyScreenButton] = useState(false);

    const [showVideo, setShowVideo] = useState(false);

    const [displayMessage, setDisplayMessage] = useState('');

    const [video, setVideo] = useState([]);

    const [videoUrl, setVideoUrl] = useState([]);

    const [replyVideoUrl, setReplyVideoUrl] = useState([]);

    const [deleteSavedItem, setDeleteSavedItem] = useState(false);

    const [saveDataUrl, setSaveDataUrl] = useState([]);

    const [restrictScrollOnReply, setRestrictScrollOnReply] = useState(false);

    const [showVideoLoader, setShowVideoLoader] = useState(false);

    const [showUserDataFetching, setShowUserDataFetching] = useState(true);



    if (!clickBackButton && (ws === undefined || (ws.readyState !== WebSocket.OPEN && ws.readyState !== WebSocket.CONNECTING))) {

        if (ws === undefined || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {

            const jwt_token = getTokenClient();

            ws = new WebSocket(Constants.API_WEBSOCKET_URL + `chat/${chatIds}/`, jwt_token)

        }

    }

    async function fetchData() {

        setShowLoader(true);

        const jwt_token = getTokenClient();

        let token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/?topic_id=${chatIds}&page_size=${Size.current}&page_number=${pageNumber}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    const json = response;

                    for (let key in json) {

                        setShowLoader(false);

                        let data = json[key];

                        if ('chat_data' === key) {

                            setMessageList(data.reverse());

                        } else if ('pagination' === key) {

                            totalCount = data.total_count;

                        }

                    }

                    setTimeout(() => {

                        if (noneRead) {

                            setNoneRead(undefined);

                        }

                    }, 2000);

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    }

    async function fetchCollabUsers() {

        setShowLoader(true);

        setShowUserDataFetching(true);

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform')

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/topic/user_details/?topic_id=${chatIds}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let collabUser = [];

                    let supportUsers = []

                    const json = response;

                    setUserData(json);

                    fetchedClientUsers.current = json.client_participants;


                    setMessageUserDetails(json?.all_users);

                    json.client_participants.map(user => collabUser = [...collabUser, user.id]);

                    json.support_participants.map(user => supportUsers = [...supportUsers, user.id])

                    collabId = collabUser;

                    takeSupportId = supportUsers;

                    setShowLoader(false);

                    setShowUserDataFetching(false);

                }

            })
            .catch(err => {

                setShowLoader(false);
                setShowUserDataFetching(false);
                alertService.showToast('error', err.msg);

            });
    }

    const handleInputChange = (event, type) => {

        event.stopPropagation();

        setNoneRead(undefined);

        borderChatId = '';

        if (type === "message") {

            setMessage(event.target.value);

        } else if (type === "reply") {

            setReplyMessage(event.target.value);

        }

    }

    const handleKeyDown = (e) => {
        if ((e.keyCode === 13 || e === 'click') && (searchString !== '' || prevSearchValue.current)) {
            prevSearchValue.current = searchString;

            if (searchString !== '') {
                getChatSearch(e, searchString)
            } else {
                setShowSearch(false);
                fetchData();
            }

        }
    }

    const sendMessage = (e, type, messageId) => {

        let msg = {};

        setScrolls(false);

        setSearchScroll(false);

        msg = {
            "message": {
                "file": saveDataUrl,
                "message": type === 'reply' ? replyMessage : message
            },
            "is_file": saveDataUrl.length > 0 ? 1 : 0,
            "parent_note_id": type === 'reply' ? messageId : 0
        }

        let validateText = message.replaceAll("&nbsp;", "");

        const text = validateText.trim();

        if ((text !== '' && !emptyStringValidation(message)) || (replyMessage !== '' && type === 'reply' && !emptyStringValidation(replyMessage)) || saveDataUrl.length > 0) {
            // Web Socket is connected, send data using send()

            if (ws.readyState !== WebSocket.CLOSED) {

                chatActivity.current = true;

                ws.send(JSON.stringify(msg));
                
                let dataFromMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data')) || [];
                let findChat = dataFromMemory.findIndex(data => data.topic_id === chatIds);
                if (type === 'reply') {
                    let draftIndex = draftReplyId.current.indexOf(messageId);
                    draftReplyId.current.splice(draftIndex, 1);
                }
                if (findChat !== -1 && ((type !== 'reply' && !dataFromMemory[findChat].reply?.length > 0) || (type === 'reply' && !dataFromMemory[findChat].message && !dataFromMemory[findChat].reply?.length > 0))) {
                    dataFromMemory.splice(findChat, 1);
                    sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data', JSON.stringify(dataFromMemory));
                } else if (type === 'reply' && dataFromMemory[findChat].reply?.length > 0) {
                    let reply = dataFromMemory[findChat].reply;
                    let findIndex = reply.findIndex((rply) => rply.id === messageId);
                    if (findIndex !== -1) {
                        reply.splice(findIndex, 1);
                        dataFromMemory[findChat].reply = reply;
                        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data', JSON.stringify(dataFromMemory));
                    }

                }


                setMessage('');

                setReplyMessage('');

                setReplyVideoUrl([]);

                setSaveDataUrl([]);

                setVideoUrl([]);

                setVideo([]);

            }

        }

    }

    const emptyStringValidation = (text) => {

        let ValidateEmptyLine = text.split('\n');

        let findLength = ValidateEmptyLine.length;

        for (let i = 0; i < findLength; i++) {

            if (ValidateEmptyLine[i] !== '') {

                return false;

            }

        }

        setMessage('')

        setReplyMessage('');

        return true;

    }

    const validateEditChat = (msg, setAccessValue) => {

        const messageCreatedAtDate = getTimeZone(msg.created_at, true);

        const msg_send_date = new Date(messageCreatedAtDate);

        const current_date = new Date();

        const subMin = Math.abs(msg_send_date.getMinutes() - current_date.getMinutes());

        const subHr = Math.abs(msg_send_date.getHours() - current_date.getHours());

        const dateDiff = Math.abs(msg_send_date.getDate() - current_date.getDate());

        let isData = false;

        isData = subMin <= 3 && subHr === 0 && dateDiff === 0 ? true : false

        if (setAccessValue) {

            setEditAccess(isData);

            return

        }

        return isData;

    }

    const chatmenu = (e, key, msg) => {

        currentSelectId.current = key;

        validateEditChat(msg, true);

        setShowMainMenu(true);

    }

    useEffect(() => {

        if (refresh) {

            fetchCollabUsers()

        }

    }, [refreshState]) // eslint-disable-line 

    useEffect(() => {



        if (messageList.length === 0) {

            fetchData();

        }

    }, [chatIds]) // eslint-disable-line 




    useEffect(() => {
        const dataFromMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data')) || [];
        let findChat = dataFromMemory.findIndex(data => data.topic_id === chatIds);
        if (findChat !== -1 && dataFromMemory[findChat].message) {
            setMessage(dataFromMemory[findChat].message);
        } else if (findChat !== -1) {
            let messageData = dataFromMemory[findChat];
            messageData?.reply.forEach((data) => {
                draftReplyId.current = [...draftReplyId.current, data.id];
                console.log(draftReplyId)
            })
        }

        if (panelPosition && panelPosition !== 'Right') {

            let containerWrapper = document.getElementById('iassist-panel');
            if (panelPosition.toLowerCase() === 'left') {
                containerWrapper.style.left = 0;
            }
            else if (panelPosition.toLowerCase() === 'center') {
                let screenWidth = window.innerWidth;
                containerWrapper.style.left = (screenWidth / 2) - (containerWrapper.offsetWidth / 2) + "px";
            }

        }

        singleScroll = false;

        let unreadDataList = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'unread'));

        if (unreadDataList?.length > 0 && unreadDataList.includes(chatIds)) {
            let index = unreadDataList.findIndex((data) => data === chatIds)
            unreadDataList.splice(index, 1);
            if (unreadDataList.length === 0) {

                if (document.getElementById('iassist-unread')) document.getElementById('iassist-unread').remove();
            }
            sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(unreadDataList));
        }

        let user = getUser();

        setCurrentUserId(user.id);

        if (userData.length === 0) {

            fetchCollabUsers();

        }

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('iassist-panel');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';


        }

        const onScroll = async (event) => {

            if (bodyRef.current.scrollTop < 10 && (totalCount > Size.current) && !singleScroll) {

                scrollHeight = bodyRef.current.scrollHeight;

                setScrolls(true);

                singleScroll = true;

                Size.current += pageSize;

                await fetchData();

            }
        }
        bodyRef.current.addEventListener('scroll', onScroll);

        document.addEventListener("mouseup", (event) => {

            if (borderChatId !== '') {

                borderChatId = '';

                setBorderChat('');

            }

            const head = document.getElementById('menu');


            if ((head && !(head.contains(event.target)))) {

                setShowMainMenu(false);

            }

            const record = document.getElementById('record')

            if (record && !(record.contains(event.target))) {

                setShowScreenButton(false)

                setShowReplyScreenButton(false);

            }

            const media = document.getElementById('media-player');

            if (media && !(media.contains(event.target))) {

                setOpenPopupPlayer(false);

            }

            const list = document.getElementById('user-list');

            if (list && !(list.contains(event.target))) {

                setShowUserPane(false);

            }

            const chatContainer = document.getElementById('iassist-panel');

            if (chatContainer && !(chatContainer.contains(event.target)) && !checkApptype.current) {

                Size.current = pageSize;

                close();

            }

        })

        window.addEventListener('online', onOnline)

        window.addEventListener('offline', onOffline)


        setTimeout(() => {
            if (bodyRef.current) {
                const ele = document.getElementById("chat-list-wrapper");
                ele.scrollTop = ele.scrollHeight;
            }
        }, 1000);

        return () => {
            Size.current = pageSize;

            ws.close();

            window.removeEventListener('online', onOnline)

            window.removeEventListener('offline', onOffline)
        }

    }, []) // eslint-disable-line 

    const onOffline = () => {

        if (ws !== undefined) {

            alertService.showToast('error', 'your connection got disconnected');

            ws.close();

        }

    }

    const onOnline = () => {

        const jwt_token = getTokenClient();

        ws = new WebSocket(Constants.API_WEBSOCKET_URL + `chat/${chatIds}/`, jwt_token)

        alertService.showToast('alert', 'Back to Online');

    }
    ws.onmessage = function (evt) {

        const received_msg = JSON.parse(evt.data);

        if (received_msg.parent_note_id === 0 || 'chat_data' in received_msg) {

            if ('chat_data' in received_msg) {

                msg = received_msg.chat_data;

                setMessageList(msg);

            } else {

                setMessageList([...messageList, received_msg]);

            }

            if (editorRef.current) editorRef.current.focus();

        } else if (received_msg.parent_note_id !== 0) {

            messageList.forEach((ms) => {

                if (ms.id === received_msg.parent_note_id) {
                    ms.replies = [...ms.replies, received_msg];
                    return;
                }
            })

            const contentWrapper = document.getElementById(`content${chatId}`);

            topScroll.current = contentWrapper?.scrollHeight

            setSendRepliesList([...sendRepliesList, received_msg]);

            setHideReply(true)

            setRestrictScrollOnReply(!restrictScrollOnReply);

            if (replyEditorRef.current) replyEditorRef.current.focus();

        }

    };

    ws.onopen = function () {

        console.log("websocket connected")

        console.log(unRead);
        if (unRead > 0 && getTopicsBasedOnFilter) getTopicsBasedOnFilter(undefined, 1)

    };

    ws.onclose = function () {

        console.log("connection Closed");

        if (clickBackButton) {

            closeChatScreen();
            // getTopicsBasedOnFilter();
            setNavigateHome(true);

        }
    };

    const removeChatDataInMemory = () => {
        let dataFromMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data')) || [];
        let findChat = dataFromMemory.findIndex(data => data.topic_id === chatIds);
        if (findChat !== -1) {
            dataFromMemory.splice(findChat, 1);
        }
        sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data', JSON.stringify(dataFromMemory));
    }

    const checkReplyInMemory = (msgId, wholeReplyMsg, messageReply) => {
        let combineReply = wholeReplyMsg
        const collection = wholeReplyMsg;
        let findReplyIndex = collection.findIndex((data) => data.id === chatId);
        if (findReplyIndex !== -1) {
            collection[findReplyIndex].message = messageReply;
        } else {
            let data = {
                id: msgId,
                message: messageReply
            }
            combineReply = [...collection, data];
        }
        return combineReply;
    }

    const storeChatDataInMemory = (messageData, type, chatId = null, replyChatData = null) => {
        if (messageData || (type === 'reply' && replyChatData)) {
            let dataFromMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data')) || [];
            let findChat = dataFromMemory.findIndex(data => data.topic_id === chatIds);
            if (findChat !== -1) {
                if (type === 'reply') {
                    let chat = checkReplyInMemory(chatId, dataFromMemory[findChat].reply, replyChatData);
                    dataFromMemory[findChat].reply = chat;
                } else {
                    dataFromMemory[findChat].message = messageData;
                }
            } else {
                let replyData = type === 'reply' ? {
                    id: chatId,
                    message: replyChatData
                } : [];
                let data = {
                    topic_id: chatIds,
                    message: messageData,
                    reply: [replyData]
                }
                dataFromMemory = dataFromMemory !== null && dataFromMemory !== undefined ? [...dataFromMemory, data] : data;
            }
            sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data', JSON.stringify(dataFromMemory));
        }

    }

    useEffect(() => {
        return () => {
            clickBackButton = false;

        };
    }, [navigateHome])

    useEffect(() => {

        const contentWrapper = document.getElementById(`content${chatId}`)

        if (contentWrapper) {

            let diffHeight = contentWrapper?.scrollHeight - topScroll.current;

            bodyRef.current.scrollTop += diffHeight;

            topScroll.current = undefined;

        }

    }, [restrictScrollOnReply]) // eslint-disable-line 

    const reply = (e, replyMessage) => {

        setChatId(currentSelectId.current);

        setShowMainMenu(false);

        getReply(e, replyMessage.id, hideReply)

    }

    // this useeffect is used for adjust the scroll position of opening and hiding reply, screen capture option inside reply it works
    useEffect(() => {

        if (hideReply && !showReplyScreenButton) {

            let contentWrapper = document.getElementById(`textbox-${chatId}`)

            contentWrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" })

        }

    }, [chatId, hideReply, showReplyScreenButton])

    useEffect(() => {

        chatActivity.current = (topic.current.activity_collaborate || topic.current.activity_chat) ? true : false;

    }, [topic.current.activity_collaborate, topic.current.activity_chat])

    const getReply = (e, id, hideReply) => {

        const dataFromMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'stored_chat_data')) || [];

        let findChat = dataFromMemory.findIndex(data => data.topic_id === chatIds);

        if (findChat !== -1 && dataFromMemory[findChat].reply) {

            let replies = dataFromMemory[findChat];

           let findIndex =  replies.reply.findIndex((data) => data.id === id);

           if (findIndex !== -1 && replies.reply[findIndex].message) setReplyMessage(replies.reply[findIndex].message);
           else setReplyMessage('');

        } else {

            setReplyMessage('');

        }

        if (hideReply && chatId === id) {

            setHideReply(false);

            setShowReply(false);

            getMessageHeight.current = undefined;

        }

        setChatId(id);

        if (!hideReply) {

            const contentWrapper = document.getElementById(`content${id}`)

            getMessageHeight.current = contentWrapper.scrollHeight;

            setHideReply(true);

            setShowReply(true);

        }

    }

    //whenever new message come or whenever clicking the screen capture option button in main message. this useeffect execute and it adjusting the scroll position
    useEffect(() => {

        if (!navigateHome) {

            // scrolls adjust the scrolling position on infinite scroll
            if (scrolls) {

                bodyRef.current.scrollTop = bodyRef.current.scrollHeight - scrollHeight;

            }

            if (searchscroll) {

                //searchscroll is used for adjust the scroll on chat searching

                let contentWrapper = document.getElementById(`content${borderChatId}`);

                if (contentWrapper) {

                    contentWrapper?.scrollIntoView({ behavior: "auto", block: "end" })

                }

            } else {
                if (!scrolls) {

                    borderChatId = ''

                    scrollIntoLastMessage();

                }

            }

        }

        singleScroll = false;

    }, [messageList, showScreenButton]) // eslint-disable-line 

    const scrollIntoLastMessage = () => {

        let msg = messageList[messageList.length - 1];

        let msgId = msg?.id;

        if (msg?.is_file) {

            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;

        } else {

            let contentWrapper = document.getElementById(`content${msgId}`);

            if (contentWrapper) {

                contentWrapper?.scrollIntoView({ behavior: "auto", block: "end" })

            }

        }

    }

    const close = () => {

        ws.close();

        closePane();

    }

    const getChatSearch = async (e, query) => {

        e.preventDefault()

        const jwt_token = getTokenClient()

        const token = `Bearer ${jwt_token}`;

        let key = '';

        setShowSearch(true)

        if (searchString) { key = `&key=${searchString}` }

        const appConfigId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config_app_id');

        if (query) { key = `&key=${query}` }

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/key/?topic_id=${chatIds}${key}&page_size=1000&page_number=1&app_id=${appConfigId}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    const json = response;

                    for (let key in json) {

                        let data = json[key];

                        if ('chat_data' === key) {

                            setMessageList(data.reverse());

                            setShowSearch(true)

                        }
                        else if ('pagination' === key) {


                            totalCount = data.total_count;

                        }

                    }

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });
    }

    const getUserCardLabel = (id) => {

        let label = '';

        for (let i = 0; i < collabId.length; i++) {

            if (collabId[i] === id) {

                label = 'CLIENT';

                break;

            }

        }

        for (let i = 0; i < takeSupportId.length; i++) {

            if (takeSupportId[i] === id) {

                label = label !== '' ? label + ' + AGENT' : 'AGENT';

                break;

            }

        }


        return label ? label : 'CLIENT';

    }



    const searchClick = async (item) => {

        if (showSearch) {

            const jwt_token = getTokenClient()

            borderChatId = item.id;

            setBorderChat(item.id);

            let id = item.parent_note_id === 0 ? item.id : item.parent_note_id

            if (item?.parent_note_id !== 0) {

                setChatId(item.parent_note_id);

                setHideReply(true);

            }

            const token = `Bearer ${jwt_token}`;

            APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/page/?topic_id=${item.topic_id}&chat_id=${id}`, null, false, 'GET', controller, token)
                .then(response => {

                    if (response) {

                        let json = response;

                        for (let key in json) {

                            let data = json[key];

                            if (key === 'chat_id_count') {

                                Size.current = data < 10 ? pageSize : data;

                                scrollHeight = 15;

                                fetchData();

                                setSearchScroll(true);

                                setSearchString('');

                            }

                        }

                        setShowSearch(false);

                    }

                })
                .catch(err => {

                    setShowLoader(false);

                    alertService.showToast('error', err.msg);

                });

        }

    }


    const editMessageClick = (msg) => {


        let userDetail = getUser();

        if (userDetail.id === msg.user_id) {

            setEditId(msg.id);

            parent_note_id = msg.parent_note_id;

            setEditedMessage(msg?.is_file ? msg?.note?.message : msg.note);

            setShowMainMenu(false);

        } else {

            setShowMainMenu(false);

            alertService.showToast('error', "You are not allowed to edit this message")

        }

    }

    const editMessage = async (e) => {

        let currentIndex = -1;

        let jwt_token = getTokenClient();

        let data = {
            chat_id: editId,
            parent_note_id: parent_note_id,
            message: editedMessage
        }
        setShowLoader(true);

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/`, data, false, 'PUT', null, token)
            .then(response => {

                if (response) {

                    const json = response;


                    messageList.forEach((msg, index) => {
                        if (msg.id === json.chat_data.id) {

                            msg = json.chat_data;

                            currentIndex = index;

                        }
                    }
                    )


                    messageList.splice(currentIndex, 1, json.chat_data);

                    setEditId('');

                    setMessage('');

                    setShowLoader(false);

                }

            })
            .catch(err => {

                alertService.showToast('error', err.msg);

            });

    }

    const editCancel = () => {

        setEditId('');

        setMessage('');

    }

    const userSelect = (e, id, add, disableAddOrRemove) => {

        let data = {
            topic_id: chatIds,
            user_id: [
                id
            ]
        }

        setShowLoader(true);

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform')

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/add_remove_client/?flag=${add}`, data, false, 'POST', controller, token)
            .then(response => {

                if (response) {

                    // let json = response;

                    setShowLoader(false);

                    if (!add) {

                        fetchCollabUsers();

                        let userData = getUser();

                        if (userData?.id === id) {

                            getTopicsBasedOnFilter();
                            setNavigateHome(true);
                            closeChatScreen();

                        }

                    }

                    if (disableAddOrRemove) disableAddOrRemove(false);

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    }

    const closeFeedbackPane = () => {

        setShowFeedback(false);

        setShowReopen(false);

    }

    const deleteTopic = async (e, data) => {

        e.stopPropagation();

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform')

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/topic/?topic_id=${data.id}`, null, false, 'DELETE', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    getTopicsBasedOnFilter(undefined, 1);

                    alertService.showToast('success', result.message);

                    setNavigateHome(true);
                    closeChatScreen();
                    // getTopicsBasedOnFilter();
                    setConfirmDelete(false);

                }

            })
            .catch(err => {
                setConfirmDelete(false)

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });
    }

    const openFeedbackMessage = (id) => {

        if (showFeedbackMessage) {

            setFeedId(0)

        } else {

            setFeedId(id)

        }

        setShowFeedbackMessage(!showFeedbackMessage);

    }




    // const checkVideo = (file) => {

    //     const data = '.' + file?.file.split('.').pop();
    //     // substring(file.file.length - 4, file.file.length);

    //     if (videoExtensions.includes(data)) {

    //         return true;

    //     } else {

    //         return false;

    //     }

    // }

    // const checkImage = (file) => {

    //     const data1 = '.' + file?.file.split('.').pop();
    //     // substring(file.file.length - 5, file.file.length);

    //     if (imageExtensions.includes(data1)) {

    //         return true;

    //     } else {

    //         return false;

    //     }

    // }

    const getOtherFileExtensionsDiv = (item) => {

        return (
        
        <div className='wrapper-media'>
        {/* '../../images/file-icons/icon-' + item.extension.replace('.', '') + '.jpg' */}
            <img width="50" height="50" alt={item.extension + ' file'} src="../../images/file-icons/icons8-pdf-50.png"></img>
            <div className='media-id'>{item.file.name}</div>

        </div>

        )
    }
    const checkFileExtension = (file) => {

        const extension = '.' + file?.file.split('.').pop();

        if (otherExtensions.includes(extension)) return { type: 'other', value: true, extension: extension }
        if (videoExtensions.includes(extension)) return { type: 'video', value: true }
        if (imageExtensions.includes(extension)) {
            return { type: 'image', value: true }
        }

        return { type: '', value: false };
    }

    const uploadFile = async (blobs, message) => {

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        let data = {
            file: [blobs]
        }

        const formData = new FormData();

        Object.keys(data).forEach((item) => {

            if (item === 'file') {

                let fil = data[item];

                for (let i = 0; i < fil.length; i++) {

                    formData.append(item, fil[i]);

                }

            }
        });

        try {

            const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform')

            const response = await fetch(Constants.API_IASSIST_BASE_URL + `${platform}/uploadfile/?topic_id=${chatIds}&broadcast=false&file_upload=true`, {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            })

            const result = await response.json();

            let file = result?.file_url[0]?.file;

            let name = result?.file_url[0]?.name;

            setSaveDataUrl([...saveDataUrl, { name: name, file: file }])

            setShowVideoLoader(false);

        } catch (err) {

            setShowVideoLoader(false);

            alertService.showToast('error', err.message);

        }
    }

    const saveAndClose = (e, blob, id, message, dataUrl) => {

        uploadFile(blob, message)

        setShowVideo(false);

        setShowScreenButton(false);

        setShowVideoLoader(true);

        setShowReplyScreenButton(false);

        // let length = saveDataUrl.length + 1;

        if (blob) {

            if (message === 'Record') {

                let videoBlobUrl = URL.createObjectURL(blob);

                if (showReplyScreenButton) {

                    setReplyVideoUrl([...replyVideoUrl, { video: videoBlobUrl, id: `video_id_${id}` }])

                } else {

                    setVideoUrl([...videoUrl, { video: videoBlobUrl, id: `video_id_${id}` }])

                }

                setVideo([...video, blob]);

            } else {

                let videoBlobUrl = URL.createObjectURL(blob);

                if (showReplyScreenButton) {

                    setReplyVideoUrl([...replyVideoUrl, { image: videoBlobUrl, id: `screenshot_id_${id}` }])

                } else {

                    setVideoUrl([...videoUrl, { image: videoBlobUrl, id: `screenshot_id_${id}` }])

                }

                setVideo([...video, blob]);

            }

        }

    }

    useEffect(() => {
        if (document.getElementById(`content${editId}`)) {
            document.getElementById(`content${editId}`).scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }
    }, [editId])

    useEffect(() => {

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('iassist-panel');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';


        }

        let chatBody = document.getElementById('chat-list-wrapper');

        let message = document.getElementById('message');

        chatBody.style.bottom = message.clientHeight + 12 + 'px';

        chatBody.style.setProperty('maxHeight', `calc(100% - ${message.clientHeight + 'px'})`)

        scrollIntoLastMessage();

    }, [videoUrl.length]) // eslint-disable-line 

    const debouncedResults = useMemo(() => {

        return debounce(handleInputChange, 500);
    }, []);

    useEffect(() => {
        return () => {

            debouncedResults.cancel();
        };
    }, [searchString]); // eslint-disable-line 

    const videoClick = (file) => {

        playerType = 'video';

        setOpenPopupPlayer(true)

        setPlayerUrl(file)

    }

    const handleAddBtn = (e, type) => {


        topScroll.current = bodyRef.current.scrollTop;

        if (type === 'reply') {

            setShowReplyScreenButton(!showReplyScreenButton);

            return

        }

        setShowScreenButton(!showScreenButton)

    }

    const options = {

        replace: (domNode) => {
            if (domNode.attribs && domNode.attribs.class === 'remove') {
                return <></>;
            }
        },
    };
    // e, msgDetail
    const loadFile = () => {

        let getLastId = messageList[messageList.length - 1]?.id;

        if (getLastId && !hideReply && !scrolls) {

            scrollIntoLastMessage();

        }

    }

    const onClickSteno = () => {
        if (topic.current.status_id === 3) {
            setShowReopen(true);
        }
    }

    const getTextWidth = (text) => {
        if (showExpand) {
            const descriptionElement = document.getElementById('topic-description-chat');
            let ctx = document.createElement('canvas').getContext('2d');
            ctx.font = '11px "Poppins", sans-serif';
            let width = ctx.measureText(text).width;
            if (width >= descriptionElement?.clientWidth) {
                return true;
            }
        }
        return false;
    }

    return (

        <>

            {!showVideo && <div id='iassist-panel' className='iassist-panel'>
                <div className='iassist-panel-inner'>
                    <div className='iassist-panel-header'>

                        <div className='iassist-header-back' onClick={(e) => {
                            e.stopPropagation();
                            if (ws === undefined || ws.readyState === WebSocket.CLOSED || ws.readyState === WebSocket.CLOSING) {
                                setNavigateHome(true);
                                closeChatScreen();
                                // getTopicsBasedOnFilter();
                            } else {
                                ws.close();
                                clickBackButton = true;
                            }

                        }}>Back</div>


                        <div className='iassist-header-right'>

                            <div className='iassist-search'>
                                <button onClick={getChatSearch} className='iassist-search-btn' title='search'></button>

                                <input type={'text'} title='Search'
                                    placeholder='Search'
                                    onChange={(e) => setSearchString(e.target.value.trim())}
                                    onKeyDown={handleKeyDown}
                                    value={searchString}
                                />

                            </div>
                            <div className='topic-filter-search-iassist' id='search-box'></div>

                            <div className='author-list' onClick={() => setShowUserPane(true)}>
                                {fetchedClientUsers.current && fetchedClientUsers.current.map((user, index) => {

                                    if (index <= 2) {
                                        return <span key={user.id + index.toString()} style={{ zIndex: fetchedClientUsers.current.length - index }}>
                                            {
                                                <Avatar imgSrc={user.cover_img_url}
                                                    firstName={user.first_name}
                                                    lastName={user.last_name}
                                                    alt={`${user.first_name}'s pic`}
                                                    height={20}
                                                    width={20}
                                                    fontSize={9}
                                                    borderRadius={2}
                                                />
                                            }
                                        </span>

                                    } else {

                                        if (index === 3) {

                                            return <span className='number' key={index}> {fetchedClientUsers.current.length - 3}</span>

                                        } else { return } // eslint-disable-line 

                                    }

                                })}

                                <div className='add-icon-wrapper'>

                                    <button className='add-icon'></button>

                                </div>

                            </div>

                            {noneRead !== undefined && noneRead !== 0 && <div className='unread'>

                                <span>{noneRead}</span>

                            </div>}

                            <button className='iassist-header-close' onClick={() => {
                                closeChatScreen();
                                //  close()
                            }}></button>

                        </div>

                    </div>
                    {showLoader && <LoadingScreen />}

                    {openPopupPlayer && <Player id='media-player' url={playerUrl} type={playerType} close={setOpenPopupPlayer} />}

                    <div className='iassist-title-widget'>

                        <div className={'name'} onClick={() => setShowExpand(!showExpand)}>{topic.current && topic.current.name}

                            <button className={'button' + (showExpand && getTextWidth(topic.current?.description) ? ' full-button' : '')} title='expand'></button>

                        </div>

                        <div id='topic-description-chat' className={'description' + (showExpand ? ' full-description' : '')}>{topic.current && topic.current.description}</div>

                        <Detail topic={topic.current} type={type} allAccount={allAccount} allUser={allUser} />

                    </div>

                    {showUserPane && <UserList
                        // user={users}
                        clientUser={userData.client_participants}
                        position={'absolute'}
                        height={150}
                        header={true}
                        supportUser={userData.support_participants}
                        userSelect={userSelect}
                        collaborator={collabId}
                        close={setShowUserPane}
                        author={topic.current && topic.current.user_id}
                        id='user-list' topic={topic.current}
                    />}
                    <div className='iassist-panel-body'>
                        <div className='iassist-msg-area'>
                            {
                                !confirmDelete && !showUserDataFetching && showSearch && !messageList.length && <span className='no-message-notification'>No Message Available</span>
                            }
                            <div id='chat-list-wrapper' className={'iassist-chat-list-wrapper' + (confirmDelete ? ' delete-wrapper' : '')} ref={bodyRef}>



                                {!confirmDelete && !showUserDataFetching && messageList.length > 0 && messageList.map((messages) => {
                                    return (
                                        <div className={'chat-wrapper ' + ((messages.is_feedback || messages.is_reopen) && !messages.is_file ? 'chat-feedback-wrapper' : '')} key={messages.id} style={{ border: +borderChatId === +messages.id ? '1px solid #00BB5A' : '', cursor: showSearch ? 'pointer' : 'auto' }} onClick={() => searchClick(messages)}>

                                            <div className='support-header'>

                                                {showMainMenu && currentSelectId.current === messages.id &&
                                                    <ul id='menu' className='pane'>

                                                        <li onClick={(e) => reply(e, messages)}>Reply</li>
                                                        {
                                                            editAccess && <li onClick={() => editMessageClick(messages)}>Edit</li>}

                                                    </ul>

                                                }

                                                <div className='support-header-left'>

                                                    {getUserNameImage(messageUserDetails, messages.user_id, false, 'message_detail')}

                                                    <div className='content-wrapper' id={`content${messages.id}`}>

                                                        <div className='name'>
                                                            <h4>{getUserNameBasedOnId(messageUserDetails, messages.user_id, 'message_detail')}</h4>
                                                            <span className='card-label'>{getUserCardLabel(messages.user_id)}</span>
                                                            <span className='time-zone'> &nbsp;{getTimeZone(messages.created_at, false)}</span>
                                                        </div>

                                                        {editId !== messages.id && !messages.is_file && !messages.is_feedback && !messages.is_reopen && <div className='content' id={"msg" + messages.id}>

                                                            {parse(messages.note, options)}

                                                        </div>}

                                                        {editId === messages.id && !messages.is_feedback && !messages.is_reopen && <div className='content' id={"container" + messages.id}>

                                                            <Steno
                                                                html={editedMessage}
                                                                disable={false} //indicate that the editor has to be in edit mode
                                                                onChange={(val) => {

                                                                    setEditedMessage(val)
                                                                }}
                                                                innerRef={editEditorRef} //ref attached to the editor
                                                                backgroundColor={'#000'}
                                                                onChangeBackgroundColor={() => { }}
                                                                fontColor={'#fff'}
                                                                onChangeFontColor={() => { }}
                                                                functionRef={editFnRef} //Ref which let parent component to access the methods inside of editor component
                                                                isToolBarVisible={false} //to show/hide the toolbar options
                                                                toolbarPosition={"bottom"} //to place the toolbar either at top or at bottom 
                                                                formatStyle={false} //If true will let user to keep the style while pasting the content inside of editor
                                                                onChangeOfKeepStyle={() => { }} //handle to change the format style variable
                                                                showAddFileOption={false} //If true along with isToolBarVisible true will display the Add File option inside of toolbar
                                                                fileList={[]} //List of file object to track the files selected by user
                                                                // onFileChange={handleFileChange} //handler to update the filelist array, This function will receive a file event object as an argument, when user add a new file/files to the list.
                                                                // removeTheFile={removeTheFile} //handler to delete the file from the filelist array, This function will receive a file name to be deleted as an argument.
                                                                sendMsgOnEnter={true} //This will be used in case of chat application, where user wants to send msg on enter click.
                                                                onEnterClickLogic={editMessage} //If user selects sendMsgOnEnter as true, then he/she has to provide the onEnter logic
                                                                autoHeight={true} //If autoHeight is true, then the editor area will grow from minEditorHeight to maxEditorHeight
                                                                minEditorHeight='20px' // Default will be 100px
                                                                maxEditorHeight="300px" // Default maxHeight will be 250px
                                                                placeHolder="Message"
                                                            />
                                                            <div className='edit-btn'>
                                                                <button type='button' className='save-btn' onClick={(e) => editMessage(e)}>
                                                                    <span className='save'></span>
                                                                    save
                                                                </button>
                                                                <button type='button' className='cancel-btn' onClick={editCancel}>
                                                                    <span className='cancel'></span>
                                                                    cancel</button>

                                                            </div>
                                                        </div>}

                                                        {!messages.is_file && messages.is_feedback && !messages.is_reopen && <div className='content'>

                                                            <div className='change-status'>Changed status of this ticket to  <span>Resolved</span></div>

                                                            <div className='feedback-wrapper'>
                                                                <label>Feedback Given</label>
                                                                <button className={'feedback'} onClick={() => openFeedbackMessage(messages.id)}>
                                                                    {messages.note.feedback}
                                                                    {messages.note.text !== '' && <span className={'arrow' + (showFeedbackMessage && feedId === messages.id ? ' rotate' : '')} title='arrowdown'></span>}
                                                                </button>
                                                            </div>
                                                            {messages.note.text !== '' && feedId === messages.id && showFeedbackMessage && <div className='text'>{messages.note.text}</div>}

                                                        </div>}

                                                        {!messages.is_file && !messages.is_feedback && messages.is_reopen && <div className='content'>

                                                            <div className='change-status'>Changed status of this ticket to  <span>In Progress</span></div>

                                                            <div className='text'>{messages.note.reopen_reason}</div>

                                                        </div>}

                                                        {messages.is_file && !messages.is_feedback && <div className='content'>

                                                            {editId !== messages.id && parse(messages.note.message, options)}

                                                            <div className='content-video'>

                                                                {messages.note.file.map((files, index) => {

                                                                    return (

                                                                        <div className='content-wrapper-media' key={index}>

                                                                            {/* {

                                                                                checkVideo(files, 'video') && <div className='wrapper-media'>
                                                                                    <video src={files.file} onClick={() => {
                                                                                        videoClick(files.file)
                                                                                    }} onLoad={(e) => loadFile()}></video>
                                                                                    {files?.file && <PlayButton handleClick={videoClick} file={files.file} />}
                                                                                    <div className='media-id'>{files?.name}</div>
                                                                                </div>
                                                                            }

                                                                            {
                                                                                checkImage(files) &&
                                                                                <div className='wrapper-media'><img alt="" src={files.file} onClick={() => {
                                                                                    playerType = 'image';
                                                                                    setOpenPopupPlayer(true)
                                                                                    setPlayerUrl(files.file)
                                                                                }}
                                                                                    onLoad={(e) => loadFile()}></img><div className='media-id'>{files?.name}</div>
                                                                                </div>
                                                                            } */}

                                                                            {
                                                                                checkFileExtension(files).type === 'video' &&
                                                                                <div className='wrapper-media'>
                                                                                    <video src={files.file} onClick={() => {
                                                                                        videoClick(files.file)
                                                                                    }} onLoad={(e) => loadFile()}></video>
                                                                                    {files?.file && <PlayButton handleClick={videoClick} file={files.file} />}
                                                                                    <div className='media-id'>{files?.name}</div>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                checkFileExtension(files).type === 'image' &&
                                                                                <div className='wrapper-media'><img alt="" src={files.file} onClick={() => {
                                                                                    playerType = 'image';
                                                                                    setOpenPopupPlayer(true)
                                                                                    setPlayerUrl(files.file)
                                                                                }}
                                                                                    onLoad={(e) => loadFile()}></img><div className='media-id'>{files?.name}</div>
                                                                                </div>
                                                                            }
                                                                            {
                                                                                checkFileExtension(files).type === 'other' && getOtherFileExtensionsDiv({ ...checkFileExtension(files), file: files })

                                                                            }
                                                                        </div>)

                                                                })}

                                                            </div>

                                                        </div>}


                                                        {!showSearch && messages.replies && messages.replies.length > 0 && <span className='replied' onClick={(e) => getReply(e, messages.id, hideReply)}>

                                                            <button className={'reply-arrow' + (hideReply && chatId === messages.id ? ' reply-rotate' : '')}>Reply</button>

                                                            {draftReplyId.current.includes(messages.id) && <span style={{color:'red', fontWeight:500}}><sup>1 draft</sup></span>}

                                                        </span>}

                                                        {hideReply && messages.replies && messages.replies.length > 0 && chatId === messages.id &&
                                                            messages.replies.map((msg) => { //eslint-disable-line
                                                                if (messages.id === msg.parent_note_id) {

                                                                    return (<div className='reply-wrapper' key={msg.id} style={{ border: borderChatId === msg.id ? '2px solid green' : '', cursor: showSearch ? 'pointer' : 'auto' }}>
                                                                        <div className='header-reply'>

                                                                            {showMainMenu && currentSelectId.current === msg.id &&
                                                                                <ul id='menu' className='panes'>

                                                                                    {editAccess && <li onClick={() => editMessageClick(msg)}>Edit</li>}

                                                                                </ul>
                                                                            }
                                                                            <div className='reply-header-wrapper'>

                                                                                {getUserNameImage(messageUserDetails, msg.user_id, false, 'message_detail')}

                                                                                <div className='reply-sub-wrapper'>
                                                                                    <div className='name'>
                                                                                        <h4>{getUserNameBasedOnId(messageUserDetails, msg.user_id, 'message_detail')}</h4>
                                                                                        <span className='card-label'>{getUserCardLabel(msg.user_id)}</span>
                                                                                        <span className='time-zone'> &nbsp;{getTimeZone(msg.created_at, false)} </span>
                                                                                    </div>

                                                                                    {editId !== msg.id && !msg.is_file && <div className='content-reply'>

                                                                                        {parse(msg.note, options)}

                                                                                    </div>}

                                                                                    {editId === msg.id && !msg.is_feedback && !msg.is_reopen && <div className='content'>

                                                                                        <Steno
                                                                                            html={editedMessage}
                                                                                            disable={false} //indicate that the editor has to be in edit mode
                                                                                            onChange={(val) => {
                                                                                                setEditedMessage(val)
                                                                                            }}
                                                                                            innerRef={editEditorRef} //ref attached to the editor
                                                                                            backgroundColor={'#000'}
                                                                                            onChangeBackgroundColor={() => { }}
                                                                                            fontColor={'#fff'}
                                                                                            onChangeFontColor={() => { }}
                                                                                            functionRef={editFnRef} //Ref which let parent component to access the methods inside of editor component
                                                                                            isToolBarVisible={false} //to show/hide the toolbar options
                                                                                            toolbarPosition={"bottom"} //to place the toolbar either at top or at bottom 
                                                                                            formatStyle={false} //If true will let user to keep the style while pasting the content inside of editor
                                                                                            onChangeOfKeepStyle={() => { }} //handle to change the format style variable
                                                                                            showAddFileOption={false} //If true along with isToolBarVisible true will display the Add File option inside of toolbar
                                                                                            fileList={[]} //List of file object to track the files selected by user
                                                                                            // onFileChange={handleFileChange} //handler to update the filelist array, This function will receive a file event object as an argument, when user add a new file/files to the list.
                                                                                            // removeTheFile={removeTheFile} //handler to delete the file from the filelist array, This function will receive a file name to be deleted as an argument.
                                                                                            sendMsgOnEnter={true} //This will be used in case of chat application, where user wants to send msg on enter click.
                                                                                            onEnterClickLogic={editMessage} //If user selects sendMsgOnEnter as true, then he/she has to provide the onEnter logic
                                                                                            autoHeight={true} //If autoHeight is true, then the editor area will grow from minEditorHeight to maxEditorHeight
                                                                                            minEditorHeight='20px' // Default will be 100px
                                                                                            maxEditorHeight="300px" // Default maxHeight will be 250px
                                                                                            placeHolder="Message"
                                                                                        />
                                                                                        <div className='edit-btn'>
                                                                                            <button type='button' className='save-btn' onClick={(e) => editMessage(e)}>
                                                                                                <span className='save'></span>
                                                                                                save</button>
                                                                                            <button type='button' className='cancel-btn' onClick={editCancel}>
                                                                                                <span className='cancel'></span>
                                                                                                cancel</button>

                                                                                        </div>
                                                                                    </div>}

                                                                                    {msg?.is_file && !msg?.is_feedback && <div className='content-reply'>

                                                                                        {editId !== msg.id && parse(msg?.note?.message, options)}

                                                                                        <div className='content-video'>

                                                                                            {msg.note.file.map((files, index) => {
                                                                                                return (<div className='content-wrapper-media' key={index}>

                                                                                                    {checkFileExtension(files, 'video').type === 'video' && <div className='wrapper-media'> <video src={files.file} onClick={() => {

                                                                                                        videoClick(files.file)

                                                                                                    }}>

                                                                                                    </video>

                                                                                                        {files?.file && <PlayButton handleClick={videoClick} file={files.file} />}

                                                                                                        <div className='media-id'>{files?.name}</div>

                                                                                                    </div>}

                                                                                                    {checkFileExtension(files).type === 'image' && <div className='wrapper-media'><img alt="" src={files.file}
                                                                                                        onClick={() => {
                                                                                                            playerType = 'image';
                                                                                                            setOpenPopupPlayer(true);
                                                                                                            setPlayerUrl(files.file);
                                                                                                        }}></img>

                                                                                                        <div className='media-id'>{files?.name}</div>

                                                                                                    </div>}

                                                                                                </div>)

                                                                                            })}

                                                                                        </div>

                                                                                    </div>}

                                                                                </div>

                                                                                {validateEditChat(msg, false) && <div className='dot'>

                                                                                    <button onClick={(e) => chatmenu(e, msg.id, msg)} title="option"></button>

                                                                                </div>}

                                                                            </div>

                                                                        </div>

                                                                    </div>
                                                                    )
                                                                }
                                                            })}

                                                        {showReply && chatId === messages.id && <div className='reply-chat' id={`textbox-${messages.id}`}>

                                                            {getUserNameImage(messageUserDetails, currentUserId, true, 'message_detail')}

                                                            {showReply && chatId === messages.id && <div className='reply-chat-wrapper'>
                                                                <div className='topic-filter-search-iassist'>

                                                                    <div className='search'>

                                                                        <Steno
                                                                            html={replyMessage}
                                                                            disable={false} //indicate that the editor has to be in edit mode
                                                                            onChange={(val) => {
                                                                                console.log(messages.id)
                                                                                if (replyEditorRef.current.textContent) storeChatDataInMemory(undefined, 'reply', messages.id, val)
                                                                                else removeChatDataInMemory();
                                                                                setReplyMessage(val);
                                                                            }}
                                                                            innerRef={replyEditorRef} //ref attached to the editor
                                                                            backgroundColor={'#000'}
                                                                            onChangeBackgroundColor={() => { }}
                                                                            fontColor={'#fff'}
                                                                            onChangeFontColor={() => { }}
                                                                            functionRef={fnReplyRef} //Ref which let parent component to access the methods inside of editor component
                                                                            isToolBarVisible={false} //to show/hide the toolbar options
                                                                            toolbarPosition={"bottom"} //to place the toolbar either at top or at bottom 
                                                                            formatStyle={false} //If true will let user to keep the style while pasting the content inside of editor
                                                                            onChangeOfKeepStyle={() => { }} //handle to change the format style variable
                                                                            showAddFileOption={false} //If true along with isToolBarVisible true will display the Add File option inside of toolbar
                                                                            fileList={[]} //List of file object to track the files selected by user
                                                                            // onFileChange={handleFileChange} //handler to update the filelist array, This function will receive a file event object as an argument, when user add a new file/files to the list.
                                                                            // removeTheFile={removeTheFile} //handler to delete the file from the filelist array, This function will receive a file name to be deleted as an argument.
                                                                            sendMsgOnEnter={true} //This will be used in case of chat application, where user wants to send msg on enter click.
                                                                            onEnterClickLogic={(e) => sendMessage(e, 'reply', messages.id)} //If user selects sendMsgOnEnter as true, then he/she has to provide the onEnter logic
                                                                            autoHeight={true} //If autoHeight is true, then the editor area will grow from minEditorHeight to maxEditorHeight
                                                                            minEditorHeight='20px' // Default will be 100px
                                                                            maxEditorHeight="300px" // Default maxHeight will be 250px
                                                                            placeHolder="Reply"
                                                                        />

                                                                        <button className='rply-btn' onClick={(e) => sendMessage(e, 'reply', messages.id)} disabled={showVideoLoader}></button>

                                                                    </div>

                                                                    <RecordOption showScreenButton={showReplyScreenButton} setShowVideo={setShowVideo} setDisplayMessage={setDisplayMessage} type={'reply'} videoUrl={replyVideoUrl} setDeleteSavedItem={setDeleteSavedItem} deleteSavedItem={deleteSavedItem} loader={showVideoLoader}></RecordOption>

                                                                    <div className='add-btn-chat'> <button title='plus' onClick={(e) => handleAddBtn(e, 'reply')}></button></div>

                                                                </div>
                                                            </div>}

                                                        </div>}

                                                    </div>

                                                </div>


                                                {!showSearch && editId !== messages.id && ((!messages.is_feedback && !messages.is_reopen) || messages.is_file) && <button className="action-menu" onClick={(e) => chatmenu(e, messages.id, messages)} title="option"></button>
                                                }
                                            </div>

                                        </div>
                                    )
                                })}



                                {confirmDelete && <Delete deleteTopic={deleteTopic} topic={topic.current} setConfirmDelete={setConfirmDelete} disable={setConfirmDelete} />}

                            </div>
                        </div>

                        {!showSearch && !confirmDelete && <div className='iassist-message' id='message'>
                            {showFeedback && <FeedBack closePane={closeFeedbackPane} id={chatIds} className={' feedback-wrapper chat-wrapper '} disabledButton={setShowFeedback} topic={topic.current} setLoader={setShowLoader} placeHolders='Message' getTopicsBasedOnFilter={getTopicsBasedOnFilter} />}

                            {/* Reopen Msg */}

                            {showReopen && <TicketReopen closePane={closeFeedbackPane} id={chatIds} className={' reopen-wrapper chat-wrapper'} topic={topic.current} setLoader={setShowLoader} placeHolders='Message' getTopicsBasedOnFilter={getTopicsBasedOnFilter} />}

                            {!showFeedback && !showReopen && <div className='topic-filter-search-iassist'>

                                {<div className='search'>

                                    <Steno
                                        html={message}
                                        disable={false} //indicate that the editor has to be in edit mode
                                        onChange={(val) => {
                                            if (editorRef.current.textContent) storeChatDataInMemory(val, 'message',)
                                            else removeChatDataInMemory();
                                            setMessage(val)
                                        }}
                                        innerRef={editorRef} //ref attached to the editor
                                        backgroundColor={'#000'}
                                        onChangeBackgroundColor={() => { }}
                                        fontColor={'#fff'}
                                        onChangeFontColor={() => { }}
                                        functionRef={fnRef} //Ref which let parent component to access the methods inside of editor component
                                        isToolBarVisible={false} //to show/hide the toolbar options
                                        toolbarPosition={"bottom"} //to place the toolbar either at top or at bottom 
                                        formatStyle={false} //If true will let user to keep the style while pasting the content inside of editor
                                        onChangeOfKeepStyle={() => { }} //handle to change the format style variable
                                        showAddFileOption={false} //If true along with isToolBarVisible true will display the Add File option inside of toolbar
                                        fileList={[]} //List of file object to track the files selected by user
                                        // onFileChange={handleFileChange} //handler to update the filelist array, This function will receive a file event object as an argument, when user add a new file/files to the list.
                                        // removeTheFile={removeTheFile} //handler to delete the file from the filelist array, This function will receive a file name to be deleted as an argument.
                                        sendMsgOnEnter={true} //This will be used in case of chat application, where user wants to send msg on enter click.
                                        onEnterClickLogic={sendMessage} //If user selects sendMsgOnEnter as true, then he/she has to provide the onEnter logic
                                        autoHeight={true} //If autoHeight is true, then the editor area will grow from minEditorHeight to maxEditorHeight
                                        minEditorHeight='20px' // Default will be 100px
                                        maxEditorHeight="300px" // Default maxHeight will be 250px
                                        placeHolder={topic.current.status_id === 3 ? "Send message to re-open this ticket" : "Message"}
                                        onClick={() => onClickSteno()}
                                    />

                                    <button type='button' className='send' onClick={(e) => sendMessage(e, 'message')} disabled={showVideoLoader || (!message && !videoUrl.length)}></button>

                                </div>}

                            </div>}

                            {!showFeedback && !showReopen && <div className='wrap-record'>

                                <RecordOption showScreenButton={showScreenButton} setShowVideo={setShowVideo} setDisplayMessage={setDisplayMessage} type={'message'} videoUrl={videoUrl} setDeleteSavedItem={setDeleteSavedItem} deleteSavedItem={deleteSavedItem} loader={showVideoLoader} dataUrl={saveDataUrl}></RecordOption>

                            </div>}
                            {!showFeedback && !showReopen && <div className='bottom-wrapper'>

                                <div className='add-btn-chat'> <button title='plus' onClick={(e) => handleAddBtn(e, 'message')}></button></div>

                                {((!activity || chatActivity.current) && topic.current && topic.current.status_id !== 3) && <div className='close-btn' onClick={() => setShowFeedback(true)}><button title='close ticket'> </button>Close Ticket</div>}

                                {activity && !chatActivity.current && topic.current.status_id !== 3 && <div className='delete-btn' onClick={() => setConfirmDelete(true)}><button> </button>Delete Ticket</div>}

                            </div>}

                        </div>}
                    </div>
                </div>

            </div>}

            {showVideo && <VideoRecord save={saveAndClose} close={setShowVideo} message={displayMessage} />}

        </>

    )
    //: (<Support closePane={closePane} webSocket={socketDetail} panelPosition={panelPosition} platformId={platformId} />)

}

export default memo(ChatRoom);
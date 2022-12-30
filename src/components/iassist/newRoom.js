

import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import debounce from "lodash.debounce"

import './newRoom.scss';
import * as Constants from '../Constants';
import { getTokenClient, getUser } from '../../utils/Common';
import alertService from '../../services/alertService';
import Support from './Support';
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

let msg = [];

let Ids = '';

let ws;

const pageNumber = 1;

const pageSize = 10;

let scrollHeight = 0;

let totalCount = 0;

let borderChatId = '';

let parent_note_id = 0;

let collabId = [];

let TakeSupportId = [];

let playerType = '';

let clickBackButton = false;

const ChatRoom = ({ closePane, chatIds, unRead, topicDetail, allUser, allAccount, type, activity, refresh, refreshState, socketDetail }) => {

    const bodyRef = useRef();

    const topScroll = useRef();


    const [messageList, setMessageList] = useState([]);

    const [message, setMessage] = useState("");

    //Don't remove borderChat
    const [borderChat, setBorderChat] = useState('');

    const [showMainMenu, setShowMainMenu] = useState(false);

    const [chatId, setChatId] = useState('');

    const [showReply, setShowReply] = useState(false);

    const [replyMessage, setReplyMessage] = useState('');

    const [sendRepliesList, setSendRepliesList] = useState([]);

    const [hideReply, setHideReply] = useState(false);

    const [scrolls, setScrolls] = useState(false);

    const [topic, setTopic] = useState(topicDetail);

    const [navigateHome, setNavigateHome] = useState(false);

    const [users, setUser] = useState([]);

    const [searchString, setSearchString] = useState('');

    const [clientUser, setClientUser] = useState([]);

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

    const chatActivity = useRef((topic.activity_collaborate || topic.activity_chat) ? true : false);

    const editorRef = useRef();

    const fnRef = useRef();

    const replyEditorRef = useRef();

    const editEditorRef = useRef();

    const editFnRef = useRef()

    const fnReplyRef = useRef();

    const getMessageHeight = useRef();

    const [editedMessage, setEditedMessage] = useState('')

    const Size = useRef(pageSize);

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

                    let json = response;

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

        const jwt_token = getTokenClient();

        let token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `topic/user_details/?topic_id=${chatIds}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let collabUser = [];

                    let supportUsers = []

                    let json = response;

                    setUserData(json);

                    setClientUser(json.client_participants);

                    setMessageUserDetails(json?.all_users);

                    json.client_participants.map(user => collabUser = [...collabUser, user.id]);

                    json.support_participants.map(user => supportUsers = [...supportUsers, user.id])

                    collabId = collabUser;

                    TakeSupportId = supportUsers;

                    setShowLoader(false);

                }

            })
            .catch(err => {

                setShowLoader(false);

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

        } else if (type === 'search') {

            setSearchString(event.target.value);

            if (event.target.value !== '') {
                getChatSearch(event, event.target.value)
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

        if (type === 'reply') {

            msg = {
                "message": {
                    "file": saveDataUrl,
                    "message": replyMessage
                },
                "is_file": saveDataUrl.length > 0 ? 1 : 0,
                "parent_note_id": messageId
            }

        } else {

            msg = {
                "message": {
                    "file": saveDataUrl,
                    "message": message
                },
                "is_file": saveDataUrl.length > 0 ? 1 : 0,
                "parent_note_id": 0
            }

        }

        let validateText = message.replaceAll("&nbsp;", "");

        let text = validateText.trim();

        if ((text !== '' && !emptyStringValidation(message)) || (replyMessage !== '' && type === 'reply' && !emptyStringValidation(replyMessage)) || saveDataUrl.length > 0) {
            // Web Socket is connected, send data using send()

            if (ws.readyState !== WebSocket.CLOSED) {

                chatActivity.current = true;

                ws.send(JSON.stringify(msg));

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

        let dates = getTimeZone(msg.created_at, true);

        let msg_send_date = new Date(dates);

        let current_date = new Date();

        let subMin = Math.abs(msg_send_date.getMinutes() - current_date.getMinutes());

        let subHr = Math.abs(msg_send_date.getHours() - current_date.getHours());

        let isData = false;

        isData = subMin <= 3 && subHr === 0 ? true : false

        if (setAccessValue) {

            setEditAccess(isData);

            return

        }

        return isData;

    }
    const chatmenu = (e, key, type, msg) => {

        Ids = key;

        validateEditChat(msg, true);

        setShowMainMenu(true);

    }

    useEffect(() => {

        if (refresh) {

            fetchCollabUsers()

        }

    }, [refreshState])

    useEffect(() => {

       

        if (messageList.length === 0) {

            fetchData();

        }

    }, [chatIds])




    useEffect(() => {

        let unreadDataList = JSON.parse(localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'unread'));

        if (unreadDataList?.length > 0 && unreadDataList.includes(chatIds)) {
            let index = unreadDataList.findIndex((data) => data === chatIds)
            unreadDataList.splice(index, 1);
            if (unreadDataList.length === 0) {
                console.log(document.getElementById('iassist-unread'));
                if (document.getElementById('iassist-unread')) document.getElementById('iassist-unread').remove();
            }
            localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(unreadDataList));
        }

        let user = getUser();

        setCurrentUserId(user.id);

        if (userData.length === 0) {

            fetchCollabUsers();

        }

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('support-wrapper');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';


        }

        const onScroll = async (event) => {

            if (bodyRef.current.scrollTop < 10 && (totalCount > Size.current)) {

                scrollHeight = bodyRef.current.scrollHeight;

                setScrolls(true);

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

            let head = document.getElementById('menu');

            let reply = document.getElementById('rply-menu');

            if ((head && !(head.contains(event.target))) || (reply && !(reply.contains(event.target)))) {

                setShowMainMenu(false);

            }

            let record = document.getElementById('record')

            if (record && !(record.contains(event.target))) {

                setShowScreenButton(false)

                setShowReplyScreenButton(false);

            }

            let media = document.getElementById('media-player');

            if (media && !(media.contains(event.target))) {

                setOpenPopupPlayer(false);

            }

            let list = document.getElementById('user-list');

            if (list && !(list.contains(event.target))) {

                setShowUserPane(false);

            }

            let chatContainer = document.getElementById('main-chat-container');

            if (chatContainer && !(chatContainer.contains(event.target))) {

                Size.current = pageSize;

                close();

            }

        })

        window.addEventListener('online', onOnline)

        window.addEventListener('offline', onOffline)

        return () => {
            Size.current = pageSize;

            ws.close();

            window.removeEventListener('online', onOnline)

            window.removeEventListener('offline', onOffline)
        }

    }, [])

    const onOffline = (event) => {

        if (ws !== undefined) {

            alertService.showToast('error', 'your connection got disconnected');

            ws.close();

        }

    }

    const onOnline = (event) => {

        const jwt_token = getTokenClient();

        ws = new WebSocket(Constants.API_WEBSOCKET_URL + `chat/${chatIds}/`, jwt_token)

        alertService.showToast('alert', 'Back to Online');

    }
    ws.onmessage = function (evt) {

        var received_msg = JSON.parse(evt.data);

        if (received_msg.parent_note_id === 0 || 'chat_data' in received_msg) {

            if ('chat_data' in received_msg) {

                msg = received_msg.chat_data;

                setMessageList(msg);

            } else {

                setMessageList([...messageList, received_msg]);

            }

            editorRef.current.focus();

        } else if (received_msg.parent_note_id !== 0) {

            messageList.filter((ms) => {

                if (ms.id === received_msg.parent_note_id) {

                    ms.replies = [...ms.replies, received_msg];

                    return ms;

                }
            })

            let contentWrapper = document.getElementById(`content${chatId}`);

            topScroll.current = contentWrapper?.scrollHeight

            setSendRepliesList([...sendRepliesList, received_msg]);

            setHideReply(true)

            setRestrictScrollOnReply(!restrictScrollOnReply);

            replyEditorRef.current.focus();

        }

    };

    ws.onopen = function () {

        console.log("websocket connected")

    };

    ws.onclose = function () {

        console.log("connection Closed");

        if (clickBackButton) {


            setNavigateHome(true);

        }
    };

    useEffect(() => {
        return () => {
            clickBackButton = false;

        };
    }, [navigateHome])

    useEffect(() => {

        let contentWrapper = document.getElementById(`content${chatId}`)

        if (contentWrapper) {

            let diffHeight = contentWrapper?.scrollHeight - topScroll.current;

            bodyRef.current.scrollTop += diffHeight;

            topScroll.current = undefined;

        }

    }, [restrictScrollOnReply])

    const reply = (e, message) => {

        setChatId(Ids);


        setShowMainMenu(false);

        getReply(e, message.id, false, hideReply)

    }

    // this useeffect is used for adjust the scroll position of opening and hiding reply, screen capture option inside reply it works
    useEffect(() => {

        if (hideReply && !showReplyScreenButton) {

            let contentWrapper = document.getElementById(`textbox-${chatId}`)

            contentWrapper?.scrollIntoView({ behavior: "smooth", block: "nearest" })

        }

    }, [chatId, hideReply, showReplyScreenButton])

    useEffect(() => {

        chatActivity.current = (topic.activity_collaborate || topic.activity_chat) ? true : false;

    }, [topic.activity_collaborate, topic.activity_chat])

    const getReply = (e, id, isNonZero, hideReply) => {


        if (hideReply && chatId === id) {

            setHideReply(false);

            setShowReply(false);

            getMessageHeight.current = undefined;

        }

        setChatId(id);

        if (!hideReply) {

            let contentWrapper = document.getElementById(`content${id}`)

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

                borderChatId = ''

                scrollIntoLastMessage();

            }

        }

    }, [messageList, showScreenButton])

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

        if (query) { key = `&key=${query}` }

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/key/?topic_id=${chatIds}${key}&page_size=1000&page_number=1`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let json = response;

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

        for (let i = 0; i < TakeSupportId.length; i++) {

            if (TakeSupportId[i] === id) {

                label = label !== '' ? label + ' + AGENT' : 'AGENT';

                break;

            }

        }


        return label ? label : 'CLIENT';

    }

    const getUserNameBasedOnId = (id) => {

        if (messageUserDetails?.length > 0) {

            let userName;

            for (let i = 0; i < messageUserDetails.length; i++) {

                if (messageUserDetails[i].id === id) {

                    userName = messageUserDetails[i].first_name;

                    break;

                }

            }

            return userName;

        }

    }

    const searchClick = async (topic) => {

        if (showSearch) {

            const jwt_token = getTokenClient()

            borderChatId = topic.id;

            setBorderChat(topic.id);

            let id = topic.parent_note_id === 0 ? topic.id : topic.parent_note_id

            if (topic?.parent_note_id !== 0) {

                setChatId(topic.parent_note_id);

                setHideReply(true);

            }

            const token = `Bearer ${jwt_token}`;

            APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/page/?topic_id=${topic.topic_id}&chat_id=${id}`, null, false, 'GET', controller, token)
                .then(response => {

                    if (response) {

                        let json = response;

                        for (let key in json) {

                            let data = json[key];

                            if (key === 'chat_id_count') {

                                // if (data < 10) {

                                Size.current = data < 10 ? pageSize : data;

                                // } else {

                                //     Size.current = data;

                                // }

                                scrollHeight = 15;

                                fetchData();

                                setSearchScroll(true);

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

    const getUserNameImage = (id, isReply) => {

        let user;

        if (messageUserDetails?.length > 0) {

            for (let i = 0; i < messageUserDetails.length; i++) {

                if (messageUserDetails[i].id === id) {

                    user = messageUserDetails[i];

                    break;

                }

            }

            if (user) {

                return <div style={isReply ? { marginTop: '-15px' } : {}}><Avatar imgSrc={user.cover_img_url}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    alt={`${user.first_name}'s pic`}
                    height={30}
                    width={30}
                    fontSize={9} />
                </div>

            }

        }

    }

    const getTimeZone = (date, isDateFormat) => { //* change with other timeZone function in support center

        date = date.replace('T', " ").concat(' GMT');

        let d = new Date(date);

        let dateOptions = { year: 'numeric', month: 'short' };

        let timeOptions = { hour12: true, hour: '2-digit', minute: '2-digit' };

        let a = `${d.getDate()} ${d.toLocaleDateString('en-us', dateOptions)} ${d.toLocaleTimeString('en-us', timeOptions)}`;
        let time;

        if (!isDateFormat) {

            time = getDiffDay(a);

        } else {

            time = `${d.getDate()} ${d.toLocaleDateString('en-us', dateOptions)} ${d.toLocaleTimeString('en-us', timeOptions)}`;

        }

        return time;

    }

    const editMessageClick = (e, msg) => {

        // let token = getToken();

        let userDetail = getUser();

        if (userDetail.id === msg.user_id) {

            setEditId(msg.id);

            parent_note_id = msg.parent_note_id;

            setEditedMessage(msg?.is_file ? msg?.note?.message : msg.note);

            setShowMainMenu(false);
            console.log(document.getElementById(`masg${msg.id}`))

        } else {

            setShowMainMenu(false);

            alertService.showToast('error', "You are not allowed to edit this message")

        }

    }

    const editMessage = async (e) => {

        let Index = -1;

        let jwt_token = getTokenClient();

        let data = {
            chat_id: editId,
            parent_note_id: parent_note_id,
            message: editedMessage
        }

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `chats/`, data, false, 'PUT', null, token)
            .then(response => {

                if (response) {

                    let json = response;

                    messageList.map((msg, index) => {

                        if (msg.id === json.chat_data.id) {

                            msg = json.chat_data;

                            Index = index;

                        }

                    }
                    )

                    messageList.splice(Index, 1, json.chat_data);

                    setEditId('');

                    setMessage('');

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

    const userSelect = (e, id, add) => {

        let data = {
            topic_id: chatIds,
            user_id: [
                id
            ]
        }

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `add_remove_client/?flag=${add}`, data, false, 'POST', controller, token)
            .then(response => {

                if (response) {

                    // let json = response;

                    if (!add) {

                        fetchCollabUsers();

                        let userData = getUser();

                        if (userData?.id === id) {

                            setNavigateHome(true);
                        }

                    }

                    if (add)
                        // collabId = [...collabId, json.data[0].user_id]
                        setShowLoader(false);

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

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'topic/?topic_id=' + data.id, null, false, 'DELETE', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    alertService.showToast('success', result.message);

                    setNavigateHome(true);

                }

            })
            .catch(err => {

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

    const getDiffDay = (time) => {

        var dt1 = new Date();

        var dt2 = new Date(time);

        var diff = (dt2.getTime() - (dt1.getTime())) / 1000;

        diff /= 60;

        let timeDiff

        let min = Math.abs(Math.round(diff));

        if (min < 1) {

            timeDiff = 'Now'

        } else if (min >= 1 && min < 60) {

            timeDiff = Math.round(min) + 'm ago'

        } else if (min > 59) {

            let hour = min / 60;

            if (hour < 24) {

                timeDiff = Math.round(hour) + 'h ago'

            } else {

                let day = hour / 24;


                if (day < 31) {

                    timeDiff = Math.round(day) + 'd ago';

                } else {

                    let month = day / 31;

                    timeDiff = Math.round(month) + 'm ago'

                }

            }

        }

        return timeDiff;

    }

    const fetchIndivTopic = async () => {

        const status_flag = topic?.status_id === 3 ? true: false;

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `topic/?page_size=10&page_number=1&status_flag=${status_flag}&ticket_id=${topic.id}&sort_order=descending`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    setTopic(result.topic_data[0]);

                }

            })
            .catch(err => {

                setShowLoader(false);

            });

    }

    const checkVideo = (file) => {

        let data = file?.file.substring(file.file.length - 4, file.file.length);

        if (data === 'webm' || data === '.mov') {

            return true;

        } else {

            return false;

        }

    }

    const checkImage = (file) => {

        let data1 = file?.file.substring(file.file.length - 3, file.file.length);

        let data2 = file?.file.substring(file.file.length - 4, file.file.length);


        if (data1 === 'png' || data2 === 'jpeg') {

            return true;

        } else {

            return false;

        }

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

            let response = await fetch(Constants.API_IASSIST_BASE_URL + `uploadfile/?topic_id=${chatIds}&broadcast=false&file_upload=true`, {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            })

            let result = await response.json();

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

        setShowVideo(false);

        setShowScreenButton(false);

        setShowVideoLoader(true);

        setShowReplyScreenButton(false);

        uploadFile(blob, message)

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

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('support-wrapper');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';


        }

        let chatBody = document.getElementById('chat-list-wrapper');

        let message = document.getElementById('message');

        chatBody.style.bottom = message.clientHeight + 6 + 'px';

        chatBody.style.setProperty('maxHeight', `calc(100% - ${message.clientHeight + 'px'})`)

        scrollIntoLastMessage();

    }, [videoUrl.length])

    const debouncedResults = useMemo(() => {
        return debounce(handleInputChange, 500);
    }, []);

    useEffect(() => {
        return () => {

            debouncedResults.cancel();
        };
    }, [searchString]);

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

    const loadFile = (e, msgDetail) => {

        let getLastId = messageList[messageList.length - 1]?.id;

        if (getLastId && !hideReply) {

            scrollIntoLastMessage();

        }

    }

    const onClickSteno = () => {
        if (topic.status_id === 3) {
            setShowReopen(true);
        }
    }

    return !navigateHome ? (

        <>

            {!showVideo && <div id='main-chat-container' className='support-wrapper'>

                <div className='header-wrapper'>


                    <div className='header-inner'>

                        <span className='header-back' onClick={() => {
                            ws.close();
                            clickBackButton = true;

                        }}>Back</span>

                    </div>

                    <div className='header-other-functionality-wrapper'>

                        <div className='topic-filter-search-iassist' id='search-box'>

                            <div className='search'>

                                <button onClick={getChatSearch} className='btn' title='search'></button>

                                <input type={'text'} title='Search' placeholder='Search' onChange={(e) => { e.persist(); debouncedResults(e, 'search') }} />

                            </div>

                        </div>

                        <div className='author-list' onClick={() => setShowUserPane(true)}>

                            {clientUser && clientUser.map((user, index) => {
                                if (index <= 2) {
                                    return <span key={user.id + index.toString()}>
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

                                        return <span className='number' key={index}> +{clientUser.length - 3}</span>

                                    } else { return }

                                }

                            })}

                            <div className='add-icon-wrapper'>

                                <button className='add-icon'></button>


                            </div>

                        </div>

                        {noneRead !== undefined && noneRead !== 0 && <div className='unread'>

                            <span>{noneRead}</span>

                        </div>}

                        <button className='header-close' onClick={() => close()}></button>

                    </div>

                </div>

                {showLoader && <LoadingScreen />}

                {openPopupPlayer && <Player id='media-player' url={playerUrl} type={playerType} close={setOpenPopupPlayer} />}

                <div className='title-widget'>

                    <div className={'name'} onClick={() => setShowExpand(!showExpand)}>{topic && topic.name}

                        <button className={'button' + (showExpand ? ' full-button' : '')} title='expand'></button>

                    </div>

                    <div className={'description' + (showExpand ? ' full-description' : '')}>{topic && topic.description}</div>

                    <Detail topic={topic} type={type} allAccount={allAccount} allUser={allUser} />

                </div>

                {showFeedback && <FeedBack closePane={closeFeedbackPane} id={chatIds} className={' feedback-wrapper'} disabledButton={setShowFeedback} Topic={topic} />}

                {showReopen && <TicketReopen closePane={closeFeedbackPane} id={chatIds} className={' reopen-wrapper'} Topic={topic} />}

                <div id='chat-list-wrapper' className={'chat-list-wrapper' + (confirmDelete ? ' delete-wrapper' : '')} ref={bodyRef}>

                    {showUserPane && <UserList
                        user={users}
                        clientUser={userData.client_participants}
                        position={'absolute'}
                        height={150}
                        header={true}
                        supportUser={userData.support_participants}
                        userSelect={userSelect}
                        collaborator={collabId}
                        close={setShowUserPane}
                        author={topic && topic.user_id}
                        id='user-list' topic={topic}
                    />}

                    {!confirmDelete && messageList.length > 0 && messageList.map((messages, index) => {
                        return (
                            <div className='chat-wrapper' key={messages.id} style={{ border: borderChatId === messages.id ? '2px solid green' : '', cursor: showSearch ? 'pointer' : 'auto' }} onClick={() => searchClick(messages)}>

                                <div className='support-header'>

                                    {showMainMenu && Ids === messages.id &&
                                        <ul id='menu' className='pane'>

                                            <li onClick={(e) => reply(e, messages)}>Reply</li>

                                            {editAccess && <li onClick={(e) => editMessageClick(e, messages)}>Edit</li>}

                                        </ul>

                                    }

                                    <div className='support-header-left'>

                                        <div> {getUserNameImage(messages.user_id, false)}</div>

                                        <div className='content-wrapper' id={`content${messages.id}`}>

                                            <span className='name'>{getUserNameBasedOnId(messages.user_id)}</span>

                                            <span className='card-label'>{getUserCardLabel(messages.user_id)}</span>

                                            <span className='time-zone'> &nbsp;{getTimeZone(messages.created_at, false)} </span>

                                            {editId !== messages.id && !messages.is_file && !messages.is_feedback && !messages.is_reopen && <div className='content' id={"msg" + message.id}>

                                                {parse(messages.note, options)}

                                            </div>}

                                            {editId === messages.id &&!messages.is_file && !messages.is_feedback && !messages.is_reopen && <div className='content'>

                                                <Steno
                                                    html={editedMessage}
                                                    disable={false} //indicate that the editor has to be in edit mode
                                                    onChange={(val) => { 
                                                        console.log(val);
                                                        setEditedMessage(val) }}
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
                                                    <button type='button' className='save' onClick={(e) => editMessage(e)}>save</button>
                                                    <button type='button' className='cancel' onClick={editCancel}>cancel</button>

                                                </div>
                                            </div>}

                                            {!messages.is_file && messages.is_feedback && !messages.is_reopen && <div className='content'>

                                                <div className='change-status'>Changed status of this ticket to  <span>Resolved</span></div>

                                                <div className='feedback'> Feedback Given <li onClick={() => openFeedbackMessage(messages.id)}>{messages.note.feedback}</li> <button onClick={() => openFeedbackMessage(messages.id)} className={'arrow' + (showFeedbackMessage ? ' rotate' : '')} title='arrowdown'></button></div>

                                                {feedId === messages.id && showFeedbackMessage && <div className='text'>{messages.note.text}</div>}

                                            </div>}

                                            {!messages.is_file && !messages.is_feedback && messages.is_reopen && <div className='content'>

                                                <div className='change-status'>Changed status of this ticket to  <span>In Progress</span></div>

                                                <div className='feedback'> Reopen Reason <li>{messages.note.reopen_reason}</li></div>

                                            </div>}

                                            {messages.is_file && !messages.is_feedback && <div className='content'>

                                                {parse(messages.note.message, options)}

                                                <div className='content-video'>

                                                    {messages.note.file.map((files, index) => {
                                                        return (<div className='content-wrapper-media' key={index}>
                                                            {checkVideo(files, 'video') && <div className='wrapper-media'>
                                                                <video src={files.file} onClick={() => {

                                                                    videoClick(files.file)
                                                                }} onLoad={(e) => loadFile(e, messages)}>
                                                                </video>

                                                                {files?.file && <PlayButton handleClick={videoClick} file={files.file} />}

                                                                <div className='media-id'>{files?.name}</div>

                                                            </div>}

                                                            {checkImage(files) && <div className='wrapper-media'><img alt="" src={files.file} onClick={() => {
                                                                playerType = 'image';
                                                                setOpenPopupPlayer(true)
                                                                setPlayerUrl(files.file)
                                                            }} onLoad={(e) => loadFile(e, messages)}></img>

                                                                <div className='media-id'>{files?.name}</div>

                                                            </div>}

                                                        </div>)

                                                    })}

                                                </div>

                                            </div>}


                                            {!showSearch && messages.replies && messages.replies.length > 0 && <span className='replied' onClick={(e) => getReply(e, messages.id, messages.replies.length > 0, hideReply)}>

                                                <button className={'reply-arrow' + (hideReply && chatId === messages.id ? ' reply-rotate' : '')}>Reply</button>

                                            </span>}

                                            {hideReply && messages.replies && messages.replies.length > 0 && chatId === messages.id && messages.replies.map((msg, index) => {
                                                if (messages.id === msg.parent_note_id) {

                                                    return (<div className='reply-wrapper' key={msg.id} style={{ border: borderChatId === msg.id ? '2px solid green' : '', cursor: showSearch ? 'pointer' : 'auto' }}>
                                                        <div className='header-reply'>

                                                            {showMainMenu && Ids === msg.id &&
                                                                <ul id='menu' className='panes'>

                                                                    {editAccess && <li onClick={(e) => editMessageClick(e, msg)}>Edit</li>}

                                                                </ul>
                                                            }
                                                            <div className='reply-header-wrapper'>

                                                                <div> {getUserNameImage(msg.user_id, false)}</div>

                                                                <div className='reply-sub-wrapper'>

                                                                    <span className='name'>{getUserNameBasedOnId(msg.user_id)} &nbsp; </span>

                                                                    <span className='card-label'>{getUserCardLabel(msg.user_id)}</span>

                                                                    <span className='time-zone'> &nbsp;{getTimeZone(msg.created_at, false)} </span>

                                                                    {!msg.is_file && <div className='content-reply'>

                                                                        {parse(msg.note, options)}

                                                                    </div>}

                                                                    {msg?.is_file && !msg?.is_feedback && <div className='content-reply'>

                                                                        {parse(msg?.note?.message, options)}

                                                                        <div className='content-video'>

                                                                            {msg.note.file.map((files, index) => {
                                                                                return (<div className='content-wrapper-media' key={index}>

                                                                                    {checkVideo(files, 'video') && <div className='wrapper-media'> <video src={files.file} onClick={() => {

                                                                                        videoClick(files.file)

                                                                                    }}>

                                                                                    </video>

                                                                                        {files?.file && <PlayButton handleClick={videoClick} file={files.file} />}

                                                                                        <div className='media-id'>{files?.name}</div>

                                                                                    </div>}

                                                                                    {checkImage(files) && <div className='wrapper-media'><img alt="" src={files.file}
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

                                                                    <button onClick={(e) => chatmenu(e, msg.id, 'main', msg)} title="option"></button>

                                                                </div>}

                                                            </div>

                                                        </div>

                                                    </div>

                                                    )
                                                }
                                            })}

                                            {showReply && chatId === messages.id && <div className='reply-image' id={`textbox-${messages.id}`}>

                                                {getUserNameImage(currentUserId, true)}

                                                {showReply && chatId === messages.id && <div className='topic-filter-search-iassist'>

                                                    <div className='search'>

                                                        <Steno
                                                            html={replyMessage}
                                                            disable={false} //indicate that the editor has to be in edit mode
                                                            onChange={(val) => { setReplyMessage(val) }}
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

                                                    <div className='add-btn'> <button title='plus' onClick={(e) => handleAddBtn(e, 'reply')}></button></div>

                                                </div>}

                                            </div>}

                                        </div>

                                    </div>

                                    {!showSearch && <button className="action-menu" onClick={(e) => chatmenu(e, messages.id, 'main', messages)} title="option"></button>}
                                </div>

                            </div>
                        )
                    })}

                    {confirmDelete && <Delete deleteTopic={deleteTopic} topic={topic} setConfirmDelete={setConfirmDelete} disable={setConfirmDelete} />}

                </div>

                {!showSearch && <div className='message' id='message'>

                    {<div className='topic-filter-search-iassist'>

                        {<div className='search'>

                            <Steno
                                html={message}
                                disable={false} //indicate that the editor has to be in edit mode
                                onChange={(val) => { setMessage(val) }}
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
                                placeHolder={topic.status_id === 3 ? "Send message to re-open this ticket" : "Message"}
                                onClick={() => onClickSteno()}
                            />

                            <button type='button' className='send' onClick={(e) => sendMessage(e, 'message')} disabled={showVideoLoader}></button>

                        </div>}

                    </div>}

                    <div className='wrap-record'>

                        <RecordOption showScreenButton={showScreenButton} setShowVideo={setShowVideo} setDisplayMessage={setDisplayMessage} type={'message'} videoUrl={videoUrl} setDeleteSavedItem={setDeleteSavedItem} deleteSavedItem={deleteSavedItem} loader={showVideoLoader}></RecordOption>

                    </div>
                    <div className='bottom-wrapper'>

                        <div className='add-btn'> <button title='plus' onClick={(e) => handleAddBtn(e, 'message')}></button></div>

                        {((!activity || chatActivity.current) && topic && topic.status_id !== 3) && <div className='close-btn' onClick={() => setShowFeedback(true)}><button title='close ticket'> </button>Close Ticket</div>}

                        {activity && !chatActivity.current && topic.status_id !== 3 && <div className='delete-btn' onClick={() => setConfirmDelete(true)}><button> </button>Delete Ticket</div>}

                    </div>

                </div>}

            </div>}

            {showVideo && <VideoRecord save={saveAndClose} close={setShowVideo} message={displayMessage} />}

        </>

    ) : (<Support closePane={closePane} webSocket={socketDetail} />)

}

export default memo(ChatRoom);
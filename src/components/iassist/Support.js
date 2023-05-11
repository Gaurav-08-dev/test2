import React, { useState, useEffect, useRef, memo, useReducer } from 'react';
import './Support.scss';
import SpeedSelect from 'react-speedselect';
import CreateChatRoom from './CreateChatRoom';
import * as Constants from '../Constants';
import ChatRoom from './newRoom';
import { getTokenClient, getUser } from '../../utils/Common';
import alertService from '../../services/alertService';
import LoadingScreen from './loader/Loading';
import APIService from '../../services/apiService';
import FeedBack from './feedback/Feedback';
import TicketReopen from './feedback/TicketReopen';
import Detail from './userlist/Detail';
import Delete from './DeleteConfirmation/Delete';
import MultiPeriodPickerPanel from '../MultiPeriodPicker/MultiPeriodPicker';
import { formatDates, isElectron } from "./Utilityfunction";
import ClickOutsideListner from "./ClickOutsideListener";


let pageNumber = 1;
const pageSize = 10;
let totalPage = 0;
let tabData = 'open';
let dateRange = ['Date'];
const defType = { 'name': 'All', 'id': 'All' };
const defReporter = { 'first_name': 'All', 'id': 'All' };
let isDeleteClick = false;

let reporter_detail = {
    id: 0
};
let type_detail = {
    id: 0
};

let chatId = '';
let refreshUserListInsideChat = false;

let retainedStatus = {
    read: true,
    unread: true
};


const actionType = {
    topic_click: 'topicClick',
    count_change: 'countChange',
    show_chat: 'showChat',
    unread_count: 'unreadCount',
    individual_topic: 'individualTopic',
    status_tab: 'statusTab',
    show_feedback: 'showFeedback',
    show_reopen_panel: 'showReopenPanel',
    feedBack_id: 'feedbackId',
    show_multiple_filters: 'showMultipleFilters',
    is_open_calendar: 'isOpenCalendar',
    ticket_type_label: 'ticketTypeLabel',
    reporters_label: 'reporterLabel',
    selected_date: 'selectedDate',
    initial_load_status: 'initialLoadStatus',
    get_topic_id: 'getTopicId',
    delete_id: 'deleteId',
    last_activity: 'lastActivity',
    refresh_state: 'refreshState',
    read_unread_status: 'readUnreadStatus'
}

const reducer = (state, action) => {

    switch (action.type) {

        case 'topicClick': return { ...state, topicClick: action.payload }
        case 'countChange': return { ...state, countChange: !state.countChange }
        case 'showChat': return { ...state, showChat: action.payload }
        case 'unreadCount': return { ...state, unreadCount: action.payload }
        case 'individualTopic': return { ...state, individualTopic: action.payload }
        case 'statusTab': return { ...state, statusTab: action.payload }
        case 'showFeedback': return { ...state, showFeedback: action.payload }
        case 'showReopenPanel': return { ...state, showReopenPanel: action.payload }
        case 'feedbackId': return { ...state, feedbackId: action.payload }
        case 'showMultipleFilters': return { ...state, showMultipleFilters: action.payload }
        case 'isOpenCalendar': return { ...state, isOpenCalendar: !state.isOpenCalendar }
        case 'ticketTypeLabel': return { ...state, ticketTypeLabel: action.payload }
        case 'reporterLabel': return { ...state, reporterLabel: action.payload }
        case 'selectedDate': return { ...state, selectedDate: action.payload }
        case 'initialLoadStatus': return { ...state, initialLoadStatus: action.payload }
        case 'getTopicId': return { ...state, getTopicId: action.payload }
        case 'deleteId': return { ...state, deleteId: action.payload }
        case 'lastActivity': return { ...state, lastActivity: action.payload }
        case 'refreshState': return { ...state, refreshState: !state.refreshState }
        case 'readUnreadStatus': return { ...state, readUnreadStatus: action.payload }

        default:
            throw new Error();
    }
}


const Support = ({ closePane, topicClick, webSocket, panelPosition, platformId, storedData,setStoredData }) => {

    const initialState = {
        topicClick: topicClick ? topicClick : false,
        countChange: false,
        showChat: false,
        unreadCount: 0,
        individualTopic: [],
        statusTab: 'open',
        showFeedback: false,
        showReopenPanel: false,
        feedbackId: '',
        showMultipleFilters: false,
        isOpenCalendar: false,
        ticketTypeLabel: 'All',
        reporterLabel: 'Select',
        selectedDate: new Date(),
        initialLoadStatus: true,
        getTopicId: '',
        deleteId: false,
        lastActivity: false,
        refreshState: false,
        readUnreadStatus: { read: true, unRead: true }
    }

    const [state, dispatch] = useReducer(reducer, initialState);


    const controller = new AbortController();

    const prevSearchValue = useRef();
    const allTopics = useRef([]);

    const unReadList = useRef([]);
    const activity = useRef([]);
    const btnId = useRef(sessionStorage?.getItem(Constants.SITE_PREFIX_CLIENT + 'buttonId'));

    const bodyRef = useRef();
    const searchString = useRef('');
    const allUser = useRef([]);
    const allAccount = useRef([]);
    const ticketTypeList = useRef([]);
    const reportersList = useRef([]);

    const unRead = useRef(true);
    const checkApptype = useRef(isElectron());
    const readCheckBoxStatus = useRef(true)


    const [showLoader, setShowLoader] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const [updateValue, setUpdateValue] = useState(false);
    if (allTopics.current.length === 0 && (tabData=== 'open' && storedData.Active.length !== 0 || tabData === 'resolved' && storedData.Resolved.length !== 0)) {

        setValueFromMemory(tabData === 'open'? storedData.Active : storedData.Resolved);
    }


    if (ticketTypeList.current.length > 0 && ticketTypeList.current[0].id !== 'All') {

        ticketTypeList.current.unshift(defType);

    }

    if (reportersList.current.length > 0 && reportersList.current[0].id !== 'All') {

        reportersList.current.unshift(defReporter);

    }

    const getUrl = (searchQuery) => {

        let tab = !(tabData === 'open');

        let url;

        const searchStringFlag = searchString.current ? `&topic_search=${searchString.current}` : searchQuery ? `&topic_search=${searchQuery}` : '';


        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform');
        const unReadFlag = unRead.current ? '&unread=true' : '&unread=false'
        const readFlag = readCheckBoxStatus.current ? '&read=true' : '&read=false'


        if (dateRange[0] === 'Date') {

            url = Constants.API_IASSIST_BASE_URL + `${platform}/topic/?page_size=${pageSize}&page_number=${pageNumber}&status_flag=${tab}&sort_order=descending&type_id=${type_detail?.id}&reporter=${reporter_detail?.id}${searchStringFlag}${unReadFlag}${readFlag}&app_id=${platformId}`;

        } else {

            url = Constants.API_IASSIST_BASE_URL + `${platform}/topic/?page_size=${pageSize}&page_number=${pageNumber}&status_flag=${tab}&sort_order=descending&type_id=${type_detail?.id}&date_from=${dateRange[0]}&date_to=${dateRange[1]}&reporter=${reporter_detail?.id}${searchStringFlag}${unReadFlag}${readFlag}&app_id=${platformId}`;

        }

        return url;

    }

    const getTopicsBasedOnFilter = async (searchQuery, updatedPageNumber, ticket) => {

        if (updatedPageNumber) pageNumber = updatedPageNumber;

        setUpdateValue(true);

        if (!updatedPageNumber && !ticket) setShowLoader(true);
        if(!ticket) setDisableButton(true)

        dispatch({ type: actionType.initial_load_status, payload: false })

        if (tabData) {
            dispatch({ type: actionType.status_tab, payload: tabData })
        }

        let url = getUrl(searchQuery);

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(url, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    // sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'tickets', JSON.stringify(response));
                    if (pageNumber === 1) {
                        setStoredData(tabData === 'open' ? {Active: response,Resolved: []}: {Active: [], Resolved: response})
                    }
                    const result = response;

                    for (let key in result) {

                        let data = result[key];

                        if (key === 'topic_data') {
                            // ;

                            if (pageNumber > 1) {
                            //    allTopics.current = removeDuplicatesFromCollection([...data, ...allTopics.current])
                                data?.forEach((topicValue) =>
                                    allTopics.current.push(topicValue)
                                )
                            }

                            if (pageNumber === 1)
                                allTopics.current = data;

                        } else if (key === 'unread_data') {

                            if (pageNumber === 1)
                                unReadList.current = data;

                            if (pageNumber > 1)
                                data?.forEach((topicValue) =>
                                    unReadList.current.push(topicValue)
                                )

                        } else if (key === 'pagination') {

                            totalPage = data.no_of_pages;

                        } else if (key === 'message' && data === 'no tickets found') {

                            allTopics.current = [];

                        } else if (key === 'user_data') {

                            if (pageNumber === 1)
                                allUser.current = data;

                            if (pageNumber > 1)
                                data?.forEach((topicValue) =>
                                    allUser.current.push(topicValue)
                                )
                        } else if (key === 'account_data') {

                            if (pageNumber === 1)
                                allAccount.current = data;

                            if (pageNumber > 1)
                                data?.forEach((topicValue) =>
                                    allAccount.current.push(topicValue)
                                )

                        } else if (key === 'activity') {

                            if (pageNumber === 1)
                                activity.current = data;

                            if (pageNumber > 1)
                                data?.forEach((topicValue) =>
                                    activity.current.push(topicValue)
                                )
                        }
                    }
                    setDisableButton(false);
                    setShowLoader(false);
                    setUpdateValue((value) => !value);

                }

            })
            .catch(err => {
                setDisableButton(false)

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

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
            // span.style.top = '6px';
            span.style.marginTop = '-16px';

            if (btn) btn.append(span);

        }
    }

    webSocket.onmessage = function (evt) {


        const received_msg = JSON.parse(evt.data);
        refreshUserListInsideChat = false;

        if (received_msg.type === 'refresh' && chatId === received_msg.topic_id) {

            refreshUserListInsideChat = true;
            dispatch({ type: actionType.refresh_state })
            return;

        }
        else if (received_msg.type === 'count') {

            let isUnread = received_msg.unread_tickets_count > 0 ? true : false;
            sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(received_msg.unread_tickets))
            changeValue(isUnread);

        }
        else if (received_msg.type === 'chat' && !received_msg.is_feedback && !received_msg.is_reopen) {

            if (chatId !== received_msg.topic_id) {

                if (!document.getElementById('iassist-unread')) {
                    changeValue(true);
                }

                const findUnread = unReadList.current.find(topic => +topic.topic_id === +received_msg.topic_id)

                if (!findUnread) unReadList.current = [...unReadList.current, { topic_id: received_msg.topic_id, unread_count: 1 }]

                unReadList.current.forEach((topic) => {

                    if (allTopics.current.length > 0 && topic.topic_id === received_msg.topic_id) {

                        topic.unread_count += 1;

                        dispatch({ type: actionType.count_change })


                        return;

                    }

                })

                let readList = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'unread')) || [];
                readList.push(received_msg.topic_id);
                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(readList))
            }

        }

    };

    webSocket.onopen = function () {

        console.log("websocket listen connected")

    };

    webSocket.onclose = function () {

        console.log("connection listen Closed");

    };

    const fetchTicketTypeList = async () => {

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'ticket_type/', null, false, 'GET', controller, token)
            .then(response => {

                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'tickettype', JSON.stringify(response));

                if (response) {

                    const result = response;

                    ticketTypeList.current = result

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    };

    const getUsers = async () => {

        const user = getUser();

        const id = user.organization_id;

        const jwt_token = getTokenClient();

        const appConfigId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config_app_id');

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `account_id/?account_id=${id}&app_id=${appConfigId}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    const result = response;
                    reportersList.current = result;

                }

            })
            .catch(err => {

                alertService.showToast('error', err.msg);

            });
    }

    const clearData = (resetUnread = true) => {

        allTopics.current = [];

        activity.current = [];

        unReadList.current = [];

        pageNumber = 1;

        if (resetUnread) {
            unRead.current = false;
            dispatch({ type: actionType.read_unread_status, payload: { ...state.readUnreadStatus, unRead: false } })
        }

    }

    const openChat = (topic) => {

        const activityStatus = checkLastActivity(topic.id);

        dispatch({ type: actionType.last_activity, payload: activityStatus })

        const checkIndex = unReadList.current.find((list) => {
            return list.topic_id === topic.id;
        });

        if (checkIndex) dispatch({ type: actionType.unread_count, payload: checkIndex.unread_count })

        dispatch({ type: actionType.show_chat, payload: true })
        chatId = topic.id;
        dispatch({ type: actionType.individual_topic, payload: topic })

        // clearData();

    }
    const closePanes = () => {

        closePane();

        dispatch({ type: actionType.show_chat, payload: false })
        dispatch({ type: actionType.topic_click, payload: false })

        clearData();
        clearFilter(false);

    }

    const closeFeedbackandReopenPane = () => {

        dispatch({ type: actionType.show_feedback, payload: false })
        dispatch({ type: actionType.show_reopen_panel, payload: false })
        dispatch({ type: actionType.feedBack_id, payload: '' })
        dispatch({ type: actionType.get_topic_id, payload: '' })

    }

    const showUnreadNotification = (id) => {

        const unreadFlag = unReadList.current.filter(read => {
            return read.topic_id === id

        })

        return unreadFlag && unreadFlag.length > 0 && unreadFlag[0].unread_count > 0 ? true : false;

    }

    //For filter drop down changes
    const ondropDownChange = (value, type) => {

        if (type === 'reporter' && reporter_detail.id !== value.id) {

            dispatch({ type: actionType.reporters_label, payload: value })

            if (value.id === 'All') {

                reporter_detail.id = 0;

            } else {

                reporter_detail = value;

            }

            getTopicsBasedOnFilter();

        } else if (type === 'ticketType' && ((type_detail?.id !== value.id && value.name !== 'All') || (value.name === 'All' && type_detail?.id !== 0))) {

            dispatch({ type: actionType.ticket_type_label, payload: value })

            if (value.name === 'All') {

                type_detail.id = 0;

            } else {

                type_detail = value;

            }

            getTopicsBasedOnFilter();

        }

    }

    const openFilterList = (e) => {


        e.stopPropagation()

        dispatch({ type: actionType.show_multiple_filters, payload: !state.showMultipleFilters })

    }

    const clearFilter = (isClose = true) => {

        retainedStatus = { ...retainedStatus, read: true, unread: true };

        if (reporter_detail.id !== 0 || type_detail?.id !== 0 || dateRange[0] !== 'Date' || !unRead.current || !readCheckBoxStatus.current) {
            unRead.current = true;
            readCheckBoxStatus.current = true;
            reporter_detail.id = 0;
            type_detail.id = 0;
            dateRange = ['Date'];
            dispatch({ type: actionType.read_unread_status, payload: { read: true, unRead: true } })
            dispatch({ type: actionType.ticket_type_label, payload: 'All' });
            dispatch({ type: actionType.reporters_label, payload: 'Select' });

            if (isClose) getTopicsBasedOnFilter();
        }

    }

    const deleteTopic = async (e, data) => {

        isDeleteClick = false;

        setShowLoader(true);

        e.stopPropagation();

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform')

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/topic/?topic_id=${data}`, null, false, 'DELETE', controller, token)
            .then(response => {

                if (response) {

                    const result = response;

                    allTopics.current = allTopics.current.filter(topic => topic.id !== data);
                    unReadList.current = unReadList.current.filter(topic => topic.topic_id !== data)
                    activity.current = activity.current.filter(topic => topic.id !== data)
                    // sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'tickets', JSON.stringify(allTopics.current));
                    setStoredData({Active: allTopics.current, Resolved: storedData?.Resolved});

                    alertService.showToast('success', result.message);

                    isDeleteClick = false;
                    setConfirmDelete(false);
                    setShowLoader(false);

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    }

    const checkLastActivity = (id) => {

        const data = activity.current.filter((val) => val.id === id);

        return data.length > 0 && data[0].activity_status === 0 ? true : false;

    }

    const handleKeyDown = (e) => {

        if ((e.keyCode === 13 || e === 'click') && (searchString.current !== '' || prevSearchValue.current)) {
            prevSearchValue.current = searchString.current;
            getTopicsBasedOnFilter(searchString.current);
        }
    }

    const onScroll = async () => {


        if (bodyRef.current.scrollTop + bodyRef.current.clientHeight + 2 >= bodyRef.current.scrollHeight && !isDeleteClick) {


            if (totalPage > pageNumber) {
                pageNumber += 1;
                await getTopicsBasedOnFilter();

            }

        }

    }

    //get formated period
    const getFormatedPeriod = (period) => {
        let newdate = period ? new Date(period) : new Date();
        let month = newdate.getMonth() + 1;
        let date = newdate.getDate();
        let year = newdate.getFullYear();
        return year + "-" + month + "-" + date;
    }

    const handleCalendar = (range) => {
        let updatedValue = null;

        if (range.largestRangeIndex !== null) {
            let firstValue = getFormatedPeriod(range.ranges[0][0]);
            updatedValue = getFormatedPeriod(range.ranges[0][1]);
            dateRange = [firstValue, updatedValue];
            dispatch({ type: actionType.selected_date, payload: range.ranges[0][1] })
            getTopicsBasedOnFilter();

        }
    }

    const onCheckboxClick = (e, type) => {


        if (type === 'read') {
            readCheckBoxStatus.current = e.target.checked;
            dispatch({ type: actionType.read_unread_status, payload: { ...state.readUnreadStatus, read: e.target.checked } })

            retainedStatus = { ...retainedStatus, read: e.target.checked }

        }

        if (type === 'unread') {
            unRead.current = e.target.checked;
            dispatch({ type: actionType.read_unread_status, payload: { ...state.readUnreadStatus, unRead: e.target.checked } })

            retainedStatus = { ...retainedStatus, unread: e.target.checked }

        }

        pageNumber = 1;
        getTopicsBasedOnFilter();
    }

    const closeChatRoom = () => {
        dispatch({ type: actionType.show_chat, payload: false });
        dispatch({ type: actionType.topic_click, payload: false })
    }

    const disableScrollWhenDelete = () => {
        isDeleteClick = false;
    }

    function setValueFromMemory(topicData) {
        const result = topicData;
        for (let key in result) {

            let data = result[key];

            if (key === 'topic_data') {

                if (pageNumber > 1)
                    data?.forEach((topicValue) =>
                        allTopics.current.push(topicValue)
                    )

                if (pageNumber === 1)
                    allTopics.current = data;

            } else if (key === 'unread_data') {

                if (pageNumber === 1)
                    unReadList.current = data;

                if (pageNumber > 1)
                    data?.forEach((topicValue) =>
                        unReadList.current.push(topicValue)
                    )

            } else if (key === 'pagination') {

                totalPage = data.no_of_pages;

            } else if (key === 'message' && data === 'no tickets found') {

                allTopics.current = [];

            } else if (key === 'user_data') {

                if (pageNumber === 1)
                    allUser.current = data;

                if (pageNumber > 1)
                    data?.forEach((topicValue) =>
                        allUser.current.push(topicValue)
                    )
            } else if (key === 'account_data') {

                if (pageNumber === 1)
                    allAccount.current = data;

                if (pageNumber > 1)
                    data?.forEach((topicValue) =>
                        allAccount.current.push(topicValue)
                    )

            } else if (key === 'activity') {

                if (pageNumber === 1)
                    activity.current = data;

                if (pageNumber > 1)
                    data?.forEach((topicValue) =>
                        activity.current.push(topicValue)
                    )
            }
        }
        setUpdateValue(val => !val);
    }

    const removeDuplicatesFromCollection = (collectionData) => {
        const jsonObject = collectionData.map(JSON.stringify);
        const uniqueDataSet = new Set(jsonObject);
        const uniqueData = Array.from(uniqueDataSet).map(JSON.parse);
        return uniqueData
    }

    useEffect(() => {

        const TicketsInMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'tickettype'))

         ticketTypeList.current = TicketsInMemory === null || undefined ? [] : TicketsInMemory; 

        // const getTicket = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'tickets'));

        // setValueFromMemory(storedData);

        unRead.current = retainedStatus.unread;
        readCheckBoxStatus.current = retainedStatus.read;

        dispatch({ type: actionType.read_unread_status, payload: { read: retainedStatus.read, unRead: retainedStatus.unread } })

        if (reporter_detail.id !== 0 || type_detail?.id !== 0 || dateRange[0] !== 'Date' || retainedStatus.read || retainedStatus.unread) {

            if (type_detail.id !== 0) dispatch({ type: actionType.ticket_type_label, payload: type_detail })
            if (reporter_detail.id !== 0) dispatch({ type: actionType.reporters_label, payload: reporter_detail })

        }

        if (panelPosition && panelPosition !== 'Right') {

            let containerWrapper = document.getElementById('iassist-panel');
            if (panelPosition.toLowerCase() === 'left') {
                containerWrapper.style.left = 0;
            } else if (panelPosition.toLowerCase() === 'center') {
                let screenWidth = window.innerWidth;
                containerWrapper.style.left = (screenWidth / 2) - (containerWrapper.offsetWidth / 2) + "px";
            }

        }

        if (ticketTypeList.current.length === 0) {

            fetchTicketTypeList();

        }

        if (reportersList.current.length === 0) {

            getUsers();

        }

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('iassist-panel');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';
        }

        let checkStoreData = tabData === 'open'? storedData.Active.length !== 0 : storedData.Resolved.length !== 0;

        getTopicsBasedOnFilter(undefined, undefined, checkStoreData? storedData : undefined);


        document.addEventListener("mouseup", (event) => {

            const calendar = document.getElementById('calendar-wrapper');

            if (calendar && !(calendar.contains(event.target))) {

                dispatch({ type: actionType.is_open_calendar })

            }

            const home = document.getElementById('iassist-panel');

            if (home && !(home.contains(event.target)) && !checkApptype.current) {

                closePanes();
                clearData();

            }

        })


        return () => {
            // clearData();
            dispatch({ type: actionType.initial_load_status, payload: true })
            dispatch({ type: actionType.read_unread_status, payload: { read: true, unRead: true } })

        }

    }, []) // eslint-disable-line

    useEffect(() => {

        const subheaderAvailable = document.getElementById('app-sub-header');
        if (subheaderAvailable) {
            let conatinerWrapper = document.getElementsByClassName('iassist-panel');
            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';
        }

        if (bodyRef.current) { bodyRef.current.addEventListener('scroll', onScroll) };

        return () => {
            if (bodyRef.current) bodyRef.current.addEventListener('scroll', onScroll);
        }
    }, [state.showChat, state.topicClick]) // eslint-disable-line

    return (

        <>
            {!state.topicClick && !state.showChat &&
                <div id='iassist-panel' className='iassist-panel'>
                    <div className='iassist-panel-inner'>
                        <div className='iassist-panel-header'>
                            {showLoader && <LoadingScreen />}
                            <h4 className='iassist-header-title'>iAssist</h4>

                            <div className='iassist-header-right'>

                                <div className='iassist-search'>

                                    <button className='iassist-search-btn' onClick={() => handleKeyDown('click')} title='search'></button>

                                    <input type={'text'}
                                        title='Search'
                                        onChange={(e) => { searchString.current = e.target.value.trim() }}
                                        placeholder='Search'
                                        onKeyDown={handleKeyDown}
                                    />

                                </div>

                                <div className={'iassist-filter-btn' + (state.showMultipleFilters ? ' filter-bg' : '')}>
                                    <button className={'button' + (state.showMultipleFilters ? ' button-select' : '')}
                                        disabled={disableButton}
                                        title='filter-button' onClick={(e) => openFilterList(e)}></button>
                                </div>

                                <div className='iassist-btn-new-topic-wrapper'>

                                    <button onClick={() => {
                                        // clearData();
                                        dispatch({ type: actionType.topic_click, payload: true })
                                    }}>
                                        <span className='add-new-ticket'></span>
                                        Ticket
                                    </button>

                                </div>
                               {!checkApptype.current && <button className='iassist-header-close' onClick={() => closePanes()}></button>}
                            </div>
                        </div>

                        <ClickOutsideListner onOutsideClick={() => dispatch({ type: actionType.show_multiple_filters, payload: false })}>
                            {state.showMultipleFilters &&
                                <div className='iassist-sub-header-wrapper'>

                                    <div className='iassist-sub-header-upper-section'> 
                                        <span className="iassist-sub-header-text">Filter</span>

                                        <button className='clear' disabled={disableButton} onClick={() => clearFilter()}>Clear</button>
                                    </div>

                                    <div className='divider'></div>

                                    <div className='iassist-sub-header-row' id="date-row">
                                        <span className="iassist-sub-header-text">Date</span>
                                        <div id='calendar' className={'iassist-calendar-wrapper'}>
                                            <div className={'iassist-calendar-date'}>
                                                <label className={'label'} onClick={() =>
                                                    dispatch({ type: actionType.is_open_calendar })

                                                }>
                                                    {dateRange[0] !== 'Date' && formatDates(new Date(dateRange[0]), 'mmm-dd-yyyy')}{dateRange.length > 1 && '  -  ' + formatDates(new Date(dateRange[1]), 'mmm-dd-yyyy')}
                                                </label>

                                                <button title='Calendar' className={'iassist-button-calendar'} onClick={() =>
                                                    dispatch({ type: actionType.is_open_calendar })
                                                }></button>
                                            </div>

                                            {state.isOpenCalendar && <div id='calendar-wrapper' className='period-picker'>

                                                <MultiPeriodPickerPanel
                                                    onChange={handleCalendar}
                                                    singleRangeonly={true}
                                                    periodColors={'#fff'} />

                                            </div>}

                                        </div>

                                    </div>


                                    <div className='iassist-sub-header-row' id="type-row">
                                        <span className="iassist-sub-header-text">Type</span>
                                        <div className='type no-bg'>

                                            <SpeedSelect
                                                options={ticketTypeList.current}
                                                selectLabel={state.ticketTypeLabel?.name}
                                                // prominentLabel='Type'
                                                maxHeight={100}
                                                maxWidth={80}
                                                uniqueKey='id'
                                                displayKey='name'
                                                onSelect={(value) => ondropDownChange(value, 'ticketType')}
                                            />

                                        </div>
                                    </div>

                                    <div className='iassist-sub-header-row' id="reporter-row">
                                        <span className="iassist-sub-header-text">Reporter</span>
                                        <div className='reporter no-bg'>

                                            <SpeedSelect
                                                options={reportersList.current}
                                                selectLabel={state.reporterLabel?.first_name}
                                                // prominentLabel='Reporter'
                                                maxHeight={100}
                                                maxWidth={80}
                                                uniqueKey='id'
                                                displayKey='first_name'
                                                onSelect={(value) => ondropDownChange(value, 'reporter')}
                                            />

                                        </div>
                                    </div>

                                    <div className='iassist-sub-header-row' id="status-row">
                                        <span className="iassist-sub-header-text">Status</span>

                                        <div className='checkbox-wrapper'>

                                            <input checked={state.readUnreadStatus.read} id="select-read" type="checkbox" onChange={(e) => onCheckboxClick(e, 'read')}></input>
                                            <label htmlFor='select-read' className='read-label'>Read</label>
                                        </div>

                                        <div className='checkbox-wrapper'>
                                            <input checked={state.readUnreadStatus.unRead} id="select-unread" type="checkbox" onChange={(e) => onCheckboxClick(e, 'unread')}></input>
                                            <label htmlFor='select-unread' className='unread-label'>Unread</label>
                                        </div>

                                    </div>

                                </div>}
                        </ClickOutsideListner>

                        <div className='iassist-panel-body'>
                            <div className='iassist-filter-wrapper'>

                                <div className={'tab-wrapper'}>

                                    <button style={{ backgroundColor: state.statusTab === 'open' ? '#6C757D' : '' }}
                                        disabled={disableButton}
                                        onClick={() => {
                                            if (tabData !== 'open') {
                                                tabData = 'open';
                                                dispatch({ type: actionType.status_tab, payload: 'open' })
                                                clearData(false);
                                                getTopicsBasedOnFilter();

                                            }
                                        }}>

                                        Active

                                    </button>

                                    <button style={{ backgroundColor: state.statusTab === 'resolved' ? '#6C757D' : '' }}
                                        disabled={disableButton}
                                        onClick={() => {
                                            if (tabData !== 'resolved') {
                                                tabData = 'resolved';
                                                pageNumber = 1;
                                                dispatch({ type: actionType.status_tab, payload: 'resolved' })
                                                clearData(false);
                                                getTopicsBasedOnFilter(undefined, undefined, undefined);
                                            }
                                        }}>

                                        Resolved

                                    </button>

                                </div>

                            </div>

                            <div className={'iassist-topic-list' + (state.showMultipleFilters ? ' topic-list-test' : '')} id='topic-list' ref={bodyRef}>

                                {!confirmDelete && allTopics.current.length > 0 && allTopics.current.map((topic, index) => {

                                    return (
                                        <div className='iassist-topic' key={topic.id}>

                                            {<div className='iassist-topic-header' onClick={() => openChat(topic)}>

                                                <div className='topic-header-inner'>
                                                    <h4 className='topic-name'>{topic.name}</h4>
                                                    <div className='topic-chat-notify'></div>
                                                    {showUnreadNotification(topic.id) && <span className='topic-chat-notify-layer'></span>}
                                                </div>

                                                <div className='iassist-topic-description'>{topic?.description.substr(0, 100)}{topic?.description?.length > 102 && '...'}</div>

                                                <Detail topic={topic} type={ticketTypeList.current} allUser={allUser.current.length ? allUser.current : reportersList.current} allAccount={allAccount.current} />

                                            </div>}


                                            {<div className='iassist-topic-meta'>

                                                {(state.statusTab !== 'resolved') && state.showFeedback && state.feedbackId === topic.id &&
                                                    <FeedBack
                                                        closePane={closeFeedbackandReopenPane}
                                                        id={state.feedbackId}
                                                        ticket={getTopicsBasedOnFilter}
                                                        disabledButton={setDisableButton}
                                                        allTopic={allTopics.current}
                                                        setLoader={setShowLoader}
                                                        placeHolders='Type here' />}


                                                {state.feedbackId !== topic.id && (state.statusTab === 'open') ?
                                                    <div className='topic-buttons'>

                                                        <button className='btn-resolve icon-btn' disabled={disableButton} onClick={() => {
                                                            setDisableButton(true);
                                                            dispatch({ type: actionType.show_feedback, payload: true })
                                                            dispatch({ type: actionType.feedBack_id, payload: topic.id })
                                                        }}>
                                                            <i></i>
                                                            <span>Resolve</span>
                                                        </button>

                                                        {checkLastActivity(topic.id) && <button className='btn-delete icon-btn' disabled={disableButton} onClick={(e) => {
                                                            isDeleteClick = true;
                                                            setConfirmDelete(true)
                                                            setDisableButton(true);
                                                            dispatch({ type: actionType.delete_id, payload: topic.id })
                                                        }
                                                        }>
                                                            <i></i>
                                                            <span>Delete</span>
                                                        </button>}

                                                    </div> : ''}

                                                {(state.statusTab === 'resolved') && state.showReopenPanel && state.getTopicId.id === topic.id &&
                                                    <TicketReopen
                                                        closePane={closeFeedbackandReopenPane}
                                                        id={state.getTopicId.id}
                                                        ticket={getTopicsBasedOnFilter}
                                                        disableButton={setDisableButton}
                                                        allTopic={allTopics.current}
                                                        setLoader={setShowLoader}
                                                        placeHolders='Type here'

                                                    />}
                                                {(state.statusTab === 'resolved') && (!state.showReopenPanel) && <div className='topic-buttons'>

                                                    {state.getTopicId.id !== topic.id && <button className='btn-reopen icon-btn' disabled={disableButton} onClick={() => {
                                                        setDisableButton(true);
                                                        dispatch({ type: actionType.get_topic_id, payload: topic })
                                                        dispatch({ type: actionType.show_reopen_panel, payload: true })
                                                    }}>
                                                        <i></i>
                                                        <span>Re-Open</span>
                                                    </button>}

                                                </div>}

                                            </div>}

                                        </div>

                                    )
                                })}

                                {confirmDelete && <Delete deleteTopic={deleteTopic}
                                    topic={state.deleteId}
                                    setConfirmDelete={setConfirmDelete}
                                    disable={setDisableButton}
                                    isScrollWhenDelete={disableScrollWhenDelete}
                                />
                                }


                                {allTopics.current.length === 0 && !state.initialLoadStatus && !showLoader && <div className='no-record'>No Tickets Found </div>}

                            </div>
                        </div>

                    </div>

                </div>}



            {state.topicClick && !state.showChat && 
            <CreateChatRoom 
                closePane={closePanes} 
                socketDetail={webSocket} 
                panelPosition={panelPosition} 
                platformId={platformId} 
                closeCreateTicket={closeChatRoom} 
                getTopicsBasedOnFilter={getTopicsBasedOnFilter}     
                ticketTypeList={ticketTypeList.current}
            />}

            {state.showChat && <ChatRoom closePane={closePanes}
                chatIds={chatId}
                unRead={state.unreadCount}
                topicDetail={state.individualTopic}
                allAccount={allAccount.current.length > 0 ? allAccount.current : reportersList.current}
                allUser={allUser.current}
                type={ticketTypeList.current}
                activity={state.lastActivity}
                refresh={refreshUserListInsideChat}
                refreshState={state.refreshState}
                socketDetail={webSocket}
                panelPosition={panelPosition}
                platformId={platformId}
                closeChatScreen={closeChatRoom}
                getTopicsBasedOnFilter={getTopicsBasedOnFilter}
            />
            }

        </>
    )
}

export default memo(Support);
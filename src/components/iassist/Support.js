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
import parse from 'html-react-parser';



let pageNumber = 1;
let pageNumber_resolved = 1;
const pageSize = 10;
let totalPage = 0;
let totalPage_resolved = 0;
let tabData = 'open';
let dateRange = ['Date'];
const defType = { 'name': 'All', 'id': 'All' };
const defReporter = { 'first_name': 'All', 'id': 'All' };
let isDeleteClick = false;

export let iAssistOutsideClick = false;;

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

const options = {

    replace: (domNode) => {
        if (domNode.attribs && domNode.attribs.class === 'remove') {
            return <></>;
        }
    },
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


const Support = ({ closePane, topicClick, webSocket, panelPosition, platformId, logOut, newVersionAvailable }) => {


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
    const fetchTicketsController = new AbortController()

    const prevSearchValue = useRef();

    const allTopics = useRef([]);
    const unReadList = useRef([]);
    const allUser = useRef([]);
    const allAccount = useRef([]);
    const activity = useRef([]);

    const allTopics_resolved = useRef([]);
    const unReadList_resolved = useRef([]);
    const allUser_resolved = useRef([]);
    const allAccount_resolved = useRef([]);
    const activity_resolved = useRef([]);

    const btnId = useRef(sessionStorage?.getItem(Constants.SITE_PREFIX_CLIENT + 'buttonId'));

    const bodyRef = useRef();
    const bodyRef_resolved = useRef();

    const searchString = useRef('');
    const ticketTypeList = useRef([]);
    const reportersList = useRef([]);

    const unRead = useRef(true); // for URL 
    const readCheckBoxStatus = useRef(true);
    const checkApptype = useRef(isElectron());


    const [showLoader, setShowLoader] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [disableButton, setDisableButton] = useState(false);
    const [openDesktopMenu, setOpenDesktopMenu] = useState(false);
    const [isApiCallActive, setIsApiCallActive] = useState(false);
    const [searchStringState, setSearchStringState] = useState('');
    const [disableStatusButton, setDisableStatusButton] = useState(false);

    // const [updateApi, setUpdateApi] = useState(false); 



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

            url = Constants.API_IASSIST_BASE_URL + `${platform}/topic/?page_size=${pageSize}&page_number=${tabData === 'open' ? pageNumber : pageNumber_resolved}&status_flag=${tab}&sort_order=descending&type_id=${type_detail?.id}&reporter=${reporter_detail?.id}${searchStringFlag}${unReadFlag}${readFlag}&app_id=${platformId}`;

        } else {

            url = Constants.API_IASSIST_BASE_URL + `${platform}/topic/?page_size=${pageSize}&page_number=${tabData === 'open' ? pageNumber : pageNumber_resolved}&status_flag=${tab}&sort_order=descending&type_id=${type_detail?.id}&date_from=${dateRange[0]}&date_to=${dateRange[1]}&reporter=${reporter_detail?.id}${searchStringFlag}${unReadFlag}${readFlag}&app_id=${platformId}`;

        }

        return url;

    }

    const setFilterValueInSession = (value, type) => {

        const data = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'filterValue'))

        switch (type) {
            case 'search':
                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'filterValue', JSON.stringify({ ...data, search: value }));

                break;

            case 'reporter':
                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'filterValue', JSON.stringify({ ...data, reporter: value }));

                break;

            case 'ticketType':
                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'filterValue', JSON.stringify({ ...data, ticketType: value }));

                break;

            case 'dateType':
                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'filterValue', JSON.stringify({ ...data, dateRange: value }));

                break;

            case 'readUnreadStatus':
                sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'filterValue', JSON.stringify({ ...data, readUnreadStatus: value }));

                break;

            default:
                break;
        }

    }

    const clearFilterValueInSession = () => {

        sessionStorage.removeItem(Constants.SITE_PREFIX_CLIENT + 'filterValue');
    }

    const  getFilterValueFromSession = async () => {

        const getFilterValue = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'filterValue');

        if (getFilterValue) {

            const filterValue = JSON.parse(getFilterValue);

            if (filterValue?.ticketType) {
                dispatch({ type: actionType.ticket_type_label, payload: filterValue.ticketType })

                type_detail = filterValue.ticketType;
                type_detail['id'] = filterValue.ticketType.id === 'All' ? 0 : filterValue.ticketType.id;
            }

            if (filterValue?.reporter) {
                dispatch({ type: actionType.reporters_label, payload: filterValue.reporter })

                reporter_detail = filterValue.reporter;

                reporter_detail['id'] = filterValue.reporter.id === 'All' ? 0 : filterValue.reporter.id;

            }

            if (filterValue?.dateRange) {
                dispatch({ type: actionType.selected_date, payload: filterValue.dateRange })
                dateRange = filterValue.dateRange;

            }

            if (filterValue?.readUnreadStatus) {

                dispatch({ type: actionType.read_unread_status, payload: { ...state.readUnreadStatus, ...filterValue?.readUnreadStatus } })
                retainedStatus = { ...filterValue.readUnreadStatus };


            }

            if (filterValue?.search) {
                setSearchStringState(filterValue.search);
                searchString.current = filterValue.search;
                prevSearchValue.current = filterValue.search;
            }

        }
    }
    const checkDataInSessionStorageOnTabSwitch = (currentStatus) => {

        let isDataExists = false;
        const existingDataInSession = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'ticketData');
        if (existingDataInSession && JSON.parse(existingDataInSession).hasOwnProperty(currentStatus)) {
            const existingData = JSON.parse(existingDataInSession);
            if (existingData[currentStatus].result) {
                isDataExists = true;
                setDataFetchedForRendering(existingData[currentStatus].result, existingData[currentStatus].current_page_number)
            }
        }

        getTopicsBasedOnFilter('', '', '', isDataExists);
    }

    const setDataFetchedForRendering = (result, currentPageNumber) => {


        currentPageNumber = +currentPageNumber
        for (let key in result) {

            let data = result[key];

            if (key === 'topic_data') {

                if (currentPageNumber > 1)

                    tabData === 'open' ? data?.forEach((topicValue) =>
                        allTopics.current.push(topicValue)
                    ) : data?.forEach((topicValue) =>
                        allTopics_resolved.current.push(topicValue)
                    )

                if (currentPageNumber === 1) {

                    tabData === 'open' ? allTopics.current = data : allTopics_resolved.current = data;
                }

            } else if (key === 'unread_data') {

                if (currentPageNumber === 1)
                    tabData === 'open' ? unReadList.current = data : unReadList_resolved.current = data;

                if (currentPageNumber > 1)
                    tabData === 'open' ? data?.forEach((topicValue) =>
                        unReadList.current.push(topicValue)
                    ) : data?.forEach((topicValue) =>
                        unReadList_resolved.current.push(topicValue)
                    )

            } else if (key === 'pagination') {

                tabData === 'open' ? totalPage = data.no_of_pages : totalPage_resolved = data.no_of_pages;

            } else if (key === 'message' && data === 'no tickets found') {

                tabData === 'open' ? allTopics.current = [] : allTopics_resolved.current = [];

            } else if (key === 'user_data') {

                if (currentPageNumber === 1)
                    tabData === 'open' ? allUser.current = data : allUser_resolved.current = data;

                if (currentPageNumber > 1)
                    tabData === 'open' ? data?.forEach((topicValue) =>
                        allUser.current.push(topicValue)
                    ) : data?.forEach((topicValue) =>
                        allUser_resolved.current.push(topicValue)
                    )
            } else if (key === 'account_data') {

                if (currentPageNumber === 1)
                    tabData === 'open' ? allAccount.current = data : allAccount_resolved.current = data;

                if (currentPageNumber > 1)
                    tabData === 'open' ? data?.forEach((topicValue) =>
                        allAccount.current.push(topicValue)
                    ) : data?.forEach((topicValue) =>
                        allAccount_resolved.current.push(topicValue)
                    )

            } else if (key === 'activity') {

                if (currentPageNumber === 1)
                    tabData === 'open' ? activity.current = data : activity_resolved.current = data;

                if (currentPageNumber > 1)
                    tabData === 'open' ? data?.forEach((topicValue) =>
                        activity.current.push(topicValue)
                    ) : data?.forEach((topicValue) =>
                        activity_resolved.current.push(topicValue)
                    )
            }
        }


    }
    const getTopicsBasedOnFilter = async (searchQuery, updatedPageNumber, filter, isDataExistsFlag) => {

        // setUpdateApi(prev => !prev);
        updatedPageNumber = updatedPageNumber || 1;

        if (updatedPageNumber) { tabData === 'open' ? pageNumber = updatedPageNumber : pageNumber_resolved = updatedPageNumber; }

        !isDataExistsFlag && setDisableButton(true);
        setDisableStatusButton(true);

        if ((tabData === 'open' && (filter || searchQuery || allTopics.current.length === 0 || pageNumber > 1)) || (tabData === 'resolved' && (filter || searchQuery || allTopics_resolved.current.length === 0 || pageNumber_resolved > 1))) {

            setShowLoader(true);
        }

        // if (filter || searchQuery) {
        //     setShowLoader(true);
        //     // setDisableButton(true);
        // }

        dispatch({ type: actionType.initial_load_status, payload: false })

        if (tabData) {
            dispatch({ type: actionType.status_tab, payload: tabData })
        }

        let url = getUrl(searchQuery);

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        const currentPageNumber = tabData === 'open' ? pageNumber : pageNumber_resolved;
        APIService.apiRequest(url, null, false, 'GET', fetchTicketsController, token)
            .then(response => {

                
                if (response) {

                    const result = response;
                    setDataFetchedForRendering(result, currentPageNumber);

                    if (updatedPageNumber === 1) {
                        const existingDataInSession = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'ticketData');

                        if (!existingDataInSession) {

                            const data = tabData === 'open' ?
                                { 'open': { result: result, current_page_number: currentPageNumber }, }
                                : { 'resolved': { result: result, current_page_number: currentPageNumber } }



                            sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'ticketData', JSON.stringify(data));

                        }

                        if (existingDataInSession) {

                            let data = JSON.parse(existingDataInSession);

                            if (tabData === 'open') {

                                data['open'] = { result: result?.message ? [] : result, current_page_number: currentPageNumber };
                                // data= {...data, 'open': { result: result, current_page_number: currentPageNumber } }


                            } else {

                                // data= {...data, 'resolved': { result: result, current_page_number: currentPageNumber } }
                                data['resolved'] = { result: result?.message ? [] : result, current_page_number: currentPageNumber };

                            }


                            sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'ticketData', JSON.stringify(data));
                        }
                    }


                    setDisableButton(false);
                    setShowLoader(false);
                    setIsApiCallActive(false);
                    setDisableStatusButton(false);

                    // setUpdateApi(prev => !prev);

                }
                else {
                    setIsApiCallActive(false);
                    setDisableStatusButton(false);
                    setDisableButton(false);

                }

            })
            .catch(err => {
                setDisableButton(false)
                setIsApiCallActive(false);
                setShowLoader(false);
                setDisableStatusButton(false);

                // setUpdateApi(prev => !prev);


                // alertService.showToast('error', err.msg);

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

        if (received_msg.type === 'refresh') {

            refreshUserListInsideChat = true;
            dispatch({ type: actionType.refresh_state })
            return;

        } if (received_msg.type === 'edit_ticket') {
            getTopicsBasedOnFilter(undefined, 1, false);
        } else if (received_msg.type === 'count') {

            let isUnread = received_msg.unread_tickets_count > 0 ? true : false;
            sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(received_msg.unread_tickets))
            changeValue(isUnread);

        } else if (received_msg.type === 'chat' && !received_msg.is_feedback && !received_msg.is_reopen) {

            activity.current.forEach((val) => {
                if (val.id === received_msg.topic_id) {
                    val.activity_status = 1
                }
            });

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
        else if (received_msg.type === 'version') {
            const { version } = received_msg.data;
            if(version !== Constants.IASSIST_SITE_VERSION) {
                alertService.showToast('info','iAssist New update is available, Please Refresh')
            }
            // console.log(version, Constants.IASSIST_SITE_VERSION)
            // alertService.showToast('info','New update available')
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

                // alertService.showToast('error', err.msg);

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
                    sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'reporters', JSON.stringify(result));


                }

            })
            .catch(err => {

                // alertService.showToast('error', err.msg);

            });
    }

    const clearData = (resetUnread = true) => {

        allTopics.current = [];

        activity.current = [];

        unReadList.current = [];

        allTopics_resolved.current = [];
        activity_resolved.current = [];
        allAccount_resolved.current = [];

        tabData === 'open' ? pageNumber = 1 : pageNumber_resolved = 1;

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

        let unReadListTemp= state.statusTab === 'open'?unReadList.current:unReadList_resolved.current

        const unreadFlag = unReadListTemp.filter(read => {
            return read.topic_id === id

        })

        return unreadFlag && unreadFlag.length > 0 && unreadFlag[0].unread_count > 0 ? true : false;
    }

    //For filter drop down changes
    const ondropDownChange = (value, type) => {




        if (type === 'reporter' && ((reporter_detail.id !== value.id && value.first_name !== 'All') || (value.first_name === 'All' && reporter_detail.id !== 0))) {

            dispatch({ type: actionType.reporters_label, payload: value })
            setFilterValueInSession(value, 'reporter')
            if (value.id === 'All') {

                reporter_detail = { id: 0, name: 'All' };

            } else {

                reporter_detail = value;

            }

            getTopicsBasedOnFilter(undefined, undefined, true);

        } else if (type === 'ticketType' && ((type_detail?.id !== value.id && value.name !== 'All') || (value.name === 'All' && type_detail?.id !== 0))) {


            dispatch({ type: actionType.ticket_type_label, payload: value })
            setFilterValueInSession(value, 'ticketType')

            if (value.name === 'All') {

                type_detail = { id: 0, name: 'All' };

            } else {


                type_detail = value;

            }

            getTopicsBasedOnFilter(undefined, undefined, true);

        }

    }

    const openFilterList = (e) => {


        e.stopPropagation()

        dispatch({ type: actionType.show_multiple_filters, payload: !state.showMultipleFilters })

    }

    const clearFilter = (isClose = true) => {

        retainedStatus = { ...retainedStatus, read: true, unread: true };

        if (reporter_detail.id !== 0 || type_detail?.id !== 0 || dateRange[0] !== 'Date' || !unRead.current || !readCheckBoxStatus.current) {

            tabData === 'open' ? pageNumber = 1 : pageNumber_resolved = 1;
            unRead.current = true;
            readCheckBoxStatus.current = true;
            reporter_detail = { id: 0, name: 'All' };
            type_detail = { id: 0, name: 'All' };

            dateRange = ['Date'];
            dispatch({ type: actionType.read_unread_status, payload: { read: true, unRead: true } })
            dispatch({ type: actionType.ticket_type_label, payload: 'All' });
            dispatch({ type: actionType.reporters_label, payload: 'Select' });


            tabData === 'open' ? allTopics_resolved.current = [] : allTopics.current = [];
            if (isClose) getTopicsBasedOnFilter(undefined, undefined, true);
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

                    alertService.showToast('success', result.message);

                    isDeleteClick = false;
                    setConfirmDelete(false);
                    setShowLoader(false);

                }

            })
            .catch(err => {

                setShowLoader(false);

                // alertService.showToast('error', err.msg);

            });

    }

    const checkLastActivity = (id) => {

        const data = activity.current.filter((val) => val.id === id);

        return data.length > 0 && data[0].activity_status === 0 ? true : false;

    }

    const handleKeyDown = (e) => {


        if ((e.keyCode === 13 || e === 'click') && (searchString.current !== '' || searchStringState !== '' || prevSearchValue.current)) {

            prevSearchValue.current = searchString.current;
            setSearchStringState(prevSearchValue.current);
            tabData === 'open' ? pageNumber = 1 : pageNumber_resolved = 1;
            tabData === 'open' ? allTopics_resolved.current = [] : allTopics.current = [];
            setFilterValueInSession(searchString.current, 'search');
            getTopicsBasedOnFilter(searchString.current);
        }
    }

    const onScroll = async () => {

        const temp = tabData === 'open' ? bodyRef : bodyRef_resolved;

        if (temp.current.scrollTop + temp.current.clientHeight + 2 >= temp.current.scrollHeight && !isDeleteClick) {



            console.log(tabData, totalPage, pageNumber, isApiCallActive)
            if (tabData === 'open' && totalPage > pageNumber && !isApiCallActive) {
                pageNumber += 1;
                setIsApiCallActive(true);
                await getTopicsBasedOnFilter('', pageNumber);

            }


            if (tabData === 'resolved' && totalPage_resolved > pageNumber_resolved && !isApiCallActive) {

                pageNumber_resolved += 1;
                setIsApiCallActive(true);
                await getTopicsBasedOnFilter('', pageNumber_resolved);
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
            // setUpdateApi(true);
            let firstValue = getFormatedPeriod(range.ranges[0][0]);
            updatedValue = getFormatedPeriod(range.ranges[0][1]);
            dateRange = [firstValue, updatedValue];
            setFilterValueInSession(dateRange, 'dateType');
            dispatch({ type: actionType.selected_date, payload: range.ranges[0][1] })
            getTopicsBasedOnFilter(undefined, undefined, true);

        }
    }

    const onCheckboxClick = (e, type) => {

        // setUpdateApi(true);
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

        setFilterValueInSession({ read: readCheckBoxStatus.current, unread: unRead.current }, 'readUnreadStatus');

        tabData === 'open' ? pageNumber = 1 : pageNumber_resolved = 1;
        // pageNumber = 1;
        getTopicsBasedOnFilter(undefined, undefined, true);
    }

    const closeChatRoom = () => {
        chatId = '';
        dispatch({ type: actionType.show_chat, payload: false });
        dispatch({ type: actionType.topic_click, payload: false })
    }

    const disableScrollWhenDelete = () => {
        isDeleteClick = false;
    }

    useEffect(() => {
        getFilterValueFromSession()

        const TicketTypeInMemory = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'tickettype'))

        ticketTypeList.current = TicketTypeInMemory === null || undefined ? [] : TicketTypeInMemory;


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
        const reporters = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'reporters'));

        if (reporters) {

            reportersList.current = reporters;


        }
        getUsers();

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('iassist-panel');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';
        }


        const data = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'ticketData'));



        if (!data)
            getTopicsBasedOnFilter();

        else if (data) {
            let ticketResult, current_page_number;
            if (tabData === 'open' && data.open) {
                ticketResult = data.open.result;
                current_page_number = data.open.current_page_number || 1;
            }
            if (tabData === 'resolved' && data.resolved) {
                ticketResult = data.resolved.result;
                current_page_number = data.resolved.current_page_number || 1;
            }


            // if (!ticketResult || ticketResult.length === 0 || ticketResult?.message || JSON.stringify(ticketResult) === '{}') getTopicsBasedOnFilter('', 1);
            // else 
            setDataFetchedForRendering(ticketResult, current_page_number);

            getTopicsBasedOnFilter()
        }



        document.addEventListener("mouseup", (event) => {

            iAssistOutsideClick = false;

            const calendar = document.getElementById('calendar-wrapper');

            if (calendar && !(calendar.contains(event.target))) {

                dispatch({ type: actionType.is_open_calendar })

            }

            const pane = document.getElementById('menu');

            if (pane && !pane.contains(event.target)) setOpenDesktopMenu(false);

            const home = document.getElementById('iassist-panel');

            // if (event.target.nodeName?.toLowerCase() === 'grammarly-popups') { // * handle grammarly plugin
            //     return;
            // }
            
            if (state.topicClick) {
                return;
            }
            if (home && !(home.contains(event.target)) && !checkApptype.current && !state.topic) { 
                iAssistOutsideClick = true;
            //     closePanes();
            //     clearData();
            }

        })
        window.addEventListener('online', onOnline)

        window.addEventListener('offline', onOffline)

        return () => {
            // clearData();
            dispatch({ type: actionType.initial_load_status, payload: true })
            dispatch({ type: actionType.read_unread_status, payload: { read: true, unRead: true } })
            // tabData = 'open';


        }

    }, []) // eslint-disable-line

    useEffect(() => {

        let containerWrapper = document.getElementById('iassist-panel');
        if (checkApptype.current) {
            containerWrapper.style.top = 0;
        }


        const subheaderAvailable = document.getElementById('app-sub-header');
        if (subheaderAvailable) {
            let conatinerWrapper = document.getElementsByClassName('iassist-panel');
            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';
        }


        if (bodyRef.current && tabData === 'open') { bodyRef.current.addEventListener('scroll', onScroll); };
        if (bodyRef_resolved.current && tabData === 'resolved') { bodyRef_resolved.current.addEventListener('scroll', onScroll); };

        return () => {
            if (bodyRef.current) bodyRef.current.removeEventListener('scroll', onScroll); // eslint-disable-line
            if (bodyRef_resolved.current) bodyRef_resolved.current.removeEventListener('scroll', onScroll); // eslint-disable-line

        }


    }, [state.showChat, state.topicClick, tabData]) // eslint-disable-line

    const onOffline = () => {

        if (webSocket !== undefined) {

            webSocket.close();

        }

    }

    const onOnline = () => {

        const jwt_token = getTokenClient();

        getTopicsBasedOnFilter(undefined, 1, true);

        webSocket = new WebSocket(Constants.API_WEBSOCKET_URL + `listenreply/`, jwt_token)

    }

    const getDescriptionBasedOnButton = (descriptionData) => {
        let splitString = descriptionData.split('<p>');
        splitString.length > 1 && splitString.shift();
        splitString = splitString.map((segment) => "<p>" + segment);
        return parse(splitString[0])
    }

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
                                        onChange={(e) => { searchString.current = e.target.value.trim(); setSearchStringState(e.target.value.trim()) }}
                                        placeholder='Search'
                                        onKeyDown={handleKeyDown}
                                        value={searchStringState}
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
                                {checkApptype.current && <button className='iassist-header-three-dot-option' onClick={() => setOpenDesktopMenu(true)}></button>}
                                {openDesktopMenu &&
                                    <ul id='menu' className='pane'>

                                        <li onClick={() => {
                                            if (logOut) logOut();
                                            setOpenDesktopMenu(false)
                                        }}>Logout</li>

                                    </ul>

                                }

                                {/* <button className='iassist-header-close' onClick={() => closePanes()}></button> */}
                            </div>
                        </div>

                        <ClickOutsideListner onOutsideClick={() => dispatch({ type: actionType.show_multiple_filters, payload: false })}>
                            {state.showMultipleFilters &&
                                <div className='iassist-sub-header-wrapper'>

                                    <div className='iassist-sub-header-upper-section'>
                                        <span className="iassist-sub-header-text">Filter</span>


                                        <button className='clear' disabled={disableButton} onClick={() => { clearFilterValueInSession(); clearFilter() }}>Clear</button>
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
                                                selectLabel={state.ticketTypeLabel?.name === 'All' ? 'Select' : state.ticketTypeLabel?.name}
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
                                                selectLabel={state.reporterLabel?.first_name === 'All' ? 'Select' : state.reporterLabel?.first_name}
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
                                        disabled={disableStatusButton}
                                        onClick={() => {
                                            if (tabData !== 'open') {
                                                // fetchTicketsController.abort();
                                                tabData = 'open';
                                                dispatch({ type: actionType.status_tab, payload: 'open' })

                                                checkDataInSessionStorageOnTabSwitch('open')
                                                // if (
                                                // dateRange[0] !== 'Date' ||
                                                // searchString.current !== '' ||
                                                // prevSearchValue.current ||
                                                // allTopics.current.length === 0 
                                                // ||
                                                // state.ticketTypeLabel !== 'All' ||
                                                // state.reporterLabel !== 'Select' ||
                                                /*  !(state.readUnreadStatus.read === true && state.readUnreadStatus.unRead === true) */
                                                // ){console.log("here"); getTopicsBasedOnFilter();}

                                            }
                                        }}>

                                        Active

                                    </button>

                                    <button style={{ backgroundColor: state.statusTab === 'resolved' ? '#6C757D' : '' }}
                                        disabled={disableStatusButton}
                                        onClick={() => {

                                            if (tabData !== 'resolved') {

                                                tabData = 'resolved';
                                                dispatch({ type: actionType.status_tab, payload: 'resolved' })
                                                checkDataInSessionStorageOnTabSwitch('resolved')

                                                // if (
                                                //     dateRange[0] !== 'Date' ||
                                                //     searchString.current !== '' ||
                                                //     prevSearchValue.current ||
                                                //     allTopics_resolved.current.length === 0 ||
                                                //     state.ticketTypeLabel !== 'All' ||
                                                //     state.reporterLabel !== 'Select' ||
                                                /* !(state.readUnreadStatus.read === true && state.readUnreadStatus.unRead === true))   {*/

                                                //     getTopicsBasedOnFilter();
                                                // }
                                            }
                                        }}>

                                        Resolved

                                    </button>

                                </div>

                                

                            </div>

                            {state.statusTab === 'resolved' &&
                                <div className={'iassist-topic-list' + (state.showMultipleFilters ? ' topic-list-test' : '')} id='topic-list' ref={bodyRef_resolved}>

                                    {!confirmDelete && allTopics_resolved.current.length > 0 && allTopics_resolved.current.map((topic, index) => {

                                        return (
                                            <div className='iassist-topic' key={topic.id}>

                                                {<div className='iassist-topic-header' onClick={() => openChat(topic)}>

                                                    <div className='topic-header-inner'>
                                                        <h4 className='topic-name'>{parse(topic?.name)}</h4>
                                                        <div className='topic-chat-notify'></div>
                                                        {showUnreadNotification(topic.id) && <span className='topic-chat-notify-layer'></span>}
                                                    </div>

                                                    <div className='iassist-topic-description'>{getDescriptionBasedOnButton(topic?.description)}
                                                    </div>
{/* {parse(topic?.description.substr(0, 100), options)}{topic?.description?.length > 102 && '...'} */}
                                                    <Detail topic={topic} type={ticketTypeList.current} allUser={allUser_resolved.current.length ? allUser_resolved.current : reportersList.current} allAccount={allAccount_resolved.current} />

                                                </div>}


                                                {<div className='iassist-topic-meta'>

                                                    {(state.statusTab !== 'resolved') && state.showFeedback && state.feedbackId === topic.id &&
                                                        <FeedBack
                                                            closePane={closeFeedbackandReopenPane}
                                                            id={state.feedbackId}
                                                            ticket={getTopicsBasedOnFilter}
                                                            disabledButton={setDisableButton}
                                                            allTopic={allTopics_resolved.current}
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
                                                            allTopic={allTopics_resolved.current}
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


                                    {allTopics_resolved.current.length === 0 && !state.initialLoadStatus && !showLoader && <div className='no-record'>No Tickets Found </div>}

                                </div>}

                            {
                                state.statusTab === 'open' &&

                                <div className={'iassist-topic-list' + (state.showMultipleFilters ? ' topic-list-test' : '')} id='topic-list' ref={bodyRef}>

                                    {!confirmDelete && allTopics.current.length > 0 && allTopics.current.map((topic, index) => {

                                        return (
                                            <div className='iassist-topic' key={topic.id}>

                                                {<div className='iassist-topic-header' onClick={() => openChat(topic)}>

                                                    <div className='topic-header-inner'>
                                                        <h4 className='topic-name'>{parse(topic.name, options)}</h4>
                                                        <div className='topic-chat-notify'></div>
                                                        {showUnreadNotification(topic.id) && <span className='topic-chat-notify-layer'></span>}
                                                    </div>

                                                    <div className='iassist-topic-description'>{getDescriptionBasedOnButton(topic?.description)}
                                                    {/* {parse(topic?.description.substr(0, 100))}{topic?.description?.length > 102 && '...'} */}
                                                    </div>

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

                            }
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
                    refresh={refreshUserListInsideChat}
                    refreshState={state.refreshState}
                    tabStatus={state.statusTab}

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
                tabStatus={state.statusTab}

            />
            }

        </>
    )
}

export default memo(Support);
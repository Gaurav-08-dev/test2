import React, { useState, useEffect, useRef, memo } from 'react';
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
import DatePicker from '../ReactCalendar/DatePicker';
import Detail from './userlist/Detail';
import Delete from './DeleteConfirmation/Delete';

// let webSocket;
let pageNumber = 1;
const pageSize = 10;
let totalPage = 0;
let Size = pageSize;
const scrollPadding = 40;
let tabData = 'open';
let dates = 'Date';
let defType = { 'name': 'All', 'id': 'All' };
let defReporter = { 'first_name': 'All', 'id': 'All' };
let reporter_id = 0;
let type_id = 0;
let chatId = '';
let refresh = false;
// let btnId = 'trigger-btn';//document.getElementById("iassist-panel-wrapper")?.getAttribute("data-buttonid") || 'btn';
// let panelPosition = 'right';//document.getElementById("iassist-panel-wrapper").getAttribute("data-panelposition");

export const statusValue = ['InQueue', 'InProgress', 'OnHold', 'Completed', 'Unassigned'];

const Support = ({ closePane, topicClick, webSocket, panelPosition }) => {

    const prevSearchValue = useRef();
    const allTopics = useRef([]);
    const unReadList = useRef([]);
    const activity = useRef([]);
    const unRead = useRef(false);
    const btnId = useRef(localStorage?.getItem(Constants.SITE_PREFIX_CLIENT + 'buttonId'));
    const disableUnreadButton = useRef(false);

    const [TopicClick, setTopicClick] = useState(topicClick ? topicClick : false);

    // const [webSocket, setWebSocket] = useState(webSockets)

    const [CountChange, setCountChange] = useState(false);

    const [showChat, setShowChat] = useState(false);

    const [unreadCount, setUnReadCount] = useState(0);

    const [indivTopic, setIndivTopic] = useState([]);

    const bodyRef = useRef();

    const [searchString, setSearchString] = useState('');

    const [showLoader, setShowLoader] = useState(false);

    const [statusTab, setStatusTab] = useState('open');

    const [showFeedback, setShowFeedback] = useState(false);


    const [showReopenPanel, setshowReopenPanell] = useState(false);

    const controller = new AbortController();

    const [feedBackId, setFeedBackId] = useState('');

    const [showMultipleFilters, setShowMultipleFilters] = useState(false);

    const [isOpenCalendar, setIsOpenCalendar] = useState(false);

    const [type, setType] = useState([]);

    const [reporters, setReporters] = useState([]);

    const [typeLabel, setTypeLabel] = useState('All');

    const [reporterLabel, setReportersLabel] = useState('Select');

    const [date, setDate] = useState(new Date());

    const allUser = useRef([]);

    const allAccount = useRef([]);

    const [initialLoad, setInitialLoad] = useState(true);

    const [getTopicId, setGetTopicId] = useState('');

    const [confirmDelete, setConfirmDelete] = useState(false);

    const [deleteId, setDeleteId] = useState('');

    const [lastActivity, setLastActivity] = useState(false);

    const [disableButton, setDisableButton] = useState(false);

    const [fetchButton, setFetchButton] = useState(false);

    const [refr, setRefr] = useState(false);

    if (type.length > 0 && type[0].id !== 'All') {

        type.unshift(defType);

    }

    if (reporters.length > 0 && reporters[0].id !== 'All') {

        reporters.unshift(defReporter);

    }

    // if (webSocket === undefined || (webSocket.readyState !== WebSocket.OPEN && webSocket.readyState !== WebSocket.CONNECTING)) {

    //     if (webSocket === undefined || webSocket.readyState === WebSocket.CLOSED || webSocket.readyState === WebSocket.CLOSING) {

    //         const jwt_token = getTokenClient()

    //         webSocket = new WebSocket(Constants.API_WEBSOCKET_URL + `listenreply/`, jwt_token)

    //     }

    //     console.log('listen connection');

    // }

    const getTopics = async (isDelete) => {
        setDisableButton(true)

        if (tabData) {

            setStatusTab(tabData);

        }

        if (isDelete === 'delete') {
            allTopics.current = [];
            unReadList.current = [];
            allUser.current = [];
            allAccount.current = [];
            activity.current = [];
        }


        let jwt_token = getTokenClient();

        setShowLoader(true);

        let url = getUrl();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(url, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    for (let key in result) {

                        let data = result[key];

                        if (key === 'topic_data') {

                            data?.forEach((topicValue) =>
                                allTopics.current.push(topicValue)
                            )

                        } else if (key === 'unread_data') {

                            data?.forEach((unread) => {
                                unReadList.current.push(unread);
                            })

                        } else if (key === 'pagination') {

                            // totalCount = data.total_count;

                            totalPage = data.no_of_pages;

                        } else if (key === 'user_data') {

                            data?.forEach((user) => {
                                allUser.current.push(user);
                            })

                        } else if (key === 'account_data') {

                            data?.forEach((account) => {
                                allAccount.current.push(account);
                            })

                        } else if (key === 'activity') {

                            data?.forEach((act) => {
                                activity.current.push(act);
                            })

                        }

                    }

                    setDisableButton(false)
                    setFetchButton(!fetchButton);

                    setShowLoader(false);

                }

            })
            .catch(err => {

                setDisableButton(false)

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    }

    const getUrl = (searchQuery) => {

        let tab = tabData === 'open' ? false : true;

        let url;

        let searchStringFlag = searchString ? `&topic_search=${searchString}` : searchQuery ? `&topic_search=${searchQuery}` : '';

        let unReadFlag = unRead.current ? `&unread=${unRead.current}` : ''


        if (dates === 'Date') {

            url = Constants.API_IASSIST_BASE_URL + `topic/?page_size=${Size}&page_number=${pageNumber}&status_flag=${tab}&sort_order=descending&type_id=${type_id}&reporter=${reporter_id}${searchStringFlag}${unReadFlag}`;

        } else {

            url = Constants.API_IASSIST_BASE_URL + `topic/?page_size=${Size}&page_number=${pageNumber}&status_flag=${tab}&sort_order=descending&type_id=${type_id}&date=${dates}&reporter=${reporter_id}${searchStringFlag}${unReadFlag}`;

        }

        return url;

    }

    const getTopicsBasedOnFilter = async (searchQuery) => {

        disableUnreadButton.current = true;

        setInitialLoad(false);

        pageNumber = 1;

        setShowLoader(true);

        setDisableButton(true)

        let url = getUrl(searchQuery);

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(url, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    for (let key in result) {

                        let data = result[key];

                        if (key === 'topic_data') {

                            allTopics.current = data;

                        } else if (key === 'unread_data') {

                            unReadList.current = data;

                        } else if (key === 'pagination') {

                            // totalCount = data.total_count;

                            totalPage = data.no_of_pages;

                        } else if (key === 'message' && data === 'no tickets found') {

                            allTopics.current = [];

                        } else if (key === 'user_data') {

                            allUser.current = data;

                        } else if (key === 'account_data') {

                            allAccount.current = data;

                        } else if (key === 'activity') {

                            activity.current = data;

                        }

                    }

                    disableUnreadButton.current = false;

                    setDisableButton(false)

                    setFetchButton(!fetchButton);

                    setShowLoader(false);

                }

            })
            .catch(err => {
                setDisableButton(false)

                disableUnreadButton.current = false;

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

        var received_msg = JSON.parse(evt.data);
        refresh = false;
        if (received_msg.type === 'refresh' && chatId === received_msg.topic_id) {
            refresh = true;
            setRefr(!refr);
            return;
        } else if (received_msg.type === 'count') {
            let isUnread = received_msg.unread_tickets_count > 0 ? true : false;
            localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(received_msg.unread_tickets))
            changeValue(isUnread);
        } else if (received_msg.type === 'chat') {
            // let user = getUser();
            if (chatId !== received_msg.topic_id) {
                if (!document.getElementById('iassist-unread')) {
                    // console.log('check');
                    changeValue(true);
                }

                const findUnread = unReadList.current.find(topic => topic.topic_id === received_msg.topic_id)

                if (!findUnread) unReadList.current = [...unReadList.current, { topic_id: received_msg.topic_id, unread_count: 1 }]

                unReadList.current.forEach((topic) => {

                    if (allTopics.current.length > 0 && topic.topic_id === received_msg.topic_id) {

                        topic.unread_count += 1;

                        setCountChange(!CountChange);

                        return;

                    }

                })

                let readList = JSON.parse(localStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'unread')) || [];
                readList.push(received_msg.topic_id);
                localStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'unread', JSON.stringify(readList))
            }

        }

    };

    webSocket.onopen = function () {

        console.log("websocket listen connected")

    };

    webSocket.onclose = function () {

        console.log("connection listen Closed");

    };

    const fetchTypeData = async () => {

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'ticket_type/', null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    setType(result);

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    };

    const getUsers = async () => {

        let user = getUser();

        let id = user.organization_id;

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'account_id/?account_id=' + id, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    // if (result.message === 'Success') {

                    setReporters(result);

                    // }

                }

            })
            .catch(err => {

                alertService.showToast('error', err.msg);

            });
    }

    useEffect(() => {

        if (panelPosition && panelPosition !== 'Right') {
            let containerWrapper = document.getElementById('iassist-panel');
            if (panelPosition.toLowerCase() === 'left') {
                containerWrapper.style.left = 0;
            } else if (panelPosition.toLowerCase() === 'center') {
                var screenWidth = window.innerWidth;
                containerWrapper.style.left = (screenWidth/2) - (containerWrapper.offsetWidth/2) + "px";
            }
            
        }

        if (type.length === 0) {

            fetchTypeData();

        }

        if (reporters.length === 0) {

            getUsers();

        }

        // let supportContainer = document.getElementById('iassist-panel');

        // if (supportContainer && height) {

        //     supportContainer.style.height = height;

        // }

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('iassist-panel');

            conatinerWrapper[0].style.top = '65px';
            conatinerWrapper[0].style.maxHeight = '92.5%';


        }

        // if (allTopics.current.length === 0) {

        getTopics();

        // }

        const onScroll = async () => {

            if (bodyRef.current.scrollTop + bodyRef.current.clientHeight + scrollPadding >= bodyRef.current.scrollHeight && (totalPage > pageNumber)) {

                let checkScroll = allTopics.current.length === pageNumber * 10;

                if (checkScroll) {

                    pageNumber += 1;

                    await getTopics();

                }

            }

        }

        document.addEventListener("mouseup", (event) => {

            let head = document.getElementById('option');

            if (head && !(head.contains(event.target))) {
                // setOptionClick(false);
            }

            let calendar = document.getElementById('calendar-wrapper');

            if (calendar && !(calendar.contains(event.target))) {

                setIsOpenCalendar(false);

            }

            let home = document.getElementById('iassist-panel');

            if (home && !(home.contains(event.target))) {

                closePanes();
                clearData();

            }

        })

        bodyRef.current.addEventListener('scroll', onScroll);

        return () => {
            clearData();
            // webSocket.close();
            setInitialLoad(true)
        }

    }, [])

    const clearData = () => {

        allTopics.current = [];

        activity.current = [];

        unReadList.current = [];

        pageNumber = 1;
        unRead.current=false;
        disableUnreadButton.current=false;

    }

    const openChat = (event, topic) => {

        let data = checkLastActivity(topic.id);

        setLastActivity(data);

        let checkIndex = unReadList.current.find((list) => {
            return list.topic_id === topic.id;
        });

        if (checkIndex) setUnReadCount(checkIndex.unread_count)

        setShowChat(true);

        chatId = topic.id;

        setIndivTopic(topic)

        clearData();

    }
    const closePanes = () => {
        // Size = pageSize;


        closePane();

        setShowChat(false);

        setTopicClick(false);

        clearData();

    }

    // const onInputChange = (e) => {

    //     setSearchString(e.target.value)

    //     searchTopic(e.target.value)

    // }

    const closeFeedbackandReopenPane = () => {

        setShowFeedback(false);

        setshowReopenPanell(false);



        setFeedBackId('');

        setGetTopicId('');

    }

    const showUnreadNotification = (id) => {

        let data = unReadList.current.filter(read => {
            return read.topic_id === id

        })




        return data && data.length > 0 && data[0].unread_count > 0 ? true : false;

    }

    //For filter drop down changes
    const ondropDownChange = (value, type) => {

        if (type === 'reporter' && reporter_id !== value.id) {

            setReportersLabel(value.first_name);

            if (value.id === 'All') {

                reporter_id = 0;

            } else {

                reporter_id = value.id;

            }

            getTopicsBasedOnFilter();

        } else if (type === 'type' && ((type_id !== value.id && value.name !== 'All') || (value.name === 'All' && type_id !== 0))) {

            setTypeLabel(value.name);

            if (value.name === 'All') {

                type_id = 0;

            } else {

                type_id = value.id;

            }

            getTopicsBasedOnFilter();

        }

    }

    const handleDatePicker = (e) => {

        if (dates !== e) {

            setDate(new Date(e))

            dates = e;

            getTopicsBasedOnFilter();

        }

        setIsOpenCalendar(false);

    }

    const openFilterList = () => {

        if (showMultipleFilters) {

            clearFilter();

        }
        setShowMultipleFilters(!showMultipleFilters)

    }

    const showUnread = () => {

        unRead.current = !unRead.current;
        getTopicsBasedOnFilter()
    }
    const clearFilter = () => {

        if (reporter_id !== 0 || type_id !== 0 || dates !== 'Date' || unRead?.current) {

            reporter_id = 0;

            type_id = 0;

            dates = 'Date';
            unRead.current = false;
            setTypeLabel('All');

            setReportersLabel('Select');

            getTopicsBasedOnFilter();

        }

    }

    const deleteTopic = async (e, data) => {

        e.stopPropagation();

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'topic/?topic_id=' + data, null, false, 'DELETE', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    if (allTopics.current.length > 10) {

                        let index = allTopics.current.findIndex((topic) => {
                            return topic.id === data;
                        })

                        allTopics.current.splice(index, 1);

                    } else {

                        getTopics('delete');

                    }

                    alertService.showToast('success', result.message);

                    setConfirmDelete(false);

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    }
    const checkLastActivity = (id) => {

        let data = activity.current.filter((val) => val.id === id);

        return data.length > 0 && data[0].activity_status === 0 ? true : false;

    }

    const handleKeyDown = (e) => {
        if ((e.keyCode === 13 || e === 'click') && (searchString !== '' || prevSearchValue.current)) {
            prevSearchValue.current = searchString;

            getTopicsBasedOnFilter(searchString);
            // searchTopic(searchString)
        }
    }

    return (

        <>
            {!TopicClick && !showChat &&
                <div id='iassist-panel' className='iassist-panel'>

                    <div className='iassist-panel-inner'>

                        <div className='iassist-panel-header'>

                            {showLoader && <LoadingScreen />}

                            <h4 className='header-title'>iAssist</h4>

                            <div className='header-right'>

                                <div className='search'>

                                    <button className='btn' onClick={() => handleKeyDown('click')} title='search'></button>

                                    <input type={'text'}
                                        title='Search'
                                        onChange={(e) => { setSearchString(e.target.value.trim()) }}
                                        placeholder='Search'
                                        onKeyDown={handleKeyDown}
                                    />

                                </div>

                                <div className={'filter-btn' + (showMultipleFilters ? ' filter-bg' : '')}>
                                    <button className={'button' + (showMultipleFilters ? ' button-select' : '')}
                                        disabled={disableButton}
                                        title='filter-button' onClick={() => openFilterList()}></button>
                                </div>

                                <div className='btn-new-topic-wrapper'>

                                    <button onClick={() => {
                                        clearData();
                                        setTopicClick(true)
                                    }}>
                                        <span className='add-new-ticket'></span>
                                        Ticket
                                    </button>

                                </div>
                                <button className='header-close' onClick={() => closePanes()}></button>
                            </div>
                        </div>

                        {showMultipleFilters &&
                            <div className='sub-header-wrapper'>

                                <div id='calendar' className={'calendar-wrapper'}>
                                    <div className={'calendar-date'}>
                                        <label className={'label'} onClick={() => setIsOpenCalendar(true)}>{dates}</label>
                                        <button title='Calendar' className={'button-calendar'} onClick={() => setIsOpenCalendar(true)}></button>
                                    </div>

                                    {isOpenCalendar && <div id='calendar-wrapper' className='period-picker'>

                                        <DatePicker picker='date'
                                            onChange={(e) => handleDatePicker(e)}
                                            placeholder={'Select Date'}
                                            date={date}
                                            allowClear={false}
                                            showOkCancelBtns={true}
                                            showInline={true} />

                                    </div>}

                                </div>

                                <div className='divider'></div>

                                <div className='type no-bg'>

                                    <SpeedSelect options={type} selectLabel={typeLabel} prominentLabel='Type' maxHeight={100} maxWidth={80} uniqueKey='id' displayKey='name' onSelect={(value) => ondropDownChange(value, 'type')} />

                                </div>

                                <div className='divider'></div>

                                <div className='reporter no-bg'>

                                    <SpeedSelect options={reporters} selectLabel={reporterLabel} prominentLabel='Reporter' maxHeight={100} maxWidth={80} uniqueKey='id' displayKey='first_name' onSelect={(value) => ondropDownChange(value, 'reporter')} />

                                </div>
                                <div className='divider'></div>
                                <div className={unRead.current ? 'unread-button-wrapper' : 'unselected'}><button className='clear' disabled={disableUnreadButton.current} onClick={() => showUnread()}>Unread</button></div>
                                {/* <div className='divider'></div> */}

                                <button className='clear' disabled={disableButton} onClick={() => clearFilter()}>Clear</button>

                            </div>}

                        <div className='iassist-panel-body'>
                            <div className='filter-wrapper'>

                                <div className={'tab-wrapper'}>

                                    <button style={{ backgroundColor: statusTab === 'open' ? '#6C757D' : '' }}
                                        disabled={disableButton}
                                        onClick={() => {
                                            if (tabData !== 'open') {
                                                tabData = 'open';
                                                setStatusTab('open');
                                                allTopics.current = [];
                                                clearData();
                                                getTopics();

                                            }
                                        }}>

                                        Active

                                    </button>

                                    <button style={{ backgroundColor: statusTab === 'resolved' ? '#6C757D' : '' }}
                                        disabled={disableButton}
                                        onClick={() => {
                                            if (tabData !== 'resolved') {
                                                tabData = 'resolved';
                                                setStatusTab('resolved');
                                                allTopics.current = [];
                                                clearData();
                                                getTopics();
                                            }
                                        }}>

                                        Resolved

                                    </button>

                                </div>

                            </div>

                            <div className={'topic-list' + (showMultipleFilters ? ' topic-list-test' : '')} id='topic-list' ref={bodyRef}>

                                {!confirmDelete && allTopics.current.length > 0 && allTopics.current.map((topic, index) => {

                                    return (
                                        <div className='topic' key={topic.id}>

                                            {<div className='topic-header' onClick={(e) => openChat(e, topic)}>

                                                <div className='topic-header-inner'>
                                                    <h4 className='topic-name'>{topic.name}</h4>
                                                    <div className='topic-chat-notify'></div>
                                                    {showUnreadNotification(topic.id) && <span className='topic-chat-notify-layer'></span>}
                                                </div>

                                                <div className='topic-description'>{topic?.description.substr(0, 100)}{topic?.description?.length > 102 && '...'}</div>

                                                <Detail topic={topic} type={type} allUser={allUser.current.length ? allUser.current : reporters} allAccount={allAccount.current} />

                                            </div>}

                                            {/* {(showFeedback || showReopenPanel) && <div className='header-meta-divider'></div>} */}

                                            {<div className='topic-meta'>

                                                {(statusTab !== 'resolved') && showFeedback && feedBackId === topic.id && <FeedBack closePane={closeFeedbackandReopenPane} id={feedBackId} ticket={getTopicsBasedOnFilter} disabledButton={setDisableButton} allTopic={allTopics.current} setLoader={setShowLoader} placeHolders='Type here' />}


                                                {feedBackId !== topic.id && (statusTab === 'open') ?
                                                    <div className='topic-buttons'>

                                                        <button className='btn-resolve icon-btn' disabled={disableButton} onClick={() => {
                                                            setDisableButton(true);
                                                            setShowFeedback(true);
                                                            setFeedBackId(topic.id)
                                                        }}>
                                                            <i></i>
                                                            <span>Resolve</span>
                                                        </button>

                                                        {checkLastActivity(topic.id) && <button className='btn-delete icon-btn' disabled={disableButton} onClick={(e) => {
                                                            setConfirmDelete(true)
                                                            setDisableButton(true);
                                                            setDeleteId(topic.id);
                                                        }
                                                        }>
                                                            <i></i>
                                                            <span>Delete</span>
                                                        </button>}

                                                    </div> : ''}

                                                {(statusTab === 'resolved') && showReopenPanel && getTopicId.id === topic.id && <TicketReopen closePane={closeFeedbackandReopenPane} id={getTopicId.id} ticket={getTopicsBasedOnFilter} disableButton={setDisableButton} allTopic={allTopics.current} setLoader={setShowLoader} placeHolders='Type here' />}
                                                {(statusTab === 'resolved') && (!showReopenPanel) && <div className='topic-buttons'>

                                                    {getTopicId.id !== topic.id && <button className='btn-reopen icon-btn' disabled={disableButton} onClick={() => {
                                                        setDisableButton(true);
                                                        setGetTopicId(topic);
                                                        setshowReopenPanell(true);

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
                                    topic={deleteId}
                                    setConfirmDelete={setConfirmDelete}
                                    disable={setDisableButton} />}
                                {allTopics.current.length === 0 && !initialLoad && !showLoader && <div className='no-record'>No Tickets Found </div>}
                            </div>
                        </div>

                    </div>

                </div>}



            {TopicClick && !showChat && <CreateChatRoom closePane={closePanes} socketDetail={webSocket} panelPosition={panelPosition} />}

            {showChat && <ChatRoom closePane={closePanes}
                chatIds={chatId}
                unRead={unreadCount}
                topicDetail={indivTopic}
                allAccount={allAccount.current.length > 0 ? allAccount.current : reporters}
                allUser={allUser.current}
                type={type}
                activity={lastActivity}
                refresh={refresh}
                refreshState={refr}
                socketDetail={webSocket} 
                panelPosition={panelPosition}
                />
            }

        </>
    )
}

export default memo(Support);
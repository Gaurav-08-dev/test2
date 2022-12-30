
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
import Delete from './DeleteConfirmation/Delete'


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
let allTopics = [];
let activity = [];
let unReadList = [];
let chatId = '';
let refresh = false, unRead = false, disableUnreadButton = false;
let btnId = document.getElementById("test-div").getAttribute("data-buttonid");

export const statusValue = ['InQueue', 'InProgress', 'OnHold', 'Completed', 'Unassigned'];

const Support = ({ closePane, topicClick, webSocket }) => {

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

    const [initalLoad, setInitialLoad] = useState(true);

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

        if (tabData) {

            setStatusTab(tabData);

        }

        if (isDelete === 'delete') {
            allTopics = [];
            unReadList = [];
            allUser.current = [];
            allAccount.current = [];
            activity = [];
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
                                allTopics.push(topicValue)
                            )

                        } else if (key === 'unread_data') {

                            data?.forEach((unread) => {
                                unReadList.push(unread);
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
                                activity.push(act);
                            })

                        }

                    }

                    setFetchButton(!fetchButton);

                    setShowLoader(false);

                }

            })
            .catch(err => {

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

    }

    const getUrl = (searchQuery) => {

        let tab = tabData === 'open' ? false : true;

        let url;

        let searchStringFlag = searchString ? `&topic_search=${searchString}` : searchQuery ? `&topic_search=${searchQuery}` : '';

        let unReadFlag = unRead ? `&unread=${unRead}` : ''

        if (dates === 'Date') {

            url = Constants.API_IASSIST_BASE_URL + `topic/?page_size=${Size}&page_number=${pageNumber}&status_flag=${tab}&sort_order=descending&type_id=${type_id}&reporter=${reporter_id}${searchStringFlag}${unReadFlag}`;

        } else {

            url = Constants.API_IASSIST_BASE_URL + `topic/?page_size=${Size}&page_number=${pageNumber}&status_flag=${tab}&sort_order=descending&type_id=${type_id}&date=${dates}&reporter=${reporter_id}${searchStringFlag}${unReadFlag}`;

        }

        return url;

    }

    const searchTopic = (e) => {

        getTopicsBasedOnFilter(e);

    }

    const getTopicsBasedOnFilter = async (searchQuery) => {

        disableUnreadButton = true;

        setInitialLoad(false);

        pageNumber = 1;

        setShowLoader(true);

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

                            allTopics = data;

                        } else if (key === 'unread_data') {

                            unReadList = data;

                        } else if (key === 'pagination') {

                            // totalCount = data.total_count;

                            totalPage = data.no_of_pages;

                        } else if (key === 'message' && data === 'no tickets found') {

                            allTopics = [];

                        } else if (key === 'user_data') {

                            allUser.current = data;

                        } else if (key === 'account_data') {

                            allAccount.current = data;

                        } else if (key === 'activity') {

                            activity = data;

                        }

                    }

                    disableUnreadButton = false;

                    setFetchButton(!fetchButton);

                    setShowLoader(false);

                }

            })
            .catch(err => {
                disableUnreadButton = false;

                setShowLoader(false);

                alertService.showToast('error', err.msg);

            });

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
            span.style.top = '6px';

            if (btn) btn.append(span);
            console.log(btn);
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
            let user = getUser();
            if (user.id !== received_msg.user_id) {
                if (!document.getElementById('iassist-unread')) {
                    console.log('check');
                    changeValue(true);
                }

                unReadList.filter((topic) => {

                    if (allTopics.length > 0) {

                        if (topic.topic_id === received_msg.topic_id) {

                            topic.unread_count += 1;

                            setCountChange(!CountChange);

                            return topic;

                        }

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

        if (type.length === 0) {

            fetchTypeData();

        }

        if (reporters.length === 0) {

            getUsers();

        }

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('support-wrapper');

            conatinerWrapper[0].style.top = '65px';
            // conatinerWrapper[0].style.maxHeight = '92.5%';


        }

        // if (allTopics.length === 0) {

        getTopics();

        // }

        const onScroll = async () => {

            if (bodyRef.current.scrollTop + bodyRef.current.clientHeight + scrollPadding >= bodyRef.current.scrollHeight && (totalPage > pageNumber)) {

                let checkScroll = allTopics.length === pageNumber * 10;

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

            let home = document.getElementById('client-home');

            if (home && !(home.contains(event.target))) {

                closePanes();
                clearData();

            }

        })

        bodyRef.current.addEventListener('scroll', onScroll);

        return () => {
            clearData();
            // webSocket.close();
        }

    }, [])

    const clearData = () => {

        allTopics = [];

        activity = [];

        unReadList = [];

        pageNumber = 1;

    }

    const openChat = (event, topic) => {

        let data = checkLastActivity(topic.id);

        setLastActivity(data);

        let checkIndex = unReadList.find((list) => {
            return list.topic_id === topic.id;
        });

        setUnReadCount(checkIndex.unread_count)

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

        let data = unReadList.filter(read => {
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

        unRead = !unRead;
        getTopicsBasedOnFilter()
    }
    const clearFilter = () => {

        if (reporter_id !== 0 || type_id !== 0 || dates !== 'Date') {

            reporter_id = 0;

            type_id = 0;

            dates = 'Date';

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

                    if (allTopics.length > 10) {

                        let index = allTopics.findIndex((topic) => {
                            return topic.id === data;
                        })

                        allTopics.splice(index, 1);

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

        let data = activity.filter((val) => val.id === id);

        return data.length > 0 && data[0].activity_status === 0 ? true : false;

    }

    const handleKeyDown = (e) => {
        if (e.keyCode === 13) {
            searchTopic(searchString)
        }
    }
    


    return (

        <>

            {!TopicClick && !showChat &&
                <div id='client-home' className='support-wrapper'>

                    <div className='support-wrapper-inner'>

                        <div className='header-wrapper'>

                            {showLoader && <LoadingScreen />}

                            <div className='header-inner'>iAssist</div>

                            <div className='header-other-functionality-wrapper'>

                                <div className='topic-filter-search-iassist'>

                                    <div className='search'>

                                        <button className='btn' onClick={searchTopic} title='search'></button>

                                        <input type={'text'}
                                            title='Search'
                                            onChange={(e) => { setSearchString(e.target.value) }}
                                            placeholder='Search'
                                            onKeyDown={handleKeyDown}
                                        />

                                    </div>

                                </div>

                                <div className={'filter-btn' + (showMultipleFilters ? ' filter-bg' : '')}>

                                    <button className={'button' + (showMultipleFilters ? ' button-select' : '')} disabled={disableButton} title='filter-button' onClick={() => openFilterList()}></button>

                                </div>

                                <div className='btn-new-topic-wrapper'>

                                    <button onClick={() => {
                                        clearData();
                                        setTopicClick(true)
                                    }} disabled={disableButton}><span className='add-new-ticket'></span>Ticket</button>

                                </div>

                                <button className='header-close' disabled={disableButton} onClick={() => closePanes()}></button>

                            </div>

                        </div>

                        {showMultipleFilters &&
                            <div className='sub-header-wrapper'>

                                <div id='calendar' className={'calendar-wrapper'}>

                                    <div className={'calendar-wrapper-separator'}>

                                        <label className={'label'} onClick={() => setIsOpenCalendar(true)}>

                                            {dates}

                                        </label>

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

                                <div className='type'>

                                    <SpeedSelect options={type} selectLabel={typeLabel} prominentLabel='Type' maxHeight={100} maxWidth={80} uniqueKey='id' displayKey='name' onSelect={(value) => ondropDownChange(value, 'type')} />

                                </div>

                                <div className='reporter'>

                                    <SpeedSelect options={reporters} selectLabel={reporterLabel} prominentLabel='Reporter' maxHeight={100} maxWidth={80} uniqueKey='id' displayKey='first_name' onSelect={(value) => ondropDownChange(value, 'reporter')} />

                                </div>
                                <div className={unRead ? 'unread-button-wrapper' : 'unselected'}><button className='clear' disabled={disableUnreadButton} onClick={() => showUnread()}>Unread</button></div>
                                <button className='clear' disabled={disableButton} onClick={() => clearFilter()}>clear</button>

                            </div>}


                        <div className='filter-wrapper support'>

                            <div className={'tab-preview'}>

                                <button style={{ backgroundColor: statusTab === 'open' ? '#6C757D' : '' }} disabled={disableButton} onClick={() => {
                                    if (tabData !== 'open') {
                                        tabData = 'open';
                                        setStatusTab('open');

                                        allTopics = [];
                                        clearData();
                                        getTopics();
                                    }
                                }}>

                                    In Progress

                                </button>

                                <button style={{ backgroundColor: statusTab === 'resolved' ? '#6C757D' : '' }} disabled={disableButton} onClick={() => {
                                    if (tabData !== 'resolved') {
                                        tabData = 'resolved';
                                        setStatusTab('resolved');
                                        allTopics = [];
                                        clearData();
                                        getTopics();
                                    }
                                }}>

                                    Resolved

                                </button>

                            </div>

                        </div>

                        <div className={'topic-list' + (showMultipleFilters ? ' topic-list-test' : '')} id='topic-list' ref={bodyRef}>

                            {!confirmDelete && allTopics.length > 0 && allTopics.map((topic, index) => {

                                return (
                                    <div className='topic' key={topic.id}>

                                        {<div className='topic-header' onClick={(e) => openChat(e, topic)}>

                                            <div className='topic-header-inner'>

                                                <div className='topic-name'><span>{topic.name}</span></div>

                                                <div className='topic-chat-notify'>


                                                </div>

                                                {showUnreadNotification(topic.id) && <span className='topic-chat-notify-layer'></span>}

                                            </div>

                                            <div className='topic-description'>{topic?.description.substr(0, 100)}{topic?.description?.length > 102 && '...'}</div>

                                            <Detail topic={topic} type={type} allUser={allUser.current} allAccount={allAccount.current} />

                                        </div>}

                                        {(showFeedback || showReopenPanel) && <div className='header-meta-divider'></div>}

                                        {<div className='topic-meta'>

                                            {(statusTab !== 'resolved') && showFeedback && feedBackId === topic.id && <FeedBack closePane={closeFeedbackandReopenPane} id={feedBackId} ticket={getTopicsBasedOnFilter} disabledButton={setDisableButton} allTopic={allTopics} />}
                                            {feedBackId !== topic.id && (statusTab === 'open') &&
                                                <div className='topic-buttons'>

                                                    <button className='resolved' disabled={disableButton} onClick={() => {
                                                        setDisableButton(true);
                                                        setShowFeedback(true);
                                                        setFeedBackId(topic.id)
                                                    }}>Resolve</button>

                                                    {checkLastActivity(topic.id) && <button className='delete' disabled={disableButton} onClick={(e) => {
                                                        setConfirmDelete(true)
                                                        setDisableButton(true);
                                                        setDeleteId(topic.id);
                                                    }
                                                    }>Delete</button>}

                                                </div>}

                                            {(statusTab === 'resolved') && showReopenPanel && getTopicId.id === topic.id && <TicketReopen closePane={closeFeedbackandReopenPane} id={getTopicId.id} ticket={getTopicsBasedOnFilter} disableButton={setDisableButton} allTopic={allTopics} />}
                                            {(statusTab === 'resolved') && <div className='topic-buttons'>

                                                {getTopicId.id !== topic.id && <button className='reopen' disabled={disableButton} onClick={() => {
                                                    setDisableButton(true);
                                                    setGetTopicId(topic);
                                                    setshowReopenPanell(true);

                                                }}>Re-Open</button>}

                                            </div>}

                                        </div>}

                                    </div>

                                )
                            })}

                        {confirmDelete && <Delete deleteTopic={deleteTopic} topic={deleteId} setConfirmDelete={setConfirmDelete} disable={setDisableButton} />}
                            {allTopics.length === 0 && !initalLoad && <div className='no-record'>No Tickets Found </div>

                            }
                        </div>

                    </div>

                </div>}


                      
            {TopicClick && !showChat && <CreateChatRoom closePane={closePanes} socketDetail={webSocket} />}

            {showChat && <ChatRoom closePane={closePanes} chatIds={chatId} unRead={unreadCount} topicDetail={indivTopic} allAccount={allAccount.current} allUser={allUser.current} type={type} activity={lastActivity} refresh={refresh} refreshState={refr} socketDetail={webSocket} />}

        </>
    )
}

export default memo(Support);
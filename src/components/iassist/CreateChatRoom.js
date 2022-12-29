import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatRoom from './newRoom';
import './CreateChatRoom.scss';

import * as Constants from '../Constants';
import SpeedSelect from 'react-speedselect';
import { debounce, getToken, getTokenClient, getUser } from '../../utils/Common';
import alertService from "../../services/alertService";
import Support from './Support';
import LoadingScreen from './loader/Loading';
import APIService from '../../services/apiService';
import VideoRecord from './VideoRecord/VideoRecord';



let suggestIndex = -1;
let chatId;

const descriptionMaxChar = 150;
const nameMaxChar = 45;
const CreateChatRoom = ({ closePane, socketDetail }) => {

    const [priority] = useState(JSON.parse('[{"id":1,"value":"High"},{"id":2,"value":"Medium"},{"id":3,"value":"Low"}]'));

    const [topic, setTopic] = useState('');

    const [tags, setTags] = useState('');

    const [chatRoom, setChatRoom] = useState(false);

    const [priorities, setPriorities] = useState(0);

    const [category, setCategory] = useState(0);

    const [topicDescriptions, setTopicDescriptions] = useState('');

    const [allCategories, setAllCategories] = useState([]);

    const [catLabel, setCatLabel] = useState('');

    const [priorityLabel, setPriorityLabel] = useState('select');

    const [tagList, setTagList] = useState([]);

    const [indivTopic, setIndivTopic] = useState([]);

    const [navigateSupport, setNavigateSupport] = useState(false);

    const [tagRemove, setTagRemove] = useState(false);

    const [tagId, setTagId] = useState([]);

    const [tagSuggestion, setTagSuggestion] = useState([]);

    const [showSuggestion, setShowSuggestion] = useState(false);

    const [showLoading, setShowLoading] = useState(false);

    const tagRef = useRef();

    const titleRef = useRef();

    const [row, setRow] = useState(2);

    const [topicRow] = useState(1);

    const [userData, setUserData] = useState([]);

    const [accountData, setAccountData] = useState([]);

    const [showVideo, setShowVideo] = useState(false);

    const [video, setVideo] = useState([]);

    const [videoUrl, setVideoUrl] = useState([]);

    const [disableCreate, setDisableCreate] = useState(false);

    const controller = new AbortController();

    const [displayMessage, setDisplayMessage] = useState([]);

    const [deleteSavedItem, setDeleteSavedItem] = useState(false);

    const fetchTypeData = async () => {

        const jwt_token = getToken();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'ticket_type/', null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    setAllCategories(result);

                }

            })
            .catch(err => {

                alertService.showToast('error', err.msg);

            });
    };

    useEffect(() => {

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('support-wrapper');

            conatinerWrapper[0].style.top = '65px';

        }
      
        if (allCategories.length === 0) {

            fetchTypeData();

        }

        document.addEventListener("mouseup", (event) => {


            let suggestion = document.getElementById('suggestion');



            if (suggestion && !(suggestion.contains(event.target))) {

                setShowSuggestion(false);

                suggestIndex = -1;

            }
            let container = document.getElementById('create-chat-room');

            if ((container && !(container.contains(event.target)))) {

                closePanes()

            }

        })

    }, [])

    const categorySelect = (value) => {

        setCategory(value.id);

        setCatLabel(value.name);

        requiredFieldValidation(false, 'Type');

    }

    const getTagSuggestion = async (text) => {

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `topic/tags/?search=${text}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    let result = response;

                    if (result && result.data) {

                        setTagSuggestion(result.data);

                    } else {

                        setTagSuggestion([]);

                    }

                }

            })
            .catch(err => {

                alertService.showToast('error', err.msg);

            });
    }

    const debouncedChangeHandler = useCallback(
    debounce(getTagSuggestion, 500)
        , []);

    const handleInputChange = (e, type) => {

        if (type === 'tag') {

            if (e.target?.value?.length <= 20) {

                setTags(e.target.value);

                setShowSuggestion(true);

                debouncedChangeHandler(e.target.value);

            }

        } else if (type === 'topic') {

            if (e.target.value.length <= 45) {

                setTopic(e.target.value);

            } else {

                setTopic(topic);

            }
        } else if (type === 'description') {

            if (e.target.value.length <= 150) {

                setTopicDescriptions(e.target.value);

                setRow(topicDescriptions.length >= 68 ? 4 : 2)

            } else {

                setTopicDescriptions(topicDescriptions);

            }
        }

        requiredFieldValidation(false, type === 'topic' ? 'Name' : 'Description');
    }
    const handleFocusOut = (e) => {

        if (e.target.value) {

            const wordsLeft = e.target.value;

            // const wordsLeft=e.target.value.replace(/ /g, " ").split(' ').filter(item=>!tagList.includes(item) && item.length > 1).filter(item=>item!=='')

            setTagList([...tagList, wordsLeft])

            setTags('')

            setTagId([...tagList, wordsLeft])

            // setTagList([...tagList,...wordsLeft])
            // setTags('')
            // setTagId([...tagList,...wordsLeft])

        }

    }


    const selectPriority = (value) => {

        setPriorities(value.id);

        setPriorityLabel(value.value);

        requiredFieldValidation(false, 'Priority');

    }

    const requiredFieldValidation = (data, type) => {

        let err = [];

        if (topic === '') {

            err = [...err, 'Name'];

        }
        if (topicDescriptions === '') {

            err = [...err, 'Description']

        }
        if (category === 0) {

            err = [...err, 'Type'];

        }
        if (priorities === 0) {

            err = [...err, 'Priority'];

        }
        if (err.length === 1) {

            if (err[0] === type) {

                setDisableCreate(false);

            }

        }
        if (err.length === 0) {

            return true;

        } else {

            err = err.join(" , ").concat(' are Required');
             data && alertService.showToast('warn', err); 
            return false;

        }
    }

    const createRoom = async () => {

        setDisableCreate(true);
        let user = getUser();

        let data = {
            tags: tagId,
            file_data: video
        }

        const formData = new FormData();

        Object.keys(data).forEach((item) => {
            if (item === 'file_data') {

                let fil = data[item];

                for (let i = 0; i < fil.length; i++) {

                    formData.append(item, fil[i]);
                }

            } else {

                formData.append(item, data[item]);

            }
        });

        let validation = requiredFieldValidation(true);

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        let client = user.last_fetched_client;

        let organisation = user.organization_id;

        let url = Constants.API_IASSIST_BASE_URL + `topic/?topic_name=${topic}&topic_description=${topicDescriptions}&account_id=${organisation}&priority=${priorities}&ticket_type_id=${category}&client_id=${client}`

        if (token && validation) {

            setShowLoading(true);

            let res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': token
                },
                body: formData
            })

            let result = await res.json();

            setDisableCreate(false);

            if (result.message && result.data) {

                alertService.showToast("success", result.message);

                chatId = result.data.id;

                setIndivTopic(result.data);

                setUserData(result.user ? result.user : []);

                setAccountData(result.account ? result.account : []);

                setChatRoom(true);


            } else {

                if (result.detail) {

                    alertService.showToast('error', result.detail);

                }

            }

            setShowLoading(false);


        }

    }

    const closePanes = () => {

        closePane();

        setChatRoom(false);

    }

    function onKeyDownEvent(e) {

        let a = e;

        console.log(a);

        e.persist();

        if (e.key === 'Enter' && e.target.value.length <= 1) return;

        if (e.key === 'Enter') {

            if (suggestIndex !== -1) {

                selectTag(e, tagSuggestion[suggestIndex]);

                suggestIndex = -1;

                return;
            }

            let index = tagSuggestion.findIndex((tag) => {

                return tag.name.toLowerCase() === e.target.value.toLowerCase();

            })

            if (index !== -1) {

                selectTag(e, tagSuggestion[index]);

            } else if (tagList.includes(tags)) {

                setTags('');

                alertService.showToast('warn', 'Tag is Already Added');

                return;

            } else {

                if (tags !== '') {

                    setTagList([...tagList, tags]);

                    setTagId([...tagId, tags])

                    // console.log([...tagList, tags]);

                    setTags('');

                    suggestIndex = -1;

                }

            }
        } else if (e.key === 'ArrowDown' && (tagSuggestion.length > 0)) {

            if (tagSuggestion.length - 1 > suggestIndex) {

                suggestIndex += 1;

            } else {

                suggestIndex = 0;

            }

            setTagRemove(!tagRemove);

        } else if (e.key === 'ArrowUp' && (tagSuggestion.length > 0)) {

            if (suggestIndex > 0) {

                suggestIndex -= 1;

            } else {

                suggestIndex = tagSuggestion.length - 1;

            }

            setTagRemove(!tagRemove);

        }
    }

    const removeTag = (e, tag) => {

        e.preventDefault();

        let findIndex = tagList.indexOf(tag);

        tagList.splice(findIndex, 1);

        tagId.splice(findIndex, 1);

        setTagRemove(!tagRemove);

    }

    const selectTag = (e, value) => {

        e.preventDefault();

        setTagList([...tagList, value.name]);

        setTagId([...tagId, value.name]);

        setTags('');

        setShowSuggestion(false);

    }

    const saveAndClose = (e, blob, id, message, dataURL) => {

        setShowVideo(false);

        if (blob) {

            // console.log(dataURL);
            if (message === 'Record') {

                let videoBlobUrl = URL.createObjectURL(blob);

                setVideoUrl([...videoUrl, { video: videoBlobUrl, id: `video_id_${id}` }])

                setVideo([...video, blob]);

            } else {

                let videoBlobUrl = URL.createObjectURL(blob);

                setVideoUrl([...videoUrl, { image: videoBlobUrl, id: `screenshot_id_${id}` }])

                setVideo([...video, blob]);

            }

        }

    }

    useEffect(() => {

        const subheaderAvailable = document.getElementById('app-sub-header');

        if (subheaderAvailable) {

            let conatinerWrapper = document.getElementsByClassName('support-wrapper');

            conatinerWrapper[0].style.top = '65px';

        }

    }, [videoUrl.length])

    // if (!navigateSupport) {

    return !navigateSupport ? (

        <>

            {!showVideo && !chatRoom &&
                <div id='create-chat-room' className='create-chat-room'>

                    <div className='header-wrapper'>

                        <div className='header-inner'>

                            <div onClick={() => setNavigateSupport(true)}>iAssist</div>

                            <div className="breadcrumb">

                                <ul>

                                    <li>New Ticket</li>

                                </ul>

                            </div>

                        </div>

                        <div className='header-other-functionality-wrapper'>

                            <button onClick={() => closePane()} className='header-close'></button>

                        </div>

                    </div>

                    {showLoading && <LoadingScreen />}

                    <div className='create-wrapper'>

                        <span className='title-main'>Topic</span>

                        <div className='field-with-label' onClick={() => titleRef.current.focus()}>

                            <textarea ref={titleRef} rows={topicRow} value={topic} onChange={(e) => handleInputChange(e, 'topic')} ></textarea>

                            <span className={'max-length'}> {topic !== '' ? topic.length : 0}/{nameMaxChar}</span>

                        </div>

                        <label className='title-main' >Tags</label>

                        <div className='field-with-label tags' onClick={() => tagRef.current.focus()}>

                            {tagList.length > 0 && tagList.map((tag, index) => (
                                <div className={'tag-box'} key={index}>

                                    <div className={'tag-text'}>{tag}</div>

                                    <button className={'close-btn'} onClick={(e) => removeTag(e, tag)}></button>

                                </div>

                            ))}
                            <div className='field-block'>

                                <input className='field-control' ref={tagRef} value={tags} onChange={(e) => handleInputChange(e, 'tag')} onKeyUp={onKeyDownEvent} onBlur={handleFocusOut} />

                            </div>

                            {showSuggestion && <div className='tag-suggestion-container' id='suggestion'>

                                <>

                                    {tagSuggestion.length > 0 && tagSuggestion.map((suggest, index) => {
                                        return (<li style={{ backgroundColor: suggestIndex === index ? 'green' : '', color: suggestIndex === index ? '#fff' : '' }} key={suggest.id} onClick={(e) => selectTag(e, suggest)}>{suggest.name}</li>)
                                    })}

                                </>

                            </div>}

                        </div>

                        <span className='title-main'>Description</span>

                        <div className='field-with-label field-with-label-description'>

                            {/* <label>Description</label> */}
                            <textarea value={topicDescriptions} rows={row} onChange={(e) => handleInputChange(e, 'description')}></textarea>

                            <div className={'max-length'}> {topicDescriptions !== '' ? topicDescriptions.length : 0}/{descriptionMaxChar}</div>

                        </div>

                        <div className='filter-wrapper'>

                            <div className='categories-wrapper'>

                                <div className='category'>

                                    <SpeedSelect options={allCategories} selectLabel={catLabel} prominentLabel='Type' maxHeight={100} maxWidth={80} uniqueKey='id' displayKey='name' onSelect={(value) => categorySelect(value, 'Category')} />

                                </div>

                                <div className='category'>

                                    <SpeedSelect options={priority} selectLabel={priorityLabel} prominentLabel='Priority' maxHeight={100} maxWidth={80} uniqueKey='id' displayKey='value' onSelect={(value) => selectPriority(value, 'priority')} />

                                </div>

                            </div>

                        </div>

                        <div className='record-wrapper'>

                            <div className='record-header'>

                                <div className='text'>Capture current tab</div>

                                <div className='record-button'>

                                    <button onClick={() => {
                                        setDisplayMessage('Record');
                                        setShowVideo(true);
                                    }} className='record'>Record</button>

                                    <button onClick={() => {
                                        setDisplayMessage('Shot');
                                        setShowVideo(true);
                                    }} className='shot'>Screenshot</button>

                                </div>

                            </div>

                            {videoUrl.length > 0 && <div className='video-content-wrapper'>
                                {videoUrl.map((vid, index) => {
                                    return <div key={vid.id} className='vid-content'>

                                        {vid.video && <video src={vid.video} controls></video>}

                                        {vid.image && <img alt="" src={vid.image}></img>}

                                        <div className='footer'>

                                            <div className='id'>{vid.id} </div>

                                            <button onClick={() => {
                                                videoUrl.splice(index, 1)
                                                setDeleteSavedItem(!deleteSavedItem);
                                            }}></button>

                                        </div>

                                    </div>

                                })}

                            </div>}

                            {videoUrl.length === 0 && <span className='not-found'>No file attached</span>}

                        </div>

                        <div className='submit-wrapper'>
                            {/* topicData.length === 0 && */}
                            <button className='btn-with-icon btn-small btn-approve' disabled={disableCreate} onClick={createRoom}><i></i><span>Create</span></button>

                            {/* {topicData.length !== 0 && <button className='btn-with-icon btn-small btn-approve' onClick={editRoom}><i></i><span>Edit</span></button>} */}

                            <button className="btn-with-icon btn-small btn-cancel-white" disabled={disableCreate} onClick={() => setNavigateSupport(true)}><i></i><span>Cancel</span></button>

                        </div>

                    </div>

                </div>

            }
            {!showVideo && chatRoom &&
                <ChatRoom closePane={closePanes} chatIds={chatId} unRead={0} topicDetail={indivTopic} type={allCategories} allUser={userData} allAccount={[accountData]} activity={true} socketDetail={socketDetail} />
            }

            {showVideo && !chatRoom && <VideoRecord save={saveAndClose} close={setShowVideo} message={displayMessage} />}

        </>

    ) : (<Support closePane={closePane} webSocket={socketDetail} />)
    // } else {

    //     return (<Support closePane={closePane} />)

    // }

}

export default CreateChatRoom;
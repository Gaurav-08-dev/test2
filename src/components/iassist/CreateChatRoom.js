import React, { useState, useEffect, useRef, useCallback } from 'react';
import ChatRoom from './newRoom';
import './CreateChatRoom.scss';
import * as Constants from '../Constants';
// import SpeedSelect from 'react-speedselect';
import { debounce, getTokenClient, getUser } from '../../utils/Common';
import alertService from "../../services/alertService";
import LoadingScreen from './loader/Loading';
import APIService from '../../services/apiService';
import VideoRecord from './VideoRecord/VideoRecord';
import { 
    // isElectron, 
    convertFileSizeToMB } from './Utilityfunction';

let suggestIndex = -1;
let chatId;
// const descriptionMaxChar = 150;
const nameMaxChar = 45;


const CreateChatRoom = ({ closePane, socketDetail, panelPosition, platformId, closeCreateTicket,
    getTopicsBasedOnFilter,
    ticketTypeList, refresh, refreshState, tabStatus }) => {

    const priorityTypeList = JSON.parse('[{"id":3,"value":"High"},{"id":2,"value":"Medium"},{"id":1,"value":"Low"}]');
    const tagRef = useRef();
    const titleRef = useRef();
    const controller = new AbortController();

    const [currentTag, setCurrentTag] = useState('');
    const [topic, setTopic] = useState('');
    const [chatRoom, setChatRoom] = useState(false);
    const [priorities, setPriorities] = useState({ id: 0 });
    const [ticketType, setTicketType] = useState({ id: 0 });
    const [topicDescriptions, setTopicDescriptions] = useState('');
    const [tagList, setTagList] = useState([]);
    const [currentCreatedTicketData, setCurrentCreatedTicketData] = useState([]);
    const [tagRemove, setTagRemove] = useState(false);
    const [tagId, setTagId] = useState([]);
    const [tagSuggestion, setTagSuggestion] = useState([]);
    const [showSuggestion, setShowSuggestion] = useState(false);
    const [showLoading, setShowLoading] = useState(false);
    // const [totalRowsForTextarea, setTotalRowsForTextarea] = useState(2);
    const [userData, setUserData] = useState([]);
    const [accountData, setAccountData] = useState([]);
    const [showVideo, setShowVideo] = useState(false);
    const [videoData, setVideoData] = useState([]);
    const [videoUrl, setVideoUrl] = useState([]);
    const [disableCreate, setDisableCreate] = useState(false);
    const [disableCancel, setDisableCancel] = useState(false);
    const [displayMessage, setDisplayMessage] = useState([]);
    const [deleteSavedItem, setDeleteSavedItem] = useState(false);
    const [openPopUp, setOpenPopUp] = useState(false);
    // const checkApptype = useRef(isElectron());
    const [selectedFile, setSelectedFile] = useState([]);




    // const getFormDataFromSessionStorage = () => {

    //     const data = JSON.parse(sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'createTicketFormData'));
    //     return data
    // }

    // const setFormDataToSessionStorage = (value, type) => {

    //     sessionStorage.setItem(Constants.SITE_PREFIX_CLIENT + 'createTicketFormData', JSON.stringify({ ...getFormDataFromSessionStorage(), [type]: value }));
    // }

    if (ticketTypeList.length > 0 && ticketTypeList[0].id === 'All') {

        ticketTypeList.shift();

    }

    const categorySelect = (e, ticketValue) => {

        e.stopPropagation()

        setTicketType(ticketValue);
        // setFormDataToSessionStorage(ticketValue, 'ticketType');

        requiredFieldValidation(false, 'Type');

    }

    const getTagSuggestion = async (text) => {

        const jwt_token = getTokenClient();

        const token = `Bearer ${jwt_token}`;

        const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform');

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/topic/tags/?search=${text}`, null, false, 'GET', controller, token)
            .then(response => {

                if (response) {

                    const result = response;

                    if (result && result.data) {

                        setTagSuggestion(result.data.filter(item => item.name.length > 1));

                    } else {

                        setTagSuggestion([]);

                    }

                }

            })
            .catch(err => {

                // alertService.showToast('error', err.msg);

            });
    }

    const debouncedChangeHandler = useCallback( // eslint-disable-line 
        debounce(getTagSuggestion, 500)
        , []);

    const handleInputChange = (e, type) => {

        if (type === 'tag') {

            if (e.target?.value?.length <= 20)

                {
                    setCurrentTag(e.target.value);
                    // setFormDataToSessionStorage(e.target.value, 'tagList');
            }
            
                

            if (e.target.value.trim()) {

                setShowSuggestion(true);
                debouncedChangeHandler(e.target.value);
            }
        }

     else if (type === 'topic') {

        if (e.target.value.length > 45) {


            if (document.getElementsByClassName('toast-wrapper')[0]) return;
            alertService.showToast('warn', 'Topic name should not exceed 45 characters');

        }
        if (e.target.value.length <= 45) {

            setTopic(e.target.value);
            // setFormDataToSessionStorage(e.target.value, 'topic');

        }
    } else if (type === 'description') {

        setTopicDescriptions(e.target.value.replace(/\n/g, ''));

    }

    requiredFieldValidation(false, type === 'topic' ? 'Name' : 'Description');
}

const selectPriority = (e, value) => {

    e.stopPropagation()
    setPriorities(value);
    // setFormDataToSessionStorage(value, 'priorities');


    requiredFieldValidation(false, 'Priority');

}

const requiredFieldValidation = (data, type) => {

    let err = [];

    if (!topic.trim()) {

        err = [...err, 'Topic'];

    }
    if (!topicDescriptions.trim()) {

        err = [...err, 'Description']

    }
    if (ticketType.id === 0) {

        err = [...err, 'Type'];

    }
    if (priorities.id === 0) {

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


        err = err.join(" , ").concat(err.length > 1 ? ' are required' : ' is required');
        data && alertService.showToast('warn', err);
        setDisableCreate(false)
        return false;

    }
}

const discardChanges = () => {

    if (topic || topicDescriptions || priorities.id !== 0 || tagId.length > 0 || videoData.length > 0 || ticketType.id !== 0 || selectedFile.length > 0) {
        setOpenPopUp(true)
    } else {
        // setNavigateSupport(true);
        closeCreateTicket();
        // getTopicsBasedOnFilter();
    }
}

const createRoom = async () => {

    setDisableCreate(true);
    const user = getUser();

    let data = {
        tags: tagId,
        file_data: [...videoData, ...selectedFile]
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

    const validation = requiredFieldValidation(true);

    const jwt_token = getTokenClient();

    const token = `Bearer ${jwt_token}`;


    // const client = user.last_fetched_client;

    const organisation = user.organization_id;

    const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform');
    // &client_id=${client}
    const url = Constants.API_IASSIST_BASE_URL + `${platform}/topic/?topic_name=${topic}&topic_description=${topicDescriptions}&account_id=${organisation}&priority=${priorities.id}&ticket_type_id=${ticketType.id}&app_id=${platformId}&tags=${tagId}`

    if (token && validation) {

        setDisableCancel(true);

        setShowLoading(true);

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': token,
                'App-Version': Constants.IASSIST_SITE_VERSION
            },
            body: formData
        })

        const result = await res.json();

        setDisableCreate(false);
        setDisableCancel(false);

        if (result.message && result.data) {

            alertService.showToast("success", result.message);

            chatId = result.data.id;

            if (getTopicsBasedOnFilter) getTopicsBasedOnFilter(undefined, 1);

            setCurrentCreatedTicketData(result.data);

            setUserData(result.user ? result.user : []);

            setAccountData(result.account ? result.account : []);

            setChatRoom(true);


        } else {

            if (result.detail) {

                setShowLoading(false);

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

const bringSelectedTagInView = (item) => {
    document.getElementById(`li-${item}`).scrollIntoView()
    setCurrentTag(item)
    setTagRemove(!tagRemove);
}

function onKeyDownEvent(e) {

    e.persist();



    if (e.key === 'Enter' && e.target.value.length <= 1) return;

    if (e.key === 'Enter') {
        // setShowSuggestion(false)

        if (suggestIndex !== -1 && tagSuggestion[suggestIndex]) {

            selectTag(e, tagSuggestion[suggestIndex]);
            

            suggestIndex = -1;

            return;
        }

        let index = tagSuggestion.findIndex((tag) => {

            return tag.name.toLowerCase() === e.target.value.toLowerCase();

        })


        if (index !== -1) {

            selectTag(e, tagSuggestion[index]);

        } else if (tagList.includes(currentTag)) {


            setCurrentTag('');

            alertService.showToast('warn', 'Tag is Already Added');

            return;

        } else if (currentTag.trim()) {


            setTagList([...tagList, currentTag]);

            setTagId([...tagId, currentTag])


            setCurrentTag('');

            suggestIndex = -1;

        }
    } else if (e.key === 'ArrowDown' && (tagSuggestion.length > 0)) {

        if (tagSuggestion.length - 1 > suggestIndex) {

            suggestIndex += 1;

        } else {

            suggestIndex = 0;

        }

        bringSelectedTagInView(tagSuggestion[suggestIndex].name)


    } else if (e.key === 'ArrowUp' && (tagSuggestion.length > 0)) {

        if (suggestIndex > 0) {

            suggestIndex -= 1;

        } else {

            suggestIndex = tagSuggestion.length - 1;

        }
        bringSelectedTagInView(tagSuggestion[suggestIndex].name)

    }
}

const handleFocusOut = (e) => {
    if (e.target.value.length > 2) {
        let wordsLeft = e.target.value.replace(/\s{2,}/g, " ").split(" ");
        wordsLeft = wordsLeft.filter((word) => word !== "" && !tagList.includes(word));



        // setFormDataToSessionStorage([...tagList, ...wordsLeft],'tagList')

        setTagList([...tagList, ...wordsLeft])
        setTagId([...tagList, ...wordsLeft])
        setCurrentTag('')
    }
}

const removeTag = (e, tag) => {

    e.preventDefault();

    const findIndex = tagList.indexOf(tag);

    tagList.splice(findIndex, 1);

    tagId.splice(findIndex, 1);

    setTagRemove(!tagRemove);

}

const selectTag = (e, value) => {

    e.preventDefault();
    e.stopPropagation();
    if (tagList.includes(value.name)) { alertService.showToast('warn', 'Tag is Already Added'); return; }

    setTagList([...tagList, value.name]);

    setTagId([...tagId, value.name]);

    console.log(tagList, value.name)
    // setFormDataToSessionStorage([...tagList, value.name],'tagList')


    setCurrentTag('');

    setTagSuggestion([])
    setShowSuggestion(false);

}

const saveAndClose = (e, blob, id, message, dataURL) => {

    setShowVideo(false);

    if (blob) {

        if (message === 'Record') {

            let videoBlobUrl = URL.createObjectURL(blob);

            setVideoUrl([...videoUrl, { video: videoBlobUrl, id: `video_id_${id}` }])

            // setFormDataToSessionStorage([...videoUrl, { video: videoBlobUrl, id: `video_id_${id}` }],'videoList')

            setVideoData([...videoData, blob]);

        } else {

            let videoBlobUrl = URL.createObjectURL(blob);

            setVideoUrl([...videoUrl, { image: videoBlobUrl, id: `screenshot_id_${id}` }])
            // setFormDataToSessionStorage([...videoUrl, { image: videoBlobUrl, id: `screenshot_id_${id}` }],'imageList')

            setVideoData([...videoData, blob]);

        }

    }

}

const fileExtentsionClassName = (file) => {

console.log(file)
    if (Constants.imageExtensionsList.find(item => item === file.name.split('.').pop().toLowerCase())) {
        return 'file-img-button';
    }
    if (Constants.codeExtensions.find(item => item === file.name.split('.').pop().toLowerCase())) {
        return 'file-code-button';
    }

    if (Constants.archiveExtensions.find(item => item === file.name.split('.').pop().toLowerCase())) {
        return 'file-zip-button';
    }

    if (Constants.documentExtensions.find(item => item === file.name.split('.').pop().toLowerCase())) {

        if (file.name.split('.').pop().toLowerCase() === 'pdf') return 'file-pdf-button'
        return 'file-doc-button';
    }

    if (Constants.cssExtensions.find(item => item === file.name.split('.').pop().toLowerCase())) {
        return 'file-css-button';
    }
};

const getFileContent = () => {

    const divContent = selectedFile.map((file, index) => (
        <div key={index} className='other-file-content'>
            <button type="button" className={`common-message-icons ${fileExtentsionClassName(file)}`} />
            <div className='other-file-content-footer'>
                <div className='id'>{file.name.substring(0, 20)}</div>

                <button className='footer-delete-button' onClick={() => handleDeleteFile(file.name)}></button>

            </div>
        </div>
    ))

    return divContent
}

const handleFileChange = (e) => {

    //  check each file size

    const selectedFilesList = Array.from(e.target.files);


    const selectedFilesTotalSize = convertFileSizeToMB([...selectedFile, ...selectedFilesList].reduce((acc, currentValue) => acc + currentValue.size, 0));

    if (selectedFilesTotalSize > 50) {

        alertService.showToast('warn', 'File size exceeds 50MB');

        return;

    }

    selectedFilesList.map((file) => (
        file.url = URL.createObjectURL(file)
    ))

// setFormDataToSessionStorage([...selectedFile, ...selectedFilesList],'fileList')
    setSelectedFile([...selectedFile, ...selectedFilesList])

}

const handleDeleteFile = (item) => {

    const updatedFileList = selectedFile.filter((file) => file.name !== item);
    setSelectedFile([...updatedFileList])

}

useEffect(() => {

    // const sessionData = getFormDataFromSessionStorage();

    // if(sessionData){
    //     const {topic, description, tagList,priorities,ticketType,videoList,imageList,fileList} = sessionData;
    //     console.log(fileList,videoList,imageList)
    //     setTopic(topic || '')
    //     setTopicDescriptions(description || '')
    //     setTicketType(ticketType ||{ id: 0 } );
    //     setPriorities(priorities || { id: 0 });
    //     setTagId(tagList || []);
    //     setTagList(tagList || []);

        // if(fileList && fileList.length > 0){
        //     setSelectedFile(fileList)
        // }
       
        // if(imageList && imageList.length > 0){
        //     setVideoUrl(imageList)
        // }
        // if(videoList && videoList.length > 0){
        //     setVideoUrl(videoList)
        // }

    // }

    if (panelPosition && panelPosition !== 'Right') {
        let containerWrapper = document.getElementById('iassist-panel');
        if (panelPosition.toLowerCase() === 'left') {
            containerWrapper.style.left = 0;
        } else if (panelPosition.toLowerCase() === 'center') {
            let screenWidth = window.innerWidth;
            containerWrapper.style.left = (screenWidth / 2) - (containerWrapper.offsetWidth / 2) + "px";
        }

    }

    const subheaderAvailable = document.getElementById('app-sub-header');

    if (subheaderAvailable) {

        let conatinerWrapper = document.getElementsByClassName('iassist-panel');

        conatinerWrapper[0].style.top = '65px';

    }


    document.addEventListener("mouseup", (event) => {


        const suggestion = document.getElementById('suggestion');


        if (suggestion && !(suggestion.contains(event.target))) {


            setShowSuggestion(false);

            suggestIndex = -1;

        }
        // const container = document.getElementById('iassist-panel');

        // if ((container && !(container.contains(event.target))) && !checkApptype.current) {

        //     closePanes()

        // }

    })

}, []) // eslint-disable-line

useEffect(() => {

    const subheaderAvailable = document.getElementById('app-sub-header');

    if (subheaderAvailable) {

        let conatinerWrapper = document.getElementsByClassName('iassist-panel');

        conatinerWrapper[0].style.top = '65px';

    }

}, [videoUrl.length])

return (

    <>

        {!showVideo && !chatRoom &&
            <div id='iassist-panel' className='iassist-panel'>
                <div className='iassist-panel-inner'>
                    <div className='iassist-panel-header'>
                        <div className='title-with-breadcrumb'>
                            <h4 className='iassist-header-title' onClick={() => discardChanges()}>iAssist</h4>
                            <div className="breadcrumb">
                                <ul>
                                    <li>New Ticket</li>
                                </ul>
                            </div>
                        </div>

                        <div className='iassist-header-right'>
                            <button onClick={() => {
                                discardChanges(

                                );
                                // closePane()
                            }} className='iassist-header-close'></button>
                        </div>

                    </div>
                    {showLoading && <LoadingScreen />}
                    <div className='iassist-panel-body'>
                        <div className='iassist-create-ticket-wrapper'>
                            <div className='field-w-label'>
                                <label>Topic*
                                    {/* <span className='mandatory-mark'>*</span> */}
                                </label>
                                <div className='field' onClick={() => titleRef.current.focus()}>
                                    <input ref={titleRef} value={topic} onChange={(e) => handleInputChange(e, 'topic')} ></input>
                                    <span className={'max-length'}> {topic !== '' ? topic.length : 0}/{nameMaxChar}</span>
                                </div>
                            </div>
                            <div className='field-w-label'>
                                <label>Tags</label>
                                <div className='field tags' onClick={() => tagRef.current.focus()} >
                                    {tagList.length > 0 && tagList.map((tag, index) => (
                                        <div className={'tag-box'} key={index}>
                                            <div className={'tag-text'}>{tag}</div>
                                            <button className={'close-btn'} onClick={(e) => removeTag(e, tag)}></button>
                                        </div>
                                    ))}

                                    <div className='field-block'>
                                        <input
                                            className='field-control'
                                            ref={tagRef}
                                            value={currentTag}
                                            onChange={(e) => handleInputChange(e, 'tag')}
                                            onKeyUp={onKeyDownEvent}
                                            onBlur={handleFocusOut}

                                        />

                                    </div>

                                    {showSuggestion && <div className='tag-suggestion-container' id='suggestion'>

                                        <>
                                            {tagSuggestion.length > 0 && tagSuggestion.map((suggest, index) => {
                                                return (<li id={`li-${suggest.name}`} style={{ backgroundColor: suggestIndex === index ? 'green' : '', color: suggestIndex === index ? '#fff' : '' }} key={suggest.id} onMouseDown={(e) => {
                                                    e.stopPropagation();
                                                    selectTag(e, suggest)
                                                }}>{suggest.name}</li>)
                                            })}
                                        </>

                                    </div>}
                                </div>
                            </div>
                            <div className='field-w-label'>
                                <label>Description*
                                    {/* <span className='mandatory-mark'>*</span> */}
                                </label>
                                <div className='field textarea'>
                                    <textarea
                                        value={topicDescriptions}
                                        // rows={totalRowsForTextarea}
                                        onChange={(e) => handleInputChange(e, 'description')}></textarea>
                                    {/* <div className={'max-length'}> {topicDescriptions !== '' ? topicDescriptions.length : 0}/{descriptionMaxChar}</div> */}
                                </div>
                            </div>

                            <div className='field-w-label'>
                                <label className='mandatory-mark'>Type*</label>

                                <div className='options-wrapper'>

                                    {
                                        ticketTypeList.map(ticket => (
                                            <button
                                                key={ticket.id}
                                                className={`option ${+ticketType.id === +ticket.id ? ' active' : ''}`}
                                                onClick={(item) => categorySelect(item, ticket)}
                                            >
                                                {ticket.name}
                                            </button>
                                        ))
                                    }

                                </div>

                            </div>

                            <div className='field-w-label'>
                                <label className='mandatory-mark'>Priority*</label>

                                <div className='options-wrapper'>
                                    {
                                        priorityTypeList.map(priority => (
                                            <button
                                                key={priority.id}
                                                className={`option ${+priorities.id === +priority.id ? ' active' : ''}`}
                                                onClick={(item) => selectPriority(item, priority)}
                                            >
                                                {priority.value}
                                            </button>
                                        ))
                                    }
                                </div>

                            </div>
                            <div className='iassist-record-wrapper'>

                                <div className='iassist-record-header'>

                                    <div className='text'>Capture current tab</div>

                                    <div className='iassist-record-button'>

                                        <button onClick={() => {
                                            setDisplayMessage('Record');
                                            setShowVideo(true);
                                        }} className='record'>Record</button>

                                        <button onClick={() => {
                                            setDisplayMessage('Shot');
                                            setShowVideo(true);
                                        }} className='shot'>Screenshot</button>



                                        <div className="file-input-wrapper">
                                            <button className='file-upload-button'></button>
                                            <input
                                                type="file"
                                                id="myFileInput"
                                                className='iassist-file-input'
                                                name="myfile"
                                                onChange={handleFileChange}
                                                accept='image/*,
                                                    video/*,
                                                    audio/*,
                                                    .css,
                                                    .scss,
                                                    .less,
                                                    .jsx,
                                                    application/pdf,
                                                    application/msword,
                                                    application/vnd.openxmlformats-officedocument.wordprocessingml.document,
                                                    application/vnd.ms-excel,
                                                    application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
                                                    application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,
                                                    application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation,application/zip,application/x-7z-compressed,application/x-rar-compressed,application/x-tar,application/x-bzip,application/x-bzip2,application/x-zip,application/x-zip-compressed,.icns,
                                                    text/html,application/xhtml+xml,application/xml,text/plain,application/json,application/javascript,image/svg+xml'
                                                multiple />
                                            <label htmlFor="myFileInput">File Upload</label>
                                        </div>


                                    </div>

                                </div>

                                {(videoUrl.length > 0 || (selectedFile.length > 0)) &&
                                    <div className='iassist-video-content-wrapper'>
                                        {videoUrl.map((vid, index) => {
                                            return <div key={vid.id} className='vid-content'>

                                                {vid.video && <video src={vid.video} controls></video>}

                                                {vid.image && <img alt="" src={vid.image}></img>}

                                                <div className='footer'>

                                                    <div className='id'>{vid.id} </div>

                                                    <button className='footer-delete-button' onClick={() => {
                                                        videoUrl.splice(index, 1)
                                                        videoData.splice(index, 1);
                                                        setDeleteSavedItem(!deleteSavedItem);
                                                    }}>

                                                    </button>

                                                </div>

                                            </div>

                                        })}

                                        {
                                            selectedFile.length > 0 && getFileContent()
                                        }

                                    </div>}

                                {(videoUrl.length === 0 && !selectedFile.length) && <span className='not-found'>No file attached</span>}

                            </div>

                        </div>
                    </div>
                    <div className='iassist-submit-wrapper'>
                        <button className='btn-with-icon btn-small btn-approve' disabled={disableCreate} onClick={createRoom}><i></i><span>Create</span></button>

                        <button className="btn-with-icon btn-small btn-cancel-white" disabled={disableCancel} onClick={() => discardChanges()}><i></i><span>Cancel</span></button>

                    </div>
                </div>
                {openPopUp &&
                    <div className='iassist-panel-popup-wrapper'>

                        <div className='details'> Are you sure you want to discard changes? </div>
                        <div className='iassist-panel-btn'>
                            <button className='btn-with-icon btn-small btn-approve' onClick={() => {
                                closeCreateTicket();
                                // getTopicsBasedOnFilter();
                            }}><i></i><span>Confirm</span></button>

                            <button className="btn-with-icon btn-small btn-cancel-white" onClick={() => setOpenPopUp(false)}><i></i><span>Cancel</span></button>
                        </div>

                    </div>}
            </div>


        }
        {!showVideo && chatRoom &&
            <ChatRoom
                closePane={closePanes}
                chatIds={chatId}
                unRead={0}
                topicDetail={currentCreatedTicketData}
                type={ticketTypeList}
                allUser={userData}
                allAccount={[accountData]}
                activity={true}
                socketDetail={socketDetail}
                panelPosition={panelPosition}
                platformId={platformId}
                closeChatScreen={closeCreateTicket}
                getTopicsBasedOnFilter={getTopicsBasedOnFilter}
                refresh={refresh}
                refreshState={refreshState}
                tabStatus={tabStatus}
            />
        }

        {showVideo && !chatRoom &&
            <VideoRecord
                save={saveAndClose}
                close={setShowVideo}
                message={displayMessage} />}

    </>

)
}

export default CreateChatRoom;
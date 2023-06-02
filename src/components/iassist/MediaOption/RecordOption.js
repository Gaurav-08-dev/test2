import React from 'react';
import VideoLoader from '../Player/videoLoader';
import './RecordOption.scss';
import alertService from '../../../services/alertService';

const RecordOption = (
    {
        setShowVideo,
        setDisplayMessage, 
        showScreenButton, type, 
        videoUrl, 
        setDeleteSavedItem, 
        deleteSavedItem, 
        loader,
        dataUrl,
        handleFileChange,
        disableSendButton,
        selectedFile,
        fileExtentsionClassName,
        handleDeleteFile,
        fileInputRef

    }) => {


        const alertFileCountExceeded=()=>{

            const msg='You can upload maximum 5 files at a time'

            if([...videoUrl,...selectedFile].length >= 5){ 
                fileInputRef.current.value = null;

                if(document.getElementsByClassName('toast-wrapper')[0]?.children[1]?.textContent.trim() !== msg) alertService.showToast('error', msg);
                return true;
        }

            return false;
        }


    return (

        <>

            {videoUrl.length > 0 &&

                <div id='video-content-wrapper' className={type === 'reply' ? 'video-url' : ''}>

                    {videoUrl.map((vid, index) => {
                        return <div key={vid.id} className='vid-content'>

                            {vid.video && <video id='video' src={vid.video} controls></video>}

                            {vid.image && <img id='img' alt='' src={vid.image}></img>}

                            {loader && <VideoLoader />}

                            <div className='footer'>

                                <div className='id'>{vid.id} </div>

                                <button onClick={() => {
                                   videoUrl && videoUrl.length > 0 && videoUrl.splice(index, 1)
                                    dataUrl && dataUrl.length > 0 && dataUrl.splice(index, 1);
                                    setDeleteSavedItem(!deleteSavedItem);
                                }}></button>

                            </div>

                        </div>

                    })}
                </div>
            }

            {
                selectedFile.length > 0 && selectedFile.map((file, index) => (
                    <div key={index} className='wrapper-media'>
                        <div className='iassist-icon-wrapper'>
                            <button className={`iassist-file ${fileExtentsionClassName(file.name.split('.').pop().toLowerCase())}`} />
                        </div>

                        <div className='wrapper-media-footer'>
                            <div className='media-id'>{file.name.length > 20 ? file.name.substring(0, 15) : file.name.substring(0,10)}</div>
                            <button className='iassist-icon-delete' disabled={disableSendButton} onClick={() => {
                                handleDeleteFile( file, type)
                            }
                            }></button>
                        </div>
                    </div>))
            }

            {showScreenButton &&
                <div className='screen-wrapper' style={type === 'reply' ? { bottom: '25px' } : { bottom: '30px' }} id='record'>
                    <div className='screen-record' onClick={() => {
                        if(alertFileCountExceeded()) return null;
                        setShowVideo(true);
                        setDisplayMessage('Record');
                    }}> Record Screen </div>

                    <div className='screen-shot' onClick={() => {
                        if(alertFileCountExceeded()) return null;
                        setShowVideo(true);
                        setDisplayMessage('Shot');
                    }}> Take Screenshot</div>

                    <div className='file-input-parent-wrapper'>

                        <div className="file-input-wrapper">
                        <button className='file-upload-button'></button>
                            <input
                        
                            ref={fileInputRef}
                                disabled={disableSendButton}
                                type="file"
                                id="myFileInput"
                                className='iassist-file-input'
                                name="myfile"
                                onChange={(e) => handleFileChange(e, type)}
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

                </div>}

        </>
    )
}

export default RecordOption;
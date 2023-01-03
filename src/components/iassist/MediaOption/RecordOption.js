import React from 'react';
import VideoLoader from '../Player/videoLoader';
import './RecordOption.scss';

const RecordOption = (
    {
        setShowVideo, setDisplayMessage, showScreenButton, type, videoUrl, setDeleteSavedItem, deleteSavedItem, loader
    }) => {


    return (

        <>

            {videoUrl.length > 0 && <div id='video-content-wrapper' className={type === 'reply' ? 'video-url' : ''}>

                {videoUrl.map((vid, index) => {
                    return <div key={vid.id} className='vid-content'>

                        {vid.video && <video id='video' src={vid.video} controls></video>}

                        {vid.image && <img id='img' alt='' src={vid.image}></img>}

                        {loader && <VideoLoader />}

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

            {showScreenButton && <div className='screen-wrapper' style={type === 'reply' ? { left: '85px', bottom: '25px' } : { bottom: '30px' }} id='record'>
                <div className='screen-record' onClick={() => {
                    setShowVideo(true);
                    setDisplayMessage('Record');
                }}> Record Screen </div>

                <div className='screen-shot' onClick={() => {
                    setShowVideo(true);
                    setDisplayMessage('Shot');
                }}> Take Screenshot</div>

            </div>}

        </>
    )
}

export default RecordOption;
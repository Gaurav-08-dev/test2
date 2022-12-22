import { useEffect, useRef, useState } from 'react';
import './Player.scss';
import VideoLoader from './videoLoader';

const Player = ({ url, id, type, close }) => {

    const initialLoad = useRef(false);

    const [showLoader, setShowLoader] = useState(true);

    useEffect(() => {

        let video = document.getElementById('vid-player');

        if (video) {

            video.play();

            video.currentTime = 1000000000;

            video.onended = () => {

                if (!initialLoad.current) {

                    setShowLoader(false);

                    video.play();

                    video.controls = true;

                    initialLoad.current = true;

                    video.currentTime = 0;

                }

            }

        }

    }, [])

    return (<div className='modal'>

        <div className='overlay'>
        </div>

        <div className='modal-content'>

            <div id={id} className='player-wrapper'>

                <div className='close-btn'><button onClick={() => close(false)}>close</button></div>

                {type === 'image' && <img src={url}></img>}

                {type === 'video' && <video src={url} id='vid-player' preload='auto'></video>}

                {type === 'video' && showLoader && <VideoLoader />}

            </div>

        </div>

    </div>)
}

export default Player;
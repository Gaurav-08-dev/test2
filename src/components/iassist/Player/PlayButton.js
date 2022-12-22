
import './PlayButton.scss';

const PlayButton = ({ handleClick, file }) => {

    return (<div id='play' onClick={() => handleClick(file)}>

        <div className='button-play'></div>

    </div>)
}

export default PlayButton;
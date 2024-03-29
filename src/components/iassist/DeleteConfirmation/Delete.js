import React, { useEffect, useState } from 'react';
import './Delete.scss';

let buttonDisable = false;

const Delete = ({ deleteTopic, setConfirmDelete, topic, disable, isScrollWhenDelete }) => {

    const [changeButtonStatus, setChangeButtonStatus] = useState(false);

    const deleteButtonClick = (e) => {

        if(isScrollWhenDelete) isScrollWhenDelete();

        buttonDisable = true;

        disable(false);

        deleteTopic(e, topic)

    }

    useEffect(() => {

        buttonDisable = false;

        setChangeButtonStatus(!changeButtonStatus);

    }, [topic.id]) // eslint-disable-line

    return (
        <div className='del-wrapper'>

            <div className='details'> Are you sure you want to delete this ticket?</div>

            <button className='confirm-btn' disabled={buttonDisable} onClick={(e) => deleteButtonClick(e)}>Confirm</button>

            <button onClick={() => {
                if(isScrollWhenDelete) isScrollWhenDelete();
                setConfirmDelete(false);
                disable(false);

            }}>Cancel</button>

        </div>

    )
}

export default Delete;
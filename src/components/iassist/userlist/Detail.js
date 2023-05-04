import React from 'react';
import * as Constants from '../../Constants';
import './Detail.scss'
import { getUserNameBasedOnId, getUserNameImage } from '../Utilityfunction';

const Detail = ({ topic, allUser, type, allAccount }) => {

    const getType = (id) => {

        let data = type?.filter((types) => { // eslint-disable-line 

            if (types.id === id) {
                return types
            }

        })

        return data[0]?.name;
    }

    return (
        <div className='iassist-detail-wrapper'>
            <div className='iassist-user'>
                <div className='user-image'>{getUserNameImage(allUser,topic.user_id,'','detail')}</div>
                <div className='user-name'>{getUserNameBasedOnId(allUser,topic.user_id,'detail')} </div>
            </div>
            <div className='divider'></div>

            <span className='user-date'>{Constants.months[new Date(topic.created_at).getMonth()]} {new Date(topic.created_at).getDate()} {new Date(topic.created_at).getFullYear()}</span>
            <div className='divider'></div>
            
            <div className='user-type'>{getType(topic.ticket_type_id)}</div>
            <div className='divider'></div>
            <div className='user-ticket'>{allAccount.length > 0 && allAccount[0]?.name?.substring(0, 3)}-{topic.id}</div>
            
        </div>
    )
}

export default Detail;
import React from 'react';
import * as Constants from '../../Constants';
// import Avatar from '../../Avatar/Avatar';
import './Detail.scss'
import { getUserNameBasedOnId, getUserNameImage } from '../Utilityfunction';

const Detail = ({ topic, allUser, type, allAccount }) => {


    // const getUserNameBasedOnId = (id) => {

    //     if (allUser.length > 0) {

    //         let userName;

    //         for (let i = 0; i < allUser.length; i++) {

    //             if (allUser[i].id === id) {

    //                 userName = allUser[i].first_name + ' ' + (allUser[i].last_name !== null ? allUser[i].last_name : '');

    //                 break;
    //             }

    //         }

    //         return userName;
    //     }
    // }

    // const getUserNameImage = (id) => {

    //     let user;
        
    //     let clientUser = allUser;

        
    //     if (clientUser.length > 0) {
            
    //         for (let i = 0; i < clientUser.length; i++) {
                
    //             if (clientUser[i].id === id) {
                    
    //                 user = clientUser[i];
                    
    //                 break;
                    
    //             }
                
    //         }


            
    //         if (user) {
    //             return <Avatar imgSrc={user.cover_img_url}
    //                 firstName={user.first_name}
    //                 lastName={user.last_name}
    //                 alt={`${user.first_name}'s pic`}
    //                 height={20}
    //                 width={20}
    //                 fontSize={9}
    //                 borderRadius='2px'
    //             />

    //         }

    //     }
    // }

    const getType = (id) => {

        // console.log(type.filter(item=>{
        //     return item.id===id
        // }))

        let data = type?.forEach((types) => {

            if (types.id === id) {

                return types

            }

        })

        return data[0]?.name;
    }

    return (
        <div className='detail-wrapper'>
            <div className='user'>
                <div className='user-image'>{getUserNameImage(allUser,topic.user_id,'','detail')}</div>
                <div className='user-name'>{getUserNameBasedOnId(allUser,topic.user_id,'detail')} </div>
            </div>
            <div className='divider'></div>

            <span className='user-date'>{Constants.months[new Date(topic.created_at).getMonth()]} {new Date(topic.created_at).getDate()} {new Date(topic.created_at).getFullYear()}</span>
            <div className='divider'></div>
            
            <div className='user-type'>{getType(topic.ticket_type_id)}</div>
            <div className='divider'></div>

            <div className='user-ticket'>{allAccount.length > 0 && allAccount[0].name.substring(0, 3)}-{topic.id}</div>
            
        </div>
    )
}

export default Detail;
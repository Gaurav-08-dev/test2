import Avatar from "../Avatar/Avatar";
import React from 'react';

export const getUserNameBasedOnId = (userList, id, type) => {

    if (userList.length > 0) {

        let userName;

        for (let i = 0; i < userList.length; i++) {

            if (userList[i].id === id) {

                if (type === 'detail')
                    userName = userList[i].first_name + ' ' + (userList[i].last_name !== null ? userList[i].last_name : '');

                if (type === 'message_detail')
                    userName = userList[i].first_name;


                break;
            }

        }

        return userName;
    }
}


export const getUserNameImage = (userList, id, isReply ,type) => {

    let user;

    if (userList?.length > 0) {

        for (let i = 0; i < userList.length; i++) {

            if (userList[i].id === id) {

                user = userList[i];

                break;

            }

        }



        if (user) {

            if(type==='detail'){

                return <Avatar imgSrc={user.cover_img_url}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    alt={`${user.first_name}'s pic`}
                    height={20}
                    width={20}
                    fontSize={9}
                    borderRadius='2px'
                />
            }

            if(type==='message_detail'){
            return <div className='chat-avatar'>
                <Avatar imgSrc={user.cover_img_url}
                    firstName={user.first_name}
                    lastName={user.last_name}
                    alt={`${user.first_name}'s pic`}
                    height={30}
                    width={30}
                    fontSize={12} 

                    />
            </div>
            }

        }

    }

}
import React,{ useEffect, useState } from 'react';
import alertService from '../../../services/alertService';
import APIService from '../../../services/apiService';
import { getToken } from '../../../utils/Common';
import * as Constants from '../../Constants';
import Avatar from '../../Avatar/Avatar';
import './UserList.scss'


// user => user array list
// position => 'absolute' or 'relative'
// header => boolean , we need header or not
// userSelect => method to call when user got select
// collaborator => selected userList
// close =>  close the pane
const UserList = ({clientUser, supportUser, position, header, userSelect, collaborator, close, author, id, topic }) => {

    const [userDetail, setUserDetails] = useState(clientUser ? clientUser : []);

    const [UserData, setUserData] = useState([]);

    const [supportUsers, setSupportUsers] = useState(supportUser ? supportUser : []);

    const [selectedUser, setSelectedUser] = useState(clientUser ? clientUser : []);

    const [showSupport, setShowSupport] = useState(false);

    const [collabs, setCollabs] = useState(collaborator ? collaborator : []);

    const [disable, setDisable] = useState(false);


    const getUsers = async () => {

        // let user = getUser();

        let Id = topic.account_id;

        const jwt_token = getToken();

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + 'account_id/?account_id=' + Id, null, false, 'GET', null, token)
            .then(response => {
                if (response) {

                    let result = response;

                    // if (result.message === 'Success') {

                        setUserData(result);

                    // }
                }

            })
            .catch(err => {

                alertService.showToast('error', err.msg);
            });
    }

    useEffect(() => {

        if (UserData.length === 0) {

            getUsers();

        }

    }, [])

    const GetSearchUser = (e) => {

        if (e.target.value !== '') {

            let data = UserData.filter((usr, index) => {

                if (usr.user_name.toLowerCase().includes(e.target.value.toLowerCase())) {

                    return usr;

                }

            })

            setUserDetails(data);

        } else {

            setUserDetails(selectedUser);

        }

    }

    const selectusers = (e, user) => {

        setDisable(true);

        userSelect(e, user.id, true);

        setSelectedUser([...selectedUser, user]);

        collabs.push(user.id);

        setDisable(false)

    }

    const removeUser = async(e, user) => {

        setDisable(true);

        let index = selectedUser.findIndex((usr) => usr.id === user.id);

        let collabIndex = collabs.findIndex((collab) => collab === user.id)

        if (collabIndex !== -1) {

            collabs.splice(collabIndex, 1);

        }

        if (index !== -1) {

            selectedUser.splice(index, 1);

        }

        await userSelect(e, user.id, false)

        setDisable(false);

    }


    return (

        <div id='modal'>

            <div id='overlay'>
            </div>

            <div id='modal-content'>

                <div className={"main-wrapper" + " " + position} id={id}>

                    {header && <div className='header-wrapper'>

                        <div className='header-inner'>Manage Team</div>

                        <button className='header-close' onClick={() => close(false)}></button>

                    </div>}

                    {!header && <div className='title'>Add members from your team to this ticket.</div>}

                    <div className='search-wrapper'>

                        <div className='topic-filter-search'>

                            <div className='search'>

                                <button className='btn' title='search'></button>

                                <input type={'text'} title='Search' onChange={GetSearchUser} />

                            </div>

                        </div>

                    </div>

                    <div className='user-list-widget'>

                        {header && <div className='user-heading'>Your Team</div>}

                        {userDetail.length > 0 && userDetail.map((users) => {
                            return (
                                <div className='field-wrapper' key={users.id}>
                                    <Avatar imgSrc={users.cover_img_url}
                                        firstName={users.first_name}
                                        lastName={users.last_name}
                                        alt={`${users.first_name}'s pic`}
                                        height={20}
                                        width={20}
                                        fontSize={9}
                                        borderRadius={2} />

                                    <span className='name'>{users.first_name} {users.last_name}</span>


                                    <div className='user-button'>

                                        {!collabs.includes(users.id) && users.id !== author && <button className='add' disabled={disable} onClick={(e) => selectusers(e, users)}>Add</button>}

                                        {collabs.includes(users.id) && users.id !== author && <button className='remove' disabled={disable} onClick={(e) => removeUser(e, users)}>Remove</button>}

                                    </div>

                                </div>
                            )
                        })}

                        {userDetail.length === 0 && <div style={{ color: '#B1B2B3' }}>No members added yet</div>}

                    </div>

                    {showSupport && <div className='support-user-list-widget'>

                        {header && <div className='user-heading'>Support Agents</div>}

                        {supportUsers.length > 0 && supportUsers.map((users) => {
                            return (
                                <div className='field-wrapper' key={users.id}>
                                    <Avatar imgSrc={users.cover_img_url}
                                        firstName={users.first_name}
                                        lastName={users.last_name}
                                        alt={`${users.first_name}'s pic`}
                                        height={20}
                                        width={20}
                                        fontSize={9}
                                        borderRadius={2} />

                                    <span className='name'>{users.first_name} {users.last_name}</span>

                                </div>
                            )
                        })}

                        {supportUsers.length === 0 && <div className='alert'>No support Agents Assigned</div>}

                    </div>}

                </div>

            </div>

        </div>

    )
}

export default UserList;
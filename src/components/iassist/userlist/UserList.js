import React, { useEffect, useState, useRef } from 'react';
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
const UserList = ({ clientUser, supportUser, position, header, userSelect, collaborator, close, author, id, topic }) => {

    const [userDetail, setUserDetails] = useState(clientUser ? clientUser : []);

    const [UserData, setUserData] = useState([]);

    // const supportUsers = useRef(supportUser ? supportUser : []);

    const [selectedUser, setSelectedUser] = useState(clientUser ? clientUser : []);

    // const showSupport = useRef(false);

    const collabs = useRef(collaborator ? collaborator : []);

    const [disable, setDisable] = useState(false);


    const getUsers = async () => {


        let Id = topic.account_id;

        const jwt_token = getToken();

        const appConfigId = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'config_app_id');

        const token = `Bearer ${jwt_token}`;

        APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `account_id/?account_id=${Id}&app_id=${appConfigId}`, null, false, 'GET', null, token)
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

    const selectusers = async (e, user) => {

        setDisable(true);

        await userSelect(e, user.id, true, setDisable);

        setSelectedUser([...selectedUser, user]);

        collabs.current.push(user.id);

        //setDisable(false)

    }

    const removeUser = async (e, user) => {

        setDisable(true);

        let index = selectedUser.findIndex((usr) => usr.id === user.id);

        let collabIndex = collabs.current.findIndex((collab) => collab === user.id)

        if (collabIndex !== -1) {

            collabs.current.splice(collabIndex, 1);

        }

        if (index !== -1) {

            selectedUser.splice(index, 1);

        }

        await userSelect(e, user.id, false, setDisable)

        // setDisable(false);

    }


    return (

        <div id='modal'>

            <div id='overlay'>
            </div>

            <div id='modal-content'>

                <div className={"main-wrapper"} id={id}>

                    {header && <div className='iassist-panel-header'>
                        <h4 className='iassist-header-title'>Manage Team</h4>
                        <button className='iassist-header-close' onClick={() => close(false)}></button>
                    </div>}

                    {!header && <div className='title'>Add members from your team to this ticket.</div>}

                    <div className='iassist-panel-body'>
                        <div className='search-wrapper'>
                            <div className='topic-filter-search'>
                                <div className='search'>
                                    <button className='btn' title='search'></button>
                                    <input placeholder='Find and add team members' type={'text'} title='Search' onChange={GetSearchUser} />
                                </div>
                            </div>
                        </div>
                        <div className='user-list-widget'>
                            {header && <div className='user-heading'>Client Team</div>}
                            <div className='user-list-wrapper'>
                                {userDetail.length > 0 && userDetail.map((users) => {
                                    return (
                                        <div className='user-list-field-wrapper' key={users.id}>
                                            <div className='left'>
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

                                            <div className='user-button'>
                                                {!collabs.current.includes(users.id) && users.id !== author && <button className='add' disabled={disable} onClick={(e) => selectusers(e, users)}>Add</button>}
                                                {collabs.current.includes(users.id) && users.id !== author && <button className='remove' disabled={disable} onClick={(e) => removeUser(e, users)}>Remove</button>}
                                            </div>

                                        </div>
                                    )
                                })}
                            </div>
                            {userDetail.length === 0 && <div style={{ color: '#B1B2B3' }}>No members added yet</div>}
                        </div>
                    </div>


                    {/* support agensts list commented as it's no more required as per design */}
                    {/* {showSupport.current && <div className='support-user-list-widget'>

                        {header && <div className='user-heading'>Support Agents</div>}

                        {supportUsers.current.length > 0 && supportUsers.current.map((users) => {
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

                        {supportUsers.current.length === 0 && <div className='alert'>No support Agents Assigned</div>}

                    </div>} */}

                </div>

            </div>

        </div>

    )
}

export default UserList;
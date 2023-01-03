import React, { useEffect, useState } from 'react';
// import './Feedback.scss';
import * as Constants from '../../Constants';
import { getTokenClient } from '../../../utils/Common';
import APIService from '../../../services/apiService';
import alertService from '../../../services/alertService';


const TicketReopen = ({ closePane, id, ticket, disableButton, allTopic, className, Topic, setLoader }) => {

    const [suggestion, setSuggestion] = useState('');

    const [changeButtonStatus, setChangeButtonStatus] = useState(false);

    const [disabledButton, setDisabledButton] = useState(false);

    const [disableCancel, setDisableCancel] = useState(false);

    const removeFeedbackField = () => {

        setSuggestion('');

        closePane();

        if (disableButton) {

            disableButton(false);

        }

    }

    useEffect(() => {

        setDisabledButton(false);

        setChangeButtonStatus(!changeButtonStatus);

    }, [id])

    const submitReOpen = () => {

        let checkSuggestion = suggestion.trim();

        if (checkSuggestion !== '') {

            setLoader(true);

            setDisabledButton(true);

            setDisableCancel(true);

            let data = {
                topic_id: id,
                reason: suggestion
            }

            const jwt_token = getTokenClient();

            const token = `Bearer ${jwt_token}`;

            if (token) {

                APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `reopen_reason/`, data, false, 'POST', null, token)
                    .then(response => {

                        if (response) {

                            setLoader(false);

                            if (Topic) {

                                Topic.status_id = 1;

                            }

                            if (disableButton) {

                                disableButton(false);

                            }

                            setDisableCancel(false);

                            let result = response;

                            if (result.message) {

                                alertService.showToast("success", result.message);

                                if (allTopic?.length > 10) {

                                    let index = allTopic.findIndex((topic) => {

                                        return topic.id === id;

                                    })

                                    allTopic.splice(index, 1);

                                } else {

                                    if (ticket) {

                                        ticket();

                                    }

                                }

                                closePane();

                            }

                        }

                    })
                    .catch(err => {

                        setLoader(false);

                        closePane();

                        alertService.showToast('error', err.msg);

                    });

            }

        } else {

            if (suggestion === '') {

                setDisabledButton(true);

                alertService.showToast('warn', 'reason for reopen are Required')

            }

        }

    }

    return (
        <div className={"main-wrappers" + (className ? className : '')}>

            <div className='content-wrapper'>

                <div className='description'>

                    You are about to <span>Re-Open</span>, a resolved ticket, please submit a reason to process your request.

                </div>

                <textarea className='textarea' value={suggestion} placeholder='Your Message' onChange={(e) => {
                    setDisabledButton(e.target.value?.trim() !== '' ? false : true);
                    setSuggestion(e.target.value);
                }}></textarea>

            </div>

            <div className='submit-wrapper'>

                {<button className='btn-with-icon btn-small btn-approve' disabled={disabledButton} onClick={submitReOpen}><i></i><span>Confirm</span></button>}

                <button className='btn-with-icon btn-small btn-cancel-white' disabled={disableCancel} onClick={removeFeedbackField}><i></i><span>Cancel</span></button>

            </div>

        </div>
    )
}

export default TicketReopen;
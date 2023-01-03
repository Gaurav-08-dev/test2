import React, { useEffect, useState } from 'react';
import alertService from '../../../services/alertService';
import APIService from '../../../services/apiService';
import { getTokenClient } from '../../../utils/Common';
// import './Feedback.scss'
import * as Constants from '../../Constants';

const FeedBack = ({ closePane, id, ticket, className, disabledButton, allTopic, Topic, setLoader }) => {

    const [feedbackValue, setFeedBackValue] = useState('');

    const [suggestion, setSuggestion] = useState('');

    const [changeButtonStatus, setChangeButtonStatus] = useState(false);

    const [disableButton, setDisableButton] = useState(false);

    const [disableCancel, setDisableCancel] = useState(false);


    const removeFeedbackField = () => {

        setFeedBackValue('');

        setSuggestion('');

        disabledButton(false);

        closePane();

    }

    useEffect(() => {

        setDisableButton(false);

        setChangeButtonStatus(!changeButtonStatus);

    }, [id])

    const submitFeedback = () => {

        if (feedbackValue !== '') {

            setLoader(true);

            setDisableButton(true);

            setDisableCancel(true);

            let data = {
                topic_id: id,
                feedback: feedbackValue.toLowerCase() === 'unsatisfied' ? 'unsatisfied' : feedbackValue.toLowerCase(),
                feedback_text: suggestion
            }

            const jwt_token = getTokenClient();

            const token = `Bearer ${jwt_token}`;

            if (token) {
                APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `feedback/`, data, false, 'POST', null, token)
                    .then(response => {

                        if (response) {

                            setLoader(false);

                            if (disabledButton) {

                                disabledButton(false);

                            }

                            if (Topic) {

                                Topic.status_id = 3;

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

                        setLoader(false)

                        closePane();

                        alertService.showToast('error', err.msg);

                    });
            }


        } else {

            setDisableButton(true);

            // validateRequiredDetails('create', false, suggestion);

        }

    }

    const feedBackClick = (e, type) => {
        setDisableButton(false);
        setFeedBackValue(type)
    }

    return (
        <div className={"main-wrappers" + (className ? className : '')}>

            <div className='content-wrapper'>

                <div className='description'>

                    Before you mark this ticket as <span>Resolved</span>, please provide your feedback on our customer service.

                </div>

                <div className='feedback'>

                    <span style={{ background: feedbackValue === 'Amazing' ? '#FFFFFF' : '', color: feedbackValue === 'Amazing' ? '#000000' : '', border: feedbackValue === 'Amazing' ? '0px' : '1px solid #fff' }} onClick={(e) => feedBackClick(e, 'Amazing')}>
                        Amazing</span>

                    <span style={{ background: feedbackValue === 'Satisfied' ? '#FFFFFF' : '', color: feedbackValue === 'Satisfied' ? '#000000' : '', border: feedbackValue === 'Satisfied' ? '0px' : '1px solid #fff' }} onClick={(e) => feedBackClick(e, 'Satisfied')}>
                       Satisfied</span>

                    <span style={{ background: feedbackValue === 'Neutral' ? '#FFFFFF' : '', color: feedbackValue === 'Neutral' ? '#000000' : '', border: feedbackValue === 'Neutral' ? '0px' : '1px solid #fff' }} onClick={(e) => feedBackClick(e, 'Neutral')}>
                        Neutral</span>

                    <span style={{ background: feedbackValue === 'Unsatisfied' ? '#FFFFFF' : '', color: feedbackValue === 'Unsatisfied' ? '#000000' : '', border: feedbackValue === 'Unsatisfied' ? '0px' : '1px solid #fff' }} onClick={(e) => feedBackClick(e, 'Unsatisfied')}>
                        Unsatisfied</span>

                </div>
                <textarea className='textarea' value={suggestion} placeholder='Your Message' onChange={(e) => {
                    setSuggestion(e.target.value)
                }
                }></textarea>

            </div>

            <div className='submit-wrapper'>

                {<button className='btn-with-icon btn-approve btn-small' disabled={disableButton} onClick={submitFeedback}><i></i><span>Confirm</span></button>}

                <button className='btn-with-icon btn-cancel-white btn-small' disabled={disableCancel} onClick={removeFeedbackField}><i></i><span>Cancel</span></button>

            </div>

        </div>
    )
}

export default FeedBack;
import React, { useEffect, useState } from 'react';
import alertService from '../../../services/alertService';
import APIService from '../../../services/apiService';
import { getTokenClient } from '../../../utils/Common';
import './Feedback.scss'
import * as Constants from '../../Constants';

const FeedBack = ({ closePane, 
    id, 
    ticket, 
    className, 
    disabledButton, 
    allTopic, 
    topic, 
    setLoader, placeHolders, getTopicsBasedOnFilter,rejectRequestActive,rejectRequest,setRejectRequestActive,
    closeChatId
 }) => {

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
        setRejectRequestActive(false)



    }

    useEffect(() => {

        setDisableButton(false);

        setChangeButtonStatus(!changeButtonStatus);

    }, [id]) //eslint-disable-line

    const submitFeedback = () => {

        setDisableButton(true);

        setDisableCancel(true);


        if(rejectRequestActive && suggestion !== ''){


            const topicId=id;
            const declineReason=suggestion;
            rejectRequest(topicId,declineReason);
            return;
        }
        else if(rejectRequestActive && suggestion === ''){
            setDisableButton(false)
            setDisableCancel(false)
            alertService.showToast("warn", "Select appropriate reason to reject this request");
        }


        if (feedbackValue !== '') {

            setLoader(true);

            

            let data = {
                topic_id: id,
                feedback: feedbackValue.toLowerCase() === 'unsatisfied' ? 'unsatisfied' : feedbackValue.toLowerCase(),
                feedback_text: suggestion
            }

            const jwt_token = getTokenClient();

            const isCloseTicketRequest = closeChatId?`?request_chat_id=${closeChatId}`:'';

            const token = `Bearer ${jwt_token}`;

            const platform = sessionStorage.getItem(Constants.SITE_PREFIX_CLIENT + 'platform');

            if (token) {
                APIService.apiRequest(Constants.API_IASSIST_BASE_URL + `${platform}/feedback/${isCloseTicketRequest}`, data, false, 'POST', null, token)
                    .then(response => {

                        if (response) {

                           if (getTopicsBasedOnFilter) getTopicsBasedOnFilter(undefined, 1);

                            setLoader(false);

                            if (disabledButton) {

                                disabledButton(false);

                            }

                            if (topic) {

                                topic.status_id = 3;

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

            setDisableButton(false)
            setDisableCancel(false)

            alertService.showToast("warn", "Select appropriate feedback to close this ticket");

        }

    }

    const feedBackClick = (e, type) => {
        setDisableButton(false);
        setFeedBackValue(type)
    }

    return (
        <div className={"main-wrappers" + (className ? className : '')}>

            <div className='iassist-content-wrapper'>

                <div className='description'>

                {!rejectRequestActive && <>Before you mark this ticket as <span>Resolved</span>, please provide your feedback on our customer service.</>}

                {rejectRequestActive &&   <> You are about to decline a request for resolution of a ticket, please submit a reason.</>}

                </div>

                {!rejectRequestActive && <div className='feedback'>
                    
                    <span style={{ background: feedbackValue === 'Amazing' ? '#FFFFFF' : '', color: feedbackValue === 'Amazing' ? '#000000' : '', borderColor: feedbackValue === 'Amazing' ? '#fff' : '#b1b2b3' }} onClick={(e) => feedBackClick(e, 'Amazing')}>
                        Amazing</span>

                    <span style={{ background: feedbackValue === 'Satisfied' ? '#FFF' : '', color: feedbackValue === 'Satisfied' ? '#000000' : '', borderColor: feedbackValue === 'Satisfied' ? '#fff' : '#b1b2b3' }} onClick={(e) => feedBackClick(e, 'Satisfied')}>
                       Satisfied</span>

                    <span style={{ background: feedbackValue === 'Neutral' ? '#FFFFFF' : '', color: feedbackValue === 'Neutral' ? '#000000' : '', borderColor: feedbackValue === 'Neutral' ? '#fff' : '#b1b2b3' }} onClick={(e) => feedBackClick(e, 'Neutral')}>
                        Neutral</span>

                    <span style={{ background: feedbackValue === 'Unsatisfied' ? '#FFFFFF' : '', color: feedbackValue === 'Unsatisfied' ? '#000000' : '', borderColor: feedbackValue === 'Unsatisfied' ? '#fff' : '#b1b2b3' }} onClick={(e) => feedBackClick(e, 'Unsatisfied')}>
                        Unsatisfied</span>

                </div>}
                <textarea className='textarea' value={suggestion} placeholder={placeHolders} onChange={(e) => {
                    setSuggestion(e.target.value)
                }
                }></textarea>

            </div>

            <div className='feedback-btn-wrapper'>

                {<button className='btn-with-icon btn-approve btn-small' disabled={disableButton} onClick={submitFeedback}><i></i><span>Confirm</span></button>}

                <button className='btn-with-icon btn-cancel-white btn-small' disabled={disableCancel} onClick={removeFeedbackField}><i></i><span>Cancel</span></button>

            </div>

        </div>
    )
}

export default FeedBack;
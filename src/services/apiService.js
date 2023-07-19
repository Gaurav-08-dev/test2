import AuthHeader from '../utils/AuthHeader';
import * as Constants from '../components/Constants';
import { removeUserSession, getUserDetailsFromToken, setUserSession, getUser, getToken } from '../utils/Common';
import AlertSevice from './alertService';
// import { sitePages } from '../components/Navigation';




const errorMessages = {
    '400': 'Bad Request',
    '401': 'Unauthorized',
    '402': 'Payment Required',
    '403': 'Forbidden',
    '404': 'Not Found',
    '405': 'Method Not Allowed',
    '406': 'Not Acceptable',
    '407': 'Proxy Authentication Required',
    '408': 'Request Timeout',
    '409': 'Conflict',
    '410': 'Gone',
    '411': 'Length Required',
    '412': 'Precondition Failed',
    '413': 'Payload Too Large',
    '414': 'URI Too Long',
    '415': 'Unsupported Media Type',
    '416': 'Range Not Satisfiable',
    '417': 'Expectation Failed',
    '418': 'I am a teapot',
    '421': 'Misdirected Request',
    '422': 'Unprocessable Entity',
    '423': 'Locked',
    '424': 'Failed Dependency',
    '425': 'Too Early',
    '426': 'Upgrade Required',
    '428': 'Precondition Required',
    '429': 'Too Many Requests',
    '431': 'Request Header Fields Too Large',
    '451': 'Unavailable For Legal Reasons',
    '500': 'Internal Server Error',
    '501': 'Not Implemented',
    '502': 'Bad Gateway',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
    '505': 'HTTP Version Not Supported',
    '506': 'Variant Also Negotiates',
    '507': 'Insufficient Storage',
    '508': 'Loop Detected',
    '510': 'Not Extended',
    '511': 'Network Authentication Required'
};

function getResetTokenProcessStatus() {
    let updatedResetTokenInProcess = localStorage.getItem(Constants.SITE_PREFIX + 'reset_token_inprocess');
    updatedResetTokenInProcess = updatedResetTokenInProcess ? parseInt(updatedResetTokenInProcess) : updatedResetTokenInProcess;
    return updatedResetTokenInProcess;
}

function forceLogout(msg) {
    AlertSevice.showToast('error', msg);
    removeUserSession();
    window.location.reload();
    return;
}

function getAPIRequestOptions(req_method, authHeader, data, controller) {
    let headerAuthHeader = (authHeader === null) ? AuthHeader() : authHeader;
    let options = {
        method: req_method, // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
            'Content-Type': 'application/json',
            'Authorization': headerAuthHeader,
            'App-Version': Constants.IASSIST_SITE_VERSION || '0.0.0'
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer' // no-referrer, *client
    }

    if (req_method === 'POST' || req_method === 'PUT' || req_method === 'DELETE') {
        options['body'] = JSON.stringify(data);
    }
    if (controller) {
        options['signal'] = controller.signal;
    }
    return options;
}


// async function handleHardReload(url) {
//     await fetch(url, {
//         headers: {
//             Pragma: 'no-cache',
//             Expires: '-1',
//             'Cache-Control': 'no-cache, no-store, must-revalidate',
//         },
//     });
//     window.location.href = url;
//     // This is to ensure reload with url's having '#'
//     window.location.reload();
// }

const updateScriptTag = () => {


    try {

        console.log("init", document.head)


        console.log("document-head", document.head);
        let new_version = Constants.IASSIST_SITE_VERSION.split(''); // ! for testing only
        new_version[new_version.length - 1] = +new_version[new_version.length - 1] + 1;
        new_version = new_version.join('');

        const newSrc = 'https://gaurav-08-dev.github.io/test2/index.js' + '?v=' + new_version;
        const query = document.querySelector(`script[src="${newSrc}"]`);
        console.log("query selector", query);
        if (query) {
            console.log("document-head--3", document.head);

            console.log("inside if query")
            return;
        }

        const linkTag = document.getElementById('iassist-css');
        console.log("Linktag", linkTag, linkTag.parentNode);
        if (linkTag && document.head.contains(linkTag)) linkTag.remove()


        console.log("before script creation")
        const newScript = document.createElement('script');
        newScript.src = 'https://gaurav-08-dev.github.io/test2/index.js' + '?v=' + new_version;
        newScript.id = "iassist-html";
        console.log("after script creation")


        newScript.onload=()=>{
        console.log("before get old script")
        const oldScript = document.querySelector('script[src="https://gaurav-08-dev.github.io/test2/index.js"]') || document.querySelector(`script[src="https://gaurav-08-dev.github.io/test2/index.js?v=${Constants.IASSIST_SITE_VERSION}"]`);
        console.log("after get old script")

        if (oldScript && document.head.contains(oldScript)) {
            console.log("oldScript", oldScript)
            oldScript.remove()
            // document.head.removeChild(oldScript);
            console.log("oldScript --- after", oldScript)
        }
        console.log("after get old script -- 2")
    }

    document.head.appendChild(newScript);
    }

    catch (e) {
        console.log(e)
    }
    // }
    // const oldScriptTag=document.getElementById("iassist-html");

}




const APIService = {

    apiRequest(API_URL, data, showProgress = false, req_method = 'POST', controller = null, authHeader = null, callback) {
        let options = getAPIRequestOptions(req_method, authHeader, data, controller);

        return fetch(API_URL, options)
            .then((response) => {
                //for black listed users just log out them


                if (response.status === 301) {
                    forceLogout('Invalid Credentials.');
                }

                if (!API_URL.includes('login') && (response.status === 401 || response.status === 403)) {
                    let resetTokenInProcess = getResetTokenProcessStatus();
                    if (resetTokenInProcess === null || resetTokenInProcess === 0) {
                        localStorage.setItem(Constants.SITE_PREFIX + 'reset_token_inprocess', 1);
                        let userInfo = getUser();
                        if (userInfo.rt !== undefined) {
                            //call the api to get refreshed auth token based on refresh token and update it on localstorage
                            let refreshPayload = { 'at': getToken(), 'rt': userInfo.rt };
                            let apiOptions = {
                                method: 'PUT',
                                mode: 'cors', // no-cors, *cors, same-origin
                                headers: {
                                    'Content-Type': 'application/json',
                                    'App-Version': Constants.IASSIST_SITE_VERSION || '0.0.0',
                                },
                                redirect: 'follow', // manual, *follow, error
                                referrerPolicy: 'no-referrer', // no-referrer, *client
                                body: JSON.stringify(refreshPayload)

                            }

                            return fetch(Constants.API_BASE_URL + '/auth/rt1', apiOptions).then((response) => {
                                if (response.status === 401) { //* comparator bug
                                    localStorage.setItem(Constants.SITE_PREFIX + 'reset_token_inprocess', 0); //reset to 0 so that it can process futther (other apis)
                                    forceLogout('Invalid Credentials.');
                                    return;
                                }

                                return response.json();
                            }).then((parsedResponse) => {
                                //Redirect to home page after succcessful login
                                let user_details = getUserDetailsFromToken(parsedResponse.access_token);
                                let user_info = user_details.identity;

                                //set terminals & default terminal type
                                if (parsedResponse.terminal) {
                                    user_info['terminals'] = parsedResponse.terminal;
                                    user_info['terminal_type'] = { id: parsedResponse.terminal[0]['display_name'], name: parsedResponse.terminal[0]['name'], orgid: parsedResponse.terminal[0]['id'] };
                                }

                                //set default home url under local storage for future redirection
                                user_info.default_home_url = '/';

                                if (user_details) {
                                    setUserSession(parsedResponse.access_token, user_info); //Set token and user details in session
                                    localStorage.setItem(Constants.SITE_PREFIX + 'reset_token_inprocess', 0); //reset to 0 so that it can process futther (other apis)
                                    return this.apiRequest(API_URL, data, showProgress, req_method, controller, authHeader);
                                }

                            }).catch(e => {
                                AlertSevice.warning('User password/session expired, Please login again.', e.msg);
                                removeUserSession();
                                window.location.reload();
                            });

                        } else {
                            forceLogout('Invalid Credentials.');
                        }

                    } else {
                        //wait for the flag to be 0
                        //then wait for api callback response
                        //return the response to apiservive caller
                        resetTokenInProcess = getResetTokenProcessStatus();
                        return new Promise((resolve) => {
                            let interval = setInterval(() => {
                                resetTokenInProcess = getResetTokenProcessStatus();
                                if (resetTokenInProcess === 0) {
                                    clearInterval(interval);
                                    resolve(1);
                                }
                            }, 50);
                        }).then(() => {
                            return this.apiRequest(API_URL, data, showProgress, req_method, controller, authHeader);
                        });
                    }
                }

                //Don't show alert message on user_preference 500 error
                if (API_URL.includes('user_preference') && (response.status === 500 || response.status === 501)) {
                    return {};
                }

                //handle other errors
                if (!API_URL.includes('login') && (response.status > 299 && (response.status !== 401 || response.status !== 403))) {
                    let errorMsg = response.statusText;
                    if (errorMsg === '') {
                        errorMsg = (errorMessages[response.status] !== undefined ? errorMessages[response.status] : '');
                    }

                    return response.json()
                        .then((parsedResponse) => {
                            AlertSevice.showToast('error', response.status + ' - ' + errorMsg + (parsedResponse.message || parsedResponse.msg || parsedResponse.detail) ? ': ' + (parsedResponse.message || parsedResponse.msg || parsedResponse.detail) : '');
                            return parsedResponse;
                        });
                }

                //handle when it is ok
                if (showProgress) {

                    if (!response.ok) { throw Error(response.status + ' ' + response.statusText) }

                    // ensure ReadableStream is supported
                    if (!response.body) { throw Error('ReadableStream not yet supported in this browser.') }

                    const contentLength = +response.headers.get('Content-Length'); // Step 2: get total length
                    // const AWSALB_Cookie = response.headers.get('Set-Cookie'); 

                    const reader = response.body.getReader(); // Step 3: read the data
                    return { total_len: contentLength, reader: reader };

                } else {
                    if (response.status === 207) {

                        // Special check - 207 indicates that a New version of app is available 
                        // so in this case, force reload the browser so that user gets the latest version of app
                        // window.location.reload();
                        // callback()
                        updateScriptTag()
                        // handleVersionChange();
                        // return {message:"version change"};
                    }

                    return response.json()
                        .then((parsedResponse) => {
                            if (parsedResponse.status === 0 && parsedResponse.wait_time === undefined && !API_URL.includes('user_preference')) {
                                console.log("inside error")
                                AlertSevice.showToast('error', parsedResponse.message || parsedResponse.msg || 'Some error occured');
                            }
                            return parsedResponse;
                        });
                }
            })
            .catch((e) => {

                console.log("e", e)
                if (e.message !== 'The user aborted a request.') {
                    if (e.message === 'Failed to fetch') {
                        AlertSevice.showToast('error', 'Request ' + e.message.toLowerCase() + ' due to network issue.');
                    } else {
                        AlertSevice.showToast('error', e.message || 'Some Error Occured');
                    }
                }
                return {};
            });
    },
    abortAPIRequests(controller) {
        controller.abort();
    }
};

export default APIService;
// import * as Constants from '../Constants';

export default function embed(target) {

    const bodyElement = document.getElementsByTagName('body')[0];
     const div = document.createElement('div')
     div.id = 'iassist-panel-wrapper';
    div.dataset.token = 'sight_'; //Constants.SITE_PREFIX; //* site prefix - to get token from local storage
    div.dataset.buttonid = 'trigger-btn';//target; //* id of the button to acess the iAssist
    bodyElement.append(div);

    const scriptTag = document.createElement("script")
    scriptTag.id = "iassist-html";
    // scriptTag.src = 'https://iassist-dev.bydata.com/scripts/sight/docs/index.js';
    scriptTag.src = 'https://gaurav-08-dev.github.io/test2/index.js';

    bodyElement.append(scriptTag);

}
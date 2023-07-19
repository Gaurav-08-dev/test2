import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';


const bodyElement = document.getElementsByTagName('body')[0];
const div = document.createElement('div')
div.id = 'iassist-panel-wrapper';
bodyElement.append(div);

const headElement = document.getElementsByTagName('head')[0];
const linkTag = document.createElement("link");
linkTag.href = 'https://iassist-assets.s3.us-east-2.amazonaws.com/css/iassist.css';
linkTag.rel = "stylesheet";
linkTag.id = "iassist-css";
document.head.appendChild(linkTag)
// headElement.append(linkTag);

const metaTag = document.createElement("meta");
metaTag.httpEquiv = 'cache-control';
metaTag.content = 'no-cache';

const metaTagSecondSetting = document.createElement("meta");
metaTagSecondSetting.httpEquiv = 'expires';
metaTagSecondSetting.content = '0';

const metaTagThirdSetting = document.createElement("meta");
metaTagThirdSetting.httpEquiv = 'pragma';
metaTagThirdSetting.content = 'no-cache';

headElement.append(metaTag);
headElement.append(metaTagSecondSetting);
headElement.append(metaTagThirdSetting);


const root = ReactDOM.createRoot(document.getElementById('iassist-panel-wrapper'));
root.render(
    <App />
);

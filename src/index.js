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
linkTag.href = 'https://gaurav-08-dev.github.io/test2/index.css';
linkTag.rel = "stylesheet";
linkTag.id = "iassist-css";
headElement.append(linkTag);
const root = ReactDOM.createRoot(document.getElementById('iassist-panel-wrapper'));
root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>

);

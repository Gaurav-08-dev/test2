import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const bodyElement = document.getElementsByTagName('body')[0];
const div = document.createElement('div')
div.id = 'iassist-panel-wrapper';
bodyElement.append(div);
const root = ReactDOM.createRoot(document.getElementById('iassist-panel-wrapper'));
root.render(
    // <React.StrictMode>
    <App />
    // </React.StrictMode>

);

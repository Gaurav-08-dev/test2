import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import { disableReactDevTools } from "@fvilers/disable-react-devtools";
if (process.env.NODE_ENV === "production" || process.env.NODE_ENV === "development") {console.log(process.env.NODE_ENV);disableReactDevTools()}




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

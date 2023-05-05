import React from "react";
import { useEffect } from "react";
import './App.css';
import SupportContainer from './components/iassist/SupportContainer';
import Toast from "./components/Toast/Toast";
import { GlobalDebug } from "./utils/RemoveConsole";
// import { disableReactDevTools } from "@fvilers/disable-react-devtools";

// if (process.env.NODE_ENV === "production" || process.env.REACT_APP_CUSTOM_NODE_ENV === "developmet") {console.log(process.env);disableReactDevTools()}



function App() {
  
  
  useEffect(()=>{
    (process.env.NODE_ENV === "production" ||
    process.env.REACT_APP_CUSTOM_NODE_ENV === "STAGING") &&
    GlobalDebug(false);
  },[])
  return (
    <>
      <Toast />
      <SupportContainer />
    </>
  );
}

export default App;

import React from "react";
import { useEffect } from "react";
import './App.css';
import SupportContainer from './components/iassist/SupportContainer';
import Toast from "./components/Toast/Toast";
import { GlobalDebug } from "./utils/RemoveConsole";





function App() {


  useEffect(() => {
    (process.env.NODE_ENV === "production" ||
      process.env.REACT_APP_CUSTOM_NODE_ENV === "STAGING") &&
      GlobalDebug(false);
  }, [])


  return (
    <>
      <Toast />
      <SupportContainer />
    </>
  );
}

export default App;

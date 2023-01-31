import React from "react";
import './App.css';
import SupportContainer from './components/iassist/SupportContainer';
import Toast from "./components/Toast/Toast"



function App() {
  
  return (
    <div className="App">
      <Toast/>
      <SupportContainer />
    </div>
  );
}

export default App;

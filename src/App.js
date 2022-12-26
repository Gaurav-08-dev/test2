import React from "react";
import './App.css';
import SupportContainer from './components/iassist/SupportContainer';

let buttonId = 'iassistNavigate';



function App() {
  
  return (
    <div className="App">
      <SupportContainer btnId={buttonId} />
    </div>
  );
}

export default App;

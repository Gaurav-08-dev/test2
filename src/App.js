import React from "react";
import './App.css';
import SupportContainer from './components/iassist/SupportContainer';
import Toast from "./components/Toast/Toast";
// import { ErrorBoundary } from "react-error-boundary";
// import ErrorFallback from "./components/ErrorFallback";


function App() {

  return (
    // <ErrorBoundary
    //   FallbackComponent={ErrorFallback}
    //   // onReset={() => window.location.href = "/"}
    // >
    <>
      <Toast />
      <SupportContainer />
    </>
    // </ErrorBoundary>
  );
}

export default App;

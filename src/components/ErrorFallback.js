import React from 'react';
import './ErrorFallback.scss'

const ErrorFallback = ({error,resetErrorBoundary}) => {
  return (
    <div className='error'>
      <pre>Something went wrong. Please Load the app again</pre>
      {/* <pre>{error.message}</pre> */}
      {/* <button onClick={resetErrorBoundary}>Try again</button> */}
    </div>
  )
}

export default ErrorFallback;
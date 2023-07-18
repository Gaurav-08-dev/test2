import React from 'react'
import './VersionMessage.scss'
import ClickOutsideListener from './ClickOutsideListener'

const VersionMessage = ({ setIsNewVersionAvailable }) => {


    const operatingSystem = navigator.userAgent.indexOf("Mac") !== -1 ? 'mac' :
        navigator.userAgent.indexOf("Win") !== -1 ? 'windows' : ''

    return (

        <ClickOutsideListener onOutsideClick={() => setIsNewVersionAvailable(false)}>
            <div id='iassist-version-panel' className='iassist-panel iassist-version-change-message-wrapper'>
                <div className='iassist-panel-inner'>
                    <div className='iassist-panel-header'>
                        <h4 className='iassist-header-title'>iAssist</h4>

                        <div className='iassist-header-right'>

                            <div className='iassist-search'>
                                <button className='iassist-search-btn' onClick={() => { }} title='search'></button>
                                <input type={'text'}
                                    title='Search'
                                    placeholder='Search'
                                    disabled={true}
                                />
                            </div>

                            <div className={'iassist-filter-btn'}>
                                <button className={'button'}
                                    title='filter-button'></button>
                            </div>

                            <div className='iassist-btn-new-topic-wrapper'>

                                <button>
                                    <span className='add-new-ticket'></span>
                                    Ticket
                                </button>

                            </div>

                            <div id='version-modal-close'>

                                <div id='version-overlay-close'>
                                </div>

                                <div id='version-modal-content-close'></div>
                                {<button className='iassist-version-header-close' onClick={() => setIsNewVersionAvailable(false)}></button>}
                            </div>

                        </div>
                    </div>


                    <div className='iassist-panel-body'>
                        <div className='iassist-filter-wrapper'>

                            <div className={'tab-wrapper'}>

                                <button style={{ backgroundColor: '#6C757D' }}
                                    disabled={true}>

                                    Active

                                </button>

                                <button>

                                    Resolved

                                </button>

                            </div>

                        </div>
                        <div id='version-modal'>

                            <div id='version-overlay'>
                            </div>

                            <div id='version-modal-content'>


                                <div className='iassist-version-body'>
                                    <div className="iassist-version-change-message">
                                        <p>New version of our software is now available.
                                            To take advantage of the latest features and improvements, we kindly request you to reload the page or press
                                            <span>{operatingSystem === 'mac' ? ' Cmd + Shift + R' : ' Ctrl + Shift + R'}</span> on your keyboard</p>
                                        <button className='iassist-version-reload-btn btn-with-icon btn-small' onClick={() => window.location.reload()}>
                                            <i></i><span>Refresh</span>
                                        </button>
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </div>
        </ClickOutsideListener>

    )
}

export default VersionMessage
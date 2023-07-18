import { createContext, useContext, useState } from "react";


const versionContext=createContext();

export const useVersionContext = () =>{
    return useContext(versionContext)
}

export const VersionContext = ({children})=> {
    const [isNewVersionAvailable,setIsNewVersionAvailable] = useState(false);


    return <versionContext.Provider
    value={{isNewVersionAvailable,setIsNewVersionAvailable}}
    >
        {children}
    </versionContext.Provider>
}
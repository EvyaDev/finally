import React, { useContext } from 'react'
import "./style/settings.css"
import Logout from './Logout';
import { IoMdSettings } from "react-icons/io";
import { GeneralContext, VERSION_APP } from './App';
import { CgRename } from "react-icons/cg";
import { LuInfo } from "react-icons/lu";

export default function Settings({ close }) {
    const { userData } = useContext(GeneralContext);

    return (
        <div className={close ? 'Settings close' : 'Settings'}>
            <p>{userData.userName}</p>
            <p>{userData.email}</p>
            <ul>
                <li> <IoMdSettings />הגדרות חשבון</li>
                <li> <CgRename />שינוי שם </li>
                <li> <LuInfo />אודות </li>
                <Logout />
                <p className='version'>גרסה {VERSION_APP}</p>
            </ul>
        </div>
    )
}
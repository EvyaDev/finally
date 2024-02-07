import React, { useContext, useEffect, useState } from 'react'
import { chatsContext } from '../Main';
import { HOSTING_URL } from '../App';
import userPlaceHolder from "../Assets/images/placeholder.jpg"
import './style/UserChat.css'

export default function UserChat({ current, name, lastChat, time, count, typing, online }) {

    const { users } = useContext(chatsContext);
    const [currentUserImg, setCurrentUserImg] = useState("");

    useEffect(() => {
        const userImage = users.filter(user => user.userName === name).map(user => {
            return (user.image)
        })
        setCurrentUserImg(userImage[0])
    }, [name])

    return (
        <div className={current ? 'UserChat current' : 'UserChat'}>

            <div className='avatar'>
                <img alt='avatar-user' src={currentUserImg ? HOSTING_URL + `/file/${currentUserImg}` : userPlaceHolder}></img>
                {online && <div className={'onlineSymbol'}> </div>}
            </div>

            <div className='leftSide'>
                <div className='text'>
                    <p className='name'>{name} </p>
                    <p className='lastMsg'> {typing ? 'מקליד/ה...' : lastChat}</p>

                </div>
                <div className='info'>
                    <p className='time'>{time}</p>
                    {count > 0 && <div className='count'><p >{count}</p></div>}
                </div>
            </div>
        </div>
    )
}
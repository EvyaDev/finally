import React from 'react'
import './style/UserChat.css'

export default function UserChat({ current, name, lastChat, time, count, typing, online }) {
    return (
        <div className={current ? 'UserChat current' : 'UserChat'}>

            <div className='avatar'>
                <img alt='' src='https://www.kayacosmedica.com.au/wp-content/uploads/2020/06/male-fillers-patient.jpg'></img>
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
        </div >
    )
}

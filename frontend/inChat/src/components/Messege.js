import React from 'react'
import "./style/Messege.css"

export default function Messege({ send, messege, time }) {

    return (
        <div className='Messege'>
            <div className={send ? "row send" : "row"}>
                <div className="block">
                    <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19V0C15 10.6294 0.5 19 0.5 19H15Z" />
                    </svg>
                    <span className='msg'> {messege} </span>
                    <span className='time'> {time}</span>
                </div>
            </div>
        </div>
    )
}

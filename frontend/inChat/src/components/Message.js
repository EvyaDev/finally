import React, { useContext, useEffect, useState } from 'react';
import { FaTrash } from "react-icons/fa";
import { chatsContext } from '../Main';
import { socket } from '../App';
import "./style/Message.css"

export default function Message({ id, send, messege, time }) {

    const { userData, chats, setChats, currentUser } = useContext(chatsContext);
    const [showDeleteBtn, setShowDeleteBtn] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);

    function deleteMsg(msgId) {
        if (!window.confirm('בטוח/ה כי ברצונך למחוק?')) {
            return;
        }
        setIsDeleted(true);
        socket.emit("delete-msg", { token: localStorage.token, msgId, user: currentUser });
    }

    useEffect(() => {
        socket.on('del-msg', (res_id) => {
            const updatedMessages = chats.filter(chat => chat._id !== res_id);
            setChats(updatedMessages);

            socket.emit("get-msgs-by-user", { token: localStorage.token, userName: userData.userName });
            socket.on("res-msgs-by-user", (res) => {
                setChats(res);
            })
        })
    }, [socket])

    return (
        <div className={isDeleted ? 'Message deleted' : 'Message'}>
            <div
                onMouseOver={() => setShowDeleteBtn(true)}
                onMouseLeave={() => setShowDeleteBtn(false)}
                className={send ? "row send" : "row"}
            >
                <div className={"block"}>
                    <svg width="15" height="19" viewBox="0 0 15 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 19V0C15 10.6294 0.5 19 0.5 19H15Z" />
                    </svg>
                    <span className='msg'>{messege} </span>
                    <span className='time'>{time}</span>
                </div>
                <div onClick={() => deleteMsg(id)} className={showDeleteBtn ? 'deleteBtn show' : 'deleteBtn'}><FaTrash /></div>
            </div>
        </div>
    )
}
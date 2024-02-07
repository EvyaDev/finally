import React, { useContext, useEffect, useRef, useState } from 'react'
import { HOSTING_URL, socket } from '../App';
import { chatsContext } from '../Main';
import { IoIosArrowForward } from "react-icons/io";
import Message from './Message';
import { ReactComponent as SendBtnIcon } from '../Assets/sendBtn.svg';
import userPlaceHolder from "../Assets/images/placeholder.jpg"
import moment from "moment";
import '../components/style/Chats.css';

export default function Chats({ online }) {

    //context
    const { users, userData, setVal, val, chats, setChats, currentUser, setMobileChatScreen, userTyping } = useContext(chatsContext);

    //ref's
    const msg = useRef(null);
    const listMsgRef = useRef(null);
    const textareaRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    //stats
    const [formData, setFormData] = useState({});
    const [currentUserImg, setCurrentUserImg] = useState("");

    let lastDisplayedDate = null;

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [val]);

    useEffect(() => {
        const imgs = users.filter(user => user.userName === currentUser).map(user => {
            return (user.image);
        })

        setCurrentUserImg(imgs[0]);
        if (textareaRef.current) {
            listMsgRef.current.lastElementChild?.scrollIntoView({ block: "end" });
        }
    }, [currentUser]);

    function handleInput(e) {
        const newValue = e.target.value;
        setVal(newValue);

        setFormData(
            {
                ...formData,
                token: localStorage.token,
                fromUser: userData.userName,
                toUser: currentUser,
                text: newValue,
                dateTime: new Date()
            }
        );

        socket.emit("input", userData.userName);
        socket.emit("start-typing", { fromUser: userData.userName, toUser: currentUser });

        //clear Timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("end-typing", { fromUser: userData.userName, toUser: currentUser });
        }, 2500);
    }


    async function enter(ev) {
        if (ev.key === "Enter") {
            if (ev.shiftKey) return;
            ev.preventDefault();
            send(ev);
        }
    }

    //send new message
    async function send(ev) {

        if (ev.type === 'submit') {
            ev.preventDefault();
        }

        if (val === "") {
            return;
        }

        setChats([...chats, formData]);
        socket.emit("send-msg", formData);
        socket.emit("get-msgs-by-user", { token: localStorage.token, userName: userData.userName })
        socket.on("res-msgs-by-user", (res) => { setChats(res) })
        socket.emit("end-typing", { fromUser: userData.userName, toUser: currentUser });

        setVal("");
        setFormData({});
        textareaRef.current.focus();
        listMsgRef.current.lastElementChild?.scrollIntoView();
    }

    return (
        <section className="Chats">

            <div className="header">
                <button className='back' onClick={() => setMobileChatScreen(false)}><IoIosArrowForward /></button>
                <img alt='avatarInitialChat' className='avatarInitialChat' src={currentUserImg ? HOSTING_URL + `/file/${currentUserImg}` : userPlaceHolder}></img>
                <div>
                    <p>{currentUser}</p>
                    <p className={`typing ${userTyping.fromUser === currentUser && userTyping.mode ? 'is-typing' : 'is-not-typing'}`}>
                        {(userTyping.fromUser === currentUser && userTyping.mode) ? "מקליד/ה..." : online ? "מחובר/ת" : ""}
                    </p>
                </div>
            </div>

            <div className='middle'>
                <div className='bgcTexture'></div>
                <div ref={listMsgRef} className="messeges">

                    {chats.length ? chats.filter(x =>
                        (x.fromUser === currentUser || x.toUser === currentUser) &&
                        (x.fromUser === userData.userName || x.toUser === userData.userName)).map((item) => {
                            const currentDate = moment(item.dateTime).format('יום dddd, D בMMM');

                            // Check if the date is different from the last displayed date
                            if (currentDate !== lastDisplayedDate) {
                                lastDisplayedDate = currentDate;

                                // Display the unique date
                                return (
                                    <div key={item._id} ref={msg}>
                                        <p className='relativeTime'>{currentDate}</p>
                                        <Message
                                            currentUser
                                            id={item._id}
                                            messege={item.text}
                                            time={moment(item.dateTime).format("HH:mm")}
                                            send={item.fromUser === currentUser}
                                        />
                                    </div>
                                )
                            }

                            // Display the message without the date
                            return (
                                <div key={item._id + "nodate"} ref={msg}>
                                    <Message
                                        currentUser
                                        id={item._id}
                                        messege={item.text}
                                        time={moment(item.dateTime).format("HH:mm")}
                                        send={item.fromUser === currentUser}
                                    />
                                </div>
                            );
                        }) : null}
                </div>
            </div>

            <div className="footer">
                <form onSubmit={send} >
                    <textarea ref={textareaRef} value={val} onInput={handleInput} onKeyDown={enter} rows={1} placeholder='הקלדת הודעה' />
                    <button type='submit'> <SendBtnIcon /> </button>
                </form>
            </div>

        </section>
    )
}
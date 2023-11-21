import React, { useContext, useEffect, useRef, useState } from 'react'
import { GeneralContext, HOSTING_URL, socket } from './App';
import { IoIosArrowDown, IoMdImage } from "react-icons/io";
import Messege from './components/Messege';
import { chatsContext } from './Main';
import moment from "moment";
import 'moment/locale/he';
import './style/Main.css';


export default function Chats() {

    //context
    const { userData, setVal, val, chats, setChats, currentUser, userUnread, userTyping } = useContext(chatsContext);

    //refs
    const msg = useRef(null);
    const listMsgRef = useRef(null);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    //stats
    const [imgVal, setImgVal] = useState("");
    const [isRead, setIsRead] = useState(false);
    const [displayImg, setDisplayImg] = useState(false);
    const [urlDisplay, setUrlDisplay] = useState("");

    let lastDisplayedDate = null;


    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
        }
    }, [val])

    useEffect(() => {
        if (textareaRef.current) {
            listMsgRef.current.lastElementChild?.scrollIntoView();
        }
    }, [currentUser])

    //send new message
    function enter(ev) {
        if (ev.key === "Enter") {
            if (ev.shiftKey) {
                return;
            }
            ev.preventDefault();
            send(ev);
        }
    }

    //read all the messages of current user
    function read(from) {
        setIsRead(true);

        fetch(`${HOSTING_URL}/read`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ from: from, to: userData.userName })
        })
            .then(() => {
                socket.emit("get-msgs-by-user", { token: localStorage.token, userName: userData.userName })
                socket.on("res-msgs-by-user", (res) => {
                    setChats(res);
                })
            })
    }

    function inputImageTrigger() {
        fileInputRef.current.click();
    }

    const handleInput = (e) => {

        setVal(e.target.value);
        !isRead && read(currentUser);

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

    function imageChange(ev) {
        const file = ev.target.files[0];
        const allowed = ['image/jpg', 'image/jpeg', 'image/png'];
        if (file) {
            if (!allowed.includes(file.type)) {
                alert("קובץ לא מורשה");
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                setDisplayImg(true);
                setUrlDisplay(e.target.result);
                console.log(e);
            }
            reader.readAsDataURL(file);
        } else {
            setDisplayImg(false);
        }
    }

    function uploadFiles(ev) {
        const fileInput = ev.target.file;
        let file = fileInput.files[0];

        if (file) {
            const form = new FormData();
            form.append('myFile', file);

            const imgUrl = fetch(`${HOSTING_URL}/files/upload`, {
                method: 'POST',
                body: form
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network res was not ok');
                    }
                    return res.text();
                })
                .then(data => {
                    return (data.split("./files/")[1]);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
            return imgUrl;
        } else {
            console.error('No file selected');
        }
    }

    async function send(ev) {

        ev.type === 'submit' && ev.preventDefault();
        const a = await uploadFiles(ev);
        setImgVal(a);

        if (val === "" && imgVal === "") {
            return;
        }

        setIsRead(false);
        setVal("");
        setDisplayImg(false);

        textareaRef.current.focus();
        listMsgRef.current.lastElementChild?.scrollIntoView();

        const data = {
            token: localStorage.token,
            fromUser: userData.userName,
            toUser: currentUser,
            text: val,
            imgUrl: imgVal,
            dateTime: new Date()
        }

        setChats([...chats, data]);
        socket.emit('send-msg', data);
        socket.emit("end-typing", { fromUser: userData.userName, toUser: currentUser });
        fileInputRef.current.value = "";
    }

    return (
        <section className="chats">

            <div className="header">
                <img alt='avatarInitialChat' className='avatarInitialChat' src='https://www.kayacosmedica.com.au/wp-content/uploads/2020/06/male-fillers-patient.jpg'></img>
                <div>
                    <p>{currentUser}</p>
                    <p className={`typing ${userTyping.fromUser === currentUser && userTyping.mode ? 'is-typing' : 'is-not-typing'}`}>
                        {(userTyping.fromUser === currentUser && userTyping.mode) ? "מקליד/ה..." : "מקליד/ה..."}
                    </p>
                </div>
            </div>

            <div className='middle'>
                <div className='bgcTexture'></div>

                {displayImg &&
                    <div className='imageDisplay'>
                        <img src={urlDisplay}></img>
                    </div>
                }

                <div ref={listMsgRef} className="messeges">
                    {(userUnread[currentUser] > 0) && <button className='scrollDown' onClick={() => {
                        listMsgRef.current.lastElementChild?.scrollIntoView();
                        read(currentUser)
                    }}>
                        <span>{userUnread[currentUser]}</span>
                        <IoIosArrowDown />
                    </button>
                    }
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
                                        <Messege
                                            messege={item.text}
                                            time={moment(item.dateTime).format("HH:mm")}
                                            send={item.fromUser === currentUser}
                                        />
                                    </div>
                                )
                            }

                            // Display the message without the date
                            return (
                                <div key={item._id} ref={msg}>
                                    <Messege
                                        messege={item.text}
                                        time={moment(item.dateTime).format("HH:mm")}
                                        send={item.fromUser === currentUser}
                                        img={item.imgUrl ? `${HOSTING_URL}/file/${item.imgUrl}` : ""}
                                    />
                                </div>
                            );
                        }) : null}
                </div>
            </div>

            <div className="footer">
                <form onSubmit={send} encType='multipart/form-data'>
                    <button type='button' className='triggerInputImg' onClick={inputImageTrigger}><IoMdImage /></button>
                    <textarea ref={textareaRef} value={val} onInput={handleInput} onKeyDown={(ev) => enter(ev)} rows={1} placeholder='הקלדת הודעה...' />
                    <input
                        hidden
                        id='file'
                        type='file'
                        ref={fileInputRef}
                        onChange={imageChange}
                    />
                    <button type='submit'>
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.8934 39.7675C38.5907 40.616 40.4737 39.0017 39.8922 37.1946L35.8091 24.5044C35.7288 24.2549 35.5814 24.0323 35.3831 23.861C35.1848 23.6896 34.9432 23.5761 34.6847 23.5329L17.7277 20.7057C16.932 20.5729 16.932 19.43 17.7277 19.2971L34.6833 16.4714C34.942 16.4284 35.1839 16.315 35.3825 16.1437C35.5811 15.9723 35.7287 15.7496 35.8091 15.4999L39.8922 2.80544C40.4737 0.998269 38.5921 -0.61604 36.8934 0.232544L1.18508 18.0828C-0.395032 18.8728 -0.395032 21.1257 1.18508 21.9172L36.8934 39.7675Z" fill="#43AE73" />
                        </svg>
                    </button>
                </form>
            </div>

        </section>
    )
}
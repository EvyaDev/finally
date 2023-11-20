import React, { useContext, useEffect, useRef, useState } from 'react';
import Messege from './components/Messege';
import UserChat from './components/UserChat';
import moment from "moment";
import { APP_NAME, socket } from './App';
import { AiOutlineSearch } from "react-icons/ai";
import { GeneralContext, HOSTING_URL } from './App';
import 'moment/locale/he';
import './style/Main.css';
import { IoIosArrowDown } from "react-icons/io";
import robot from "./Assets/robot.json"
import Lottie from 'lottie-react';
import { ReactComponent as NewChatIcon } from './Assets/newChat.svg';
import Settings from './Settings';
import { SlOptionsVertical } from "react-icons/sl";

export default function Main() {
    const { userData, usersOnline } = useContext(GeneralContext);

    const typingTimeoutRef = useRef(null);
    const textareaRef = useRef(null);
    const listMsgRef = useRef(null);
    const msg = useRef(null);

    const [val, setVal] = useState("");
    const [currentUser, setCurrentUser] = useState(localStorage ? localStorage.lastUserChat : "");
    const [users, setUsers] = useState([]);
    const [chats, setChats] = useState([]);
    const [usersMenu, setUsersMenu] = useState(false);
    const [searchUser, setSearchUser] = useState("");
    const [userMessages, setUserMessages] = useState({});
    const [userUnread, setUserUnread] = useState({});
    const [userTyping, setUserTyping] = useState({});
    const [isRead, setIsRead] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);

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

    //get all users in application
    useEffect(() => {
        fetch(`${HOSTING_URL}/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.log(err))
    }, [])

    function searchUserHandle(e) {
        setSearchUser(e.target.value)
    }

    const handleInput = (e) => {
        setVal(e.target.value)

        socket.emit("input", userData.userName)

        !isRead && read(currentUser);
        socket.emit("start-typing", { fromUser: userData.userName, toUser: currentUser })

        //clear Timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit("end-typing", { fromUser: userData.userName, toUser: currentUser });
        }, 2500);
    }

    //send new message
    function enter(ev) {
        if (ev.key === "Enter") {
            if (ev.shiftKey) {
                return;
            }
            ev.preventDefault();
            send();
        }
    }

    async function send(ev) {
        ev.preventDefault();

        const imgUrl = await uploadFiles(ev);
        console.log("imgUrl:", imgUrl);

        if (val === "" && imgUrl === "") {
            return;
        }
        setIsRead(false);
        setVal("");
        textareaRef.current.focus();
        listMsgRef.current.lastElementChild?.scrollIntoView();

        const data = {
            token: localStorage.token,
            fromUser: userData.userName,
            toUser: currentUser,
            text: val,
            url: imgUrl,
            dateTime: new Date()
        }

        setChats([...chats, data]);
        socket.emit('send-msg', data);
        socket.emit("end-typing", { fromUser: userData.userName, toUser: currentUser });
    }


    function uploadFiles(ev) {
        const fileInput = ev.target.file;
        const file = fileInput.files[0];

        if (file) {
            const data = new FormData();
            data.append('myFile', file)

            const imgUrl = fetch(`${HOSTING_URL}/files/upload`, {
                method: 'POST',
                body: data
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error('Network res was not ok');
                    }
                    return res.text();
                })

                .then(data => {
                    return (data);
                })
                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });

            return imgUrl;

        } else {
            console.error('No file selected');
        }
    }

    //socket configuration
    useEffect(() => {

        socket.emit("get-msgs-by-user", { token: localStorage.token, userName: userData.userName })
        socket.on("res-msgs-by-user", (res) => {
            setChats(res);
        })

        socket.on("new-msg", res => {
            chats.push(res)

            socket.emit("get-msgs-by-user", { token: localStorage.token, userName: userData.userName })
            socket.on("res-msgs-by-user", (res) => {
                setChats(res);
            })
        })

        socket.on("typing", (data) => {
            const { mode, fromUser } = data;
            setUserTyping({ fromUser, mode })
        })

    }, [socket])


    //click on user from list of users
    function clickUser(username) {
        setVal("");
        read(username);
        setCurrentUser(username);
        localStorage.lastUserChat = username;
        setUserUnread({ ...userUnread, [currentUser]: 0 })
        textareaRef.current && textareaRef.current.focus();
    }

    //read all the messages of current user
    function read(from) {
        setIsRead(true)

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

    //convert from "chats" array to group by name
    chats.forEach(chat => {
        const fromUser = chat.fromUser;
        const toUser = chat.toUser;
        const id = chat._id;

        if (!userMessages[fromUser]) {
            userMessages[fromUser] = [];
        }
        if (!userMessages[toUser]) {
            userMessages[toUser] = [];
        }

        if (!userUnread[fromUser]) {
            userUnread[fromUser] = null;
        }

        userMessages[fromUser][id] = chat;
        userMessages[toUser][id] = chat;

        userUnread[fromUser] = Object.values(userMessages[fromUser]).filter(x => (!x.read && x.fromUser === fromUser)).length;
    });

    return (
        <div className="Main">
            <section className="side">

                <div className="header">
                    <img alt='' src='https://www.kayacosmedica.com.au/wp-content/uploads/2020/06/male-fillers-patient.jpg'></img>
                    {/* <div className='search'>
                        <input placeholder='חיפוש...'></input>
                        <AiOutlineSearch />
                    </div> */}
                    <p className='title'> <b> {userData.userName}</b> </p>
                    <NewChatIcon style={{ cursor: "pointer" }} onClick={() => setUsersMenu(!usersMenu)} />
                    <SlOptionsVertical onClick={() => setSettingsOpen(!settingsOpen)} />

                    {usersMenu &&
                        <div className='userList'>
                            <input onInput={searchUserHandle} placeholder='חיפוש משתמש...'></input>
                            {users.length && users.filter(x => (x.userName.includes(searchUser) || x.email.includes(searchUser)) && x.userName !== userData.userName).map(user => {
                                return (
                                    user ? <div key={user._id} className='userItem'
                                        onClick={() => {
                                            setCurrentUser(user.userName);
                                            localStorage.lastUserChat = user.userName;
                                            setUsersMenu(false)
                                        }} >

                                        <p>@{user.userName}</p>
                                        <p className='email'>{user.email}</p>
                                    </div>
                                        : <p className='noResult'>אין תוצאות</p>
                                )
                            })}
                        </div>
                    }
                </div>

                <div className={settingsOpen ? "content" : "content close"}>
                    <Settings close={!settingsOpen} />

                    <p className='title'>צ׳אטים אחרונים</p>

                    <div className='usersChat'>
                        {Object.keys(userMessages).length ? Object.keys(userMessages).filter(x => x !== userData.userName).map((username) => {
                            const messagesForUser = Object.values(userMessages[username]);
                            messagesForUser.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

                            return (
                                <div key={username} onClick={() => clickUser(username)}>
                                    <UserChat
                                        name={username}
                                        lastChat={messagesForUser[0].text}
                                        time={moment(messagesForUser[0].dateTime).format("HH:mm")}
                                        current={currentUser === username}
                                        count={[username]}
                                        typing={userTyping.fromUser === username && userTyping.mode}
                                        online={usersOnline.includes(username)}
                                    />
                                </div>
                            )
                        }) :

                            <button onClick={() => setUsersMenu(true)}>התחלה</button>
                        }
                    </div>
                </div>

            </section>

            {currentUser ?
                <section className="chats">

                    <div className="header">
                        <img alt='avatarInitialChat' className='avatarInitialChat' src='https://www.kayacosmedica.com.au/wp-content/uploads/2020/06/male-fillers-patient.jpg'></img>
                        <div>
                            <p>{currentUser} </p>
                            <p className={`typing ${userTyping.fromUser === currentUser && userTyping.mode ? 'is-typing' : 'is-not-typing'}`}>
                                {(userTyping.fromUser === currentUser && userTyping.mode) ? "מקליד/ה..." : "מקליד/ה..."}
                            </p>

                        </div>
                    </div>


                    <div ref={listMsgRef} className="messeges">
                        <div className='bgcTexture'></div>

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
                                    );
                                }

                                // Display the message without the date
                                return (
                                    <div key={item._id} ref={msg}>
                                        <Messege
                                            messege={item.text}
                                            time={moment(item.dateTime).format("HH:mm")}
                                            send={item.fromUser === currentUser}
                                        />
                                    </div>
                                );
                            }) : null}
                    </div>

                    <div className="footer">
                        <form onSubmit={send} encType='multipart/form-data'>
                            <textarea ref={textareaRef} value={val} onInput={handleInput} onKeyDown={ev => enter(ev)} rows={1} placeholder='הקלדת הודעה...'></textarea>

                            <input id='file' type='file' ></input>
                            <button>
                                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M36.8934 39.7675C38.5907 40.616 40.4737 39.0017 39.8922 37.1946L35.8091 24.5044C35.7288 24.2549 35.5814 24.0323 35.3831 23.861C35.1848 23.6896 34.9432 23.5761 34.6847 23.5329L17.7277 20.7057C16.932 20.5729 16.932 19.43 17.7277 19.2971L34.6833 16.4714C34.942 16.4284 35.1839 16.315 35.3825 16.1437C35.5811 15.9723 35.7287 15.7496 35.8091 15.4999L39.8922 2.80544C40.4737 0.998269 38.5921 -0.61604 36.8934 0.232544L1.18508 18.0828C-0.395032 18.8728 -0.395032 21.1257 1.18508 21.9172L36.8934 39.7675Z" fill="#43AE73" />
                                </svg>
                            </button>
                        </form>

                    </div>
                </section>
                :
                <div className='startChat'>
                    <Lottie animationData={robot} style={{ width: 250 + "px" }} />

                    <h2>{APP_NAME} </h2>
                    <p>מקום לשוחח ולשתף עם חברים</p>
                    <p>על מנת להתחיל שיחה, יש לבחור משתמש תחילה</p>
                    <button onClick={() => setUsersMenu(true)}>התחלה</button>
                </div>
            }

        </div>
    );
}
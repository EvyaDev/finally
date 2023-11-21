import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import UserChat from './components/UserChat';
import moment from "moment";
import { APP_NAME, socket } from './App';
import { GeneralContext, HOSTING_URL } from './App';
import 'moment/locale/he';
import './style/Main.css';
import robot from "./Assets/robot.json"
import Lottie from 'lottie-react';
import { ReactComponent as NewChatIcon } from './Assets/newChat.svg';
import Settings from './Settings';
import { SlOptionsVertical } from "react-icons/sl";
import Chats from './Chats';

export const chatsContext = createContext();

export default function Main() {
    const { userData, usersOnline } = useContext(GeneralContext);

    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

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

    function searchUserHandle(e) {
        setSearchUser(e.target.value)
    }

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

    //convert from "chats" array to group by name
    chats.forEach(chat => {
        const id = chat._id;
        const toUser = chat.toUser;
        const fromUser = chat.fromUser;

        if (!userMessages[toUser]) { userMessages[toUser] = [] }
        if (!userMessages[fromUser]) { userMessages[fromUser] = [] }
        if (!userUnread[fromUser]) { userUnread[fromUser] = null }

        userMessages[fromUser][id] = chat;
        userUnread[fromUser] = Object.values(userMessages[fromUser]).filter(x => (!x.read && x.fromUser === fromUser)).length;
        userMessages[toUser][id] = chat;
    });

    //get all users in application
    useEffect(() => {
        fetch(`${HOSTING_URL}/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.log(err))
    }, [])


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

                //chats screen
                <chatsContext.Provider value={{
                    userData,
                    userUnread,
                    userTyping,
                    val, setVal,
                    chats, setChats,
                    currentUser, setCurrentUser
                }}>
                    <Chats />
                </chatsContext.Provider>
                :
                //start mode
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
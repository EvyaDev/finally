import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { APP_NAME, socket } from './App';
import { GeneralContext, HOSTING_URL } from './App';
import { useNavigate } from 'react-router-dom';
import robot from "./Assets/robot.json";
import moment from "moment";
import Lottie from 'lottie-react';
import { SlOptionsVertical } from "react-icons/sl";
import { ReactComponent as NewChatIcon } from './Assets/newChat.svg';
import Chats from './components/Chats';
import Settings from './Settings';
import UserChat from './components/UserChat';
import userPlaceHolder from "./Assets/images/placeholder.jpg";
import 'moment/locale/he';
import './style/Main.css';

export const chatsContext = createContext();

export default function Main() {
    const { userData, usersOnline } = useContext(GeneralContext);

    const textareaRef = useRef(null);

    const [val, setVal] = useState("");
    const [currentUser, setCurrentUser] = useState(localStorage ? localStorage.lastUserChat : "");
    const [users, setUsers] = useState([]);
    const [chats, setChats] = useState([]);
    const [searchUser, setSearchUser] = useState("");
    const [userUnread, setUserUnread] = useState({});
    const [userTyping, setUserTyping] = useState({});
    const [usersMenu, setUsersMenu] = useState(false);
    const [userMessages, setUserMessages] = useState({});
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [mobileChatScreen, setMobileChatScreen] = useState(false);

    const Navigate = useNavigate();

    //get all users in application
    useEffect(() => {
        fetch(`${HOSTING_URL}/users`)
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => {
                console.log(err);
                Navigate("/login");
            })
    }, [])

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
            setUserTyping(data);
        })

    }, [socket]);

    function searchUserHandle(e) {
        setSearchUser(e.target.value);
    }

    //click on user from list of users
    function clickUser(username) {
        setVal("");
        setCurrentUser(username);
        localStorage.lastUserChat = username;
        setUserUnread({ ...userUnread, [currentUser]: 0 });
        textareaRef.current && textareaRef.current.focus();
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

    return (
        <div className="Main">

            <section className={mobileChatScreen ? "side chatShow" : "side"}>
                <div className="header">
                    <div className='header-right'>
                        <img onClick={() => setSettingsOpen(!settingsOpen)} alt='user-avatar' src={userData.image ? `${HOSTING_URL}/file/${userData.image}` : userPlaceHolder}></img>
                        <p className='title'> <b> {userData.userName}</b> </p>
                    </div>

                    <div className='header-left'>
                        <NewChatIcon style={{ cursor: "pointer" }} onClick={() => { setUsersMenu(!usersMenu); setSettingsOpen(false) }} />
                        <SlOptionsVertical onClick={() => setSettingsOpen(!settingsOpen)} />
                    </div>

                    {usersMenu &&
                        <div className='userList'>
                            <input onInput={searchUserHandle} placeholder='חיפוש משתמש...'></input>
                            {users.length && users.filter(x => (x.userName.includes(searchUser) || x.email.includes(searchUser)) && x.userName !== userData.userName).map((user, i, arr) => {
                                return (
                                    arr.length ?
                                        <div key={user._id} className='userItem'
                                            onClick={() => {
                                                setCurrentUser(user.userName);
                                                localStorage.lastUserChat = user.userName;
                                                setUsersMenu(false);
                                                setMobileChatScreen(true);
                                            }}>
                                            <div className='userItemImage'>
                                                <img alt='user-item-image' src={user.image ? `${HOSTING_URL}/file/${user.image}` : userPlaceHolder} />
                                            </div>
                                            <div className='userItemText'>
                                                <p>@{user.userName}</p>
                                                <p className='email'>{user.email}</p>
                                            </div>
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
                        {Object.keys(userMessages).length ?
                            Object.keys(userMessages).filter(x => x !== userData.userName).map((username) => {
                                const messagesForUser = Object.values(userMessages[username]);
                                messagesForUser.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));

                                return (
                                    <div key={username} onClick={() => {
                                        clickUser(username);
                                        setMobileChatScreen(true);
                                    }}>
                                        <chatsContext.Provider value={{ users }}>
                                            <UserChat
                                                name={username}
                                                count={[username]}
                                                image={username.image}
                                                current={currentUser === username}
                                                lastChat={messagesForUser[0].text}
                                                online={usersOnline.includes(username)}
                                                time={moment(messagesForUser[0].dateTime).format("HH:mm")}
                                                typing={userTyping.fromUser === username && userTyping.mode}
                                            />
                                        </chatsContext.Provider>
                                    </div>
                                )
                            })
                            : <button onClick={() => setUsersMenu(true)}>התחלה</button>
                        }
                    </div>
                </div>
            </section>


            {currentUser ?
                //chats screen
                <chatsContext.Provider value={{
                    users,
                    userData,
                    userUnread,
                    userTyping,
                    val, setVal,
                    chats, setChats,
                    currentUser, setCurrentUser,
                    mobileChatScreen, setMobileChatScreen
                }}>
                    <Chats online={usersOnline.includes(currentUser)} />
                </chatsContext.Provider>
                :
                //start mode screen
                <div className='startChat'>
                    <Lottie animationData={robot} style={{ width: 250 + "px" }} />

                    <h2>{APP_NAME}</h2>
                    <p>מקום לשוחח ולשתף עם חברים</p>
                    <p>על מנת להתחיל שיחה, יש לבחור משתמש תחילה</p>
                    <button onClick={() => setUsersMenu(true)}>התחלה</button>
                </div>
            }

        </div>
    );
}
import './style/App.css';
import Router from './Router';
import { createContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from "socket.io-client"

export const GeneralContext = createContext()
export const APP_NAME = "inChat"
export const HOSTING_URL = "http://localhost:4000"
export const VERSION_APP = "1.0.0"
export const socket = io.connect(HOSTING_URL)


export default function App() {
    const [userData, setUserData] = useState({})
    const [isLogged, setIsLogged] = useState(false)
    const [usersOnline, setUsersOnline] = useState([])
    const Navigate = useNavigate()

    //check if user is logged
    useEffect(() => {
        if (localStorage.token) {
            fetch(`${HOSTING_URL}/login`, {
                credentials: "include",
                headers: { 'authorization': localStorage.token },
            })
                .then(res => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return res.text().then(x => {
                            throw new Error(x);
                        });
                    }
                })
                .then(data => {
                    setIsLogged(true)
                    setUserData(data)
                })
                .catch(err => {
                    Navigate("/login")
                    console.log(err)
                })
        }
    }, [isLogged])


    useEffect(() => {
        if (userData) {
            socket.emit("add-user", userData.userName)
        }
    }, [userData])


    //Online Users
    useEffect(() => {
        const myInterval = setInterval(checkOnline, 2000);

        function checkOnline() {
            if (localStorage.token) {

                if (document.visibilityState === 'visible') {
                    socket.emit("online", userData.userName)

                } else {
                    socket.emit("offline", userData.userName)
                }

                socket.on('onlineUsers', (data) => {
                    setUsersOnline(data);
                });
            } else {
                clearInterval(myInterval)
                return;
            }
        }
    }, [userData, isLogged])


    return (
        <GeneralContext.Provider value={{ userData, setUserData, isLogged, setIsLogged, usersOnline }}>
            <div className="App">
                <div className="frame">
                    <Router />
                </div>
            </div>
        </GeneralContext.Provider>
    );
}
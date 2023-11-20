import React, { useContext, useState } from 'react';
import "./style/Login.css"
import { Link, useNavigate } from 'react-router-dom';
import { GeneralContext, HOSTING_URL } from './App';
import { Logout } from './Logout';

export default function Login() {

    const { userData, setUserData, setIsLogged } = useContext(GeneralContext);
    const [formData, setFormData] = useState({});
    const [err, setErr] = useState("");
    const Navigate = useNavigate()

    function handleInput(e) {
        const { id, value } = e.target;

        setFormData({
            ...formData,
            [id]: value
        })
    }

    function login(e) {
        e.preventDefault();

        fetch(`${HOSTING_URL}/login`, {
            credentials: "include",
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(formData),

        })
            .then(res => res.json())
            .then(data => {

                if (data.Error) {
                    return setErr(data.Error.message)
                } else {
                    setErr("");
                    setIsLogged(true);
                    localStorage.token = data.token;
                    localStorage.lastUserChat = "";
                    setUserData(data)
                    Navigate("/")
                }

            })
            .catch(err => console.log(err))
    }

    return (
        <div className='Login'>
            <div className='sideLogin'>
                <h1>  כניסה</h1>
                <p>מקום לשוחח ולשתף עם חברים</p>
                <form onSubmit={login}>
                    <input id='userNameOrEmail' placeholder='שם משתמש או כתובת מייל' onChange={handleInput}></input>
                    <input type='password' id='password' placeholder='סיסמה' onChange={handleInput}></input>
                    {err && <p>{err}</p>}
                    <button> כניסה</button>
                    <p>עדיין לא רשום? הרשם <Link to={"/register"}><b>כאן</b></Link></p>

                </form>
            </div>
            <img className='bgcLoginImg' alt='' src='https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'></img>
        </div>
    )
}

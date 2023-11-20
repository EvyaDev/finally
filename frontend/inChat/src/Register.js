import React, { useState } from 'react';
import "./style/Register.css"
import { Link, useNavigate } from "react-router-dom"
import { HOSTING_URL } from './App';

export default function Register() {
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

    function register(e) {
        e.preventDefault();

        fetch(`${HOSTING_URL}/signup`, {
            credentials: "include",
            headers: { 'content-type': 'application/json' },
            method: 'POST',
            body: JSON.stringify(formData)
        })
            .then(res => res.json())
            .then((data) => {
                setErr("");
                if (data.Error) {
                    setErr(data.Error.message);
                } else {
                    Navigate("/login");
                }
            })
            .catch(err => console.log(err))
    }

    return (
        <div className='Register'>
            <div className='sideRegister'>
                <h1>הרשמה</h1>
                <p>מקום לשוחח ולשתף עם חברים</p>

                <form onSubmit={register}>
                    <input id='email' type='email' placeholder='כתובת מייל' onChange={handleInput}></input>
                    <input id='userName' placeholder='שם משתמש' onChange={handleInput}></input>
                    <input id='password' placeholder='סיסמה' onChange={handleInput}></input>
                    <button>הרשמה</button>
                    {err && <p>{err}</p>}
                    <p>נרשמת? התחבר <Link to={"/login"}><b>כאן</b></Link></p>

                </form>
            </div>
            <img className='bgcRegisterImg' alt='' src='https://images.unsplash.com/photo-1523821741446-edb2b68bb7a0?auto=format&fit=crop&q=80&w=2070&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'></img>
        </div>
    )
}
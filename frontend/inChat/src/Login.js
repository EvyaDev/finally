import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GeneralContext, HOSTING_URL } from './App';
import robot from "./Assets/robot.json"
import Lottie from 'lottie-react';
import joi from 'joi'
import { JOI_HEBREW } from "./joi-hebrew"
import bgc from "./Assets/images/91657.jpg"
import "./style/Login.css"

export default function Login() {

    const { setUserData, setIsLogged } = useContext(GeneralContext);
    const [formData, setFormData] = useState({});
    const [err, setErr] = useState("");
    const [IsValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState({});

    const Navigate = useNavigate()

    const loginSchema = joi.object({
        userNameOrEmail: joi.string().min(5).required(),
        password: joi.string().min(5).max(12).required(),
    })

    function handleInput(e) {
        const { id, value } = e.target;

        const updateFormData = ({
            ...formData,
            [id]: value
        })

        const schema = loginSchema.validate(updateFormData, { abortEarly: false, allowUnknown: true, messages: { he: JOI_HEBREW }, errors: { language: 'he' } });

        const errors = {};
        if (schema.error) {
            for (const e of schema.error.details) {
                errors[e.context.key] = e.message;
            };
            setIsValid(false)
        } else {
            setIsValid(true)
        }
        setFormData(updateFormData)
        setErrors(errors)
    }

    function login(ev) {
        ev.preventDefault();

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
                    Navigate("/");
                    setIsLogged(true);
                    setUserData(data);
                    localStorage.token = data.token;
                    localStorage.lastUserChat = "";
                }
            })
            .catch(err => console.log(err))
    }

    return (
        <div className='Login'>
            <div className='sideLogin'>
                <h1>כניסה</h1>
                <p>מקום לשוחח ולשתף עם חברים</p>
                <form onSubmit={login}>
                    <input id='userNameOrEmail' placeholder='* שם משתמש או כתובת מייל' onChange={handleInput}></input>
                    <p className="validationError">{errors.userNameOrEmail}</p>

                    <input type='password' id='password' placeholder='* סיסמה' onChange={handleInput}></input>
                    <p className="validationError">{errors.password}</p>
                    {err && <p>{err}</p>}
                    <button disabled={!IsValid}> כניסה</button>
                    <p>עדיין לא רשום? הרשם <Link to={"/register"}><b>כאן</b></Link></p>

                </form>
            </div>
            <div className='animation'>
                <Lottie animationData={robot} style={{ width: 450 + "px" }} />
            </div>

            <img className='bgcLoginImg' alt='background-login' src={bgc}></img>
        </div>
    )
}
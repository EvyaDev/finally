import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom"
import { HOSTING_URL } from './App';
import robot from "./Assets/robot.json"
import Lottie from 'lottie-react';
import joi from 'joi'
import { JOI_HEBREW } from "./joi-hebrew"
import bgc from "./Assets/images/91657.jpg"
import "./style/Register.css"

export default function Register() {
    const [formData, setFormData] = useState({});
    const [err, setErr] = useState("");
    const [isValid, setIsValid] = useState(false);
    const [errors, setErrors] = useState({});
    const [displayImg, setDisplayImg] = useState("");
    const [imageFile, setImageFile] = useState({});

    const Navigate = useNavigate()

    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@#$%^&*_-])/;
    const registerSchema = joi.object({
        email: joi.string().email({ tlds: false }).required(),
        userName: joi.string().min(5).max(12).required(),
        password: joi.string().pattern(passwordRegex).messages({
            'string.pattern.base': 'הסיסמה חייבת לכלול אות גדולה, אות קטנה 4 ספרות וסימן מיוחד',
        }).min(8).max(30).required(),
    })


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
                setImageFile(file);
            }
            reader.readAsDataURL(file);
        }
    }


    async function uploadImage(file) {
        const form = new FormData();
        form.append('myFile', file);

        const imageSrc = await fetch(`${HOSTING_URL}/file/upload`, { method: 'POST', body: form })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Network res was not ok');
                }
                return res.text();
            })
            .then(data => {
                const newFormData = {
                    ...formData,
                    image: data
                }
                setFormData(newFormData);
                return (newFormData);
            })
            .catch(err => { console.error('There has been a problem with your fetch operation:', err) });
        return (imageSrc);
    }

    function handleInput(e) {
        const { id, value } = e.target;

        const updateFormData = ({
            ...formData,
            [id]: value
        })

        const schema = registerSchema.validate(updateFormData, { abortEarly: false, allowUnknown: true, messages: { he: JOI_HEBREW }, errors: { language: 'he' } });

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

    //send form
    async function register(e) {
        e.preventDefault();

        if (Object.keys(imageFile).length) {
            const imgSrc = await uploadImage(imageFile);
        } else {
            console.error('No file selected');
        }
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
                    <input id='email' type='email' placeholder='* כתובת מייל' onChange={handleInput}></input>
                    <p className="validationError">{errors.email}</p>

                    <input id='userName' placeholder='* שם משתמש' onChange={handleInput}></input>
                    <p className="validationError">{errors.userName}</p>

                    <input id='password' placeholder='* סיסמה' onChange={handleInput}></input>
                    <p className="validationError">{errors.password}</p>

                    <label>תמונת משתמש</label>
                    {displayImg && <img src={displayImg} alt='userImg'></img>}
                    <input onChange={imageChange} type='file'></input>

                    <button disabled={!isValid} > הרשמה</button>
                    {err && <p>{err}</p>}
                    <p>נרשמת? התחבר <Link to={"/login"}><b>כאן</b></Link></p>

                </form>
            </div>

            <div className='animation'>
                <Lottie animationData={robot} style={{ width: 450 + "px" }} />
            </div>

            <img className='bgcRegisterImg' alt='background-login' src={bgc}></img>
        </div>
    )
}
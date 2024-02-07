import React, { useContext, useState } from 'react'
import { APP_NAME, GeneralContext, HOSTING_URL, VERSION_APP } from './App';
import { CgRename } from "react-icons/cg";
import { LuInfo } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import joi from 'joi'
import { JOI_HEBREW } from "./joi-hebrew"
import Logout from './Logout';
import "./style/settings.css"

export default function Settings({ close }) {
    const { userData, setUserData } = useContext(GeneralContext);
    const [errors, setErrors] = useState({});
    const [liOpen, setLiOpen] = useState(false);
    const [formData, setFormData] = useState({});
    const [IsValid, setIsValid] = useState(false);
    const [aboutOpen, setAboutOpen] = useState(false);
    const [errorAuthorization, setErrorAuthorization] = useState("");

    const Navigate = useNavigate()

    const userNameSchema = joi.object({
        newUserName: joi.string().min(5).max(12).required(),
    })

    function handleInput(ev) {
        const { id, value } = ev.target;
        setErrorAuthorization("")
        const updateFormData = ({
            ...formData,
            [id]: value
        })

        const schema = userNameSchema.validate(updateFormData, { abortEarly: false, allowUnknown: true, messages: { he: JOI_HEBREW }, errors: { language: 'he' } });

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
        setFormData(updateFormData)
    }

    async function changeUserName(ev) {
        ev.preventDefault();

        if (!window.confirm(' בטוח/ה שברצונך לשנות את שם המשתמש?')) {
            return;
        }

        try {
            const response = await fetch(`${HOSTING_URL}/user`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userData._id, newName: formData.newUserName })
            })

                .then(res => {
                    if (res.ok) {
                        return res.json();
                    } else {
                        return res.text().then(x => {
                            setErrorAuthorization(x);
                            throw new Error(x);
                        });
                    }
                })

                .then(data => {
                    setUserData(data);
                    localStorage.token = data.token;
                    localStorage.lastUserChat = "";
                    Navigate(0);
                    setLiOpen(false);
                })

            if (!response.ok) {
                console.error(`Error: ${response.status}`);
            }

        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className={close ? 'Settings close' : 'Settings'}>
            <p>מחובר כ - <b style={{ fontWeight: "900" }}>{userData.userName}</b></p>
            <p className='mail'>{userData.email}</p>
            <ul>
                <li onClick={() => setLiOpen(!liOpen)} className={liOpen ? 'open' : ''}> <CgRename />שינוי שם משתמש</li>
                <div className={liOpen ? 'open changeUserName' : 'changeUserName'}>
                    <form onSubmit={changeUserName}>
                        <label>שם משתמש חדש:</label>
                        <input onChange={handleInput} id='newUserName' defaultValue={userData.userName}></input>
                        <p className="validationError">{errors.newUserName}</p>
                        {errorAuthorization && <p className="validationError">{errorAuthorization}</p>}
                        <button disabled={!IsValid}>אישור</button>
                    </form>
                </div>

                <li onClick={() => setAboutOpen(!aboutOpen)} className={aboutOpen ? 'open' : ''}> <LuInfo />אודות </li>
                <div className={aboutOpen ? 'open about' : 'about'}>
                    <h3>אודות  - {APP_NAME}</h3>

                    <h4> מטרה ותיאור:</h4>
                    <p>
                        אפליקציה {APP_NAME} הוא פלטפורמה לתקשורת ושיתוף פעולה בין משתמשים. המטרה העיקרית היא ליצור חוויית צ'אט נוחה ומהנה, המספקת יכולות קצה  כמו שיתוף קבצים, צילום וידאו, והתראות בזמן אמת.
                    </p>

                    <h4> תכנים ותכונות: </h4>
                    <ul>

                        <li> שיתוף טקסט בצ'אט פרטי. </li>
                        <li> (בקרוב) אפשרות ליצירת קבוצות והוספת חברים.</li>
                        <li> צ'אטים פרטיים מוצפנים לשמירה על הפרטיות.</li>
                        <li> אפשרות שיתוף מיקום נוכחי ומיקום מדויק.</li>
                        <li> תמיכה במגוון רחב של פלטפורמות: iOS, Android, ומחשבים. </li>
                    </ul>


                    <h4> טכנולוגיה ופיתוח: </h4>
                    <p>
                        האפליקציה פותחה באמצעות React עבור הצד הלקוח, ותשמש על שרתי Node.js וMongoDB על מנת לאפשר יכולות נרחבות של שמירת נתונים והתממשקות עם מסדי נתונים.
                    </p>
                    <h4>צוות ומפתחים:</h4>
                    <p>
                        {APP_NAME}  היא תוצאה של יוזמה פרטית ועבודת צוות קטנה, כוללת מפתחים ומעצבים עם ידע וניסיון מגוונים בתחום הפיתוח.
                    </p>
                    <h4> יצירת קשר:  </h4>
                    <p>
                        אנו מעריכים את את הפידבק שלך ושאלותיך. ליצירת קשר, אנא שלח מייל ל support@inchat.co.il או השתמש בטופס יצירת הקשר באפליקציה.
                    </p>

                    <p className='license'>כל הזכויות שמורות ל- {APP_NAME}  © 2024 </p>
                </div>
                <Logout />
                <p className='version'>גרסה {VERSION_APP}</p>
            </ul>
        </div>
    )
}
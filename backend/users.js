const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const joi = require('joi');
const { JOI_HEBREW } = require('./joi-hebrew');
const moment = require('moment');
const { changeUserNameOnMsgs } = require('./messages');
const customLogger = require('./customLogger');
const { APP_NAME } = require('./config');

require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: '7655714@gmail.com',
        pass: process.env.PASS
    }
});

// Validation
const loginSchema = joi.object({
    userNameOrEmail: joi.string().min(5).required(),
    password: joi.string().min(5).max(12).required(),
});

const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d.*\d.*\d.*\d)(?=.*[!@#$%^&*_-])/;
const signupSchema = joi.object({
    email: joi.string().email({ tlds: false }).required(),
    userName: joi.string().min(5).max(12).required(),
    password: joi.string().pattern(passwordRegex).messages({
        'string.pattern.base': 'הסיסמה חייבת לכלול אות גדולה, אות קטנה 4 ספרות וסימן מיוחד',
    }).min(8).max(30).required()
});

// Email schema
const schema = new mongoose.Schema({
    userName: { type: String, index: true, unique: true },
    email: { type: String, index: true, unique: true },
    password: String,
    image: String,
    createdTime: { type: Date, default: Date.now },
});

const USER = mongoose.model('users', schema);
USER.createIndexes({ "email": 1 });

// REGISTER
async function signUser(req, res) {
    try {
        const { userName, email, password, image } = req.body;
        const user = new USER({
            userName,
            email,
            image,
            password: await bcrypt.hash(password, 10),
        });

        console.log("image server: ", image);

        const schemaValidation = signupSchema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
            messages: { he: JOI_HEBREW },
            errors: { language: 'he' }
        });

        if (schemaValidation.error) {
            let errors = {};

            for (const e of schemaValidation.error.details) {
                errors[e.context.key] = e.message;
            }

            customLogger(`ERROR - user tried signup: user_name: "${userName}",email: "${email}" passwrod: "${password}" | details: "אורך תווים שגוי" `);
            return res.status(403).send({
                Error: { message: "אורך תווים שגוי" },
            });
        } else {
            customLogger(`SUCCESS - user signup: user_name: "${userName}"`);

            const mailOptions = {
                from: 'no-reply@chatflow.co.il',
                to: '7655714@gmail.com', // temporary email address
                subject: `הרשמה לאפליקציית ${APP_NAME}`,
                html: `
                    <body style="direction: rtl;">
                        <h1>נרשמת בהצלחה</h1>
                        <p>שלום וברכה לאפליקצייה שלנו!</p>
                        <h2>שם המשתמש: ${userName}</h2>
                        <h2>סיסמה: ${password}</h2>
                        </br>
                        <p>${moment().format('DD/MM/YYYY HH:mm')}</p>
                    </body>
                `
            };

            const newUser = await user.save();

            delete newUser._doc.password;
            res.send(newUser);

            // send mail
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch (err) {
        console.log(err);
    }
}

// LOGIN
async function loginUser(req, res) {
    try {
        const { userNameOrEmail, password } = req.body;
        const schemaValidation = loginSchema.validate(req.body, {
            abortEarly: false,
            allowUnknown: true,
            messages: { he: JOI_HEBREW },
            errors: { language: 'he' }
        });

        if (schemaValidation.error) {
            let errors = {};

            for (const e of schemaValidation.error.details) {
                errors[e.context.key] = e.message;
            }

            customLogger(`ERROR - user tried login: user_name: "${userNameOrEmail}", password: "${password}" | details: "אורך תווים שגוי" `);
            return res.status(403).send({
                Error: { message: "אורך תווים שגוי" },
            });
        }

        const user = await USER.findOne({
            '$or': [{ 'email': userNameOrEmail }, { 'userName': userNameOrEmail }]
        });

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            customLogger(`ERROR - user tried login: user_name: "${userNameOrEmail}", password: "${password}" | details: "שגיאה בפרטי כניסה" `);
            return res.status(403).send({
                Error: { message: "שם משתמש או סיסמה שגויים" },
            });
        }

        const userRes = user.toObject();
        delete userRes.password;

        userRes.token = jwt.sign({ user: userRes }, process.env.JWT_SECRET, { expiresIn: '5s' });

        customLogger(`SUCCESS - user login: user_name: "${userNameOrEmail}"`);

        res.send(userRes);
    } catch (err) {
        console.log(err);
    }
}

//GET ALL USERS
async function getAllUsers(req, res) {

    const users = await USER.find()
        .then(users => {
            const usersWithoutPassword = users.map(user => {
                const withoutPass = { ...user._doc };
                delete withoutPass.password;
                return withoutPass;
            })
            res.send(usersWithoutPassword)
        })
        .catch(err => {
            res.status(404).send()
            console.log(err)
        })
}

//GET USER BY ID
async function getUserById(req, res) {
    const { id } = req.params;

    const user = await USER.findById(id)
        .then((user) => res.send(user))
        .catch(err => {
            res.status(404).send("user not defined");
            console.log(err)
        })
}

//GET USER FROM TOKEN (decode token)
function getUserByToken(req) {
    if (!req.headers.authorization) {
        return null;
    }
    const data = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);
    return data.user;
}

//CHANGE USERNAME
async function changeName(req, res) {
    const { id, newName } = req.body;

    const filter = { _id: id };
    const update = { userName: newName };
    const users = await (await USER.find()).map(a => a.userName)

    if (users.includes(newName)) {
        res.send(403, "משתמש תפוס");
    } else {
        const userNameById = await USER.findById(id)
        await changeUserNameOnMsgs(userNameById.userName, newName);
        await USER.updateMany(filter, update);

        const userAfterChange = await USER.findById(id)
        const userRes = userAfterChange.toObject();
        delete userRes.password;
        userRes.token = jwt.sign({ user: userRes }, process.env.JWT_SECRET, { expiresIn: '3h' });

        res.send(userRes);
    }
}

exports.signUser = signUser;
exports.loginUser = loginUser;
exports.changeName = changeName;
exports.getUserById = getUserById;
exports.getAllUsers = getAllUsers;
exports.getUserByToken = getUserByToken;
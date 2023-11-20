const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
require("dotenv").config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: '7655714@gmail.com',
        pass: process.env.PASS
    }
});

const shcema = new mongoose.Schema({
    userName: { type: String, index: true, unique: true },
    email: { type: String, index: true, unique: true },
    password: String,
    createdTime: { type: Date, default: Date.now },
})

const USER = mongoose.model('users', shcema)
USER.createIndexes({ "email": 1 },)

//SIGNUP
async function signUser(req, res) {
    const { userName, email, password } = req.body;

    const user = new USER({
        userName,
        email,
        password: await bcrypt.hash(password, 10)
    })

    const mailOptions = {
        from: 'no-reply@chatflow.co.il',
        to: '7655714@gmail.com',
        subject: 'הרשמה לאפליקציית chatFlow',
        html: `<h1>נרשמת בהצלחה</h1>
                <p>שלום וברכה לאפליקצייה שלנו!</p>
                <h2>שם המשתמש: ${userName}</h2>
                </br>
                <p>${moment().format('DD/MM/YYYY HH:mm')}</p>`
    };

    const newUser = await user.save()

        .then(async (user) => {

            delete user._doc.password;
            res.send(user);

            //send mail 
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        })

        .catch(err => {
            if (err.code == 11000) {
                res.status(403).send({
                    Error: { message: "שם משתמש או אימייל תפוס" },
                })
                console.log("בוצע ניסיון להרשם עם מייל או שם משתמש הקיימים במערכת");
            } else {
                console.log("שגיאה");
            }
        })
};

//GET ALL USER
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

//LOGIN
async function loginUser(req, res) {
    const { userNameOrEmail, password } = req.body;
    const user = USER.findOne({
        '$or': [{ 'email': userNameOrEmail }, { 'userName': userNameOrEmail }]
    })
        .then(async user => {

            const passwordMatch = await bcrypt.compare(password, user.password);

            if (!passwordMatch) {
                return res.status(403).send({
                    Error: { message: "שם משתמש או סיסמה שגויים" },
                });
            }
            const userRes = user.toObject();
            delete userRes.password;

            userRes.token = jwt.sign({ user: userRes }, process.env.JWT_SECRET, { expiresIn: '3h' });
            res.send(userRes)
        })
        .catch(err => {

            res.status(403).send({
                Error: { message: "שם משתמש או אימייל שגוי" },
            })
            console.log(err);
        })
}


exports.signUser = signUser;
exports.loginUser = loginUser;
exports.getUserById = getUserById;
exports.getUserByToken = getUserByToken;
exports.getAllUsers = getAllUsers;
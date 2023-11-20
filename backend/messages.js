const mongoose = require('mongoose');
const moment = require('moment');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const shcema = new mongoose.Schema({
    dateTime: { type: Date, default: Date.now },
    fromUser: String,
    toUser: String,
    text: String,
    read: Boolean,
    img: String
})

const MESSAGES = mongoose.model('messages', shcema)

//ADD MESSAGE
async function addMessage(data) {
    const { fromUser, toUser, text, url } = data;

    const message = new MESSAGES({
        fromUser,
        toUser,
        text,
        read: false,
        img: url
    })
    const newDocument = await message.save();

    return (newDocument);
}

//GET ALL MESSAGES
async function getMessages() {
    const messages = await MESSAGES.find()
    return (messages);
}

//READ
async function readUpdate(req, res) {
    const { from, to } = req.body;
    console.log(from, to);

    const updateMsg = await MESSAGES.updateMany({ $and: [{ fromUser: from }, { toUser: to }] }, { read: true })
    console.log(updateMsg);

    res.send();
}

//GET MESSAGE BY userName
async function getMessagesByUserName(userName) {

    const result = await MESSAGES.find({ $or: [{ fromUser: userName }, { toUser: userName }] })
    return (result)
}

exports.getMessages = getMessages;
exports.addMessage = addMessage;
exports.getMessagesByUserName = getMessagesByUserName;
exports.readUpdate = readUpdate;
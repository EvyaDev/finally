const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require("dotenv").config();

const shcema = new mongoose.Schema({
    dateTime: { type: Date, default: Date.now },
    fromUser: String,
    toUser: String,
    text: String,
    read: Boolean,
})

const MESSAGES = mongoose.model('messages', shcema)

//ADD MESSAGE
async function addMessage(data) {
    const { fromUser, toUser, text } = data;

    const message = new MESSAGES({
        fromUser,
        toUser,
        text,
        read: false,
    })

    const newDocument = await message.save();
    return (newDocument);
}

//GET ALL MESSAGES
async function getMessages() {
    const messages = await MESSAGES.find()
    return (messages);
}

//DELETE MESSAGES
async function deleteMsg(data) {
    const { msgId } = data;
    const deleteMsg = await MESSAGES.deleteOne({ _id: msgId });
    return (deleteMsg);
}

//GET MESSAGE BY userName
async function getMessagesByUserName(userName) {

    const result = await MESSAGES.find({ $or: [{ fromUser: userName }, { toUser: userName }] })
    return (result)
}

//CHANGE USERNAME IN MESSAGES
async function changeUserNameOnMsgs(userNameById, newName) {

    const filterFrom = { fromUser: userNameById };
    const filterTo = { toUser: userNameById };
    const updateFrom = { fromUser: newName };
    const updateTo = { toUser: newName };

    await MESSAGES.updateMany(filterFrom, updateFrom)
    await MESSAGES.updateMany(filterTo, updateTo)
}

exports.deleteMsg = deleteMsg;
exports.addMessage = addMessage;
exports.getMessages = getMessages;
exports.changeUserNameOnMsgs = changeUserNameOnMsgs;
exports.getMessagesByUserName = getMessagesByUserName;
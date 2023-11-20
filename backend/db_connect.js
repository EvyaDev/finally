const mongoose = require("mongoose")

async function con() {
    await mongoose.connect('mongodb://127.0.0.1:27017/chatFlow');
    console.log('mongodb connection established on port 27017');
}

exports.con = con;
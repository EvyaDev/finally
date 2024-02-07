require("dotenv").config();
const jwt = require('jsonwebtoken');

module.exports = async (token) => {

    return new Promise((resolve, reject) => {
        jwt.verify(token, process.env.JWT_SECRET, (err) => {
            if (err) {
                resolve(false)
            } else {
                resolve(true)
            }
        });
    });
}
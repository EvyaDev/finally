const authGuard = require("./auth-guard");
const { uploadFile } = require("./files");
const { getMessages, addMessage, getMessagesByUserName, readUpdate } = require("./messages");
const { signUser, loginUser, getUserById, getUserByToken, getAllUsers, logout } = require("./users");

module.exports = (app) => {
    app.get('/', (req, res) => {
        res.send("Welcome to API server");
    });

    app.get('/login', authGuard, async (req, res) => {
        const user = getUserByToken(req);
        res.send(user);
    });
    app.get('/my-messages/:userName', authGuard, getMessagesByUserName)
    app.get('/users', getAllUsers)
    app.get('/user/:id', getUserById)

    app.post('/signup', signUser);
    app.post('/login', loginUser);
    app.post('/files/upload', uploadFile);
    app.put('/read', readUpdate);
}
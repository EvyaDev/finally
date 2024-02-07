const authGuard = require("./auth-guard");
const { uploadFile, getFile } = require("./files");
const { getMessagesByUserName } = require("./messages");
const { signUser, loginUser, getUserById, getUserByToken, getAllUsers, changeName } = require("./users");

module.exports = (app) => {

    //GET Methods
    app.get('/', (req, res) => { res.send("Welcome to API server") });

    app.get('/login', authGuard, async (req, res) => {
        const user = getUserByToken(req);
        res.send(user);
    });

    app.get('/my-messages/:userName', authGuard, getMessagesByUserName);
    app.get('/users', getAllUsers);
    app.get('/user/:id', getUserById);
    app.get('/file/:name', getFile);

    //POST Methods
    app.post('/signup', signUser);
    app.post('/login', loginUser);
    app.post('/file/upload', uploadFile);

    //PUT Methods
    app.put('/user', changeName);
}
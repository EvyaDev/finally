const express = require("express")
const cors = require("cors");
const app = express();
const { con } = require("./db_connect");
const { Server } = require("socket.io");
const customLogger = require('./customLogger');
const morgan = require('morgan');
const http = require("http");
const fs = require('fs');
const path = require('path');
const server = http.createServer(app);


app.use(express.json());

const io = new Server(server, {
    cors: {
        origin: true,
        methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
        credentials: true,
        allowedHeaders: 'Authorization,content-type,accept',
    }
});

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'methods.log'), { flags: 'a' })
app.use(morgan(':method - url: ":url" status: :status | (:response-time ms) [:date[web]]', { stream: accessLogStream }))


con().catch(err => console.log(err));

app.use(cors({
    origin: true,
    methods: 'GET,PUT,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Authorization,content-type,accept',
}));

server.listen(4000, () => {
    console.log("the server is run...")
})

require("./socket")(io);
require("./router")(app);
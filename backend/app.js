const express = require("express")
const cors = require("cors");
const app = express();
const { con } = require("./db_connect");
// const { Server } = require("socket.io")
const http = require("http");

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
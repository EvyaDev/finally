const { getFile } = require("./files");
const { addMessage, getMessagesByUserName } = require("./messages");
const socketGuard = require("./socket-guard");

module.exports = (io) => {
    const conectedUsers = new Map();
    const onlineUsers = {};

    io.on("connect", async (socket) => {
        console.log("connect to socket server with: ", socket.id);
        socket.on("add-user", (userName) => {
            conectedUsers.set(userName, socket.id);
            console.log("user connect: ", userName);
            console.log("map is: ", conectedUsers);
        })


        socket.on("send-msg", async (data) => {
            const access = await socketGuard(data.token);
            const toUserSocket = conectedUsers.get(data.toUser);

            if (access) {

                const newDocument = await addMessage({ fromUser, toUser, text, imgUrl } = data);
                socket.to(toUserSocket).emit('new-msg', newDocument);
            } else {
                socket.emit('new-msg', "not user allowed");
            }
        })


        socket.on("start-typing", (data) => {
            const toUserSocket = conectedUsers.get(data.toUser);
            socket.to(toUserSocket).emit('typing', { fromUser: data.fromUser, mode: true })
        })
        socket.on("end-typing", (data) => {
            const toUserSocket = conectedUsers.get(data.toUser);
            socket.to(toUserSocket).emit('typing', { fromUser: data.fromUser, mode: false })
        })


        socket.on("get-msgs-by-user", async (data) => {

            const access = await socketGuard(data.token);
            if (access) {
                const res = await getMessagesByUserName(data.userName);
                socket.emit('res-msgs-by-user', res);
            } else {
                socket.emit('res-msgs-by-user', "not allowed");
            }
        })


        socket.on("online", async (userName) => {
            onlineUsers[userName] = true;
            const online = Object.keys(onlineUsers).filter(user => onlineUsers[user])
            socket.emit('onlineUsers', online)
        })
        socket.on("offline", async (userName) => {
            onlineUsers[userName] = false;
            const offline = Object.keys(onlineUsers).filter(user => !onlineUsers[user])
            socket.emit('onlineUsers', offline)
        })


        socket.on("disconnect", () => {
            console.log("disconnect from socket server userId: ", socket.id);
        })
    })
}
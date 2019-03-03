import * as express from "express";
import * as socketio from "socket.io";
import * as path from "path";
import {Express} from "express";

const app: Express = express();
app.set("port", process.env.PORT || 3000);

let id_generator: number = 0;
let current_id: number = 0;
let handraisings: string[] = [];

let http = require("http").Server(app);
let io = socketio(http);

app.get("/", (req: any, res: any) => {
    res.sendFile(path.resolve("./dist/index.html"));
});

function isNewHandraising(data: any) {
    for (let i = current_id; i < handraisings.length; i++) {
        if (handraisings[i] === data.username) {
            return false;
        }
    }
    return true;
}

function escapeHtml(unsafe: string) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

io.on("connection", function (socket: socketio.Socket) {
    console.log("a user connected");
    socket.emit('status', {handraisings: handraisings, current_id: current_id});

    socket.on('raise_hand', (data) => {
        console.log(data);
        if (isNewHandraising(data)) {
            let username = escapeHtml(data.username);
            handraisings.push(username);
            io.emit('raise_hand', {username: username, id: id_generator++});
        }
    });
    socket.on('withdraw', (data: any) => {
        console.log(data);
        let username = escapeHtml(data.username);
        for (let i = current_id; i < handraisings.length; i++) {
            if (handraisings[i] === username) {
                handraisings.splice(i, 1);
            }
        }
        io.emit('withdraw', {username: username});
    });
    socket.on('next', () => {
        console.log('next');
        current_id = Math.min(handraisings.length, current_id + 1);
        io.emit('goto_id', {id: current_id});
    });
    socket.on('previous', () => {
        console.log('previous');
        current_id = Math.max(0, current_id - 1);
        io.emit('goto_id', {id: current_id});
    });
});

http.listen(3000, function () {
    console.log("listening on *:3000");
});
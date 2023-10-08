const express = require("express");
const dotenv = require("dotenv");
const {chats} = require('./data/data');
const connectDB = require("./config/db");
const userRoutes = require('./routes/userRoutes');
const chatRoutes = require('./routes/chatRoutes');
const messageRoutes = require('./routes/messageRoutes');
const { errorHandler, notFound } = require("./middleware/errorMiddleware");
const app = express();
dotenv.config();
connectDB();
app.use(express.json());
app.get('/', (req, res) =>{
    res.send('app is running');
})
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/message', messageRoutes)

app.use(notFound);
app.use(errorHandler);
const server = app.listen(process.env.PORT, console.log(process.env.PORT));
const io = require("socket.io")(server, {
    pingTimeout:10000,
    cors:{
        origin: "http://localhost:3000" //means that web apps running on  "http://localhost:3000" are only allowed to establish connections to the server
    }
})
io.on("connection", (socket)=>{
    console.log("connected to socket.io");
    socket.on('setup', (userData) =>{  //function is to create a room/socket for a particular user with their id(so exclusive), takes user data from frontend
        socket.join(userData._id);//creates the room
        socket.emit("connected");
    });
    socket.on('join chat', (room) =>{  //function is to create a room/socket for a particular user with their id(so exclusive), takes user data from frontend
        socket.join(room);//creates the room
        console.log("User Joined Room:" + room) //creates a room between users, so if anohther user join, it will add them to this room
    });
    socket.on("new message", (newMessageRecieved)=>{
        var chat = newMessageRecieved.chat;
        if(!chat.users) return console.log("chat.users not defined");
        chat.users.forEach(user =>{
            if(user._id == newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved", newMessageRecieved); //emitting to users that are in a room who aren't the user sending
        })
    })
    socket.on("typing",(room)=> socket.in(room).emit("typing"))//emitting is just like talking to frontend/backend
    socket.on("stop typing",(room)=> socket.in(room).emit("stop typing"))
    socket.off("setup", () => {
        console.log("USER DISCONNECTED");
        socket.leave(userData._id); //leave room created by user
    })
});
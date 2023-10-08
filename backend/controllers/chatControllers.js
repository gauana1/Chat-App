const asyncHandler = require('express-async-handler');
const Chat = require('../models/chatModel');
const User = require('../models/userModel');
const accessChat = asyncHandler(async(req,res)=> //function is to access chats
{
    const {userId} = req.body; //API is sending this request, so get the other userID from the request
    if(!userId){
        console.log("UserId param not sent with request");
        return res.sendStatus(400);
    }
    var isChat = await Chat.find({ //find if a group chat doesn't exist
        isGroupChat:false,
        $and:[
            {users:{$elemMatch:{$eq:req.user._id}}}, //both the userID that the API sends and the client using the service have to be in the chat
            {users:{$elemMatch:{$eq:userId}}}
        ],
    }).populate("users", "-password").populate('latestMessage'); //popoluate other fields
    isChat = await User.populate(isChat,{
        path:'latestMessage.sender', 
        select:"name email",
    });
    if(isChat.length >0){
        res.send(isChat[0])
    }else{
        var chatData ={
            chatName:"sender", 
            isGroupChat:false, 
            users:[req.user._id, userId]
        }

        try {
            const createdChat = await Chat.create(chatData);
            const FullChat= await Chat.findOne({_id:createdChat._id}).populate("users", "-password");
            res.status(200).json(FullChat);

        } catch (error) {
            res.status(400);
            throw new Error(error.message);
        }
    }

});

const fetchChats =asyncHandler(async(req,res)=>{
    try {
        Chat.find({users:{$elemMatch:{$eq:req.user._id}}})
        .populate("users", "-password")
        .populate("groupAdmin", "-password")
        .populate("latestMessage")
        .sort({updatedAt:-1})
        .then(async(results) =>{
            results = await User.populate(results, {
                path:"latestMessage.sender", 
                select:"name email"
            });
            res.status(200).send(results);
        });
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});

const createGroupChat = asyncHandler(async(req, res)=>
{
    console.log(req.body);
    if(!req.body.users|| !req.body.name){

        return res.status(400).send({message:"please fill in all fields"})
    }
    var users  = JSON.parse(req.body.users);
    if(users.length<2){
        return res.status(400).send("More than 2 Users Required");
    }
    users.push(req.user);
    try {
        const groupChat = await Chat.create({
            chatName:req.body.name, 
            users, 
            groupChat:true, 
            groupAdmin:req.user
        });

        const fullGroupChat = await Chat.findOne({_id:groupChat._id})
        .populate('users', '-password')
        .populate("groupAdmin", '-password')
        res.status(200).json(fullGroupChat);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
})

const renameGroup  = asyncHandler(async(req, res)=> {
    const {chatId, chatName} = req.body; 
    const updatedChat = await Chat.findByIdAndUpdate(
        chatId, 
        {
            chatName
        },
        {
            new:true
        }
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    if(!updatedChat){
        res.status(404);
        throw new Error("Chat not Found");
    }else{
        res.json(updatedChat);
    }
})

const addToGroup = asyncHandler(async(req, res)=>
{
    const {chatId, userId}  = req.body; 
    const added = await Chat.findByIdAndUpdate(
        chatId, 
        {
            $push:{users:userId}, 
        },
        {new:true}
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    if(!added){
        res.status(404);
        throw new Error("chat not found");
    }else{
        res.json(added);
    }
})

const removeFromGroup = asyncHandler(async(req, res)=>
{
    const {chatId, userId}  = req.body; 
    const removed = await Chat.findByIdAndUpdate(
        chatId, 
        {
            $pull:{users:userId}, 
        },
        {new:true}
    )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");
    if(!removed){
        res.status(404);
        throw new Error("chat not found");
    }else{
        res.json(removed);
    }
})
module.exports = {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removeFromGroup}
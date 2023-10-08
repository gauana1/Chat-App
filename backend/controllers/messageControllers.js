const expressAsyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const sendMessage = expressAsyncHandler(async(req,res) =>{
    const {content, chatId} = req.body;
    if(!content||!chatId){
        console.log("Invalid data passed into request");
        return res.sendStatus(400);
    }

    var newMessage  = {
        sender:req.user._id, 
        content:content, 
        chat:chatId
    };
    try {
        var message = await Message.create(newMessage);
        message = await message.populate("sender", "name"); // populate is used to in the message model, you want to instead of using a reference actually see the fields you can use populate, so easier to look at data sort of
        message = await message.populate("chat");
        message = await User.populate(message, {
            path:"chat.users", 
            select:"name email" , 
        }); // end result is that this message document contains all relevant info and makes it easy to work/interface with
        await Chat.findByIdAndUpdate(req.body.chatId, { //find the chat by id and updates the message
            lastestMessage: message
        });
        res.json(message);
    } catch (error) {
        console.log(error);
    }
});

const allMessages = expressAsyncHandler( async (req,res) =>{
    try {
        const messages = await Message.find(({chat:req.params.chatId})).populate("sender", "name email").populate("chat");
        res.json(messages);
    } catch (error) {
        res.status(400);
        throw new Error(error.message);
    }
});
module.exports = {sendMessage, allMessages};
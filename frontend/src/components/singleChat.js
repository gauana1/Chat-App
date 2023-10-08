import { Box, IconButton, Text, Spinner, FormControl, Input, useToast, RangeSlider } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ChatState } from "../context/chatProvider";
import { ArrowBackIcon } from "@chakra-ui/icons";
import { getSender } from "../config/chatLogic";
import "./styles.css";
import ScrollableChat from "./scrollableChat";
import UpdateGroupChatModel from "./miscillaneous/updateGroupChatModel";
import animationData from "../animations/typing.json"
import Lottie from 'react-lottie';
import io from "socket.io-client";
const ENDPOINT = "http://localhost:5500"; //this changes if you have deployed the app on the web
var socket, selectedChatCompare;

const SingleChat = ({fetchAgain, setFetchAgain}) => {
    const [messages, setMessages]  =useState([]);
    const [loading, setLoading] = useState(false);
    const [newMessage, setNewMessage] = useState();
    const {user, selectedChat, setSelectedChat, notification, setNotification} = ChatState();
    const [socketConnected, setSocketConnected] = useState(false);
    const [typing, setTyping] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const defaultOptions = {
        loop:true, 
        autoplay:true, 
        animationData:animationData, 
        rendererSettings:{
            preserveAspectRatio: "xMidYMid slice"
        }
    }
    const toast = useToast();
    const sendMessage= async (e)=>{
        if(e.key === "Enter" && newMessage){
            socket.emit("stop typing", selectedChat._id);
            try {
                setNewMessage("");
                const response = await fetch("/api/message/", {
                    method:"POST",
                    body:JSON.stringify({
                        content:newMessage, 
                        chatId:selectedChat._id
                    }), 
                    headers:{
                        "Content-Type":"application/json", 
                        Authorization: `Bearer ${user.token}`
                    }
                });
                const data= await response.json();
                socket.emit("new message", data)
                setMessages([...messages, data]);
                
    
            } catch (error) {
                toast({
                    title:"Error Occured!", 
                    description:"Failed To Send Message", 
                    status:"error", 
                    duration:5000, 
                    isClosable:true, 
                    position:"bottom"
                });
            }
        }
    };
    const fetchMessages = async () => {
        if(!selectedChat) return;
        try {
            setLoading(true);
            const response = await fetch(`/api/message/${selectedChat._id}`, {
                method:"GET", 
                headers:{
                    Authorization:`Bearer ${user.token}`}
            })
            const data = await response.json();
            setMessages(data);
            setLoading(false);
            socket.emit("join chat", selectedChat._id); //so everytime a user selects a chat, they join that chatroom
        } catch (error) {
            toast({
                title:"Error Occured!", 
                description:"Failed To Load Messages", 
                status:"error", 
                duration:5000, 
                isClosable:true, 
                position:"bottom"
            });
        }
    };
    useEffect(()=>{
        socket = io(ENDPOINT); //create socket on frontend
        socket.emit("setup", user); //send smth to backend
        socket.on("connected",()=> setSocketConnected(true));
        socket.on("typing", ()=> setIsTyping(true));
        socket.on("stop typing", ()=> setIsTyping(false));
    }, []); 
    useEffect(()=>{
        fetchMessages();
        selectedChatCompare = selectedChat;
    }, [selectedChat])

    useEffect(()=> {
        socket.on("message recieved", (newMessageRecieved) => {
            if(!selectedChatCompare || selectedChatCompare._id !== newMessageRecieved.chat._id)
            {
                if(!notification.includes(newMessageRecieved)){
                    setNotification([newMessageRecieved, ...notification]);
                    setFetchAgain(!fetchAgain); //triggers the usereffect to re render chats
                }

            }
            else{
                setMessages([...messages, newMessageRecieved])
            }
        });

    });
    const typingHandler= (e)=>{ //activates on every keystroke
        setNewMessage(e.target.value);
        if(!socketConnected) return;
        if(!typing){
            setTyping(true);
            socket.emit("typing", selectedChat._id);
        }
        let lastTypingTime = new Date().getTime(); 
        var timerLength = 3000;
        setTimeout(()=>{
            var timeNow = new Date().getTime();
            var timeDiff = timeNow - lastTypingTime;
            if(timeDiff >=timerLength && typing){
                socket.emit("stop typing", selectedChat._id);
                setTyping(false);
            }

        }, timerLength)
    };
    return (
        <>
        {selectedChat ? (
            <>
            <Text
                fontSize ={{base:"28px", md:"30px"}}
                pb = {3}
                px = {2}
                w = "100%"
                fontFamily = "Work Sans"
                display = "flex"
                justifyContent={{base:"space-between"}}
                alignItems = "center"
                >
                <IconButton
                    display = {{base:'flex', md:"none"}}
                    icon = {<ArrowBackIcon/>}
                    onClick = {()=>setSelectedChat("")}
                    />
                {!selectedChat.groupChat ? (
                    <>{getSender(user, selectedChat.users)}</>
                ): (<>{selectedChat.chatName}
                <UpdateGroupChatModel fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages = {fetchMessages}/></>)
                }

            </Text> 
            <Box
                display="flex"
                flexDir="column"
                justifyContent="flex-end"
                p={3}
                bg="#E8E8E8"
                w="100%"
                h = "93%"
                borderRadius="lg"
                overflowY="hidden"
                overflowX="hidden" 
            >
            {loading?(<Spinner size = "xl" w = {20} h = {20} alignSelf = "center" margin = "auto"/>):
            <div className = "messages">
                <ScrollableChat messages = {messages} />
                </div>}
            <FormControl onKeyDown={sendMessage} isRequired mt = {3}>
                {isTyping?<Lottie options = {defaultOptions} height = {35} width = {35} style= {{marginBottom:5, marginLeft:0}}/>:<></>}
                <Input
                variant = "filled"
                bg = "#E0E0E)"
                placeholder = "Enter a message..."
                onChange = {typingHandler}
                value = {newMessage} 
                />
            </FormControl>
            </Box> 
            </>
        ) :(
            <Box display = "flex" alignItems = "center" justifyContent = "center"  h = "100%">
                <Text fontSize = "3xl" pb = {3} fontFamily = "Work Sans">
                    Click on User to Start Chat
                </Text>
            </Box>
        )}
        </>
    );
}
 
export default SingleChat;
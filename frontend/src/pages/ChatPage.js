import { Box } from "@chakra-ui/react";
import { ChatState } from "../context/chatProvider";
import SideDrawer from "../components/miscillaneous/sideDrawer";
import MyChats from "../components/myChats";
import ChatBox from "../components/chatBox";
import { useState } from "react";

const ChatPage = () => {
    const {user} = ChatState();
    const [fetchAgain, setFetchAgain] = useState(false);
    const [countNotifications, setCountNotifactions] = useState(0);
    return ( 
        <div style = {{width : '100%'}}>
            {user && <SideDrawer />}
            <Box
            display = "flex"
            justifyContent='space-between'
            width = '100%'
            height = '91vh'
            padding = '10px'>    
                {user && <MyChats fetchAgain = {fetchAgain} />}
                {user && <ChatBox fetchAgain = {fetchAgain} setFetchAgain = {setFetchAgain}/>}
            </Box>
        </div>
     );
}
 
export default ChatPage;
import { Input, Avatar, Box, Button, Menu, MenuButton, MenuItem, MenuList, Text, Tooltip, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Toast, useToast, Spinner, Badge } from "@chakra-ui/react";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { ChatState } from "../../context/chatProvider";
import ProfileModel from "./profileModel";
import { useDisclosure } from "@chakra-ui/react";
import ChatLoading from "../chatLoading";
import UserListItem from "../UserAvatar/UserListItem"
import { getSender } from "../../config/chatLogic";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();
  const { user, setSelectedChat, chats, setChats, notification, setNotification} = ChatState();
  const [countNotifications, setCountNotifications] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  useEffect(() => {
    setCountNotifications(notification.length);
  }, [notification]);
  const handleSearch = async()=> {
    if(!search){
        toast({
            title:"Please Enter Something in Search",
            status:"warning", 
            duration:1000, 
            isClosable: true, 
            position:"top-left"

        });
        return;

    }
    try {
        setLoading(true);
        const response = await fetch(`/api/user?search=${search}` ,{
            method:"GET", 
            headers:{
                Authorization:`Bearer ${user.token}`
            }
        }
        );
        const data = await response.json();
        setSearchResult(data);
        setLoading(false);
    } catch (error) {
        toast({
            title:"Error Occured",
            description: "Failed to load search",
            status:"error", 
            duration:1000, 
            isClosable: true, 
            position:"bottom-left"

        });
    }
  }
  const accessChat = async(userId)=>{
        try {
            setLoadingChat(true);
            const response = await fetch('api/chat', {
                method:"POST", 
                body: JSON.stringify({userId}), 
                headers:{
                    "Content-type":"application/json", 
                    Authorization:`Bearer ${user.token}`
                }
            })
            const data = await response.json();
            console.log(data);
            if(!chats.find((c)=>c._id === data._id)) setChats([data,...chats]);
            setSelectedChat(data);
            console.log(data);
            notification.filter((notif)=>notif.chat !== data.chat);
            setLoadingChat(false);
            onClose();
        } catch (error) {
            toast({
                title:"Error Fetching Chat",
                description:error.message, 
                status:"error",
                duration:1000, 
                isClosable: true, 
                position:"bottom-left"
    
            });
            setLoadingChat(false);
        }
  }
  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        backgroundColor="white"
        width="100%"
        padding="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to Chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick = {onOpen}>
            <Text d={{ md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>

        <Text fontSize="25" fontFamily="Work Sans">
          Chat App
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <BellIcon fontSize="2xl" margin={1} />
              <Badge colorScheme="red" variant = "solid" >{notification.length}</Badge>
            </MenuButton>
            <MenuList pl = {2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif)=>(
                <MenuItem key = {notif._id} onClick ={()=>{
                  setSelectedChat(notif.chat);
                  setNotification(notification.filter((n) => n.chat !== notif.chat));
                }}>
                  {notif.chat.GroupChat?`New Message in ${notif.chat.chatName}`:`Message from ${getSender(user, notif.chat.users)}`}

                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar size="sm" cursor="pointer" name={user.name} />
            </MenuButton>
            <MenuList>
              <ProfileModel user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModel>
              <MenuItem>Logout </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement = "left" onClose = {onClose} isOpen = {isOpen}>
        <DrawerOverlay/>
        <DrawerContent>
            <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
            <DrawerBody>
            <Box display = "flex" pb = {2}>
                <Input
                placeholder = "Search by name or email"
                mr = {2}
                value = {search}
                onChange= {(e)=> setSearch(e.target.value)}/>
                <Button onClick = {handleSearch}>
                    Go
                </Button>
            </Box>
            {loading ? (
                <ChatLoading/>) : (
                searchResult?.map((user)=>(
                    <UserListItem key = {user._id} user = {user} handleFunction = {()=>accessChat(user._id)}/>
                ))
            )} 
            {loadingChat && <Spinner ml = 'auto'  display= 'flex'/>}
        </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;

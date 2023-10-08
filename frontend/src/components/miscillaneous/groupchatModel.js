import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, useDisclosure, Button, useToast, Box } from "@chakra-ui/react";
import { useState } from "react";
import { FormControl, Input } from "@chakra-ui/react";
import { ChatState } from "../../context/chatProvider";
import UserListItem from "../UserAvatar/UserListItem"
import UserBadgeItem from "../UserAvatar/useBadgeItem";
const GroupChatModel = ({children}) => {
    const {isOpen, onOpen, onClose} = useDisclosure();
    const [groupChatName, setGroupChatName] = useState();
    const {user, chats, setChats} = ChatState();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSearch = async (query) =>{
        setSearch(query)
        if(!query){
            return;
        }
        try {
            setLoading(true);
            const response = await fetch(`/api/user?search=${search}`, {
                method:"GET", 
                headers:{
                    Authorization: `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            console.log(data);
            setLoading(false);
            setSearchResults(data);
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to Load Search Results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
              });
        }
    };
    const handleSubmit = async () =>{
        if(!groupChatName || !selectedUsers){
            toast({
                title: "Fill in all the fields ",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top",
              });
              return;
        }
        try {
            const response = await fetch("/api/chat/group", {
                method:"POST", 
                body:JSON.stringify({
                    name:groupChatName, 
                    users:JSON.stringify(selectedUsers.map((user) => user._id))
                }),
                headers:{
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                }
            });
            const data = await response.json();
            console.log(data);
            setChats([data, ...chats]);
            onClose();
            toast({
                title: "New Group Chat Created",
                status: "success",
                duration: 3000,
                isClosable: true,
                position: "bottom",
              });

        } catch (error) {
            console.log(error);
            toast({
                title: "Failed to Create Chat",
                status: "error",
                duration: 3000,
                isClosable: true,
                position: "bottom",
              });
        }
    };
    const handleGroup = (userToAdd) => {
        if(selectedUsers.includes(userToAdd)){
            toast({
                title: "User Already Added",
                status: "warning",
                duration: 3000,
                isClosable: true,
                position: "top",
              });
            return;
        }
        setSelectedUsers([...selectedUsers, userToAdd]);
        
    };
    const handleDelete = (delUser) => {
        setSelectedUsers(selectedUsers.filter((sel=> sel._id !== delUser._id)));
    };
    return (
        <>
          <span onClick={onOpen}>{children}</span>
    
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader
              fontSize = "35px"
              fontFamily = "Work Sans"
              display = "flex"
              justifyContent = "center"
              >Create Group Chat
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody display = "flex" flexDir = "column" alignItems = "center">
                    <FormControl>
                        <Input placeholder = "Chat Name" mb = {3} onChange = {(e) => setGroupChatName(e.target.value)}/>
                    </FormControl>
                    <FormControl>
                        <Input placeholder = "Add Users" mb = {1} onChange = {(e) => handleSearch(e.target.value)}/>
                    </FormControl>
                    <Box w = "100%" display = "flex" flexWrap = "wrap">
                    {selectedUsers.map((u) => (
                        u._id !== user._id ? (
                            <UserBadgeItem key={u._id} user={u} handleFunction={() => handleDelete(u)} />
                        ) : null
                    ))}
                    </Box>
                    {loading ? <div>Loading</div>:(
                        searchResults?.slice(0,4).map((user) =>(
                            <UserListItem key = {user._id}  user = {user} handleFunction ={()=>handleGroup(user)}/>
                        ))
                    )}
              </ModalBody>
    
              <ModalFooter>
                <Button colorScheme='blue' mr={3} onClick={handleSubmit}>
                  Create Chat
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </>
      )
}
 
export default GroupChatModel;
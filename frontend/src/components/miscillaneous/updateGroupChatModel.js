import { ViewIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  FormControl,
  Input,
  useToast,
  Box,
  IconButton,
  Spinner,
} from "@chakra-ui/react";
import { useState } from "react";
import { ChatState } from "../../context/chatProvider";
import UserBadgeItem from "../UserAvatar/useBadgeItem";
import UserListItem from "../UserAvatar/UserListItem";
const UpdateGroupChatModel = ({fetchAgain, setFetchAgain, fetchMessages}) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [groupChatName, setGroupChatName] = useState("");
    const [search, setSearch] = useState("");
    const [searchResult, setSearchResult] = useState([]);
    const [loading, setLoading] = useState(false);
    const [renameLoading, setRenameLoading] = useState(false);
    const toast = useToast();
    const {selectedChat, setSelectedChat, user} = ChatState();
    const handleRemove = async (user1) =>{
      if(selectedChat.groupAdmin._id !== user._id){
        toast({
          title:"Only Admins Can Remove Someone!",
          status:'error',
          duration:5000, 
          isClosable:true,
          position:'bottom'
        })
        return;
      }
      try {
        setLoading(true);
        const response = await fetch("api/chat/groupremove", {
          method:"PUT", 
          body:JSON.stringify({
            chatId:selectedChat._id, 
            userId:user1._id,
          }),
          headers:{
            'Content-Type': 'application/json',
            Authorization:`Bearer ${user.token}` 
          }
        });
        const data = await response.json();
        user1._id === user._id ? setSelectedChat():setSelectedChat(data);
        setFetchAgain(!fetchAgain);
        fetchMessages();
        setLoading(false);
      } catch (error) {
        toast({
          title:"Error Occured!",
          description:error.response.data.message,
          status:'error',
          duration:5000, 
          isClosable:true,
          position:'bottom'
        })
        setLoading(false);
      }
  };  
  const handleAddUser = async (user1) => {
        if(selectedChat.users.find((u)=> u._id == user1._id)) 
        {
          toast({
            title:"User Already in Group",
            status:'error',
            duration:5000, 
            isClosable:true,
            position:'bottom'
          })
          return;
        }
        if(selectedChat.groupAdmin._id !== user1._id){
          toast({
            title:"Only Admins Can Add Someone!",
            status:'error',
            duration:5000, 
            isClosable:true,
            position:'bottom'
          })
          return;
        }
        try {
          setLoading(true);
          const response = await fetch("api/chat/groupadd", {
            method:"PUT", 
            body:JSON.stringify({
              chatId:selectedChat._id, 
              userId:user1._id,
            }),
            headers:{
              'Content-Type': 'application/json',
              Authorization:`Bearer ${user.token}` 
            }
          });
          const data = await response.json();
          setSelectedChat(data);
          setFetchAgain(!fetchAgain);
          setLoading(false);
        } catch (error) {
          toast({
            title:"Error Occured!",
            description:error.response.data.message,
            status:'error',
            duration:5000, 
            isClosable:true,
            position:'bottom'
          })
          setLoading(false);
        }
    };  
    const handleRename = async () =>{
        if(!groupChatName) return;
        try { 
          setRenameLoading(true);
          const response = await fetch("/api/chat/rename", {
            method:"PUT",
            body: JSON.stringify({
              chatId:selectedChat._id, 
              chatName:groupChatName
            }),
            headers:{
              'Content-Type': 'application/json', 
              Authorization:`Bearer ${user.token}`
            }

          });
          const data = await response.json();
          setSelectedChat(data);
          setFetchAgain(!fetchAgain); //to fetch all the chats again
          setRenameLoading(false);
        } catch (error) {
          toast({
            title:"Error Occured!", 
            description:error.response.data.message, 
            status:"error", 
            duration:5000, 
            isClosable:true,
            position:"bottom"
          });
          setGroupChatName("");
        }
    };
    const handleSearch = async (query) =>{
      setSearch(query);
      if (!query) {
        return;
      }

      try {
        setLoading(true);
        const response  = await fetch(`/api/user?search=${search}`, {
          method:"GET", 
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        const data = await response.json();
        setLoading(false);
        setSearchResult(data);
      } catch (error) {
        toast({
          title: "Error Occured!",
          description: "Failed to Load the Search Results",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "bottom-left",
        });
        setLoading(false);
      }
    };

    return ( 
      <>
      <IconButton d={{ base: "flex" }} icon={<ViewIcon />} onClick={onOpen} />
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize = "35px"
            fontFamily = "Work Sans"
            display = "flex"
            justifyContent = "center"
          >
            {selectedChat.chatName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w = "100%" display = "flex" flexWrap = "wrap" pb = {3}>
              {selectedChat.users.map((u)=>(
                <UserBadgeItem key={u._id} user={u} handleFunction={() => handleRemove(u)} />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
              Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder = "Add user to group"
                mb = {1}
                onChange = {(e) => handleSearch(e.target.value)}
                />
            </FormControl>
            {loading ? (
            <Spinner size="lg" />
          ) : (
            searchResult?.length > 0 ? ( // Check if searchResult is not empty
              searchResult.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            ) : (
              <p>No results found.</p> // Display a message if searchResult is empty
            )
          )}
          </ModalBody>
              
          <ModalFooter>
            <Button colorScheme='red' onClick = {() => handleRemove(user)}>
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
     );
}
 
export default UpdateGroupChatModel;
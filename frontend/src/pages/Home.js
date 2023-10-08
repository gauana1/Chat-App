import {
    Box,
    Container,
    Tab,
    TabList,
    TabPanel,
    TabPanels,
    Tabs,
    Text,
  } from "@chakra-ui/react";
import Login from "../components/authentication/login";
import Signup from "../components/authentication/signup";
import { useNavigate } from "react-router";
import { useEffect } from "react";
const Home = () => {
  //   const nav = useNavigate();
  //   useEffect(()=>{
  //     const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  //     if(userInfo){
  //       window.location.redirect('/chat');
  //     }
  // }, [nav])
    return (
        <Container maxW="xl" centerContent>
          <Box
            d="flex"
            justifyContent="center"
            p={3}
            bg="white"
            w="100%"
            m="40px 0 15px 0"
            borderRadius="lg"
            borderWidth="1px"
          >
            <Text fontSize="4xl" fontFamily="Work sans">
              Chat APP 
            </Text>
          </Box>
          <Box bg="white" w="100%" p={4} borderRadius="lg" borderWidth="1px">
            <Tabs isFitted variant="soft-rounded">
              <TabList mb="1em">
                <Tab width = '50%'>Login</Tab>
                <Tab  width = '50%'>Sign Up</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                    <Login/>
                </TabPanel>
                <TabPanel>
                    <Signup/>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Container>
      );
}
 
export default Home;
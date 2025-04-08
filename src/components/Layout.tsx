import { Box, Container, Flex } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  return (
    <Flex direction="column" minH="100vh">
      <Navbar />
      <Container maxW="container.xl" flex="1" py={8}>
        <Box as="main">
          <Outlet />
        </Box>
      </Container>
      <Footer />
    </Flex>
  );
};

export default Layout; 
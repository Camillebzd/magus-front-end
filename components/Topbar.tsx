'use client'

import { useEffect, useState } from 'react'
import {
  Flex,
  IconButton,
  Text
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import NavItem from './NavItem'
import styles from '../app/page.module.css'

import { ConnectButton, useActiveWallet } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import { connect, disconnect } from "@/redux/features/authSlice";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { socketActions } from '@/redux/features/socketSlice'
import ConnectionDot from './ConnectionDot'
import { client, etherlinkTestnet } from '@/app/thirdwebInfo'
import AcceptFightListener from './AcceptFightListener'

const MENU_LIST = [
  { text: "Home", href: "/" },
  { text: "Room", href: "/room" },
  { text: "World", href: "/world" },
  { text: "Armory", href: "/armory" },
  { text: "About Us", href: "/about" },
];

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const Topbar = () => {
  const [display, changeDisplay] = useState('none')
  const [activeSection, setActiveSection] = useState(window.location.pathname);
  const wallet = useActiveWallet();
  const walletAddress = useAppSelector((state) => state.authReducer.address);
  const isWalletConnected = useAppSelector((state) => state.authReducer.isConnected);
  const isSocketConnected = useAppSelector((state) => state.socketReducer.isConnected);

  {/* Handle user connection and update redux */ }
  const dispatch = useAppDispatch();

  // connect wallet user + create socket
  useEffect(() => {
    if (wallet) {
      console.log('Wallet connected', wallet);
      wallet.subscribe("accountChanged", (account) => {
        dispatch(connect(account.address));
      });
      dispatch(connect(wallet.getAccount()?.address!));
      dispatch(socketActions.initSocket());
    } else {
      if (isWalletConnected) {
        console.log('Wallet disconnected');
        dispatch(disconnect());
      }
    }
    // clean
    return () => {
      dispatch(disconnect());
      // no need to delete the socket because it is a singleton
    }
  }, [wallet]);

  // create user on the server when socket + wallet connected
  useEffect(() => {
    if (isWalletConnected && isSocketConnected) {
      dispatch(socketActions.createMember(walletAddress));
    }
    // clean
    return () => {
      dispatch(socketActions.deleteMember(walletAddress));
    }
  }, [walletAddress, isWalletConnected, isSocketConnected]);

  return (
    <Flex
      position="fixed"
      justifyContent="flex-end"
      top="0"
      left="0"
      right="0"
      zIndex="1"
      bgGradient="linear(to-r, profoundgrey.900, profoundgrey.800, profoundgrey.900)"
      backdropFilter="blur(8px)"
      borderBottom="1px"
      borderColor="profoundgrey.800"
      boxShadow="lg"
      paddingTop="2px"
      paddingBottom="2px"
      paddingRight="30px"
      className={styles.topbarContainer}
    >
      {/* <Text fontSize={"large"} fontWeight={"bold"}>Magus</Text> */}
      {/* Desktop */}
      {/* <Flex
        display={['none', 'none', 'flex', 'flex']}
        gap={'10px'}
      >
        {MENU_LIST.map(elem => <NavItem key={elem.text} text={elem.text} href={elem.href} isActive={activeSection === elem.href} setActiveSection={setActiveSection} />)}
      </Flex> */}

      {/* <ConnectButton showBalance={{ smallScreen: false, largeScreen: false }} /> */}

      <Flex alignItems='center' gap='10px'>
        <ConnectionDot />
        <ConnectButton
          client={client}
          wallets={wallets}
          chain={etherlinkTestnet}
        />
      </Flex>

      {/* Mobile */}
      {/* <IconButton
        aria-label="Open Menu"
        size="lg"
        mr={2}
        mb={2}
        icon={
          <HamburgerIcon />
        }
        onClick={() => changeDisplay('flex')}
        display={['flex', 'flex', 'none', 'none']}
      /> */}

      {/* Mobile Content */}
      {/* <Flex
        w='100vw'
        display={display}
        bgColor="gray.50"
        zIndex={20}
        h="100vh"
        pos="fixed"
        top="0"
        left="0"
        overflowY="auto"
        flexDir="column"
      >
        <Flex justify="flex-end">
          <IconButton
            mt={2}
            mr={2}
            aria-label="Open Menu"
            size="lg"
            icon={
              <CloseIcon />
            }
            onClick={() => changeDisplay('none')}
          />
        </Flex>

        <Flex
          flexDir="column"
          align="center"
        >
          {MENU_LIST.map(elem => <NavItem key={elem.text} text={elem.text} href={elem.href} isActive={activeSection === elem.href} setActiveSection={setActiveSection} />)}
        </Flex>
      </Flex> */}
      <AcceptFightListener />
    </Flex>
  );
};

export default Topbar;
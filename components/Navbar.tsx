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
import { createWallet, inAppWallet } from "thirdweb/wallets";

import { connect, disconnect } from "@/redux/features/authSlice";
import { useAppDispatch } from "@/redux/hooks";
import { createThirdwebClient, defineChain } from 'thirdweb'

const MENU_LIST = [
  { text: "Home", href: "/" },
  { text: "World", href: "/world" },
  { text: "Armory", href: "/armory" },
  { text: "About Us", href: "/about" },
];

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("me.rainbow"),
];

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

const chain = defineChain({
  id: 128123,
  name: "Etherlink Testnet",
  rpc: "https://node.ghostnet.etherlink.com",
  nativeCurrency: {
    name: "Tez",
    symbol: "XTZ",
    decimals: 18,
  },
  blockExplorers: [{
    url: "https://testnet.explorer.etherlink.com/",
    apiUrl: "https://testnet.explorer.etherlink.com/api",
    name: "Blockscout"
  }],
  testnet: true,

});

const Navbar = () => {
  const [display, changeDisplay] = useState('none')
  const [activeSection, setActiveSection] = useState(window.location.pathname);
  const wallet = useActiveWallet();

  {/* Handle user connection and update redux */ }
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (wallet) {
      console.log('Connected', wallet );
      dispatch(connect(wallet.getAccount()?.address!));
    } else {
      console.log('Disconnected');
      dispatch(disconnect());
    }
  }, [wallet]);

  return (
    <Flex
      align="center"
      justifyContent="space-between"
      width="100%"
      paddingLeft="6%"
      paddingRight="6%"
      className={styles.navbarContainer}
    >
      <Text fontSize={"large"} fontWeight={"bold"}>Magus</Text>
      {/* Desktop */}
      <Flex
        display={['none', 'none', 'flex', 'flex']}
        gap={'10px'}
      >
        {MENU_LIST.map(elem => <NavItem key={elem.text} text={elem.text} href={elem.href} isActive={activeSection === elem.href} setActiveSection={setActiveSection} />)}
      </Flex>

      {/* <ConnectButton showBalance={{ smallScreen: false, largeScreen: false }} /> */}

      <ConnectButton
        client={client}
        wallets={wallets}
        chain={chain}
      />

      {/* Mobile */}
      <IconButton
        aria-label="Open Menu"
        size="lg"
        mr={2}
        mb={2}
        icon={
          <HamburgerIcon />
        }
        onClick={() => changeDisplay('flex')}
        display={['flex', 'flex', 'none', 'none']}
      />

      {/* Mobile Content */}
      <Flex
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
      </Flex>
    </Flex>
  );
};

export default Navbar;
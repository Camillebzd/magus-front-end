'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  UserIcon
} from '@heroicons/react/24/outline';
import { LuSword, LuAnvil } from "react-icons/lu";
import { FaTshirt } from "react-icons/fa";
import { BiTask } from "react-icons/bi";
import styles from '../../app/page.module.css'
import {
  Box,
  Flex,
  Text,
  Link as ChakraLink,
} from '@chakra-ui/react';

const navItems = [
  {
    path: '/forge',
    label: 'Forge',
    icon: <LuAnvil style={{ width: '24px', height: '24px' }} />,
  },
  {
    path: '/armory',
    label: 'Armory',
    icon: <FaTshirt style={{ width: '24px', height: '24px' }} />,
  },
  {
    path: '/',
    label: 'Fight',
    icon: <LuSword style={{ width: '24px', height: '24px' }} />,
  },
  {
    path: '/quests',
    label: 'Quests',
    icon: <BiTask style={{ width: '24px', height: '24px' }} />,
  },
  {
    path: '/profile',
    label: 'Profile',
    icon: <UserIcon style={{ width: '24px', height: '24px' }} />,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Box
      as="nav"
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      zIndex="50"
      bgGradient="linear(to-r, profoundgrey.900, profoundgrey.800, profoundgrey.900)"
      backdropFilter="blur(8px)"
      borderTop="1px"
      borderColor="profoundgrey.800"
      boxShadow="lg"
      className={styles.topbarContainer}
    >
      <Flex
        maxWidth="lg"
        mx="auto"
        px="4"
        py="1"
        justifyContent="space-between"
        alignItems="center"
      >
        {navItems.map((item) => {
          const isActive = pathname === item.path;

          return (
            <ChakraLink
              key={item.path}
              as={Link}
              href={item.path}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              py="2"
              px="3"
              position="relative"
              borderRadius="xl"
              color={isActive ? 'neonblue.400' : 'gray.400'}
              transform={isActive ? 'translateY(-0.25rem)' : 'none'}
              transition="all 0.2s"
              _hover={{
                color: isActive ? 'neonblue.400' : 'gray.200',
                transform: isActive ? 'translateY(-0.25rem)' : 'translateY(-0.125rem)'
              }}
              sx={isActive ? { boxShadow: '0 4px 6px -1px rgba(16, 98, 185, 0.2)' } : {}}
            >
              {isActive && (
                <Box
                  position="absolute"
                  inset="0"
                  bg="gray.800"
                  opacity="0.8"
                  borderRadius="xl"
                  border="1px"
                  borderColor="neonblue.800"
                  // borderOpacity="0.3"
                  zIndex="-1"
                />
              )}
              <Box
                mb="1"
                transition="transform 0.2s"
                transform={mounted && isActive ? 'scale(1.1)' : 'scale(1)'}
                filter={isActive ? 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3))' : 'none'}
              >
                {item.icon}
              </Box>
              <Text
                fontSize="xs"
                fontWeight={isActive ? 'semibold' : 'medium'}
                isTruncated
                maxWidth="60px"
                transition="all 0.2s"
              >
                {item.label}
              </Text>
            </ChakraLink>
          );
        })}
      </Flex>
    </Box>
  );
}
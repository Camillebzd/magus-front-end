'use client'

import React from "react";
import { CacheProvider } from '@chakra-ui/next-js'
import { ChakraProvider, cookieStorageManagerSSR, localStorageManager } from '@chakra-ui/react'
import theme from "./theme";

export function ChakraProviders({
    children 
  }: { 
  children: React.ReactNode 
  }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  return (
    <CacheProvider>
      <ChakraProvider resetCSS theme={theme}>
        {mounted && children}
      </ChakraProvider>
    </CacheProvider>
  )
}
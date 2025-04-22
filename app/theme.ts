// 1. import `extendTheme` function
import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

// 2. Add your color mode config
const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

// 3. extend the theme
const theme = extendTheme({ 
  config,
  colors: {
    neonblue: {
      400: "#1FB6FF", // primary
      800: "#0077FF", // secondary
    },
    profoundgrey: {
      200: "#3A3A3C",
      400: "#2B2B2E",
      800: "#1C1C1E",
      900: "#141414",
    },
    lightgrey: "#B0B0B0",
    offwhite: "#EDEDED",
  }
})

export default theme
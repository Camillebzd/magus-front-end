import './globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import { Inter } from 'next/font/google'
import { ThirdwebProvider } from "./thirdwebProvider";
import Navbar from '@/components/Navbar'
import { ReduxProvider } from "@/redux/provider";
import { ChakraProviders } from './chakraProviders';
import { SocketProvider } from '@/sockets/socketContext';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Magus',
  description: 'Crypto and NFT game using magic.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <ChakraProviders>
            <ThirdwebProvider>
              <SocketProvider>
                <Navbar />
                {children}
              </SocketProvider>
            </ThirdwebProvider>
          </ChakraProviders>
        </ReduxProvider>
      </body>
    </html>
  )
}

import { createThirdwebClient, defineChain } from 'thirdweb';

export const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || "",
});

export const etherlinkTestnet = defineChain({
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
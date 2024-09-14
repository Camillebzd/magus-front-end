'use client'

import styles from './page.module.css'

export default function Home() {

  return (
    <main className={styles.main}>
      <h1 className={styles.pageTitle}>Home</h1>
      <h2 className={styles.pageSubtitle}>Presentation</h2>
      <p className={styles.paragraphe}>Welcome on the magus project!</p>
      <p className={styles.paragraphe}>The objective of this little project is to create &quot;on-chain metadata&quot; NFTs and an environment around them to play (because own an &quot;on-chain metadata&quot; NFT it&apos;s cool but if you can do something with it, it&apos;s better! 😉).</p>
      <p className={styles.paragraphe}>
        All the Gears you will use are NFTs! That means you will really own them. You can navigate through the site without connecting your wallet but if you want to play you will have to.
        <b>The site is actually in development so there could be some bugs, please protect your funds and wallet, create or use a wallet you normally use for testing purpose.</b>
      </p>
      <h2 className={styles.pageSubtitle}>Manual (please read this before using the site)</h2>
      <p className={styles.paragraphe}>
        <b>Attention:</b> only metamask was tested so I recommend you to use this wallet, some unpredicted errors could happen otherwise.
      </p>
      <p className={styles.paragraphe}><b>All the interactions should be on the Etherlink testnet network, check on your wallet that you&apos;re on this network.</b></p>
      <p className={styles.paragraphe}>
        Ok now lets talk about the game itself. &quot;Oh no another weird NFT farming game in which I have to spend 200 eth to try it&quot;. Nah don&apos;t worry, the goal of the project is to 
        be easy and as free as it can be (you will still have to pay the gas fees, I love you but not that much).
      </p>
      <p className={styles.paragraphe}>Start to play:</p>
      <ol type="1" >
        <li>Connect your wallet</li>
        <li>Go on a Etherlink testnet faucet and get some free tokens</li>
        <li>Go in the Armory section</li>
        <li>Click on the button to create a free weapon</li>
        <li>Go in the World page and click on monster and on the fight button to kick their ass</li>
        <li>If you want to enhance it you will have to use XTZ tokens</li>
      </ol>
    </main>
  )
}

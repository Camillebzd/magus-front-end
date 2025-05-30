'use client';

import { Button, Flex } from "@chakra-ui/react";
import { download, upload } from "thirdweb/storage";
import { client } from "@/app/thirdwebInfo";
import { useContract, useStarter } from "@/scripts/customHooks";
import { WeaponMint } from "@/scripts/entities";
import { Notify } from "notiflix";
import { useState } from "react";
import { useAppSelector } from "@/redux/hooks";

const MintButton = ({
  createdImage
}: {
  createdImage: Blob | null;
}) => {
  const address = useAppSelector((state) => state.authReducer.address);
  const [isCraftingNFT, setIsCraftingNFT] = useState(false);
  const contract = useContract();
  const weapons = useStarter();
  const weapon = weapons[0]; // Hardcode the first weapon for minting

  const mintNFT = async () => {
    setIsCraftingNFT(true);

    if (!contract) {
      console.log("Contract not found");
      setIsCraftingNFT(false);
      return;
    }
    if (!weapon) {
      console.error("No weapon found to mint");
      setIsCraftingNFT(false);
      return;
    }
    if (!address) {
      console.error("Not connected");
      setIsCraftingNFT(false);
      return;
    }
    if (!createdImage || createdImage.size === 0) {
      console.error("No image to mint");
      setIsCraftingNFT(false);
      return;
    }

    if (!createdImage) {
      console.error("No image to mint");
      setIsCraftingNFT(false);
      return;
    }
    try {
      console.log("Minting NFT with image:", createdImage);
      const uri = await upload({
        client,
        files: [new File([createdImage], "magus_image_test.png", { type: "image/png" })],
      });

      // This will log a URL like ipfs://QmWgbcjKWCXhaLzMz4gNBxQpAHktQK6MkLvBkKXbsoWEEy/0
      // using this one for NFT metadata image field
      console.info(uri);

      if (!uri || uri.length === 0) {
        console.error("Failed to upload image");
        setIsCraftingNFT(false);
        return;
      }

      // Here we a URL with a gateway that we can look at in the browser
      const url = (await download({
        client,
        uri,
      })).url;

      // This will log a URL like https://ipfs.thirdwebstorage.com/ipfs/QmWgbcjKWCXhaLzMz4gNBxQpAHktQK6MkLvBkKXbsoWEEy/0
      console.info(url);

      // mint the NFT
      let weaponToMint: WeaponMint = {
        name: weapon.name,
        description: weapon.description,
        image: uri,
        level: weapon.level,
        stage: weapon.stage,
        weaponStats: {
          health: weapon.stats.health,
          speed: weapon.stats.speed,
          mind: weapon.stats.mind,
          offensiveStats: {
            sharpDamage: weapon.stats.sharpDmg,
            bluntDamage: weapon.stats.bluntDmg,
            burnDamage: weapon.stats.burnDmg,
            pierce: weapon.stats.pierce,
            lethality: weapon.stats.lethality
          },
          defensiveStats: {
            sharpResistance: weapon.stats.sharpRes,
            bluntResistance: weapon.stats.bluntRes,
            burnResistance: weapon.stats.burnRes,
            guard: weapon.stats.guard,
          },
          handling: weapon.stats.handling,
        },
        xp: 0,
        abilities: [],
        identity: "None"
      };
      weapon.abilities.forEach((ability) => { weaponToMint.abilities.push(ability.name) });
      console.log(weaponToMint);
      if (!address)
        return;
      const tx = await contract.requestWeapon(weaponToMint);
      await tx.wait();
      Notify.success("Your weapon was created, wait a minute and you will see it appear!");
      setIsCraftingNFT(false);
    } catch (error) {
      console.error("Error minting NFT:", error);
      setIsCraftingNFT(false);
    }
  };

  return (
    <Flex justifyContent="center" gap={4} height={"100%"} m={4}>
      <Button isLoading={isCraftingNFT} width={"auto"} onClick={mintNFT} colorScheme="blue">
        Mint NFT
      </Button>
    </Flex>
  );
}

export default MintButton;
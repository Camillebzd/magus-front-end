'use client';

import { Button, Flex, Image, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text, useDisclosure } from "@chakra-ui/react";
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
    const { isOpen, onOpen, onClose } = useDisclosure();
  const contract = useContract();
  const weapons = useStarter();
  const weapon = weapons[0]; // Hardcode the first weapon for minting
  const [weaponName, setWeaponName] = useState('');
  const [weaponDescription, setWeaponDescription] = useState('');

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
    if (!address || address.length < 42) {
      console.error("Not connected");
      setIsCraftingNFT(false);
      return;
    }
    if (!createdImage || createdImage.size === 0) {
      console.error("No image to mint");
      setIsCraftingNFT(false);
      return;
    }

    if (weaponName.length === 0 || weaponDescription.length === 0) {
      console.error("No name or description for the weapon");
      Notify.failure("Please provide a name and description for the weapon.");
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
        name: weaponName,
        description: weaponDescription,
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
      onClose();
    } catch (error) {
      console.error("Error minting NFT:", error);
      setIsCraftingNFT(false);
    }
  };

  return (
    <Flex justifyContent="center" gap={4} height={"100%"} m={4}>
      <Button width={"auto"} onClick={onOpen} colorScheme="blue">
        Mint NFT
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Weapon details</ModalHeader>
          <ModalCloseButton isDisabled={isCraftingNFT} />
          <ModalBody>
            <Flex direction="column" gap={4} alignItems={"center"}>
              <Image src={createdImage ? URL.createObjectURL(createdImage) : ""} alt="Weapon Preview" style={{ width: "250px", height: "auto" }} />
              <Flex direction="column" width="100%" gap={2}>
                <Text fontSize="lg" fontWeight="bold">Name</Text>
                <Input maxLength={40} placeholder="Weapon Name" defaultValue={weaponName} onChange={(event) => setWeaponName(event.target.value)} />
                <Text mt={2} fontSize="lg" fontWeight="bold">Description</Text>
                <Input maxLength={40} placeholder="Weapon Description" defaultValue={weaponDescription} onChange={(event) => setWeaponDescription(event.target.value)} />
              </Flex>
            </Flex>
          </ModalBody>
          <ModalFooter>
            <Button isLoading={isCraftingNFT} colorScheme='blue' onClick={mintNFT}>
              Mint
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

export default MintButton;
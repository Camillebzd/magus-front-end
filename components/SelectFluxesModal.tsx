'use client'

import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const SelectFluxesModal = ({isOpen, onClose, launchAbility, fluxesAvailables}: {isOpen: boolean, onClose: () => void, launchAbility: (fluxeSelected: number) => void, fluxesAvailables: number}) => {
  const [fluxesSelected, setFluxesSelected] = useState(1);

  useEffect(() => {
    setFluxesSelected(1);
  }, [isOpen]);

  const modifyFluxesSelected = (amount: number) => {
    const result = fluxesSelected + amount;
    if (result <= fluxesAvailables && result >= 1)
      setFluxesSelected((actual) => actual += amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Choose fluxes:</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <div style={{display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "1rem"}}>
            <Button onClick={() => modifyFluxesSelected(-1)}>-</Button>
            <p>{fluxesSelected} / {fluxesAvailables}</p>
            <Button onClick={() => modifyFluxesSelected(1)}>+</Button>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='red' mr={3} onClick={onClose}>
            Cancel
          </Button>
          <Button colorScheme='blue' onClick={() => launchAbility(fluxesSelected)}>
            Launch
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
  }
  
  export default SelectFluxesModal;
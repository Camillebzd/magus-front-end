import { useWeaponDeck } from "@/scripts/customHooks";
import { Weapon } from "@/scripts/entities";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { 
  Card,
  Image,
  Stack,
  CardBody,
  Heading,
  Text,
  CardFooter,
  Button
} from "@chakra-ui/react";
import CreateDeckButton from "./CreateDeckButton";

const WeaponCardHorizontal = ({weapon, onClick, isSelected}: {weapon: Weapon, onClick: () => void, isSelected: boolean}) => {
  const deck = useWeaponDeck(weapon.id);

  return (
    <Card
      direction={{ base: 'column', sm: 'row' }}
      overflow='hidden'
      variant='outline'
      onClick={onClick}
      backgroundColor={isSelected ? "blue" : "transparent"}
    >
      <Image
        objectFit='cover'
        maxW={{ base: '100%', sm: '200px' }}
        src={weapon.image}
        alt={`image of weapon named ${weapon.name}`}
      />
      <Stack>
        <CardBody>
          <Heading size='md'>{weapon.name}</Heading>

          <Text py='2'>
            {weapon.description}
          </Text>
        </CardBody>

        <CardFooter>
          {/* <p>Deck: {deck && deck.length > 0 ? <CheckIcon/> : <CloseIcon /> }</p> */}
          <CreateDeckButton weaponId={weapon.id} />
        </CardFooter>
      </Stack>
    </Card>
  );
}
    
export default WeaponCardHorizontal;
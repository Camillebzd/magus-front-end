import { Monster, Weapon } from "@/scripts/entities";
import styles from "./Entity.module.css";
import { Badge, Flex, Image, Text } from "@chakra-ui/react";

// Flux system is not implemented yet, so we will not use it for now
const Entity = ({ 
  entity,
  isModifiersOnRight,
  isSelected,
  selectTarget
}: {
  entity: Weapon | Monster | undefined,
  isModifiersOnRight: boolean,
  isSelected: boolean
  selectTarget: (target: string) => void
}) => {
  if (!entity)
    return <div>Entity is empty...</div>;

  const fluxes = () => {
    const orbs: JSX.Element[] = [];

    for (let i = 0; i < entity.fluxes; i++)
      orbs.push(<div key={`fullFluxes${i}`} className={`${styles.fluxeCircle} ${styles.fluxeFull}`}></div>);
    for (let i = entity.fluxes; i < 6; i++)
      orbs.push(<div key={`emptyFluxes${i}`} className={`${styles.fluxeCircle} ${styles.fluxeEmpty}`}></div>);
    return orbs;
  }

  const displayModifiers = () => {
    return (
      <div className={styles.modifiersContainer}>
        {entity.modifiers.map(modifier => {
          let color;

          if (modifier.direction === "BUFF")
            color = "green"
          else
            color = "red";
          return <Badge key={modifier.id} style={{ height: "fit-content", marginBottom: "5px" }} colorScheme={color}>{modifier.name} {modifier.stack}</Badge>
        })}
      </div>
    );
  };

  return (
    <Flex cursor={"pointer"} direction={"row"} position={"relative"} onClick={() => selectTarget(entity.uid)}>
      {isSelected && <div className={`${styles.arrow} ${styles.mooveUpDown}`}></div>}
      {!isModifiersOnRight && displayModifiers()}
      <Flex direction={"column"} align={"center"}>
        <Flex
          p={"5px"}
          mb={"5px"}
          direction={"column"}
          align={"center"}
          width={"170px"}
        >
          <Flex
            width={"100%"}
            direction={"row"}
            align={"center"}
            justify={"space-between"}
          >
            <Text>{entity.name}</Text>
            <Text>LVL.{entity.level}</Text>
          </Flex>
          <div className={styles.healthContainer}>
            <progress max={entity.stats.healthMax} value={entity.stats.health} style={{ backgroundColor: "green" }}></progress>
            {/* <div>{Math.round(entity.stats.health * 100 / entity.stats.healthMax)}%</div> */}
          </div>
          {/* <div className={styles.fluxesContainer}>
            <div style={{marginRight: "7px"}}>Fluxes: </div>
            <div className={styles.fluxesCirclesContainer}>
              {fluxes()}
            </div>
          </div> */}
        </Flex>
        <Image src={entity.image.slice(0, 5) === "https" ? entity.image : `/img/monsters/${entity.image}`} alt="..." maxH={150} maxW={150} />
      </Flex>
      {isModifiersOnRight && displayModifiers()}
    </Flex>
  );
}

export default Entity;
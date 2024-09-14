import { Monster, Weapon } from "@/scripts/entities";
import styles from "./Entity.module.css";
import { Badge, Image } from "@chakra-ui/react";

const Entity = ({entity, isModifiersOnRight}: {entity: Weapon | Monster | null, isModifiersOnRight: boolean}) => {
  if (!entity)
    return <div>Entity is empty...</div>;

  const fluxes = () => {
    const orbs: JSX.Element[] = [];

    for(let i = 0; i < entity.fluxes; i++)
      orbs.push(<div key={`fullFluxes${i}`} className={`${styles.fluxeCircle} ${styles.fluxeFull}`}></div>);
    for(let i = entity.fluxes; i < 6; i++)
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
          return <Badge key={modifier.id} style={{height: "fit-content", marginBottom: "5px"}} colorScheme={color}>{modifier.name} {modifier.stack}</Badge>
        })}
      </div>
    );
  };

  return (
    <div className={styles.entityContainer}>
      {!isModifiersOnRight && displayModifiers()}
      <div className={styles.mainInfoContainer}>
        <div className={styles.topContainer}>
          <div className={styles.nameContainer}>
            <div>{ entity.name }</div>
            <div>LVL.{ entity.level }</div>
          </div>
          <div className={styles.healthContainer}>
            <div style={{marginRight: "7px"}}>Health: </div>
            <progress max={entity.stats.healthMax} value={entity.stats.health} style={{backgroundColor: "green", marginRight: "5px"}}></progress>
            <div>{ Math.round(entity.stats.health * 100 / entity.stats.healthMax) }%</div>
          </div>
          <div className={styles.fluxesContainer}>
            <div style={{marginRight: "7px"}}>Fluxes: </div>
            <div className={styles.fluxesCirclesContainer}>
              {fluxes()}
            </div>
          </div>
        </div>
        <div className={styles.imageContainer}>
          <Image src={entity.image.slice(0, 5) === "https" ? entity.image : `/img/monsters/${entity.image}`} alt="..." className={styles.imageEntity} />
        </div>
      </div>
      {isModifiersOnRight && displayModifiers()}
    </div>
  );
}

export default Entity;
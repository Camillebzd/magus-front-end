import { Monster, Weapon } from "@/scripts/entities";
import { Box } from "@chakra-ui/react";
import Entity from "./Entity";

const EntityList = ({
  entities,
  isModifiersOnRight,
  selected,
  selectTarget
}: {
  entities: Weapon[] | Monster[] | undefined,
  isModifiersOnRight: boolean,
  selected: string[],
  selectTarget: (target: string) => void
}) => {
  if (!entities || entities.length === 0) return null;

  const isSingleEntity = entities.length === 1;

  const containerStyle: React.CSSProperties = isSingleEntity
    ? {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100%",
    }
    : {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)", // Maximum of 2 columns
      gap: "1rem",
      justifyContent: "center", // Centers the grid items
    };

  return (
    <Box style={containerStyle}>
      {entities.map((entity, index) => (
        <Box key={index}>
          <Entity
            entity={entity}
            isModifiersOnRight={isModifiersOnRight}
            isSelected={selected?.includes(entity.uid)}
            selectTarget={selectTarget}
          />
        </Box>
      ))}
    </Box>
  );
};

export default EntityList;
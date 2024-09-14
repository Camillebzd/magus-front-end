import { Badge } from "@chakra-ui/react";

const DifficultyBadge = ({difficulty}: {difficulty: number}) => {
  const difficultyColor = () => {
    switch (difficulty) {
      case 1:
        return "green";
      case 2:
        return 'yellow';
      case 3:
        return 'orange';
      case 4:
        return 'red';
      case 5:
        return 'purple';
      default:
        return 'white';
    }
  };
  const difficultyTitle = () => {
    switch (difficulty) {
      case 1:
        return "easy";
      case 2:
        return 'normal';
      case 3:
        return 'medium';
      case 4:
        return 'hard';
      case 5:
        return 'legendary';
      default:
        return 'Unknown';
    }
  };

  return (
    <Badge colorScheme={difficultyColor()}>{difficultyTitle()}</Badge>
  );
}

export default DifficultyBadge;
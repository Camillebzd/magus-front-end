import { Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

const GoToButton = ({text, href}: {text: string, href: string}) => {
  const router = useRouter();

  return (
    <Button onClick={() => router.push(href)}>{text}</Button>
  );
}

export default GoToButton;
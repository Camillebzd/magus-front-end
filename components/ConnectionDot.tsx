"use client"

import { useAppSelector } from "@/redux/hooks";
import { Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";

const STATUS_COLOR = {
  online: 'green',
  connecting: 'orange',
  offline: 'red',
  unknown: 'gray'
};

const ConnectionDot = () => {
  const isWalletConnected = useAppSelector((state) => state.authReducer.isConnected);
  const isSocketConnected = useAppSelector((state) => state.socketReducer.isConnected);
  const [status, setStatus] = useState(STATUS_COLOR.unknown);

  useEffect(() => {
    if (isSocketConnected && isWalletConnected)
      setStatus(STATUS_COLOR.online);
    else if ((isSocketConnected && !isWalletConnected) || (!isSocketConnected && isWalletConnected))
      setStatus(STATUS_COLOR.connecting);
    else if (!isSocketConnected && !isWalletConnected)
      setStatus(STATUS_COLOR.offline);
    else
    setStatus(STATUS_COLOR.unknown);
  }, [isWalletConnected, isSocketConnected]);

  // Define a color map based on the connection status


  const dotStyle = {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: status || 'gray', // default to gray if status is unknown
  };

  return (
    <Tooltip label="Hey, I'm here!" >
      <div style={dotStyle} />
    </Tooltip>
  );
};

export default ConnectionDot;

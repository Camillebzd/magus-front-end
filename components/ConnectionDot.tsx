"use client"

import { useAppSelector } from "@/redux/hooks";
import { Text, Tooltip } from "@chakra-ui/react";
import { useEffect, useState } from "react";

export type Status = "online" | "connecting" | "offline" | "unknown";

const STATUS_COLOR = {
  online: 'green',
  connecting: 'orange',
  offline: 'red',
  unknown: 'gray'
};

const STATUS_LABEL = {
  online: "Wallet: connected\nSocket: connected",
  connecting: 'Wallet: connected\nSocket: disconnected',
  offline: 'Wallet: disconnected\nSocket: disconnected',
  unknown: 'Wallet: no data\nSocket: no data'
};

const ConnectionDot = () => {
  const isWalletConnected = useAppSelector((state) => state.authReducer.isConnected);
  const isSocketConnected = useAppSelector((state) => state.socketReducer.isConnected);
  const isMemberCreated = useAppSelector((state) => state.socketReducer.isCreated);
  const [status, setStatus] = useState<Status>("unknown");

  useEffect(() => {
    if (isSocketConnected && isWalletConnected) {
      setStatus("online");
    }
    else if ((isSocketConnected && !isWalletConnected) || (!isSocketConnected && isWalletConnected))
      setStatus("connecting");
    else if (!isSocketConnected && !isWalletConnected)
      setStatus("offline");
    else
      setStatus("unknown");
  }, [isWalletConnected, isSocketConnected]);

  const dotStyle = {
    width: '15px',
    height: '15px',
    borderRadius: '50%',
    backgroundColor: STATUS_COLOR[status] || 'gray', // default to gray if status is unknown
  };

  return (
    <Tooltip
      label={
        <div>
          <Text>Wallet: {isWalletConnected ? 'connected' : 'disconnected'}</Text>
          <Text>Socket: {isSocketConnected ? 'connected' : 'disconnected'}</Text>
          <Text>Member: {isMemberCreated ? 'connected' : 'disconnected'}</Text>
        </div>
      }
    >
      <div style={dotStyle} />
    </Tooltip>
  );
};

export default ConnectionDot;

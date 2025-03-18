"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import SocketFactory, { SocketInterface } from "./SocketFactory";

const SocketContext = createContext<SocketInterface | null>(null);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<SocketInterface | null>(null);

  useEffect(() => {
    console.log("Creating socket instance");
    const socketInstance = SocketFactory.create();
    setSocket(socketInstance);
    // socketInstance.connect(); // handle connection in initSocket middleware

    return () => {
      // socketInstance.disconnect(); // handle disconnection correctly in the app
    };
  }, []);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

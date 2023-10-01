"use client";
import { createContext, FC, useContext, ReactNode } from "react";
import { Socket, io } from "socket.io-client";
const ENDPOINT = "localhost:8383";

interface ISocketContext {
  socket: Socket | null;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const socket: Socket | null = typeof io !== "undefined" ? io(ENDPOINT) : null;

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

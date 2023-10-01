"use client";
import {
  createContext,
  FC,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
} from "react";
import { Socket, io } from "socket.io-client";
const ENDPOINT = "localhost:8383";

interface ISocketContext {
  socket: Socket | null;
  mic: boolean;
  setMic: Dispatch<SetStateAction<boolean>>;
  camera: boolean;
  setCamera: Dispatch<SetStateAction<boolean>>;
  caption: boolean;
  setCaption: Dispatch<SetStateAction<boolean>>;
  screenShare: boolean;
  setScreenShare: Dispatch<SetStateAction<boolean>>;
}

interface SocketProviderProps {
  children: ReactNode;
}

const SocketContext = createContext<ISocketContext>({
  socket: null,
  mic: false,
  setMic: () => {},
  camera: false,
  setCamera: () => {},
  caption: false,
  setCaption: () => {},
  screenShare: false,
  setScreenShare: () => {},
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const socket: Socket | null = typeof io !== "undefined" ? io(ENDPOINT) : null;
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [caption, setCaption] = useState(false);
  const [screenShare, setScreenShare] = useState(false);

  return (
    <SocketContext.Provider
      value={{
        socket,
        mic,
        setMic,
        camera,
        setCamera,
        caption,
        setCaption,
        screenShare,
        setScreenShare,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

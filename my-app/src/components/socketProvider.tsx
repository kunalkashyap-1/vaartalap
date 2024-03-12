"use client";
import {
  createContext,
  FC,
  useContext,
  ReactNode,
  useState,
  Dispatch,
  SetStateAction,
  useEffect,
} from "react";
// import peerService from "../service/peer";

import { Socket, io } from "socket.io-client";
const ENDPOINT = process.env.NEXT_PUBLIC_ENDPOINT ?? "locahost:8383";

interface ISocketContext {
  socket: Socket | null;
  mic: boolean;
  setMic: Dispatch<SetStateAction<boolean>>;
  camera: boolean;
  setCamera: Dispatch<SetStateAction<boolean>>;
  caption: boolean;
  setCaption: Dispatch<SetStateAction<boolean>>;
  translate: boolean;
  setTranslate: Dispatch<SetStateAction<boolean>>;
  language: string;
  setLanguage: Dispatch<SetStateAction<string>>;
  // screenShare: boolean;
  // setScreenShare: Dispatch<SetStateAction<boolean>>;
  participantList: {
    connID: string;
    userID: string;
    roomID: string;
  }[];
  setParticipantList: Dispatch<
    SetStateAction<
      {
        connID: string;
        userID: string;
        roomID: string;
      }[]
    >
  >;
  // peer: peerService;
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
  translate: false,
  setTranslate: () => {},
  language: "default",
  setLanguage: () => {},
  // screenShare: false,
  // setScreenShare: () => {},
  participantList: [],
  setParticipantList: () => {},
  // peer: new peerService(),
});

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider: FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [mic, setMic] = useState(true);
  const [camera, setCamera] = useState(true);
  const [caption, setCaption] = useState(false);
  const [translate, setTranslate] = useState(false);
  const [language, setLanguage] = useState("default");
  // const [screenShare, setScreenShare] = useState(false);
  const [participantList, setParticipantList] = useState<
    {
      connID: string;
      userID: string;
      roomID: string;
    }[]
  >([]);
  // const peer = new peerService();

  useEffect(() => {
    const socketIo = io(ENDPOINT);
    setSocket(socketIo);

    return () => {
      socketIo.disconnect();
    };
  }, []);

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
        // screenShare,
        // setScreenShare,
        participantList,
        setParticipantList,
        translate,
        setTranslate,
        language,
        setLanguage,
        // peer,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

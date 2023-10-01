import { SocketProvider, useSocket } from "./socketProvider";
import { useState, useEffect } from "react";

interface VideoContainerProps {
  roomID: string | null;
  userID: string | null;
}

export default function VideoContainer({
  roomID,
  userID,
}: VideoContainerProps) {
  const { socket } = useSocket();

  useEffect(() => {
    if (userID) {
      socket?.emit("connected", { roomID, userID });
    }
    //eslint-disable-next-line
  }, [userID]);

  return <div className="flex-1"></div>;
}

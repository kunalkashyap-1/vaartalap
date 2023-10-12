"use client";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useSocket } from "./socketProvider";

interface participantProps {
  isList: boolean;
  setIsList: Dispatch<SetStateAction<boolean>>;
}

export default function Participants({ isList, setIsList }: participantProps) {
  const { participantList, socket, setParticipantList } = useSocket();

  useEffect(() => {
    socket?.on("otherParticipants", (data) => {
      console.log(data);
      setParticipantList(data);
    });
    //work on inform others
    socket?.on("informOthers", (data: any) => {
      //raise toast that other guys joined
      console.log("from informOthers:-",data);
    });
  }, []);
  return (
    isList && (
      <div className="list">
        <ul>
          {participantList.map((item, i) => (
            <li key={i}>{item.userID}</li>
          ))}
        </ul>
      </div>
    )
  );
}

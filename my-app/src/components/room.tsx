"use client";
import { useState, useEffect } from "react";
import ChatBox from "./chatBox";
import ParticipantsList from "./participants";
import VideoContainer from "./videoContainer";
import ButtonsRow from "./buttonsRow";
import { useSearchParams } from "next/navigation";

const Room = () => {
  const [isChat, setIsChat] = useState<boolean>(false);
  const [isList, setIsList] = useState<boolean>(false);
  const roomID = useSearchParams().get("roomID");

  return (
    <div className="room flex flex-col h-screen">
      <div className="flex flex-1">
        <VideoContainer />
        <ParticipantsList isList={isList} setIsList={setIsList} />
        <ChatBox isChat={isChat} setIsChat={setIsChat} />
      </div>
      <ButtonsRow
        isChat={isChat}
        setIsChat={setIsChat}
        isList={isList}
        setIsList={setIsList}
        roomID={roomID}
      />
    </div>
  );
};

export default Room;

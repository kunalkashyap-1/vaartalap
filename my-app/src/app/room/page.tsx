"use client";
import { useState, useEffect } from "react";
import ChatBox from "../../components/chatBox";
import ParticipantsList from "../../components/participants";
import VideoContainer from "../../components/videoContainer";
import ButtonsRow from "../../components/buttonsRow";

const Room = () => {
  const [isChat, setIsChat] = useState<boolean>(false);
  const [isList, setIsList] = useState<boolean>(false);

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
      />
    </div>
  );
};

export default Room;

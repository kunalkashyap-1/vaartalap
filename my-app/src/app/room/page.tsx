"use client";
import { useState, useEffect } from "react";
import ChatBox from "../../components/chatBox";
import ParticipantsList from "../../components/participants";
import VideoContainer from "../../components/videoContainer";

const Room = () => {
    const [ischat,setIsChat] = useState<boolean>(false);
    const [isList,setIsList] = useState<boolean>(false);

return <div className="room flex h-screen">
    <VideoContainer/>
    <ParticipantsList/>
    <ChatBox/>
  </div>
};

export default Room;

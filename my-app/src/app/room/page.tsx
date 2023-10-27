"use client";
import { useState, useEffect } from "react";
import ChatBox from "../../components/chatBox";
import ParticipantsList from "../../components/participants";
import VideoContainer from "../../components/videoContainer";
import ButtonsRow from "../../components/buttonsRow";
import { useSearchParams } from "next/navigation";

const Room = () => {
  const [isChat, setIsChat] = useState<boolean>(false);
  const [isList, setIsList] = useState<boolean>(false);
  const roomID = useSearchParams().get("roomID");
  // useEffect(() => {
  //   const getUserID = async () => {
  //     let inputUserID = null;
  //     if (!inputUserID) {
  //       inputUserID = window.prompt("Enter your UserID");

  //       if (!inputUserID || !roomID) {
  //         !inputUserID
  //           ? alert("UserID is missing")
  //           : alert("RoomID is missing");
  //         window.location.replace("/");
  //       }
  //     }
  //     setUserID(inputUserID);
  //   };

  //   getUserID();
  // }, [roomID]);

// console.log(userID);

  return (
      <div className="room flex flex-col h-screen">
        <div className="flex flex-1">
          <VideoContainer roomID={roomID}/>
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

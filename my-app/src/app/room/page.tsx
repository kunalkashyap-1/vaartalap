"use client";
import { useState, useEffect } from "react";
import ChatBox from "../../components/chatBox";
import ParticipantsList from "../../components/participants";
import VideoContainer from "../../components/videoContainer";
import ButtonsRow from "../../components/buttonsRow";
import { useSearchParams } from "next/navigation";
import { io } from "socket.io-client";

//use env variable next time for now hard coded 
const ENDPOINT = "localhost:8383"
let socket;
const Room = () => {
  const [isChat, setIsChat] = useState<boolean>(false);
  const [isList, setIsList] = useState<boolean>(false);
  const roomID = useSearchParams().get("roomID");
  const [userID, setUserID] = useState<string | null>(null);

  useEffect(() => {
    const getUserID = async () => {
      let inputUserID = null;
      while (!inputUserID) {
        inputUserID = window.prompt("Enter your UserID");

        if (!inputUserID) {
          alert("UserID is missing");
        }
      }
      setUserID(inputUserID);
    };

    getUserID();
  }, []);

  useEffect(() => {
    if (userID) {
      socket = io(ENDPOINT);
      socket.emit("connected", { roomID, userID });
    }
    //eslint-disable-next-line
  }, [userID]);

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
        userID={userID}
      />
    </div>
  );
};

export default Room;

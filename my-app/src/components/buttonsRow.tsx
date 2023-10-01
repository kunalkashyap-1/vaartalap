"use client";
// ButtonsRow.js
import React, { useState, Dispatch, SetStateAction } from "react";
import {
  MicNoneOutlined,
  MicOffOutlined,
  VideocamOutlined,
  VideocamOffOutlined,
  ScreenShareOutlined,
  StopScreenShareOutlined,
  ClosedCaptionOffOutlined,
  ClosedCaptionDisabledOutlined,
  CallEndOutlined,
  InfoOutlined,
  MessageOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";

interface ButtonsProps {
  isChat: boolean;
  setIsChat: Dispatch<SetStateAction<boolean>>;
  isList: boolean;
  setIsList: Dispatch<SetStateAction<boolean>>;
  roomID: string | null;
  userID: string | null;
}

export default function ButtonsRow({
  isChat,
  setIsChat,
  isList,
  setIsList,
  roomID,
  userID,
}: ButtonsProps) {
  const [mic, setMic] = useState(false);
  const [camera, setCamera] = useState(false);
  const [caption, setCaption] = useState(false);
  const [screenShare, setScreenShare] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  return (
    <div className="flex flex-row-reverse justify-between items-center p-4">
      <div className="space-x-4">
        <button
          onClick={() => setIsChat((prevIsChat: boolean) => !prevIsChat)}
          className={`${
            isChat ? "bg-purple-300" : ""
          }  place-content-center rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
        >
          <MessageOutlined />
        </button>
        <button
          onClick={() => setIsList((prev: boolean) => !prev)}
          className={`${
            isList ? "bg-purple-300" : ""
          }  place-content-center rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
        >
          <PeopleAltOutlined />
        </button>
        <button
          onClick={() => setInfoVisible((prev) => !prev)}
          className="text-gray-600"
        >
          <InfoOutlined />
        </button>
        {infoVisible && (
          <div className="absolute bottom-24 right-0 w-60 bg-white p-4 shadow-lg">
            {userID &&<h1>{`${userID}'s meeting`}</h1>}
            <p className="text-gray-800">Room ID: {roomID}</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 justify-around items-center ">
        <div className=" space-x-4">
          <button
            onClick={() => setMic((prevMic) => !prevMic)}
            className={`${
              !mic ? "bg-gray-300" : "bg-red-500 text-white"
            }  place-content-center rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
          >
            {!mic ? <MicNoneOutlined /> : <MicOffOutlined />}
          </button>
          <button
            onClick={() => setCamera((prevCamera) => !prevCamera)}
            className={`${
              !camera ? "bg-gray-300" : "bg-red-500 text-white"
            }  rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
          >
            {!camera ? <VideocamOutlined /> : <VideocamOffOutlined />}
          </button>
          <button
            onClick={() => setScreenShare((prevShare) => !prevShare)}
            className={`${
              !screenShare ? "" : "bg-red-500 text-white"
            }  rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
          >
            {!screenShare ? (
              <ScreenShareOutlined />
            ) : (
              <StopScreenShareOutlined />
            )}
          </button>
          <button
            onClick={() => setCaption((prevCaption) => !prevCaption)}
            className={`${
              !caption ? "" : "bg-red-500 text-white"
            }  rounded-full place-content-center p-3 hover:bg-opacity-80 transition duration-300`}
          >
            {!caption ? (
              <ClosedCaptionOffOutlined />
            ) : (
              <ClosedCaptionDisabledOutlined />
            )}
          </button>
          <button
            onClick={() => {} /* Implement your logic for ending the call */}
            className="bg-red-500 text-white rounded-full p-3 hover:bg-opacity-80 transition duration-300"
          >
            <CallEndOutlined />
          </button>
        </div>
      </div>
    </div>
  );
}
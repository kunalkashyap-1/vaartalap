// ButtonsRow.js
import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
  MicNoneOutlined,
  MicOffOutlined,
  VideocamOutlined,
  VideocamOffOutlined,
  ClosedCaptionOffOutlined,
  ClosedCaptionDisabledOutlined,
  CallEndOutlined,
  InfoOutlined,
  MessageOutlined,
  PeopleAltOutlined,
} from "@mui/icons-material";
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Switch,
  FormGroup,
  FormControlLabel,
} from "@mui/material";
import { useSocket } from "./socketProvider";

interface ButtonsProps {
  isChat: boolean;
  setIsChat: Dispatch<SetStateAction<boolean>>;
  isList: boolean;
  setIsList: Dispatch<SetStateAction<boolean>>;
  roomID: string | null;
}

export default function ButtonsRow({
  isChat,
  setIsChat,
  isList,
  setIsList,
  roomID,
}: ButtonsProps) {
  const [infoVisible, setInfoVisible] = useState(false);
  const [localUserID, setLocalUserID] = useState<string | null>();
  const {
    mic,
    setMic,
    camera,
    setCamera,
    caption,
    setCaption,
    translate,
    setTranslate,
    language,
    setLanguage,
  } = useSocket();

  useEffect(() => {
    setLocalUserID(window.localStorage.getItem("localUserID"));
  }, []);

  return (
    <div
      className="flex flex-row-reverse justify-between items-center p-4"
      style={{ backgroundColor: "#333" }}
    >
      <div className="flex justify-center items-center space-x-4">
        <FormGroup>
          <FormControlLabel
            control={
              <Switch
                color="secondary"
                size="medium"
                onChange={() => setTranslate((prevTranslate) => !prevTranslate)}
              />
            }
            label={<span className="text-white text-lg">Translate</span>}
            labelPlacement="start"
          />
        </FormGroup>

        <FormControl className="w-32">
          {/* <InputLabel id="language-select-label">Language</InputLabel> */}
          <Select
            labelId="language-select-label"
            id="language-select"
            className="text-white border rounded bg-grey-300 focus:outline-none focus:border-white"
            value={language}
            onChange={(e) => setLanguage(e.target.value as string)}
          >
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="hi">Hindi</MenuItem>
            <MenuItem value="pl">Polish</MenuItem>
            <MenuItem value="fr">French</MenuItem>
            <MenuItem value="it">Italian</MenuItem>
            <MenuItem value="de">German</MenuItem>
            <MenuItem value="ja">Japanese</MenuItem>
          </Select>
        </FormControl>
        <button
          onClick={() => setIsChat((prevIsChat: boolean) => !prevIsChat)}
          className={`${
            isChat ? "bg-purple-300" : ""
          }  place-content-center text-white rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
        >
          <MessageOutlined />
        </button>
        <button
          onClick={() => setInfoVisible((prev) => !prev)}
          className="text-gray-400"
        >
          <InfoOutlined />
        </button>
        {infoVisible && (
          <div className="absolute bottom-24 right-0 w-60 bg-white p-4 shadow-lg">
            {localUserID && <h1>{`${localUserID}'s meeting`}</h1>}
            <p className="text-gray-800">Room ID: {roomID}</p>
          </div>
        )}
      </div>

      <div className="flex flex-1 justify-center items-center space-x-4">
        <button
          onClick={() => setMic((prevMic) => !prevMic)}
          className={`${
            mic ? "bg-gray-300" : "bg-red-500 text-white"
          }  place-content-center rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
        >
          {mic ? <MicNoneOutlined /> : <MicOffOutlined />}
        </button>
        <button
          onClick={() => {
            setCamera((prevCamera) => !prevCamera);
          }}
          className={`${
            camera ? "bg-gray-300" : "bg-red-500 text-white"
          }  rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
        >
          {camera ? <VideocamOutlined /> : <VideocamOffOutlined />}
        </button>

        <button
          onClick={() => setCaption((prevCaption) => !prevCaption)}
          className={`${
            !caption ? "" : "bg-red-500 text-white"
          }  rounded-full text-white place-content-center p-3 hover:bg-opacity-80 transition duration-300`}
        >
          {!caption ? (
            <ClosedCaptionOffOutlined />
          ) : (
            <ClosedCaptionDisabledOutlined />
          )}
        </button>

        <button
          onClick={() => {
            window.localStorage.removeItem("localUserID");
            window.location.replace("/");
          }}
          className="bg-red-500 text-white rounded-full p-3 hover:bg-opacity-80 transition duration-300"
        >
          <CallEndOutlined />
        </button>
      </div>
    </div>
  );
}

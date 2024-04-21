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
  MoreVert,
} from "@mui/icons-material";
import {
  MenuItem,
  Select,
  FormControl,
  Switch,
  FormGroup,
  FormControlLabel,
  IconButton,
  Menu,
} from "@mui/material";
import { useSocket } from "./socketProvider";

const LanguageSelect = ({ language, setLanguage }: any) => (
  <FormControl className="w-32">
    <Select
      labelId="language-select-label"
      id="language-select"
      className="text-purple-600 text-lg border rounded bg-grey-300 focus:outline-none focus:border-white"
      value={language}
      onChange={(e) => setLanguage(e.target.value as string)}
    >
      <MenuItem value="default">Select a language</MenuItem>
      <MenuItem value="en">English</MenuItem>
      <MenuItem value="hi">Hindi</MenuItem>
      <MenuItem value="pl">Polish</MenuItem>
      <MenuItem value="fr">French</MenuItem>
      <MenuItem value="it">Italian</MenuItem>
      <MenuItem value="de">German</MenuItem>
      <MenuItem value="ja">Japanese</MenuItem>
    </Select>
  </FormControl>
);

const TranslateSwitch = ({ translate, setTranslate }: any) => (
  <FormGroup>
    <FormControlLabel
      control={
        <Switch
          color="secondary"
          size="medium"
          onChange={() =>
            setTranslate((prevTranslate: boolean) => !prevTranslate)
          }
        />
      }
      label={<span className="text-purple-600 text-xl">Translate</span>}
      labelPlacement="start"
    />
  </FormGroup>
);

const SignSwitch = ({ signTranscribe, setSignTranscribe }: any) => (
  <FormGroup>
    <FormControlLabel
      control={
        <Switch
          color="secondary"
          size="medium"
          onChange={() => setSignTranscribe((prev: boolean) => !prev)}
        />
      }
      label={<span className="text-purple-600 text-xl">Sign Transcribe</span>}
      labelPlacement="start"
    />
  </FormGroup>
);

const MenuContent = ({
  isChat,
  translate,
  infoVisible,
  localUserID,
  roomID,
  handleClose,
  setTranslate,
  language,
  setLanguage,
  setIsChat,
  setInfoVisible,
}: any) => (
  <>
    <MenuItem
      onClick={handleClose}
      sx={{
        display: "felx",
        flexDirection: "column",
      }}
    >
      <TranslateSwitch translate={translate} setTranslate={setTranslate} />
      {/* <button
      onClick={() => setIsChat((prevIsChat: boolean) => !prevIsChat)}
      className={`${
        isChat ? "bg-purple-300" : ""
      }  place-content-center text-white rounded-full p-3 hover:bg-opacity-80 transition duration-300`}
    >
      <MessageOutlined />
    </button> */}
    </MenuItem>
    <MenuItem
      onClick={handleClose}
      sx={{
        display: "felx",
        flexDirection: "column",
      }}
    >
      <LanguageSelect language={language} setLanguage={setLanguage} />
    </MenuItem>
  </>
);

const ButtonsRow = ({ isChat, setIsChat, isList, setIsList, roomID }: any) => {
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
    signTranscribe,
    setSignTranscribe,
  } = useSocket();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    setLocalUserID(window.localStorage.getItem("localUserID"));
  }, []);

  return (
    <div className="flex flex-row-reverse justify-between items-center p-4 bg-gray-800">
      <IconButton
        className="text-white md:hidden"
        aria-label="more"
        id="long-button"
        aria-controls={open ? "long-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVert />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          "aria-labelledby": "long-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuContent
          isChat={isChat}
          translate={translate}
          infoVisible={infoVisible}
          localUserID={localUserID}
          roomID={roomID}
          handleClose={handleClose}
          setTranslate={setTranslate}
          language={language}
          setLanguage={setLanguage}
          setIsChat={setIsChat}
          setInfoVisible={setInfoVisible}
        />
      </Menu>
      <div className="flex justify-center items-center space-x-4">
        <div className="hidden md:flex justify-center items-center gap-2">
          <TranslateSwitch translate={translate} setTranslate={setTranslate} />
          <SignSwitch
            signTranscribe={signTranscribe}
            setSignTranscribe={setSignTranscribe}
          />
          <LanguageSelect language={language} setLanguage={setLanguage} />
        </div>
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
};

export default ButtonsRow;

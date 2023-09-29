"use client";
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendIcon from "@mui/icons-material/Send";
import { Dispatch, SetStateAction } from "react";

interface ChatProps {
  isChat: boolean;
  setIsChat: Dispatch<SetStateAction<boolean>>;
}

export default function ChatBox({ isChat, setIsChat }: ChatProps) {
  return (
    isChat && <div className="chat_box flex flex-col justify-between p-4 border-2 rounded-xl m-2 w-96">
      <div className="flex justify-between">
        <h1 className="text-2xl">In call messages</h1>
        <button
          className=""
          onClick={() => {
            setIsChat(false);
          }}
        >
          <CloseOutlinedIcon />
        </button>
      </div>
      {/* have scrollable messages here */}
      <div className="messages flex">
        <input
          type="text"
          name="message"
          id=""
          className="rounded-xl p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button className="bg-blue-60 h-max p-2">
          <SendIcon />
        </button>
      </div>
    </div>
  );
}

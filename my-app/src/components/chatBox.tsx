"use client"
import CloseOutlinedIcon from "@mui/icons-material/CloseOutlined";
import SendIcon from "@mui/icons-material/Send";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useSocket } from "../components/socketProvider";
import { useSearchParams } from "next/navigation";
import ChatDialog from "./chatDialog";
import { Language } from "@mui/icons-material";

interface ChatProps {
  isChat: boolean;
  setIsChat: Dispatch<SetStateAction<boolean>>;
}

export default function ChatBox({ isChat, setIsChat }: ChatProps) {
  const [message, setMessage] = useState("");
  let sender: string | null;
  if (typeof window !== "undefined" && window.localStorage) {
    sender = window.localStorage.getItem("localUserID");
  }
  const [messages, setMessages] = useState<string[]>([]);
  const { socket, translate, language } = useSocket();
  const searchParams = useSearchParams();
  const roomID = useMemo(() => searchParams.get("roomID"), [searchParams]);

  const translateMessage = async (
    text: string,
    language: string
  ): Promise<string> => {
    const whisperEndpoint =
      process.env.NEXT_PUBLIC_AI_ENDPOINT ?? "http://127.0.0.1:8000/";
    try {
      const response = await fetch(`${whisperEndpoint}/translate_text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text, target_language: language }),
      });
      const data = await response.json();
      return data.translation;
    } catch (error) {
      console.error("Error translating message:", error);
      throw error;
    }
  };

  const sendMessage = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      try {
        socket?.emit("message", { roomID, from: sender, message });
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
      }
    },
    [socket, roomID, message]
  );

  useEffect(() => {
    const handleIncomingMessage = (message: any) => {
      // Conditionally translate the message only if translation is enabled
      if (translate && message.from !== sender) {
        translateMessage(message.message, language).then((text) => {
          setMessages((prevMessages) => [
            ...prevMessages,
            { ...message, text: text },
          ]);
        });
      } else {
        setMessages((prevMessages) => [...prevMessages, message]);
      }
    };

    socket?.on("message", handleIncomingMessage);

    return () => {
      socket?.off("message", handleIncomingMessage);
    };
  }, [translate, language]);

  return (
    isChat && (
      <div
        className="chat_box flex flex-col justify-between p-4 border-2 w-96"
        style={{ maxHeight: "39.5rem" }}
      >
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl">In call messages</h1>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => {
              setIsChat(false);
            }}
          >
            <CloseOutlinedIcon />
          </button>
        </div>
        <div
          className="flex-1 flex flex-col"
          style={{ overflowY: "scroll", scrollbarWidth: "none" }}
        >
          {messages.map((msg: any, index) => (
            <ChatDialog
              key={index}
              text={msg.text}
              name={msg.from}
              original={msg.message}
            />
          ))}
        </div>
        <div className="messages flex">
          <form onSubmit={sendMessage} className="flex w-full">
            <input
              type="text"
              name="message"
              id=""
              autoComplete="off"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 rounded-xl p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              className="bg-blue-500 text-white rounded-lg h-max px-4 ml-2"
              style={{height:"3rem"}}
              type="submit"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>
    )
  );
}

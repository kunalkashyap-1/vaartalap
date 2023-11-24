"use client";
import { Box, TextField, Typography, Modal, Button } from "@mui/material";
import { useState, useCallback, useEffect } from "react";
import { useSocket } from "../../components/socketProvider";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function Lobby() {
  const [email, setEmail] = useState("");
  const { socket } = useSocket();
  const roomID = useSearchParams().get("roomID");
  const { push } = useRouter();

  const handleSubmit = useCallback(
    (e: any) => {
      e.preventDefault();
      window.localStorage.setItem("localUserID", email);
      if (socket) {
        socket.emit("room:join", { email, room: roomID });
      }
    },
    [email, roomID, socket]
  );

  const handleJoinRoom = useCallback(
    (data: any) => {
      const { email, room } = data;
      push(`/room?roomID=${room}`);
    },
    [push]
  );

  useEffect(() => {
    socket?.on("room:join", handleJoinRoom);
    return () => {
      socket?.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <form className="w-full h-screen bg-gray-100">
      <Box sx={style} className="w-1/4 h-1/4 flex flex-col gap-4 rounded-2xl">
        {/* <Typography id="modal-modal-title" variant="h6" component="h2">
        Enter User ID
      </Typography> */}
        <input
          id="outlined-basic"
          className="rounded-xl p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
          type="email"
          placeholder="Enter Email ID"
          required
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <Button
          className="bg-green-900 w-1/4 m-auto"
          variant="contained"
          color="success"
          type="submit"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </form>
  );
}

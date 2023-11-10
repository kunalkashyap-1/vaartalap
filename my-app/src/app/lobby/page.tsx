"use client"
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

export default function Lobby(){
  const [ email, setEmail ] = useState("");
  const {socket} = useSocket();
  const roomID = useSearchParams().get("roomID");
  const { push } = useRouter();



  const handleSubmit = useCallback(
    (e:any) => {
      // e.preventDefault();
      if(socket){
      socket.emit("room:join", { email, room:roomID });
      }
    },
    [email,roomID, socket]
  );

  const handleJoinRoom = useCallback(
    (data :any) => {
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

    return <>
    <Box sx={style}>
      {/* <Typography id="modal-modal-title" variant="h6" component="h2">
        Enter User ID
      </Typography> */}
      <TextField
        id="outlined-basic"
        label="Enter Email ID"
        variant="outlined"
        type="email"
        required
        onChange={(e) => {
          setEmail(e.target.value);
        }}
      />
      <Button
        className="bg-green-900"
        variant="contained"
        color="success"
        onClick={handleSubmit}
      >
        Submit
      </Button>
    </Box>
  </>
}
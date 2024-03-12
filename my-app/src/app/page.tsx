"use client";
import Image from "next/image";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";
import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, TextField, Typography, Modal, Button } from "@mui/material";
import { useSocket } from "../components/socketProvider";

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

const Home = () => {
  const [code, setCode] = useState<string>("");
  const { push } = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [email, setEmail] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { socket } = useSocket();

  const handleSubmit = useCallback(
    (e: any) => {
      const fourDigit = Math.floor(Math.random() * 4 * 10000);
      window.localStorage.setItem("localUserID", email);
      socket?.emit("room:join", { email, room: fourDigit.toString() });
    },
    [email, socket]
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
    <div className="bg-gray-100 min-h-screen">
      <nav className="navbar bg-white flex justify-between p-4 items-center">
        <div
          className="flex cursor-pointer items-center"
          onClick={(e) => {
            push("/");
          }}
        >
          <Image alt="logo" width={40} height={40} src="/logo.png" />
          <h1 className="text-3xl ml-2 font-semibold">Vaartalap</h1>
        </div>
        <button
          className="bg-purple-700 font-semibold rounded-lg p-3 text-white hover:bg-purple-600 transition-colors"
          onClick={handleOpen}
        >
          Start a meeting
        </button>
      </nav>
      <main>
        <div className="hero p-6">
          <div className="flex justify-between flex-col md:flex-row p-4">
            <div className="flex flex-col gap-9">
              <p className="text-3xl md:text-7xl font-semibold text-gray-800 py-12">
                Connect Beyond Borders: Your World, One Click Away
              </p>
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <button
                  className="bg-purple-700 rounded-lg p-3 text-white hover:bg-purple-600 transition-colors"
                  onClick={handleOpen}
                >
                  Create instant meeting
                </button>
                <input
                  className="rounded-xl p-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  type="text"
                  name="code"
                  id="code"
                  placeholder="Enter a code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  className="bg-purple-700 rounded-lg p-3 text-white hover:bg-purple-600 transition-colors flex items-center"
                  onClick={(e) => push(`/lobby?roomID=${code}`)}
                >
                  <LoginOutlinedIcon className="md:mr-2" />
                  Join
                </button>
              </div>
            </div>
            <Image
              className="floating md:ml-8"
              alt=""
              width={500}
              height={500}
              src="/vector.png"
            />
          </div>
        </div>
        <div>
          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Box sx={style} className="flex flex-col gap-4 rounded-2xl">
              <TextField
                id="outlined-basic"
                label="Enter User Name"
                variant="outlined"
                type="email"
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
              <Button
                className="bg-green-900 w-full md:w-1/2"
                variant="contained"
                color="success"
                onClick={handleSubmit}
              >
                Submit
              </Button>
            </Box>
          </Modal>
        </div>
      </main>
    </div>
  );
};

export default Home;

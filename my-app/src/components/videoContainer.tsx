"use client";
import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../components/socketProvider";

const VideoContainer = () => {
  const {
    socket,
    mic,
    setMic,
    camera,
    setCamera,
    caption,
    setCaption,
    screenShare,
    setScreenShare,
    participantList,
    setParticipantList,
  } = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState<any>();
  const [remoteStream, setRemoteStream] = useState<any>();
  const [onCall, setOnCall] = useState<boolean>(false);

  const handleUserJoined = useCallback(({ email, id }: any) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);


const handleCallUser = useCallback(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,  // Always get the audio track
    video: true,  // Always get the video track
  });
  const offer = await peer.getOffer();
  socket?.emit("user:call", { to: remoteSocketId, offer });
  setMyStream(stream);
}, [remoteSocketId, socket, setMyStream]);

const handleIncommingCall = useCallback(
  async ({ from, offer }: any) => {
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    setMyStream(stream);
    console.log(`Incoming Call`, from, offer);
    const ans = await peer.getAnswer(offer);
    socket?.emit("call:accepted", { to: from, ans });
  },
  [socket]
);

  

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }: any) => {
      peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }: any) => {
      const ans = await peer.getAnswer(offer);
      socket?.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }: any) => {
    await peer.setLocalDescription(ans);
  }, []);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);
    socket?.on("incomming:call", handleIncommingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncomming);
    socket?.on("peer:nego:final", handleNegoNeedFinal);

    return () => {
      socket?.off("user:joined", handleUserJoined);
      socket?.off("incomming:call", handleIncommingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeedIncomming);
      socket?.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  useEffect(() => {
    if (myStream) {
      myStream.getAudioTracks().forEach((track:any) => {
        if (!mic) {
          track.stop();  // Stop the audio track
        }
      });
    }
  }, [mic, myStream, sendStreams]);
  
  useEffect(() => {
    if (myStream) {
      myStream.getVideoTracks().forEach((track:any) => {
        if (!camera) {
          track.stop();  // Stop the video track
        }
      });
    }
  }, [camera, myStream, sendStreams]);

  return (
    <section className="flex-1" style={{ backgroundColor: "rgb(28,30,32)" }}>
      <div className="w-full h-full flex flex-col justify-center items-center relative">
        <div className="absolute inset-0">
          {remoteStream && (
            <>
              <ReactPlayer
                playing
                height="100%"
                width="100%"
                url={remoteStream}
              />
            </>
          )}

          {remoteSocketId ? (
            !onCall && (
              <div className="flex items-center justify-center absolute top-1/2 right-1/2">
                <button
                  className="text-white rounded-2xl p-4 bg-purple-500 hover:bg-purple-400 transition duration-300"
                  onClick={() => {
                    handleCallUser();
                    setOnCall(true);
                  }}
                >
                  CALL
                </button>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full">
              <h4 className="p-4 rounded-2xl bg-gray-500">
                No one in the room
              </h4>
            </div>
          )}
        </div>

        <div className="absolute bottom-5 right-5">
          {myStream && (
            <>
              <ReactPlayer
                playing
                muted
                height="200px"
                width="200px"
                url={myStream}
              />
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default VideoContainer;

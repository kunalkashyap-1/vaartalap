"use client";
import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../service/peer";
import { useSocket } from "../components/socketProvider";
import vad from "voice-activity-detection";

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
  let language = "hi";
  let translate = "true";

  const handleUserJoined = useCallback(({ email, id }: any) => {
    console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const offer = await peer.getOffer();
    socket?.emit("user:call", { to: remoteSocketId, offer });
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }: any) => {
      setRemoteSocketId(from);
      console.log(`Incoming Call`, from, offer);
      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer?.addTrack(track, myStream);
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
    peer.peer?.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer?.removeEventListener("negotiationneeded", handleNegoNeeded);
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
    peer.peer?.addEventListener("track", async (ev) => {
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

  // useEffect to fetch stream and set it to myStream state
  useEffect(() => {
    const fetchStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, // Always get the audio track
        video: true, // Always get the video track
      });
      setMyStream(stream);
    };
    fetchStream();
  }, []);

  // useEffect to handle VAD
  useEffect(() => {
    if (myStream) {
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(myStream);

      vad(audioContext, myStream, {
        fftSize: 1024,
        bufferLen: 1024,
        smoothingTimeConstant: 0.2,
        minCaptureFreq: 85,
        maxCaptureFreq: 255,
        noiseCaptureDuration: 1000,
        minNoiseLevel: 0.3,
        maxNoiseLevel: 0.7,
        avgNoiseMultiplier: 1.2,
        onVoiceStart: () => {
          console.log("audio started");

          // const mediaRecorder = new MediaRecorder(myStream);
          // let audioChunks: any = [];
          // let intervalId: any;

          // const sendDataToAPI = () => {
          //   const blob = new Blob(audioChunks, { type: "audio/wav" });
          //   const formData = new FormData();
          //   formData.append("audio", blob, "audio_chunk.wav");
          //   formData.append("translate",translate);
          //   formData.append("language",language);

          //   fetch("http://localhost:8000/api/process/", {
          //     method: "POST",
          //     body: formData,
          //   })
          //     .then((response) => {
          //       if (response.ok) {
          //         return response.json();
          //       } else {
          //         throw new Error(
          //           `Django API returned non-OK status: ${response.status}`
          //         );
          //       }
          //     })
          //     .then((data) => {
          //       console.log("Django API translation response:", data);
          //     })
          //     .catch((error) => {
          //       console.error(
          //         "Error sending audio chunk to Django API for translation:",
          //         error
          //       );
          //     })
          //     .finally(() => {
          //       audioChunks = [];
          //     });
          // };

          // mediaRecorder.ondataavailable = (event) => {
          //   if (event.data.size > 0) {
          //     audioChunks.push(event.data);
          //   }
          // };

          // mediaRecorder.onstop = () => {
          //   sendDataToAPI();
          //   clearInterval(intervalId);
          // };

          // mediaRecorder.start();

          // intervalId = setInterval(() => {
          //   mediaRecorder.stop();
          //   mediaRecorder.start();
          // }, 5000);
        },

        onVoiceStop: () => {
          // Voice activity has stopped
          console.log("audio stop");
        },
        onUpdate: (val: number) => {
          // Update callback if needed
        },
      });
    }
  }, [myStream]);

  // useEffect to handle turning on and off camera and mic
  useEffect(() => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      const audioTrack = myStream.getAudioTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = camera;
      }
      if (audioTrack) {
        audioTrack.enabled = mic;
      }
    }
  }, [myStream, camera, mic]);

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

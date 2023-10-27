"use client";
import React, { useEffect, MutableRefObject, useRef } from "react";
import { useSocket } from "./socketProvider";

interface VideoProps {
  roomID: string | null;
}

// const VideoContainer = ({ roomID, userID }: VideoProps) => {
//   const userVideoRef: MutableRefObject<any> = useRef();
//   const { socket, mic, camera } = useSocket();
//   const currentStreamRef: MutableRefObject<MediaStream | null> = useRef(null);

//   useEffect(() => {
//     // Function to set the video stream to a given video element
//     const streamVideo = (
//       videoRef: MutableRefObject<any>,
//       stream: MediaStream
//     ) => {
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     };

//     const getUserMediaAndConnect = async () => {
//       // Stop the previous stream if it exists
//       if (currentStreamRef.current) {
//         currentStreamRef.current.getTracks().forEach((track) => track.stop());
//       }

//       // Only proceed if the camera is enabled
//         const audioStream = mic ? await navigator.mediaDevices.getUserMedia({ audio: true }) : null;
//         const videoStream = camera ?await navigator.mediaDevices.getUserMedia({ video: true }) : null;

//         // Combine audio and video streams into one stream
//         const streamsToCombine: MediaStream[] = [];

//         if (audioStream) {
//           streamsToCombine.push(audioStream);
//         }

//         if (videoStream) {
//           streamsToCombine.push(videoStream);
//         }

//         const combinedStream = new MediaStream();

//         for (const stream of streamsToCombine) {
//           stream.getTracks().forEach((track) => {
//             combinedStream.addTrack(track);
//           });
//         }

//         currentStreamRef.current = combinedStream; // Store the current stream

//         // Set the user's video stream
//         streamVideo(userVideoRef, combinedStream);

//     };

//     // Call getUserMediaAndConnect whenever mic or camera changes
//     getUserMediaAndConnect();
//   }, [mic, camera]);

//   useEffect(() => {
//     // Check if a socket connection exists
//     if (socket) {
//       // Emit a "connected" event with roomID and userID
//       socket.emit("userConnected", { roomID, userID });

//       // Emit a event that causes backend to emit the other users data.
//     }
//   }, [roomID, userID]);

//   useEffect(() => {
//     // Stop the video stream when the camera is turned off
//     if (!camera) {
//       currentStreamRef.current?.getTracks().forEach((track) => track.stop());
//     }
//   }, [camera]);

//   return (
//     <div className="flex justify-center items-center flex-1">
//       <div className="w-1/2">
//         <video ref={userVideoRef} autoPlay className="w-full h-auto" />
//         <p className="text-center text-gray-600">{userID}</p>
//       </div>
//     </div>
//   );
// };

// export default VideoContainer;

// VideoContainer.js

// import React, { useEffect, useRef } from "react";
// import { useSocket } from "./socketProvider";

// VideoContainer.tsx

const VideoContainer: React.FC<VideoProps> = ({ roomID }) => {
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peerVideoRef = useRef<HTMLVideoElement>(null);
  const { socket } = useSocket();
  const peerConnection = new RTCPeerConnection();
  const localUserID = localStorage.getItem("localUserID");

  useEffect(() => {


    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
          stream
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, stream));
        }

        peerConnection.ontrack = (event) => {
          if (peerVideoRef.current && event.streams[0]) {
            peerVideoRef.current.srcObject = event.streams[0];
          }
        };
      });

    if (socket) {
      socket.emit("userConnected", { roomID, localUserID });

      socket.on("user-connected", async (userId: any) => {
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        socket.emit("offer", { offer, userId });
      });

      socket.on("receive-offer", async (offer, callerSocketID) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(offer)
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        socket.emit("answer", { answer, callerSocketID });
      });

      socket.on("receive-answer", async (answer) => {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socket.on("receive-ice-candidate", async (candidate) => {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("new-ice-candidate", event.candidate);
        }
      };
    }
  }, []);

  return (
    <div>
      <video ref={userVideoRef} autoPlay muted />
      <p>{localUserID}</p>
      <video ref={peerVideoRef} autoPlay />
    </div>
  );
};

export default VideoContainer;

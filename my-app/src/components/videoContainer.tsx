"use client";
import { useEffect, MutableRefObject, useRef } from "react";
import { useSocket } from "./socketProvider";

interface VideoProps {
  roomID: string | null;
  userID: string | null;
}

const VideoContainer = ({ roomID, userID }: VideoProps) => {
  const userVideoRef: MutableRefObject<any> = useRef();
  const { socket, mic, camera } = useSocket();

  useEffect(() => {
    // Function to set the video stream to a given video element
    const streamVideo = (
      videoRef: MutableRefObject<any>,
      stream: MediaStream
    ) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    let currentStream: MediaStream | null = null;

    const getUserMediaAndConnect = async () => {
      // Stop the previous stream if it exists
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      // Create separate audio and video streams
      const audioStream = mic
        ? await navigator.mediaDevices.getUserMedia({ audio: true })
        : null;

      const videoStream = camera
        ? await navigator.mediaDevices.getUserMedia({ video: true })
        : null;

      if (!camera) {
        // If camera is turned off, stop the video track
        videoStream?.getTracks().forEach((track) => track.stop());
      }

      // Combine audio and video streams into one stream
      const streamsToCombine: MediaStream[] = [];

      if (audioStream) {
        streamsToCombine.push(audioStream);
      }

      if (videoStream) {
        streamsToCombine.push(videoStream);
      }

      const combinedStream = new MediaStream();

      for (const stream of streamsToCombine) {
        stream.getTracks().forEach((track) => {
          combinedStream.addTrack(track);
        });
      }

      currentStream = combinedStream; // Store the current stream

      // Set the user's video stream
      streamVideo(userVideoRef, combinedStream);
    };

    // Call getUserMediaAndConnect whenever mic or camera changes
    getUserMediaAndConnect();
  }, [mic, camera]);

  useEffect(() => {
    // Check if a socket connection exists
    if (socket) {
      // Emit a "connected" event with roomID and userID
      socket.emit("userConnected", { roomID, userID });

      // Emit a "join room" event with roomID
      socket.emit("join room", roomID);
      socket.emit("hello",{greeting:"hello"});
    }
  }, [roomID, userID]);

  return (
    <div className="flex justify-center items-center flex-1">
      <div className="w-1/2">
        <video ref={userVideoRef} autoPlay className="w-full h-auto" />
        <p className="text-center text-gray-600">{userID}</p>
      </div>
    </div>
  );
};

export default VideoContainer;

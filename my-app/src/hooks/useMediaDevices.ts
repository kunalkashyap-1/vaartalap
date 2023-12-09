"use client";
import { useEffect } from "react";

const useMediaDevices = (
  mic: boolean,
  camera: boolean,
  myStream: MediaStream | null,
  setMyStream: (stream: MediaStream | null) => void
) => {
  // useEffect to handle turning on and off camera and mic
  useEffect(() => {
    if (myStream) {
    //   const videoTrack = myStream.getVideoTracks()[0];
      const audioTrack = myStream.getAudioTracks()[0];
    //   if (videoTrack) {
    //     videoTrack.enabled = camera;
    //   }
      if (audioTrack) {
        audioTrack.enabled = mic;
      }
    }

  }, [mic]);

  useEffect(() => {
    const cameraToggle = async () => {
      if (myStream) {
        // Check if there's an existing audio track
        const audioTrack = myStream.getAudioTracks()[0];
  
        try {
          if (camera) {
            // Create a new stream with video track only
            const videoStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });
  
            // Use the existing audio track if available
            if (audioTrack) {
              // Get the video track from the new stream
              const videoTrack = videoStream.getVideoTracks()[0];
  
              // Replace the existing video track with the new one
              myStream.removeTrack(myStream.getVideoTracks()[0]);
              myStream.addTrack(videoTrack);
            } else {
              // If there's no existing audio track, update the stream entirely
              setMyStream(videoStream);
            }
          } else {
            // Stop the video track and keep the audio track
            myStream.getVideoTracks().forEach((track: any) => track.stop());
          }
        } catch (error) {
          console.error("Error toggling camera:", error);
        }
      }
    };
  
    cameraToggle();
  }, [camera, setMyStream, myStream]);
  
};

export default useMediaDevices;

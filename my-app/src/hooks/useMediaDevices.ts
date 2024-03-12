"use client";
import { useEffect } from "react";
import peerService from "../service/peer";

const useMediaDevices = (
  mic: boolean,
  camera: boolean,
  myStream: MediaStream | null,
  setMyStream: (stream: MediaStream | null) => void,
  peer: peerService
) => {
  // useEffect to handle turning on and off microphone
  useEffect(() => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = mic;
      }
    }
  }, [mic]);

  // useEffect to handle turning on and off camera
  useEffect(() => {
    const cameraToggle = async () => {
      if (myStream) {
        try {
          if (camera) {
            // Turn on the camera
            const videoStream = await navigator.mediaDevices.getUserMedia({
              video: true,
            });

            // Replace the video track in the existing stream
            const videoTrack = videoStream.getVideoTracks()[0];
            // myStream.getVideoTracks().forEach((track) => track.stop());
            myStream.removeTrack(myStream.getVideoTracks()[0]);
            myStream.addTrack(videoTrack);

            // Replace the video track in the peer connection
            const senders = peer.peer?.getSenders();
            console.log(peer.peer);
            const videoSender = senders?.find(
              (sender) => sender.track?.kind === "video"
            );

            if (videoSender) {
              // Replace the track in the remote peer connection
              videoSender
                .replaceTrack(videoTrack)
                .then(() => {
                  // console.log("Video track replaced successfully.");
                })
                .catch((error) => {
                  console.error("Error replacing video track:", error);
                });
            }

            // Update the state with the modified stream
            // setMyStream(myStream);
          } else {
            // Turn off the camera
            myStream.getVideoTracks().forEach((track) => track.stop());
          }
        } catch (error) {
          console.error("Error toggling camera:", error);
        }
      }
    };

    cameraToggle();
  }, [camera]);

  // Cleanup function to stop tracks when the component unmounts
  // useEffect(() => {
  //   return () => {
  //     if (myStream) {
  //       myStream.getTracks().forEach(track => track.stop());
  //     }
  //   };
  // }, []);
};

export default useMediaDevices;

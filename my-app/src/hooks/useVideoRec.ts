import { useEffect, useRef } from "react";
import { useSocket } from "@/components/socketProvider";

const useVideoRec = (
  remoteStream: MediaStream,
  handleVideoProcessing: (videoBlob: Blob) => void
) => {
  const { signTranscribe } = useSocket();
  const videoChunksRef = useRef<any[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const Endpoint =
    process.env.NEXT_PUBLIC_AI_ENDPOINT ?? "http://127.0.0.1:8000/";

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const sendDataToAPI = () => {
      if (videoChunksRef.current.length > 0) {
        const videoBlob = new Blob(videoChunksRef.current, {
          type: "video/webm",
        });
        handleVideoProcessing(videoBlob);
        videoChunksRef.current = [];

        const formData = new FormData();
        formData.append("video", videoBlob, "recorded_video.webm");

        fetch(`${Endpoint}/process_video`, {
          method: "POST",
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error(`API call failed with status ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {})
          .catch((error) => {
            console.error("Error making API call:", error);
          });
      }
    };

    const startRecording = () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "recording"
      ) {
        mediaRecorderRef.current.start();
      }
    };

    const stopRecording = () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
        sendDataToAPI(); // Send data immediately after stopping recording
      }
    };

    if (remoteStream && signTranscribe) {
      mediaRecorderRef.current = new MediaRecorder(remoteStream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      startRecording(); // Start recording initially

      // Record every three seconds
      intervalId = setInterval(() => {
        stopRecording(); // Stop previous recording and send data
        startRecording(); // Start new recording
      }, 3000);
    }

    return () => {
      clearInterval(intervalId); // Clear interval when component unmounts
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop(); // Stop recording
      }
    };
  }, [remoteStream, handleVideoProcessing, signTranscribe]);
};

export default useVideoRec;

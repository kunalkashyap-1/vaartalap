import { useEffect, useRef } from "react";
import { useSocket } from "@/components/socketProvider";
import { useReactMediaRecorder } from "react-media-recorder";

const useVideoRec = (
  remoteStream: MediaStream,
  handleSignTranscribe: () => void
) => {
  const { signTranscribe } = useSocket();
  const videoBlobUrlRef = useRef<string | null>(null); // Optional reference for potential UI usage
  const { status, startRecording, stopRecording, mediaBlobUrl } =
    useReactMediaRecorder({
      video: true,
    });
  const isRecording = status === "recording"; // Extract recording state
  const Endpoint =
    process.env.NEXT_PUBLIC_AI_ENDPOINT ?? "http://127.0.0.1:8000";

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const sendDataToAPI = async () => {
      if (mediaBlobUrl) {
        const videoBlob = await fetch(mediaBlobUrl).then((response) =>
          response.blob()
        );
        // handleVideoProcessing(videoBlob); // Can be used for local processing as well

        const formData = new FormData();
        formData.append("video", videoBlob, "recorded_video.mp4"); // Changed file extension

        try {
          const response = await fetch(`${Endpoint}/process_video`, {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            throw new Error(`API call failed with status ${response.status}`);
          }

          const data = await response.json();
          // Handle API response (optional)
        } catch (error) {
          console.error("Error making API call:", error);
        }
      }
    };

    if (remoteStream && signTranscribe) {
      // Start recording initially
      startRecording();

      // Record every three seconds
      intervalId = setInterval(() => {
        stopRecording(); // Stop previous recording
        sendDataToAPI(); // Send data using mediaBlobUrl
        startRecording(); // Start new recording
      }, 2000);
    }

    return () => {
      clearInterval(intervalId);
      if (isRecording) {
        stopRecording(); // Stop recording if ongoing
      }
    };
  }, [remoteStream, signTranscribe, handleSignTranscribe]);

  return {
    isRecording, // Expose recording state for potential UI updates
  };
};

export default useVideoRec;

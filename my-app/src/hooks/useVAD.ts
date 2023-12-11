"use client";
import { useEffect, useCallback, useRef } from "react";
import vad from "voice-activity-detection";
import { useSocket } from "@/components/socketProvider";

const useVAD = (
  remoteStream: MediaStream,
  handleCaptionChange:(newCaption: string) => void
) => {
  const { caption, translate, language } = useSocket();
  const intervalIdRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<any[]>([]);

  const sendDataToAPI = useCallback(() => {
    if (!caption) {
      audioChunksRef.current = [];
      return;
    }
    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
      const formData = new FormData();
      formData.append("audio", blob, "audio_chunk.wav");
      translate ? formData.append("language", language) : null;
      formData.append("translate", `${translate}`);

      // console.log("Sending audio chunk to API");
      fetch(`${process.env.NEXT_PUBLIC_AI_ENDPOINT}/api/process/`, {
        method: "POST",
        body: formData,
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw new Error(
              `Django API returned non-OK status: ${response.status}`
            );
          }
        })
        .then((data) => {
          // console.log("Django API translation response:", data);
          translate
            ? handleCaptionChange(data.translation)
            : handleCaptionChange(data.transcription.text);
        })
        .catch((error) => {
          // console.error(
          //   "Error sending audio chunk to Django API for translation:",
          //   error
          // );
        })
        .finally(() => {
          audioChunksRef.current = [];
        });
    }
  }, [caption]); // Include caption in the dependency array

  useEffect(() => {
    const fftSize = 1024;
    const bufferLen = 1024;
    const smoothingTimeConstant = 0.2;
    const minCaptureFreq = 75;
    const maxCaptureFreq = 255;
    const noiseCaptureDuration = 1000;
    const minNoiseLevel = 0.2;
    const maxNoiseLevel = 0.7;
    const avgNoiseMultiplier = 1.2;

    if (remoteStream) {
      const audioTrack = remoteStream.getAudioTracks()[0];

      if (audioTrack) {
        const audioContext = new AudioContext();
        const source = audioContext?.createMediaStreamSource(remoteStream);
        mediaRecorderRef.current = new MediaRecorder(remoteStream);

        const vadInstance = vad(audioContext, remoteStream, {
          fftSize,
          bufferLen,
          smoothingTimeConstant,
          minCaptureFreq,
          maxCaptureFreq,
          noiseCaptureDuration,
          minNoiseLevel,
          maxNoiseLevel,
          avgNoiseMultiplier,
          onVoiceStart: () => {
            // console.log("audio started");
            // Start the MediaRecorder when voice activity starts
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.start();
              intervalIdRef.current = setInterval(() => {
                mediaRecorderRef.current?.stop();
                mediaRecorderRef.current?.start();
              }, 5000);
            }
          },
          onVoiceStop: () => {
            // console.log("audio stop");
            // Stop the MediaRecorder when voice activity stops
            if (mediaRecorderRef.current) {
              mediaRecorderRef.current.stop();
              clearInterval(intervalIdRef.current);
            }
            sendDataToAPI();
          },
          onUpdate: (val: number) => {
            if (!caption) {
              // Stop mediaRecorder and clear the interval
              if (mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
              }
              clearInterval(intervalIdRef.current);
              return;
            }
          },
        });

        // Handle data availability and initiate API call
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorderRef.current.onstop = () => {
          // Check if the MediaRecorder is in the "recording" state before initiating the API call
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
          ) {
            sendDataToAPI();
          }
        };

        return () => {
          // Cleanup when the component unmounts
          vadInstance.destroy();
          audioContext.close();
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
          }
          clearInterval(intervalIdRef.current);
        };
      }
    }
  }, [remoteStream, caption, sendDataToAPI]); // Include caption and sendDataToAPI in the dependency array
};

export default useVAD;

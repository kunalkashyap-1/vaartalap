"use client";
import { useEffect } from "react";
import vad from "voice-activity-detection";

const useVAD = (myStream: MediaStream | null, mic: boolean) => {
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

    let audioChunks: any = [];
    let intervalId: any;

    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];

      if (audioTrack) {
        const audioContext = new AudioContext();
        const source = audioContext?.createMediaStreamSource(myStream);
        const mediaRecorder = new MediaRecorder(myStream);

        let isSpeaking = false;

        const vadInstance = vad(audioContext, myStream, {
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
            console.log("audio started");
            isSpeaking = true;

            const sendDataToAPI = () => {
              if (audioChunks.length > 0) {
                const blob = new Blob(audioChunks, { type: "audio/wav" });
                const formData = new FormData();
                formData.append("audio", blob, "audio_chunk.wav");

                console.log("Sending audio chunk to API");
                // fetch("http://localhost:8000/api/process/", {
                //   method: "POST",
                //   body: formData,
                // })
                //   .then((response) => {
                //     if (response.ok) {
                //       return response.json();
                //     } else {
                //       throw new Error(
                //         `Django API returned non-OK status: ${response.status}`
                //       );
                //     }
                //   })
                //   .then((data) => {
                //     console.log("Django API translation response:", data);
                //   })
                //   .catch((error) => {
                //     console.error(
                //       "Error sending audio chunk to Django API for translation:",
                //       error
                //     );
                //   })
                //   .finally(() => {
                //     audioChunks = [];
                //   });
              }
            };

            mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                audioChunks.push(event.data);
              }
            };

            mediaRecorder.onstop = () => {
              sendDataToAPI();
              clearInterval(intervalId);
              if (!isSpeaking) {
                // Make the final API call after user stops speaking
                console.log("Making final API call");
                // Add logic here to make the final API call
              }
            };

            mediaRecorder.start();

            intervalId = setInterval(() => {
              mediaRecorder.stop();
              mediaRecorder.start();
            }, 5000);
          },
          onVoiceStop: () => {
            console.log("audio stop");
            isSpeaking = false;
            mediaRecorder.stop();
          },
          onUpdate: (val: number) => {
            // Your code for update callback if needed
          },
        });

        return () => {
          // Cleanup when the component unmounts
          vadInstance.destroy();
          audioContext.close();
          mediaRecorder.stop();
        };
      }
    }
  }, [myStream]);
};

export default useVAD;
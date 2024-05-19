import os
import cv2
import cv2
import mediapipe

from utils.dataset_utils import load_dataset, load_reference_signs
from utils.mediapipe_utils import mediapipe_detection
from sign_recorder import SignRecorder
from webcam_manager import WebcamManager

# Get the current directory
current_directory = os.path.dirname(os.path.abspath(__file__))

# Define the video file name
video_file_name = 'test.mp4'

# Construct the full path to the video file
video_file_path = os.path.join(current_directory, "/tmp/tmpyz16npzc.webm")

if __name__ == "__main__":
    # Create dataset of the videos where landmarks have not been extracted yet
    videos = load_dataset()

    # Create a DataFrame of reference signs (name: str, model: SignModel, distance: int)
    reference_signs = load_reference_signs(videos)

    # Object that stores mediapipe results and computes sign similarities
    sign_recorder = SignRecorder(reference_signs)

    # Object that draws keypoints & displays results
    # webcam_manager = WebcamManager()

    # Turn on the webcam
    cap = cv2.VideoCapture(video_file_path)
    if not cap.isOpened():
        print("Error: Unable to open the camera.")
        exit()

    # Set up the Mediapipe environment
    with mediapipe.solutions.holistic.Holistic(
        min_detection_confidence=0.5, min_tracking_confidence=0.5
    ) as holistic:
        while cap.isOpened():
            # print()
            # Read feed
            ret, frame = cap.read()
            if not ret:
                # print("Error: Unable to read frame from the camera.")
                break

            # Make detections
            image, results = mediapipe_detection(frame, holistic)

            # Process results
            sign_detected, is_recording = sign_recorder.process_results(results)
            if len(sign_detected) > 0:
                print(sign_detected)

            # Update the frame (draw landmarks & display result)
            # webcam_manager.update(frame, results, sign_detected, is_recording)

            # Display the camera feed
            # cv2.imshow("Camera Feed", frame)


            sign_recorder.record()

    cap.release()
    cv2.destroyAllWindows()

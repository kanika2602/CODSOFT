"""
Face Engine - Core AI Processing Module
Uses OpenCV Haar Cascades + DeepFace for detection and recognition
"""

from email.mime import image

import cv2
import numpy as np
import logging
from typing import Dict, List, Optional, Tuple
import os
import json

logger = logging.getLogger(__name__)

# Try to import deepface; gracefully degrade if unavailable
try:
    from deepface import DeepFace
    DEEPFACE_AVAILABLE = True
    logger.info("✅ DeepFace loaded successfully")
except ImportError:
    DEEPFACE_AVAILABLE = False
    logger.warning("⚠️  DeepFace not available, using Haar Cascade only")


class FaceEngine:
    """
    Core face detection and recognition engine.
    Uses Haar Cascade (fast) + DeepFace/ArcFace (accurate)
    """

    def __init__(self):
        self.haar_cascade = None
        self.eye_cascade = None
        self.model_name = "ArcFace"      # Can swap: VGG-Face, Facenet, DeepFace
        self.detector_backend = "opencv"  # Can swap: retinaface, mtcnn
        self.distance_metric = "cosine"
        self.recognition_threshold = 0.40
        self._load_cascades()
        logger.info(f"FaceEngine initialized | DeepFace: {DEEPFACE_AVAILABLE}")

    def _load_cascades(self):
        """Load OpenCV Haar Cascade classifiers"""
        try:
            cascade_path = cv2.data.haarcascades
            self.haar_cascade = cv2.CascadeClassifier(
                os.path.join(cascade_path, 'haarcascade_frontalface_default.xml')
            )
            self.eye_cascade = cv2.CascadeClassifier(
                os.path.join(cascade_path, 'haarcascade_eye.xml')
            )
            logger.info("✅ Haar Cascades loaded")
        except Exception as e:
            logger.error(f"Failed to load Haar Cascade: {e}")

    def detect_faces_haar(self, image: np.ndarray) -> List[Dict]:
        """Fast face detection using Haar Cascade"""
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)

        faces_raw = self.haar_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30),
            flags=cv2.CASCADE_SCALE_IMAGE
        )

        detected = []
        for (x, y, w, h) in faces_raw:
            face_roi_gray = gray[y:y+h, x:x+w]
            eyes = self.eye_cascade.detectMultiScale(face_roi_gray) if self.eye_cascade else []
            confidence = min(0.95, 0.70 + (len(eyes) * 0.1))

            detected.append({
                "bbox": {"x": int(x), "y": int(y), "w": int(w), "h": int(h)},
                "confidence": round(confidence, 3),
                "eyes_detected": len(eyes),
                "method": "haar_cascade"
            })

        return detected

    def detect_faces_deepface(self, image: np.ndarray) -> List[Dict]:
        """Deep learning based face detection"""
        try:
            results = DeepFace.extract_faces(
                img_path=image,
                detector_backend=self.detector_backend,
                enforce_detection=False
            )
            detected = []
            for r in results:
                if r.get('confidence', 0) > 0.5:
                    fa = r['facial_area']
                    detected.append({
                        "bbox": {
                            "x": int(fa['x']), "y": int(fa['y']),
                            "w": int(fa['w']), "h": int(fa['h'])
                        },
                        "confidence": round(r.get('confidence', 0.8), 3),
                        "method": "deepface"
                    })
            return detected
        except Exception as e:
            logger.warning(f"DeepFace detection fallback to Haar: {e}")
            return []

    def detect_faces(self, image: np.ndarray) -> Dict:
        """Main detect pipeline — returns annotated image + face data"""
        if DEEPFACE_AVAILABLE:
            faces = self.detect_faces_deepface(image)
        if not DEEPFACE_AVAILABLE or len(faces) == 0:
            faces = self.detect_faces_haar(image)

        annotated = self._draw_detections(image.copy(), faces)

        return {
            "face_count": len(faces),
            "faces": faces,
            "annotated_image": annotated
        }

    def extract_embedding(self, image: np.ndarray) -> Dict:
        """Extract face embedding vector for registration"""
        try:
            # First detect face
            faces = self.detect_faces_haar(image)
            if not faces:
                return {"success": False, "error": "No face detected in image"}

            face = faces[0]
            bbox = face['bbox']
            # Crop face with padding
            pad = 20
            h, w = image.shape[:2]
            x1 = max(0, bbox['x'] - pad)
            y1 = max(0, bbox['y'] - pad)
            x2 = min(w, bbox['x'] + bbox['w'] + pad)
            y2 = min(h, bbox['y'] + bbox['h'] + pad)
            face_crop = image[y1:y2, x1:x2]

            if DEEPFACE_AVAILABLE:
                embedding_obj = DeepFace.represent(
                    img_path=image,
                    model_name=self.model_name,
                    detector_backend=self.detector_backend,
                    enforce_detection=False
                )
                embedding = embedding_obj[0]['embedding']
            else:
                # Fallback: HOG-like embedding from face crop
                embedding = self._compute_hog_embedding(face_crop)

            # Encode crop for storage
            _, buf = cv2.imencode('.jpg', face_crop)
            import base64
            crop_b64 = base64.b64encode(buf).decode('utf-8')

            return {
                "success": True,
                "embedding": embedding,
                "face_crop": crop_b64,
                "bbox": bbox
            }
        except Exception as e:
            logger.error(f"Embedding extraction error: {e}")
            return {"success": False, "error": str(e)}

    def _compute_hog_embedding(self, face_img: np.ndarray) -> List[float]:
        """Fallback: simple HOG-based feature vector"""
        resized = cv2.resize(face_img, (64, 64))
        gray = cv2.cvtColor(resized, cv2.COLOR_BGR2GRAY)
        hog = cv2.HOGDescriptor((64, 64), (16, 16), (8, 8), (8, 8), 9)
        features = hog.compute(gray)
        norm = np.linalg.norm(features)
        if norm > 0:
            features = features / norm
        return features.flatten().tolist()

    def _cosine_similarity(self, a: List[float], b: List[float]) -> float:
        va = np.array(a)
        vb = np.array(b)
        denom = (np.linalg.norm(va) * np.linalg.norm(vb))
        if denom == 0:
            return 0.0
        return float(np.dot(va, vb) / denom)

    def recognize_faces(self, image: np.ndarray, registered_faces: List[Dict]) -> Dict:
        """Recognize faces by matching against registered database"""
        faces = self.detect_faces_haar(image)
        if DEEPFACE_AVAILABLE and len(faces) == 0:
            faces = self.detect_faces_deepface(image)

        recognitions = []

        for face in faces:
            bbox = face['bbox']
            best_match = None
            best_score = 0.0

            if registered_faces:
                try:
                    if DEEPFACE_AVAILABLE:
                        pad = 20
                        h, w = image.shape[:2]
                        x1 = max(0, bbox['x'] - pad)
                        y1 = max(0, bbox['y'] - pad)
                        x2 = min(w, bbox['x'] + bbox['w'] + pad)
                        y2 = min(h, bbox['y'] + bbox['h'] + pad)
                        face_crop = image[y1:y2, x1:x2]

                        embedding_obj = DeepFace.represent(
                            img_path=face_crop,
                            model_name=self.model_name,
                            detector_backend=self.detector_backend,
                            enforce_detection=False
                        )
                        query_emb = embedding_obj[0]['embedding']
                    else:
                        pad = 10
                        h, w = image.shape[:2]
                        x1 = max(0, bbox['x'] - pad)
                        y1 = max(0, bbox['y'] - pad)
                        x2 = min(w, bbox['x'] + bbox['w'] + pad)
                        y2 = min(h, bbox['y'] + bbox['h'] + pad)
                        crop = image[y1:y2, x1:x2]
                        query_emb = self._compute_hog_embedding(crop)

                    for reg_face in registered_faces:
                        stored_emb = reg_face.get('embedding', [])
                        if not stored_emb:
                            continue
                        score = self._cosine_similarity(query_emb, stored_emb)

                        print(f"{reg_face['name']} -> {score}")

                        if score > best_score:
                            best_score = score
                            best_match = reg_face
                except Exception as e:
                    logger.warning(f"Recognition matching error: {e}")

            threshold_met = best_score >= self.recognition_threshold
            recognitions.append({
                "bbox": bbox,
                "confidence": face['confidence'],
                "identity": best_match['name'] if (best_match and threshold_met) else "Unknown",
                "face_id": best_match.get('id', '') if (best_match and threshold_met) else '',
                "similarity": round(best_score, 4),
                "recognized": threshold_met and best_match is not None
            })

        annotated = self._draw_recognitions(image.copy(), recognitions)

        return {
            "face_count": len(recognitions),
            "recognitions": recognitions,
            "annotated_image": annotated
        }

    def _draw_detections(self, image: np.ndarray, faces: List[Dict]) -> np.ndarray:
        """Draw bounding boxes on detected faces — emerald green theme"""
        # Emerald green: (0, 200, 83) in BGR
        for face in faces:
            bbox = face['bbox']
            x, y, w, h = bbox['x'], bbox['y'], bbox['w'], bbox['h']
            conf = face['confidence']

            # Draw box
            cv2.rectangle(image, (x, y), (x+w, y+h), (0, 200, 83), 2)

            # Corner accents
            corner_len = 15
            thickness = 3
            cv2.line(image, (x, y), (x + corner_len, y), (80, 200, 120), thickness)
            cv2.line(image, (x, y), (x, y + corner_len), (80, 200, 120), thickness)
            cv2.line(image, (x+w, y), (x+w - corner_len, y), (80, 200, 120), thickness)
            cv2.line(image, (x+w, y), (x+w, y + corner_len), (80, 200, 120), thickness)
            cv2.line(image, (x, y+h), (x + corner_len, y+h), (80, 200, 120), thickness)
            cv2.line(image, (x, y+h), (x, y+h - corner_len), (80, 200, 120), thickness)
            cv2.line(image, (x+w, y+h), (x+w - corner_len, y+h), (80, 200, 120), thickness)
            cv2.line(image, (x+w, y+h), (x+w, y+h - corner_len), (80, 200, 120), thickness)

            # Label
            label = f"Face {conf:.0%}"
            cv2.rectangle(image, (x, y - 25), (x + len(label) * 10, y), (0, 200, 83), -1)
            cv2.putText(image, label, (x + 3, y - 7),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)

        return image

    def _draw_recognitions(self, image: np.ndarray, recognitions: List[Dict]) -> np.ndarray:
        """Draw recognition results — green for known, pink for unknown"""
        for rec in recognitions:
            bbox = rec['bbox']
            x, y, w, h = bbox['x'], bbox['y'], bbox['w'], bbox['h']
            is_known = rec['recognized']

            color = (0, 200, 83) if is_known else (180, 100, 220)  # emerald or pink-purple

            cv2.rectangle(image, (x, y), (x+w, y+h), color, 2)

            name = rec['identity']
            sim = rec['similarity']
            label = f"{name} ({sim:.0%})" if is_known else "Unknown"

            label_bg_y = max(0, y - 28)
            cv2.rectangle(image, (x, label_bg_y), (x + max(len(label) * 10, 80), y), color, -1)
            cv2.putText(image, label, (x + 3, y - 8),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

        return image

    def get_status(self) -> Dict:
        return {
            "haar_cascade": self.haar_cascade is not None,
            "deepface_available": DEEPFACE_AVAILABLE,
            "model": self.model_name if DEEPFACE_AVAILABLE else "haar+hog",
            "detector": self.detector_backend
        }

    def get_model_info(self) -> Dict:
        return {
            "recognition_model": self.model_name if DEEPFACE_AVAILABLE else "HOG Features",
            "detection_method": "DeepFace + Haar Cascade" if DEEPFACE_AVAILABLE else "Haar Cascade",
            "distance_metric": self.distance_metric,
            "recognition_threshold": self.recognition_threshold
        }

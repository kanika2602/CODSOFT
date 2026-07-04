"""
Pydantic Schemas for API request/response validation
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any


class BoundingBox(BaseModel):
    x: int
    y: int
    w: int
    h: int


class FaceDetection(BaseModel):
    bbox: BoundingBox
    confidence: float
    eyes_detected: Optional[int] = 0
    method: str = "haar_cascade"


class FaceRecognition(BaseModel):
    bbox: BoundingBox
    confidence: float
    identity: str
    face_id: str
    similarity: float
    recognized: bool


class FaceRegistrationRequest(BaseModel):
    name: str
    metadata: Optional[Dict[str, Any]] = {}


class FaceRecognitionResponse(BaseModel):
    success: bool
    face_count: int
    recognitions: List[FaceRecognition]
    annotated_image: str
    processing_time_ms: float


class DatabaseStatsResponse(BaseModel):
    registered_faces: int
    engine_status: Dict[str, Any]
    model_info: Dict[str, Any]


class RegisteredFaceResponse(BaseModel):
    id: str
    name: str
    face_image: Optional[str]
    metadata: Dict[str, Any]
    created_at: str

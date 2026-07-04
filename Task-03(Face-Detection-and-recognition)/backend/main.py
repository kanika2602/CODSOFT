"""
Face Detection & Recognition API
FastAPI backend with DeepFace + OpenCV
"""

from fastapi import (
    FastAPI,
    File,
    UploadFile,
    HTTPException,
    WebSocket,
    WebSocketDisconnect,
    Form,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import cv2
import numpy as np
import base64
import json
import asyncio
from pathlib import Path
import logging
from typing import Optional, List
import time

from face_engine import FaceEngine
from database import FaceDatabase
from schemas import (
    FaceRegistrationRequest, FaceRecognitionResponse,
    DatabaseStatsResponse, RegisteredFaceResponse
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Face Detection & Recognition API",
    description="AI-powered face detection and recognition system",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engine and database
engine = FaceEngine()
db = FaceDatabase()


@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Face Recognition API Starting...")
    db.init_db()
    logger.info("✅ Database initialized")


@app.get("/")
async def root():
    return {"message": "Face Detection & Recognition API", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": engine.get_status(),
        "database_count": db.get_face_count()
    }


@app.post("/detect", response_model=dict)
async def detect_faces(file: UploadFile = File(...)):
    """Detect faces in uploaded image"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        start_time = time.time()
        result = engine.detect_faces(image)
        processing_time = (time.time() - start_time) * 1000

        # Encode annotated image
        _, buffer = cv2.imencode('.jpg', result['annotated_image'], [cv2.IMWRITE_JPEG_QUALITY, 90])
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "success": True,
            "face_count": result['face_count'],
            "faces": result['faces'],
            "annotated_image": annotated_b64,
            "processing_time_ms": round(processing_time, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/recognize", response_model=dict)
async def recognize_faces(file: UploadFile = File(...)):
    """Detect and recognize faces against database"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        registered_faces = db.get_all_faces()
        start_time = time.time()
        result = engine.recognize_faces(image, registered_faces)
        processing_time = (time.time() - start_time) * 1000

        _, buffer = cv2.imencode('.jpg', result['annotated_image'], [cv2.IMWRITE_JPEG_QUALITY, 90])
        annotated_b64 = base64.b64encode(buffer).decode('utf-8')

        return {
            "success": True,
            "face_count": result['face_count'],
            "recognitions": result['recognitions'],
            "annotated_image": annotated_b64,
            "processing_time_ms": round(processing_time, 2)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recognition error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/register")
async def register_face(
    file: UploadFile = File(...),
    name: str = Form(...),
    metadata: Optional[str] = Form(None)
):
    print("=" * 60)
    print("NAME RECEIVED:", repr(name))
    print("=" * 60)
    logger.info(f"Received name = '{name}'")
    """Register a new face in the database"""
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        embedding_result = engine.extract_embedding(image)

        if not embedding_result['success']:
            raise HTTPException(status_code=400, detail=embedding_result.get('error', 'No face detected'))

        meta = json.loads(metadata) if metadata else {}
        print("=" * 60)
        print("REGISTERING:", name)
        print("=" * 60)

        face_id = db.register_face(
            name=name,
            embedding=embedding_result['embedding'],
            face_image=embedding_result['face_crop'],
            metadata=meta
        )
        print("=" * 60)
        print("REGISTERED:", name)
        print("=" * 60)

        return {
            "success": True,
            "face_id": face_id,
            "name": name,
            "message": f"Face registered successfully for {name}"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/faces", response_model=dict)
async def list_faces():
    """List all registered faces"""
    faces = db.get_all_faces_info()
    return {
        "success": True,
        "count": len(faces),
        "faces": faces
    }


@app.delete("/faces/{face_id}", response_model=dict)
async def delete_face(face_id: str):
    """Delete a registered face"""
    success = db.delete_face(face_id)
    if not success:
        raise HTTPException(status_code=404, detail="Face not found")
    return {"success": True, "message": f"Face {face_id} deleted"}


@app.get("/stats", response_model=dict)
async def get_stats():
    """Get system statistics"""
    return {
        "registered_faces": db.get_face_count(),
        "engine_status": engine.get_status(),
        "model_info": engine.get_model_info()
    }


@app.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    """WebSocket endpoint for real-time video face detection"""
    await websocket.accept()
    logger.info("WebSocket connection established")
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("type") == "frame":
                frame_data = msg["frame"].split(",")[1] if "," in msg["frame"] else msg["frame"]
                frame_bytes = base64.b64decode(frame_data)
                nparr = np.frombuffer(frame_bytes, np.uint8)
                frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

                if frame is not None:
                    mode = msg.get("mode", "detect")
                    if mode == "recognize":
                        registered_faces = db.get_all_faces()
                        result = engine.recognize_faces(frame, registered_faces)
                    else:
                        result = engine.detect_faces(frame)

                    _, buffer = cv2.imencode('.jpg', result['annotated_image'],
                                            [cv2.IMWRITE_JPEG_QUALITY, 75])
                    processed_b64 = base64.b64encode(buffer).decode('utf-8')

                    response = {
                        "type": "result",
                        "frame": processed_b64,
                        "face_count": result['face_count'],
                        "data": result.get('faces', result.get('recognitions', []))
                    }
                    await websocket.send_text(json.dumps(response))

    except WebSocketDisconnect:
        logger.info("WebSocket disconnected")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close()


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

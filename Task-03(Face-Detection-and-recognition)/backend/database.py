"""
Face Database - SQLite-based persistent storage for face embeddings
"""

import sqlite3
import json
import uuid
import logging
from typing import List, Dict, Optional
from datetime import datetime
import os

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "faces.db")


class FaceDatabase:
    """
    SQLite database for storing face embeddings and metadata.
    Supports CRUD operations for registered faces.
    """

    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path
        logger.info(f"Database path: {self.db_path}")

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Initialize database schema"""
        with self._get_connection() as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS registered_faces (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    embedding TEXT NOT NULL,
                    face_image TEXT,
                    metadata TEXT DEFAULT '{}',
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            """)
            conn.execute("CREATE INDEX IF NOT EXISTS idx_name ON registered_faces(name)")
            conn.commit()
        logger.info("✅ Database schema initialized")

    def register_face(
        self,
        name: str,
        embedding: List[float],
        face_image: str = "",
        metadata: Dict = None
    ) -> str:
        """Register a new face, returns face_id"""
        face_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        meta = json.dumps(metadata or {})
        emb_str = json.dumps(embedding)

        with self._get_connection() as conn:
            conn.execute("""
                INSERT INTO registered_faces 
                (id, name, embedding, face_image, metadata, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (face_id, name, emb_str, face_image, meta, now, now))
            conn.commit()

        logger.info(f"Registered face: {name} ({face_id})")
        return face_id

    def get_all_faces(self) -> List[Dict]:
        """Get all faces with embeddings for recognition matching"""
        with self._get_connection() as conn:
            rows = conn.execute(
                "SELECT id, name, embedding FROM registered_faces"
            ).fetchall()

        result = []
        for row in rows:
            try:
                result.append({
                    "id": row["id"],
                    "name": row["name"],
                    "embedding": json.loads(row["embedding"])
                })
            except Exception as e:
                logger.warning(f"Failed to load embedding for {row['name']}: {e}")
        return result

    def get_all_faces_info(self) -> List[Dict]:
        """Get all faces with metadata (no raw embeddings)"""
        with self._get_connection() as conn:
            rows = conn.execute("""
                SELECT id, name, face_image, metadata, created_at
                FROM registered_faces ORDER BY created_at DESC
            """).fetchall()

        return [
            {
                "id": row["id"],
                "name": row["name"],
                "face_image": row["face_image"],
                "metadata": json.loads(row["metadata"] or "{}"),
                "created_at": row["created_at"]
            }
            for row in rows
        ]

    def get_face_by_id(self, face_id: str) -> Optional[Dict]:
        with self._get_connection() as conn:
            row = conn.execute(
                "SELECT * FROM registered_faces WHERE id = ?", (face_id,)
            ).fetchone()

        if not row:
            return None
        return {
            "id": row["id"],
            "name": row["name"],
            "embedding": json.loads(row["embedding"]),
            "face_image": row["face_image"],
            "metadata": json.loads(row["metadata"] or "{}"),
            "created_at": row["created_at"]
        }

    def delete_face(self, face_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.execute(
                "DELETE FROM registered_faces WHERE id = ?", (face_id,)
            )
            conn.commit()
        return cursor.rowcount > 0

    def get_face_count(self) -> int:
        with self._get_connection() as conn:
            row = conn.execute("SELECT COUNT(*) as cnt FROM registered_faces").fetchone()
        return row["cnt"] if row else 0

    def clear_database(self):
        with self._get_connection() as conn:
            conn.execute("DELETE FROM registered_faces")
            conn.commit()
        logger.info("Database cleared")

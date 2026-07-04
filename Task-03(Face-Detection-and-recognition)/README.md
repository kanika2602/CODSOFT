# 👁️ FaceAI — Face Detection & Recognition

An end-to-end AI application for face detection and recognition using **Haar Cascades**, **DeepFace**, and **ArcFace embeddings** — with a royal **Emerald × Pink** themed frontend.

---

## 📁 Project Structure

```
face_recognition_app/
├── backend/
│   ├── main.py           ← FastAPI app (REST + WebSocket)
│   ├── face_engine.py    ← Core AI: detection + recognition
│   ├── database.py       ← SQLite face embedding storage
│   ├── schemas.py        ← Pydantic models
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx           ← Router + layout
│   │   ├── index.js
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── ImageUploader.jsx
│   │   │   └── ResultPanel.jsx
│   │   ├── pages/
│   │   │   ├── HomePage.jsx
│   │   │   ├── DetectPage.jsx
│   │   │   ├── RecognizePage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DatabasePage.jsx
│   │   │   └── LivePage.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   └── styles/
│   │       └── globals.css
│   └── package.json
│
└── dataset_scripts/
    └── download_dataset.py   ← LFW dataset downloader
```

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- Webcam (for live detection)

---

### 1️⃣ Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the API server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: http://localhost:8000/docs

---

### 2️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm start
```

Frontend at: http://localhost:3000

---

### 3️⃣ Download Dataset (Optional)

The LFW (Labeled Faces in the Wild) dataset from Kaggle gives you 13,000+ labeled face images for testing.

**Step 1: Get Kaggle API credentials**
1. Go to https://www.kaggle.com/settings/account
2. Scroll to "API" section → Click **"Create New Token"**
3. This downloads `kaggle.json`
4. Place it at:
   - Linux/Mac: `~/.kaggle/kaggle.json`
   - Windows: `C:\Users\<user>\.kaggle\kaggle.json`

**Step 2: Install Kaggle CLI**
```bash
pip install kaggle
```

**Step 3: Download**
```bash
python dataset_scripts/download_dataset.py
```

**Step 4: Batch register faces**
```bash
# After the API is running:
python dataset_scripts/batch_register.py --limit 50
```

📦 **Direct Kaggle link:** https://www.kaggle.com/datasets/jessicali9530/lfw-dataset

---

## 🧠 AI Pipeline

```
Image Input
    │
    ▼
┌─────────────────────────────┐
│   Face Detection            │
│   1. Haar Cascade (fast)    │
│   2. DeepFace (deep learning│
│      if installed)          │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│   Feature Extraction        │
│   ArcFace 512-dim embedding │
│   (HOG fallback if no GPU)  │
└─────────────────────────────┘
    │
    ▼
┌─────────────────────────────┐
│   Cosine Similarity Search  │
│   Against SQLite database   │
│   Threshold: 0.40           │
└─────────────────────────────┘
    │
    ▼
Recognition Result + Annotated Image
```

---

## 🌐 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET`  | `/health` | Health check |
| `POST` | `/detect` | Detect faces in image |
| `POST` | `/recognize` | Recognize faces vs database |
| `POST` | `/register` | Register new face |
| `GET`  | `/faces` | List all registered faces |
| `DELETE` | `/faces/{id}` | Delete a face |
| `GET`  | `/stats` | System stats |
| `WS`   | `/ws/video` | Real-time video stream |

---

## 🎨 Theme

The UI uses a **Emerald Green × Pink** royal theme with:
- Animated background grid + floating orbs
- Glassmorphism cards with glow effects
- Framer Motion page transitions
- JetBrains Mono for technical labels
- Space Grotesk for display headings

---

## 🛠️ VS Code Setup

Install recommended extensions:
- **Python** (Microsoft)
- **Pylance**
- **ES7+ React/Redux/React-Native snippets**
- **Tailwind CSS IntelliSense** (optional)
- **Thunder Client** (API testing)

Open two terminals:
```
Terminal 1: cd backend && uvicorn main:app --reload
Terminal 2: cd frontend && npm start
```

---

## ⚡ Troubleshooting

**DeepFace takes long on first run** — It downloads model weights (~500MB) on first use. Subsequent runs are fast.

**"No face detected"** — Use a well-lit photo where the face occupies at least 30% of the image.

**CORS errors** — Ensure the backend is running on port 8000. The frontend proxies API calls automatically in development.

**WebSocket not connecting** — Check that port 8000 is open and the backend is running.

---

## 📄 License

MIT License — free to use for educational and commercial projects.

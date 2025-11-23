# FinSight RAG – Financial Document Question Answering

FinSight is a Retrieval-Augmented Generation (RAG) application that lets users upload financial PDF reports and query them using semantic search and an LLM.
It supports text and table extraction, chunking, embedding, vector search, and conversational memory.

This version includes only the Flask backend and is prepared for deployment on Hugging Face Spaces with Docker.

---

## Features

* Upload financial PDFs (one at a time)
* Extract text using `pdfplumber`, `camelot`
* Chunk and embed using `sentence-transformers`
* Store and retrieve embeddings with FAISS
* Query using semantic search (top-k)
* Generate answers through Groq LLM
* Maintains short conversation history
* API-based backend suitable for any frontend

---

## Project Structure

```
/
├── backend/
│   ├── app.py
│   ├── ingest.py
│   ├── embedder.py
│   ├── chunker.py
│   ├── groq_client.py
│   ├── vectorstore/
│   └── uploads/
├── requirements.txt
├── Dockerfile
├── app.yaml
└── README.md
```

---

## API Endpoints

### 1. Health Check

`GET /api/health`

### 2. Upload PDF

`POST /api/upload`
Multipart form data with `file`

### 3. Query Document

`POST /api/query`
JSON body: `{ "query": "your question" }`

### 4. Get Specific Chunk

`GET /api/chunk/<chunk_id>`

### 5. Reset Server State

`POST /api/reset`

---

## Environment Variables

Set on Hugging Face (recommended):

```
GROQ_API_KEY=<your_key>
```

Or create a `.env` file locally:

```
GROQ_API_KEY=your_key
```

---

## Running Locally

Create environment:

```
python3.10 -m venv venv
source venv/bin/activate  (or venv\Scripts\activate on Windows)
pip install -r requirements.txt
```

Run server:

```
python backend/app.py
```

Backend starts at:

```
http://localhost:3000
```

---

## Deployment (Hugging Face)

### app.yaml

```
runtime: docker
app_file: backend/app.py
port: 3000
```

### Add secret key

Hugging Face → Settings → Variables and Secrets:

```
GROQ_API_KEY=your_key
```

Push repo to HF Space. HF will build the Docker container and run the Flask app.


"""
Flask server for FinSight RAG application
"""
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from pathlib import Path
from ingest import DocumentIngestor
from groq_client import GroqClient
from dotenv import load_dotenv

# Load environment variables (.env)
load_dotenv()

app = Flask(__name__)
CORS(app)

# Upload settings
UPLOAD_FOLDER = Path("uploads")
UPLOAD_FOLDER.mkdir(exist_ok=True)
ALLOWED_EXTENSIONS = {"pdf"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["MAX_CONTENT_LENGTH"] = 50 * 1024 * 1024  # 50MB

# Components
ingestor = None
llm_client = GroqClient()
chat_history = []
current_filename = None


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


# ----------------------------------------------------
# HEALTH CHECK
# ----------------------------------------------------
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "groq_available": bool(os.getenv("GROQ_API_KEY"))
    })


# ----------------------------------------------------
# PDF UPLOAD ROUTE
# ----------------------------------------------------
@app.route("/api/upload", methods=["POST"])
def upload_pdf():
    global ingestor, chat_history, current_filename

    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Only PDF files are allowed"}), 400

    try:
        filename = secure_filename(file.filename)
        filepath = UPLOAD_FOLDER / filename
        file.save(filepath)

        # Initialize ingestor
        ingestor = DocumentIngestor()

        # Process PDF → extract text, chunk it, embed it, store FAISS index
        result = ingestor.ingest_pdf(str(filepath))

        chat_history = []
        current_filename = filename

        return jsonify({
            "status": "success",
            "filename": filename,
            "pages": result["total_pages"],
            "chunks": result["total_chunks"]
        })

    except Exception as e:
        print("Error in upload:", e)
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------
# QUERY PDF
# ----------------------------------------------------
@app.route("/api/query", methods=["POST"])
def query():
    global ingestor, llm_client, chat_history

    if not ingestor:
        return jsonify({"error": "No document uploaded"}), 400

    data = request.get_json()
    query_text = data.get("query", "").strip()

    if not query_text:
        return jsonify({"error": "Query cannot be empty"}), 400

    try:
        # RAG: semantic search → top_k chunks
        retrieved_chunks = ingestor.query(query_text, top_k=6)

        # LLM answer generation
        answer = llm_client.generate_answer(query_text, retrieved_chunks, chat_history)

        # Maintain conversation history
        chat_history.append({"role": "user", "content": query_text})
        chat_history.append({"role": "assistant", "content": answer})

        if len(chat_history) > 20:
            chat_history = chat_history[-20:]

        return jsonify({
            "answer": answer,
            "chunks": retrieved_chunks
        })

    except Exception as e:
        print("Query error:", e)
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------
# GET SPECIFIC CHUNK
# ----------------------------------------------------
@app.route("/api/chunk/<int:chunk_id>", methods=["GET"])
def get_chunk(chunk_id):
    global ingestor

    if not ingestor:
        return jsonify({"error": "No document uploaded"}), 400

    try:
        chunk = ingestor.get_chunk(chunk_id)

        if not chunk:
            return jsonify({"error": "Chunk not found"}), 404

        return jsonify(chunk)

    except Exception as e:
        print("Chunk error:", e)
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------
# RESET EVERYTHING
# ----------------------------------------------------
@app.route("/api/reset", methods=["POST"])
def reset():
    global ingestor, chat_history, current_filename

    try:
        if ingestor:
            ingestor.reset()

        ingestor = None
        chat_history = []
        current_filename = None

        for file in UPLOAD_FOLDER.glob("*.pdf"):
            file.unlink()

        return jsonify({"status": "success"})

    except Exception as e:
        print("Reset error:", e)
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------
# SERVE FRONTEND BUILD (IMPORTANT FOR HF DEPLOYMENT)
# ----------------------------------------------------
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    static_dir = Path(__file__).parent / "static"

    file_path = static_dir / path
    if file_path.is_file():
        return send_from_directory(static_dir, path)

    return send_from_directory(static_dir, "index.html")


# ----------------------------------------------------
# START SERVER
# ----------------------------------------------------
if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)

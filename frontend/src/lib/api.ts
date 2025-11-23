import { apiRequest } from "./queryClient";

export const API_BASE = "http://localhost:3000/api";  // Flask backend

export interface UploadResponse {
  status: string;
  filename: string;
  pages: number;
  chunks: number;
}

export interface QueryResponse {
  answer: string;
  chunks: Array<{
    chunk_id: number;
    page: number;
    text: string;
    score: number;
  }>;
}

export interface ChunkResponse {
  chunk_id: number;
  page: number;
  text: string;
}

export interface HealthResponse {
  status: string;
  groq_available: boolean;
}

export async function uploadPDF(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Failed to upload PDF";
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function queryDocument(query: string): Promise<QueryResponse> {
  const response = await fetch(`${API_BASE}/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return response.json();
}

export async function getChunk(chunkId: number): Promise<ChunkResponse> {
  const response = await fetch(`${API_BASE}/chunk/${chunkId}`);

  if (!response.ok) {
    let message = "Failed to fetch chunk";
    try {
      const error = await response.json();
      message = error.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function resetApplication(): Promise<void> {
  await fetch(`${API_BASE}/reset`, { method: "POST" });
}

export async function checkHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE}/health`);
  if (!response.ok) {
    throw new Error("Failed to check health");
  }
  return response.json();
}

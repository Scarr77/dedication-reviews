"use client";

import { useState } from "react";

async function compressToMp3(file) {
  const { default: lamejs } = await import("lamejs");

  const arrayBuffer = await file.arrayBuffer();

  // Decode at native sample rate
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  await audioCtx.close();

  // Resample to mono 16kHz via OfflineAudioContext
  const targetRate = 16000;
  const numFrames = Math.ceil(audioBuffer.duration * targetRate);
  const offlineCtx = new OfflineAudioContext(1, numFrames, targetRate);
  const source = offlineCtx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.start(0);
  const rendered = await offlineCtx.startRendering();

  // Convert float32 PCM → int16
  const float32 = rendered.getChannelData(0);
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 32768 : s * 32767;
  }

  // Encode to MP3 at 64 kbps mono
  const encoder = new lamejs.Mp3Encoder(1, targetRate, 64);
  const chunks = [];
  const blockSize = 1152;

  for (let i = 0; i < int16.length; i += blockSize) {
    const chunk = int16.subarray(i, i + blockSize);
    const encoded = encoder.encodeBuffer(chunk);
    if (encoded.length > 0) chunks.push(new Uint8Array(encoded));
  }
  const flushed = encoder.flush();
  if (flushed.length > 0) chunks.push(new Uint8Array(flushed));

  return new Blob(chunks, { type: "audio/mpeg" });
}

export default function Home() {
  const [file, setFile] = useState(null);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReview("");
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("Drop a track first");
      return;
    }

    setLoading(true);
    setError("");
    setReview("");

    try {
      setStatus("Compressing audio...");
      const compressed = await compressToMp3(file);

      setStatus("The A&R is listening...");
      const formData = new FormData();
      formData.append("audio", compressed, "audio.mp3");

      const response = await fetch("/api/review", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setReview(data.review);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setStatus("");
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 text-white p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Dedication Reviews
          </h1>
          <p className="text-zinc-400 text-lg">
            AI A&R panel for independent artists
          </p>
        </header>

        <section className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8 mb-8">
          <label className="block mb-4">
            <span className="text-zinc-300 mb-2 block font-medium">
              Upload your track
            </span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-3 file:px-6 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
            />
          </label>

          {file && (
            <p className="text-sm text-zinc-400 mb-4">
              Selected: <span className="text-white">{file.name}</span>
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !file}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-zinc-700 disabled:to-zinc-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-xl transition-all"
          >
            {loading ? status : "Get Review"}
          </button>

          {error && (
            <p className="mt-4 text-red-400 text-sm">{error}</p>
          )}
        </section>

        {review && (
          <section className="bg-zinc-800/50 border border-zinc-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold mb-4 text-purple-400">
              The Panel says...
            </h2>
            <div className="text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {review}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

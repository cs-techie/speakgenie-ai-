'use client';

import React, { useEffect, useRef, useState } from 'react';

// ---------- Icons ----------
const MicIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg"
       width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round"
       className={className}>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg"
       width="24" height="24" viewBox="0 0 24 24"
       fill="none" stroke="currentColor" strokeWidth="2"
       strokeLinecap="round" strokeLinejoin="round"
       className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// ---------- Main ----------
export default function Home() {
  const [scenario, setScenario] = useState('');
  const [typed, setTyped] = useState('');
  const [status, setStatus] = useState('idle');
  const [messages, setMessages] = useState([]);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const audioRef = useRef(null);
  const streamRef = useRef(null);
  const messagesEndRef = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = 1.12;
  }, []);

  useEffect(() => {
    return () => {
      try { if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') mediaRecorderRef.current.stop(); } catch {}
      if (streamRef.current) stopStream();
    };
  }, []);

  function pushMsg(role, text) {
    setMessages((m) => [...m, { role, text }]);
  }

  function stopStream() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  async function startRec() {
    if (status !== 'idle') return;
    try {
      setStatus('recording');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mr = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      chunksRef.current = [];
      mr.ondataavailable = (e) => e.data && e.data.size > 0 && chunksRef.current.push(e.data);

      mr.onstop = async () => {
        try {
          setStatus('transcribing');
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          const fd = new FormData();
          fd.append('audio', blob, 'clip.webm');

          const r = await fetch(`${API_BASE}/stt`, { method: 'POST', body: fd });
          if (!r.ok) throw new Error(await r.text());
          const { text } = await r.json();
          if (!text || !text.trim()) {
            pushMsg('tutor', 'I didn’t catch that. Try again with a short clip (≤ 15s).');
            setStatus('idle');
            return;
          }
          pushMsg('user', text);
          await chatAndSpeak(text);
        } catch (err) {
          console.error(err);
          pushMsg('tutor', 'Transcription failed. Try a 4–8s clip near the mic.');
        } finally {
          stopStream();
          setStatus('idle');
        }
      };

      mediaRecorderRef.current = mr;
      mr.start();
    } catch (err) {
      console.error(err);
      pushMsg('tutor', "I can’t access your mic. Allow permissions and try again.");
      setStatus('idle');
    }
  }

  function stopRec() {
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      stopStream();
    } catch (e) { console.error(e); }
  }

  async function handleSend() {
    if (status !== 'idle') return;
    const text = typed.trim();
    if (!text) return;
    setTyped('');
    pushMsg('user', text);
    await chatAndSpeak(text);
  }

  async function chatAndSpeak(userText) {
    try {
      setStatus('thinking');
      const r1 = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_text: userText, scenario }),
      });
      if (!r1.ok) throw new Error(await r1.text());
      const j1 = await r1.json();
      const reply = j1.reply?.trim() || 'Let’s keep practicing!';
      pushMsg('tutor', reply);

      setStatus('speaking');
      const fd = new FormData();
      fd.append('text', reply);
      const r2 = await fetch(`${API_BASE}/tts`, { method: 'POST', body: fd });
      if (!r2.ok) throw new Error(await r2.text());
      const buf = await r2.arrayBuffer();
      const url = URL.createObjectURL(new Blob([buf], { type: 'audio/mpeg' }));
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.playbackRate = 1.12;
        await audioRef.current.play().catch(() => {});
        audioRef.current.onended = () => URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error(err);
      pushMsg('tutor', 'Something went wrong. Please try again.');
    } finally { setStatus('idle'); }
  }

  return (
    <>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <style>{`
        body { font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, sans-serif; }
        .pulse { animation: pulse 1.6s infinite; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.55); }
          50% { transform: scale(1.06); box-shadow: 0 0 0 12px rgba(234, 179, 8, 0); }
        }
      `}</style>

      <main className="bg-gray-100 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg flex flex-col h-[92vh]">
          {/* Header */}
          <div className="p-4 border-b border-gray-300 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-yellow-600">SpeakGenie AI Tutor</h1>
              <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-300">
                Roleplay & Voice
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="bg-white border border-yellow-500 text-yellow-700 text-sm rounded-lg focus:ring-yellow-500 focus:border-yellow-500 p-2"
                aria-label="Scenario"
              >
                <option value="">Tutor Mode</option>
                <option value="School">School (Teacher)</option>
                <option value="Store">Store (Shopkeeper)</option>
                <option value="Home">Home (Parent)</option>
              </select>
              <span className="text-sm font-medium text-yellow-600 capitalize" title="Status">
                {status}
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto bg-gray-50">
            {messages.length === 0 && (
              <div className="text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                Tip: Press and hold the mic to speak (≤ 15s), or type and press Send. Switch a scenario to roleplay!
              </div>
            )}
            <div className="space-y-5 mt-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex items-end gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'tutor' && (
                    <div className="w-9 h-9 rounded-full bg-yellow-600 text-white grid place-items-center text-base">🤖</div>
                  )}
                  <div
                    className={`max-w-md p-3 rounded-2xl text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-yellow-200 text-yellow-900 rounded-br-none'
                        : 'bg-yellow-50 text-yellow-700 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-9 h-9 rounded-full bg-yellow-100 text-yellow-700 grid place-items-center text-base">👧</div>
                  )}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Audio */}
          <div className="px-4 pt-3 border-t border-gray-300">
            <audio ref={audioRef} controls className="w-full h-10" />
            <div className="text-[11px] text-yellow-700 mt-1">Set playback to ~1.5× for clarity</div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-300 bg-gray-50 rounded-b-2xl">
            <div className="flex items-center gap-3">
              <button
                onMouseDown={startRec}
                onMouseUp={stopRec}
                onTouchStart={startRec}
                onTouchEnd={stopRec}
                disabled={status !== 'idle'}
                className={`flex-shrink-0 w-14 h-14 grid place-items-center rounded-full text-white transition-colors
                  ${status === 'recording' ? 'bg-yellow-600 pulse' : 'bg-yellow-500 hover:bg-yellow-600'}
                  ${status !== 'idle' ? 'opacity-70 cursor-not-allowed' : ''}`}
                aria-label="Hold to Speak"
                title="Hold to Speak"
              >
                <MicIcon className="w-6 h-6" />
              </button>

              <input
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Or type your message…"
                className="flex-1 px-4 py-3 text-sm text-yellow-700 bg-white border border-yellow-500 rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-400"
                disabled={status !== 'idle'}
                aria-label="Type message"
              />

              <button
                onClick={handleSend}
                disabled={!typed.trim() || status !== 'idle'}
                className="flex-shrink-0 w-14 h-14 grid place-items-center rounded-full bg-yellow-500 text-white transition-colors hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                aria-label="Send Message"
                title="Send"
              >
                <SendIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="flex items-center justify-between mt-2 text-xs text-yellow-700">
              <div>Keep clips short (≤ 15s) • Be near your mic</div>
              <button
                className="text-yellow-700 hover:text-yellow-800 underline underline-offset-2"
                onClick={() => setMessages([])}
                title="Clear chat"
              >
                Clear chat
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

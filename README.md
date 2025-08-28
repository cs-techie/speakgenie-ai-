<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
SpeakGenie — Real‑Time AI Voice Tutor

A minimal, production‑style prototype of a kid‑friendly voice AI tutor (ages 6–16).

It supports voice chat, roleplay scenarios, and a clean Next.js UI with gentle, age‑appropriate refusals for unsafe requests.



Stack



Frontend: Next.js (App Router) + Tailwind (CDN) + React hooks

Backend: FastAPI (Python), Uvicorn (dev server)

STT: Groq Whisper Large v3 Turbo (whisper-large-v3-turbo)

LLM: Groq Llama‑3.1‑8B Instant (llama-3.1-8b-instant)

TTS: gTTS (MP3 only; simple \& free)

Designed for Windows laptop: 8 GB RAM, no GPU, ~12 GB free storage.



✨ Features

🎙️ Voice → Text: Microphone capture → STT via Groq Whisper v3 Turbo

🤖 Tutor brain: Short, friendly, kid‑safe replies; built‑in roleplay modes (Tutor / School / Store / Home)

🔈 Text → Speech: gTTS MP3 playback (browser at ~1.12× for clarity)

🛡️ Safety: Gentle refusals + redirect to learning activities when a request is unsafe

🧩 Clean contracts: Simple API surface; environment‑based configuration

🧭 Office‑style structure: Clear folders, .env, CORS, and reproducible setup

Screenshots

Normal interaction

Normal interaction



Gentle refusal

Gentle refusal



⚙️ Requirements

OS: Windows 10/11

Python: 3.10+ (works on 3.13; MP3‑only TTS avoids audioop issues)

Node.js: LTS (≥ 18 recommended)

FFmpeg: Installed (winget install ffmpeg)

Groq: Account + API key (free tier OK)

🚀 Quickstart (Windows)

1\) Clone \& configure

git clone <YOUR\_REPO\_URL> speakgenie-voice-tutor

cd speakgenie-voice-tutor

Create .env in the project root:



GROQ\_API\_KEY=gsk\_\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*\*



\# Groq models

STT\_MODEL=whisper-large-v3-turbo

CHAT\_MODEL=llama-3.1-8b-instant

CHAT\_TEMPERATURE=0.7

CHAT\_MAX\_TOKENS=200



\# TTS output format (MP3 only in this build)

TTS\_RESPONSE\_FORMAT=mp3

Create web/.env.local:



NEXT\_PUBLIC\_API\_BASE=http://localhost:8000

2\) Backend (FastAPI)

py -m venv .venv

.\\.venv\\Scripts\\activate

pip install -r requirements.txt

uvicorn server.main:app --reload --port 8000

Health: http://localhost:8000/health



3\) Frontend (Next.js)

cd web

npm install

npm run dev

Open: http://localhost:3000



🔌 API Reference

GET /health

200 →



{ "status":"ok", "env\_loaded": true, "models": { "stt":"...", "chat":"...", "tts\_format\_default":"mp3" } }

POST /stt

Body: multipart/form-data → audio file (webm/mp3/m4a/wav), ≤ 15s

200 → { "text": "..." }

422 → { "detail": "Empty transcription" }

POST /chat

Body: application/json

{ "user\_text": "Hello! Help me practice.", "scenario": "School" }

200 → { "reply": "..." } (short, kid‑friendly)

POST /tts

Body: multipart/form-data → text (≤ 300 chars recommended)

200 → audio bytes (audio/mpeg)

🖥️ UI Usage

Mic Flow — Hold the mic 4–8s, speak clearly → transcript → tutor reply → audio plays.

Typed Flow — Type a sentence and Send.

Roleplay — Choose School / Store / Home for in‑character responses.

Playback — Audio plays at ~1.12× (tweak in web/src/app/page.js).

🧱 Project Structure

speakgenie-voice-tutor/

├─ .env

├─ requirements.txt

├─ README.md

├─ server/

│  ├─ main.py

│  └─ prompts/

│     └─ tutor\_system.txt

├─ web/

│  ├─ package.json

│  └─ src/app/

│     ├─ layout.js

│     └─ page.js

├─ media/

│  ├─ stt/

│  └─ tts/

└─ docs/

&nbsp;  └─ screenshots/

&nbsp;     ├─ 1\_normal.png

&nbsp;     └─ 2\_refusal.png

🧒 Safety \& Gentle Refusals

The tutor is optimized for ages 6–16:



Keeps replies short and positive

Gently refuses unsafe topics (e.g., violence, weapons, explicit content)

Redirects to a learning activity (e.g., vocabulary, simple speaking tips)

Tip: You can edit the safety rules in

server/prompts/tutor\_system.txt



🧪 Troubleshooting

Mic permission error



Allow mic access in the browser.

Keep clips short (≤ 15s).

/stt empty or 422



Speak closer to the mic; reduce noise.

Test upload with one‑line PowerShell curl.exe:

curl.exe -X POST "http://127.0.0.1:8000/stt" -H "Expect:" -F "audio=@D:\\path\\to\\file.mp3;type=audio/mpeg"

Chat 401/403/500



Check .env → valid GROQ\_API\_KEY; restart server.

TTS sounds slow



Playback speed is set in web/src/app/page.js:

audioRef.current.playbackRate = 1.12  // try 1.08–1.18

Python 3.13 audioop



This build uses MP3‑only TTS to avoid audioop dependencies.

Next.js install hiccups



Update npm: npm i -g npm@latest

Cache clean: npm cache clean --force

Increase timeouts:

npm config set fetch-retry-maxtimeout 120000

npm config set fetch-timeout 120000

📄 License

MIT — free to use and adapt for educational demos.



🙌 Acknowledgments

Groq for hosted STT \& LLM (OpenAI‑compatible APIs)

gTTS for simple, free MP3 TTS

FastAPI + Next.js for rapid prototyping

>>>>>>> 7b77a74 (Save changes before rebase)

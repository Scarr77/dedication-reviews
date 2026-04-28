# Dedication Reviews

AI-powered A&R panel for independent artists. Upload a track and get feedback from an 8-persona panel debate — The A&R, Mix Engineer, Streetwise OG, TikTok Strategist, Lyricist, Vocal Coach, Beat Architect, and The Fan — all powered by Google Gemini.

## Stack

- **Next.js 16** (App Router)
- **Tailwind CSS v4**
- **Google Gemini 2.5 Flash** via `@google/generative-ai`

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_key_here
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000), upload an audio file, and get your panel review.

## Deploying to Vercel

1. Push to GitHub
2. Import the repo on [vercel.com](https://vercel.com)
3. Add `GEMINI_API_KEY` as an environment variable in the Vercel project settings
4. Deploy

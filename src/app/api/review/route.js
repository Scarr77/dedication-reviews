import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const PERSONA_PROMPT = `You are a panel of 8 music industry experts reviewing an uploaded track together. Write a back-and-forth panel debate between these personas — they should agree, disagree, interrupt, and build on each other like a real conversation. Each speaker must sound distinct. Format each line as "**[Name]:** [what they say]" on its own paragraph.

The 8 personas:

**The A&R** — seasoned major-label executive, 15+ years signing hip-hop and trap artists. Cares about hits, audience fit, and the artist's story arc. Plays referee when the panel gets heated. Closes the debate with a consensus summary and exactly 3 specific Logic Pro action items the artist can implement today.

**The Mix Engineer** — Grammy-nominated, ears like a hawk. Zeroes in on muddy low-end, harsh highs, vocal placement, and balance issues. Gets annoyed when amateurs ignore headroom.

**The Streetwise OG** — old-head producer from the 90s/2000s era, worked with legends, still relevant. Calls out when music lacks soul or feels manufactured. Keeps it brutally real, uses era-appropriate references.

**The TikTok Strategist** — knows what hooks blow up in 15 seconds, obsessed with the meme moment, "it" lyrics, and sonic branding. Thinks about the audio-on / audio-off split and what makes someone stop scrolling.

**The Lyricist** — bar-for-bar critic. Breaks down wordplay, rhyme schemes, internal rhymes, storytelling structure, double entendres, and weak lines. Quotes the track directly when praising or criticizing.

**The Vocal Coach** — trained in performance and technique. Critiques delivery, breath control, pocket, pitch, ad-libs, and emotional commitment. Notes where the artist is holding back.

**The Beat Architect** — producer's producer. Obsessed with sound selection, drum programming, sample chops, arrangement, transitions, and whether the beat serves the song or fights it.

**The Fan** — just a regular listener who loves music. No industry jargon. Focuses on how the song makes them feel, whether they'd replay it, share it, or add it to a playlist.

Let the debate breathe — at least 2 exchanges per persona. The A&R should jump in to moderate tension and steer toward actionable insight. End with The A&R's closing summary and the 3 Logic Pro action items.`;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio");

    if (!audioFile) {
      return Response.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const result = await model.generateContent([
      PERSONA_PROMPT,
      {
        inlineData: {
          mimeType: audioFile.type || "audio/mpeg",
          data: audioBase64,
        },
      },
      "Listen to this track carefully, then write the full panel debate as described. Make it feel like a real room — raw, specific, and honest.",
    ]);

    const review = result.response.text();

    return Response.json({ review });
  } catch (error) {
    console.error("Gemini API error:", error);
    return Response.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

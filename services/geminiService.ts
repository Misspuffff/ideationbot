import { GoogleGenAI } from "@google/genai";
import { FlowBoardResponse } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `
You are FlowBoard, the user's creative buddy. Your entire purpose is to be an enthusiastic, inspiring, and playful partner, helping them explore ideas on a digital canvas. You live inside their board, and everything they pin is your shared source of inspiration.

**Your Core Mission: Be a Creative Sidekick**
1.  **See the Vibe, Join the Flow:** The board is our shared world. Every idea and suggestion you offer must spring directly from the content the user has pinned. Always reference pinned images by their filename to keep things clear and grounded.
2.  **Spark New Ideas:** Don't just analyze; create! Your magic is in remixing existing ideas, suggesting exciting new visual directions, and generating image prompts that feel like a natural extension of the board's aesthetic. You're here to open doors to new possibilities.
3.  **Match Their Energy:** Read the room. If the user pins rough sketches, they're probably just getting started. Offer friendly guidance and explain your creative thinking. If they pin polished designs, they're likely a pro. Match their pace with high-signal, direct insights.

**Your Communication Style (The Output)**
You'll communicate in two ways at once: structured JSON for the app to build with, and a conversational Markdown summary for the user to read.

**Part 1: The Structured JSON Data**
First, always provide a valid JSON object. This is for the app to understand and must strictly follow this structure:
\`\`\`json
{
  "skill_inference": "novice|intermediate|expert",
  "board_dna": {
    "palette": ["#...", "#...", "#..."],
    "forms": ["soft-rect", "fillet-12", "spiral sweep"],
    "textures_materials": ["brushed metal", "smoked acrylic"],
    "composition": ["asymmetric, heavy-bottom", "rule-of-thirds focal"],
    "type_ui_tokens": ["rounded sans", "8pt grid, 1.25x scale"],
    "interaction_vibe": ["calm micro-motion, 200–300ms ease-in-out"],
    "evidence": [{"pin_id": "abstract-gradient.png", "cue": "color ramp"}, {"pin_id": "device-mockup.jpg", "cue": "edge radius"}]
  },
  "style_guide": {
    "colors": {
      "primary": "#3A5A40",
      "secondary": "#588157",
      "accent": "#A3B18A",
      "neutral": "#DAD7CD"
    },
    "typography": {
      "font_family": "Inter, sans-serif",
      "examples": [
        {"role": "Heading 1", "details": "Bold, 32px"},
        {"role": "Subheading", "details": "Medium, 20px"},
        {"role": "Body", "details": "Regular, 16px"}
      ]
    },
    "layout": {
      "pattern": "8pt Grid System",
      "description": "Uses a consistent 8-point grid for spacing and alignment, ensuring visual harmony and scalability."
    }
  },
  "remixes": [
    {
      "name": "Variant A — Soft-Rect Loop",
      "lever": "form silhouette",
      "source_pins": ["moodboard-1.png", "sketch-2.jpg"],
      "instructions": ["Increase corner radius to 12–16", "Apply #3 accent as 10% stripe"],
      "expected_effect": "keeps calm massing, adds directional energy"
    }
  ],
  "style_fit": [
    {
      "artifact_id": "wireframe_01.png",
      "token_map": {
        "primary": "#3C3C3C",
        "accent": "#FF6A2A",
        "radius": 12,
        "grid_base": 8
      },
      "apply_steps": [
        "Swap body text to rounded sans, 16/24",
        "Elevate CTAs with 2dp shadow, 200ms y-translate on press"
      ]
    }
  ],
  "image_suggestions": [
    {
      "card_id": "img_prompt_01",
      "prompt": "looping frame in smoked acrylic, brushed metal insert, soft backlight, asymmetric bottom weight, top-down 3/4",
      "derived_from": ["ocean-photo.jpg", "phone-ui.png"],
      "use_cases": ["hero mood pin", "material study"]
    }
  ],
  "tensions": [
    {
      "name": "Legibility vs. Drama",
      "evidence_pin": "dark-mode-app.png",
      "nudge": "Raise contrast to WCAG AA using #FF6A2A on #1A1A1A; keep glow as 4% only."
    }
  ],
  "do_next": [
    "Reskin wireframe_01.png with token_map v1; export 3 crops.",
    "Generate img_prompt_01 and pin if approved."
  ]
}
\`\`\`
**Part 2: The Conversational Chat**
After the JSON, it's time to chat! This is where your personality shines.
- **Your Voice:** You're a creative partner: upbeat, curious, and excited to collaborate. Think of yourself as an enthusiastic teammate in a design studio.
- **Keep it Breezy:** Use short, energetic phrases. Think bullet points, quick hits, and playful language.
    - Instead of "Analysis complete," try *“Alright, I'm getting the vibe! Here’s what the board is telling me.”*
    - Instead of “Generated variants,” say *“Spun up a couple of fun remixes. What do you think?”*
- **Stay Connected:** Always tie your summary back to what's on the board. Let the user know you're seeing what they're seeing.
- **Spark Action:** End with 1-3 clear, exciting next steps. Use punchy, inviting phrases like: *“Ready to generate that hero image?”* or *“Let’s try reskinning that wireframe!”*

**Interaction Flow**
- **Empty Board?** If the board is empty, just ask them to pin an image or two to get the ball rolling. Keep it simple and encouraging.
- **Vague Request?** If they ask for something that doesn't connect to the board's content, gently nudge them to pin something that introduces that new vibe. We need inspiration to work with!
- **Keep the Rhythm:** Our goal is a fast, fun, creative loop: they pin, we brainstorm and suggest, they create. Let's keep the energy high!
`;

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // remove "data:mime/type;base64," prefix
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

const parseFlowBoardResponse = (responseText: string): { json: FlowBoardResponse; markdown: string } => {
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
  if (!jsonMatch || !jsonMatch[1]) {
    // Fallback if the code block isn't found
    const jsonEndIndex = responseText.lastIndexOf('}');
    if (jsonEndIndex === -1) {
      throw new Error("Could not find valid JSON in the model's response.");
    }
    const jsonString = responseText.substring(0, jsonEndIndex + 1);
    const markdownString = responseText.substring(jsonEndIndex + 1).trim();
    return { json: JSON.parse(jsonString), markdown: markdownString };
  }

  const jsonString = jsonMatch[1];
  const markdownString = responseText.substring(jsonMatch[0].length).trim();
  return { json: JSON.parse(jsonString), markdown: markdownString };
};


export const analyzeBoard = async (images: File[]): Promise<{ json: FlowBoardResponse; markdown: string }> => {
  const imageParts = await Promise.all(
    images.map(async (file) => {
      const base64Data = await fileToBase64(file);
      return {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      };
    })
  );

  const filenames = images.map(file => file.name).join(', ');
  const userPrompt = `Okay, buddy! I'm checking out these images: [${filenames}]. Let's see what vibe they're putting down. I'll share the structured data for the app first, then we can chat about what I see.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: userPrompt }, ...imageParts] },
    config: {
      systemInstruction: SYSTEM_PROMPT
    }
  });

  const responseText = response.text;
  return parseFlowBoardResponse(responseText);
};

export const generateImage = async (prompt: string): Promise<string> => {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
        const base64ImageBytes = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } else {
        throw new Error("Image generation failed to return an image.");
    }
};

export type SummarizablePin = 
  | { type: 'image', file: File } 
  | { type: 'text', content: string } 
  | { type: 'color', content: string } // content is hex
  | { type: 'data', content: string }; // for DNA, Remixes, etc.

export const summarizePins = async (pins: SummarizablePin[]): Promise<string> => {
  const textParts: string[] = [];
  const imageFiles: File[] = [];

  for (const pin of pins) {
    switch (pin.type) {
      case 'image':
        imageFiles.push(pin.file);
        break;
      case 'text':
        textParts.push(`A text note with content: "${pin.content}"`);
        break;
      case 'color':
        textParts.push(`A color swatch with hex code: ${pin.content}`);
        break;
      case 'data':
        textParts.push(`A data pin with content: ${pin.content}`);
        break;
    }
  }

  const imageParts = await Promise.all(
    imageFiles.map(async (file) => {
      const base64Data = await fileToBase64(file);
      return {
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      };
    })
  );

  const prompt = `Hey, it's FlowBoard! The user grabbed a bunch of pins. Here's the mix: \n- ${textParts.join('\n- ')}\n\nPlus some images. My job is to find the connection between all of these and write a new note that captures the core idea. I'll just provide the summary text, ready for them to pin.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [{ text: prompt }, ...imageParts] },
  });

  return response.text;
};
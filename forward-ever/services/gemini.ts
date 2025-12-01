/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Using gemini-3-pro-preview for complex visual reasoning and coding.
const GEMINI_MODEL = 'gemini-3-pro-preview';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are an expert Visionary Architect and Creative Developer specializing in "Evolutionary Visualization".
Your goal is to transform user inputs (images/sketches/text) into interactive HTML/CSS/JS artifacts that visualize the potential of a space.

YOU HAVE TWO MODES:

MODE A: GENERAL VISUALIZATION (Default)
- Visualize whatever the user asks for (e.g., "Modern apartment", "Rustic cabin", "Futuristic office").
- Create a high-quality, interactive presentation.
- Use phases to show "Before" vs "After" or different design options.

MODE B: YUKAYEKE HERITAGE (Triggered by keywords: "Yukayeke", "Mum and Dad", "Legacy", "Forward Ever")
- **Context**: The house at the corner of First Avenue and Sunshine Lane (Grenada).
- **Philosophy**: "Forward Ever, Backward Never".
- **Phases**:
   1. **Legacy**: A weathered but dignified single-storey Caribbean house in lush farmland. Reclaimed stone walls, faded green shutters, wraparound verandah with arches, and a colonnaded terrace above forming a sun-drenched roof garden. Mature mango/breadfruit trees, overgrown herb garden (wild thyme, shadow benny), galvanize roof, and flowering bougainvillea. Nostalgic mood.
   2. **Awakening**: Restoration of the main house. **Interior**: Refurbished with cool tiled floors throughout. Layout features a double bedroom, a twin bedroom (plus sofabed) with en-suite, an open-plan kitchen diner to the back of the house, and a formal reception room overlooking the verandah and front aspect. **Exterior**: Modern solar panels added to the roof. Green hedges incorporated as privacy screens. A striking parametric wooden wall sculpture adorns the side of the house (without the verandah), flowing organically towards the rear deck, enhancing the contemporary sustainable feel.
   3. **Glamping**: Safari tents, wooden walkways, plunge pools.
   4. **The Gathering Pavilion**: A shift to embracing outdoor living with parametric furniture as a recurring motif. A large deck extends from the back of the existing house, doubling the footprint of the property. A modern canvas stretches over half of the area directly outside the back door, held aloft by heavy wooden posts. Underneath sits a long table set for 12 with banana leaf placemats, overhead fans, and warm Edison bulb lighting. Features an outdoor kitchen with a professional grill on one side, while the other is given over to play, culminating in an overground pool overlooking the kitchen garden. Mood: Community feeling.
- **Aesthetics**: Eco-Luxury Heritage (Emerald Green, Warm Teak, Slate, Organic Curves).

CORE DIRECTIVES (ALL MODES):
1. **Visual Excellence**:
    - Use CSS/SVG to render realistic textures (wood grain, shimmering water, fabric, parametric curves).
    - Use gradients and shadows effectively.
2. **Interactive UI**:
    - Use a **Slider** or **Tabs** to toggle between design phases/options.
    - Allow users to "Toggle" specific features (e.g., "Add Pool", "Lights On").
3. **NO EXTERNAL IMAGES**:
    - Use **CSS shapes**, **inline SVGs**, **Emojis**, or **CSS gradients**.
    - Do NOT try to load images from URLs unless they are the user's uploaded images (passed back as base64 if needed, but usually better to recreate the vibe with CSS).
4. **Self-Contained**: The output must be a single HTML file with embedded CSS (<style>) and JavaScript (<script>).

RESPONSE FORMAT:
Return ONLY the raw HTML code. Do not wrap it in markdown code blocks (\`\`\`html ... \`\`\`). Start immediately with <!DOCTYPE html>.`;

export interface ImageFile {
  mimeType: string;
  data: string; // base64
}

export async function bringToLife(prompt: string, images: ImageFile[] = []): Promise<string> {
  const parts: any[] = [];
  
  // 1. Add images first
  if (images.length > 0) {
    images.forEach(img => {
        parts.push({
            inlineData: {
                data: img.data,
                mimeType: img.mimeType,
            },
        });
    });
  }

  // 2. Construct the Prompt
  let finalPrompt = prompt;

  // If no prompt provided but we have images, give a generic instruction
  if (!finalPrompt && images.length > 0) {
      finalPrompt = "Analyze these images. Create an interactive visualization showing how this space could be transformed. Provide a 'Current State' vs 'Future Vision' toggle.";
  }
  
  // If user explicitly asks for the Yukayeke story (or if it matches the demo button text)
  if (finalPrompt.includes("Yukayeke") || finalPrompt.includes("Mum & Dad")) {
       finalPrompt += " \n\nIMPORTANT: Visualize the full 'Yukayeke Heritage Retreat' evolution phases (Legacy -> Awakening -> Glamping -> Gathering Pavilion). Ensure the 'FORWARD EVER BACKWARD NEVER' sign is conceptually integrated.";
  }

  parts.push({ text: finalPrompt });

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5,
      },
    });

    let text = response.text || "<!-- Failed to generate content -->";

    // Cleanup if the model still included markdown fences
    text = text.replace(/^```html\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

    return text;
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
}
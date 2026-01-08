import { Injectable } from '@nestjs/common';
import { ImageFieldInfo } from '../interfaces/image-analysis.interface';

/**
 * Service for building AI prompts
 */
@Injectable()
export class PromptBuilderService {
  /**
   * Build the image injection section for the slide generation prompt
   */
  buildImageInjectionPrompt(
    imageMap: Map<string, string>,
    imageFields: ImageFieldInfo[],
  ): string {
    if (imageMap.size === 0) {
      return '';
    }

    const imageInstructions = Array.from(imageMap.entries())
      .map(([fieldPath, url]) => {
        const field = imageFields.find((f) => f.fieldPath === fieldPath);
        return `- Set "${fieldPath}" to: "${url}" (${field?.fieldType || 'image'})`;
      })
      .join('\n');

    return `
⚠️ IMAGE INJECTION INSTRUCTIONS (CRITICAL) ⚠️

The following image URLs have been pre-fetched from Unsplash. You MUST include these exact URLs in the corresponding fields:

${imageInstructions}

HOW TO APPLY:
1. For "accent.url" - Add a top-level "accent" object to your JSON response with these properties:
   {
     "accent": {
       "url": "the-provided-url",
       "position": "right",
       "size": 40
     },
     "rows": [...]
   }
2. For "rows[X].blocks[Y].content.url" - Set the block's content url to the provided URL within the rows array
3. For avatar/profile fields - Set the avatar or profileImage field to the provided URL within the appropriate block

DO NOT change these URLs. Copy them exactly as provided above into the appropriate fields in your JSON output.
`;
  }

  /**
   * Build the layout structure prompt section
   */
  buildLayoutStructurePrompt(templateRows: any[]): string {
    return `
LAYOUT STRUCTURE TEMPLATE (YOU MUST FOLLOW THIS EXACT STRUCTURE):
${JSON.stringify({ rows: templateRows }, null, 2)}

CRITICAL INSTRUCTION:
- You MUST generate ONLY a JSON object with a "rows" array matching the template above.
- Use the SAME number of rows and blocks.
- Preserve all "id" and "type" fields exactly as they appear in the template.
- Adapt the "content" of each block using the slide outline below.
- Generating any other structure or missing blocks will break the presentation.

BLOCK CONTENT RULES:
1. "prosemirror" blocks:
   - The "content" field MUST match the structure in the template (usually a JSON object).
   - Follow the pattern: { "type": "doc", "content": [...] }.
   - Use standard node types like "heading", "paragraph", "text".
   - Do NOT use Markdown strings. Use the proper node structure.

2. "image" blocks:
   - "content" should be: { "url": "...", "alt": "...", "caption": "..." }

3. Card/List blocks (e.g., "simple-number-card", "solid-icon-box", "stacked-timeline-block"):
   - These blocks have an "items" array in their "content".
   - Each item in the "items" array usually has a "title" and "description".
   - ⚠️ IMPORTANT: In many of these blocks, "title" and "description" are NOT strings, they are ProseMirror JSON objects.
   - HOWEVER, for your response, you should provide them as simple strings or simple ProseMirror doc objects if you can.
   - BEST PRACTICE: If the template shows a complex object for "title", you should try to match that pattern or provide a high-quality string that we can convert.

URL FORMATTING RULES:
- Use this Unsplash format: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80
- Match EXACT URLs provided in the IMAGE INJECTION section if available.`;
  }

  /**
   * Build the complete slide generation prompt
   */
  buildSlidePrompt(
    slideNumber: number,
    totalSlides: number,
    title: string,
    outlineContent: string,
    layoutStructureSection: string,
    imageInjectionPrompt: string,
  ): string {
    return `You are an expert presentation designer. Generate slide ${slideNumber} of ${totalSlides} for "${title}".

OUTLINE CONTENT:
${outlineContent}

${layoutStructureSection}

${imageInjectionPrompt}

⚠️ MANDATORY OUTPUT FORMAT:
Your response must be a SINGLE JSON object. 
If an "accent" image was provided in the injection instructions, include it at the top level.

Example structure:
{
  "accent": { "url": "...", "position": "left", "size": 35 },
  "rows": [ ...identical structure to template... ]
}

⚠️⚠️⚠️ CRITICAL: NO EMPTY FIELDS OR DEMO TEXT ALLOWED ⚠️⚠️⚠️
- EVERY text field MUST contain meaningful, relevant content.
- DO NOT leave ANY "text" field as an empty string ("").
- DO NOT leave ANY "title" or "description" fields empty.
- ⛔️ NEVER OUTPUT DEMO TEXT from the template (e.g. "Presentation Title", "Supporting subtitle", "Feature Title", "Point Title").
- ⛔️ You MUST replace ALL template placeholder text with fresh content derived from the outline.
- If a field exists in the template, you MUST overwrite it with new content.
- Generate professional, contextually appropriate text for EVERY field.
- Empty fields or preserved demo text will break the presentation and are NOT acceptable.

FINAL CHECKLIST:
1. Is it valid JSON?
2. Does "rows" match the template structure exactly?
3. Are all block IDs and types preserved?
4. Is ALL placeholder/demo text replaced with meaningful content?
5. Did you verify NO text fields are empty?
6. Did you use the specific URLs provided for images?

Generate only the JSON. No prefix/suffix text.`;
  }
}

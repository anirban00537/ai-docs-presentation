import { Injectable } from '@nestjs/common';
import { ImageFieldInfo } from '../interfaces/image-analysis.interface';

/**
 * Service for building AI prompts
 */
@Injectable()
export class PromptBuilderService {
  /**
   * Build the image injection section for the card generation prompt
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
LAYOUT STRUCTURE TEMPLATE:
${JSON.stringify({ rows: templateRows }, null, 2)}

CRITICAL INSTRUCTIONS:
1. Your output MUST have the EXACT SAME structure as the template above.
2. Preserve ALL field names exactly as shown (id, type, content, items, etc.)
3. For each block:
   - Keep the "id" field (you may generate a new UUID or reuse the template's)
   - Keep the "type" field EXACTLY as shown (e.g., "prosemirror", "simple-number-card")
   - Transform the "content" field with new, relevant content
4. If an array has N items in the template, you MUST output N items. DO NOT ADD OR REMOVE ITEMS.
5. ProseMirror content fields MUST be a proper JSON object (not a string): { "type": "doc", "content": [...] }
6. DO NOT CHANGE THE LAYOUT. DO NOT ADD BLOCKS. DO NOT REMOVE BLOCKS.
7. FILL IN THE CONTENT ONLY. KEEP THE STRUCTURE IDENTICAL.

The JSON Schema enforcing your output was GENERATED DYNAMICALLY FROM THIS TEMPLATE.
Any structural deviation will cause a validation error.`;
  }

  /**
   * Build the complete card generation prompt
   */
  buildCardPrompt(
    cardNumber: number,
    totalCards: number,
    title: string,
    outlineContent: string,
    layoutStructureSection: string,
    imageInjectionPrompt: string,
  ): string {
    return `You are an expert doc designer. Generate card ${cardNumber} of ${totalCards} for "${title}".

OUTLINE CONTENT:
${outlineContent}

${layoutStructureSection}

${imageInjectionPrompt}

⚠️ KNOWLEDGE SOURCE (STRICT RULE) ⚠️
Use ONLY the provided OUTLINE CONTENT as your knowledge base. 
DO NOT make up, invent, or hallucinate any information not found in the outline. 
If you don't have enough data for a field, use ONLY what is available in the outline.


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
- ⛔️ NEVER OUTPUT DEMO TEXT from the template (e.g. "Doc Title", "Supporting subtitle", "Feature Title", "Point Title").
- ⛔️ You MUST replace ALL template placeholder text with fresh content derived from the outline.
- If a field exists in the template, you MUST overwrite it with new content.
- Generate professional, contextually appropriate text for EVERY field.
- Empty fields or preserved demo text will break the doc and are NOT acceptable.
- STRICT RULE: Check every "text" field. If it is "", you MUST populate it.
- ProseMirror text nodes: { "type": "text", "text": "MUST NOT BE EMPTY" }.
- Ensure every paragraph or heading node implies a child text node with content.
- EVERY content field for "prosemirror" blocks MUST be a valid JSON object matching the ProseMirror document structure (type: "doc", content: [...]).
- DO NOT stringify or escape the ProseMirror content; output it as a native JSON sub-object.
- For standard fields (title, description, button text): "text": "MUST NOT BE EMPTY".
- ⛔️ NEVER invent facts, names, or data not present in the outline content.
- NEVER return an empty string "" for any content field.
- NEVER return an empty paragraph without a text node.
- ALWAYS include the "type" property for every node (especially "type": "text").
- Use "strong" mark for bold text (not "bold").
- Use "bullet_list" for unordered lists (not "bulletList").
- Use "list_item" for list items (not "listItem").

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

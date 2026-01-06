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

CRITICAL INSTRUCTIONS FOR USING THE LAYOUT TEMPLATE:
- You MUST generate ONLY a JSON object with a "rows" array that follows the EXACT structure of the template rows above
- Use the SAME number of rows as the template
- Use the SAME number of blocks per row as the template  
- Match the row and block structure exactly (same arrangement, same IDs pattern)
- The content inside each block should be adapted from the outline content provided below
- DO NOT add extra rows or blocks beyond what's in the template
- DO NOT remove rows or blocks from the template structure
- Only the ProseMirror content inside each block should change based on the outline content
- Keep the same row and block organization as shown in the template
- Generate ONLY: { "rows": [...] } - nothing else, no nested "data" objects

TEXT ALIGNMENT SYNTAX (IMPORTANT):
- To align text, use <align="..."> tags wrapping the content
- Available alignments: center, right, left, justify
- Examples:
  * <align="center">## Centered Heading</align>
  * <align="center">Centered paragraph text</align>
  * <align="right">Right-aligned text</align>
  * <align="justify">Justified paragraph</align>
- DO NOT use inline styles unless absolutely necessary
- The <align> tags will be automatically converted to proper text alignment

⚠️ CRITICAL: URL FORMATTING RULES (MUST FOLLOW):
- Accent image URLs must be valid, well-formed URLs
- Use this EXACT Unsplash format: https://images.unsplash.com/photo-[ID]?auto=format&fit=crop&w=1200&q=80
- DO NOT duplicate query parameters (e.g., ?auto=format?auto=format is INVALID)
- DO NOT add multiple ? characters to URLs
- Only ONE ? is allowed per URL, followed by & for additional parameters
- Example CORRECT: "https://images.unsplash.com/photo-123?auto=format&fit=crop&w=1200&q=80"
- Example WRONG: "https://images.unsplash.com/photo-123?auto=format?fit=crop" (TWO ? marks)
- If unsure, use a simple Unsplash photo ID URL without extra parameters`;
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
    return `You are generating slide ${slideNumber} of ${totalSlides} for a presentation titled "${title}".

OUTLINE CONTENT FOR THIS SLIDE (in markdown format):
${outlineContent}
${layoutStructureSection}
${imageInjectionPrompt}

⚠️⚠️⚠️ CRITICAL: CONTENT GENERATION RULES ⚠️⚠️⚠️

FORMATTING GUIDELINES:

1. TEXT ALIGNMENT:
   - Use <align="center">, <align="right">, <align="left">, or <align="justify"> tags
   - Wrap entire content blocks that need alignment
   - Example: <align="center">## Title Text</align>
   - Example: <align="center">Paragraph content here</align>
   - DO NOT use inline styles for alignment

2. MARKDOWN BASICS:
   - Use ## for headings (level 2), ### for subheadings (level 3)
   - Use **bold** for emphasis
   - Use *italic* for subtle emphasis
   - Use - for bullet lists
   - Keep markdown clean and simple

3. CONTENT STRUCTURE:
   - Match the template's block structure exactly
   - Only change the text content, not the structure
   - Preserve row and block organization
   - Use the same block types as the template

⚠️ HTML TAG RESTRICTION (CRITICAL):
- You may ONLY use the <align> tag for text alignment
- DO NOT use any other HTML tags: NO <div>, <span>, <p>, <h1>, <center>, <b>, <i>, <strong>, <em>, etc.
- DO NOT use inline styles: NO style="..." attributes
- DO NOT use class attributes: NO class="..." 
- Use pure Markdown formatting instead (##, **, *, -, etc.)
- The ONLY exception is <align="..."></align> for text alignment
- Any other HTML will break the slide rendering

***** CRITICAL: NEVER USE DEMO/PLACEHOLDER DATA *****
- DO NOT keep any demo text, placeholder text, or example content from the template
- DO NOT leave any fields empty or with placeholder values like "Your text here", "Example content", etc.
- ALWAYS generate fresh, relevant, meaningful content based on the outline
- Replace ALL content with real, presentation-appropriate text
- Every field must contain actual content related to the presentation topic
- Empty fields or placeholder text will result in an unusable slide
***** END CRITICAL INSTRUCTION *****

CRITICAL INSTRUCTIONS:
You MUST generate ONLY a JSON object with a "rows" array that matches the layout template structure above. The structure (rows, blocks, IDs) must be identical. Only adapt the ProseMirror content inside each block's "content" field based on the outline content.

REQUIRED JSON FORMAT:
${imageInjectionPrompt ? 'If accent.url was provided above, generate: { "accent": { "url": "...", "position": "right", "size": 40 }, "rows": [...] }' : 'Generate: { "rows": [...] }'}
- The "rows" array must match the template exactly
- Preserve all row IDs, block IDs, and structure from the template
- ⚠️ IMPORTANT: Preserve the EXACT formatting from each block's "content" field in the template
- ⚠️ IMPORTANT: Only replace text content, keep all formatting (HTML tags, Markdown syntax) exactly as in template
${imageInjectionPrompt ? '- ⚠️ IMPORTANT: If accent.url was provided in the IMAGE INJECTION section above, you MUST include the accent object at the top level of your response' : ''}
- Do NOT wrap it in a "data" object
- Do NOT add any other properties

⚠️ REMINDER - FORMATTING PRESERVATION IS CRITICAL:
- Use the EXACT same formatting structure from the template
- DO NOT add any extra formatting
- Only replace text content

IMPORTANT: 
${imageInjectionPrompt ? '- If accent.url was provided, include: { "accent": { "url": "...", "position": "right", "size": 40 }, "rows": [...] }' : ''}
- Generate ONLY the raw JSON object: { "rows": [...] } ${imageInjectionPrompt ? '(plus "accent" if provided)' : ''}
- Do NOT include \`\`\`json or \`\`\` markers
- Output starts with { and ends with }
- Ensure valid JSON format
- Structure MUST exactly match the template - same rows, same blocks per row, same IDs`;
  }
}

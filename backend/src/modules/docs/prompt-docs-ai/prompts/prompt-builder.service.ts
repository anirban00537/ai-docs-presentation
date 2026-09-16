import { Injectable } from '@nestjs/common';
import { ImageFieldInfo } from '../interfaces/image-analysis.interface';

/**
 * Service for building AI prompts
 */
@Injectable()
export class PromptBuilderService {
  /**
   * Build instructions for the AI to generate image queries instead of using fixed URLs
   */
  buildImageQueryInstructions(): string {
    return `
⚠️ IMAGE FIELD INSTRUCTIONS (CRITICAL) ⚠️

For ANY field that should contain an image (accent, image block, card items, avatars, etc.), you MUST output these properties:
- "imageUrl": "" (ALWAYS output an empty string)
- "imageQuery": "a descriptive, contextual search query for Unsplash"

IMAGE QUERY GUIDELINES:
1. Make queries SPECIFIC and UNIQUE to this card's content - DO NOT reuse generic terms.
2. Use 3-5 words describing the ideal image.
3. For accent/background images: Use atmospheric or abstract terms related to the SPECIFIC topic of THIS card.
4. For person/avatar fields: Use "professional headshot portrait person".
5. Examples: "modern office teamwork collaboration", "data analytics dashboard charts", "renewable energy solar panels sunset".

🚨 CRITICAL: UNIQUE IMAGES PER CARD 🚨
- Each card MUST have DIFFERENT image queries than other cards in this presentation.
- DO NOT use generic queries like "business meeting", "technology background", "abstract gradient" repeatedly.
- Tie the image query DIRECTLY to the specific content of THIS card.
- If this card is about "marketing", use "marketing campaign creative brainstorm".
- If this card is about "data", use "data visualization analytics graph".
- If this card is about "team", use "diverse team collaboration workspace".
- VARIETY IS ESSENTIAL - each slide should have a visually distinct image.

HOW TO APPLY:
1. For "accent" - Add a top-level "accent" object to your JSON response:
   {
     "accent": {
       "imageUrl": "",
       "imageQuery": "abstract gradient technology background",
       "position": "right",
       "size": 40
     },
     "rows": [...]
   }
2. For "image" blocks - Set the block's content:
   {
     "type": "image",
     "content": {
       "imageUrl": "",
       "imageQuery": "solar panels in field during golden hour"
     }
   }
3. For "image-card-block" - Set the imageUrl and imageQuery for each item in the "items" array.
   IMPORTANT: Each item in image-card-block MUST have a UNIQUE imageQuery.
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

⚠️ CONTENT GENERATION RULES ⚠️
1. Use the OUTLINE CONTENT as your primary source.
2. If the outline is sparse or incomplete, EXPAND on the topic with relevant professional content.
3. DO NOT invent specific statistics, names, dates, or data points not in the outline.
4. You MAY generate general professional descriptions, explanations, and contextual content.
5. EVERY field MUST have meaningful content - NEVER leave anything empty.

🚨 CRITICAL: NEVER RETURN EMPTY CONTENT 🚨
- Empty paragraphs are UNACCEPTABLE and will break the presentation.
- If you're unsure what to write, generate relevant professional placeholder content.
- Generic professional content is 1000x BETTER than empty fields.

⚠️ MANDATORY OUTPUT FORMAT:
Your response must be a SINGLE JSON object. 
If an "accent" image was provided in the injection instructions, include it at the top level.

Example structure:
{
  "accent": { "imageUrl": "", "imageQuery": "...", "position": "left", "size": 35 },
  "rows": [ ...identical structure to template... ]
}

⚠️⚠️⚠️ CRITICAL CONTENT RULES ⚠️⚠️⚠️
- EVERY text field MUST contain meaningful, relevant content.
- DO NOT leave ANY "text" field as an empty string ("").
- DO NOT leave ANY "title" or "description" fields empty.
- ⛔️ NEVER OUTPUT DEMO TEXT from the template (e.g. "Doc Title", "Supporting subtitle", "Feature Title", "Point Title").
- ⛔️ You MUST replace ALL template placeholder text with fresh content.
- If a field exists, you MUST populate it with professional content.
- Empty fields will break the presentation - this is NOT acceptable.
- STRICT RULE: Check every "text" field. If it is "", you MUST populate it.
- ProseMirror text nodes: { "type": "text", "text": "MUST HAVE CONTENT" }.
- Ensure every paragraph or heading node has a child text node with actual content.
- EVERY content field for "prosemirror" blocks MUST be a valid JSON object matching the ProseMirror structure.
- DO NOT stringify or escape the ProseMirror content; output it as a native JSON sub-object.
- Use "strong" mark for bold text (not "bold").
- Use "bullet_list" for unordered lists (not "bulletList").
- Use "list_item" for list items (not "listItem").

FINAL CHECKLIST:
1. Is it valid JSON?
2. Does "rows" match the template structure exactly?
3. Are all block IDs and types preserved?
4. ⚠️ Did you verify EVERY text field has content? (NO EMPTY STRINGS)
5. Did you provide descriptive "imageQuery" strings and empty "imageUrl" strings?
6. 🖼️ Are ALL imageQuery values UNIQUE and specific to THIS card's content? (NO GENERIC DUPLICATES)

Generate only the JSON. No prefix/suffix text.`;
  }

  /**
   * Build the prompt for outline generation
  /**
   * Build the prompt for outline generation
   * CRITICAL: Forces detailed content with title + bullet points
   */
  buildOutlinePrompt(
    prompt: string,
    numberOfCards: number,
    layouts: { id: string; name: string; description: string }[] = [],
  ): string {
    // Generate the layouts section with smart categorization
    let layoutsSection = '';
    
    if (layouts.length > 0) {
      layoutsSection = `
    AVAILABLE LAYOUTS:
    ${JSON.stringify(layouts, null, 2)}
    
    🎯 SMART LAYOUT SELECTION PROCESS 🎯
    
    1. ANALYZE each card's content FIRST, then pick the layout that BEST presents that content.
    2. Match layout to content type:
       - Title/Hero layouts: ONLY for the first card (introduction) or major section dividers
       - Image layouts: For concepts that benefit from visual representation
       - List layouts: For step-by-step processes, features, or multiple points
       - Number/Stats layouts: ONLY when presenting actual statistics or metrics
       - Quote layouts: ONLY for testimonials, quotes, or powerful statements
       - Comparison layouts: For pros/cons, before/after, or comparing options
       - Timeline layouts: Only for chronological sequences or processes
       - Team/Card layouts: Only for people, products, or multiple distinct items
    
    3. VARIETY IS ESSENTIAL:
       - Use at least 4-5 DIFFERENT layout types across the presentation
       - NEVER use the same layout more than 2 times in a row
       - Alternate between content-heavy and visual layouts for rhythm
    
    4. RELEVANCE CHECK - Ask yourself:
       - Does this layout make sense for this specific content?
       - Would another layout present this information MORE effectively?
       - Is the layout TYPE appropriate (don't use a quote layout for statistics)
       `;
    } else {
      layoutsSection = `
    VALID LAYOUT IDs (Choose the best fit for each card's content):
    - "title-basic": For the main title card or section headers.
    - "two-columns": For comparing two concepts or text + small image.
    - "three-columns": For listing 3 features, steps, or items.
    - "image-left": For a large image on the left with descriptive text on the right.
    - "image-right": For a large image on the right with descriptive text on the left.
    - "big-number": For highlighting a key statistic or single number.
    - "quote": For a powerful quote or testimonial.
    - "list": For bullet points or checklists.
      `;
    }

    return `
    You are an expert presentation designer. Create a DETAILED outline for a document based on the following topic:
    "${prompt}"

    REQUIREMENTS:
    1. Create exactly ${numberOfCards} distinct cards (pages).
    2. Each card must have a specific "layoutId" chosen from the valid options provided.
    
    ${layoutsSection}

    ⚠️ LAYOUT SELECTION RULES - CRITICAL ⚠️
    
    DO NOT use layouts that don't match your content:
    ❌ Don't use a "Quote" layout if you don't have an actual quote
    ❌ Don't use a "Statistics/Number" layout if there are no numbers to show
    ❌ Don't use a "Team/People" layout if the content isn't about people
    ❌ Don't use a "Timeline" layout if there's no chronological sequence
    ❌ Don't use the same layout repeatedly - aim for VARIETY
    
    DO match layouts to content intelligently:
    ✅ Use image layouts when discussing concepts that benefit from visuals
    ✅ Use list layouts for processes, features, or multiple points
    ✅ Use comparison layouts when contrasting two things
    ✅ First card should be a title/hero layout for impact
    ✅ Last card can be a call-to-action or summary layout

    🚨🚨🚨 CRITICAL CONTENT FORMAT - READ CAREFULLY 🚨🚨🚨
    
    For EVERY card's "content" field, you MUST follow this EXACT format:
    
    LINE 1: A title starting with "# " (hash + space + title text)
    LINES 2+: AT LEAST 4-6 bullet points, each starting with "- " (dash + space)
    
    ✅ VALID EXAMPLE (FOLLOW THIS):
    "# AI in Healthcare
    - AI algorithms analyze medical images to detect diseases early
    - Machine learning models predict patient outcomes with high accuracy
    - Natural language processing helps doctors access patient records faster
    - Robotic surgery systems provide precision beyond human capability
    - Virtual health assistants offer 24/7 patient support
    - Predictive analytics help hospitals manage resources efficiently"
    
    ❌ INVALID EXAMPLE (DO NOT DO THIS):
    "# AI in Healthcare"
    
    ⚠️ TITLE-ONLY CONTENT IS COMPLETELY UNACCEPTABLE AND WILL BREAK THE SYSTEM ⚠️
    
    Every single card MUST have:
    - One title line (# Title)
    - MINIMUM 4 detailed bullet points (- Point)
    - Each bullet point should be a complete, informative sentence
    - NO empty content, NO title-only content

    OUTPUT FORMAT:
    You must output a single JSON object with the following structure:
    {
      "title": "A catchy title for the whole document",
      "outlines": [
        {
          "content": "# Card Title\\n- First detailed point about this topic\\n- Second detailed point with specific information\\n- Third detailed point explaining a key concept\\n- Fourth detailed point with additional context",
          "layoutId": "layout-id-from-list"
        },
        ...
      ]
    }
    
    🔍 FINAL CHECKLIST BEFORE OUTPUT:
    1. Does every card have at least 4 bullet points? (Title-only = FAIL)
    2. Are you using at least 4-5 DIFFERENT layout types?
    3. Is each layout APPROPRIATE for its content?
    4. Did you avoid using the same layout more than twice in a row?
    5. Does the flow make sense (title → content → conclusion)?
    `;
  }
}

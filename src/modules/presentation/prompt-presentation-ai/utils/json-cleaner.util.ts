import { Logger } from '@nestjs/common';

/**
 * Utility class for cleaning and repairing JSON content
 */
export class JsonCleanerUtil {
  private static readonly logger = new Logger(JsonCleanerUtil.name);

  /**
   * Clean markdown code block wrappers and other malformed patterns from JSON content
   */
  static cleanJsonContent(content: string): string {
    let cleaned = content?.trim() || '';

    // Remove markdown code blocks (```json ... ``` or ``` ... ```)
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }

    cleaned = cleaned.trim();

    // Remove leading dots, periods, or other garbage characters before the JSON
    // Pattern: anything before the first { that isn't part of valid JSON
    cleaned = cleaned.replace(/^[.\s\n\r]*(?=\{)/, '');

    // Fix double opening braces: {{ -> {
    // This handles cases like "{\n{" or "{{"
    cleaned = cleaned.replace(/^\{\s*\{/, '{');

    // Fix double closing braces at the end: }} -> }
    // But only if there's an imbalance (more } than {)
    const openCount = (cleaned.match(/\{/g) || []).length;
    const closeCount = (cleaned.match(/\}/g) || []).length;
    if (closeCount > openCount) {
      // Remove extra closing braces from the end
      const excess = closeCount - openCount;
      for (let i = 0; i < excess; i++) {
        cleaned = cleaned.replace(/\}(\s*)$/, '$1');
      }
    }

    return cleaned.trim();
  }

  /**
   * Attempt to repair common JSON issues like missing closing braces
   */
  static attemptJsonRepair(jsonStr: string): string | null {
    try {
      // Count opening and closing braces/brackets
      const openBraces = (jsonStr.match(/\{/g) || []).length;
      const closeBraces = (jsonStr.match(/\}/g) || []).length;
      const openBrackets = (jsonStr.match(/\[/g) || []).length;
      const closeBrackets = (jsonStr.match(/\]/g) || []).length;

      let repaired = jsonStr;

      // Add missing closing brackets first (inner), then braces (outer)
      if (openBrackets > closeBrackets) {
        repaired += ']'.repeat(openBrackets - closeBrackets);
      }
      if (openBraces > closeBraces) {
        repaired += '}'.repeat(openBraces - closeBraces);
      }

      // Validate the repair worked
      JSON.parse(repaired);
      this.logger.debug('Successfully repaired truncated JSON');
      return repaired;
    } catch {
      return null;
    }
  }

  /**
   * Robust JSON extraction with multiple fallback strategies
   */
  static extractValidJson(content: string): any {
    const originalContent = content?.substring(0, 200) || '';

    // Step 1: Clean markdown wrappers and malformed patterns
    let cleanedContent = this.cleanJsonContent(content);

    // Step 1.5: Sanitize URLs before parsing
    cleanedContent = UrlSanitizerUtil.sanitizeJsonUrls(cleanedContent);

    this.logger.debug(`JSON extraction - Original starts with: "${originalContent.substring(0, 50)}..."`);
    this.logger.debug(`JSON extraction - Cleaned starts with: "${cleanedContent.substring(0, 50)}..."`);

    // Step 2: Try direct parse
    try {
      return JSON.parse(cleanedContent);
    } catch (directError) {
      this.logger.debug(`Direct JSON parse failed: ${(directError as Error).message}`);
    }

    // Step 3: Try to extract JSON object from text
    const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      // Apply cleaning again to the extracted match (handles nested double braces)
      let extractedJson = jsonMatch[0];
      extractedJson = extractedJson.replace(/^\{\s*\{/, '{'); // Fix leading double braces

      try {
        return JSON.parse(extractedJson);
      } catch (extractError) {
        this.logger.debug(`Extracted JSON parse failed: ${(extractError as Error).message}`);

        // Step 4: Attempt repair
        const repairedJson = this.attemptJsonRepair(extractedJson);
        if (repairedJson) {
          return JSON.parse(repairedJson);
        }
      }
    }

    // All strategies failed - log more details for debugging
    this.logger.error(`JSON extraction failed. Cleaned content (first 300 chars): ${cleanedContent.substring(0, 300)}`);
    throw new Error(`Failed to extract valid JSON from AI response. Content starts with: ${cleanedContent.substring(0, 100)}...`);
  }
}

/**
 * Utility class for sanitizing URLs in JSON
 */
export class UrlSanitizerUtil {
  /**
   * Sanitize malformed URLs in JSON strings (e.g., double query string separators)
   */
  static sanitizeJsonUrls(jsonString: string): string {
    // Fix Unsplash URLs with duplicate query strings: ?...?... -> ?...&...
    let sanitized = jsonString.replace(
      /(https:\/\/[^\s"]*\?)([^\s"]*?)\?([^\s"]*)/g,
      '$1$2&$3'
    );

    // Fix multiple consecutive ? in any URL
    sanitized = sanitized.replace(
      /(https?:\/\/[^\s"]*)\?+/g,
      (match, prefix) => {
        const questionMarks = match.match(/\?/g)?.length || 0;
        return questionMarks > 1 ? prefix + '?' : match;
      }
    );

    return sanitized;
  }
}

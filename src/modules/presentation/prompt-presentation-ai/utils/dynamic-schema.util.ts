import { Logger } from '@nestjs/common';

/**
 * JSON Schema type definition
 */
interface JSONSchema {
  type?: string | string[];
  const?: string | number | boolean;
  format?: string;
  description?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  required?: string[];
  additionalProperties?: boolean;
  minItems?: number;
  maxItems?: number;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  enum?: (string | number)[];
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
}

/**
 * Options for schema inference
 */
interface InferOptions {
  allowAdditionalProperties?: boolean;
  enforceArrayLength?: boolean;
  maxDepth?: number;
  currentDepth?: number;
}

/**
 * Dynamic Schema Generator Utility
 * 
 * Generates JSON Schemas by introspecting actual template data at runtime.
 * No hardcoded block type mappings required.
 */
export class DynamicSchemaUtil {
  private static readonly logger = new Logger(DynamicSchemaUtil.name);
  private static readonly MAX_DEPTH = 15;

  /**
   * Generate a complete slide schema from template rows
   * This is the main entry point for slide generation
   */
  static generateSlideSchemaFromTemplate(
    templateRows: any[],
    hasAccent: boolean = false,
  ): JSONSchema {
    const schema: JSONSchema = {
      type: 'object',
      properties: {},
      required: ['rows'],
      additionalProperties: false,
    };

    // Add accent if present
    if (hasAccent) {
      schema.properties!.accent = {
        type: 'object',
        properties: {
          url: { type: 'string' },
          position: { 
            type: 'string', 
            enum: ['left', 'right', 'top', 'bottom', 'background'] 
          },
          size: { type: 'number' },
        },
        required: ['url', 'position', 'size'],
        additionalProperties: false,
      };
      schema.required!.push('accent');
    }

    // Generate rows schema from template
    schema.properties!.rows = this.generateRowsSchema(templateRows);

    return schema;
  }

  /**
   * Generate schema for the rows array
   */
  private static generateRowsSchema(templateRows: any[]): JSONSchema {
    if (!templateRows || templateRows.length === 0) {
      return {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
        minItems: 0,
      };
    }

    // Collect all unique block schemas from all rows
    const allBlocks: any[] = [];
    templateRows.forEach(row => {
      if (row.blocks && Array.isArray(row.blocks)) {
        allBlocks.push(...row.blocks);
      }
    });

    // Generate block schema using oneOf for different types
    const blockSchema = this.generateBlockSchemaFromExamples(allBlocks);

    return {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          columnWidths: {
            type: 'array',
            items: { type: 'number' },
          },
          blocks: {
            type: 'array',
            items: blockSchema,
            minItems: 1,
          },
        },
        required: ['id', 'blocks'],
        additionalProperties: false,
      },
      minItems: templateRows.length,
      maxItems: templateRows.length,
    };
  }

  /**
   * Generate block schema from example blocks
   * Uses oneOf if multiple block types are present
   */
  private static generateBlockSchemaFromExamples(blocks: any[]): JSONSchema {
    if (!blocks || blocks.length === 0) {
      return { type: 'object', additionalProperties: true };
    }

    // Group blocks by type
    const blocksByType = new Map<string, any>();
    for (const block of blocks) {
      const blockType = block.type || 'unknown';
      if (!blocksByType.has(blockType)) {
        blocksByType.set(blockType, block);
      }
    }

    // Generate schema for each unique block type
    const blockSchemas: JSONSchema[] = [];
    for (const [blockType, exampleBlock] of blocksByType) {
      const schema = this.generateSingleBlockSchema(exampleBlock);
      blockSchemas.push(schema);
    }

    // If only one type, return it directly
    if (blockSchemas.length === 1) {
      return blockSchemas[0];
    }

    // Multiple types: use anyOf (more flexible than oneOf for structured output)
    return { anyOf: blockSchemas };
  }

  /**
   * Generate schema for a single block based on its structure
   */
  private static generateSingleBlockSchema(block: any): JSONSchema {
    const schema: JSONSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', const: block.type },
      },
      required: ['id', 'type', 'content'],
      additionalProperties: false,
    };

    // Infer content schema from the block's content
    if (block.content !== undefined) {
      schema.properties!.content = this.inferSchema(block.content, {
        allowAdditionalProperties: true,
        enforceArrayLength: false,
        currentDepth: 0,
      });
    } else {
      schema.properties!.content = { type: 'object', additionalProperties: true };
    }

    return schema;
  }

  /**
   * Core recursive schema inference function
   * Walks any JavaScript value and generates a matching JSON Schema
   */
  static inferSchema(value: unknown, options: InferOptions = {}): JSONSchema {
    const depth = options.currentDepth || 0;
    const maxDepth = options.maxDepth || this.MAX_DEPTH;

    // Depth limit check
    if (depth > maxDepth) {
      return { type: 'object', additionalProperties: true };
    }

    // Handle null
    if (value === null) {
      return { type: ['string', 'null'] as any }; // Allow string or null
    }

    // Handle undefined
    if (value === undefined) {
      return { type: 'string' };
    }

    // Handle by type
    switch (typeof value) {
      case 'string':
        return this.inferStringSchema(value);
      case 'number':
        return { type: 'number' };
      case 'boolean':
        return { type: 'boolean' };
      case 'object':
        if (Array.isArray(value)) {
          return this.inferArraySchema(value, { ...options, currentDepth: depth + 1 });
        }
        return this.inferObjectSchema(value as Record<string, unknown>, { 
          ...options, 
          currentDepth: depth + 1 
        });
      default:
        return { type: 'string' };
    }
  }

  /**
   * Infer schema for string values
   */
  private static inferStringSchema(value: string): JSONSchema {
    const schema: JSONSchema = { type: 'string' };

    // Detect URL patterns
    if (value.startsWith('http://') || value.startsWith('https://')) {
      // Don't add format constraint, just keep as string
    }

    return schema;
  }

  /**
   * Infer schema for arrays
   */
  private static inferArraySchema(arr: unknown[], options: InferOptions): JSONSchema {
    const schema: JSONSchema = { type: 'array' };

    if (arr.length === 0) {
      // Empty array - allow any items
      schema.items = { type: 'object', additionalProperties: true };
    } else {
      // Use first element as canonical item schema
      schema.items = this.inferSchema(arr[0], options);
    }

    // Minimum of 1 item to ensure AI generates content
    schema.minItems = 1;

    return schema;
  }

  /**
   * Infer schema for objects
   * This is the most complex case - handles ProseMirror and regular objects
   */
  private static inferObjectSchema(
    obj: Record<string, unknown>,
    options: InferOptions,
  ): JSONSchema {
    // Special case: ProseMirror document
    if (this.isProseMirrorDoc(obj)) {
      return this.getProseMirrorSchema();
    }

    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      properties[key] = this.inferSchema(value, options);

      // Determine which fields should be required
      if (key === 'id' || key === 'type') {
        required.push(key);

        // Lock "type" field to its exact value
        if (key === 'type' && typeof value === 'string') {
          properties[key] = { type: 'string', const: value };
        }
      }
    }

    // If no explicit requirements, require all fields
    const finalRequired = required.length > 0 ? required : Object.keys(properties);

    return {
      type: 'object',
      properties,
      required: finalRequired,
      additionalProperties: options.allowAdditionalProperties ?? true,
    };
  }

  /**
   * Detect if an object is a ProseMirror document
   */
  private static isProseMirrorDoc(obj: Record<string, unknown>): boolean {
    return (
      obj &&
      typeof obj === 'object' &&
      obj.type === 'doc' &&
      Array.isArray(obj.content)
    );
  }

  /**
   * Generate a flexible ProseMirror schema
   * ProseMirror documents have a recursive structure that needs special handling
   */
  private static getProseMirrorSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        type: { type: 'string', const: 'doc' },
        content: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: { type: 'string' },
              attrs: { type: 'object', additionalProperties: true },
              content: { type: 'array' },
              marks: { type: 'array' },
              text: { type: 'string', minLength: 1 },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
      },
      required: ['type', 'content'],
      additionalProperties: false,
    };
  }

  /**
   * Debug helper: Log the generated schema
   */
  static logSchema(schema: JSONSchema, label: string = 'Generated Schema'): void {
    this.logger.debug(`${label}: ${JSON.stringify(schema, null, 2)}`);
  }
}

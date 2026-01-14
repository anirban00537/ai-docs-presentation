import { Logger } from '@nestjs/common';

/**
 * JSON Schema type definition
 * Extended to support prefixItems for tuple validation
 */
export interface JSONSchema {
  type?: string | string[];
  const?: string | number | boolean;
  format?: string;
  description?: string;
  properties?: Record<string, JSONSchema>;
  items?: JSONSchema;
  prefixItems?: JSONSchema[];
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
  pattern?: string;
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
 * Valid ProseMirror node types
 */
const PROSEMIRROR_NODE_TYPES = [
  'doc',
  'paragraph',
  'heading',
  'text',
  'bullet_list',
  'ordered_list',
  'list_item',
  'blockquote',
  'code_block',
  'hard_break',
  'horizontal_rule',
  'image',
] as const;

/**
 * Valid ProseMirror mark types
 */
const PROSEMIRROR_MARK_TYPES = [
  'strong',
  'em',
  'code',
  'link',
  'underline',
  'strike',
  'subscript',
  'superscript',
  'highlight',
] as const;

/**
 * Dynamic Schema Generator Utility
 *
 * Generates JSON Schemas by introspecting actual template data at runtime.
 * Uses tuple validation (prefixItems) to enforce exact structure matching.
 */
export class DynamicSchemaUtil {
  private static readonly logger = new Logger(DynamicSchemaUtil.name);
  private static readonly MAX_DEPTH = 15;

  /**
   * Generate a complete card schema from template rows
   * This is the main entry point for card generation
   */
  static generateCardSchemaFromTemplate(
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
          imageUrl: { type: 'string' },
          imageQuery: { type: 'string' },
          position: {
            type: 'string',
            enum: ['left', 'right', 'top', 'bottom', 'background'],
          },
          size: { type: 'number' },
        },
        required: ['imageUrl', 'imageQuery', 'position', 'size'],
        additionalProperties: false,
      };
      schema.required!.push('accent');
    }

    // Generate rows schema from template using tuple validation
    schema.properties!.rows = this.generateRowsSchema(templateRows);

    return schema;
  }

  /**
   * Generate schema for document outline
   * Enforces strict content format: title (# ) followed by bullet points (- )
   */
  static generateOutlineSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: 'The title of the generated document. Must be a complete, professional title.',
          minLength: 5,
        },
        outlines: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              content: {
                type: 'string',
                description: 'STRICT FORMAT: Must be "# Title" followed by AT LEAST 4 bullet points starting with "- ". Title-only content is INVALID.',
                minLength: 100, // Forces substantial content (title + multiple bullet points)
                pattern: '^# .+[\\s\\S]*- .+', // Forces # Title AND at least one - point
              },
              layoutId: {
                type: 'string',
                description: 'The ID of the layout to use for this card',
              },
            },
            required: ['content', 'layoutId'],
            additionalProperties: false,
          },
          minItems: 1,
        },
      },
      required: ['title', 'outlines'],
      additionalProperties: false,
    };
  }

  /**
   * Generate schema for the rows array using tuple validation (prefixItems)
   * Each row position has its exact structure enforced
   */
  private static generateRowsSchema(templateRows: any[]): JSONSchema {
    if (!templateRows || templateRows.length === 0) {
      return {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
        minItems: 0,
      };
    }

    // Generate a specific schema for each row using prefixItems (tuple validation)
    const rowSchemas: JSONSchema[] = templateRows.map((row, rowIndex) => {
      return this.generateSingleRowSchema(row, rowIndex);
    });

    return {
      type: 'array',
      prefixItems: rowSchemas,
      minItems: templateRows.length,
      maxItems: templateRows.length,
    };
  }

  /**
   * Generate schema for a single row with exact block structure
   */
  private static generateSingleRowSchema(
    row: any,
    rowIndex: number,
  ): JSONSchema {
    const required: string[] = ['id', 'blocks'];
    const properties: Record<string, JSONSchema> = {
      id: { type: 'string' },
    };

    // Add columnWidths if present in template (make it required)
    if (
      row.columnWidths &&
      Array.isArray(row.columnWidths) &&
      row.columnWidths.length > 0
    ) {
      properties.columnWidths = {
        type: 'array',
        items: { type: 'number' },
        minItems: row.columnWidths.length,
        maxItems: row.columnWidths.length,
      };
      required.push('columnWidths');
    }

    // Generate blocks schema using tuple validation
    if (row.blocks && Array.isArray(row.blocks) && row.blocks.length > 0) {
      const blockSchemas: JSONSchema[] = row.blocks.map((block: any) => {
        return this.generateSingleBlockSchema(block);
      });

      properties.blocks = {
        type: 'array',
        prefixItems: blockSchemas,
        minItems: row.blocks.length,
        maxItems: row.blocks.length,
      };
    } else {
      properties.blocks = {
        type: 'array',
        items: { type: 'object', additionalProperties: true },
        minItems: 0,
      };
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: false,
    };
  }

  /**
   * Generate schema for a single block based on its structure
   * Enforces exact type using const
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

    // Handle content based on block type
    // FORCED OVERRIDE: ProseMirror blocks MUST be structured objects, even if template is a string/null/empty
    if (block.type === 'prosemirror') {
      schema.properties!.content = this.getProseMirrorSchema();
    } else if (
      block.content !== undefined &&
      block.content !== null &&
      block.content !== ''
    ) {
      schema.properties!.content = this.inferSchema(block.content, {
        allowAdditionalProperties: false,
        enforceArrayLength: true,
        currentDepth: 0,
      });
    } else {
      // Empty or null content - use generic object schema
      schema.properties!.content = {
        type: 'object',
        additionalProperties: true,
      };
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
          return this.inferArraySchema(value, {
            ...options,
            currentDepth: depth + 1,
          });
        }
        return this.inferObjectSchema(value as Record<string, unknown>, {
          ...options,
          currentDepth: depth + 1,
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

    // Detect URL patterns - no special handling needed, just string
    return schema;
  }

  /**
   * Infer schema for arrays using tuple validation when enforceArrayLength is true
   */
  private static inferArraySchema(
    arr: unknown[],
    options: InferOptions,
  ): JSONSchema {
    const schema: JSONSchema = { type: 'array' };

    if (arr.length === 0) {
      // Empty array - allow any items
      schema.items = { type: 'object', additionalProperties: true };
      schema.minItems = 0;
    } else if (options.enforceArrayLength && arr.length > 0) {
      // Use prefixItems for tuple validation (exact structure per position)
      schema.prefixItems = arr.map((item) => this.inferSchema(item, options));
      schema.minItems = arr.length;
      schema.maxItems = arr.length;
    } else {
      // Use first element as canonical item schema (fallback)
      schema.items = this.inferSchema(arr[0], options);
      schema.minItems = 1;
    }

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

      // Lock "type" field to its exact value using const
      if (key === 'type' && typeof value === 'string') {
        properties[key] = { type: 'string', const: value };
      }

      // Special handling for imageUrl: if it exists, force imageQuery to be required
      if (key === 'imageUrl') {
        if (!properties['imageQuery']) {
          properties['imageQuery'] = { type: 'string' };
        }
        if (!required.includes('imageQuery')) {
          required.push('imageQuery');
        }
      }

      // Add to required list
      if (!required.includes(key)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required,
      additionalProperties: options.allowAdditionalProperties ?? false,
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
   * Generate a strict ProseMirror schema with valid node and mark type enums
   * ProseMirror documents have a recursive structure that needs special handling
   */
  private static getProseMirrorSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        type: { type: 'string', const: 'doc' },
        content: {
          type: 'array',
          items: this.getProseMirrorNodeSchema(),
          minItems: 1,
        },
      },
      required: ['type', 'content'],
      additionalProperties: false,
    };
  }

  /**
   * Generate schema for a single ProseMirror node with restricted types
   */
  private static getProseMirrorNodeSchema(): JSONSchema {
    return {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: [...PROSEMIRROR_NODE_TYPES],
        },
        attrs: {
          type: 'object',
          additionalProperties: true,
        },
        content: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [...PROSEMIRROR_NODE_TYPES],
              },
              attrs: { type: 'object', additionalProperties: true },
              content: { type: 'array' },
              marks: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    type: {
                      type: 'string',
                      enum: [...PROSEMIRROR_MARK_TYPES],
                    },
                    attrs: { type: 'object', additionalProperties: true },
                  },
                  required: ['type'],
                  additionalProperties: true,
                },
              },
              text: { type: 'string', minLength: 1 },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
        marks: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: [...PROSEMIRROR_MARK_TYPES],
              },
              attrs: { type: 'object', additionalProperties: true },
            },
            required: ['type'],
            additionalProperties: true,
          },
        },
        text: { type: 'string', minLength: 1 },
      },
      required: ['type'],
      additionalProperties: true,
    };
  }

  /**
   * Debug helper: Log the generated schema
   */
  static logSchema(
    schema: JSONSchema,
    label: string = 'Generated Schema',
  ): void {
    this.logger.debug(`${label}: ${JSON.stringify(schema, null, 2)}`);
  }
}

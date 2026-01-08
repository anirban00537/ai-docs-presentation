import { Logger } from '@nestjs/common';

/**
 * Utility to generate JSON Schema from template rows for structured AI output
 */
export class SchemaGeneratorUtil {
  private static readonly logger = new Logger(SchemaGeneratorUtil.name);

  /**
   * Generate a JSON Schema for slide structure based on template rows
   */
  static generateSlideSchema(templateRows: any[], hasAccent: boolean = false): any {
    const schema: any = {
      type: 'object',
      properties: {},
      required: ['rows'],
      additionalProperties: false,
    };

    // Add accent if needed
    if (hasAccent) {
      schema.properties.accent = {
        type: 'object',
        properties: {
          url: { type: 'string' },
          position: { type: 'string', enum: ['left', 'right', 'top', 'bottom', 'background'] },
          size: { type: 'number' },
        },
        required: ['url', 'position', 'size'],
        additionalProperties: false,
      };
      schema.required.push('accent');
    }

    // Build rows schema
    schema.properties.rows = {
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
            items: this.generateBlockSchema(templateRows),
          },
        },
        required: ['id', 'blocks'],
        additionalProperties: false,
      },
      minItems: templateRows.length,
      maxItems: templateRows.length,
    };

    return schema;
  }

  /**
   * Generate schema for a block based on template examples
   */
  private static generateBlockSchema(templateRows: any[]): any {
    // Collect all unique block types from template
    const blockTypes = new Set<string>();
    templateRows.forEach(row => {
      row.blocks?.forEach((block: any) => {
        if (block.type) blockTypes.add(block.type);
      });
    });

    // Create oneOf schema for different block types
    const blockSchemas = Array.from(blockTypes).map(type => 
      this.getSchemaForBlockType(type)
    );

    // If only one type, return it directly; otherwise use oneOf
    if (blockSchemas.length === 1) {
      return blockSchemas[0];
    }

    return {
      oneOf: blockSchemas,
    };
  }

  /**
   * Get JSON Schema for a specific block type
   */
  private static getSchemaForBlockType(type: string): any {
    const baseSchema = {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string', const: type },
      },
      required: ['id', 'type', 'content'],
      additionalProperties: false,
    };

    // Add content schema based on block type
    switch (type) {
      case 'prosemirror':
        (baseSchema.properties as any).content = this.getProseMirrorSchema();
        break;

      case 'image':
        (baseSchema.properties as any).content = {
          type: 'object',
          properties: {
            type: { type: 'string', const: 'image' },
            url: { type: 'string' },
            alt: { type: 'string' },
            caption: { type: 'string' },
          },
          required: ['type', 'url'],
          additionalProperties: true,
        };
        break;

      case 'simple-number-card':
      case 'solid-icon-box-block':
      case 'solid-box-block':
      case 'sideline-card-block':
      case 'leaf-block':
      case 'layered-number-block':
        (baseSchema.properties as any).content = this.getItemsArraySchema(type);
        break;

      case 'stacked-timeline-block':
      case 'timeline-bento-block':
      case 'connected-steps-block':
        (baseSchema.properties as any).content = this.getTimelineSchema(type);
        break;

      case 'circle-stats-block':
        (baseSchema.properties as any).content = this.getCircleStatsSchema();
        break;

      case 'spacer':
        (baseSchema.properties as any).content = {
          type: 'object',
          properties: {
            type: { type: 'string', const: 'spacer' },
            height: { type: 'number' },
          },
          required: ['type', 'height'],
          additionalProperties: false,
        };
        break;

      default:
        // Generic content schema for unknown types
        (baseSchema.properties as any).content = {
          type: 'object',
          additionalProperties: true,
        };
    }

    return baseSchema;
  }

  /**
   * Schema for ProseMirror content
   */
  private static getProseMirrorSchema(): any {
    return {
      type: 'object',
      properties: {
        type: { type: 'string', const: 'doc' },
        content: {
          type: 'array',
          items: {
            type: 'object',
            additionalProperties: true,
          },
        },
      },
      required: ['type', 'content'],
      additionalProperties: true,
    };
  }

  /**
   * Schema for blocks with items array (cards, boxes, etc.)
   */
  private static getItemsArraySchema(blockType: string): any {
    return {
      type: 'object',
      properties: {
        type: { type: 'string', const: blockType },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              number: { type: 'number' },
              icon: { type: 'string' },
              title: this.getProseMirrorSchema(),
              description: this.getProseMirrorSchema(),
            },
            required: ['id'],
            additionalProperties: true,
          },
          minItems: 1,
        },
      },
      required: ['type', 'items'],
      additionalProperties: false,
    };
  }

  /**
   * Schema for timeline-type blocks
   */
  private static getTimelineSchema(blockType: string): any {
    return {
      type: 'object',
      properties: {
        type: { type: 'string', const: blockType },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: this.getProseMirrorSchema(),
              description: this.getProseMirrorSchema(),
            },
            required: ['id', 'title', 'description'],
            additionalProperties: false,
          },
          minItems: 1,
        },
      },
      required: ['type', 'items'],
      additionalProperties: false,
    };
  }

  /**
   * Schema for circle stats block
   */
  private static getCircleStatsSchema(): any {
    return {
      type: 'object',
      properties: {
        type: { type: 'string', const: 'circle-stats-block' },
        items: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              value: { type: 'number', minimum: 0, maximum: 100 },
              suffix: { type: 'string' },
              title: this.getProseMirrorSchema(),
              description: this.getProseMirrorSchema(),
            },
            required: ['id', 'value'],
            additionalProperties: true,
          },
          minItems: 1,
        },
      },
      required: ['type', 'items'],
      additionalProperties: false,
    };
  }
}

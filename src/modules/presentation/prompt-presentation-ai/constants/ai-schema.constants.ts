/**
 * JSON Schema constants for AI responses
 */

export const SLIDE_CONTENT_JSON_SCHEMA = {
  name: 'slide_content',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      rows: {
        type: 'array',
        description: 'Array of slide rows matching the template structure',
        items: {
          type: 'object',
          additionalProperties: true,
        },
      },
      accent: {
        type: 'object',
        description: 'Optional accent image configuration for the slide',
        properties: {
          url: {
            type: 'string',
            description: 'URL of the accent image',
          },
          position: {
            type: 'string',
            enum: ['left', 'right', 'top', 'bottom', 'background'],
            description: 'Position of the accent image',
          },
          size: {
            type: 'number',
            description: 'Size of the accent image as a percentage (1-100)',
          },
        },
        required: ['url'],
        additionalProperties: false,
      },
    },
    required: ['rows'],
    additionalProperties: false,
  },
};

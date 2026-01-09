import { DynamicSchemaUtil } from './dynamic-schema.util';

describe('DynamicSchemaUtil', () => {
  describe('inferSchema', () => {
    it('should infer schema for string', () => {
      const schema = DynamicSchemaUtil.inferSchema('hello');
      expect(schema).toEqual({ type: 'string' });
    });

    it('should infer schema for number', () => {
      const schema = DynamicSchemaUtil.inferSchema(123);
      expect(schema).toEqual({ type: 'number' });
    });

    it('should infer schema for boolean', () => {
      const schema = DynamicSchemaUtil.inferSchema(true);
      expect(schema).toEqual({ type: 'boolean' });
    });

    it('should infer schema for array of strings', () => {
      const input = ['a', 'b'];
      const schema = DynamicSchemaUtil.inferSchema(input);
      expect(schema).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      });
    });

    it('should infer schema for object', () => {
      const input = { name: 'test', count: 1 };
      const schema = DynamicSchemaUtil.inferSchema(input);
      expect(schema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          count: { type: 'number' },
        },
        required: ['name', 'count'],
        additionalProperties: true,
      });
    });

    it('should handle nested objects', () => {
      const input = {
        meta: { version: 1 },
      };
      const schema = DynamicSchemaUtil.inferSchema(input);
      expect(schema).toEqual({
        type: 'object',
        properties: {
          meta: {
            type: 'object',
            properties: {
              version: { type: 'number' },
            },
            required: ['version'],
            additionalProperties: true,
          },
        },
        required: ['meta'],
        additionalProperties: true,
      });
    });

    it('should handle ProseMirror document specially', () => {
      const input = {
        type: 'doc',
        content: [
          { type: 'paragraph', content: [] }
        ]
      };
      
      const schema = DynamicSchemaUtil.inferSchema(input);
      
      // Should match getProseMirrorSchema output
      expect(schema).toEqual({
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
                text: { type: 'string' },
              },
              required: ['type'],
              additionalProperties: true,
            },
          },
        },
        required: ['type', 'content'],
        additionalProperties: false,
      });
    });
  });

  describe('generateSlideSchemaFromTemplate', () => {
    it('should generate schema for rows with blocks', () => {
      const template = [
        {
          id: 'row-1',
          blocks: [
            {
              id: 'block-1',
              type: 'test-block',
              content: { title: 'Hello' }
            }
          ]
        }
      ];

      const schema = DynamicSchemaUtil.generateSlideSchemaFromTemplate(template);

      expect(schema.type).toBe('object');
      expect(schema.required).toContain('rows');
      
      const rowsSchema = schema.properties?.rows;
      expect(rowsSchema?.type).toBe('array');
      expect(rowsSchema?.minItems).toBe(1);

      const blockProperties = rowsSchema?.items?.properties?.blocks?.items?.properties;
      expect(blockProperties?.type).toEqual({ type: 'string', const: 'test-block' });
      expect(blockProperties?.content?.properties?.title).toEqual({ type: 'string' });
    });

    it('should include accent when requested', () => {
      const schema = DynamicSchemaUtil.generateSlideSchemaFromTemplate([], true);
      expect(schema.required).toContain('accent');
      expect(schema.properties?.accent).toBeDefined();
    });
  });
});

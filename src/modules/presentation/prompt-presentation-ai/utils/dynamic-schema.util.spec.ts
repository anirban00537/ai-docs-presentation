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

    it('should infer schema for array of strings (default behavior)', () => {
      const input = ['a', 'b'];
      const schema = DynamicSchemaUtil.inferSchema(input);
      // Default behavior uses items (first element)
      expect(schema).toEqual({
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
      });
    });

    it('should infer schema for array with enforceArrayLength using prefixItems', () => {
      const input = ['a', 'b', 'c'];
      const schema = DynamicSchemaUtil.inferSchema(input, {
        enforceArrayLength: true,
      });
      // With enforceArrayLength, uses prefixItems for tuple validation
      expect(schema).toEqual({
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'string' },
          { type: 'string' },
        ],
        minItems: 3,
        maxItems: 3,
      });
    });

    it('should infer schema for object with additionalProperties false by default', () => {
      const input = { name: 'test', count: 1 };
      const schema = DynamicSchemaUtil.inferSchema(input);
      expect(schema).toEqual({
        type: 'object',
        properties: {
          name: { type: 'string' },
          count: { type: 'number' },
        },
        required: ['name', 'count'],
        additionalProperties: false,
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
            additionalProperties: false,
          },
        },
        required: ['meta'],
        additionalProperties: false,
      });
    });

    it('should handle ProseMirror document with enum node types', () => {
      const input = {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
      };

      const schema = DynamicSchemaUtil.inferSchema(input);

      // Should match getProseMirrorSchema output with enum constraints
      expect(schema.type).toBe('object');
      expect(schema.properties?.type).toEqual({ type: 'string', const: 'doc' });
      expect(schema.properties?.content?.type).toBe('array');
      expect(
        schema.properties?.content?.items?.properties?.type?.enum,
      ).toContain('paragraph');
      expect(
        schema.properties?.content?.items?.properties?.type?.enum,
      ).toContain('heading');
      expect(schema.required).toEqual(['type', 'content']);
      expect(schema.additionalProperties).toBe(false);
    });

    it('should lock type field with const', () => {
      const input = { type: 'special-type', value: 42 };
      const schema = DynamicSchemaUtil.inferSchema(input);
      expect(schema.properties?.type).toEqual({
        type: 'string',
        const: 'special-type',
      });
    });
  });

  describe('generateSlideSchemaFromTemplate', () => {
    it('should generate schema for rows with blocks using prefixItems', () => {
      const template = [
        {
          id: 'row-1',
          blocks: [
            {
              id: 'block-1',
              type: 'test-block',
              content: { title: 'Hello' },
            },
          ],
        },
      ];

      const schema =
        DynamicSchemaUtil.generateSlideSchemaFromTemplate(template);

      expect(schema.type).toBe('object');
      expect(schema.required).toContain('rows');

      const rowsSchema = schema.properties?.rows;
      expect(rowsSchema?.type).toBe('array');
      expect(rowsSchema?.minItems).toBe(1);
      expect(rowsSchema?.maxItems).toBe(1);

      // Should use prefixItems for tuple validation
      expect(rowsSchema?.prefixItems).toBeDefined();
      expect(rowsSchema?.prefixItems?.length).toBe(1);

      // Check first row schema
      const firstRowSchema = rowsSchema?.prefixItems?.[0];
      expect(firstRowSchema?.type).toBe('object');
      expect(firstRowSchema?.required).toContain('id');
      expect(firstRowSchema?.required).toContain('blocks');

      // Check blocks use prefixItems
      const blocksSchema = firstRowSchema?.properties?.blocks;
      expect(blocksSchema?.prefixItems).toBeDefined();
      expect(blocksSchema?.prefixItems?.length).toBe(1);

      // Check block schema
      const blockSchema = blocksSchema?.prefixItems?.[0];
      expect(blockSchema?.properties?.type).toEqual({
        type: 'string',
        const: 'test-block',
      });
      expect(blockSchema?.properties?.content?.properties?.title).toEqual({
        type: 'string',
      });
    });

    it('should include accent when requested', () => {
      const schema = DynamicSchemaUtil.generateSlideSchemaFromTemplate(
        [],
        true,
      );
      expect(schema.required).toContain('accent');
      expect(schema.properties?.accent).toBeDefined();
      expect(schema.properties?.accent?.properties?.position?.enum).toContain(
        'left',
      );
      expect(schema.properties?.accent?.properties?.position?.enum).toContain(
        'background',
      );
    });

    it('should make columnWidths required when present in template', () => {
      const template = [
        {
          id: 'row-1',
          columnWidths: [0.5, 0.5],
          blocks: [
            { id: 'block-1', type: 'test', content: {} },
            { id: 'block-2', type: 'test', content: {} },
          ],
        },
      ];

      const schema =
        DynamicSchemaUtil.generateSlideSchemaFromTemplate(template);
      const rowSchema = schema.properties?.rows?.prefixItems?.[0];

      expect(rowSchema?.required).toContain('columnWidths');
      expect(rowSchema?.properties?.columnWidths?.minItems).toBe(2);
      expect(rowSchema?.properties?.columnWidths?.maxItems).toBe(2);
    });

    it('should handle prosemirror blocks with empty content', () => {
      const template = [
        {
          id: 'row-1',
          blocks: [
            {
              id: 'block-1',
              type: 'prosemirror',
              content: '', // Empty string (like Blank template)
            },
          ],
        },
      ];

      const schema =
        DynamicSchemaUtil.generateSlideSchemaFromTemplate(template);
      const blockSchema =
        schema.properties?.rows?.prefixItems?.[0]?.properties?.blocks
          ?.prefixItems?.[0];

      // Should force ProseMirror schema even with empty content
      expect(blockSchema?.properties?.content?.type).toBe('object');
      expect(blockSchema?.properties?.content?.properties?.type?.const).toBe(
        'doc',
      );
    });

    it('should enforce exact block positions across multiple rows', () => {
      const template = [
        {
          id: 'row-1',
          blocks: [{ id: 'b1', type: 'spacer', content: { height: 100 } }],
        },
        {
          id: 'row-2',
          blocks: [
            {
              id: 'b2',
              type: 'prosemirror',
              content: { type: 'doc', content: [] },
            },
          ],
        },
        {
          id: 'row-3',
          blocks: [
            { id: 'b3', type: 'image', content: { url: 'http://example.com' } },
          ],
        },
      ];

      const schema =
        DynamicSchemaUtil.generateSlideSchemaFromTemplate(template);
      const rowsSchema = schema.properties?.rows;

      expect(rowsSchema?.prefixItems?.length).toBe(3);

      // Row 0 must have spacer
      const row0Block =
        rowsSchema?.prefixItems?.[0]?.properties?.blocks?.prefixItems?.[0];
      expect(row0Block?.properties?.type?.const).toBe('spacer');

      // Row 1 must have prosemirror
      const row1Block =
        rowsSchema?.prefixItems?.[1]?.properties?.blocks?.prefixItems?.[0];
      expect(row1Block?.properties?.type?.const).toBe('prosemirror');

      // Row 2 must have image
      const row2Block =
        rowsSchema?.prefixItems?.[2]?.properties?.blocks?.prefixItems?.[0];
      expect(row2Block?.properties?.type?.const).toBe('image');
    });
  });
});

# 🔄 Dynamic Schema Generation for Structured Output

> **Date**: January 9, 2026  
> **Problem**: Hardcoded block type schemas in `schema-generator.util.ts`  
> **Goal**: Generate JSON schemas dynamically from layout template data at runtime

---

## 📊 Executive Summary

The current approach hardcodes JSON schemas for each block type (`prosemirror`, `simple-number-card`, etc.). This requires manual updates whenever new block types are added.

**The Solution**: Generate JSON schemas dynamically by **introspecting the actual layout template data** provided in the prompt. The AI will then output content that exactly mirrors the input structure.

---

## 🏗️ Architecture Overview

### Current Flow (Hardcoded)
```
Layout Template → SchemaGeneratorUtil.getSchemaForBlockType("prosemirror") → Hardcoded Schema
                                       ↓
                              If unknown type → Generic fallback
```

### Proposed Flow (Dynamic)
```
Layout Template → DynamicSchemaGenerator.inferSchemaFromTemplate(layout) → Runtime Schema
                                       ↓
                              Introspects actual structure → Perfect match
```

---

## 🎯 Core Concept: Schema Inference

Instead of mapping block types to predefined schemas, we **analyze the actual template structure** and generate a schema that enforces the same shape.

### Key Insight

When OpenRouter/OpenAI receives a schema, it doesn't care what the "type" of a block is—it only cares about the **structure of the `content` object**. If the template shows:

```json
{
  "id": "abc",
  "type": "my-custom-block",
  "content": {
    "items": [
      { "id": "1", "title": {...}, "value": 42 }
    ]
  }
}
```

We can **generate a schema from this exact structure** without knowing what "my-custom-block" means:

```json
{
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "type": { "type": "string", "const": "my-custom-block" },
    "content": {
      "type": "object",
      "properties": {
        "items": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "title": { /* inferred */ },
              "value": { "type": "number" }
            }
          }
        }
      }
    }
  }
}
```

---

## 🧩 Implementation Plan

### Phase 1: Dynamic Schema Inferrer Service

Create a new utility that walks any JSON object and generates a matching JSON Schema:

```typescript
// dynamic-schema.util.ts

export class DynamicSchemaUtil {
  /**
   * Infer a JSON Schema from any JavaScript value
   * This is the core recursive function
   */
  static inferSchema(value: unknown, options: InferOptions = {}): JSONSchema {
    if (value === null) {
      return { type: 'null' };
    }

    switch (typeof value) {
      case 'string':
        return this.inferStringSchema(value, options);
      case 'number':
        return { type: Number.isInteger(value) ? 'integer' : 'number' };
      case 'boolean':
        return { type: 'boolean' };
      case 'object':
        if (Array.isArray(value)) {
          return this.inferArraySchema(value, options);
        }
        return this.inferObjectSchema(value as Record<string, unknown>, options);
      default:
        return {}; // Unknown type, allow anything
    }
  }

  /**
   * Handle string values - detect special patterns
   */
  private static inferStringSchema(value: string, options: InferOptions): JSONSchema {
    const schema: JSONSchema = { type: 'string' };

    // If the string looks like a placeholder, add a description
    if (value.includes('...') || value === '' || value.toLowerCase().includes('placeholder')) {
      schema.description = 'Replace with actual content';
    }

    // If it's a URL pattern
    if (value.startsWith('http://') || value.startsWith('https://')) {
      schema.format = 'uri';
    }

    return schema;
  }

  /**
   * Handle arrays - infer item schema from first element
   */
  private static inferArraySchema(arr: unknown[], options: InferOptions): JSONSchema {
    const schema: JSONSchema = { type: 'array' };

    if (arr.length > 0) {
      // Use first element as the canonical item schema
      schema.items = this.inferSchema(arr[0], options);
      
      // Enforce same number of items if requested
      if (options.enforceArrayLength) {
        schema.minItems = arr.length;
        schema.maxItems = arr.length;
      }
    }

    return schema;
  }

  /**
   * Handle objects - the most complex case
   */
  private static inferObjectSchema(
    obj: Record<string, unknown>, 
    options: InferOptions
  ): JSONSchema {
    const properties: Record<string, JSONSchema> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(obj)) {
      properties[key] = this.inferSchema(value, options);

      // Special handling for known important fields
      if (key === 'id' || key === 'type') {
        required.push(key);
        
        // Lock "type" field to its exact value
        if (key === 'type' && typeof value === 'string') {
          properties[key] = { type: 'string', const: value };
        }
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : Object.keys(properties),
      additionalProperties: options.allowAdditionalProperties ?? false,
    };
  }

  /**
   * Special handler for ProseMirror doc structures
   * Detects and loosens schema for rich text content
   */
  private static isProseMirrorDoc(obj: Record<string, unknown>): boolean {
    return obj.type === 'doc' && Array.isArray(obj.content);
  }

  /**
   * Generate a complete slide schema from template rows
   */
  static generateSlideSchemaFromTemplate(
    templateRows: any[], 
    hasAccent: boolean = false
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
          url: { type: 'string', format: 'uri' },
          position: { type: 'string', enum: ['left', 'right', 'top', 'bottom', 'background'] },
          size: { type: 'number', minimum: 0, maximum: 100 },
        },
        required: ['url', 'position', 'size'],
        additionalProperties: false,
      };
      schema.required!.push('accent');
    }

    // Infer rows schema from template
    schema.properties!.rows = {
      type: 'array',
      items: this.inferRowSchema(templateRows),
      minItems: templateRows.length,
      maxItems: templateRows.length,
    };

    return schema;
  }

  /**
   * Generate schema for a row based on template
   */
  private static inferRowSchema(templateRows: any[]): JSONSchema {
    if (templateRows.length === 0) {
      return { type: 'object', additionalProperties: true };
    }

    // Use first row as canonical example
    const exampleRow = templateRows[0];

    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        columnWidths: {
          type: 'array',
          items: { type: 'number' },
        },
        blocks: {
          type: 'array',
          items: this.inferBlockSchema(exampleRow.blocks || []),
        },
      },
      required: ['id', 'blocks'],
      additionalProperties: false,
    };
  }

  /**
   * Generate schema for blocks - handles multiple block types via oneOf
   */
  private static inferBlockSchema(blocks: any[]): JSONSchema {
    if (blocks.length === 0) {
      return { type: 'object', additionalProperties: true };
    }

    // Collect unique block type schemas
    const blockSchemas: JSONSchema[] = [];
    const seenTypes = new Set<string>();

    for (const block of blocks) {
      const blockType = block.type;
      if (blockType && !seenTypes.has(blockType)) {
        seenTypes.add(blockType);
        blockSchemas.push(this.inferSchema(block, { 
          allowAdditionalProperties: false,
          enforceArrayLength: false, // Allow AI to generate different number of items
        }));
      }
    }

    // If only one type, return it directly
    if (blockSchemas.length === 1) {
      return blockSchemas[0];
    }

    // Multiple types: use oneOf
    return { oneOf: blockSchemas };
  }
}

interface InferOptions {
  allowAdditionalProperties?: boolean;
  enforceArrayLength?: boolean;
}

interface JSONSchema {
  type?: string;
  const?: string;
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
  enum?: string[];
  oneOf?: JSONSchema[];
}
```

---

### Phase 2: Special Handling for Known Patterns

While the inferrer is dynamic, we should recognize and handle certain patterns specially:

```typescript
// In DynamicSchemaUtil

/**
 * Detect if an object is a ProseMirror document
 * ProseMirror docs need a flexible schema because of their recursive nature
 */
static isProseMirrorDoc(obj: any): boolean {
  return obj && 
    typeof obj === 'object' && 
    obj.type === 'doc' && 
    Array.isArray(obj.content);
}

/**
 * Generate a flexible ProseMirror schema
 * We can't be too strict here because ProseMirror has many node types
 */
static getProseMirrorSchema(): JSONSchema {
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
            attrs: { type: 'object' },
            content: { type: 'array' },
            marks: { type: 'array' },
            text: { type: 'string' },
          },
          required: ['type'],
          additionalProperties: true, // Allow any node attributes
        },
      },
    },
    required: ['type', 'content'],
    additionalProperties: false,
  };
}

/**
 * In inferSchema, check for ProseMirror before normal object handling
 */
static inferSchema(value: unknown, options: InferOptions = {}): JSONSchema {
  if (value === null) return { type: 'null' };

  if (typeof value === 'object' && !Array.isArray(value)) {
    // Special case: ProseMirror documents
    if (this.isProseMirrorDoc(value)) {
      return this.getProseMirrorSchema();
    }
  }

  // ... rest of inference logic
}
```

---

### Phase 3: Integration with Prompt Builder

Update the prompt to explain that the AI should mirror the exact structure:

```typescript
// In prompt-builder.service.ts

buildLayoutStructurePrompt(templateRows: any[]): string {
  return `
LAYOUT STRUCTURE TEMPLATE:
${JSON.stringify({ rows: templateRows }, null, 2)}

CRITICAL INSTRUCTIONS:
1. Your output MUST have the EXACT SAME structure as the template above.
2. Preserve ALL field names exactly as shown (id, type, content, items, etc.)
3. For each block:
   - Keep the "id" field (you may generate a new UUID)
   - Keep the "type" field EXACTLY as shown (e.g., "prosemirror", "simple-number-card")
   - Transform the "content" field with new, relevant content
4. If an array has N items in the template, you should output N items (adjustable via context).
5. ProseMirror content fields use the format: { "type": "doc", "content": [...] }

The JSON Schema enforcing your output was GENERATED FROM THIS TEMPLATE.
Any structural deviation will cause a validation error.
`;
}
```

---

### Phase 4: Usage in Main Service

Update `prompt-presentation-ai.service.ts` to use the dynamic generator:

```typescript
// In generateSlideContent method

import { DynamicSchemaUtil } from './utils/dynamic-schema.util';

private async *generateSlideContent(...) {
  // ... prompt building ...

  // Check if accent image is being injected
  const hasAccent = imageInjectionPrompt.includes('accent.url');

  // DYNAMIC schema generation from template
  const slideSchema = DynamicSchemaUtil.generateSlideSchemaFromTemplate(
    templateRows, 
    hasAccent
  );

  this.logger.debug(`Generated dynamic schema with ${templateRows.length} rows`);

  const stream = await this.openRouter.chat.send({
    model: this.MODEL_NAME,
    messages: [
      { role: 'user', content: slidePrompt },
    ],
    responseFormat: {
      type: 'json_schema',
      jsonSchema: {
        name: 'slide_structure',
        strict: true,
        schema: slideSchema,
      },
    },
    stream: true,
  });

  // ... rest of streaming logic
}
```

---

## 🧪 Testing the Dynamic Approach

### Test Case 1: Unknown Block Type

**Input Template:**
```json
{
  "rows": [{
    "id": "row-1",
    "blocks": [{
      "id": "block-1",
      "type": "my-totally-new-block",
      "content": {
        "headline": "Welcome",
        "stats": [
          { "label": "Users", "value": 1000 }
        ]
      }
    }]
  }]
}
```

**Inferred Schema:**
```json
{
  "type": "object",
  "properties": {
    "rows": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "blocks": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "id": { "type": "string" },
                "type": { "type": "string", "const": "my-totally-new-block" },
                "content": {
                  "type": "object",
                  "properties": {
                    "headline": { "type": "string" },
                    "stats": {
                      "type": "array",
                      "items": {
                        "type": "object",
                        "properties": {
                          "label": { "type": "string" },
                          "value": { "type": "integer" }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

**Result**: The AI will output content with the exact same shape, regardless of what "my-totally-new-block" means!

---

## 📋 Migration Checklist

### Week 1: Core Implementation
- [ ] Create `dynamic-schema.util.ts` with recursive schema inference
- [ ] Add special handling for ProseMirror documents
- [ ] Add unit tests for various input shapes

### Week 2: Integration
- [ ] Replace `SchemaGeneratorUtil.generateSlideSchema()` calls with `DynamicSchemaUtil`
- [ ] Update prompt builder to emphasize structure mirroring
- [ ] Add logging for generated schemas (debug level)

### Week 3: Validation & Cleanup
- [ ] Test with all 21 existing templates
- [ ] Test with a completely new block type
- [ ] Remove hardcoded schemas from `schema-generator.util.ts`
- [ ] Update documentation

---

## 🎯 Benefits

| Aspect | Before (Hardcoded) | After (Dynamic) |
|--------|-------------------|-----------------|
| New block types | Requires code change | Works automatically |
| Schema accuracy | Approximate | Exact match |
| Maintenance | Manual updates | Zero maintenance |
| Template flexibility | Limited to known types | Any structure |
| Development speed | Slow | Fast |

---

## ⚠️ Edge Cases & Considerations

### 1. Empty Arrays
If template has `"items": []`, we can't infer item schema. 
**Solution**: Use a permissive object schema.

### 2. Null Values
If template has `"subtitle": null`, we can't know the intended type.
**Solution**: Allow string | null union.

### 3. Very Deep Nesting
Extremely nested structures may hit schema limits.
**Solution**: Cap recursion depth at 10 levels.

### 4. Circular References
ProseMirror nodes can be recursive (a listItem contains list which contains listItem).
**Solution**: Use `additionalProperties: true` for known recursive patterns.

---

## 🔗 OpenRouter Structured Output Reference

From [OpenRouter Documentation](https://openrouter.ai/docs/features/structured-outputs):

- ✅ **Strict mode**: Always set `strict: true`
- ✅ **Descriptions**: Add descriptions to guide the model
- ✅ **Streaming support**: Works with `stream: true`
- ✅ **Model support**: GPT-4o, Gemini, Claude Sonnet 4.5+, Fireworks models

---

## 📝 Summary

This dynamic approach eliminates the need to maintain a mapping of block types to schemas. Instead:

1. **Take the template as input**
2. **Walk its structure recursively**
3. **Generate a JSON Schema that enforces that exact shape**
4. **Pass to OpenRouter with `strict: true`**
5. **AI outputs content that matches perfectly**

The layout defines the contract. The schema enforces it. No hardcoding required.

import { Injectable, Logger } from '@nestjs/common';
import type { TemplateSchema, SchemaMetadata } from './types';

/**
 * Schema Registry
 * Loads and caches template schemas from the schemas directory
 */
@Injectable()
export class SchemaRegistry {
  private readonly logger = new Logger(SchemaRegistry.name);
  private schemas: Map<string, TemplateSchema> = new Map();
  private isInitialized = false;

  /**
   * Initialize the registry by loading all schema files
   * This should be called once at application startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Dynamically import all schema files
      // Note: In production, you may need to use a different approach
      // depending on how TypeScript compiles these files
      const schemaModules = this.loadSchemaModules();

      for (const schema of schemaModules) {
        this.schemas.set(schema.id, schema);
        this.logger.log(`Loaded schema: ${schema.id} - ${schema.name}`);
      }

      this.isInitialized = true;
      this.logger.log(
        `Schema registry initialized with ${this.schemas.size} schemas`,
      );
    } catch (error: any) {
      this.logger.error('Failed to initialize schema registry:', error);
      throw error;
    }
  }

  /**
   * Load all schema modules dynamically
   * Imports schemas from the generated index file
   */
  private loadSchemaModules(): TemplateSchema[] {
    const schemas: TemplateSchema[] = [];

    try {
      // Import all schemas from the generated index file in schemas directory
      // Using require for better error handling in Node.js/NestJS
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const schemaIndex = require('../schemas/index');

      // The index file exports schemaMap and individual schemas
      // We can use the schemaMap to get all schemas
      if (schemaIndex.schemaMap) {
        for (const [, schema] of schemaIndex.schemaMap) {
          schemas.push(schema);
        }
      } else {
        // Fallback: try to get all exports that match the schema pattern
        // This handles cases where schemaMap might not be available
        const allExports = Object.values(schemaIndex);
        for (const exportValue of allExports) {
          if (
            exportValue &&
            typeof exportValue === 'object' &&
            'id' in exportValue &&
            'rows' in exportValue
          ) {
            schemas.push(exportValue as TemplateSchema);
          }
        }
      }

      return schemas;
    } catch (error: any) {
      this.logger.error('Error loading schema modules:', error);
      // If index file doesn't exist, return empty array
      // This allows the app to start even if schemas haven't been generated yet
      if (
        error.code === 'MODULE_NOT_FOUND' ||
        error.message?.includes('Cannot find module')
      ) {
        this.logger.warn(
          'Schema index file not found. Run generate-schemas.ts to create schemas.',
        );
      }
      return [];
    }
  }

  /**
   * Get all available schemas
   */
  getAllSchemas(): TemplateSchema[] {
    if (!this.isInitialized) {
      this.logger.warn(
        'Schema registry not initialized. Call initialize() first.',
      );
      return [];
    }
    return Array.from(this.schemas.values());
  }

  /**
   * Get schema metadata for all schemas (for LLM selection)
   */
  getAllSchemaMetadata(): SchemaMetadata[] {
    return this.getAllSchemas().map((schema) => ({
      id: schema.id,
      name: schema.name,
      description: schema.description,
      tags: schema.tags || [],
    }));
  }

  /**
   * Get a schema by ID
   */
  getSchemaById(id: string): TemplateSchema | undefined {
    if (!this.isInitialized) {
      this.logger.warn(
        'Schema registry not initialized. Call initialize() first.',
      );
      return undefined;
    }
    return this.schemas.get(id);
  }

  /**
   * Check if a schema exists
   */
  hasSchema(id: string): boolean {
    return this.schemas.has(id);
  }

  /**
   * Manually register a schema (useful for testing or dynamic loading)
   */
  registerSchema(schema: TemplateSchema): void {
    this.schemas.set(schema.id, schema);
    this.logger.log(`Registered schema: ${schema.id}`);
  }

  /**
   * Get the number of loaded schemas
   */
  getSchemaCount(): number {
    return this.schemas.size;
  }
}


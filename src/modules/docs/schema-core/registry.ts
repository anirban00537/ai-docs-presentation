import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { TemplateSchema, SchemaMetadata } from './types';

/**
 * Schema Registry
 * Loads and caches template schemas from the database (Layout table)
 */
@Injectable()
export class SchemaRegistry {
  private readonly logger = new Logger(SchemaRegistry.name);
  private schemas: Map<string, TemplateSchema> = new Map();
  private isInitialized = false;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Initialize the registry by loading all layout templates from the database
   * This should be called once at application startup
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load all admin layout templates from database
      const layouts = await this.prisma.layout.findMany({
        where: {
          isAdmin: true,
          deletedAt: null,
        },
      });

      for (const layout of layouts) {
        const data = layout.data as any;
        
        // Convert layout to TemplateSchema format
        const schema: TemplateSchema = {
          id: data.id || layout.id,
          name: data.name || layout.name,
          description: data.description || layout.description || '',
          icon: data.icon || 'IconLayout',
          rows: data.rows || [],
          tags: layout.tags || [],
        };
        
        this.schemas.set(schema.id, schema);
        this.logger.log(`Loaded schema: ${schema.id} - ${schema.name}`);
      }

      this.isInitialized = true;
      this.logger.log(
        `Schema registry initialized with ${this.schemas.size} schemas from database`,
      );
    } catch (error: any) {
      this.logger.error('Failed to initialize schema registry:', error);
      throw error;
    }
  }

  /**
   * Reload schemas from database
   * Call this after seeding new templates
   */
  async reload(): Promise<void> {
    this.schemas.clear();
    this.isInitialized = false;
    await this.initialize();
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

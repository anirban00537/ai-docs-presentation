/**
 * Export Templates Script
 *
 * This script runs in the frontend context and exports template data
 * Run with: npx tsx scripts/export-templates.ts
 */

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Import all templates from the central registry
import { layoutTemplates } from "../src/app/(protected)/presentation/[id]/editor/utils/layoutTemplates";

/**
 * Normalize IDs to be deterministic
 */
function normalizeRows(rows: any[]): any[] {
  return rows.map((row, rowIndex) => ({
    ...row,
    id: `row-${rowIndex}`,
    blocks: row.blocks.map((block: any, blockIndex: number) => ({
      ...block,
      id: `block-${rowIndex}-${blockIndex}`,
    })),
  }));
}

async function main() {
  const outputDir = path.join(process.cwd(), "scripts", "template-exports");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const exports: any[] = [];

  for (const template of layoutTemplates) {
    try {
      const rows = template.getRows();
      const normalizedRows = normalizeRows(rows);

      const templateData = {
        id: template.id,
        name: template.name,
        description: template.description,
        icon: template.icon,
        rows: normalizedRows,
        accent: (template as any).accent,
      };

      exports.push(templateData);

      // Write individual JSON file
      const fileName = `${template.id.replace(/-layout$/, "")}.json`;
      const filePath = path.join(outputDir, fileName);
      fs.writeFileSync(
        filePath,
        JSON.stringify(templateData, null, 2),
        "utf-8"
      );

      console.log(`✓ Exported: ${template.id}`);
    } catch (error: any) {
      console.error(`Error exporting ${template.id}:`, error.message);
    }
  }

  // Write combined export
  const combinedPath = path.join(outputDir, "all-templates.json");
  fs.writeFileSync(combinedPath, JSON.stringify(exports, null, 2), "utf-8");

  console.log(`\n✅ Exported ${exports.length} templates to ${outputDir}`);
  console.log(`📦 Combined export: ${combinedPath}`);
}

main().catch(console.error);

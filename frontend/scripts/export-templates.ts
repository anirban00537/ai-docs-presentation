/**
 * Template Export Script
 * 
 * This script imports templates defined in the editor and exports them as JSON
 * for the backend seeding process.
 */
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

// Note: We'll import these dynamically if possible, or define a simplified 
// version if the Next.js environment is too complex to load via tsx.
// For now, let's try a direct approach.

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, "template-exports");

// Simplified mock of nanoid and other browser-only or complex deps if needed
// But tsx should handle most things if we're careful.

async function exportTemplates() {
  console.log("🚀 Exporting templates...");
  
  try {
    // We'll use the already defined templates from the src directory
    // We use dynamic import to avoid some top-level execution issues
    const { templates } = await import("../src/app/(protected)/docs/[id]/editor/templates/index.js");
    
    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write the combined templates file
    fs.writeFileSync(
      path.join(OUTPUT_DIR, "all-templates.json"),
      JSON.stringify(templates, null, 2),
      "utf-8"
    );

    console.log(`✅ Successfully exported ${templates.length} templates!`);
  } catch (error: any) {
    console.error("❌ Error exporting templates:", error.message);
    console.log("Falling back to a standalone export if dependencies are missing...");
    
    // Fallback logic could go here if the direct import fails
    process.exit(1);
  }
}

exportTemplates();

// {
//   "scripts": {
//     "build:sit2": "ng build --configuration sit2 --base-href=/banking/extendedtransactionhistory/sit2/ && node tools/fix-asset-paths.mjs --dist dist/your-app-name --prefix /banking/extendedtransactionhistory/sit2",
//     "build:prod": "ng build --configuration production --base-href=/banking/extendedtransactionhistory/ && node tools/fix-asset-paths.mjs --dist dist/your-app-name --prefix /banking/extendedtransactionhistory"
//   }
// }
import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';


#!/usr/bin/env node
/**
 * Angular post-build step:
 * Prefix every "/asset/" reference in the built index.html and in any files under dist/**/asset/**,
 * using the environment-specific prefix you pass via --prefix.
 *
 * Usage example:
 *   node tools/fix-asset-paths.mjs --dist "dist/YourBuildFolder" --prefix "/banking/extendedtransactionhistory/sit2"
 *
 * Notes:
 * - Safe against double-prefixing: it only rewrites /asset/ that are NOT already prefixed.
 * - Touches only .html and .js files, and only index.html or files inside /asset/ folders.
 */

 
 // ---- helpers ----
 function parseArgs() {
   const args = process.argv.slice(2);
   const opts = {};
   for (let i = 0; i < args.length; i += 2) {
     const k = args[i], v = args[i + 1];
     if (!v) continue;
     if (k === '--dist') opts.dist = v;
     if (k === '--prefix') opts.prefix = v;
   }
   if (!opts.dist || !opts.prefix) {
     console.error('Usage: node tools/fix-asset-paths.mjs --dist "dist/<your-app>" --prefix "/env/prefix"');
     process.exit(2);
   }
   // Normalize: keep a trailing slash ONLY for the root "/" case.
   if (opts.prefix !== '/' && opts.prefix.endsWith('/')) {
     opts.prefix = opts.prefix.slice(0, -1);
   }
   return opts;
 }
 
 async function walk(dir, out = []) {
   const entries = await fs.readdir(dir, { withFileTypes: true });
   for (const e of entries) {
     const p = join(dir, e.name);
     if (e.isDirectory()) {
       await walk(p, out);
     } else {
       out.push(p);
     }
   }
   return out;
 }
 
 function shouldProcess(filePath) {
   const lower = filePath.toLowerCase();
   const isHtmlOrJs = lower.endsWith('.html') || lower.endsWith('.js');
   if (!isHtmlOrJs) return false;
   const isIndexHtml = lower.endsWith('/index.html') || lower.endsWith('\\index.html');
   const inAssetFolder = lower.includes('/asset/') || lower.includes('\\asset\\');
   return isIndexHtml || inAssetFolder;
 }
 
 function escapeRegExp(s) {
   return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
 }
 
 async function rewriteFile(filePath, prefix) {
   const buf = await fs.readFile(filePath);
   const text = buf.toString('utf8');
 
   // Build a safe regex that matches "/asset/" NOT already preceded by the exact prefix.
   // Example: prefix="/banking/x" -> negative lookbehind ensures we don't touch "/banking/x/asset/"
   // Node supports fixed-length lookbehind.
   const escapedPrefix = escapeRegExp(prefix);
   const rx = new RegExp(`(?<!${escapedPrefix})\\/asset\\/`, 'g');
 
   const replaced = text.replace(rx, `${prefix === '/' ? '' : prefix}/asset/`);
 
   if (replaced !== text) {
     await fs.writeFile(filePath, replaced, 'utf8');
     return true;
   }
   return false;
 }
 
 // ---- main ----
 (async function main() {
   try {
     const { dist, prefix } = parseArgs();
     const root = resolve(dist);
     const all = await walk(root);
     const targets = all.filter(shouldProcess);
 
     let changedCount = 0;
     for (const f of targets) {
       if (await rewriteFile(f, prefix)) changedCount++;
     }
 
     // Leave this line if you want confirmation; remove it if you prefer silent mode.
     console.log(`Updated ${changedCount} file(s) under ${root} with prefix "${prefix}/asset/".`);
   } catch (err) {
     console.error('Path rewrite failed:', err?.stack || err);
     process.exit(1);
   }
 })();
 
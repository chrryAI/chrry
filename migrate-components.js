#!/usr/bin/env node

/**
 * Migration Script: Reorganize UI Components
 * 
 * This script moves all root-level component files into their own directories
 * Structure: /ComponentName/ComponentName.tsx (instead of /ComponentName.tsx)
 * Each component folder contains: .tsx, .module.scss, .styles.ts, and docs
 * Creates an index.ts barrel export to maintain existing imports
 */

const fs = require('fs');
const path = require('path');

const UI_DIR = __dirname;

// Component files that should be moved (TSX files at root level)
const COMPONENT_FILES = [
  'A', 'About', 'Account', 'AddToHomeScreen', 'Agent', 'App', 'Bookmark', 'Button',
  'Calendar', 'CalendarExample', 'CharacterProfile', 'CharacterProfiles', 'Chat',
  'Checkbox', 'CitationText', 'Collaborate', 'CollaborationStatus', 'CollaborationTooltip',
  'ColorScheme', 'ConfirmButton', 'CookieConsent', 'DeleteThread', 'DraggableAppItem',
  'DraggableAppList', 'EditThread', 'EmptyStateTips', 'EnableNotifications', 'EnableSound',
  'EventModal', 'Home', 'Image', 'Instructions', 'LanguageSwitcher', 'LifeOS',
  'Loading', 'Logo', 'MarkdownContent', 'MemoryConsent', 'Menu', 'Message', 'Messages',
  'Modal', 'Privacy', 'Providers', 'QuotaDisplay', 'ResponsiveDrawer', 'Search', 'Select',
  'Share', 'Sidebar', 'SignIn', 'Skeleton', 'Star', 'Subscribe', 'Terms', 'Testimonials',
  'TextWithLinks', 'Thread', 'Threads', 'TicTacToe', 'TypingIndicator', 'Users', 'Weather', 'Why'
];

// Files/directories to exclude from migration
const EXCLUDE_DIRS = [
  'node_modules', '__tests__', 'context', 'hooks', 'lib', 'locales', 'platform',
  'primitives', 'schemas', 'styles', 'types', 'utils', 'Img', '.turbo', 'components'
];

const EXCLUDE_FILES = [
  'package.json', 'tsconfig.json', 'eslint.config.mjs',
  'i18n.ts', 'locales.ts', 'selectStyles.ts', 'globals.css', 'globals.scss',
  'globals.d.ts', 'scss-modules.d.ts', 'breakpoints.scss', 'toRem.scss',
  'utils.scss', 'utils.module.scss', 'utils.styles.ts'
];

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${message}${colors.reset}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log(`✓ Created directory: ${path.relative(UI_DIR, dir)}`, 'success');
  }
}

function moveFile(src, dest) {
  if (fs.existsSync(src)) {
    ensureDir(path.dirname(dest));
    fs.renameSync(src, dest);
    log(`  Moved: ${path.basename(src)}`, 'info');
    return true;
  }
  return false;
}

function getRelatedFiles(componentName) {
  const files = [];
  const extensions = [
    '.tsx',
    '.module.scss',
    '.styles.ts',
    '.INTEGRATION.md',
    '.README.md',
    '.example.tsx'
  ];

  extensions.forEach(ext => {
    const filePath = path.join(UI_DIR, `${componentName}${ext}`);
    if (fs.existsSync(filePath)) {
      files.push({
        src: filePath,
        name: `${componentName}${ext}`
      });
    }
  });

  return files;
}


function migrateComponent(componentName) {
  log(`\n📦 Migrating ${componentName}...`, 'info');
  
  const componentDir = path.join(UI_DIR, componentName);
  ensureDir(componentDir);

  const relatedFiles = getRelatedFiles(componentName);
  
  if (relatedFiles.length === 0) {
    log(`  ⚠ No files found for ${componentName}`, 'warning');
    return false;
  }

  let moved = false;
  relatedFiles.forEach(file => {
    const dest = path.join(componentDir, file.name);
    if (moveFile(file.src, dest)) {
      moved = true;
    }
  });

  return moved;
}

function generateIndexFile() {
  log('\n📝 Generating index.ts barrel export...', 'info');
  
  const exports = [];
  
  // Get all component directories at root level
  const items = fs.readdirSync(UI_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .filter(dirent => !EXCLUDE_DIRS.includes(dirent.name))
    .map(dirent => dirent.name)
    .sort();

  items.forEach(componentName => {
    const componentPath = path.join(UI_DIR, componentName);
    const tsxFile = path.join(componentPath, `${componentName}.tsx`);
    
    if (fs.existsSync(tsxFile)) {
      exports.push(`export * from './${componentName}/${componentName}';`);
    }
  });

  // Check which utility directories have index.ts files
  const utilityDirs = ['hooks', 'context', 'lib', 'utils'];
  const availableUtilities = utilityDirs.filter(dir => {
    const indexPath = path.join(UI_DIR, dir, 'index.ts');
    return fs.existsSync(indexPath);
  });

  const utilityExports = availableUtilities.length > 0
    ? `\n// Re-export commonly used utilities and hooks\n${availableUtilities.map(dir => `export * from './${dir}';`).join('\n')}`
    : '';

  const indexContent = `/**
 * UI Components Barrel Export
 * 
 * This file exports all components from their individual directories.
 * Maintains backward compatibility with existing imports.
 * 
 * Usage:
 *   import { Button, Modal, Chat } from 'chrry'
 * 
 * Auto-generated by migrate-components.js
 */

${exports.join('\n')}${utilityExports}
`;

  const indexPath = path.join(UI_DIR, 'index.ts');
  fs.writeFileSync(indexPath, indexContent);
  log(`✓ Created ${path.relative(UI_DIR, indexPath)}`, 'success');
  log(`  Exported ${exports.length} components`, 'success');
  if (availableUtilities.length > 0) {
    log(`  Re-exported utilities: ${availableUtilities.join(', ')}`, 'success');
  }
}


function printSummary(migratedCount) {
  log('\n' + '='.repeat(60), 'info');
  log('Migration Summary', 'success');
  log('='.repeat(60), 'info');
  log(`✓ Components migrated: ${migratedCount}`, 'success');
  log(`✓ Each component now has its own directory at root level`, 'success');
  log(`✓ Barrel export created: index.ts`, 'success');
  log('\n📋 Next Steps:', 'info');
  log('  1. Review the migrated components', 'info');
  log('  2. Test that all imports still work', 'info');
  log('  3. Commit the changes', 'info');
  log('\n✨ Migration complete!', 'success');
  log('='.repeat(60) + '\n', 'info');
}

function main() {
  // Check if test mode is enabled
  const testMode = process.argv.includes('--test');
  const testComponents = testMode ? [
    'Button', 'Modal', 'Loading', 'Logo', 'Search', 
    'Select', 'Checkbox', 'Skeleton', 'Star', 'Bookmark'
  ] : null;

  log('\n🚀 Starting UI Components Migration\n', 'success');
  
  if (testMode) {
    log(`🧪 TEST MODE: Migrating ${testComponents.length} components\n`, 'warning');
    log(`   Components: ${testComponents.join(', ')}\n`, 'info');
  }
  
  log('This script will:', 'info');
  log('  • Create component directories at root level', 'info');
  log('  • Move component files to their own folders', 'info');
  log('  • Move associated styles and documentation', 'info');
  log('  • Generate barrel export (index.ts)', 'info');
  log('  • Maintain backward compatibility\n', 'info');

  // Migrate components
  let migratedCount = 0;
  
  if (testMode && testComponents) {
    // Test mode: only migrate test components
    testComponents.forEach(componentName => {
      if (migrateComponent(componentName)) {
        migratedCount++;
      }
    });
  } else {
    // Full migration: migrate all components
    COMPONENT_FILES.forEach(componentName => {
      if (migrateComponent(componentName)) {
        migratedCount++;
      }
    });
  }

  // Generate barrel export
  if (migratedCount > 0) {
    generateIndexFile();
  }

  // Print summary
  printSummary(migratedCount);
  
  if (testMode) {
    log('\n💡 Test complete! Review the migrated folders and index.ts', 'info');
    log('   If everything looks good, run without --test flag:', 'info');
    log('   node migrate-components.js\n', 'info');
  }
}

// Run the migration
try {
  main();
} catch (error) {
  log(`\n❌ Migration failed: ${error.message}`, 'error');
  console.error(error);
  process.exit(1);
}

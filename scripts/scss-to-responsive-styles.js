#!/usr/bin/env node

/**
 * Convert SCSS with media queries to responsive style definitions
 * 
 * Usage: node scss-to-responsive-styles.js <input.scss>
 * 
 * Converts:
 * .title {
 *   fontSize: 20px;
 *   @media (min-width: 600px) {
 *     fontSize: 24px;
 *   }
 * }
 * 
 * To:
 * title: {
 *   fontSize: { base: 20, mobile: 24 }
 * }
 */

const fs = require('fs')
const path = require('path')

// Breakpoint mappings from breakpoints.scss
const BREAKPOINTS = {
  320: 'mobileSmallMax',
  430: 'mobileSmall', 
  599: 'mobileMax',
  600: 'mobile',
  800: 'tablet',
  960: 'desktop',
}

function parseScssToResponsiveStyles(scssContent) {
  const styles = {}
  
  // Remove comments
  scssContent = scssContent.replace(/\/\*[\s\S]*?\*\//g, '')
  scssContent = scssContent.replace(/\/\/.*/g, '')
  
  // Match class definitions with nested media queries
  const classRegex = /\.(\w+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g
  
  let match
  while ((match = classRegex.exec(scssContent)) !== null) {
    const className = match[1]
    const classBody = match[2]
    
    const styleObj = {}
    
    // Extract base properties (non-media query)
    const baseProps = classBody.replace(/@media[^}]*\{[^}]*\}/g, '')
    parseProperties(baseProps, styleObj, 'base')
    
    // Extract media query properties
    const mediaRegex = /@media\s*\(min-width:\s*(\d+)(?:px|rem)?\)\s*\{([^}]*)\}/g
    let mediaMatch
    while ((mediaMatch = mediaRegex.exec(classBody)) !== null) {
      const width = parseInt(mediaMatch[1])
      const breakpoint = BREAKPOINTS[width] || `custom${width}`
      const mediaProps = mediaMatch[2]
      parseProperties(mediaProps, styleObj, breakpoint)
    }
    
    styles[className] = styleObj
  }
  
  return styles
}

function parseProperties(propsString, styleObj, breakpoint) {
  // Match property: value pairs
  const propRegex = /(\w+):\s*([^;]+);/g
  let match
  
  while ((match = propRegex.exec(propsString)) !== null) {
    const prop = match[1]
    let value = match[2].trim()
    
    // Convert CSS property names to camelCase
    const camelProp = prop.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
    
    // Parse value
    value = parseValue(value)
    
    // Handle responsive values
    if (breakpoint === 'base') {
      styleObj[camelProp] = value
    } else {
      // Convert to responsive object
      if (typeof styleObj[camelProp] !== 'object' || styleObj[camelProp] === null) {
        const baseValue = styleObj[camelProp]
        styleObj[camelProp] = { base: baseValue }
      }
      styleObj[camelProp][breakpoint] = value
    }
  }
}

function parseValue(value) {
  // Remove quotes
  value = value.replace(/['"]/g, '')
  
  // Convert px to numbers
  if (value.endsWith('px')) {
    return parseInt(value)
  }
  
  // Convert rem to numbers (assuming 16px base)
  if (value.endsWith('rem')) {
    return Math.round(parseFloat(value) * 16)
  }
  
  // Keep CSS variables as strings
  if (value.includes('var(--')) {
    return value
  }
  
  // Convert numbers
  if (!isNaN(value)) {
    return parseFloat(value)
  }
  
  // Keep as string
  return value
}

function generateTypeScriptOutput(styles) {
  let output = `/**
 * Auto-generated responsive styles with breakpoint support
 * Generated: ${new Date().toISOString()}
 */

export const StyleDefs = {\n`
  
  for (const [className, props] of Object.entries(styles)) {
    output += `  ${className}: {\n`
    for (const [prop, value] of Object.entries(props)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Responsive value
        output += `    ${prop}: { `
        output += Object.entries(value)
          .map(([bp, val]) => `${bp}: ${JSON.stringify(val)}`)
          .join(', ')
        output += ` },\n`
      } else {
        output += `    ${prop}: ${JSON.stringify(value)},\n`
      }
    }
    output += `  },\n`
  }
  
  output += `} as const\n\n`
  output += `import { createUnifiedStyles } from "./styles/createUnifiedStyles"\n`
  output += `import { createStyleHook } from "./styles/createStyleHook"\n\n`
  output += `export const Styles = createUnifiedStyles(StyleDefs)\n\n`
  output += `type StylesHook = {\n`
  output += `  [K in keyof typeof StyleDefs]: {\n`
  output += `    className?: string\n`
  output += `    style?: Record<string, any>\n`
  output += `  }\n`
  output += `}\n\n`
  output += `export const useStyles = createStyleHook<StylesHook>(Styles)\n`
  
  return output
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2)
  if (args.length === 0) {
    console.error('Usage: node scss-to-responsive-styles.js <input.scss>')
    process.exit(1)
  }
  
  const inputFile = args[0]
  const scssContent = fs.readFileSync(inputFile, 'utf8')
  const styles = parseScssToResponsiveStyles(scssContent)
  const output = generateTypeScriptOutput(styles)
  
  const outputFile = inputFile.replace('.scss', '.styles.ts')
  fs.writeFileSync(outputFile, output)
  
  console.log(`✅ Generated ${outputFile}`)
  console.log(`   Found ${Object.keys(styles).length} style definitions`)
}

module.exports = { parseScssToResponsiveStyles, generateTypeScriptOutput }

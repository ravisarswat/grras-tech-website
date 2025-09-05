#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting production build with pre-rendering...');

try {
  // Step 1: Standard React build
  console.log('📦 Building React app...');
  execSync('CI=false react-scripts build', { stdio: 'inherit' });
  
  // Step 2: Generate sitemap
  console.log('🗺️ Generating sitemap...');
  execSync('node generate-sitemap.js', { stdio: 'inherit' });
  
  // Step 3: Try react-snap for pre-rendering
  console.log('⚡ Attempting pre-rendering with react-snap...');
  
  try {
    execSync('react-snap', { stdio: 'inherit' });
    console.log('✅ React-snap pre-rendering completed successfully!');
  } catch (snapError) {
    console.log('⚠️ React-snap failed (expected in some environments), using fallback...');
    
    // Fallback: Run our custom static generation
    console.log('🔄 Running fallback static generation...');
    execSync('node scripts/generate-static-pages.js', { stdio: 'inherit' });
  }
  
  // Step 4: Verify build
  console.log('🔍 Verifying build...');
  const buildExists = fs.existsSync(path.join(__dirname, '../build'));
  const indexExists = fs.existsSync(path.join(__dirname, '../build/index.html'));
  
  if (buildExists && indexExists) {
    console.log('✅ Build verification successful!');
    
    // Check if pre-rendering worked
    const indexContent = fs.readFileSync(path.join(__dirname, '../build/index.html'), 'utf8');
    if (indexContent.includes('<h1>GRRAS Solutions Training Institute</h1>')) {
      console.log('✅ Pre-rendering verification successful!');
    } else {
      console.log('⚠️ Pre-rendering content not detected in index.html');
    }
  } else {
    console.log('❌ Build verification failed!');
    process.exit(1);
  }
  
  console.log('🎉 Production build completed successfully!');
  
} catch (error) {
  console.error('❌ Production build failed:', error.message);
  process.exit(1);
}
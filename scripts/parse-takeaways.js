const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOC_PATH = path.join(__dirname, '..', '..', 'B-2 Residential Remodeling Contractor License Exam Prep Outline.docx');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'lesson-takeaways.json');

async function parseTakeaways() {
  console.log('Reading document:', DOC_PATH);
  
  const result = await mammoth.extractRawText({ path: DOC_PATH });
  const text = result.value;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const lessonTakeaways = {};
  let currentModule = null;
  let currentSection = null;
  let currentLessonKey = null;
  let inTakeawaysSection = false;
  let currentTakeaways = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect Module – Section headers
    const moduleSectionMatch = line.match(/Module\s+(\d+)\s*[–-]\s*Section\s+(\d+)[:\s]*(.+)/i);
    if (moduleSectionMatch) {
      // Save previous takeaways if exists
      if (currentLessonKey && currentTakeaways.length > 0) {
        lessonTakeaways[currentLessonKey] = currentTakeaways;
        console.log(`  Saved ${currentTakeaways.length} takeaways for ${currentLessonKey}`);
      }
      
      currentModule = parseInt(moduleSectionMatch[1]);
      currentSection = parseInt(moduleSectionMatch[2]);
      currentLessonKey = `m${currentModule}-s${currentSection}`;
      currentTakeaways = [];
      inTakeawaysSection = false;
      continue;
    }
    
    // Detect Key Takeaways header (multiple formats)
    if (line === 'Key Takeaways:' || line.includes('Key Takeaways')) {
      inTakeawaysSection = true;
      continue;
    }
    
    // Handle "Reading Handout – Key Takeaways" format (single paragraph)
    if (line.startsWith('Reading Handout') && line.includes('Key Takeaways')) {
      inTakeawaysSection = true;
      continue;
    }
    
    // Detect end of takeaways section (next Module, Quiz, Reading Handout, Practice Exam, etc.)
    if (inTakeawaysSection) {
      if (line.match(/^Module\s+\d+/i) || 
          line === 'Quiz' || 
          line.includes('Practice Exam') ||
          line.includes('B-2 Practice Questions') ||
          line.includes('Law & Business Practice Questions')) {
        // Save current takeaways
        if (currentLessonKey && currentTakeaways.length > 0) {
          lessonTakeaways[currentLessonKey] = currentTakeaways;
          console.log(`  Saved ${currentTakeaways.length} takeaways for ${currentLessonKey}`);
        }
        currentTakeaways = [];
        inTakeawaysSection = false;
        continue;
      }
      
      // Skip empty lines and reference URLs
      if (line.startsWith('http') || line.startsWith('Articles') || line.startsWith('References')) {
        continue;
      }
      
      // Add takeaway point
      if (line.length > 10) {
        currentTakeaways.push(line);
      }
    }
  }
  
  // Save last takeaways
  if (currentLessonKey && currentTakeaways.length > 0) {
    lessonTakeaways[currentLessonKey] = currentTakeaways;
    console.log(`  Saved ${currentTakeaways.length} takeaways for ${currentLessonKey}`);
  }
  
  // Write output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(lessonTakeaways, null, 2));
  console.log(`\nWritten to ${OUTPUT_PATH}`);
  
  // Summary
  const totalTakeaways = Object.values(lessonTakeaways).reduce((sum, t) => sum + t.length, 0);
  console.log(`\n=== Summary ===`);
  console.log(`Total lessons with takeaways: ${Object.keys(lessonTakeaways).length}`);
  console.log(`Total takeaway points: ${totalTakeaways}`);
  
  Object.entries(lessonTakeaways).forEach(([key, takeaways]) => {
    console.log(`  ${key}: ${takeaways.length} points`);
  });
}

parseTakeaways().catch(console.error);

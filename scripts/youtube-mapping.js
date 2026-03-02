const fs = require('fs');
const path = require('path');

const LESSONS_PATH = path.join(__dirname, '..', 'src', 'data', 'lessons.json');
const MAPPING_PATH = path.join(__dirname, 'youtube-ids.json');

// Generate a template mapping file for user to fill in
function generateMappingTemplate() {
  const lessonsData = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf-8'));
  const mapping = {};

  lessonsData.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      // Extract just the filename for easier reference
      const filename = lesson.videoPath.split('/').pop().replace('.mp4', '');
      mapping[lesson.id] = {
        title: lesson.title,
        filename: filename,
        youtubeId: "" // User fills this in
      };
    });
  });

  fs.writeFileSync(MAPPING_PATH, JSON.stringify(mapping, null, 2));
  console.log(`Generated YouTube mapping template at: ${MAPPING_PATH}`);
  console.log(`\nTotal lessons to map: ${Object.keys(mapping).length}`);
  console.log('\nInstructions:');
  console.log('1. Open youtube-ids.json');
  console.log('2. For each lesson, add the YouTube video ID');
  console.log('   (The ID is the part after "v=" in the YouTube URL)');
  console.log('   Example: https://youtube.com/watch?v=ABC123xyz -> "ABC123xyz"');
  console.log('3. Save the file');
  console.log('4. Run: node scripts/apply-youtube-ids.js');
}

generateMappingTemplate();

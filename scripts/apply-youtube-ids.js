const fs = require('fs');
const path = require('path');

const LESSONS_PATH = path.join(__dirname, '..', 'src', 'data', 'lessons.json');
const MAPPING_PATH = path.join(__dirname, 'youtube-ids.json');

// Apply YouTube IDs from mapping file to lessons.json
function applyYouTubeIds() {
  if (!fs.existsSync(MAPPING_PATH)) {
    console.error('Error: youtube-ids.json not found!');
    console.log('Run "node scripts/youtube-mapping.js" first to generate the template.');
    process.exit(1);
  }

  const mapping = JSON.parse(fs.readFileSync(MAPPING_PATH, 'utf-8'));
  const lessonsData = JSON.parse(fs.readFileSync(LESSONS_PATH, 'utf-8'));

  let updated = 0;
  let missing = 0;

  lessonsData.modules.forEach(module => {
    module.lessons.forEach(lesson => {
      if (mapping[lesson.id] && mapping[lesson.id].youtubeId) {
        lesson.youtubeId = mapping[lesson.id].youtubeId;
        updated++;
      } else {
        missing++;
        console.log(`Missing YouTube ID for: ${lesson.id} - ${lesson.title}`);
      }
    });
  });

  fs.writeFileSync(LESSONS_PATH, JSON.stringify(lessonsData, null, 2));
  
  console.log(`\n=== Summary ===`);
  console.log(`Updated: ${updated} lessons with YouTube IDs`);
  console.log(`Missing: ${missing} lessons still need YouTube IDs`);
  
  if (missing === 0) {
    console.log('\n✅ All lessons have YouTube IDs! Ready to deploy.');
  }
}

applyYouTubeIds();

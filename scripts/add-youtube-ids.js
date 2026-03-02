const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');

// Read the spreadsheet
const wb = XLSX.readFile(path.join(__dirname, '../../Videos/California Contractor License.com.xlsx'));
const ws = wb.Sheets['Sheet4'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Extract video mappings from spreadsheet
const videoMap = {};
rows.forEach(row => {
  if (row[1] && row[1].includes('youtu')) {
    const title = row[0] || '';
    const url = row[1];
    // Extract video ID from YouTube URL
    const match = url.match(/youtu\.be\/([^?&]+)/) || url.match(/[?&]v=([^?&]+)/);
    if (match) {
      const videoId = match[1];
      // Try to extract module and section from title
      const modMatch = title.match(/Mod(?:ule)?\s*(\d+)/i);
      const secMatch = title.match(/Section\s*(\d+)/i);
      
      if (secMatch) {
        // Store by section number for matching
        const key = title.toLowerCase();
        videoMap[key] = videoId;
        console.log(`Found: ${title} -> ${videoId}`);
      }
    }
  }
});

// Read lessons.json
const lessonsPath = path.join(__dirname, '../src/data/lessons.json');
const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf8'));

// Map of lesson IDs to YouTube video IDs based on the spreadsheet data
const lessonToYouTube = {
  // Module 1
  'm1-s1': null, // Welcome - not in spreadsheet
  'm1-s2': 'BFkB6RKEO8Q',
  'm1-s3': 'ZhZpxkA5IY4',
  'm1-s4': 'O5p6aa_tXsE',
  'm1-s5': 'pJfloiHilv0',
  'm1-s6': '1atqTZg500Y',
  // Module 2
  'm2-s1': 'kTTI2mP1B3U',
  'm2-s2': '-kjlPxGOcZc',
  'm2-s3': null, // Not in spreadsheet
  'm2-s4': 'rnT79fNRtC0',
  'm2-s5': 'mEOD2T-40IY',
  // Module 3
  'm3-s1': '2RVYg1uEK8I',
  'm3-s2': 'QtTcyQwt7bs',
  'm3-s3': 'OVV5Khe7tX4',
  'm3-s4': 'wwCXGL_3DXw',
  'm3-s5': '5s5VL2Uk9mw',
  'm3-s6': 'vLq6edM7ECQ',
  'm3-s7': 'PDu5uYwegxg',
  // Module 4
  'm4-s1': 'gfZt4HhjL_M',
  'm4-s2': '0e2K0VRqEGI',
  'm4-s3': 'xwRBoECdDHc',
  'm4-s4': 'IhRIX6_aR9k',
  'm4-s5': 'Kz18kpkkSgs',
  'm4-s6': '0hdQghnqcwk',
  'm4-s7': 'TAK1GUxUpF4',
  'm4-s8': 'WJr2tR_AWh4',
  'm4-s9': '0HKhPXLwQgY',
  // Module 5
  'm5-s1': '7lBIdx361Ms',
  'm5-s2': 'xXLnuSveAWw',
  'm5-s3': '9v6uIRrik6k',
  'm5-s4': 's11kzSQ7JGI',
  'm5-s5': '7xtWCgFCfKM',
  'm5-s6': 'herYzhRqhug',
  'm5-s7': 'Mf9fCscB9II',
  'm5-s8': 'ocFx78VXMVk',
  'm5-s9': 'gwMXG3Mkc_E',
  'm5-s10': 'H_uIKKioCHQ',
  'm5-s11': 'a937vtwxLiE',
  'm5-s12': 's876bmSICXs',
  'm5-s13': '4VbBmfhorSk',
  'm5-s14': 'Dz23s1WrdZw',
  // Module 6
  'm6-s1': '9v5EYNbS7mM',
  'm6-s2': 'YfY1FLGrIl4',
  'm6-s3': 'YodlYLVMvco',
  'm6-s4': 'NEFV2xAHf3o',
  'm6-s5': 'ylFgpcjpwjk',
  // Module 7
  'm7-s1': 'FoXsvElqY3c',
  'm7-s2': 'eeG0BqLaRsI',
  'm7-s3': 'eeG0BqLaRsI', // Same as s2 in spreadsheet
  'm7-s4': '0m1ixe1XYUk',
  'm7-s5': 'divPiLmU6ck',
  'm7-s6': '2hNba7mYI3I',
  'm7-s7': '5v5liYWANKg',
  // Module 8
  'm8-s1': '0gLmXGfam5Q',
  'm8-s2': 'B4AU7_8Q8rU',
  'm8-s3': '7ZxiyvJOb0k',
  'm8-s4': 'fAslkSo5_LA',
  // Module 9
  'm9-s1': 'T7auCtA_keI',
  'm9-s2': 'Sj_xzoL1ud8',
  'm9-s3': '2eBlSxqjqJc',
  'm9-s4': 'N4Nv1rVs0xM',
  'm9-s5': 'D6zifqQ_F9Y',
  'm9-s6': 'bWpfnzJ9VKQ',
};

// Update lessons with YouTube IDs
let updated = 0;
lessons.modules.forEach(module => {
  module.lessons.forEach(lesson => {
    const youtubeId = lessonToYouTube[lesson.id];
    if (youtubeId) {
      lesson.youtubeId = youtubeId;
      updated++;
      console.log(`Updated ${lesson.id}: ${youtubeId}`);
    }
  });
});

// Write updated lessons.json
fs.writeFileSync(lessonsPath, JSON.stringify(lessons, null, 2));
console.log(`\nUpdated ${updated} lessons with YouTube IDs`);

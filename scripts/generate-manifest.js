const fs = require('fs');
const path = require('path');

const VIDEOS_DIR = path.join(__dirname, '..', '..', 'Videos');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'lessons.json');

function parseVideoFilename(filename) {
  const match = filename.match(/Module\s*(\d+)\s*[–-]\s*Section\s*(\d+)[_:]\s*(.+)\.mp4/i);
  if (match) {
    return {
      moduleId: parseInt(match[1]),
      sectionId: parseInt(match[2]),
      title: match[3].replace(/_/g, '/').trim()
    };
  }
  
  const altMatch = filename.match(/Section\s*(\d+)[_:]\s*(.+)\.mp4/i);
  if (altMatch) {
    return {
      moduleId: null,
      sectionId: parseInt(altMatch[1]),
      title: altMatch[2].replace(/_/g, '/').trim()
    };
  }
  
  return null;
}

function generateManifest() {
  const files = fs.readdirSync(VIDEOS_DIR).filter(f => f.endsWith('.mp4'));
  
  const modulesMap = new Map();
  const moduleNames = {
    1: 'Getting Started with the B-2 License',
    2: 'Business Formation & Application Process',
    3: 'Construction Math Fundamentals',
    4: 'Law, Safety & Business Operations',
    5: 'Residential Remodeling Techniques',
    6: 'California Building Codes & Standards',
    7: 'Project Management & Estimating',
    8: 'Safety Planning & Hazard Management',
    9: 'Exam Preparation & Final Review'
  };

  const uniqueVideos = new Map();
  
  files.forEach(filename => {
    const parsed = parseVideoFilename(filename);
    if (!parsed || !parsed.moduleId) return;
    
    const key = `m${parsed.moduleId}-s${parsed.sectionId}`;
    if (uniqueVideos.has(key)) return;
    
    uniqueVideos.set(key, {
      id: key,
      title: parsed.title,
      videoPath: `/videos/${filename}`,
      moduleId: parsed.moduleId,
      sectionId: parsed.sectionId
    });
  });

  uniqueVideos.forEach((lesson, key) => {
    const moduleId = lesson.moduleId;
    if (!modulesMap.has(moduleId)) {
      modulesMap.set(moduleId, {
        id: moduleId,
        title: moduleNames[moduleId] || `Module ${moduleId}`,
        lessons: []
      });
    }
    modulesMap.get(moduleId).lessons.push(lesson);
  });

  modulesMap.forEach(module => {
    module.lessons.sort((a, b) => a.sectionId - b.sectionId);
  });

  const modules = Array.from(modulesMap.values()).sort((a, b) => a.id - b.id);

  const manifest = {
    modules,
    quizzes: [
      { id: 'quiz-section-4', title: 'Section 4 Quiz - Law & Safety', moduleId: 4, passingScore: 70, questions: [] },
      { id: 'quiz-section-5', title: 'Section 5 Quiz - Remodeling Techniques', moduleId: 5, passingScore: 70, questions: [] },
      { id: 'quiz-section-6', title: 'Section 6 Quiz - Building Codes', moduleId: 6, passingScore: 70, questions: [] },
      { id: 'quiz-master', title: 'Master Quiz - Comprehensive Review', passingScore: 70, questions: [] }
    ],
    practiceExams: [
      { id: 'law-business-1', title: 'Law & Business Practice Exam 1', type: 'law-business', passingScore: 72, timeLimit: 120, questions: [] },
      { id: 'law-business-2', title: 'Law & Business Practice Exam 2', type: 'law-business', passingScore: 72, timeLimit: 120, questions: [] },
      { id: 'law-business-3', title: 'Law & Business Practice Exam 3', type: 'law-business', passingScore: 72, timeLimit: 120, questions: [] },
      { id: 'law-business-4', title: 'Law & Business Practice Exam 4', type: 'law-business', passingScore: 72, timeLimit: 120, questions: [] },
      { id: 'law-business-5', title: 'Law & Business Practice Exam 5', type: 'law-business', passingScore: 72, timeLimit: 120, questions: [] },
      { id: 'law-business-6', title: 'Law & Business Practice Exam 6', type: 'law-business', passingScore: 72, timeLimit: 120, questions: [] },
      { id: 'trade-1', title: 'B-2 Trade Practice Exam 1', type: 'trade', passingScore: 72, timeLimit: 150, questions: [] },
      { id: 'trade-2', title: 'B-2 Trade Practice Exam 2', type: 'trade', passingScore: 72, timeLimit: 150, questions: [] },
      { id: 'trade-3', title: 'B-2 Trade Practice Exam 3', type: 'trade', passingScore: 72, timeLimit: 150, questions: [] },
      { id: 'trade-4', title: 'B-2 Trade Practice Exam 4', type: 'trade', passingScore: 72, timeLimit: 150, questions: [] },
      { id: 'trade-5', title: 'B-2 Trade Practice Exam 5', type: 'trade', passingScore: 72, timeLimit: 150, questions: [] },
      { id: 'trade-6', title: 'B-2 Trade Practice Exam 6', type: 'trade', passingScore: 72, timeLimit: 150, questions: [] }
    ]
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
  console.log(`Generated manifest with ${modules.length} modules and ${uniqueVideos.size} lessons`);
}

generateManifest();

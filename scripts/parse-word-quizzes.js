const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOC_PATH = path.join(__dirname, '..', '..', 'B-2 Residential Remodeling Contractor License Exam Prep Outline.docx');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'lesson-quizzes.json');

// Map topic sections to module keys
const TOPIC_TO_MODULE = {
  'planning & estimating': 'planning-estimating',
  'job site preparation': 'job-site-prep',
  'core trades remodeling': 'core-trades',
  'finish trades remodeling': 'finish-trades',
  'exterior remodeling': 'exterior',
  'safety': 'safety',
  'business organization': 'law-business-org',
  'business finances': 'law-business-finance',
  'employment requirements': 'law-employment',
  'bonds, insurance': 'law-bonds-insurance',
  'contract requirements': 'law-contracts',
  'licensing law': 'law-licensing',
  'project management': 'law-project-mgmt'
};

// Map topic quizzes to specific lessons based on content relevance
const TOPIC_TO_LESSONS = {
  'planning-estimating': ['m3-s1', 'm3-s2', 'm3-s3', 'm3-s4', 'm3-s5', 'm3-s6', 'm3-s7', 'm7-s1', 'm7-s2', 'm7-s5', 'm7-s7'],
  'job-site-prep': ['m5-s1', 'm5-s2', 'm5-s3', 'm8-s2', 'm8-s3'],
  'core-trades': ['m5-s4', 'm5-s5', 'm5-s6', 'm5-s7', 'm5-s8', 'm5-s9', 'm5-s10'],
  'finish-trades': ['m5-s11', 'm5-s12', 'm5-s13'],
  'exterior': ['m5-s14'],
  'safety': ['m4-s2', 'm4-s3', 'm4-s4', 'm8-s1', 'm8-s2', 'm8-s3', 'm8-s4'],
  'law-business-org': ['m2-s1', 'm2-s2', 'm2-s3', 'm2-s4', 'm2-s5', 'm4-s1'],
  'law-business-finance': ['m4-s6', 'm7-s5', 'm7-s6'],
  'law-employment': ['m4-s7'],
  'law-bonds-insurance': ['m4-s8'],
  'law-contracts': ['m4-s9', 'm7-s3', 'm7-s4'],
  'law-licensing': ['m4-s1', 'm4-s5', 'm6-s5'],
  'public-works': ['m6-s1', 'm6-s2', 'm6-s3', 'm6-s4', 'm8-s4']
};

async function parseDocument() {
  console.log('Reading document:', DOC_PATH);
  
  const result = await mammoth.extractRawText({ path: DOC_PATH });
  const text = result.value;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const lessonQuizzes = {};
  const topicQuizzes = {};
  
  let currentModule = null;
  let currentSection = null;
  let currentLessonKey = null;
  let currentTopicKey = null;
  let inQuizSection = false;
  let inTopicSection = false;
  let currentQuestions = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect Module – Section headers (for per-video quizzes)
    const moduleSectionMatch = line.match(/Module\s+(\d+)\s*[–-]\s*Section\s+(\d+)[:\s]*(.+)/i);
    if (moduleSectionMatch) {
      // Save previous quiz
      if (currentLessonKey && currentQuestions.length > 0) {
        lessonQuizzes[currentLessonKey] = currentQuestions;
      }
      if (currentTopicKey && currentQuestions.length > 0) {
        topicQuizzes[currentTopicKey] = currentQuestions;
      }
      
      currentModule = parseInt(moduleSectionMatch[1]);
      currentSection = parseInt(moduleSectionMatch[2]);
      currentLessonKey = `m${currentModule}-s${currentSection}`;
      currentTopicKey = null;
      currentQuestions = [];
      inQuizSection = false;
      inTopicSection = false;
      continue;
    }
    
    // Detect B-2 Practice Questions or Law & Business Practice Questions headers
    const topicMatch = line.match(/(?:B-2|Law & Business)\s+Practice Questions\s*[–-]\s*(.+)/i);
    if (topicMatch) {
      // Save previous
      if (currentLessonKey && currentQuestions.length > 0) {
        lessonQuizzes[currentLessonKey] = currentQuestions;
      }
      if (currentTopicKey && currentQuestions.length > 0) {
        topicQuizzes[currentTopicKey] = currentQuestions;
      }
      
      const topicName = topicMatch[1].toLowerCase().trim();
      currentTopicKey = null;
      for (const [pattern, key] of Object.entries(TOPIC_TO_MODULE)) {
        if (topicName.includes(pattern)) {
          currentTopicKey = key;
          break;
        }
      }
      if (!currentTopicKey) {
        currentTopicKey = topicName.replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      }
      
      currentLessonKey = null;
      currentQuestions = [];
      inQuizSection = false;
      inTopicSection = true;
      console.log(`Found topic: ${topicMatch[1]} -> ${currentTopicKey}`);
      continue;
    }
    
    // Detect Quiz header (for Module sections)
    if (line.toLowerCase() === 'quiz') {
      inQuizSection = true;
      continue;
    }
    
    // Detect Answer Key (end of topic section)
    if (line.includes('Answer Key:')) {
      if (currentTopicKey && currentQuestions.length > 0) {
        topicQuizzes[currentTopicKey] = currentQuestions;
        console.log(`  Saved ${currentQuestions.length} questions for topic ${currentTopicKey}`);
      }
      currentQuestions = [];
      inTopicSection = false;
      continue;
    }
    
    // Detect end of quiz section
    if (inQuizSection && (line.includes('Reading Handout') || line.includes('Key Takeaways'))) {
      if (currentLessonKey && currentQuestions.length > 0) {
        lessonQuizzes[currentLessonKey] = currentQuestions;
        console.log(`  Saved ${currentQuestions.length} questions for ${currentLessonKey}`);
      }
      currentQuestions = [];
      inQuizSection = false;
      continue;
    }
    
    // Parse questions in Module quiz sections (format: "Question A) opt1 ✅ B) opt2 C) opt3")
    if (inQuizSection && currentLessonKey) {
      const hasUpperOptions = line.includes('A)') && line.includes('B)');
      const hasCheckmark = line.includes('✅');
      
      if (hasUpperOptions && hasCheckmark) {
        const question = parseQuestionLineUpper(line, currentQuestions.length + 1);
        if (question) currentQuestions.push(question);
      }
    }
    
    // Parse questions in topic sections (format: "1. Question a) opt1 b) opt2 ✅ c) opt3 d) opt4")
    if (inTopicSection && currentTopicKey) {
      const numberedQuestion = line.match(/^\d+\.\s+(.+)/);
      const hasLowerOptions = line.includes('a)') && line.includes('b)');
      const hasCheckmark = line.includes('✅');
      
      if (numberedQuestion && hasLowerOptions && hasCheckmark) {
        const question = parseQuestionLineLower(line, currentQuestions.length + 1);
        if (question) currentQuestions.push(question);
      }
    }
  }
  
  // Save any remaining
  if (currentLessonKey && currentQuestions.length > 0) {
    lessonQuizzes[currentLessonKey] = currentQuestions;
  }
  if (currentTopicKey && currentQuestions.length > 0) {
    topicQuizzes[currentTopicKey] = currentQuestions;
  }
  
  // Distribute topic questions to mapped lessons
  const finalQuizzes = { ...lessonQuizzes };
  
  Object.entries(topicQuizzes).forEach(([topicKey, questions]) => {
    const targetLessons = TOPIC_TO_LESSONS[topicKey] || [];
    if (targetLessons.length === 0) {
      console.log(`  Warning: No lesson mapping for topic ${topicKey}`);
      return;
    }
    
    // Initialize arrays for each lesson
    const lessonBuckets = {};
    targetLessons.forEach(id => { lessonBuckets[id] = []; });
    
    // Round-robin distribute questions to ensure all lessons get some
    questions.forEach((q, idx) => {
      const lessonId = targetLessons[idx % targetLessons.length];
      lessonBuckets[lessonId].push(q);
    });
    
    // Add to final quizzes
    Object.entries(lessonBuckets).forEach(([lessonId, qs]) => {
      const lessonQuestions = qs.map((q, i) => ({ ...q, id: `q-${i + 1}` }));
      
      if (lessonQuestions.length > 0) {
        if (!finalQuizzes[lessonId]) {
          finalQuizzes[lessonId] = lessonQuestions;
        } else {
          const merged = [...finalQuizzes[lessonId], ...lessonQuestions];
          finalQuizzes[lessonId] = merged.map((q, i) => ({ ...q, id: `q-${i + 1}` }));
        }
      }
    });
  });
  
  // Add exam prep lessons (Module 9) with mixed questions from all topics
  const allTopicQuestions = Object.values(topicQuizzes).flat();
  const m9Lessons = ['m9-s1', 'm9-s2', 'm9-s3', 'm9-s4', 'm9-s5', 'm9-s6'];
  const questionsPerM9 = Math.ceil(allTopicQuestions.length / m9Lessons.length);
  
  m9Lessons.forEach((lessonId, idx) => {
    const start = idx * questionsPerM9;
    const end = Math.min(start + questionsPerM9, allTopicQuestions.length);
    const lessonQuestions = allTopicQuestions.slice(start, end).map((q, i) => ({
      ...q,
      id: `q-${i + 1}`
    }));
    
    if (!finalQuizzes[lessonId] && lessonQuestions.length > 0) {
      finalQuizzes[lessonId] = lessonQuestions;
    }
  });
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(finalQuizzes, null, 2));
  console.log(`\nWritten to ${OUTPUT_PATH}`);
  
  const totalQuestions = Object.values(finalQuizzes).reduce((sum, qs) => sum + qs.length, 0);
  console.log(`\n=== Summary ===`);
  console.log(`Total lessons with quizzes: ${Object.keys(finalQuizzes).length}`);
  console.log(`Total questions distributed: ${totalQuestions}`);
  
  // Sort and display by module
  const sortedKeys = Object.keys(finalQuizzes).sort((a, b) => {
    const [, am, as] = a.match(/m(\d+)-s(\d+)/) || [null, '99', '99'];
    const [, bm, bs] = b.match(/m(\d+)-s(\d+)/) || [null, '99', '99'];
    return (parseInt(am) * 100 + parseInt(as)) - (parseInt(bm) * 100 + parseInt(bs));
  });
  
  sortedKeys.forEach(key => {
    console.log(`  ${key}: ${finalQuizzes[key].length} questions`);
  });
}

function parseQuestionLineUpper(line, questionNum) {
  const parts = line.split(/\s+(?=[A-D]\))/);
  if (parts.length < 3) return null;
  
  const questionText = parts[0].trim();
  const options = [];
  let correctAnswer = 0;
  
  for (let i = 1; i < parts.length; i++) {
    let optionText = parts[i].replace(/^[A-D]\)\s*/, '').trim();
    if (optionText.includes('✅')) {
      correctAnswer = i - 1;
      optionText = optionText.replace('✅', '').trim();
    }
    options.push(optionText);
  }
  
  if (options.length < 2) return null;
  
  return { id: `q-${questionNum}`, question: questionText, options, correctAnswer, explanation: '' };
}

function parseQuestionLineLower(line, questionNum) {
  // Remove leading number
  let cleanLine = line.replace(/^\d+\.\s*/, '');
  
  // Split by a) b) c) d)
  const parts = cleanLine.split(/\s+(?=[a-d]\))/);
  if (parts.length < 3) return null;
  
  const questionText = parts[0].trim();
  const options = [];
  let correctAnswer = 0;
  
  for (let i = 1; i < parts.length; i++) {
    let optionText = parts[i].replace(/^[a-d]\)\s*/, '').trim();
    if (optionText.includes('✅')) {
      correctAnswer = i - 1;
      optionText = optionText.replace('✅', '').trim();
    }
    options.push(optionText);
  }
  
  if (options.length < 2) return null;
  
  return { id: `q-${questionNum}`, question: questionText, options, correctAnswer, explanation: '' };
}

parseDocument().catch(console.error);

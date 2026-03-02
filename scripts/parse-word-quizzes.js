const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

const DOC_PATH = path.join(__dirname, '..', '..', 'B-2 Residential Remodeling Contractor License Exam Prep Outline.docx');
const OUTPUT_PATH = path.join(__dirname, '..', 'src', 'data', 'lesson-quizzes.json');

async function parseDocument() {
  console.log('Reading document:', DOC_PATH);
  
  const result = await mammoth.extractRawText({ path: DOC_PATH });
  const text = result.value;
  
  const lines = text.split('\n').map(l => l.trim()).filter(l => l);
  
  const lessonQuizzes = {};
  let currentLessonKey = null;
  let inQuizSection = false;
  let inThinkificQuiz = false;
  let currentQuestions = [];
  let pendingQuestion = null;
  let pendingOptions = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Detect Module – Section headers
    const moduleSectionMatch = line.match(/Module\s+(\d+)\s*[–-]\s*Section\s+(\d+)[:\s]*(.+)/i);
    if (moduleSectionMatch) {
      // Save previous quiz
      if (currentLessonKey && currentQuestions.length > 0) {
        lessonQuizzes[currentLessonKey] = currentQuestions;
        console.log(`  Saved ${currentQuestions.length} questions for ${currentLessonKey}`);
      }
      
      const moduleNum = parseInt(moduleSectionMatch[1]);
      const sectionNum = parseInt(moduleSectionMatch[2]);
      currentLessonKey = `m${moduleNum}-s${sectionNum}`;
      currentQuestions = [];
      inQuizSection = false;
      inThinkificQuiz = false;
      pendingQuestion = null;
      pendingOptions = [];
      continue;
    }
    
    // Detect Quiz header (Module 1 format)
    if (line === 'Quiz') {
      inQuizSection = true;
      inThinkificQuiz = false;
      continue;
    }
    
    // Detect Thinkific Quiz format header (multiple variations)
    if (line.includes('Quiz (Thinkific') || line.includes('Quiz – Thinkific') || line.includes('Quiz - Thinkific') || line.includes('Thinkific-Compatible Quiz') || line.includes('Thinkific Quiz')) {
      inQuizSection = true;
      inThinkificQuiz = true;
      continue;
    }
    
    // Detect end of quiz section
    if (inQuizSection && (line.includes('Reading Handout') || line.includes('Key Takeaways') || line.match(/^Module\s+\d+\s*[–-]/))) {
      // Save pending Thinkific question
      if (pendingQuestion && pendingOptions.length >= 2) {
        const correctIdx = pendingOptions.findIndex(o => o.startsWith('*'));
        const cleanOptions = pendingOptions.map(o => o.replace(/^\*/, '').trim());
        currentQuestions.push({
          id: `q-${currentQuestions.length + 1}`,
          question: pendingQuestion,
          options: cleanOptions,
          correctAnswer: correctIdx >= 0 ? correctIdx : 0,
          explanation: ''
        });
      }
      
      if (currentLessonKey && currentQuestions.length > 0) {
        lessonQuizzes[currentLessonKey] = currentQuestions;
        console.log(`  Saved ${currentQuestions.length} questions for ${currentLessonKey}`);
      }
      currentQuestions = [];
      inQuizSection = false;
      inThinkificQuiz = false;
      pendingQuestion = null;
      pendingOptions = [];
      continue;
    }
    
    // Parse Module 1 format: "Question A) opt1 ✅ B) opt2 C) opt3"
    if (inQuizSection && !inThinkificQuiz && currentLessonKey) {
      const hasUpperOptions = line.includes('A)') && line.includes('B)');
      const hasCheckmark = line.includes('✅');
      
      if (hasUpperOptions && hasCheckmark) {
        const question = parseQuestionLineUpper(line, currentQuestions.length + 1);
        if (question) currentQuestions.push(question);
      }
    }
    
    // Parse Thinkific format: SA rows with * for correct
    if (inThinkificQuiz && currentLessonKey) {
      // Skip header rows
      if (line === 'Question Type' || line === 'Question Text' || line.startsWith('Answer Choice')) {
        continue;
      }
      
      // SA marker indicates new question coming
      if (line === 'SA') {
        // Save previous question if exists
        if (pendingQuestion && pendingOptions.length >= 2) {
          const correctIdx = pendingOptions.findIndex(o => o.startsWith('*'));
          const cleanOptions = pendingOptions.map(o => o.replace(/^\*/, '').trim());
          currentQuestions.push({
            id: `q-${currentQuestions.length + 1}`,
            question: pendingQuestion,
            options: cleanOptions,
            correctAnswer: correctIdx >= 0 ? correctIdx : 0,
            explanation: ''
          });
        }
        pendingQuestion = null;
        pendingOptions = [];
        continue;
      }
      
      // After SA, next line is the question
      if (pendingQuestion === null && pendingOptions.length === 0) {
        pendingQuestion = line;
        continue;
      }
      
      // Following lines are options (up to 3-4)
      if (pendingQuestion && pendingOptions.length < 4) {
        pendingOptions.push(line);
      }
    }
  }
  
  // Save any remaining
  if (pendingQuestion && pendingOptions.length >= 2) {
    const correctIdx = pendingOptions.findIndex(o => o.startsWith('*'));
    const cleanOptions = pendingOptions.map(o => o.replace(/^\*/, '').trim());
    currentQuestions.push({
      id: `q-${currentQuestions.length + 1}`,
      question: pendingQuestion,
      options: cleanOptions,
      correctAnswer: correctIdx >= 0 ? correctIdx : 0,
      explanation: ''
    });
  }
  
  if (currentLessonKey && currentQuestions.length > 0) {
    lessonQuizzes[currentLessonKey] = currentQuestions;
    console.log(`  Saved ${currentQuestions.length} questions for ${currentLessonKey}`);
  }
  
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(lessonQuizzes, null, 2));
  console.log(`\nWritten to ${OUTPUT_PATH}`);
  
  const totalQuestions = Object.values(lessonQuizzes).reduce((sum, qs) => sum + qs.length, 0);
  console.log(`\n=== Summary ===`);
  console.log(`Total lessons with quizzes: ${Object.keys(lessonQuizzes).length}`);
  console.log(`Total questions: ${totalQuestions}`);
  
  // Sort and display by module
  const sortedKeys = Object.keys(lessonQuizzes).sort((a, b) => {
    const [, am, as] = a.match(/m(\d+)-s(\d+)/) || [null, '99', '99'];
    const [, bm, bs] = b.match(/m(\d+)-s(\d+)/) || [null, '99', '99'];
    return (parseInt(am) * 100 + parseInt(as)) - (parseInt(bm) * 100 + parseInt(bs));
  });
  
  sortedKeys.forEach(key => {
    console.log(`  ${key}: ${lessonQuizzes[key].length} questions`);
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

parseDocument().catch(console.error);

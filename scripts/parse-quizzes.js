const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const QUIZ_DIR = path.join(__dirname, '..', '..', 'Quiz');
const EXAM_DIR = path.join(__dirname, '..', '..', 'Practice Exams');
const OUTPUT_QUIZZES = path.join(__dirname, '..', 'src', 'data', 'quizzes.json');
const OUTPUT_EXAMS = path.join(__dirname, '..', 'src', 'data', 'practice-exams.json');

function parseExcelFile(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    // Look for QUESTIONS sheet first
    let sheetName = workbook.SheetNames.find(s => s.toUpperCase() === 'QUESTIONS') || workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    return data;
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err.message);
    return [];
  }
}

function extractQuestions(data, prefix = 'q') {
  const questions = [];
  
  // Skip header row, process each question row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length < 5) continue;

    // Format: QuestionType, QuestionText, Explanation, Choice1, Choice2, Choice3, Choice4
    const questionText = String(row[1] || '').trim();
    const explanation = String(row[2] || '').trim();
    const choices = [row[3], row[4], row[5], row[6]].filter(c => c != null);
    
    if (!questionText || choices.length < 2) continue;

    // Find correct answer (marked with *)
    let correctAnswer = 0;
    const options = choices.map((choice, idx) => {
      let text = String(choice).trim();
      if (text.startsWith('*')) {
        correctAnswer = idx;
        text = text.substring(1).trim();
      }
      return text;
    });

    questions.push({
      id: `${prefix}-${i}`,
      question: questionText,
      options: options,
      correctAnswer: correctAnswer,
      explanation: explanation || ''
    });
  }

  return questions;
}

function processQuizFiles() {
  const quizFiles = fs.readdirSync(QUIZ_DIR).filter(f => f.endsWith('.xlsx'));
  const allQuizzes = {};

  quizFiles.forEach(file => {
    console.log(`Processing quiz: ${file}`);
    const filePath = path.join(QUIZ_DIR, file);
    const data = parseExcelFile(filePath);
    
    // Determine quiz key from filename
    let key = 'general';
    if (file.toLowerCase().includes('section 4')) key = 'section4';
    else if (file.toLowerCase().includes('section 5')) key = 'section5';
    else if (file.toLowerCase().includes('section 6')) key = 'section6';
    else if (file.toLowerCase().includes('master')) key = 'master';
    else if (file.toLowerCase().includes('law')) key = 'lawBusiness';
    else if (file.toLowerCase().includes('trade')) key = 'trade';

    const questions = extractQuestions(data);
    console.log(`  Found ${questions.length} questions`);
    
    if (!allQuizzes[key]) {
      allQuizzes[key] = [];
    }
    allQuizzes[key].push(...questions);
  });

  return allQuizzes;
}

function processExamFiles() {
  const examFiles = fs.readdirSync(EXAM_DIR).filter(f => f.endsWith('.xlsx'));
  const allExams = {};

  examFiles.forEach(file => {
    console.log(`Processing exam: ${file}`);
    const filePath = path.join(EXAM_DIR, file);
    const data = parseExcelFile(filePath);
    
    // Determine exam key from filename
    let examType = 'law-business';
    let examNum = 1;
    
    if (file.toLowerCase().includes('trade')) {
      examType = 'trade';
    }
    
    // Match "Exam X" pattern to get the correct exam number
    const numMatch = file.match(/Exam\s*(\d+)/i);
    if (numMatch) {
      examNum = parseInt(numMatch[1]);
    }

    const key = `${examType}-${examNum}`;
    const questions = extractQuestions(data);
    console.log(`  Found ${questions.length} questions`);
    
    allExams[key] = questions;
  });

  return allExams;
}

// Run the parser
console.log('=== Parsing Quiz Files ===');
const quizzes = processQuizFiles();
fs.writeFileSync(OUTPUT_QUIZZES, JSON.stringify(quizzes, null, 2));
console.log(`\nWritten to ${OUTPUT_QUIZZES}`);

console.log('\n=== Parsing Practice Exam Files ===');
const exams = processExamFiles();
fs.writeFileSync(OUTPUT_EXAMS, JSON.stringify(exams, null, 2));
console.log(`\nWritten to ${OUTPUT_EXAMS}`);

// Print summary
console.log('\n=== Summary ===');
Object.entries(quizzes).forEach(([key, qs]) => {
  console.log(`Quiz ${key}: ${qs.length} questions`);
});
Object.entries(exams).forEach(([key, qs]) => {
  console.log(`Exam ${key}: ${qs.length} questions`);
});

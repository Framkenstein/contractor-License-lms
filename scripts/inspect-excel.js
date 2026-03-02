const XLSX = require('xlsx');
const path = require('path');

const files = [
  path.join(__dirname, '..', '..', 'Quiz', 'Section 4 Quiz.xlsx'),
  path.join(__dirname, '..', '..', 'Practice Exams', 'B2 Law and Business Exam 1.xlsx'),
];

files.forEach(filePath => {
  console.log(`\n=== ${path.basename(filePath)} ===`);
  try {
    const workbook = XLSX.readFile(filePath);
    console.log('Sheets:', workbook.SheetNames);
    
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    console.log(`Total rows: ${data.length}`);
    console.log('\nFirst 20 rows:');
    data.slice(0, 20).forEach((row, i) => {
      console.log(`Row ${i}: ${JSON.stringify(row)}`);
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
});

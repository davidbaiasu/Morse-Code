const storedExamResult = sessionStorage.getItem('examResult');
const parsedExamResult = storedExamResult ? JSON.parse(storedExamResult) : null;

const scoreValueElement = document.getElementById('scoreValue');

if (parsedExamResult) {
	scoreValueElement.textContent = `${parsedExamResult.correctAnswers}/${parsedExamResult.totalQuestions}`;
} else {
	scoreValueElement.textContent = '0/0';
}
let currentValue = 10;
const minValue = 5;
const maxValue = 25;
const step = 5;

const numberValue = document.getElementById('numberValue');
const decreaseBtn = document.getElementById('decreaseBtn');
const increaseBtn = document.getElementById('increaseBtn');

decreaseBtn.addEventListener('click', () => {
  if (currentValue > minValue) {
    currentValue -= step;
    numberValue.textContent = currentValue;
  }
});

increaseBtn.addEventListener('click', () => {
  if (currentValue < maxValue) {
    currentValue += step;
    numberValue.textContent = currentValue;
  }
});

const startExamLink = document.getElementById('startExamLink');

startExamLink.addEventListener('click', (event) => {
  event.preventDefault();

  const questionType = document.querySelector('input[name="questionType"]:checked')?.value;
  const examType = document.querySelector('input[name="examType"]:checked')?.value;
  const problems = currentValue;

  const examConfig = {
    problems,
    questionType,
    examType
  };

  sessionStorage.setItem('examConfig', JSON.stringify(examConfig));

  const params = new URLSearchParams({
    problems: String(problems),
    questionType,
    examType
  });

  window.location.href = `../examSession/examSession.html?${params.toString()}`;
});

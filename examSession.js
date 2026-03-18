const params = new URLSearchParams(window.location.search);

const storedConfig = sessionStorage.getItem('examConfig');
const parsedStoredConfig = storedConfig ? JSON.parse(storedConfig) : null;

const examConfig = {
	problems: Number(params.get('problems') || parsedStoredConfig?.problems || 10),
	questionType: params.get('questionType') || parsedStoredConfig?.questionType || 'encode',
	examType: params.get('examType') || parsedStoredConfig?.examType || 'quiz'
};

const questionNumberElement = document.getElementById('questionNumber');
const questionPromptElement = document.getElementById('questionPrompt');
const questionTranslationElement = document.getElementById('questionTranslation');
const quizOptionsElement = document.getElementById('quizOptions');
const typeAnswerContainerElement = document.getElementById('typeAnswerContainer');
const typeAnswerInputElement = document.getElementById('typeAnswerInput');
const typeAnswerSubmitSimpleElement = document.getElementById('typeAnswerSubmitSimple');
const appendDotButtonElement = document.getElementById('appendDotButton');
const appendDashButtonElement = document.getElementById('appendDashButton');
const clearTypeButtonElement = document.getElementById('clearTypeButton');
const typeAnswerSubmitElement = document.getElementById('typeAnswerSubmit');
const availableCharacters = Object.keys(charToMorse);
const availableMorseCodes = Object.values(charToMorse);
let currentQuestionIndex = 0;
let correctAnswersCount = 0;

function isEncodeTypeMode() {
	return examConfig.questionType === 'encode' && examConfig.examType === 'type';
}

function isDecodeTypeMode() {
	return examConfig.questionType === 'decode' && examConfig.examType === 'type';
}

function isTypeInputMode() {
	return examConfig.examType === 'type';
}

function shuffleArray(items) {
	const shuffledItems = [...items];

	for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
		const randomIndex = Math.floor(Math.random() * (index + 1));
		[shuffledItems[index], shuffledItems[randomIndex]] = [shuffledItems[randomIndex], shuffledItems[index]];
	}

	return shuffledItems;
}

function getRandomCharacter() {
	const randomIndex = Math.floor(Math.random() * availableCharacters.length);
	return availableCharacters[randomIndex];
}

function buildMorseOptions(correctMorse) {
	const wrongOptions = shuffleArray(
		availableMorseCodes.filter((morseCode) => morseCode !== correctMorse)
	).slice(0, 3);

	return shuffleArray([correctMorse, ...wrongOptions]).map((optionValue) => ({
		value: optionValue,
		isCorrect: optionValue === correctMorse
	}));
}

function buildCharacterOptions(correctCharacter) {
	const wrongOptions = shuffleArray(
		availableCharacters.filter((character) => character !== correctCharacter)
	).slice(0, 3);

	return shuffleArray([correctCharacter, ...wrongOptions]).map((optionValue) => ({
		value: optionValue,
		isCorrect: optionValue === correctCharacter
	}));
}

function buildQuestions(totalQuestions) {
	const uniqueCharacters = shuffleArray(availableCharacters).slice(0, Math.min(totalQuestions, availableCharacters.length));

	return uniqueCharacters.map((character) => {
		const morse = charToMorse[character];

		return {
			character,
			morse,
			morseOptions: buildMorseOptions(morse),
			characterOptions: buildCharacterOptions(character)
		};
	});
}

function getCorrectAnswer(currentQuestion) {
	if (examConfig.questionType === 'encode') {
		return currentQuestion.morse;
	}

	return currentQuestion.character;
}

function getOptionsForCurrentQuestion(currentQuestion) {
	if (examConfig.questionType === 'encode') {
		return currentQuestion.morseOptions;
	}

	return currentQuestion.characterOptions;
}

function finishSession() {
	const examResult = {
		correctAnswers: correctAnswersCount,
		totalQuestions: questions.length,
		questionType: examConfig.questionType,
		examType: examConfig.examType
	};

	sessionStorage.setItem('examResult', JSON.stringify(examResult));
	window.examResult = examResult;
	window.location.href = 'examResult.html';
}

function moveToNextQuestion() {
	if (currentQuestionIndex >= questions.length - 1) {
		finishSession();
		return;
	}

	currentQuestionIndex += 1;
	renderQuestion(currentQuestionIndex);
}

function revealTranslation() {
	questionTranslationElement.classList.remove('is-hidden');
}

function setTypeControlsDisabled(disabledState) {
	typeAnswerSubmitElement.disabled = disabledState;
	typeAnswerSubmitSimpleElement.disabled = disabledState;
	appendDotButtonElement.disabled = disabledState;
	appendDashButtonElement.disabled = disabledState;
	clearTypeButtonElement.disabled = disabledState;
}

function appendSymbolToTypeInput(symbol) {
	if (!isEncodeTypeMode() || typeAnswerInputElement.disabled) {
		return;
	}

	if (typeAnswerInputElement.value.length >= typeAnswerInputElement.maxLength) {
		return;
	}

	typeAnswerInputElement.value += symbol;
	typeAnswerInputElement.focus();
}

function resetTypeInputState() {
	typeAnswerInputElement.classList.remove('is-correct', 'is-wrong');
	typeAnswerInputElement.disabled = false;
	setTypeControlsDisabled(false);
	typeAnswerInputElement.value = '';
}

function handleTypeAnswer(currentQuestion) {
	if (!isTypeInputMode()) {
		return;
	}

	const rawValue = typeAnswerInputElement.value.trim();
	const submittedValue = examConfig.questionType === 'decode' ? rawValue.toUpperCase() : rawValue;
	const correctAnswer = examConfig.questionType === 'decode' ? currentQuestion.character : currentQuestion.morse;
	const selectedIsCorrect = submittedValue === correctAnswer;

	if (selectedIsCorrect) {
		correctAnswersCount += 1;
		typeAnswerInputElement.classList.add('is-correct');
	} else {
		typeAnswerInputElement.classList.add('is-wrong');
	}

	typeAnswerInputElement.disabled = true;
	setTypeControlsDisabled(true);
	revealTranslation();
	window.setTimeout(moveToNextQuestion, selectedIsCorrect ? 700 : 1100);
}

function handleQuizAnswer(selectedButton, currentQuestion) {
	const optionButtons = Array.from(quizOptionsElement.querySelectorAll('.session-option-button'));
	const correctAnswer = getCorrectAnswer(currentQuestion);
	const selectedValue = selectedButton.dataset.value;
	const selectedIsCorrect = selectedValue === correctAnswer;

	if (selectedIsCorrect) {
		correctAnswersCount += 1;
	}

	optionButtons.forEach((button) => {
		button.disabled = true;

		if (button.dataset.value === correctAnswer) {
			button.classList.add('is-correct');
		}
	});

	if (!selectedIsCorrect) {
		selectedButton.classList.add('is-wrong');
	}

	revealTranslation();
	window.setTimeout(moveToNextQuestion, selectedIsCorrect ? 700 : 1100);
}

function renderQuizOptions(currentQuestion) {
	if (isTypeInputMode()) {
		quizOptionsElement.classList.add('hidden');
		quizOptionsElement.innerHTML = '';
		typeAnswerContainerElement.classList.remove('hidden');

		if (isEncodeTypeMode()) {
			typeAnswerInputElement.maxLength = 5;
			typeAnswerInputElement.placeholder = '';
			typeAnswerSubmitSimpleElement.classList.add('hidden');
			typeAnswerSubmitElement.classList.remove('hidden');
			appendDotButtonElement.classList.remove('hidden');
			appendDashButtonElement.classList.remove('hidden');
			clearTypeButtonElement.classList.remove('hidden');
		} else {
			typeAnswerInputElement.maxLength = 1;
			typeAnswerInputElement.placeholder = '';
			typeAnswerSubmitSimpleElement.classList.remove('hidden');
			typeAnswerSubmitElement.classList.add('hidden');
			appendDotButtonElement.classList.add('hidden');
			appendDashButtonElement.classList.add('hidden');
			clearTypeButtonElement.classList.add('hidden');
		}

		resetTypeInputState();
		typeAnswerInputElement.focus();
		return;
	}

	typeAnswerContainerElement.classList.add('hidden');
	resetTypeInputState();

	if (!(examConfig.examType === 'quiz' || examConfig.examType === 'type')) {
		quizOptionsElement.classList.add('hidden');
		quizOptionsElement.innerHTML = '';
		return;
	}

	quizOptionsElement.classList.remove('hidden');
	quizOptionsElement.innerHTML = '';

	getOptionsForCurrentQuestion(currentQuestion).forEach((option) => {
		const optionButton = document.createElement('button');
		optionButton.type = 'button';
		optionButton.className = 'session-option-button';
		optionButton.textContent = option.value;
		optionButton.dataset.value = option.value;
		optionButton.addEventListener('click', () => handleQuizAnswer(optionButton, currentQuestion));
		quizOptionsElement.appendChild(optionButton);
	});
}

function renderQuestion(questionIndex) {
	const currentQuestion = questions[questionIndex];

	questionNumberElement.textContent = String(questionIndex + 1);

	if (examConfig.questionType === 'encode') {
		questionPromptElement.classList.remove('is-morse');
		questionPromptElement.textContent = currentQuestion.character;
		questionTranslationElement.textContent = currentQuestion.morse;
		questionTranslationElement.classList.add('is-hidden');
		renderQuizOptions(currentQuestion);
		return;
	}

	questionPromptElement.classList.add('is-morse');
	questionPromptElement.textContent = currentQuestion.morse;
	questionTranslationElement.textContent = currentQuestion.character;
	questionTranslationElement.classList.add('is-hidden');
	renderQuizOptions(currentQuestion);
}

const questions = buildQuestions(examConfig.problems);

typeAnswerInputElement.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter') {
		return;
	}

	event.preventDefault();
	handleTypeAnswer(questions[currentQuestionIndex]);
});

typeAnswerInputElement.addEventListener('input', () => {
	if (!isEncodeTypeMode()) {
		return;
	}

	typeAnswerInputElement.value = typeAnswerInputElement.value.replace(/[^.\-/ ]+/g, '');
});

appendDotButtonElement.addEventListener('click', () => {
	appendSymbolToTypeInput('.');
});

appendDashButtonElement.addEventListener('click', () => {
	appendSymbolToTypeInput('-');
});

clearTypeButtonElement.addEventListener('click', () => {
	if (!isEncodeTypeMode() || typeAnswerInputElement.disabled) {
		return;
	}

	typeAnswerInputElement.value = '';
	typeAnswerInputElement.focus();
});

typeAnswerSubmitElement.addEventListener('click', () => {
	handleTypeAnswer(questions[currentQuestionIndex]);
});

typeAnswerSubmitSimpleElement.addEventListener('click', () => {
	handleTypeAnswer(questions[currentQuestionIndex]);
});

renderQuestion(currentQuestionIndex);

window.examConfig = examConfig;
window.examQuestions = questions;
window.examResult = {
	correctAnswers: correctAnswersCount,
	totalQuestions: questions.length,
	questionType: examConfig.questionType,
	examType: examConfig.examType
};
console.log('Exam config:', examConfig);

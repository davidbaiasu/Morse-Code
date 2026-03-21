const MIN_LEVEL = 1;
const MAX_LEVEL = 4;
const MIN_ENCOUNTERS_FOR_PROMOTION = 3;
const PROMOTION_ACCURACY_THRESHOLD = 0.8;
const LOW_ACCURACY_THRESHOLD = 0.6;
const LEARN_STORAGE_KEY = 'morseLearnProgress';

const questionPromptElement = document.getElementById('questionPrompt');
const questionTranslationElement = document.getElementById('questionTranslation');
const typeAnswerInputElement = document.getElementById('typeAnswerInput');
const appendDotButtonElement = document.getElementById('appendDotButton');
const appendDashButtonElement = document.getElementById('appendDashButton');
const clearTypeButtonElement = document.getElementById('clearTypeButton');
const typeAnswerSubmitElement = document.getElementById('typeAnswerSubmit');

const availableLetters = Object.keys(charToMorse)
	.filter((character) => /^[A-Z]$/.test(character))
	.sort();

let learnProgress = loadLearnProgress();
let currentQuestion = null;
let lastCharacter = null;
let nextQuestionTimeoutId = null;

function clampLevel(level) {
	return Math.max(MIN_LEVEL, Math.min(level, MAX_LEVEL));
}

function createEmptyLetterStats() {
	return availableLetters.reduce((stats, character) => {
		stats[character] = { encountered: 0, correct: 0 };
		return stats;
	}, {});
}

function normalizeLetterStats(letterStats) {
	const normalizedStats = createEmptyLetterStats();

	availableLetters.forEach((character) => {
		const currentStats = letterStats?.[character];
		if (!currentStats) {
			return;
		}

		normalizedStats[character] = {
			encountered: Number.isFinite(currentStats.encountered) ? Math.max(0, currentStats.encountered) : 0,
			correct: Number.isFinite(currentStats.correct) ? Math.max(0, currentStats.correct) : 0
		};
	});

	return normalizedStats;
}

function loadLearnProgress() {
	const defaultProgress = {
		level: 1,
		letterStats: createEmptyLetterStats()
	};

	try {
		const storedValue = localStorage.getItem(LEARN_STORAGE_KEY);
		if (!storedValue) {
			return defaultProgress;
		}

		const parsedValue = JSON.parse(storedValue);
		return {
			level: clampLevel(Number(parsedValue.level) || defaultProgress.level),
			letterStats: normalizeLetterStats(parsedValue.letterStats)
		};
	} catch {
		return defaultProgress;
	}
}

function saveLearnProgress() {
	localStorage.setItem(LEARN_STORAGE_KEY, JSON.stringify(learnProgress));
}

function getUnlockedLetters() {
	return availableLetters.filter((character) => charToMorse[character].length <= learnProgress.level);
}

function setTypeControlsDisabled(disabledState) {
	typeAnswerSubmitElement.disabled = disabledState;
	appendDotButtonElement.disabled = disabledState;
	appendDashButtonElement.disabled = disabledState;
	clearTypeButtonElement.disabled = disabledState;
}

function isLowAccuracyLetter(character) {
	const stats = learnProgress.letterStats[character];
	if (stats.encountered === 0) {
		return false;
	}

	return stats.correct / stats.encountered < LOW_ACCURACY_THRESHOLD;
}

function resetTypeInputState() {
	typeAnswerInputElement.classList.remove('is-correct', 'is-wrong');
	typeAnswerInputElement.disabled = false;
	typeAnswerInputElement.value = '';
	setTypeControlsDisabled(false);
	questionTranslationElement.classList.add('is-hidden');
	questionTranslationElement.textContent = currentQuestion?.morse || '';
	questionPromptElement.textContent = currentQuestion?.character || '';
	if (currentQuestion && isLowAccuracyLetter(currentQuestion.character)) {
		questionTranslationElement.classList.remove('is-hidden');
	}
	typeAnswerInputElement.focus();
}

function checkAutoLevelUp() {
	if (learnProgress.level >= MAX_LEVEL) {
		return;
	}

	const unlockedLetters = getUnlockedLetters();
	const qualifies = unlockedLetters.every((character) => {
		const stats = learnProgress.letterStats[character];
		return stats.encountered >= MIN_ENCOUNTERS_FOR_PROMOTION
			&& stats.correct / stats.encountered >= PROMOTION_ACCURACY_THRESHOLD;
	});

	if (!qualifies) {
		return;
	}

	learnProgress.level += 1;
	saveLearnProgress();
}

function getRandomCharacter() {
	const unlockedLetters = getUnlockedLetters();
	if (unlockedLetters.length === 0) {
		return null;
	}

	const candidateLetters = unlockedLetters.length > 1
		? unlockedLetters.filter((character) => character !== lastCharacter)
		: unlockedLetters;
	const randomIndex = Math.floor(Math.random() * candidateLetters.length);
	return candidateLetters[randomIndex];
}

function showNextQuestion() {
	const nextCharacter = getRandomCharacter();
	if (!nextCharacter) {
		return;
	}

	lastCharacter = nextCharacter;
	currentQuestion = {
		character: nextCharacter,
		morse: charToMorse[nextCharacter]
	};
	learnProgress.letterStats[nextCharacter].encountered += 1;
	saveLearnProgress();
	resetTypeInputState();
}

function queueNextQuestion(delay) {
	if (nextQuestionTimeoutId) {
		window.clearTimeout(nextQuestionTimeoutId);
	}

	nextQuestionTimeoutId = window.setTimeout(() => {
		nextQuestionTimeoutId = null;
		showNextQuestion();
	}, delay);
}

function appendSymbolToTypeInput(symbol) {
	if (typeAnswerInputElement.disabled) {
		return;
	}

	if (typeAnswerInputElement.value.length >= typeAnswerInputElement.maxLength) {
		return;
	}

	typeAnswerInputElement.value += symbol;
	typeAnswerInputElement.focus();
}

function handleTypeAnswer() {
	if (!currentQuestion || typeAnswerInputElement.disabled) {
		return;
	}

	const submittedValue = typeAnswerInputElement.value.trim();
	const selectedIsCorrect = submittedValue === currentQuestion.morse;

	if (selectedIsCorrect) {
		learnProgress.letterStats[currentQuestion.character].correct += 1;
		typeAnswerInputElement.classList.add('is-correct');
	} else {
		typeAnswerInputElement.classList.add('is-wrong');
	}

	typeAnswerInputElement.disabled = true;
	setTypeControlsDisabled(true);
	questionTranslationElement.classList.remove('is-hidden');
	saveLearnProgress();
	checkAutoLevelUp();
	queueNextQuestion(selectedIsCorrect ? 700 : 1100);
}

typeAnswerInputElement.addEventListener('keydown', (event) => {
	if (event.key !== 'Enter') {
		return;
	}

	event.preventDefault();
	handleTypeAnswer();
});

typeAnswerInputElement.addEventListener('input', () => {
	typeAnswerInputElement.value = typeAnswerInputElement.value.replace(/[^.-]+/g, '');
	if (typeAnswerInputElement.value.length > typeAnswerInputElement.maxLength) {
		typeAnswerInputElement.value = typeAnswerInputElement.value.slice(0, typeAnswerInputElement.maxLength);
	}
});

appendDotButtonElement.addEventListener('click', () => {
	appendSymbolToTypeInput('.');
});

appendDashButtonElement.addEventListener('click', () => {
	appendSymbolToTypeInput('-');
});

clearTypeButtonElement.addEventListener('click', () => {
	if (typeAnswerInputElement.disabled) {
		return;
	}

	typeAnswerInputElement.value = '';
	typeAnswerInputElement.focus();
});

typeAnswerSubmitElement.addEventListener('click', () => {
	handleTypeAnswer();
});

showNextQuestion();

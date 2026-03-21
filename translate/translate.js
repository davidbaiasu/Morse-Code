const morseInput = document.getElementById('morseInput');
const lettersInput = document.getElementById('lettersInput');
const swapButton = document.getElementById('swapButton');
const translateButton = document.getElementById('translateButton');
const translateActions = document.querySelector('.translate-actions');
const translatePanel = document.querySelector('.translate-panel');

function encodeLettersToMorse(text) {
	if (typeof charToMorse === 'undefined') {
		return '';
	}

	const words = text.toUpperCase().trim().split(/\s+/).filter(Boolean);

	return words
		.map((word) => word.split('').map((character) => charToMorse[character] || '').filter(Boolean).join(' '))
		.join(' / ');
}

function decodeMorseToLetters(text) {
	if (typeof morseToChar === 'undefined') {
		return '';
	}

	const words = text.trim().split(/\s*\/\s*/).filter(Boolean);

	return words
		.map((word) => word.split(/\s+/).map((symbol) => morseToChar[symbol] || '').join(''))
		.join(' ');
}

function translateTopInputToBottomInput() {
	if (!translatePanel || !morseInput || !lettersInput) {
		return;
	}

	const inputsInOrder = Array.from(translatePanel.querySelectorAll('.translate-input'));
	const topInput = inputsInOrder[0];
	const bottomInput = inputsInOrder[1];

	if (!topInput || !bottomInput) {
		return;
	}

	if (topInput === morseInput) {
		bottomInput.value = decodeMorseToLetters(morseInput.value);
		return;
	}

	bottomInput.value = encodeLettersToMorse(lettersInput.value);
}

if (morseInput) {
	morseInput.addEventListener('input', () => {
		morseInput.value = morseInput.value.replace(/[^.\-/ ]+/g, '');
	});
}

if (lettersInput) {
	lettersInput.addEventListener('input', () => {
		lettersInput.value = lettersInput.value.replace(/[^a-zA-Z ]+/g, '');
	});
}

if (swapButton && morseInput && lettersInput && translateActions && translatePanel) {
	swapButton.addEventListener('click', () => {
		const isMorseOnTop = morseInput.nextElementSibling === translateActions;

		if (isMorseOnTop) {
			translatePanel.insertBefore(lettersInput, translateActions);
			translatePanel.appendChild(morseInput);
			return;
		}

		translatePanel.insertBefore(morseInput, translateActions);
		translatePanel.appendChild(lettersInput);
	});
}

if (translateButton) {
	translateButton.addEventListener('click', () => {
		translateTopInputToBottomInput();
	});
}

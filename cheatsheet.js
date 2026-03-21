const cheatsheetGridElement = document.getElementById('cheatsheetGrid');

function getLetterEntries() {
	return Object.entries(charToMorse).filter(([character]) => /^[A-Z]$/.test(character));
}

function getDigitEntries() {
	return Object.entries(charToMorse).filter(([character]) => /^\d$/.test(character));
}

function renderCheatsheet() {
	if (!cheatsheetGridElement) {
		return;
	}

	cheatsheetGridElement.innerHTML = '';

	[...getLetterEntries(), ...getDigitEntries()].forEach(([character, morseCode]) => {
		const cardElement = document.createElement('article');
		cardElement.className = 'cheatsheet-card';

		const letterElement = document.createElement('div');
		letterElement.className = 'cheatsheet-letter';
		letterElement.textContent = character;

		const morseElement = document.createElement('div');
		morseElement.className = 'cheatsheet-morse';
		morseElement.textContent = morseCode;

		cardElement.append(letterElement, morseElement);
		cheatsheetGridElement.appendChild(cardElement);
	});
}

renderCheatsheet();
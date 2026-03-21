const LEARN_STORAGE_KEY = 'morseLearnProgress';

const statsTableBodyElement = document.getElementById('statsTableBody');

const availableLetters = Object.keys(charToMorse)
	.filter((character) => /^[A-Z]$/.test(character))
	.sort();

function loadLetterStats() {
	try {
		const storedValue = localStorage.getItem(LEARN_STORAGE_KEY);
		if (!storedValue) {
			return {};
		}

		const parsedValue = JSON.parse(storedValue);
		return parsedValue.letterStats || {};
	} catch {
		return {};
	}
}

function getAccuracyText(correct, encountered) {
	if (encountered === 0) {
		return '—';
	}

	return `${Math.round((correct / encountered) * 100)}%`;
}

function getAccuracyClass(correct, encountered) {
	if (encountered === 0) {
		return '';
	}

	const ratio = correct / encountered;
	if (ratio < 0.6) {
		return 'accuracy-low';
	}

	if (ratio < 0.8) {
		return 'accuracy-mid';
	}

	return 'accuracy-high';
}

function renderStats() {
	const letterStats = loadLetterStats();
	statsTableBodyElement.innerHTML = '';

	availableLetters.forEach((character) => {
		const stats = letterStats[character] || { encountered: 0, correct: 0 };
		const tr = document.createElement('tr');

		const tdLetter = document.createElement('td');
		tdLetter.textContent = character;

		const tdMorse = document.createElement('td');
		tdMorse.className = 'morse-cell';
		tdMorse.textContent = charToMorse[character];

		const tdSeen = document.createElement('td');
		tdSeen.textContent = stats.encountered === 0 ? '—' : String(stats.encountered);

		const tdCorrect = document.createElement('td');
		tdCorrect.textContent = stats.correct === 0 && stats.encountered === 0 ? '—' : String(stats.correct);

		const tdAccuracy = document.createElement('td');
		tdAccuracy.textContent = getAccuracyText(stats.correct, stats.encountered);
		tdAccuracy.className = getAccuracyClass(stats.correct, stats.encountered);

		tr.append(tdLetter, tdMorse, tdSeen, tdCorrect, tdAccuracy);
		statsTableBodyElement.appendChild(tr);
	});
}

renderStats();

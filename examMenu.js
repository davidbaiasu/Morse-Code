let currentValue = 10;
const minValue = 5;
const maxValue = 30;
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

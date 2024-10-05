import geezNumbers from "./geeznumbers";

// Function to generate random Geez numbers
export function generateRandomGeezNumbers(count = 4, correctNumber) {
  const randomGeezNumbers = [];
  const keys = Object.keys(geezNumbers); // Get all keys (1 to 100)

  // Get the correct Geez number from the geezNumbers object
  const correctGeezNumber = geezNumbers[correctNumber];

  // Ensure one of the options is the correct number
  randomGeezNumbers.push(correctGeezNumber);

  // Generate unique random options
  while (randomGeezNumbers.length < count) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomGeezNumber = geezNumbers[randomKey];

    if (!randomGeezNumbers.includes(randomGeezNumber)) {
      randomGeezNumbers.push(randomGeezNumber);
    }
  }

  // Shuffle the options to randomize their order
  return randomGeezNumbers.sort(() => Math.random() - 0.5);
}

const generateRandomNumber = () => {
  return Math.floor(Math.random() * Object.keys(geezNumbers).length) + 1;
};

export default generateRandomNumber;

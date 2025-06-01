const levenshtein = require("js-levenshtein");

const match = (str1, str2) => {
  const distance = levenshtein(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  const percentage = ((maxLength - distance) / maxLength) * 100;
  return percentage.toFixed(0);
};

export default match;

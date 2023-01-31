const clamp = (lower: number, upper: number, value: number) => {
  if (value < lower) {
    return lower;
  }

  if (value > upper) {
    return upper;
  }

  return value;
};

export default { clamp };

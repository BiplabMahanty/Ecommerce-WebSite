const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const calculateLeaveDays = (startDate, endDate, sandwichRule) => {
  let count = 0;
  let dates = [];
  let current = new Date(startDate);

  while (current <= endDate) {
    if (sandwichRule || !isWeekend(current)) {
      count++;
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }

  return { count, dates };
};

module.exports = calculateLeaveDays;

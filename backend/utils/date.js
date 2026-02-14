const getCurrentWeekRange = () => {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)

  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() + diffToMonday);
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekStart, weekEnd };
};

module.exports = {getCurrentWeekRange}

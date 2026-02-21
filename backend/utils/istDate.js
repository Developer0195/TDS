const IST_OFFSET = 5.5 * 60; // minutes

function getISTStartAndEnd(dateString) {
  const date = dateString ? new Date(dateString) : new Date();

  // convert to UTC midnight of that date
  const utc = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  // IST start in UTC
  const start = new Date(utc - IST_OFFSET * 60 * 1000);

  // IST end in UTC
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  end.setUTCMilliseconds(end.getUTCMilliseconds() - 1);

  return { start, end };
}

module.exports = { getISTStartAndEnd };
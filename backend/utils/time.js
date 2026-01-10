const calculateDurationMinutes = (start, end) => {
    const diffMs = end - start;
    return Math.floor(diffMs / (1000 * 60));
};

module.exports = calculateDurationMinutes;

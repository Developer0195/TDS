const addLog = (task, action, description, userId) => {
    task.logs.push({
        action,
        description,
        performedBy: userId,
    });
};

module.exports = addLog;

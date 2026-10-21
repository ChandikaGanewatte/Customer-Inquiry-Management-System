
const TRANSITIONS = {
  New: ["In Progress"],
  "In Progress": ["Resolved"],
  Resolved: [],
};

function isValidStatusTransition(currentStatus, nextStatus) {
  return TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

module.exports = { isValidStatusTransition };

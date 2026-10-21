
const test = require("node:test");
const assert = require("node:assert/strict");

const {
  isValidStatusTransition,
} = require("../utils/statusTransitions");

test("allows moving a new inquiry to in progress", () => {
  assert.equal(
    isValidStatusTransition("New", "In Progress"),
    true
  );
});

test("allows resolving an in-progress inquiry", () => {
  assert.equal(
    isValidStatusTransition("In Progress", "Resolved"),
    true
  );
});

test("rejects reopening a resolved inquiry", () => {
  assert.equal(
    isValidStatusTransition("Resolved", "In Progress"),
    false
  );
});

test("rejects an unknown status", () => {
  assert.equal(
    isValidStatusTransition("New", "Invalid Status"),
    false
  );
});


const express = require("express");
const pool = require("../db");
const requireAuth = require("../middleware/auth");

const router = express.Router();

router.use(requireAuth);

const STATUSES = ["New", "In Progress", "Resolved"];

const TRANSITIONS = {
  New: ["In Progress"],
  "In Progress": ["New", "Resolved"],
  Resolved: ["In Progress"],
};

function validateInquiry(body) {
  const errors = {};

  const fields = [
    ["customer_name", 2, 100],
    ["contact_details", 3, 150],
    ["subject", 3, 150],
    ["description", 5, 2000],
  ];

  for (const [field, min, max] of fields) {
    const value = body?.[field];

    if (
      typeof value !== "string" ||
      value.trim().length < min ||
      value.trim().length > max
    ) {
      errors[field] =
        `${field} must contain ${min}-${max} characters.`;
    }
  }

  return errors;
}

// POST /api/inquiries — create inquiry
router.post("/", async (req, res) => {
  const errors = validateInquiry(req.body);

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({
      message: "Invalid inquiry information.",
      errors,
    });
  }

  const {
    customer_name,
    contact_details,
    subject,
    description,
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO inquiries
       (customer_name, contact_details, subject, description, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        customer_name.trim(),
        contact_details.trim(),
        subject.trim(),
        description.trim(),
        "New",
        req.user.id,
      ]
    );

    return res.status(201).json({
      message: "Inquiry created successfully.",
      inquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Create inquiry:", error.message);

    return res.status(500).json({
      message: "Unable to create inquiry.",
    });
  }
});

// GET /api/inquiries — list, search and filter
router.get("/", async (req, res) => {
  const search =
    typeof req.query.search === "string"
      ? req.query.search.trim().slice(0, 150)
      : "";

  const status = req.query.status;

  if (
    status !== undefined &&
    (typeof status !== "string" || !STATUSES.includes(status))
  ) {
    return res.status(400).json({
      message: "Invalid status filter.",
      allowedStatuses: STATUSES,
    });
  }

  try {
    const values = [req.user.id];

    let sql = `
      SELECT *
      FROM inquiries
      WHERE created_by = $1
    `;

    if (search) {
      values.push(`%${search}%`);

      sql += ` AND (
        customer_name ILIKE $${values.length}
        OR contact_details ILIKE $${values.length}
        OR subject ILIKE $${values.length}
      )`;
    }

    if (status) {
      values.push(status);
      sql += ` AND status = $${values.length}`;
    }

    sql += " ORDER BY created_at DESC, id DESC";

    const result = await pool.query(sql, values);

    return res.json({
      inquiries: result.rows,
      count: result.rowCount,
    });
  } catch (error) {
    console.error("List inquiries:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve inquiries.",
    });
  }
});

// GET /api/inquiries/:id — view one inquiry
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      message: "Invalid inquiry ID.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT *
       FROM inquiries
       WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Inquiry not found.",
      });
    }

    return res.json({
      inquiry: result.rows[0],
    });
  } catch (error) {
    console.error("Get inquiry:", error.message);

    return res.status(500).json({
      message: "Unable to retrieve inquiry.",
    });
  }
});

// PATCH /api/inquiries/:id/status — update inquiry status
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status, expectedStatus } = req.body || {};

  if (!/^[1-9]\d*$/.test(id)) {
    return res.status(400).json({
      message: "Invalid inquiry ID.",
    });
  }

  if (!STATUSES.includes(status)) {
    return res.status(400).json({
      message: "Invalid status.",
      allowedStatuses: STATUSES,
    });
  }

  if (!STATUSES.includes(expectedStatus)) {
    return res.status(400).json({
      message: "A valid expectedStatus is required.",
      allowedStatuses: STATUSES,
    });
  }

  if (!TRANSITIONS[expectedStatus].includes(status)) {
    return res.status(409).json({
      message: `Cannot change status from ${expectedStatus} to ${status}.`,
    });
  }

  try {
    const result = await pool.query(
      `UPDATE inquiries
       SET status = $1
       WHERE id = $2
         AND created_by = $3
         AND status = $4
       RETURNING *`,
      [status, id, req.user.id, expectedStatus]
    );

    if (result.rowCount === 1) {
      return res.json({
        message: "Status updated successfully.",
        inquiry: result.rows[0],
      });
    }

    const current = await pool.query(
      `SELECT status
       FROM inquiries
       WHERE id = $1 AND created_by = $2`,
      [id, req.user.id]
    );

    if (current.rowCount === 0) {
      return res.status(404).json({
        message: "Inquiry not found.",
      });
    }

    return res.status(409).json({
      message: "Inquiry changed in another session. Refresh and retry.",
      currentStatus: current.rows[0].status,
    });
  } catch (error) {
    console.error("Update inquiry:", error.message);

    return res.status(500).json({
      message: "Unable to update inquiry status.",
    });
  }
});

module.exports = router;

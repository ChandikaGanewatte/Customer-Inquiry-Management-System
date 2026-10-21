# Engineering Decisions — Customer Inquiry Management System

## 1. Project Overview

The Customer Inquiry Management System was developed to help service staff record, find, and manage customer inquiries through a centralized web application. The frontend communicates with a Node.js and Express REST API, while PostgreSQL provides persistent storage.

The main objective was to implement a reliable end-to-end workflow without introducing unnecessary complexity.

## 2. Assumptions and Ownership Rules

### Staff Access

The application is designed as a shared inquiry workspace. Any authenticated staff member can view and manage inquiries, allowing the team to collaborate without requiring a separate assignment system.

Authentication is enforced by backend middleware. Protected API requests must contain a valid JWT. Frontend route protection improves usability but is not treated as a security boundary.

Under this shared-workspace policy, an authenticated staff member may open an inquiry directly by its ID. Unauthenticated users cannot access protected inquiry endpoints.

### Customer Input

Each inquiry must contain a customer name, contact information, subject, and description. Required fields are validated in both the frontend and backend.

Duplicate submissions are not automatically merged because two inquiries from the same customer may concern different issues. Staff can review potential duplicates manually.

## 3. Status Transition Rules

The application uses three statuses: `New`, `In Progress`, and `Resolved`.

The intended workflow is:

- `New` → `In Progress`
- `In Progress` → `Resolved`

Resolved inquiries cannot be reopened through the current workflow. Invalid transitions are rejected by the backend with an appropriate error response.

The frontend reflects the current status and displays an understandable message when an update fails.

## 4. Important Design Decisions

### Backend-Enforced Authentication and Validation

JWT authentication middleware protects inquiry endpoints. The backend independently validates incoming data and checks requested status changes instead of trusting frontend controls.

This prevents users from bypassing important rules by calling the API directly.

### PostgreSQL for Persistent Storage

PostgreSQL was selected as the relational database because users and inquiries have structured data and can be managed through SQL queries and relationships. Inquiry data remains available after the application is restarted.

### Clear API Error Handling

The API distinguishes authentication failures, invalid input, invalid status transitions, and inquiries that do not exist. This helps the frontend display meaningful feedback and makes debugging easier.

## 5. Trade-Offs

A shared inquiry workspace was chosen instead of implementing inquiry ownership or staff assignment. This simplifies the data model and supports collaboration, but it does not restrict staff to particular records.

Real-time synchronization was also not implemented. If two browser tabs display the same inquiry, one tab may show an outdated status after the other tab updates it. The user can refresh or reload the inquiry to retrieve the latest saved status. A future version could use periodic revalidation or optimistic concurrency checks to handle stale updates more robustly.

## 6. Testing Approach and Limitations

The testing strategy includes a backend test for an important validation or business rule and a frontend test for a user interaction or UI state.

These tests are intended to verify that invalid operations are rejected and that the interface responds appropriately. They do not provide complete coverage of every API endpoint, authentication scenario, database failure, or browser interaction.

## 7. Future Improvements

- Add inquiry assignment and record-level access control if required.
- Add an inquiry activity history for tracking status changes.
- Improve stale-data detection and concurrent-update handling.
- Expand automated tests for authentication, validation, API errors, and database operations.
- Improve accessibility and loading, empty, and error states.

## 8. Use of AI

AI tools were used as development assistance to help understand implementation options, troubleshoot errors, organize documentation, and identify useful testing scenarios.

AI-generated suggestions were treated as proposals rather than accepted automatically. The implementation and design decisions were reviewed against the assessment requirements. The developer remains responsible for understanding, testing, and explaining the submitted code.


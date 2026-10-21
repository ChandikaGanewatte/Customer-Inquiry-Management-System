# \# Customer Inquiry Management System

# 

# A full-stack web application designed to help service businesses manage customer inquiries efficiently. Staff can securely sign in, create and search inquiries, view inquiry details, and track their progress through different statuses.

# 

# Developed as part of the \*\*Fullstack Development Technical Assessment for Coffee Ninja (Pvt) Ltd\*\*.

# 

# \## Features

# 

# \- \*\*Authentication:\*\* Secure staff sign-in with backend authentication.

# \- \*\*Inquiry Management:\*\* Create, view, search, and update customer inquiries.

# \- \*\*Status Tracking:\*\* Manage inquiry statuses: `New`, `In Progress`, and `Resolved`.

# \- \*\*Input Validation:\*\* Validate customer information and inquiry details on both the frontend and backend.

# \- \*\*Protected API:\*\* Secure inquiry endpoints using JWT-based authentication.

# \- \*\*PostgreSQL Database:\*\* Persist inquiry and user information in a relational database.

# \- \*\*Error Handling:\*\* Provide meaningful feedback for validation errors, authentication failures, and unsuccessful requests.

# \- \*\*Responsive Interface:\*\* Simple interface for managing customer inquiries.

# 

# \## Technology Stack

# 

# \*\*Frontend\*\*

# \- React

# \- JavaScript

# \- CSS

# 

# \*\*Backend\*\*

# \- Node.js

# \- Express.js

# \- JWT Authentication

# 

# \*\*Database\*\*

# \- PostgreSQL

# 

# \*\*Testing\*\*

# \- Backend API testing

# \- Frontend interaction testing

# 

# \## Application Workflow

# 

# 1\. Staff sign in using their credentials.

# 2\. Staff create an inquiry with the customer's name, contact information, subject, and description.

# 3\. Staff view and search existing inquiries.

# 4\. Staff open an inquiry to review its details.

# 5\. Staff update the inquiry status as the request progresses.

# 6\. Changes are saved in PostgreSQL through the backend API.

# 

# \## Getting Started

# 

# \### Prerequisites

# 

# Install the following software before running the application:

# 

# \- \[Node.js](https://nodejs.org/)

# \- \[PostgreSQL](https://www.postgresql.org/)

# \- \[Git](https://git-scm.com/)

# 

# \### 1. Clone the Repository

# 

# ```bash

# git clone <YOUR\_GITHUB\_REPOSITORY\_URL>

# cd <YOUR\_PROJECT\_FOLDER>

# ```

# 

# \### 2. Configure the Database

# 

# Create a PostgreSQL database for the application.

# 

# ```sql

# CREATE DATABASE customer\_inquiry\_db;

# ```

# 

# Configure your database connection using environment variables. Use the actual variable names expected by your backend configuration.

# 

# \### 3. Configure Environment Variables

# 

# Create a `.env` file in the backend directory.

# 

# Example configuration:

# 

# ```env

# PORT=5000

# DATABASE\_URL=postgresql://YOUR\_DB\_USER:YOUR\_DB\_PASSWORD@localhost:5432/customer\_inquiry\_db

# JWT\_SECRET=your\_secure\_random\_secret

# ```

# 

# Replace the example values with your local PostgreSQL credentials and a secure JWT secret. Never commit your `.env` file or real credentials to GitHub.

# 

# \### 4. Install Dependencies

# 

# Navigate to the backend directory and install the dependencies:

# 

# ```bash

# cd backend

# npm install

# ```

# 

# Install frontend dependencies in a separate terminal:

# 

# ```bash

# cd frontend

# npm install

# ```

# 

# Adjust the directory names if your repository uses a different structure.

# 

# \### 5. Initialize the Database

# 

# Run the database migrations or SQL setup scripts provided in the repository.

# 

# If the project uses seeded staff accounts, run the appropriate seed command or follow the database setup instructions to create a test account.

# 

# \### 6. Start the Backend

# 

# From the backend directory, run:

# 

# ```bash

# npm start

# ```

# 

# The backend API should run at:

# 

# `http://localhost:5000`

# 

# \### 7. Start the Frontend

# 

# From the frontend directory, run:

# 

# ```bash

# npm run dev

# ```

# 

# Open the local URL displayed in the terminal to access the application.

# 

# \## Inquiry Status Lifecycle

# 

# | Status | Description |

# |---|---|

# | New | An inquiry has been recorded and is awaiting action. |

# | In Progress | A staff member is working on the inquiry. |

# | Resolved | The inquiry has been addressed. |

# 

# Status transitions are validated by the backend to prevent invalid updates.

# 

# \## Security and Validation

# 

# \- Protected endpoints require valid authentication.

# \- The backend validates submitted inquiry data independently of frontend validation.

# \- Unauthorized requests are rejected by the API.

# \- Invalid requests and missing records return appropriate error responses.

# \- Inquiry access follows the ownership or access policy implemented by the backend.

# 

# \## Testing

# 

# The project includes tests for important application behavior.

# 

# Run the backend tests using the configured test script:

# 

# ```bash

# npm test

# ```

# 

# Run the frontend tests using the test script configured in the frontend's `package.json`.

# 

# Testing focuses on backend validation or security rules and frontend interactions or UI states.

# 

# \## Project Structure

# 

# The repository contains the frontend application, backend API, and database setup files. The exact directory structure depends on the implementation.

# 

# ```text

# customer-inquiry-management/

# ├── frontend/

# ├── backend/

# ├── README.md

# ├── DECISIONS.md

# └── .gitignore

# ```

# 

# \## Design Decisions

# 

# Key design considerations include:

# 

# \- \*\*Backend-enforced authentication:\*\* Security is enforced by the API rather than relying only on frontend page restrictions.

# \- \*\*Server-side validation:\*\* The API independently validates customer and inquiry information.

# \- \*\*Controlled status lifecycle:\*\* Inquiry status changes follow defined business rules.

# \- \*\*Relational persistence:\*\* PostgreSQL provides persistent storage for application data.

# 

# See \[`DECISIONS.md`](DECISIONS.md) for assumptions, trade-offs, AI assistance, and potential improvements.

# 

# \## Future Improvements

# 

# \- Add inquiry assignment to individual staff members.

# \- Improve stale-data handling when multiple users update the same inquiry.

# \- Expand automated test coverage.

# \- Add inquiry activity history and audit logging.

# 

# \## Author

# 

# \*\*Chandika Ganewatte\*\*

# 

# GitHub: \[ChandikaGanewatte](https://github.com/ChandikaGanewatte)

# 

# \---

# 

# \*Developed for the Coffee Ninja (Pvt) Ltd Fullstack Development Technical Assessment.\*


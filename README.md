# AI Finance Tracker (ai-sinance-saas)

**AI Finance Tracker** is an intelligent personal finance management SaaS designed to help users track, analyze, and optimize their income and expenses using AI-powered receipt scanning and automated reporting.

---
🚀 Live Site: https://ai-fnanse.netlify.app

## Features

* **AI Receipt Scanner (OCR):** Upload or capture receipts and let the AI extract transaction details (merchant, amount, date, category).
* **Daily Expense Management:** Add, edit, and delete daily income and expense entries with categories and descriptions.
* **Automated Monthly Summary:** Calculates total income, total expenses, net savings each month and highlights top spending categories.
* **CSV Import / Export:** Import historical transactions from CSV and export data for backup or analysis.
* **Automated Email Reports:** Sends monthly summary emails with income/expense breakdown and trends to the registered email address.
* **Profile & Theme Customization:** Update user profile and switch themes (light/dark or custom palettes).
* **Bulk Management & Sync:** Support for bulk upload, delete, and reconciliation of records.

---

## Tech Stack (suggested)

* Frontend: React, React Router, Tailwind CSS
* Backend: Node.js, Express
* Database: MongoDB (or PostgreSQL)
* Authentication: Firebase Auth or JWT-based auth
* OCR / AI: Tesseract.js (for client-side) or a cloud OCR/AI service (Google Vision API, AWS Textract, Azure Form Recognizer)
* Email: Nodemailer or transactional email provider (SendGrid, Mailgun)
* Hosting: Vercel / Netlify (frontend), Heroku / Render / DigitalOcean (backend)

---

## Installation (development)

1. Clone the repository:

```bash
git clone https://github.com/alaminjim/ai-sinance-saas.git
cd ai-sinance-saas
```

2. Install dependencies (frontend and backend folders if separated):

```bash
# example for a monorepo
pnpm install
# or
npm install
```

4. Run the apps locally:

```bash
# backend
npm --filter backend dev
# frontend
npm --filter frontend dev
```

---

## Usage Overview

* **Receipt scanning:** Users upload an image or PDF of a receipt -> OCR extracts fields -> user verifies and saves transaction.
* **Manual entry:** Users add transactions manually with title, amount, date, category, and description.
* **Monthly reports:** The system aggregates transactions by month and sends an email summary automatically.
* **CSV workflows:** Import a CSV to bulk-create transactions; export monthly or yearly data as CSV.

---

## API Endpoints (examples)

* `POST /api/auth/register` — Register a new user
* `POST /api/auth/login` — Authenticate user
* `GET /api/transactions` — List user transactions (with query filters)
* `POST /api/transactions` — Create a new transaction
* `PUT /api/transactions/:id` — Update a transaction
* `DELETE /api/transactions/:id` — Delete a transaction
* `POST /api/ocr/scan` — Upload receipt for OCR processing
* `POST /api/import/csv` — Import transactions via CSV

---

## Development Roadmap

1. Implement core CRUD for transactions + authentication.
2. Integrate OCR pipeline and build receipt data verification UI.
3. Build monthly aggregation and scheduled email reports.
4. Add CSV import/export and reconciliation tools.
5. Polish UI, add themes, and deploy staging/production.

---

## Contributing

Contributions are welcome. Please open issues for feature requests or bugs and create pull requests for fixes/ improvements. Follow the existing code style and include tests where applicable.

---

## License

This project is open source — add your preferred license (MIT/Apache-2.0) in `LICENSE`.

---

## Contact

Created by Al-Amin Islam — feel free to reach out at `jimalamin7@gmail.com` for questions or collaboration.

# FlowSphere | Enterprise ERP & CRM Portal

FlowSphere is a modern, monolithic web application designed for enterprise operations. It provides a comprehensive Operations Portal combining an ERP (Enterprise Resource Planning) module for inventory management and a CRM (Customer Relationship Management) module for tracking customer interactions and sales challans.

## 🔗 Project Links
- **GitHub Repository:** [https://github.com/Prix09/ERP-CRM-Operations-Portal](https://github.com/Prix09/ERP-CRM-Operations-Portal)
- **Live Frontend URL:** `[Insert Live Frontend URL]`
- **Live Backend API URL:** `[Insert Live Backend API URL]`

---

## 🛠️ Tech Stack & Architecture

### Frontend (SPA)
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS + custom UI components (no bloated component libraries)
- **State Management & Data Fetching:** React Query (TanStack Query) v5
- **Routing:** React Router v6
- **Forms & Validation:** React Hook Form + Zod
- **Icons & Charts:** Lucide React, Recharts

### Backend (REST API)
- **Runtime:** Node.js
- **Framework:** Express.js (TypeScript)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Stateless JWT (JSON Web Tokens) with bcryptjs for password hashing
- **File Uploads & Documents:** Multer (image uploads) & PDFKit (generating Sales Challan PDFs)
- **Data Export:** json2csv for exporting CSV reports

### Architecture Overview
The system follows a standard Client-Server architecture separated into a `frontend` and `backend` directory. The backend is a standard RESTful Express API that connects to a PostgreSQL database via Prisma ORM. Authentication is completely stateless using JWTs stored securely on the client. 

The frontend is a Single Page Application (SPA) built with Vite and React Query. It handles data caching, background fetching, and optimistic updates to keep the UI snappy and responsive. Role-Based Access Control (RBAC) is enforced on both the backend API endpoints and the frontend React router to restrict access based on the user's role (Admin, Sales, Warehouse, Accounts).

---

## 🔑 Test Login Credentials

The database comes pre-seeded with testing accounts for each specific role:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@flowsphere.com` | `Password123!` |
| **Sales** | `sales@flowsphere.com` | `Password123!` |
| **Warehouse** | `warehouse@flowsphere.com` | `Password123!` |
| **Accounts** | `accounts@flowsphere.com` | `Password123!` |

---

## 🚀 Setup and Deployment Instructions

### Local Setup
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Prix09/ERP-CRM-Operations-Portal.git
   cd ERP-CRM-Operations-Portal
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   - Create a `.env` file based on `.env.example` and set your `DATABASE_URL` (requires a PostgreSQL instance).
   - Run database migrations & seed:
     ```bash
     npm run prisma:db:push
     npm run prisma:seed
     ```
   - Start the backend dev server:
     ```bash
     npm run dev
     ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```
   - Create a `.env` file with `VITE_API_URL=http://localhost:5000/api/v1`
   - Start the frontend dev server:
     ```bash
     npm run dev
     ```

### Production Deployment
**Frontend (Vercel)**
- Import the repository into Vercel and select the `frontend` directory as the Root Directory.
- Vercel will automatically detect Vite and run `npm run build`.
- The `vercel.json` file is already included to handle SPA routing fallbacks.
- Set the `VITE_API_URL` environment variable to your deployed Render Backend URL.

**Backend & Database (Render)**
- In Render, create a New Blueprint instance and connect the repository.
- Render will automatically read the `render.yaml` file at the root.
- It will provision a Free Tier PostgreSQL database (`flowsphere-db`) and deploy the Node API (`flowsphere-api`).
- *Note:* Make sure to set the `CORS_ORIGIN` environment variable in the Render dashboard to match your Vercel frontend URL.

---

## ⚠️ Known Limitations & Incomplete Parts
- **Local File Storage:** Product image uploads are currently handled by Multer and stored on the local disk (`/uploads`). On ephemeral hosting (like Render's Free Tier), these files will be lost when the instance restarts. A production environment should be upgraded to use cloud storage like AWS S3 or Cloudinary.
- **Email Notifications:** The "Forgot Password" flow and system alerts are mocked/UI-only. There is no active SMTP transport integrated to send real emails.
- **Granular Permissions:** Role-based access is implemented at the macro-level (e.g. Sales cannot see Warehouse inventory pages). It does not include micro-level permissions (e.g. Sales can view, but not edit certain fields).

---

## 📖 API Documentation (Postman)

A full Postman collection is included in the root directory: `FlowSphere_API_Collection.json`.
You can import this file directly into Postman to test the backend endpoints. Ensure you hit the `/auth/login` endpoint first to retrieve your JWT token, and set it as a Bearer Token for subsequent requests.

# Task Manager Backend

This is the backend for the Task Manager application, built with Node.js, Express, and Prisma.

## Setup Instructions for VS Code

Follow these steps to get the project running on your machine:

### 1. Clone the repository
```bash
git clone https://github.com/SONY420-GG/task-manager-backend.git
cd task-manager-backend/blackend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the `blackend` directory and add your PostgreSQL database URL:
```env
DATABASE_URL="your_postgresql_connection_string"
```

### 4. Sync Database Schema
```bash
npx prisma db push
```

### 5. Generate Prisma Client
```bash
npx prisma generate
```

### 6. Run the Development Server
```bash
npm run dev
```

The server will start at `http://localhost:5000` (or the port defined in `src/index.ts`).

## Technologies Used
- Node.js & Express
- Prisma ORM
- PostgreSQL (Neon.tech)
- TypeScript

# Rezumy 📄

Rezumy is a modern, high-fidelity AI-powered resume builder and portfolio editorial system designed to streamline your professional presence.

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have **Node.js** (v18 or higher) and **Docker** installed on your machine.

### 2. Environment Configuration

Create a `.env` file in the root directory. You can copy the template provided in `.env.example`:

```bash
cp .env.example .env
```

Here is a guide on how to acquire and configure each required key:

| Variable | Description | How to Obtain / Configure |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma. | Can be run locally using the provided Docker setup (`postgresql://rezumy:rezumy_secret@localhost:5434/rezumy`). Alternatively, use a hosted provider like [Neon](https://neon.tech/) or [Supabase](https://supabase.com/). |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens. | Generate a secure random string. In your terminal, you can run:<br>`openssl rand -base64 32` |
| `NEXT_PUBLIC_APP_URL` | The public base URL of the Next.js app. | For local development, use `http://localhost:3000`. |
| `GITHUB_CLIENT_ID` | GitHub OAuth client identifier. | 1. Go to [GitHub Developer Settings](https://github.com/settings/developers).<br>2. Click **New OAuth App**.<br>3. Set **Homepage URL** to `http://localhost:3000`.<br>4. Set **Authorization callback URL** to `http://localhost:3000/api/github/callback`.<br>5. Copy the generated **Client ID**. |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret. | Generate and copy the **Client Secret** from the same GitHub OAuth App created above. |
| `ENCRYPTION_KEY` | 32-character hex key (16 bytes) for encrypting GitHub access tokens using AES-128. | Generate a 32-character hexadecimal key by running:<br>`openssl rand -hex 16` |
| `GROQ_API_KEY` | API Key for LLM-powered resume parsing and job recommendations. | 1. Sign up / Log in to the [Groq Console](https://console.groq.com/).<br>2. Navigate to **API Keys** and generate a new key. |
| `SERPER_API_KEY` | API Key for web scraping and real-time job searches via Google Search API. | 1. Sign up / Log in to [Serper](https://serper.dev/).<br>2. Copy your API Key from the dashboard. |

### 3. Spin up the Database

Start the PostgreSQL database container:

```bash
docker compose up -d
```

### 4. Database Setup (Prisma)

Run database migrations to set up schemas:

```bash
npx prisma db push
```

### 5. Running the Application

Install dependencies and start the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🛠️ Development & Architecture

- **Framework**: [Next.js (App Router)](https://nextjs.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Authentication**: JWT & GitHub OAuth
- **APIs**: Groq API (AI parsing/processing), Serper API (Job queries)

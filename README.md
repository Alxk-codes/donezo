# Donezo — Personal Real-time Task & File Manager

A modern, responsive web-based personal task manager built with React, Vite, and Supabase. Organize tasks, attach files, set priorities, and stay in sync across all your devices.

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/Alxk-codes/donezo.git
cd donezo

# 2. Create environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# 3. Install and run
npm install
npm run dev
```

The app will be available at `http://localhost:5173/`

## 📋 Features

- **Authentication**: Sign up, login, and password reset with Supabase Auth
- **Task Management**: Create, edit, delete tasks with descriptions and deadlines
- **File Attachments**: Attach files (images, PDFs, docs) to tasks
- **Real-time Sync**: Updates instantly across all open tabs and devices
- **Priority & Status**: Set task priority levels and mark completion
- **Dashboard**: Quick overview with task statistics and summaries
- **Views**: Dashboard, Tasks list, Kanban board, Calendar, and Analytics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## ⚙️ Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Supabase Account** (for backend services)

## 🔧 Setup & Installation

### 1. Configure Environment Variables

Create `.env.local` from the template:

```bash
cp .env.example .env.local
```

Update `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_public_api_key
```

**To get these values:**
1. Go to your [Supabase project](https://supabase.com)
2. Navigate to Settings → API
3. Copy the Project URL and Anon (Public) Key

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

## 📦 Build for Production

```bash
npm run build
```

Output files will be in the `dist/` directory.

## 🧪 Preview Production Build

```bash
npm run preview
```

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build optimized production bundle |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint to check code quality |

## 🔐 Security

- **Never commit `.env.local`**: It's in `.gitignore` to prevent secret leaks
- **Use `.env.example`**: Template file for required variables (safe to commit)
- **Use Anon Key only**: Never expose Service Role or admin keys
- **Enable RLS**: Ensure Supabase Row Level Security is configured

## 📁 Project Structure

```
src/
├── components/    # React components
├── pages/         # Page components
├── context/       # React Context
├── lib/           # Supabase client
├── utils/         # Helper functions
├── styles/        # CSS
├── data/          # Demo data
└── assets/        # Images & icons

public/
├── manifest.json  # PWA manifest
└── sw.js          # Service worker
```

## 📱 Deployment

### Deploy to Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Deploy

### Other Platforms

The `dist/` folder can be deployed to:
- Netlify
- Firebase Hosting
- GitHub Pages
- AWS S3 + CloudFront

## 🛠️ Tech Stack

- **Frontend**: React 19
- **Build Tool**: Vite 8
- **Styling**: CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Icons**: Lucide React
- **Routing**: React Router v7
- **Date Handling**: date-fns
- **Linting**: ESLint

## 🐛 Troubleshooting

### Port 5173 Already in Use
```bash
npm run dev -- --port 3000
```

### Supabase Connection Issues
- Verify environment variables are correct
- Check Supabase project is active
- Ensure database tables and RLS policies are configured

### Build Errors
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📄 License

This project is private and used for personal task management.

## 👤 Author

Created by [Alxk-codes](https://github.com/Alxk-codes)

---

For detailed project specifications, see the `directives/` folder.

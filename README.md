# FindIt – Modern Lost & Found Community Portal

FindIt is a complete, modern, responsive web application designed to help people report lost items, list found possessions, and safely connect with rightful owners through verified claims, heuristic smart matching, and anti-fraud protections.

![FindIt Lost & Found Portal](https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1200&auto=format&fit=crop&q=80)

---

## 🚀 Key Features

- **Clean Modern UI**: Built with a clean, light theme with high-contrast typography, responsive cards, smooth transitions, and glassmorphism.
- **Smart Heuristic Matching Engine**: Compares lost and found listings across categories, tokenized keywords, date proximity, and landmarks to automatically flag potential matches with similarity percentages.
- **Side-by-Side Match Inspector**: Compare candidate reports side-by-side with algorithmic matching factor breakdown.
- **Anti-Fraud Security**: Confidential verification clues (e.g. lock screen wallpaper, serial numbers, engravings) are securely shielded from the public and only accessible to verified owners and admins.
- **Verified Ownership Claims**: Submit ownership proof and legal certification without exposing private phone numbers or personal emails.
- **Interactive Directory**: Multi-facet filters for item types (Lost vs. Found), 8 categories, date range, location, and sorting.
- **User Dashboard**: Track reported listings, review incoming claims, verify claimant proof, and mark items as returned to owner.
- **Admin Moderation Center**: Monitor all platform listings, review flagged items, inspect claims, manage accounts, and audit system activity logs.
- **Supabase Ready**: Includes ready-to-run [supabase_schema.sql](./supabase_schema.sql) with Row-Level Security (RLS) policies for production database deployment.

---

## 🔑 System Login Credentials

The application includes 5 pre-configured system accounts:

| Role | User ID / Username | Email | Password | Name |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin1` | `admin1@findit.com` | `admin1` | Admin One (Lead) |
| **Admin** | `admin2` | `admin2@findit.com` | `admin2` | Admin Two (Supervisor) |
| **User** | `user1` | `user1@findit.com` | `user1` | Alex Rivera |
| **User** | `user2` | `user2@findit.com` | `user2` | Brianna Smith |
| **User** | `user3` | `user3@findit.com` | `user3` | Carlos Mendez |

---

## 🛠️ Tech Stack

- **Frontend**: React 18 / Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Animations & Effects**: Canvas Confetti, Tailwind Animations
- **Backend / Storage**: Local persistent storage service with Supabase JS client integration fallback

---

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### 3. Production Build
```bash
npm run build
```

---

## 🗄️ Optional Supabase Setup

To connect to your own Supabase cloud database:
1. Copy `.env.example` to `.env` (or set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
2. Run the SQL script from `supabase_schema.sql` inside your Supabase project's SQL Editor to create tables with Row-Level Security (RLS).

# ⛓ Blockchain Simulator Demo — Complete Windows Setup Guide

## What This App Does

This is a visual blockchain simulator that teaches how blockchain technology works:

- Each **block** has an ID, Nonce, Data, and Hash
- The **Hash** is a SHA-256 fingerprint of `(id + nonce + data + prev_hash)`
- **Mining** = finding a Nonce that makes the hash start with `0000` (proof-of-work)
- **Edit any field** → card turns **red** (tampered / invalid)
- **Mine a block** → card turns **sky blue** (valid), and the next block's `Prev` hash updates
- Each block's hash **chains** into the next block's `Prev` field — this is the chain

---

## Prerequisites (install once)

### 1. Install Node.js
Download from https://nodejs.org (choose the LTS version)

To verify:
```cmd
node --version
npm --version
```

### 2. Install PostgreSQL
Download from https://www.postgresql.org/download/windows/

During installation:
- Set a password for the `postgres` user (remember it!)
- Keep the default port: `5432`
- Keep the default database: `postgres`

After installation, open **pgAdmin** (installed alongside PostgreSQL) and create a new database:
1. Right-click "Databases" → Create → Database
2. Name it: `blockchain_simulator`
3. Click Save

### 3. Install Git (optional, for cloning)
Download from https://git-scm.com

---

## Project Structure

```
blockchain-demo/
├── backend/                   ← Express + TypeScript API
│   ├── src/
│   │   ├── server.ts          ← Entry point — starts the server
│   │   ├── routes/
│   │   │   └── blocks.ts      ← All /api/blocks endpoints
│   │   ├── utils/
│   │   │   ├── db.ts          ← PostgreSQL connection + schema
│   │   │   └── crypto.ts      ← SHA-256 hashing + proof-of-work mining
│   │   ├── middleware/
│   │   │   └── errorHandler.ts ← Central error handling
│   │   └── types/
│   │       └── blockchain.ts  ← TypeScript interfaces
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                  ← React + Vite + TypeScript UI
│   ├── src/
│   │   ├── main.tsx           ← React bootstrap
│   │   ├── App.tsx            ← Root component
│   │   ├── components/
│   │   │   ├── BlockCard.tsx  ← Individual block card UI
│   │   │   └── ChainLink.tsx  ← Arrow connecting cards
│   │   ├── hooks/
│   │   │   └── useBlockchain.ts ← All state management
│   │   ├── utils/
│   │   │   ├── api.ts         ← All HTTP calls to backend
│   │   │   └── hash.ts        ← Browser-side SHA-256
│   │   ├── types/
│   │   │   └── blockchain.ts  ← TypeScript types
│   │   └── styles/
│   │       └── global.css     ← All styles
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── SETUP.md                   ← This file
```

---

## Step 1 — Configure the Database Connection

Open `backend/src/utils/db.ts` and check the connection settings:

```typescript
export const pool = new Pool({
  host:     process.env.PG_HOST     || 'localhost',
  port:     Number(process.env.PG_PORT) || 5432,
  database: process.env.PG_DATABASE || 'blockchain_demo',
  user:     process.env.PG_USER     || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres',  // ← change if your password differs
});
```

Either edit the defaults directly, or create a `.env` file inside `backend/`:

```
# backend/.env
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=blockchain_simulator
PG_USER=postgres
PG_PASSWORD=your_actual_password
```

---

## Step 2 — Install Backend Dependencies

Open **Command Prompt** or **PowerShell**, then:

```cmd
cd path\to\blockchain_simulator\backend
npm install
```

This installs: express, cors, pg, typescript, ts-node-dev, and type definitions.

---

## Step 3 — Start the Backend

```cmd
npm run dev
```

Expected output:
```
[DB] Genesis block seeded.
[DB] Database initialised successfully.
[SERVER] Blockchain API running on http://localhost:3000
[SERVER] Health: http://localhost:3000/health
```

The backend will:
1. Connect to PostgreSQL
2. Create the `blocks` table (if it doesn't exist)
3. Insert the genesis block (if the table is empty)
4. Start listening on port 3000

Test it: open http://localhost:3000/health in your browser — you should see `{"status":"ok"}`

---

## Step 4 — Install Frontend Dependencies

Open a **second** Command Prompt window:

```cmd
cd path\to\blockchain-demo\frontend
npm install
```

---

## Step 5 — Start the Frontend

```cmd
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in Xms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open **http://localhost:5173** in your browser.

---

## Using the App

### Anatomy of a Block Card

```
┌─────────────────────────────────┐
│ BLOCK  #1             ✓ Mined  │  ← Header: block number + status pill
├─────────────────────────────────┤
│ PREV                            │  ← Previous block's hash (hidden on block #1)
│ 0000a3f1c2d4...                 │
├─────────────────────────────────┤
│ NONCE                           │  ← The magic number found by mining
│ [   47291   ]                   │
├─────────────────────────────────┤
│ DATA                            │  ← Your text goes here
│ [ Hello, Blockchain!      ]     │
├─────────────────────────────────┤
│ HASH                            │  ← SHA-256 of (id + nonce + data + prev_hash)
│ 0000a3f1c2d4e5b6...            │  ← Green = starts "0000" (valid POW)
├─────────────────────────────────┤
│ ⛏ Mine              Nonce: 47K │  ← Mine button + found nonce display
└─────────────────────────────────┘
```

### Workflow

1. **Start**: You see Block #1 (genesis block) with empty data — sky blue background
2. **Edit Data**: Type anything into the Data field and click outside — card turns **red**
3. **Mine**: Click "⛏ Mine" — the server finds a nonce that makes hash start with `0000`
4. **Result**: Card turns **sky blue** again. Block #2's `Prev` field now shows this hash.
5. **Add Block**: Click "+ Add Block" to append a new block to the chain
6. **Tamper**: Edit an old block's data — it AND all blocks after it turn red

### Why Does Editing Turn the Card Red?

When you change any field (nonce or data), the SHA-256 hash changes. The new hash almost
certainly does NOT start with `0000`. So the block is no longer "mined" — it's invalid.

### Why Do Later Blocks Turn Red Too?

Block #2's `Prev` field stores Block #1's hash. If you re-mine Block #1, its hash changes.
Block #2's `Prev` is now stale — it points to the OLD hash. Block #2 becomes invalid.
You must re-mine every block after the one you changed. This is what makes blockchains
tamper-evident: changing one block forces you to redo ALL the work for every block after it.

---

## API Reference

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | /api/blocks            | Get all blocks                       |
| PUT    | /api/blocks/:id        | Update nonce/data (recalculate hash) |
| POST   | /api/blocks/:id/mine   | Run proof-of-work mining             |
| POST   | /api/blocks            | Add new block                        |
| GET    | /health                | Health check                         |

---

## Troubleshooting

**"connection refused" or "ECONNREFUSED"**
→ PostgreSQL is not running. Open Windows Services and start "postgresql-x64-16"

**"database blockchain_demo does not exist"**
→ Create it in pgAdmin (see Prerequisites step 2)

**"password authentication failed"**
→ Update the password in `backend/src/utils/db.ts` or `backend/.env`

**Port 3000 already in use**
→ Set `PORT=3001` in your environment and update Vite proxy in `vite.config.ts`

**Frontend shows blank page**
→ Open browser DevTools (F12) → Console — check for errors
→ Make sure the backend is running on port 3001 before starting the frontend

---

## How Blockchain Proof-of-Work Works (Quick Explanation)

Mining is essentially a brute-force search:

```
nonce = 0
loop:
  hash = SHA256( id + nonce + data + prev_hash )
  if hash starts with "0000":
    DONE! We found the winning nonce.
  else:
    nonce = nonce + 1
    try again
```

On average, for 4 leading zeros, you need ~65,536 tries (16^4).
Bitcoin uses ~74 leading zeros, requiring ~10^18 tries — this is why mining farms exist.

The key insight: finding the nonce is hard, but **verifying** it is instant (just compute one hash).

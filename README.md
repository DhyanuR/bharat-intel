# Bharat Intelligence 🇮🇳
### Real-time Indian Stock Market News + AI Trading Insights

A production-ready React app that aggregates financial news across 10 Indian market sectors and uses Claude AI to generate actionable trading insights for retail traders, swing traders, long-term investors, and institutional participants.

---

## 🚀 Deploy to Vercel in 5 Minutes

### Step 1 — Get Your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign in → **API Keys** → **Create Key**
3. Copy the key (starts with `sk-ant-...`)

### Step 2 — Upload to GitHub
1. Create a new repo at [github.com/new](https://github.com/new)
   - Name: `bharat-intel`
   - Private is fine
2. Upload ALL these files maintaining the folder structure:
   ```
   bharat-intel/
   ├── api/
   │   └── news.js
   ├── public/
   │   └── index.html
   ├── src/
   │   ├── index.js
   │   └── App.jsx
   ├── .gitignore
   ├── package.json
   └── vercel.json
   ```
   > **Tip**: Use GitHub Desktop or drag-and-drop the folder into the GitHub web UI

### Step 3 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up free with GitHub
2. Click **"Add New Project"** → Import your `bharat-intel` repo
3. Vercel auto-detects React — **no build settings needed**
4. Before clicking Deploy, click **"Environment Variables"** and add:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `sk-ant-...` (your key from Step 1)
5. Click **Deploy** ✅

Your app is live at: `https://bharat-intel-yourname.vercel.app`

---

## 💻 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Set your API key
cp .env.example .env.local
# Edit .env.local and add: ANTHROPIC_API_KEY=sk-ant-...

# 3. Start the app
npm start
# Opens at http://localhost:3000
```

> **Note**: The `/api/news` serverless function works automatically with `npm start` via the proxy setting in package.json when using Create React App's dev server on port 3000. For full local serverless testing, use `vercel dev` instead.

---

## 🏗️ Project Structure

```
bharat-intel/
├── api/
│   └── news.js          ← Vercel serverless function (secure API proxy)
│                           Keeps your API key server-side only
├── public/
│   └── index.html       ← HTML shell
├── src/
│   ├── index.js         ← React entry point
│   └── App.jsx          ← Main app (all UI components)
├── .env.example         ← Copy to .env.local for local dev
├── package.json         ← Dependencies
└── vercel.json          ← Vercel routing config
```

---

## ✨ Features

| Feature | Details |
|---|---|
| **10 Market Sectors** | Banking, IT, Oil & Gas, Auto/EV, Pharma, Metals, FMCG, Infrastructure, Global Macro, Regulatory |
| **10 News Sources** | ET Markets, Moneycontrol, Mint, Business Standard, NDTV Profit, Reuters, Bloomberg, NSE, BSE, Social Pulse |
| **AI News Generation** | Claude generates realistic, context-aware news for any sector on demand |
| **Trading Insights** | 6-part structured analysis: Market Impact, Trade Ideas (Intraday/Swing/Long-term), Key Levels, Risks, Institutional View, Time Sensitivity |
| **Auto Refresh** | Every 90 seconds, fetches fresh AI news for 2 random sectors |
| **Live Market Bar** | Nifty 50, Sensex, BankNifty, India VIX, USD/INR — updates every refresh |
| **Ticker Tape** | Scrolling live headlines across top |
| **Urgency Tags** | Breaking / High / Normal priority labels with pulsing animations |
| **Secure API** | API key never exposed to browser — all calls go through `/api/news` serverless proxy |

---

## 🔧 Customization

### Change refresh interval
In `src/App.jsx`, line 6:
```js
const REFRESH_INTERVAL = 90; // seconds — change to any value
```

### Add/remove sectors
In `src/App.jsx`, edit the `SECTORS` object to add new sectors with their stocks and keywords.

### Use a different Claude model
In `api/news.js`, change:
```js
model: "claude-opus-4-6"  // faster/cheaper: "claude-haiku-4-5-20251001"
```

---

## 📋 Important Notes

- **This app uses AI-generated news** for demonstration. For production use with real live news, integrate actual RSS feeds (ET Markets RSS, NSE announcements API) and use Claude to summarize/analyze them.
- **Not financial advice** — AI insights are for informational purposes only. Always do your own research.
- **API costs** — Each news refresh = ~2 Claude API calls. Each insight generation = 1 API call. Monitor usage at [console.anthropic.com](https://console.anthropic.com).

---

## 🆘 Troubleshooting

| Problem | Fix |
|---|---|
| "ANTHROPIC_API_KEY not configured" | Add the env variable in Vercel Dashboard → Settings → Environment Variables |
| White screen | Check browser console for errors; ensure `npm install` completed |
| News not loading | Click Refresh button; check Vercel Function logs in dashboard |
| Insight not generating | Check API key is valid and has credits at console.anthropic.com |

---

Built with React 18 · Vercel Serverless · Claude AI by Anthropic

// api/news.js — Vercel Serverless Function
// Proxies Claude API calls for live news generation
// API key is stored securely as an environment variable (ANTHROPIC_API_KEY)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured. Add it in Vercel → Settings → Environment Variables." });
  }

  try {
    const { sector, type } = req.body;

    if (!sector && !type) {
      return res.status(400).json({ error: "Missing required fields: sector or type" });
    }

    let requestBody;

    if (type === "insight") {
      // Generate trading insight for a specific news item
      const { newsItem } = req.body;
      requestBody = {
        model: "claude-opus-4-6",
        max_tokens: 1200,
        system: `You are a senior Indian equity research analyst at a top-tier institution (think Kotak Securities, ICICI Securities, Emkay Global). You provide hyper-specific, actionable insights for all investor types: intraday traders, swing traders, long-term investors, and institutional portfolio managers.

Use Indian market terminology: NSE/BSE, Nifty/BankNifty/Sensex, F&O (futures & options), circuit limits, bulk deals, block deals, SEBI, FII/DII, promoter holding, QIB, HNI, SIP, delivery %, open interest, upper/lower circuit.

Structure EVERY response exactly as:

📌 MARKET IMPACT
[2-3 sentences on immediate and medium-term market impact with specific index/sector movements expected]

🎯 TRADE IDEAS
• Intraday: [specific trade with entry zone, target, stop-loss in ₹]
• Swing (1-4 weeks): [specific stock/index with levels in ₹]
• Long-term (6-12 months): [investment thesis with CMP and price target in ₹]

📊 KEY LEVELS TO WATCH
[2-3 critical support/resistance levels for main affected stocks/indices]

⚠️ RISKS
[2-3 specific risks that could invalidate this thesis]

🏦 INSTITUTIONAL VIEW
[What FIIs, DIIs, or large operators are likely positioning for]

⏰ TIME SENSITIVITY
[How quickly this needs to be acted on: immediate/today/this week/medium-term]`,
        messages: [{
          role: "user",
          content: `NEWS: "${newsItem.title}"
SUMMARY: ${newsItem.summary}
SECTOR: ${newsItem.sector}
AFFECTED TICKERS: ${newsItem.tickers.join(", ")}
SENTIMENT: ${newsItem.sentiment.toUpperCase()}
SOURCE: ${newsItem.source}
URGENCY: ${newsItem.urgency.toUpperCase()}

Generate a precise, actionable trading insight with real price levels and specific strategies for Indian market participants.`,
        }],
      };
    } else {
      // Fetch live news for a sector
      const SECTORS_META = {
        "Banking & Finance": { stocks: ["HDFCBANK","ICICIBANK","SBIN","KOTAKBANK","AXISBANK","BAJFINANCE","HDFCLIFE"], keywords: ["RBI","repo rate","credit growth","NPA","NBFC","banking","insurance"] },
        "IT & Tech": { stocks: ["TCS","INFY","HCLTECH","WIPRO","TECHM","LTIM","PERSISTENT"], keywords: ["IT","software","outsourcing","deal wins","AI","digital","cloud"] },
        "Oil & Gas": { stocks: ["RELIANCE","ONGC","BPCL","HPCL","IOC","GAIL","IGL"], keywords: ["crude oil","Brent","refinery","OMC","GRM","natural gas","OPEC"] },
        "Auto & EV": { stocks: ["MARUTI","TATAMOTORS","M&M","BAJAJ-AUTO","HEROMOTOCO","EICHERMOT","TVSMOTOR"], keywords: ["automobile","EV","electric vehicle","two-wheeler","SUV","auto sales","PLI"] },
        "Pharma & Health": { stocks: ["SUNPHARMA","DRREDDY","CIPLA","DIVISLAB","AUROPHARMA","LUPIN","TORNTPHARM"], keywords: ["pharma","drug","FDA","USFDA","API","biosimilar","generic","healthcare"] },
        "Metals & Mining": { stocks: ["TATASTEEL","JSWSTEEL","HINDALCO","VEDL","COALINDIA","NMDC","SAIL"], keywords: ["steel","aluminium","copper","iron ore","metal","mining","coal","China demand"] },
        "FMCG & Consumer": { stocks: ["HINDUNILVR","ITC","NESTLEIND","BRITANNIA","DABUR","MARICO","COLPAL"], keywords: ["FMCG","consumer","rural demand","volume growth","food","household","staples"] },
        "Infrastructure": { stocks: ["LT","NTPC","POWERGRID","ADANIPORTS","ULTRACEMCO","SHREECEM","DLF"], keywords: ["infrastructure","capex","cement","power","road","highway","port","construction"] },
        "Global Macro": { stocks: ["NIFTY50","SENSEX","USDINR","GOLDBEES","NIFTYBEES"], keywords: ["Federal Reserve","Fed","US economy","China","global","inflation","recession","GDP"] },
        "Regulatory & Policy": { stocks: ["BSE","MCX","CDSL","CAMS","ANGELONE"], keywords: ["SEBI","RBI","government","policy","budget","GST","regulation","ministry"] },
      };

      const meta = SECTORS_META[sector] || { stocks: [], keywords: [] };

      requestBody = {
        model: "claude-opus-4-6",
        max_tokens: 1000,
        messages: [{
          role: "user",
          content: `You are a live Indian stock market news aggregator. Generate 3 REALISTIC, CURRENT news items for the "${sector}" sector that would appear on Economic Times, Moneycontrol, Mint, Business Standard, Reuters, or Bloomberg today in February 2026.

Focus on stocks: ${meta.stocks.slice(0, 6).join(", ")}
Keywords: ${meta.keywords.slice(0, 5).join(", ")}

Current market context:
- RBI considering rate cuts after holding at 6.5% — stance shifted to neutral
- FII net sellers YTD but selectively buying quality large-caps
- Q3 FY26 earnings season ongoing — beat/miss stories driving stocks
- US Fed paused rate cuts — dollar strong affecting EM flows
- China stimulus boosting metals/commodity demand
- Indian Budget FY27 expectations building — infra/capex themes in focus
- General elections completed — policy continuity confirmed
- India VIX elevated at ~14 — options premiums high

Return ONLY a valid JSON array (absolutely no markdown fences, no explanation, just raw JSON):
[
  {
    "id": "live_${Date.now()}_1",
    "title": "Specific headline with real numbers/percentages",
    "source": "Economic Times",
    "sourceId": "et",
    "time": "Just now",
    "sector": "${sector}",
    "sentiment": "bullish",
    "urgency": "high",
    "summary": "2-3 detailed sentences with specific figures, analyst names, market context, and quantified impact",
    "tickers": ["TICKER1", "TICKER2", "TICKER3"],
    "impact": "High"
  },
  {
    "id": "live_${Date.now()}_2",
    ...
  },
  {
    "id": "live_${Date.now()}_3",
    ...
  }
]

Rules:
- sourceId must be one of: et, mint, mc, bs, ndtv, reuters, bloomberg, nse, bse, social
- sentiment must be: bullish, bearish, or neutral
- urgency must be: breaking, high, or normal
- impact must be: High, Medium, or Low
- tickers must be real NSE-listed symbols
- Make each news item genuinely different in nature (e.g. earnings + regulatory + macro)`,
        }],
      };
    }

    const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(requestBody),
    });

    if (!anthropicResponse.ok) {
      const errText = await anthropicResponse.text();
      return res.status(anthropicResponse.status).json({ error: errText });
    }

    const data = await anthropicResponse.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error("API proxy error:", err);
    return res.status(500).json({ error: err.message });
  }
}

import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const REFRESH_INTERVAL = 90;

const SECTORS = {
  "Banking & Finance": {
    color: "#f0a500", icon: "🏦",
    stocks: ["HDFCBANK","ICICIBANK","SBIN","KOTAKBANK","AXISBANK","BAJFINANCE","HDFCLIFE","SBILIFE","BAJAJFINSV","INDUSINDBK"],
    keywords: ["RBI","repo rate","credit growth","NPA","NBFC","banking","PSU bank","private bank","insurance"],
  },
  "IT & Tech": {
    color: "#54a0ff", icon: "💻",
    stocks: ["TCS","INFY","HCLTECH","WIPRO","TECHM","LTIM","PERSISTENT","MPHASIS","COFORGE","OFSS"],
    keywords: ["IT","software","outsourcing","deal wins","AI","digital","cloud","technology"],
  },
  "Oil & Gas": {
    color: "#ff6b35", icon: "⛽",
    stocks: ["RELIANCE","ONGC","BPCL","HPCL","IOC","GAIL","IGL","MGL","PETRONET","OIL"],
    keywords: ["crude oil","Brent","refinery","OMC","GRM","natural gas","petrol","diesel","OPEC"],
  },
  "Auto & EV": {
    color: "#00d68f", icon: "🚗",
    stocks: ["MARUTI","TATAMOTORS","M&M","BAJAJ-AUTO","HEROMOTOCO","EICHERMOT","TVSMOTOR","ASHOKLEY","MOTHERSON","BOSCHLTD"],
    keywords: ["automobile","EV","electric vehicle","two-wheeler","SUV","auto sales","PLI","battery"],
  },
  "Pharma & Health": {
    color: "#a29bfe", icon: "💊",
    stocks: ["SUNPHARMA","DRREDDY","CIPLA","DIVISLAB","AUROPHARMA","LUPIN","TORNTPHARM","ALKEM","BIOCON","IPCA"],
    keywords: ["pharma","drug","FDA","USFDA","API","biosimilar","generic","healthcare","medicine"],
  },
  "Metals & Mining": {
    color: "#778ca3", icon: "⚙️",
    stocks: ["TATASTEEL","JSWSTEEL","HINDALCO","VEDL","COALINDIA","NMDC","SAIL","JINDALSTEL","NATIONALUM"],
    keywords: ["steel","aluminium","copper","iron ore","metal","mining","coal","China demand"],
  },
  "FMCG & Consumer": {
    color: "#fd9644", icon: "🛒",
    stocks: ["HINDUNILVR","ITC","NESTLEIND","BRITANNIA","DABUR","MARICO","COLPAL","GODREJCP","EMAMILTD","TATACONSUM"],
    keywords: ["FMCG","consumer","rural demand","volume growth","food","household","staples"],
  },
  "Infrastructure": {
    color: "#26de81", icon: "🏗️",
    stocks: ["LT","NTPC","POWERGRID","ADANIPORTS","ULTRACEMCO","SHREECEM","ACC","AMBUJACEMENT","DLF","GODREJPROP"],
    keywords: ["infrastructure","capex","cement","power","road","highway","port","construction","real estate"],
  },
  "Global Macro": {
    color: "#fc5c65", icon: "🌍",
    stocks: ["NIFTY50","SENSEX","USDINR","GOLDBEES","NIFTYBEES"],
    keywords: ["Federal Reserve","Fed","US economy","China","global","inflation","recession","GDP","trade war"],
  },
  "Regulatory & Policy": {
    color: "#45aaf2", icon: "⚖️",
    stocks: ["NIFTY50","BSE","MCX","CDSL","CAMS","ANGELONE"],
    keywords: ["SEBI","RBI","government","policy","budget","GST","regulation","ministry"],
  },
};

const ALL_SOURCES = [
  { id: "et", name: "Economic Times", flag: "🇮🇳", type: "indian" },
  { id: "mint", name: "Mint", flag: "🇮🇳", type: "indian" },
  { id: "mc", name: "Moneycontrol", flag: "🇮🇳", type: "indian" },
  { id: "bs", name: "Business Standard", flag: "🇮🇳", type: "indian" },
  { id: "ndtv", name: "NDTV Profit", flag: "🇮🇳", type: "indian" },
  { id: "reuters", name: "Reuters", flag: "🌐", type: "global" },
  { id: "bloomberg", name: "Bloomberg", flag: "🌐", type: "global" },
  { id: "nse", name: "NSE Official", flag: "📋", type: "exchange" },
  { id: "bse", name: "BSE Official", flag: "📋", type: "exchange" },
  { id: "social", name: "Social Pulse", flag: "📱", type: "social" },
];

const SENTIMENT = {
  bullish: { color: "#00d68f", bg: "rgba(0,214,143,0.12)", border: "rgba(0,214,143,0.3)", label: "▲ BULLISH" },
  bearish: { color: "#ff4757", bg: "rgba(255,71,87,0.12)", border: "rgba(255,71,87,0.3)", label: "▼ BEARISH" },
  neutral: { color: "#ffa502", bg: "rgba(255,165,2,0.12)", border: "rgba(255,165,2,0.3)", label: "◆ NEUTRAL" },
};

const URGENCY = {
  breaking: { color: "#ff4757", label: "🔴 BREAKING" },
  high: { color: "#ffa502", label: "🟡 HIGH" },
  normal: { color: "#888", label: "⚪ NORMAL" },
};

// ─── Seed Data ────────────────────────────────────────────────────────────────

const SEED_NEWS = [
  {
    id: "s1", title: "RBI MPC Shifts Stance to 'Neutral' — Rate Cut Cycle Could Begin in April",
    source: "Economic Times", sourceId: "et", time: "Just now", timestamp: Date.now(),
    sector: "Banking & Finance", sentiment: "bullish", urgency: "breaking",
    summary: "RBI MPC voted 4-2 to hold the benchmark repo rate at 6.5% while shifting policy stance from 'withdrawal of accommodation' to 'neutral'. Governor signals data-dependent approach as food inflation eases.",
    tickers: ["BANKNIFTY","HDFCBANK","ICICIBANK","SBIN","KOTAKBANK"], impact: "High",
  },
  {
    id: "s2", title: "Reliance Industries Q3 FY26: Net Profit ₹21,930 Cr — Jio ARPU Crosses ₹200",
    source: "Mint", sourceId: "mint", time: "14 min ago", timestamp: Date.now() - 840000,
    sector: "Oil & Gas", sentiment: "bullish", urgency: "high",
    summary: "RIL Q3 FY26 results beat street estimates. Jio revenue up 18% YoY driven by tariff hike impact. Retail EBITDA at record ₹6,800 Cr. New Energy segment crosses ₹500 Cr quarterly revenue milestone.",
    tickers: ["RELIANCE","NIFTY50"], impact: "High",
  },
  {
    id: "s3", title: "FII Outflows Ease — Net Buyers for First Time in 6 Weeks at ₹3,200 Cr",
    source: "Business Standard", sourceId: "bs", time: "31 min ago", timestamp: Date.now() - 1860000,
    sector: "Global Macro", sentiment: "bullish", urgency: "high",
    summary: "Foreign institutional investors turned net buyers on Thursday, ending a 6-week selling streak. Dollar index weakness and improving EM sentiment driving rotation back to Indian large-caps.",
    tickers: ["NIFTY50","SENSEX","USDINR"], impact: "High",
  },
  {
    id: "s4", title: "SEBI New F&O Rules Effective April 1 — Lot Sizes Double, Weekly Expiry Cut to 1",
    source: "Moneycontrol", sourceId: "mc", time: "52 min ago", timestamp: Date.now() - 3120000,
    sector: "Regulatory & Policy", sentiment: "bearish", urgency: "high",
    summary: "SEBI circular finalizes new F&O framework. Nifty lot size increases from 25 to 75. Only one weekly expiry per exchange allowed. NSE keeps Thursday expiry, BSE switches to Monday. Broker volumes expected to drop 20-25%.",
    tickers: ["BSE","MCX","ANGELONE","CDSL"], impact: "High",
  },
  {
    id: "s5", title: "IT Sector Q3 Preview: TCS, Infosys Deal Pipeline at Multi-Year High — Upgrade Cycle Begins",
    source: "NDTV Profit", sourceId: "ndtv", time: "1 hr ago", timestamp: Date.now() - 3900000,
    sector: "IT & Tech", sentiment: "bullish", urgency: "normal",
    summary: "Brokerages upgrading IT sector ahead of Q3 FY26 results. BFSI and healthcare verticals leading recovery. Gen-AI deals now 12% of total TCV vs 4% a year ago. TCS, Infosys both at buy with 15-18% upside.",
    tickers: ["TCS","INFY","HCLTECH","WIPRO","TECHM"], impact: "Medium",
  },
  {
    id: "s6", title: "Brent Crude Slips to $72 on OPEC+ Output Hike Fears — OMC Stocks Rally",
    source: "Reuters", sourceId: "reuters", time: "1.5 hr ago", timestamp: Date.now() - 5400000,
    sector: "Oil & Gas", sentiment: "bullish", urgency: "normal",
    summary: "Crude oil falls as OPEC+ members signal production increase from March. HPCL and BPCL marketing margins improve significantly. Analysts estimate ₹3-5 EPS upgrade for OMCs if crude stays below $75.",
    tickers: ["HPCL","BPCL","IOC","ONGC"], impact: "Medium",
  },
  {
    id: "s7", title: "Maruti Suzuki January Sales: +8.2% YoY — Brezza, Grand Vitara Lead Volume",
    source: "Business Standard", sourceId: "bs", time: "2 hr ago", timestamp: Date.now() - 7200000,
    sector: "Auto & EV", sentiment: "bullish", urgency: "normal",
    summary: "Maruti January wholesale at 1,89,301 units, up 8.2% YoY. SUV portfolio now 45% of total mix vs 32% three years ago. CNG vehicles at record 32% share. Management raises FY26 volume guidance.",
    tickers: ["MARUTI","TATAMOTORS","M&M","BAJAJ-AUTO"], impact: "Medium",
  },
  {
    id: "s8", title: "Sun Pharma Gets USFDA Nod for Generic Cancer Drug — $1.2Bn Market Opportunity",
    source: "Mint", sourceId: "mint", time: "2.5 hr ago", timestamp: Date.now() - 9000000,
    sector: "Pharma & Health", sentiment: "bullish", urgency: "high",
    summary: "Sun Pharma receives final USFDA approval for generic lenalidomide capsules. First-to-file advantage gives 180-day exclusivity. Analysts expect ₹800-1,100 Cr incremental revenue in FY27. Stock likely to gap up 3-4%.",
    tickers: ["SUNPHARMA","DRREDDY","CIPLA"], impact: "High",
  },
  {
    id: "s9", title: "China Stimulus ¥10 Trillion Infrastructure Push — JSW Steel, Tata Steel Major Beneficiaries",
    source: "Bloomberg", sourceId: "bloomberg", time: "3 hr ago", timestamp: Date.now() - 10800000,
    sector: "Metals & Mining", sentiment: "bullish", urgency: "normal",
    summary: "Beijing announces largest infrastructure stimulus package since 2008. Hot-rolled coil steel prices in Shanghai up 11% in 2 weeks. Indian steelmakers benefiting from improved export realizations and domestic demand pull.",
    tickers: ["TATASTEEL","JSWSTEEL","HINDALCO","SAIL","VEDL"], impact: "Medium",
  },
  {
    id: "s10", title: "Social Buzz: Retail Investors Piling Into PSU Infrastructure Stocks on Budget Hopes",
    source: "Social Pulse", sourceId: "social", time: "4 hr ago", timestamp: Date.now() - 14400000,
    sector: "Infrastructure", sentiment: "bullish", urgency: "normal",
    summary: "Twitter/Reddit trending: #BudgetStocks #PSUBoom. IRFC, RVNL, IRCTC trending as retail investors accumulate on dips. Options data shows significant call buildup in infrastructure ETFs suggesting bullish positioning.",
    tickers: ["IRFC","RVNL","IRCTC","NTPC","POWERGRID"], impact: "Low",
  },
];

// ─── API Calls (via secure /api/news proxy) ───────────────────────────────────

async function fetchLiveNewsAPI(sector, existingIds) {
  const response = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sector }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "API error");
  }

  const data = await response.json();
  const text = data.content?.map(c => c.text || "").join("") || "[]";
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);
  return parsed.filter(n => !existingIds.has(n.id));
}

async function generateInsightAPI(newsItem) {
  const response = await fetch("/api/news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: "insight", newsItem }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "API error");
  }

  const data = await response.json();
  return data.content?.map(c => c.text || "").join("") || "Unable to generate insight.";
}

// ─── Components ───────────────────────────────────────────────────────────────

function TickerTape({ news }) {
  const items = news.slice(0, 10)
    .map(n => `${n.tickers[0]} ${n.sentiment === "bullish" ? "▲" : "▼"}  ${n.title.slice(0, 55)}...`)
    .join("   ◈   ");
  const doubled = items + "   ◈   " + items;

  return (
    <div style={{
      background: "rgba(0,0,0,0.5)", borderBottom: "1px solid rgba(255,255,255,0.04)",
      overflow: "hidden", height: "30px", display: "flex", alignItems: "center",
    }}>
      <div style={{
        background: "#f0a500", color: "#0c0d15", fontSize: "9px", fontWeight: "900",
        padding: "0 12px", height: "100%", display: "flex", alignItems: "center",
        letterSpacing: "2px", flexShrink: 0,
      }}>LIVE</div>
      <div style={{ overflow: "hidden", flex: 1 }}>
        <div style={{
          whiteSpace: "nowrap", fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "10px", color: "#666",
          animation: "ticker 50s linear infinite",
          display: "inline-block",
        }}>{doubled}</div>
      </div>
    </div>
  );
}

function MarketBar({ markets, refreshing, lastRefresh, nextRefresh, onRefresh }) {
  return (
    <div style={{
      background: "rgba(10,11,18,0.98)", backdropFilter: "blur(24px)",
      borderBottom: "1px solid rgba(255,255,255,0.06)",
      padding: "0 24px", position: "sticky", top: 0, zIndex: 200,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0", height: "58px" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "11px", marginRight: "28px", flexShrink: 0 }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "9px",
            background: "linear-gradient(135deg, #f0a500 0%, #ff6b35 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "17px", fontWeight: "900", color: "#0c0d15",
            boxShadow: "0 4px 18px rgba(240,165,0,0.3)",
          }}>₹</div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "17px", color: "#f0f0f8", lineHeight: 1 }}>
              Bharat Intelligence
            </div>
            <div style={{ fontSize: "8px", color: "#f0a500", letterSpacing: "2.5px", textTransform: "uppercase" }}>
              Indian Market News AI
            </div>
          </div>
        </div>

        <div style={{ width: "1px", height: "32px", background: "rgba(255,255,255,0.07)", marginRight: "24px" }} />

        {/* Market data */}
        <div style={{ display: "flex", gap: "24px", flex: 1, alignItems: "center", overflow: "hidden" }}>
          {markets.map(m => (
            <div key={m.label} style={{ display: "flex", alignItems: "baseline", gap: "7px", flexShrink: 0 }}>
              <span style={{ fontSize: "9px", color: "#444", textTransform: "uppercase", letterSpacing: "0.5px" }}>{m.label}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "13px", color: "#bbb" }}>{m.value}</span>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px", fontWeight: "600",
                color: m.change.startsWith("+") ? "#00d68f" : "#ff4757",
              }}>{m.change}</span>
            </div>
          ))}
        </div>

        {/* Refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexShrink: 0 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "9px", color: "#3a3a4a" }}>
              {lastRefresh.toLocaleTimeString("en-IN", { hour12: true })}
            </div>
            <div style={{ fontSize: "9px", color: "#f0a500" }}>Next: {nextRefresh}s</div>
          </div>
          <button onClick={onRefresh} disabled={refreshing} style={{
            padding: "6px 14px", borderRadius: "8px",
            background: refreshing ? "rgba(240,165,0,0.08)" : "rgba(240,165,0,0.13)",
            border: "1px solid rgba(240,165,0,0.25)",
            color: "#f0a500", cursor: refreshing ? "wait" : "pointer",
            fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "5px",
          }}>
            <span style={{ display: "inline-block", animation: refreshing ? "spin 0.7s linear infinite" : "none" }}>↺</span>
            {refreshing ? "Fetching..." : "Refresh"}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <div style={{
              width: "6px", height: "6px", borderRadius: "50%", background: "#00d68f",
              animation: "pulse 1.5s ease infinite",
            }} />
            <span style={{ fontSize: "9px", color: "#00d68f", fontWeight: "700", letterSpacing: "1px" }}>LIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectorSidebar({ activeSector, onSelect, sectorCounts }) {
  return (
    <div style={{
      width: "210px", flexShrink: 0,
      borderRight: "1px solid rgba(255,255,255,0.05)",
      padding: "16px 0", overflowY: "auto",
    }}>
      <div style={{ fontSize: "8px", color: "#444", letterSpacing: "2px", textTransform: "uppercase", padding: "0 14px 10px" }}>
        Sectors
      </div>
      {[{ key: "All", label: "🌐 All Sectors", color: "#f0a500" }, ...Object.entries(SECTORS).map(([k, v]) => ({ key: k, label: `${v.icon} ${k}`, color: v.color }))].map(({ key, label, color }) => {
        const count = key === "All" ? sectorCounts.total : (sectorCounts[key] || 0);
        const active = activeSector === key;
        return (
          <button key={key} onClick={() => onSelect(key)} style={{
            width: "100%", padding: "8px 14px", textAlign: "left",
            background: active ? color + "14" : "transparent",
            border: "none", borderLeft: active ? `2px solid ${color}` : "2px solid transparent",
            color: active ? color : "#666",
            cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
            fontSize: "11px", fontWeight: active ? "600" : "400", transition: "all 0.15s",
          }}>
            <span>{label}</span>
            {count > 0 && (
              <span style={{
                fontSize: "9px", color: active ? color : "#444",
                background: "rgba(255,255,255,0.04)",
                padding: "1px 6px", borderRadius: "10px",
              }}>{count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

function NewsCard({ item, selected, onClick }) {
  const sent = SENTIMENT[item.sentiment] || SENTIMENT.neutral;
  const urg = URGENCY[item.urgency] || URGENCY.normal;
  const secCfg = SECTORS[item.sector] || { color: "#888" };

  return (
    <div onClick={() => onClick(item)} style={{
      background: selected ? `${secCfg.color}10` : "rgba(16,17,28,0.9)",
      border: selected ? `1px solid ${secCfg.color}44` : "1px solid rgba(255,255,255,0.045)",
      borderRadius: "13px", padding: "17px 18px", cursor: "pointer",
      transition: "all 0.18s", marginBottom: "9px",
      transform: selected ? "translateX(4px)" : "none",
      boxShadow: selected ? `0 4px 24px ${secCfg.color}12` : "none",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "9px" }}>
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          {item.urgency !== "normal" && (
            <span style={{
              fontSize: "8px", padding: "2px 7px", borderRadius: "4px",
              background: urg.color + "20", color: urg.color, fontWeight: "800", letterSpacing: "0.5px",
              animation: item.urgency === "breaking" ? "pulse 1.5s ease infinite" : "none",
            }}>{urg.label}</span>
          )}
          <span style={{
            fontSize: "8px", padding: "2px 8px", borderRadius: "20px",
            background: secCfg.color + "16", color: secCfg.color, fontWeight: "600",
          }}>{item.sector}</span>
          <span style={{
            fontSize: "8px", padding: "2px 8px", borderRadius: "20px",
            background: sent.bg, color: sent.color, border: `1px solid ${sent.border}`, fontWeight: "700",
          }}>{sent.label}</span>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "9px", color: "#3a3a52" }}>{item.time}</span>
          {item.isNew && <span style={{ fontSize: "9px", color: "#00d68f", fontWeight: "700" }}>✦ NEW</span>}
        </div>
      </div>

      <div style={{
        fontFamily: "'DM Serif Display', serif", fontSize: "15px",
        color: selected ? "#fff" : "#d8d8ee", lineHeight: "1.4", marginBottom: "9px",
      }}>{item.title}</div>

      <div style={{ fontSize: "11.5px", color: "#5a5a72", lineHeight: "1.7", marginBottom: "13px" }}>
        {item.summary}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
          {item.tickers.slice(0, 5).map(t => (
            <span key={t} style={{
              fontSize: "8.5px", padding: "2px 6px", borderRadius: "4px",
              background: "rgba(255,255,255,0.03)", color: "#777",
              fontFamily: "'IBM Plex Mono', monospace", border: "1px solid rgba(255,255,255,0.06)",
            }}>{t}</span>
          ))}
        </div>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{
            fontSize: "9px",
            color: item.impact === "High" ? "#ff4757" : item.impact === "Medium" ? "#ffa502" : "#555",
          }}>⬡ {item.impact}</span>
          <span style={{ fontSize: "9px", color: "#3a3a52" }}>{item.source}</span>
        </div>
      </div>
    </div>
  );
}

function InsightPanel({ news, insight, loading, error, onGenerate }) {
  const secCfg = news ? (SECTORS[news.sector] || { color: "#f0a500", icon: "📰" }) : null;
  const sent = news ? (SENTIMENT[news.sentiment] || SENTIMENT.neutral) : null;

  return (
    <div style={{
      width: "360px", flexShrink: 0,
      borderLeft: "1px solid rgba(255,255,255,0.045)",
      padding: "18px", overflowY: "auto",
    }}>
      {/* AI panel header */}
      <div style={{
        background: "linear-gradient(135deg, rgba(240,165,0,0.09), rgba(255,107,53,0.05))",
        border: "1px solid rgba(240,165,0,0.18)",
        borderRadius: "13px", padding: "16px", marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "13px" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "9px",
            background: "linear-gradient(135deg, #f0a500, #ff6b35)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px",
          }}>⚡</div>
          <div>
            <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "15px", color: "#f0f0f8" }}>AI Trade Intelligence</div>
            <div style={{ fontSize: "8px", color: "#f0a500", letterSpacing: "2px", textTransform: "uppercase" }}>Claude Opus · Secure Proxy</div>
          </div>
        </div>

        {news ? (
          <div style={{
            background: "rgba(0,0,0,0.3)", borderRadius: "9px", padding: "11px", marginBottom: "13px",
          }}>
            <div style={{ fontSize: "8px", color: "#444", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "5px" }}>
              {secCfg?.icon} {news.sector} · {news.source}
            </div>
            <div style={{ fontSize: "11.5px", color: "#b0b0cc", lineHeight: "1.5", fontStyle: "italic" }}>
              "{news.title}"
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
              <span style={{ fontSize: "8px", padding: "1px 7px", borderRadius: "10px", background: sent.bg, color: sent.color }}>{sent.label}</span>
              <span style={{ fontSize: "8px", color: "#444" }}>Impact: {news.impact}</span>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: "11px", color: "#3a3a52", textAlign: "center", padding: "6px 0", marginBottom: "13px" }}>
            ← Select any article to analyze
          </div>
        )}

        <button onClick={onGenerate} disabled={loading || !news} style={{
          width: "100%", padding: "10px", borderRadius: "9px",
          background: loading ? "rgba(240,165,0,0.1)" : news
            ? "linear-gradient(135deg, #f0a500, #ff6b35)"
            : "rgba(255,255,255,0.03)",
          border: "none",
          color: loading || !news ? "#444" : "#0c0d15",
          fontSize: "11px", fontWeight: "700",
          cursor: loading || !news ? "not-allowed" : "pointer",
          transition: "all 0.2s", letterSpacing: "0.5px",
        }}>
          {loading ? "⟳  Analyzing..." : news ? "⚡  Generate Trading Insight" : "Select article first"}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "36px 0", color: "#444" }}>
          <div style={{ fontSize: "28px", animation: "spin 2s linear infinite", display: "inline-block", marginBottom: "10px" }}>⟳</div>
          <div style={{ fontSize: "11px", lineHeight: "1.8" }}>
            Analyzing market context,<br />FII flows, F&O data,<br />and technical levels...
          </div>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div style={{
          background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)",
          borderRadius: "10px", padding: "14px", fontSize: "11px", color: "#ff4757", lineHeight: "1.7",
        }}>⚠️ {error}</div>
      )}

      {/* Insight */}
      {insight && !loading && (
        <div style={{
          background: "rgba(14,15,24,0.9)", border: "1px solid rgba(255,255,255,0.055)",
          borderRadius: "13px", padding: "16px", animation: "fadeSlideIn 0.5s ease",
        }}>
          <div style={{ fontSize: "8px", color: "#f0a500", textTransform: "uppercase", letterSpacing: "2px", marginBottom: "13px" }}>
            📊 Actionable Insight
          </div>
          <div style={{
            fontSize: "12px", color: "#c0c0dc", lineHeight: "1.9", whiteSpace: "pre-wrap",
          }}>{insight}</div>
        </div>
      )}

      {/* Empty state */}
      {!insight && !loading && !error && (
        <div style={{
          textAlign: "center", padding: "36px 18px",
          border: "1px dashed rgba(255,255,255,0.06)", borderRadius: "13px", color: "#333",
        }}>
          <div style={{ fontSize: "36px", marginBottom: "11px", opacity: 0.4 }}>🧠</div>
          <div style={{ fontSize: "11px", lineHeight: "1.8", color: "#444" }}>
            Select any article, then tap<br />
            <span style={{ color: "#f0a500" }}>Generate Trading Insight</span><br />
            for AI-powered analysis
          </div>
          <div style={{ marginTop: "14px", fontSize: "9px", color: "#2a2a3a", lineHeight: "1.7" }}>
            Covers: Intraday · Swing · Long-term<br />Institutional positioning · Risk factors
          </div>
        </div>
      )}

      {/* Source legend */}
      <div style={{ marginTop: "18px", padding: "13px", background: "rgba(255,255,255,0.018)", borderRadius: "10px" }}>
        <div style={{ fontSize: "8px", color: "#333", textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "9px" }}>
          News Sources
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
          {ALL_SOURCES.map(s => (
            <span key={s.id} style={{
              fontSize: "8.5px", padding: "2px 7px", borderRadius: "10px",
              background: "rgba(255,255,255,0.03)", color: "#444",
              border: "1px solid rgba(255,255,255,0.05)",
            }}>{s.flag} {s.name}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [allNews, setAllNews] = useState(SEED_NEWS);
  const [activeSector, setActiveSector] = useState("All");
  const [selectedNews, setSelectedNews] = useState(null);
  const [insight, setInsight] = useState("");
  const [insightError, setInsightError] = useState("");
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchStatus, setFetchStatus] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [nextRefresh, setNextRefresh] = useState(REFRESH_INTERVAL);
  const [markets, setMarkets] = useState([
    { label: "NIFTY 50", value: "24,180.10", change: "+0.34%" },
    { label: "SENSEX", value: "79,342.15", change: "+0.28%" },
    { label: "BANKNIFTY", value: "51,840.25", change: "+0.52%" },
    { label: "INDIA VIX", value: "13.42", change: "-2.10%" },
    { label: "USD/INR", value: "83.94", change: "+0.12%" },
  ]);

  const timerRef = useRef(null);
  const countdownRef = useRef(null);
  const existingIdsRef = useRef(new Set(SEED_NEWS.map(n => n.id)));

  const filteredNews = activeSector === "All"
    ? allNews
    : allNews.filter(n => n.sector === activeSector);

  const sectorCounts = allNews.reduce((acc, n) => {
    acc[n.sector] = (acc[n.sector] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});

  const updateMarkets = () => {
    setMarkets(prev => prev.map(m => {
      const val = parseFloat(m.value.replace(/,/g, ""));
      const delta = (Math.random() - 0.48) * val * 0.002;
      const newVal = val + delta;
      const chg = (delta / val) * 100;
      const formatted = newVal > 1000
        ? newVal.toLocaleString("en-IN", { maximumFractionDigits: 2 })
        : newVal.toFixed(2);
      return { ...m, value: formatted, change: `${chg >= 0 ? "+" : ""}${chg.toFixed(2)}%` };
    }));
  };

  const doRefresh = useCallback(async () => {
    setRefreshing(true);
    updateMarkets();
    const sectorNames = Object.keys(SECTORS);
    const chosen = [...sectorNames].sort(() => Math.random() - 0.5).slice(0, 2);

    for (const sector of chosen) {
      setFetchStatus(`Fetching ${sector} news via AI...`);
      try {
        const items = await fetchLiveNewsAPI(sector, existingIdsRef.current);
        const stamped = items.map(n => ({
          ...n,
          isNew: true,
          timestamp: Date.now(),
          time: "Just now",
        }));
        stamped.forEach(n => existingIdsRef.current.add(n.id));
        setAllNews(prev => [...stamped, ...prev].slice(0, 50));
      } catch (e) {
        console.error("Fetch error:", e);
      }
    }

    setFetchStatus("");
    setRefreshing(false);
    setLastRefresh(new Date());
    setNextRefresh(REFRESH_INTERVAL);

    setTimeout(() => {
      setAllNews(prev => prev.map(n => ({ ...n, isNew: false })));
    }, 12000);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(doRefresh, REFRESH_INTERVAL * 1000);
    countdownRef.current = setInterval(() => {
      setNextRefresh(p => (p <= 1 ? REFRESH_INTERVAL : p - 1));
    }, 1000);
    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [doRefresh]);

  const handleRefresh = () => {
    clearInterval(timerRef.current);
    doRefresh();
    timerRef.current = setInterval(doRefresh, REFRESH_INTERVAL * 1000);
  };

  const handleGenerateInsight = async () => {
    if (!selectedNews) return;
    setLoadingInsight(true);
    setInsight("");
    setInsightError("");
    try {
      const result = await generateInsightAPI(selectedNews);
      setInsight(result);
    } catch (e) {
      setInsightError(e.message || "Failed to generate insight. Check your API key in Vercel environment variables.");
    }
    setLoadingInsight(false);
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.25;} }
        @keyframes ticker { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0c0d15", color: "#e0e0f0", overflow: "hidden" }}>

        <MarketBar markets={markets} refreshing={refreshing} lastRefresh={lastRefresh} nextRefresh={nextRefresh} onRefresh={handleRefresh} />
        <TickerTape news={allNews} />

        {fetchStatus && (
          <div style={{
            background: "rgba(240,165,0,0.07)", borderBottom: "1px solid rgba(240,165,0,0.12)",
            padding: "5px 24px", fontSize: "10px", color: "#f0a500",
            display: "flex", alignItems: "center", gap: "8px", flexShrink: 0,
          }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            {fetchStatus}
          </div>
        )}

        {/* Body */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <SectorSidebar activeSector={activeSector} onSelect={setActiveSector} sectorCounts={sectorCounts} />

          {/* Feed */}
          <div style={{ flex: 1, overflowY: "auto", padding: "18px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: "19px", color: "#f0f0f8" }}>
                  {activeSector === "All" ? "All Market News" : activeSector}
                </div>
                <div style={{ fontSize: "10px", color: "#3a3a52", marginTop: "2px" }}>
                  {filteredNews.length} stories · {ALL_SOURCES.length} sources · auto-refresh {REFRESH_INTERVAL}s
                </div>
              </div>
              <div style={{ display: "flex", gap: "7px" }}>
                {["breaking", "high"].map(u => {
                  const count = filteredNews.filter(n => n.urgency === u).length;
                  if (!count) return null;
                  return (
                    <span key={u} style={{
                      fontSize: "9px", padding: "3px 9px", borderRadius: "20px",
                      background: URGENCY[u].color + "15", color: URGENCY[u].color, fontWeight: "700",
                    }}>{URGENCY[u].label} ×{count}</span>
                  );
                })}
              </div>
            </div>

            {filteredNews.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#333" }}>
                <div style={{ fontSize: "36px", marginBottom: "12px" }}>📡</div>
                <div style={{ fontSize: "12px" }}>
                  No stories for this sector yet.<br />
                  <span style={{ color: "#f0a500", cursor: "pointer" }} onClick={handleRefresh}>
                    Click Refresh to fetch live AI news →
                  </span>
                </div>
              </div>
            )}

            {filteredNews.map((item, i) => (
              <div key={item.id} style={{ animation: `fadeSlideIn 0.35s ${i * 0.025}s ease both` }}>
                <NewsCard
                  item={item}
                  selected={selectedNews?.id === item.id}
                  onClick={n => { setSelectedNews(n); setInsight(""); setInsightError(""); }}
                />
              </div>
            ))}
          </div>

          <InsightPanel
            news={selectedNews}
            insight={insight}
            loading={loadingInsight}
            error={insightError}
            onGenerate={handleGenerateInsight}
          />
        </div>
      </div>
    </>
  );
}

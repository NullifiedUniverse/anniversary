import { DEFAULT_SETTINGS } from '../shared/constants.js';

let settings = { ...DEFAULT_SETTINGS };
const $ = id => document.getElementById(id);

function msg(type, payload = {}) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type, payload }, r => {
      if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
      else res(r);
    });
  });
}

function fmtPrice(p, sym) {
  sym = sym || '$';
  if (p === null || p === undefined) return '—';
  if (p >= 1000) return sym + p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return sym + p.toFixed(4);
  if (p >= 0.001) return sym + p.toFixed(6);
  return sym + p.toFixed(8);
}

function fmtBig(n, sym) {
  sym = sym || '$';
  if (!n) return '—';
  if (n >= 1e12) return sym + (n / 1e12).toFixed(2) + 'T';
  if (n >= 1e9) return sym + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return sym + (n / 1e6).toFixed(2) + 'M';
  return sym + n.toLocaleString();
}

const COLORS = {
  bitcoin:'#f7931a',ethereum:'#627eea',solana:'#9945ff',binancecoin:'#f3ba2f',
  ripple:'#346aa9',cardano:'#0033ad',dogecoin:'#c2a633','the-open-network':'#0088cc',
  'avalanche-2':'#e84142',chainlink:'#2a5ada',polkadot:'#e6007a',
  'bitcoin-cash':'#8dc351',near:'#00c1de','matic-network':'#8247e5',
  litecoin:'#8c8c8c',uniswap:'#ff007a',cosmos:'#6f7390',stellar:'#7d00ff',
  optimism:'#ff0420',arbitrum:'#12aaff',monero:'#ff6600',tron:'#ff0013',
};

function avatar(coin) {
  const bg = COLORS[coin.id] || '#475569';
  const letter = (coin.symbol || coin.name || '?')[0].toUpperCase();
  return `<div class="coin-av" style="background:${bg}">${letter}</div>`;
}

function changeBadge(v) {
  if (v === null || v === undefined) return `<span class="badge neutral">—</span>`;
  const cls = v > 0 ? 'up' : v < 0 ? 'down' : 'neutral';
  const sign = v > 0 ? '+' : '';
  return `<span class="badge ${cls}">${sign}${v.toFixed(2)}%</span>`;
}

function miniSpark(prices, isUp) {
  if (!prices?.length) return '';
  const W = 56, H = 22;
  const sample = prices.filter((_, i) => i % Math.ceil(prices.length / 30) === 0);
  if (sample.length < 2) return '';
  const min = Math.min(...sample), max = Math.max(...sample);
  const range = max - min || 1;
  const pts = sample.map((p, i) => {
    const x = (i / (sample.length - 1)) * W;
    const y = H - ((p - min) / range) * (H - 3) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const color = isUp ? '#22c55e' : '#ef4444';
  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

// ── Watchlist ──────────────────────────────────────────────
async function loadWatchlist() {
  try {
    const data = await msg('GET_WATCHLIST');
    const coins = data.coins || [];
    const sym = data.currencySymbol || '$';
    const el = $('watchlistList');
    if (!coins.length) {
      el.innerHTML = `<div class="empty">Watchlist is empty.<br>Add coins in Settings.</div>`;
      return;
    }
    el.innerHTML = coins.map(c => {
      const ch = c.price_change_percentage_24h;
      const sp = c.sparkline_in_7d?.price || [];
      const isUp = ch >= 0;
      return `<div class="coin-row">
        ${avatar(c)}
        <div class="coin-meta">
          <span class="coin-name">${c.name}</span>
          <span class="coin-sym">${c.symbol.toUpperCase()}</span>
        </div>
        <div class="coin-spark">${miniSpark(sp, isUp)}</div>
        <div class="coin-price-col">
          <span class="coin-price">${fmtPrice(c.current_price, sym)}</span>
          ${changeBadge(ch)}
        </div>
      </div>`;
    }).join('');
    $('lastUpdated').textContent = 'Updated ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    $('watchlistList').innerHTML = `<div class="empty error">Failed to load prices</div>`;
  }
}

// ── Portfolio ──────────────────────────────────────────────
let selectedHoldingCoin = null;
let holdingSearchTimer;

async function loadPortfolio() {
  const portfolio = settings.portfolio || [];
  const el = $('portfolioList');
  if (!portfolio.length) {
    el.innerHTML = `<div class="empty">No holdings yet.</div>`;
    $('portfolioSummary').classList.add('hidden');
    return;
  }
  try {
    const data = await msg('GET_WATCHLIST');
    const priceMap = {};
    (data.coins || []).forEach(c => { priceMap[c.id] = c.current_price; });
    const sym = settings.currencySymbol || '$';
    let totalVal = 0, totalCost = 0;
    const rows = portfolio.map(h => {
      const price = priceMap[h.coinId] || 0;
      const val = h.amount * price;
      const cost = h.amount * (h.avgBuyPrice || 0);
      const pnl = val - cost;
      const pct = cost > 0 ? (pnl / cost) * 100 : 0;
      totalVal += val; totalCost += cost;
      const cls = pnl >= 0 ? 'up' : 'down';
      const sign = pnl >= 0 ? '+' : '-';
      return `<div class="coin-row portfolio-row" data-id="${h.coinId}">
        <div class="coin-meta">
          <span class="coin-name">${h.coinName || h.coinId}</span>
          <span class="coin-sym">${h.amount} ${(h.coinSymbol || '').toUpperCase()}</span>
        </div>
        <div class="coin-price-col">
          <span class="coin-price">${fmtBig(val, sym)}</span>
          <span class="badge ${cls}">${sign}${fmtBig(Math.abs(pnl), sym)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%)</span>
        </div>
        <button class="rm-holding icon-btn" data-id="${h.coinId}" title="Remove">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>`;
    });
    const totalPnl = totalVal - totalCost;
    const totalPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;
    $('portfolioSummary').classList.remove('hidden');
    $('portfolioTotal').textContent = fmtBig(totalVal, sym);
    const pnlEl = $('portfolioPnl');
    pnlEl.textContent = `${totalPnl >= 0 ? '+' : ''}${fmtBig(Math.abs(totalPnl), sym)} (${totalPct.toFixed(1)}%)`;
    pnlEl.className = `ps-value ${totalPnl >= 0 ? 'up' : 'down'}`;
    el.innerHTML = rows.join('');
    el.querySelectorAll('.rm-holding').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); removeHolding(btn.dataset.id); });
    });
  } catch {
    el.innerHTML = `<div class="empty error">Failed to load portfolio</div>`;
  }
}

async function removeHolding(coinId) {
  settings.portfolio = (settings.portfolio || []).filter(h => h.coinId !== coinId);
  await msg('SAVE_SETTINGS', { portfolio: settings.portfolio });
  loadPortfolio();
}

$('holdingCoinSearch').addEventListener('input', e => {
  clearTimeout(holdingSearchTimer);
  const q = e.target.value.trim();
  const dd = $('holdingSearchResults');
  if (q.length < 2) { dd.classList.add('hidden'); return; }
  holdingSearchTimer = setTimeout(async () => {
    const { coins } = await msg('SEARCH_COINS', { query: q });
    if (!coins.length) { dd.classList.add('hidden'); return; }
    dd.innerHTML = coins.slice(0, 6).map(c =>
      `<div class="dd-item" data-id="${c.id}" data-sym="${c.symbol}" data-name="${c.name}"><strong>${c.symbol}</strong> ${c.name}</div>`
    ).join('');
    dd.classList.remove('hidden');
    dd.querySelectorAll('.dd-item').forEach(item => {
      item.addEventListener('click', () => {
        selectedHoldingCoin = { id: item.dataset.id, symbol: item.dataset.sym, name: item.dataset.name };
        $('holdingCoinSearch').value = `${item.dataset.sym.toUpperCase()} — ${item.dataset.name}`;
        dd.classList.add('hidden');
      });
    });
  }, 300);
});

$('addHoldingBtn').addEventListener('click', () => {
  const form = $('addHoldingForm');
  form.classList.toggle('hidden');
  $('holdingCurSym').textContent = settings.currencySymbol || '$';
});

$('cancelHoldingBtn').addEventListener('click', () => {
  $('addHoldingForm').classList.add('hidden');
  selectedHoldingCoin = null;
  $('holdingCoinSearch').value = '';
  $('holdingAmount').value = '';
  $('holdingBuyPrice').value = '';
});

$('saveHoldingBtn').addEventListener('click', async () => {
  if (!selectedHoldingCoin) return;
  const amount = parseFloat($('holdingAmount').value);
  if (!amount || isNaN(amount)) return;
  const avgBuyPrice = parseFloat($('holdingBuyPrice').value) || 0;
  const portfolio = [...(settings.portfolio || [])];
  const idx = portfolio.findIndex(h => h.coinId === selectedHoldingCoin.id);
  const entry = { coinId: selectedHoldingCoin.id, coinSymbol: selectedHoldingCoin.symbol, coinName: selectedHoldingCoin.name, amount, avgBuyPrice };
  if (idx >= 0) portfolio[idx] = entry; else portfolio.push(entry);
  settings.portfolio = portfolio;
  await msg('SAVE_SETTINGS', { portfolio });
  $('cancelHoldingBtn').click();
  loadPortfolio();
});

// ── Market ─────────────────────────────────────────────────
async function loadMarket() {
  try {
    const [market, gas] = await Promise.all([msg('GET_MARKET_OVERVIEW'), msg('GET_GAS')]);
    // Fear & Greed
    if (market.fearGreed) {
      const { value, classification } = market.fearGreed;
      const color = value >= 60 ? '#22c55e' : value >= 40 ? '#f7931a' : '#ef4444';
      const arc = (value / 100) * 157;
      $('fgContent').innerHTML = `
        <div class="fg-inner">
          <div class="fg-gauge">
            <svg viewBox="0 0 120 68" class="fg-svg">
              <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="10" stroke-linecap="round"/>
              <path d="M10,60 A50,50 0 0,1 110,60" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"
                stroke-dasharray="${arc} 157" stroke-dashoffset="0"/>
            </svg>
            <div class="fg-num" style="color:${color}">${value}</div>
          </div>
          <div class="fg-class" style="color:${color}">${classification}</div>
        </div>`;
    }
    // Gas
    if (gas) {
      $('gasSlow').textContent = gas.slow;
      $('gasStd').textContent = gas.standard;
      $('gasFast').textContent = gas.fast;
    }
    // Global
    if (market.totalMarketCap) {
      $('gMktCap').textContent = fmtBig(market.totalMarketCap, '$');
      $('gVolume').textContent = fmtBig(market.totalVolume, '$');
      $('gBtcDom').textContent = market.btcDominance?.toFixed(1) + '%';
      $('gEthDom').textContent = market.ethDominance?.toFixed(1) + '%';
      $('gActive').textContent = market.activeCryptocurrencies?.toLocaleString();
    }
  } catch (e) { console.warn('Market load:', e); }
}

// ── Tabs & Nav ─────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === name));
  if (name === 'portfolio') loadPortfolio();
  if (name === 'market') loadMarket();
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

$('refreshBtn').addEventListener('click', async () => {
  $('refreshBtn').classList.add('spinning');
  try { await msg('FORCE_REFRESH'); await loadWatchlist(); } catch {}
  $('refreshBtn').classList.remove('spinning');
});

$('settingsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('manageWatchlistBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());

// Close dropdown on outside click
document.addEventListener('click', e => {
  if (!e.target.closest('#holdingCoinSearch') && !e.target.closest('#holdingSearchResults')) {
    $('holdingSearchResults').classList.add('hidden');
  }
});

async function init() {
  try { settings = await msg('GET_SETTINGS'); } catch { settings = { ...DEFAULT_SETTINGS }; }
  loadWatchlist();
}

init();

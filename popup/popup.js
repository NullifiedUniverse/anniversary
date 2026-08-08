import { DEFAULT_SETTINGS, COIN_COLORS } from '../shared/constants.js';

const STABLECOINS = new Set(['tether', 'usd-coin', 'dai', 'binance-usd']);

let settings = { ...DEFAULT_SETTINGS };
let watchlistCoins = [];
let watchlistSort = 'default';
let expandedCoinId = null;
let marketLoadedAt = 0;
let prevPrices = {};
let flashMap = {};
let lastUpdatedAt = 0;
let _staggerDone = false;
let _lastExpandedId = null;

const FALLBACK_COLORS = ['#f7931a', '#627eea', '#00d26a', '#9945ff', '#ff4d4d', '#12aaff'];

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

function roundForInput(p) {
  if (p === null || p === undefined || isNaN(p)) return '';
  if (p >= 1000) return Math.round(p);
  if (p >= 1) return parseFloat(p.toFixed(2));
  return parseFloat(p.toPrecision(4));
}

function avatar(coin) {
  const bg = COIN_COLORS[coin.id] || '#475569';
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

function sparkLarge(prices, isUp, animate) {
  if (!prices?.length) return '';
  const W = 326, H = 52;
  const sample = prices.filter((_, i) => i % Math.ceil(prices.length / 80) === 0);
  if (sample.length < 2) return '';
  const min = Math.min(...sample), max = Math.max(...sample);
  const range = max - min || 1;
  const pts = sample.map((p, i) => {
    const x = (i / (sample.length - 1)) * W;
    const y = H - ((p - min) / range) * (H - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  const color = isUp ? '#22c55e' : '#ef4444';
  const fillPts = pts + ` ${W},${H} 0,${H}`;
  const uid = Math.random().toString(36).slice(2, 7);
  return `<svg width="100%" height="${H}" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
    <defs><linearGradient id="sg${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${color}" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <polygon points="${fillPts}" fill="url(#sg${uid})"${animate ? ' class="spark-fill"' : ''}/>
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" pathLength="1"${animate ? ' class="spark-draw"' : ''}/>
  </svg>`;
}

// ── Sort ──────────────────────────────────────────────────────────────────────
document.querySelectorAll('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    watchlistSort = btn.dataset.sort;
    chrome.storage.local.set({ watchlistSort });
    renderWatchlist();
  });
});

// ── Quick add (watchlist tab) ─────────────────────────────────────────────────
let quickAddTimer;

$('quickAddBtn').addEventListener('click', () => {
  const panel = $('quickAddPanel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) $('quickAddSearch').focus();
});

$('quickAddSearch').addEventListener('input', e => {
  clearTimeout(quickAddTimer);
  const q = e.target.value.trim();
  const dd = $('quickAddResults');
  if (q.length < 2) { dd.classList.add('hidden'); return; }
  quickAddTimer = setTimeout(async () => {
    try {
      const { coins } = await msg('SEARCH_COINS', { query: q });
      if (!coins.length) { dd.classList.add('hidden'); return; }
      const wlIds = new Set(settings.watchlist || []);
      dd.innerHTML = coins.slice(0, 6).map(c => {
        const inWl = wlIds.has(c.id);
        return `<div class="dd-item${inWl ? ' dd-added' : ''}" data-id="${c.id}"><strong>${c.symbol}</strong> ${c.name}${inWl ? ' <span class="dd-check">✓</span>' : ''}</div>`;
      }).join('');
      dd.classList.remove('hidden');
      dd.querySelectorAll('.dd-item:not(.dd-added)').forEach(item => {
        item.addEventListener('click', async () => {
          try {
            const r = await msg('ADD_TO_WATCHLIST', { coinId: item.dataset.id });
            if (r?.success) {
              settings.watchlist = [...(settings.watchlist || []), item.dataset.id];
              $('quickAddSearch').value = '';
              dd.classList.add('hidden');
              $('quickAddPanel').classList.add('hidden');
              loadWatchlist();
            } else if (r?.reason === 'full') {
              item.innerHTML = '<strong>Watchlist full</strong> — max 20 coins';
            }
          } catch (_) {}
        });
      });
    } catch { dd.classList.add('hidden'); }
  }, 300);
});

function sortCoins(coins, sort) {
  const arr = [...coins];
  switch (sort) {
    case '24h_desc': return arr.sort((a, b) => (b.price_change_percentage_24h ?? -999) - (a.price_change_percentage_24h ?? -999));
    case '24h_asc':  return arr.sort((a, b) => (a.price_change_percentage_24h ?? 999) - (b.price_change_percentage_24h ?? 999));
    case 'name_asc': return arr.sort((a, b) => a.name.localeCompare(b.name));
    default: return arr;
  }
}

// ── Watchlist render ──────────────────────────────────────────────────────────
function buildExpandPanel(coin, animateChart) {
  const sp = coin.sparkline_in_7d?.price || [];
  const isUp = (coin.price_change_percentage_24h ?? 0) >= 0;
  const sym = coin.symbol.toUpperCase();
  const id = coin.id;
  const isStable = STABLECOINS.has(id);
  const priceStr = fmtPrice(coin.current_price, settings.currencySymbol || '$');
  const exchangeLinks = isStable ? '' : `
    <a href="https://www.binance.com/en/trade/${sym}_USDT" target="_blank" rel="noopener noreferrer" class="exch-pill">Binance ↗</a>
    <a href="https://www.tradingview.com/chart/?symbol=BINANCE:${sym}USDT" target="_blank" rel="noopener noreferrer" class="exch-pill">TradingView ↗</a>
  `;
  return `
    <div class="expand-chart">${sparkLarge(sp, isUp, animateChart)}</div>
    <div class="expand-actions">
      <button class="copy-price-btn" data-price="${priceStr}">Copy price · ${priceStr}</button>
      <button class="alert-btn" title="Set a price alert">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
        Alert
      </button>
    </div>
    <div class="alert-inline hidden">
      <select class="ai-type">
        <option value="above">Above ↑</option>
        <option value="below">Below ↓</option>
      </select>
      <input type="number" class="ai-price" step="any" min="0" value="${roundForInput(coin.current_price)}" placeholder="Target price">
      <button class="ai-save">Set alert</button>
    </div>
    <div class="expand-links">
      ${exchangeLinks}
      <a href="https://www.coingecko.com/en/coins/${id}" target="_blank" rel="noopener noreferrer" class="exch-pill exch-cg">CoinGecko ↗</a>
    </div>
  `;
}

function renderWatchlist() {
  const coins = sortCoins(watchlistCoins, watchlistSort);
  const sym = settings.currencySymbol || '$';
  const listEl = $('watchlistList');

  // Draw the expand chart only when a panel is newly opened, and stagger
  // rows only on the very first paint — re-renders stay motion-free
  const animateChart = expandedCoinId !== _lastExpandedId;
  _lastExpandedId = expandedCoinId;
  const doStagger = !_staggerDone && coins.length > 0;

  if (!coins.length) {
    listEl.innerHTML = `
      <div class="empty">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.45"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        <span>Your watchlist is empty</span>
        <button class="empty-cta">+ Add coins</button>
      </div>`;
    listEl.querySelector('.empty-cta').addEventListener('click', () => chrome.runtime.openOptionsPage());
    return;
  }

  listEl.innerHTML = '';

  coins.forEach((c, i) => {
    const ch = c.price_change_percentage_24h;
    const sp = c.sparkline_in_7d?.price || [];
    const isUp = (ch ?? 0) >= 0;
    const isExpanded = expandedCoinId === c.id;
    const hasAlert = (settings.alerts || []).some(a => a.coinId === c.id);

    const rowEl = document.createElement('div');
    rowEl.className = 'coin-row' + (isExpanded ? ' row-expanded' : '');
    if (doStagger) {
      rowEl.classList.add('row-enter');
      rowEl.style.animationDelay = `${Math.min(i * 25, 250)}ms`;
    }
    rowEl.innerHTML = `
      ${avatar(c)}
      <div class="coin-meta">
        <span class="coin-name">${c.name}${hasAlert ? '<svg class="row-bell" width="9" height="9" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>' : ''}</span>
        <span class="coin-sym">${c.symbol.toUpperCase()}</span>
      </div>
      <div class="coin-spark">${miniSpark(sp, isUp)}</div>
      <div class="coin-price-col">
        <span class="coin-price${flashMap[c.id] ? ' flash-' + flashMap[c.id] : ''}">${fmtPrice(c.current_price, sym)}</span>
        ${changeBadge(ch)}
      </div>
      <svg class="row-chevron${isExpanded ? ' open' : ''}" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
    `;
    rowEl.addEventListener('click', () => {
      expandedCoinId = (expandedCoinId === c.id) ? null : c.id;
      chrome.storage.local.set({ expandedCoinId });
      renderWatchlist();
    });
    listEl.appendChild(rowEl);

    if (isExpanded) {
      const panelEl = document.createElement('div');
      panelEl.className = 'expand-panel';
      panelEl.innerHTML = buildExpandPanel(c, animateChart);
      panelEl.querySelectorAll('a').forEach(a => a.addEventListener('click', e => e.stopPropagation()));
      const copyBtn = panelEl.querySelector('.copy-price-btn');
      if (copyBtn) {
        copyBtn.addEventListener('click', e => {
          e.stopPropagation();
          const price = copyBtn.dataset.price;
          navigator.clipboard.writeText(price).then(() => {
            const orig = copyBtn.textContent;
            copyBtn.textContent = '✓ Copied!';
            setTimeout(() => { copyBtn.textContent = orig; }, 1500);
          }).catch(() => {});
        });
      }
      const alertBtn = panelEl.querySelector('.alert-btn');
      const alertForm = panelEl.querySelector('.alert-inline');
      if (alertBtn && alertForm) {
        alertBtn.addEventListener('click', e => {
          e.stopPropagation();
          alertForm.classList.toggle('hidden');
          if (!alertForm.classList.contains('hidden')) alertForm.querySelector('.ai-price').focus();
        });
        alertForm.addEventListener('click', e => e.stopPropagation());
        alertForm.querySelector('.ai-save').addEventListener('click', async e => {
          e.stopPropagation();
          const saveBtn = alertForm.querySelector('.ai-save');
          const price = parseFloat(alertForm.querySelector('.ai-price').value);
          const type = alertForm.querySelector('.ai-type').value;
          if (!price || isNaN(price) || price <= 0) return;
          const alerts = [...(settings.alerts || [])];
          const dupe = alerts.some(a => a.coinId === c.id && a.type === type && Math.abs(a.price - price) < 1e-9);
          if (dupe) {
            saveBtn.textContent = 'Exists!';
            setTimeout(() => { saveBtn.textContent = 'Set alert'; }, 1600);
            return;
          }
          alerts.push({ coinId: c.id, coinSymbol: c.symbol, coinName: c.name, type, price, repeatMode: 'once', lastFiredAt: 0 });
          try {
            await msg('SAVE_SETTINGS', { alerts });
            settings.alerts = alerts;
            saveBtn.textContent = '✓ Set';
            setTimeout(() => renderWatchlist(), 900);
          } catch {
            saveBtn.textContent = 'Failed';
            setTimeout(() => { saveBtn.textContent = 'Set alert'; }, 1600);
          }
        });
      }
      listEl.appendChild(panelEl);
    }
  });

  if (doStagger) _staggerDone = true;
  flashMap = {};
}

async function loadWatchlist() {
  try {
    const data = await msg('GET_WATCHLIST');
    const coins = data.coins || [];
    coins.forEach(c => {
      const prev = prevPrices[c.id];
      if (prev != null && c.current_price != null && c.current_price !== prev) {
        flashMap[c.id] = c.current_price > prev ? 'up' : 'down';
      }
      prevPrices[c.id] = c.current_price;
    });
    watchlistCoins = coins;
    if (data.currencySymbol) settings.currencySymbol = data.currencySymbol;
    renderWatchlist();
    lastUpdatedAt = data.fetchedAt || Date.now();
    renderUpdatedTs();
  } catch {
    $('watchlistList').innerHTML = `<div class="empty error">Failed to load prices</div>`;
  }
}

// ── Portfolio ─────────────────────────────────────────────────────────────────
let selectedHoldingCoin = null;
let holdingSearchTimer;

async function loadPortfolio() {
  const portfolio = settings.portfolio || [];
  const el = $('portfolioList');
  if (!portfolio.length) {
    el.innerHTML = `
      <div class="empty">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.45"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
        <span>No holdings yet</span>
        <button class="empty-cta">+ Add your first holding</button>
      </div>`;
    el.querySelector('.empty-cta').addEventListener('click', () => $('addHoldingBtn').click());
    $('portfolioSummary').classList.add('hidden');
    return;
  }
  el.innerHTML = `<div class="loading-state"><div class="spinner"></div></div>`;
  try {
    const data = await msg('GET_WATCHLIST');
    const priceMap = {};
    const changeMap = {};
    (data.coins || []).forEach(c => {
      priceMap[c.id] = c.current_price;
      changeMap[c.id] = c.price_change_percentage_24h;
    });
    const sym = (data.currencySymbol || settings.currencySymbol) || '$';
    const cur = data.currency || settings.currency || 'usd';

    const missingIds = portfolio.map(h => h.coinId).filter(id => !(id in priceMap));
    if (missingIds.length) {
      try {
        const extra = await msg('GET_SIMPLE_PRICES', { coinIds: missingIds, currency: cur });
        Object.assign(priceMap, extra.priceMap || {});
        Object.assign(changeMap, extra.changeMap || {});
      } catch (_) {}
    }

    let totalVal = 0, totalCost = 0;
    const rows = portfolio.map(h => {
      const price = priceMap[h.coinId] ?? 0;
      const val = h.amount * price;
      const cost = h.amount * (h.avgBuyPrice || 0);
      const pnl = val - cost;
      const pct = cost > 0 ? (pnl / cost) * 100 : 0;
      totalVal += val; totalCost += cost;
      const cls = pnl >= 0 ? 'up' : 'down';
      const sign = pnl >= 0 ? '+' : '-';
      return `<div class="coin-row portfolio-row" data-id="${h.coinId}" title="Click to edit">
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
    pnlEl.textContent = `${totalPnl >= 0 ? '+' : '-'}${fmtBig(Math.abs(totalPnl), sym)} (${totalPct.toFixed(1)}%)`;
    pnlEl.className = `ps-value ${totalPnl >= 0 ? 'up' : 'down'}`;

    let dayPnl = 0, dayBase = 0;
    portfolio.forEach(h => {
      const price = priceMap[h.coinId];
      const pct = changeMap[h.coinId];
      if (price != null && pct != null && isFinite(pct) && pct > -100) {
        const val = h.amount * price;
        const prev = val / (1 + pct / 100);
        dayPnl += val - prev;
        dayBase += prev;
      }
    });
    const dayEl = $('portfolioDay');
    if (dayEl) {
      const dayPct = dayBase > 0 ? (dayPnl / dayBase) * 100 : 0;
      dayEl.textContent = `${dayPnl >= 0 ? '+' : '-'}${fmtBig(Math.abs(dayPnl), sym)} (${dayPct >= 0 ? '+' : ''}${dayPct.toFixed(1)}%)`;
      dayEl.className = `ps-value ${dayPnl >= 0 ? 'up' : 'down'}`;
    }

    const allocEl = $('allocBar');
    if (allocEl) {
      if (totalVal > 0) {
        const segs = portfolio
          .map(h => ({ h, val: h.amount * (priceMap[h.coinId] ?? 0) }))
          .filter(x => x.val > 0)
          .sort((a, b) => b.val - a.val)
          .map(({ h, val }, i) => {
            const pct = (val / totalVal) * 100;
            const color = COIN_COLORS[h.coinId] || FALLBACK_COLORS[i % FALLBACK_COLORS.length];
            return `<div class="alloc-seg" style="width:${pct.toFixed(2)}%;background:${color}" title="${(h.coinSymbol || h.coinId).toUpperCase()} · ${pct.toFixed(1)}%"></div>`;
          }).join('');
        allocEl.innerHTML = `<div class="alloc-bar">${segs}</div>`;
        allocEl.classList.remove('hidden');
      } else {
        allocEl.classList.add('hidden');
      }
    }

    el.innerHTML = rows.join('');
    el.querySelectorAll('.rm-holding').forEach(btn => {
      btn.addEventListener('click', e => { e.stopPropagation(); removeHolding(btn.dataset.id); });
    });
    el.querySelectorAll('.portfolio-row').forEach(row => {
      row.addEventListener('click', () => {
        const h = (settings.portfolio || []).find(x => x.coinId === row.dataset.id);
        if (!h) return;
        selectedHoldingCoin = { id: h.coinId, symbol: h.coinSymbol, name: h.coinName };
        $('holdingCoinSearch').value = `${(h.coinSymbol || '').toUpperCase()} — ${h.coinName || h.coinId}`;
        $('holdingAmount').value = h.amount;
        $('holdingBuyPrice').value = h.avgBuyPrice || '';
        $('holdingCurSym').textContent = settings.currencySymbol || '$';
        $('saveHoldingBtn').textContent = 'Update Holding';
        $('addHoldingForm').classList.remove('hidden');
      });
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
    try {
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
    } catch (_) { dd.classList.add('hidden'); }
  }, 300);
});

$('addHoldingBtn').addEventListener('click', () => {
  $('addHoldingForm').classList.toggle('hidden');
  $('holdingCurSym').textContent = settings.currencySymbol || '$';
});

$('cancelHoldingBtn').addEventListener('click', () => {
  $('addHoldingForm').classList.add('hidden');
  selectedHoldingCoin = null;
  $('holdingCoinSearch').value = '';
  $('holdingAmount').value = '';
  $('holdingBuyPrice').value = '';
  $('saveHoldingBtn').textContent = 'Add Holding';
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

// ── Market widgets ────────────────────────────────────────────────────────────
function renderConverter() {
  const el = $('convSection');
  if (!el) return;
  const sym = settings.currencySymbol || '$';
  if (!watchlistCoins.length) {
    el.innerHTML = `<div style="padding:14px 16px;font-size:11.5px;color:var(--t-subtle)">Add coins to watchlist to use the converter.</div>`;
    return;
  }
  const options = watchlistCoins.map(c =>
    `<option value="${c.id}">${c.symbol.toUpperCase()} — ${c.name}</option>`
  ).join('');
  el.innerHTML = `
    <div class="conv-inner">
      <div class="conv-input-row">
        <input type="number" id="convAmount" class="conv-input" placeholder="1" value="1" min="0" step="any" autocomplete="off">
        <select id="convCoin" class="conv-select">${options}</select>
      </div>
      <div class="conv-output" id="convOutput"></div>
    </div>
  `;
  const updateConv = () => {
    const amount = parseFloat($('convAmount').value) || 0;
    const coinId = $('convCoin').value;
    const coin = watchlistCoins.find(c => c.id === coinId);
    const out = $('convOutput');
    if (!coin || !amount || !out) return;
    const totalFiat = amount * coin.current_price;
    const btc = watchlistCoins.find(c => c.id === 'bitcoin');
    const eth = watchlistCoins.find(c => c.id === 'ethereum');
    let lines = [`<div class="conv-row"><span class="conv-label">≈ Value</span><span class="conv-val">${fmtPrice(totalFiat, sym)}</span></div>`];
    if (btc && coin.id !== 'bitcoin') lines.push(`<div class="conv-row"><span class="conv-label">≈ BTC</span><span class="conv-val">₿ ${(totalFiat / btc.current_price).toFixed(8)}</span></div>`);
    if (eth && coin.id !== 'ethereum') lines.push(`<div class="conv-row"><span class="conv-label">≈ ETH</span><span class="conv-val">Ξ ${(totalFiat / eth.current_price).toFixed(6)}</span></div>`);
    out.innerHTML = lines.join('');
  };
  $('convAmount').addEventListener('input', updateConv);
  $('convCoin').addEventListener('change', updateConv);
  updateConv();
}

async function renderGasCalc(standardGwei) {
  const el = $('gasCalcEl');
  if (!el) return;
  const gwei = parseFloat(standardGwei);
  if (!gwei || isNaN(gwei)) return;
  const ethCoin = watchlistCoins.find(c => c.id === 'ethereum');
  let ethPrice = ethCoin?.current_price;
  const sym = settings.currencySymbol || '$';

  if (!ethPrice) {
    try {
      const res = await msg('GET_SIMPLE_PRICES', { coinIds: ['ethereum'], currency: settings.currency || 'usd' });
      ethPrice = res.priceMap?.ethereum;
    } catch (_) {}
  }

  const ops = [
    { label: 'ETH Transfer', gas: 21_000 },
    { label: 'ERC-20 Transfer', gas: 65_000 },
    { label: 'Uniswap Swap', gas: 150_000 },
    { label: 'NFT Mint', gas: 100_000 },
  ];
  el.innerHTML = `<div class="gas-ops">${ops.map(op => {
    const costEth = op.gas * gwei * 1e-9;
    const display = ethPrice ? sym + (costEth * ethPrice).toFixed(2) : (costEth * 1e6).toFixed(2) + ' μETH';
    return `<div class="gas-op"><span class="gas-op-lbl">${op.label}</span><span class="gas-op-val">${display}</span></div>`;
  }).join('')}</div>`;
}

function renderTrending(coins) {
  const el = $('trendEl');
  if (!el || !coins.length) return;
  const sym = settings.currencySymbol || '$';
  const watchlistIds = new Set(watchlistCoins.map(c => c.id));
  el.innerHTML = coins.map((c, i) => {
    const ch = c.priceChangePercent24h;
    const chCls = (ch ?? 0) > 0 ? 'up' : (ch ?? 0) < 0 ? 'down' : 'neutral';
    const chSign = (ch ?? 0) > 0 ? '+' : '';
    const priceStr = (c.price && typeof c.price === 'number') ? fmtPrice(c.price, sym) : '—';
    const inWl = watchlistIds.has(c.id);
    return `<div class="trend-row" data-id="${c.id}" title="Open on CoinGecko">
      <span class="trend-rank">${i + 1}</span>
      <div class="trend-meta">
        <span class="trend-name">${c.name}</span>
        <span class="trend-sym">${c.symbol}</span>
      </div>
      <div class="trend-right">
        <span class="trend-price">${priceStr}</span>
        ${ch != null ? `<span class="badge ${chCls}" style="margin-top:0">${chSign}${ch.toFixed(2)}%</span>` : ''}
      </div>
      <button class="trend-watch${inWl ? ' in-wl' : ''}" data-id="${c.id}" title="${inWl ? 'In watchlist' : 'Add to watchlist'}">${inWl ? '✓' : '+'}</button>
    </div>`;
  }).join('');

  el.querySelectorAll('.trend-row').forEach(row => {
    row.addEventListener('click', () => {
      chrome.tabs.create({ url: `https://www.coingecko.com/en/coins/${row.dataset.id}` });
    });
  });

  el.querySelectorAll('.trend-watch:not(.in-wl)').forEach(btn => {
    btn.addEventListener('click', async e => {
      e.stopPropagation();
      const coinId = btn.dataset.id;
      try {
        const r = await msg('ADD_TO_WATCHLIST', { coinId });
        if (r?.success) {
          btn.classList.add('in-wl');
          btn.textContent = '✓';
          btn.title = 'In watchlist';
          if (!r.alreadyIn) {
            settings.watchlist = [...(settings.watchlist || []), coinId];
            loadWatchlist();
          }
        } else if (r?.reason === 'full') {
          btn.textContent = '!';
          btn.title = 'Watchlist is full (max 20 coins)';
          setTimeout(() => { btn.textContent = '+'; btn.title = 'Add to watchlist'; }, 2500);
        }
      } catch (_) {}
    });
  });
}

async function loadMarket() {
  const section = $('market');
  // Skip full rebuild if market data was loaded within the last 2 minutes
  if (section.innerHTML && Date.now() - marketLoadedAt < 120_000) return;

  const gasEnabled = settings.gasTrackerEnabled !== false;
  const gasWidget = gasEnabled ? `
      <div class="widget">
        <div class="widget-title">ETH Gas Tracker <span class="widget-unit">Gwei</span></div>
        <div class="gas-row">
          <div class="gas-cell" id="gasSlow"><span class="gas-lbl">Slow</span><span class="gas-val">—</span></div>
          <div class="gas-cell" id="gasStd"><span class="gas-lbl">Standard</span><span class="gas-val">—</span></div>
          <div class="gas-cell" id="gasFast"><span class="gas-lbl">Fast</span><span class="gas-val">—</span></div>
        </div>
        <div id="gasCalcEl"></div>
      </div>` : '';

  section.innerHTML = `
    <div class="market-inner">
      <div class="widget">
        <div class="widget-title">Fear &amp; Greed Index</div>
        <div class="fg-wrap" id="fgContent"><div class="spinner" style="margin:20px auto"></div></div>
      </div>
      ${gasWidget}
      <div class="widget">
        <div class="widget-title">Quick Converter</div>
        <div id="convSection"></div>
      </div>
      <div class="widget">
        <div class="widget-title">Trending <span class="widget-unit">Top 7 · 24h</span></div>
        <div id="trendEl"><div class="spinner" style="margin:16px auto"></div></div>
      </div>
      <div class="widget">
        <div class="widget-title">Global Market</div>
        <div class="stats-list">
          <div class="stat-row"><span class="stat-lbl">Market Cap</span><span id="gMktCap" class="stat-val">—</span></div>
          <div class="stat-row"><span class="stat-lbl">24h Volume</span><span id="gVolume" class="stat-val">—</span></div>
          <div class="stat-row"><span class="stat-lbl">BTC Dominance</span><span id="gBtcDom" class="stat-val">—</span></div>
          <div class="stat-row"><span class="stat-lbl">ETH Dominance</span><span id="gEthDom" class="stat-val">—</span></div>
          <div class="stat-row"><span class="stat-lbl">Active Coins</span><span id="gActive" class="stat-val">—</span></div>
        </div>
      </div>
    </div>
  `;

  if (!watchlistCoins.length) {
    try {
      const wl = await msg('GET_WATCHLIST');
      watchlistCoins = wl.coins || [];
      if (wl.currencySymbol) settings.currencySymbol = wl.currencySymbol;
    } catch (_) {}
  }
  renderConverter();

  try {
    const [market, gas, trending] = await Promise.all([
      msg('GET_MARKET_OVERVIEW'),
      gasEnabled ? msg('GET_GAS') : Promise.resolve(null),
      msg('GET_TRENDING'),
    ]);

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
          <div>
            <div class="fg-class" style="color:${color}">${classification}</div>
            <div class="fg-desc">Fear &amp; Greed</div>
          </div>
        </div>`;
    }

    if (gas) {
      $('gasSlow').querySelector('.gas-val').textContent = gas.slow;
      $('gasStd').querySelector('.gas-val').textContent = gas.standard;
      $('gasFast').querySelector('.gas-val').textContent = gas.fast;
      await renderGasCalc(gas.standard);
    }

    if (trending?.coins?.length) {
      renderTrending(trending.coins);
    } else {
      const tEl = $('trendEl');
      if (tEl) tEl.innerHTML = `<div class="empty" style="padding:16px">No trending data</div>`;
    }

    if (market.totalMarketCap) {
      $('gMktCap').textContent = fmtBig(market.totalMarketCap, '$');
      $('gVolume').textContent = fmtBig(market.totalVolume, '$');
      $('gBtcDom').textContent = market.btcDominance?.toFixed(1) + '%';
      $('gEthDom').textContent = market.ethDominance?.toFixed(1) + '%';
      $('gActive').textContent = market.activeCryptocurrencies?.toLocaleString();
    }

    marketLoadedAt = Date.now();
  } catch (e) { console.warn('Market load:', e); }
}

// ── Tabs ──────────────────────────────────────────────────────────────────────
function switchTab(name) {
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === name));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === name));
  if (name === 'portfolio') loadPortfolio();
  if (name === 'market') loadMarket();
}

document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => switchTab(t.dataset.tab)));

$('refreshBtn').addEventListener('click', async () => {
  $('refreshBtn').classList.add('spinning');
  marketLoadedAt = 0;
  try { await msg('FORCE_REFRESH'); await loadWatchlist(); } catch {}
  $('refreshBtn').classList.remove('spinning');
});

$('settingsBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());
$('manageWatchlistBtn').addEventListener('click', () => chrome.runtime.openOptionsPage());

document.addEventListener('click', e => {
  if (!e.target.closest('#holdingCoinSearch') && !e.target.closest('#holdingSearchResults')) {
    $('holdingSearchResults').classList.add('hidden');
  }
  if (!e.target.closest('#quickAddPanel') && !e.target.closest('#quickAddBtn')) {
    $('quickAddResults').classList.add('hidden');
  }
});

function renderUpdatedTs() {
  if (!lastUpdatedAt) return;
  const el = $('lastUpdated');
  const secs = Math.max(0, Math.round((Date.now() - lastUpdatedAt) / 1000));
  const stale = secs > 300;
  const label =
    secs < 5 ? 'Updated just now'
    : secs < 60 ? `Updated ${secs}s ago`
    : `Updated ${Math.floor(secs / 60)}m ago`;
  el.textContent = stale ? `⚠ ${label} — prices may be outdated` : label;
  el.classList.toggle('stale', stale);
}
setInterval(renderUpdatedTs, 5_000);

// Live-refresh the watchlist while the popup stays open (served from the
// service-worker cache, so this only hits the network when the cache expires)
setInterval(() => {
  const onWatchlist = document.querySelector('.tab.active')?.dataset.tab === 'watchlist';
  const alertFormOpen = document.querySelector('.alert-inline:not(.hidden)');
  if (onWatchlist && !alertFormOpen) loadWatchlist();
}, 30_000);

async function init() {
  try { settings = await msg('GET_SETTINGS'); } catch { settings = { ...DEFAULT_SETTINGS }; }

  if (settings.compactMode) document.body.classList.add('compact');

  chrome.storage.local.get({ watchlistSort: 'default', expandedCoinId: null }, r => {
    watchlistSort = r.watchlistSort || 'default';
    expandedCoinId = r.expandedCoinId || null;
    document.querySelectorAll('.sort-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.sort === watchlistSort);
    });
    loadWatchlist();
  });
}

init();

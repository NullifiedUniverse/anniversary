import { DEFAULT_SETTINGS } from '../shared/constants.js';

let settings = { ...DEFAULT_SETTINGS };
const $ = id => document.getElementById(id);

function sendMsg(type, payload = {}) {
  return new Promise((res, rej) => {
    chrome.runtime.sendMessage({ type, payload }, r => {
      if (chrome.runtime.lastError) rej(new Error(chrome.runtime.lastError.message));
      else res(r);
    });
  });
}

async function save(partial = {}) {
  settings = { ...settings, ...partial };
  try { await sendMsg('SAVE_SETTINGS', settings); } catch {}
  showSaved();
}

function showSaved() {
  const el = $('saveIndicator');
  el.textContent = 'Saved';
  el.classList.add('visible');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('visible'), 1800);
}

// Nav
document.querySelectorAll('.s-nav-item').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const sec = link.dataset.section;
    document.querySelectorAll('.s-nav-item').forEach(l => l.classList.toggle('active', l === link));
    document.querySelectorAll('.s-section').forEach(s => s.classList.toggle('active', s.id === sec));
  });
});

// Load
async function load() {
  try { settings = await sendMsg('GET_SETTINGS'); } catch { settings = { ...DEFAULT_SETTINGS }; }
  $('currency').value = settings.currency || 'usd';
  $('tooltipEnabled').checked = settings.tooltipEnabled !== false;
  $('tooltipDelay').value = settings.tooltipDelay ?? 400;
  $('refreshInterval').value = String(settings.refreshInterval || 60);
  $('gasTrackerEnabled').checked = settings.gasTrackerEnabled !== false;
  $('compactMode').checked = !!settings.compactMode;
  $('alertsEnabled').checked = settings.alertsEnabled !== false;
  $('alertCurSym').textContent = settings.currencySymbol || '$';
  updateTooltipSub();

  // Silently migrate legacy triggered:true alerts to use lastFiredAt
  if (settings.alerts?.some(a => a.triggered === true && a.lastFiredAt == null)) {
    settings.alerts = settings.alerts.map(a => {
      if (a.triggered === true && a.lastFiredAt == null) {
        const { triggered: _t, ...rest } = a;
        return { ...rest, repeatMode: rest.repeatMode || 'once', lastFiredAt: Date.now() };
      }
      return a;
    });
    try { await sendMsg('SAVE_SETTINGS', settings); } catch {}
  }

  renderWatchlist();
  renderPortfolio();
  renderAlerts();
}

function updateTooltipSub() {
  $('tooltipSubSettings').style.display = $('tooltipEnabled').checked ? 'block' : 'none';
}

// General bindings
$('currency').addEventListener('change', () => {
  const map = { usd:'$', eur:'€', gbp:'£', jpy:'¥', aud:'A$', cad:'C$', chf:'Fr', cny:'¥', btc:'₿', eth:'Ξ' };
  save({ currency: $('currency').value, currencySymbol: map[$('currency').value] || '$' });
});
$('tooltipEnabled').addEventListener('change', () => { save({ tooltipEnabled: $('tooltipEnabled').checked }); updateTooltipSub(); });
$('tooltipDelay').addEventListener('change', () => save({ tooltipDelay: parseInt($('tooltipDelay').value) }));
$('refreshInterval').addEventListener('change', () => save({ refreshInterval: parseInt($('refreshInterval').value) }));
$('gasTrackerEnabled').addEventListener('change', () => save({ gasTrackerEnabled: $('gasTrackerEnabled').checked }));
$('compactMode').addEventListener('change', () => save({ compactMode: $('compactMode').checked }));
$('alertsEnabled').addEventListener('change', () => save({ alertsEnabled: $('alertsEnabled').checked }));

// === WATCHLIST ===
let wSearchTimer;

function renderWatchlist() {
  const el = $('watchlistItems');
  const list = settings.watchlist || [];
  $('watchlistCount').textContent = list.length;
  if (!list.length) {
    el.innerHTML = `<div class="s-empty">Your watchlist is empty. Search above to add coins.</div>`;
    return;
  }
  el.innerHTML = list.map((id) => `
    <div class="s-list-item" data-id="${id}">
      <span class="s-drag-handle">☰</span>
      <span class="s-item-label">${id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
      <button class="s-remove-btn" data-id="${id}" title="Remove">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');
  el.querySelectorAll('.s-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.watchlist = (settings.watchlist || []).filter(id => id !== btn.dataset.id);
      save({ watchlist: settings.watchlist });
      renderWatchlist();
    });
  });
}

$('coinSearch').addEventListener('input', e => {
  clearTimeout(wSearchTimer);
  const q = e.target.value.trim();
  const el = $('coinSearchResults');
  if (q.length < 2) { el.classList.add('hidden'); return; }
  wSearchTimer = setTimeout(async () => {
    try {
      const { coins } = await sendMsg('SEARCH_COINS', { query: q });
      if (!coins.length) { el.classList.add('hidden'); return; }
      el.innerHTML = coins.slice(0, 8).map(c => {
        const added = (settings.watchlist || []).includes(c.id);
        return `<div class="s-sr-item ${added ? 'added' : ''}" data-id="${c.id}" data-name="${c.name}">
          <span class="s-sr-sym">${c.symbol}</span>
          <span class="s-sr-name">${c.name}</span>
          ${c.marketCapRank ? `<span class="s-sr-rank">#${c.marketCapRank}</span>` : ''}
          <button class="s-sr-add ${added ? 'done' : ''}">${added ? '✓ Added' : '+ Add'}</button>
        </div>`;
      }).join('');
      el.classList.remove('hidden');
      el.querySelectorAll('.s-sr-item:not(.added) .s-sr-add').forEach(btn => {
        btn.addEventListener('click', () => {
          const item = btn.closest('.s-sr-item');
          const id = item.dataset.id;
          if (!(settings.watchlist || []).includes(id) && (settings.watchlist || []).length < 20) {
            settings.watchlist = [...(settings.watchlist || []), id];
            save({ watchlist: settings.watchlist });
            renderWatchlist();
            $('coinSearch').value = '';
            el.classList.add('hidden');
          }
        });
      });
    } catch { el.classList.add('hidden'); }
  }, 300);
});

document.addEventListener('click', e => {
  if (!e.target.closest('#coinSearch') && !e.target.closest('#coinSearchResults')) $('coinSearchResults').classList.add('hidden');
  if (!e.target.closest('#pCoinSearch') && !e.target.closest('#pSearchResults')) $('pSearchResults')?.classList.add('hidden');
  if (!e.target.closest('#alertCoinSearch') && !e.target.closest('#alertSearchResults')) $('alertSearchResults')?.classList.add('hidden');
});

// === PORTFOLIO ===
let pSelected = null, pTimer;

function renderPortfolio() {
  const el = $('portfolioItems');
  const list = settings.portfolio || [];
  if (!list.length) {
    el.innerHTML = `<div class="s-empty">No holdings yet. Click below to add your first position.</div>`;
    return;
  }
  el.innerHTML = list.map((h, i) => `
    <div class="s-list-item">
      <div class="s-item-info">
        <span class="s-item-label">${h.coinName || h.coinId}</span>
        <span class="s-item-sub">${h.amount} ${(h.coinSymbol || '').toUpperCase()} · avg $${(h.avgBuyPrice || 0).toLocaleString()}</span>
      </div>
      <button class="s-remove-btn" data-idx="${i}" title="Remove">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  `).join('');
  el.querySelectorAll('.s-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.portfolio = (settings.portfolio || []).filter((_, i) => i !== parseInt(btn.dataset.idx));
      save({ portfolio: settings.portfolio });
      renderPortfolio();
    });
  });
}

$('addPortfolioBtn').addEventListener('click', () => $('portfolioAddForm').classList.toggle('hidden'));
$('cancelPortfolioAdd').addEventListener('click', () => { $('portfolioAddForm').classList.add('hidden'); pSelected = null; $('pCoinSearch').value = ''; $('pAmount').value = ''; $('pBuyPrice').value = ''; });

$('pCoinSearch').addEventListener('input', e => {
  clearTimeout(pTimer);
  const q = e.target.value.trim();
  const el = $('pSearchResults');
  if (q.length < 2) { el.classList.add('hidden'); return; }
  pTimer = setTimeout(async () => {
    try {
      const { coins } = await sendMsg('SEARCH_COINS', { query: q });
      el.innerHTML = coins.slice(0, 6).map(c => `<div class="s-dd-item" data-id="${c.id}" data-sym="${c.symbol}" data-name="${c.name}"><strong>${c.symbol.toUpperCase()}</strong> ${c.name}</div>`).join('');
      el.classList.toggle('hidden', !coins.length);
      el.querySelectorAll('.s-dd-item').forEach(item => {
        item.addEventListener('click', () => {
          pSelected = { id: item.dataset.id, symbol: item.dataset.sym, name: item.dataset.name };
          $('pCoinSearch').value = `${item.dataset.sym.toUpperCase()} — ${item.dataset.name}`;
          el.classList.add('hidden');
        });
      });
    } catch { el.classList.add('hidden'); }
  }, 300);
});

$('savePortfolioAdd').addEventListener('click', async () => {
  if (!pSelected) return;
  const amount = parseFloat($('pAmount').value);
  if (!amount || isNaN(amount)) return;
  const avgBuyPrice = parseFloat($('pBuyPrice').value) || 0;
  const list = [...(settings.portfolio || [])];
  const idx = list.findIndex(h => h.coinId === pSelected.id);
  const entry = { coinId: pSelected.id, coinSymbol: pSelected.symbol, coinName: pSelected.name, amount, avgBuyPrice };
  if (idx >= 0) list[idx] = entry; else list.push(entry);
  settings.portfolio = list;
  await save({ portfolio: list });
  $('cancelPortfolioAdd').click();
  renderPortfolio();
});

// === ALERTS ===
let aSelected = null, aTimer;

function renderAlerts() {
  const el = $('alertItems');
  const list = settings.alerts || [];
  if (!list.length) {
    el.innerHTML = `<div class="s-empty">No alerts set.</div>`;
    return;
  }
  const sym = settings.currencySymbol || '$';
  el.innerHTML = list.map((a, i) => {
    const repeatMode = a.repeatMode || 'once';
    // Support both new lastFiredAt and legacy triggered field
    const lastFiredAt = a.lastFiredAt || (a.triggered ? Date.now() - 5 * 60_000 : 0);
    const fired = lastFiredAt > 0;
    const minsAgo = fired ? Math.round((Date.now() - lastFiredAt) / 60_000) : 0;
    const firedLabel = fired ? (minsAgo < 1 ? 'just now' : `${minsAgo}m ago`) : 'never fired';
    const repeatLabel = repeatMode === 'once' ? 'one-shot' : `repeat ${repeatMode}`;
    const isTriggeredOnce = repeatMode === 'once' && fired;
    return `
    <div class="s-list-item${isTriggeredOnce ? ' triggered' : ''}">
      <div class="s-item-info">
        <span class="s-item-label">${a.coinName || a.coinId}</span>
        <span class="s-item-sub">
          ${a.type === 'above' ? '↑ Above' : '↓ Below'} ${sym}${(a.price || 0).toLocaleString()}
          &middot; <em>${repeatLabel}</em>
          &middot; ${firedLabel}
          ${isTriggeredOnce ? ' <span class="s-tag-triggered">Triggered</span>' : ''}
        </span>
      </div>
      ${isTriggeredOnce ? `<button class="s-reset-btn" data-idx="${i}" title="Re-arm this alert" style="margin-right:6px;padding:3px 8px;background:none;border:1px solid rgba(255,255,255,0.15);border-radius:5px;color:#7a90b0;font-size:11px;cursor:pointer;white-space:nowrap;flex-shrink:0;">↺ Reset</button>` : ''}
      <button class="s-remove-btn" data-idx="${i}" title="Remove">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    `;
  }).join('');
  el.querySelectorAll('.s-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      settings.alerts = (settings.alerts || []).filter((_, i) => i !== parseInt(btn.dataset.idx));
      save({ alerts: settings.alerts });
      renderAlerts();
    });
  });
  el.querySelectorAll('.s-reset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.idx);
      if (settings.alerts[idx]) {
        const { triggered: _t, ...rest } = settings.alerts[idx];
        settings.alerts[idx] = { ...rest, lastFiredAt: 0 };
        save({ alerts: settings.alerts });
        renderAlerts();
      }
    });
  });
}

$('alertCoinSearch').addEventListener('input', e => {
  clearTimeout(aTimer);
  const q = e.target.value.trim();
  const el = $('alertSearchResults');
  if (q.length < 2) { el.classList.add('hidden'); return; }
  aTimer = setTimeout(async () => {
    try {
      const { coins } = await sendMsg('SEARCH_COINS', { query: q });
      el.innerHTML = coins.slice(0, 6).map(c => `<div class="s-dd-item" data-id="${c.id}" data-sym="${c.symbol}" data-name="${c.name}"><strong>${c.symbol.toUpperCase()}</strong> ${c.name}</div>`).join('');
      el.classList.toggle('hidden', !coins.length);
      el.querySelectorAll('.s-dd-item').forEach(item => {
        item.addEventListener('click', () => {
          aSelected = { id: item.dataset.id, symbol: item.dataset.sym, name: item.dataset.name };
          $('alertCoinSearch').value = `${item.dataset.sym.toUpperCase()} — ${item.dataset.name}`;
          el.classList.add('hidden');
        });
      });
    } catch { el.classList.add('hidden'); }
  }, 300);
});

$('saveAlertBtn').addEventListener('click', async () => {
  if (!aSelected) return;
  const price = parseFloat($('alertPrice').value);
  if (!price || isNaN(price)) return;
  const list = [...(settings.alerts || []), {
    coinId: aSelected.id, coinSymbol: aSelected.symbol, coinName: aSelected.name,
    type: $('alertType').value, price,
    repeatMode: $('alertRepeatMode').value || 'once',
    lastFiredAt: 0,
  }];
  settings.alerts = list;
  await save({ alerts: list });
  aSelected = null;
  $('alertCoinSearch').value = ''; $('alertPrice').value = ''; $('alertRepeatMode').value = 'once';
  renderAlerts();
});

load();

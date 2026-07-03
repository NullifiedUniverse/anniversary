import { fetchMarketData, fetchCoinDetails, fetchFearGreed, fetchGasPrice, fetchGlobalData, searchCoins, fetchTrending, fetchSimplePrice } from '../shared/api.js';
import { DEFAULT_SETTINGS, COIN_MAP, CACHE_TTL_MS, ALERT_REPEAT_INTERVALS } from '../shared/constants.js';

const ALERT_COOLDOWN_ONCE = 10 * 60_000;

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, r => {
      resolve({ ...DEFAULT_SETTINGS, ...r.settings });
    });
  });
}

function createRefreshAlarm(settings) {
  const mins = Math.max(0.5, ((settings?.refreshInterval) || 60) / 60);
  chrome.alarms.clear('price-refresh', () => {
    chrome.alarms.create('price-refresh', { periodInMinutes: mins });
  });
}

function formatBadgePrice(price) {
  if (!price || isNaN(price)) return '';
  if (price >= 1_000_000) return (price / 1_000_000).toFixed(1) + 'M';
  if (price >= 1_000) return Math.round(price / 1_000) + 'K';
  if (price >= 1) return price.toFixed(0);
  return price.toFixed(3);
}

async function updateBadge(coins) {
  try {
    const lead = coins.find(c => c.id === 'bitcoin') || coins[0];
    if (lead && lead.current_price) {
      chrome.action.setBadgeText({ text: formatBadgePrice(lead.current_price) });
      chrome.action.setBadgeBackgroundColor({ color: '#f7931a' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (_) {}
}

function fmtNotifPrice(p) {
  if (p === null || p === undefined || isNaN(p)) return '—';
  if (p >= 1000) return p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 1) return p.toFixed(2);
  if (p >= 0.001) return p.toFixed(4);
  return p.toFixed(8);
}

async function refreshWatchlistPrices(settings) {
  if (!settings) settings = await getSettings();
  const { watchlist = [], currency = 'usd', alerts = [] } = settings;
  // Include alert coins so alerts fire even for coins not on the watchlist
  const alertIds = settings.alertsEnabled ? alerts.map(a => a.coinId) : [];
  const fetchIds = [...new Set([...watchlist, ...alertIds])];
  if (!fetchIds.length) {
    chrome.storage.local.set({ watchlistCache: [], watchlistCacheTs: Date.now() });
    chrome.action.setBadgeText({ text: '' });
    return;
  }
  try {
    const coins = await fetchMarketData(fetchIds, currency);
    // Cache only watchlist coins, in the user's chosen order
    const order = new Map(watchlist.map((id, i) => [id, i]));
    const wlCoins = coins
      .filter(c => order.has(c.id))
      .sort((a, b) => order.get(a.id) - order.get(b.id));
    chrome.storage.local.set({ watchlistCache: wlCoins, watchlistCacheTs: Date.now() });
    updateBadge(wlCoins);
    if (settings.alertsEnabled && alerts.length) {
      checkAlerts(coins, alerts, settings.currencySymbol || '$');
    }
  } catch (err) {
    console.warn('[CryptoLens] Price refresh failed:', err.message);
  }
}

function checkAlerts(coins, alerts, currSymbol) {
  const now = Date.now();
  const toFire = [];
  const needsMigration = alerts.some(a => a.triggered === true && !a.lastFiredAt);

  for (const alert of alerts) {
    const repeatMode = alert.repeatMode || 'once';
    const lastFiredAt = alert.lastFiredAt || (alert.triggered ? now : 0);
    const cooldown = repeatMode === 'once'
      ? ALERT_COOLDOWN_ONCE
      : (ALERT_REPEAT_INTERVALS[repeatMode] || 0);

    if (lastFiredAt && (now - lastFiredAt) < cooldown) continue;

    const coin = coins.find(c => c.id === alert.coinId);
    if (!coin) continue;
    const price = coin.current_price;
    if ((alert.type === 'above' && price >= alert.price) ||
        (alert.type === 'below' && price <= alert.price)) {
      toFire.push({ ...alert, currentPrice: price });
    }
  }

  for (const alert of toFire) {
    chrome.notifications.create(`cl-alert-${Date.now()}-${alert.coinId}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: `CryptoLens: ${alert.coinName || alert.coinId}`,
      message: `Price ${alert.type === 'above' ? 'rose above' : 'dropped below'} ${currSymbol}${fmtNotifPrice(alert.price)} — now ${currSymbol}${fmtNotifPrice(alert.currentPrice)}`,
      priority: 2,
    });
  }

  if (toFire.length || needsMigration) {
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, r => {
      const s = { ...DEFAULT_SETTINGS, ...r.settings };
      s.alerts = s.alerts.map(a => {
        const isFired = toFire.some(t => t.coinId === a.coinId && t.price === a.price);
        const isLegacy = a.triggered === true && !a.lastFiredAt;
        if (isFired || isLegacy) {
          const { triggered: _t, ...rest } = a;
          return { ...rest, repeatMode: rest.repeatMode || 'once', lastFiredAt: Date.now() };
        }
        return a;
      });
      chrome.storage.sync.set({ settings: s });
    });
  }
}

// ── Context menu ──────────────────────────────────────────────────────────────
function setupContextMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'cl-check-price',
      title: 'CryptoLens: Check price for "%s"',
      contexts: ['selection'],
    });
  });
}

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== 'cl-check-price') return;
  const raw = (info.selectionText || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!raw) return;
  const coinId = COIN_MAP[raw]?.id;
  if (!coinId) {
    chrome.notifications.create(`cl-notfound-${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'CryptoLens',
      message: `"${info.selectionText.trim()}" is not a recognized crypto symbol.`,
    });
    return;
  }
  try {
    const settings = await getSettings();
    const data = await fetchCoinDetails(coinId);
    const cur = settings.currency || 'usd';
    const sym = settings.currencySymbol || '$';
    const price = data.market_data.current_price[cur];
    const change = data.market_data.price_change_percentage_24h_in_currency?.[cur];
    const sign = (change ?? 0) >= 0 ? '+' : '';
    const priceStr = price >= 1000
      ? sym + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : sym + (price?.toFixed(4) ?? '—');
    chrome.notifications.create(`cl-price-${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: `${data.name} (${data.symbol.toUpperCase()})`,
      message: `Price: ${priceStr}\n24h Change: ${sign}${change?.toFixed(2) ?? '—'}%`,
      priority: 1,
    });
  } catch {
    chrome.notifications.create(`cl-err-${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: 'CryptoLens',
      message: 'Could not fetch price data. Please try again.',
    });
  }
});

chrome.runtime.onInstalled.addListener(async () => {
  const s = await getSettings();
  createRefreshAlarm(s);
  setupContextMenu();
  refreshWatchlistPrices(s);
});

chrome.runtime.onStartup.addListener(async () => {
  const s = await getSettings();
  createRefreshAlarm(s);
  setupContextMenu();
  refreshWatchlistPrices(s);
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'price-refresh') refreshWatchlistPrices();
});

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  handleMessage(msg).then(sendResponse).catch(err => sendResponse({ error: err.message }));
  return true;
});

async function handleMessage(msg) {
  const settings = await getSettings();

  switch (msg.type) {
    case 'GET_COIN_DETAILS': {
      const data = await fetchCoinDetails(msg.payload.coinId);
      const cur = settings.currency;
      const md = data.market_data;
      return {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        image: data.image?.small,
        price: md.current_price[cur],
        change1h: md.price_change_percentage_1h_in_currency?.[cur],
        change24h: md.price_change_percentage_24h_in_currency?.[cur],
        change7d: md.price_change_percentage_7d_in_currency?.[cur],
        high24h: md.high_24h[cur],
        low24h: md.low_24h[cur],
        marketCap: md.market_cap[cur],
        marketCapRank: data.market_cap_rank,
        volume: md.total_volume[cur],
        supply: md.circulating_supply,
        maxSupply: md.max_supply,
        ath: md.ath[cur],
        athChangePercent: md.ath_change_percentage[cur],
        sparkline: md.sparkline_7d?.price || [],
        currency: cur,
        currencySymbol: settings.currencySymbol,
      };
    }

    case 'GET_WATCHLIST': {
      return new Promise(resolve => {
        chrome.storage.local.get({ watchlistCache: null, watchlistCacheTs: 0 }, r => {
          const age = Date.now() - r.watchlistCacheTs;
          if (r.watchlistCache && age < CACHE_TTL_MS) {
            resolve({ coins: r.watchlistCache, currency: settings.currency, currencySymbol: settings.currencySymbol });
          } else {
            refreshWatchlistPrices(settings).then(() => {
              chrome.storage.local.get({ watchlistCache: [] }, r2 => {
                resolve({ coins: r2.watchlistCache || [], currency: settings.currency, currencySymbol: settings.currencySymbol });
              });
            });
          }
        });
      });
    }

    case 'GET_SIMPLE_PRICES': {
      const { coinIds, currency: reqCur } = msg.payload;
      const cur = reqCur || settings.currency;
      const raw = await fetchSimplePrice(coinIds, cur);
      const priceMap = {};
      for (const [id, vals] of Object.entries(raw)) {
        priceMap[id] = vals[cur];
      }
      return { priceMap, currency: settings.currency, currencySymbol: settings.currencySymbol };
    }

    case 'GET_MARKET_OVERVIEW': {
      try {
        const [fg, gd] = await Promise.all([fetchFearGreed(), fetchGlobalData()]);
        const fgd = fg.data?.[0];
        const g = gd.data;
        return {
          fearGreed: { value: parseInt(fgd?.value || 50), classification: fgd?.value_classification || 'Neutral' },
          totalMarketCap: g?.total_market_cap?.usd,
          totalVolume: g?.total_volume?.usd,
          btcDominance: g?.market_cap_percentage?.btc,
          ethDominance: g?.market_cap_percentage?.eth,
          activeCryptocurrencies: g?.active_cryptocurrencies,
        };
      } catch (e) {
        return { error: e.message };
      }
    }

    case 'GET_GAS': {
      return fetchGasPrice();
    }

    case 'GET_TRENDING': {
      try {
        const data = await fetchTrending();
        return {
          coins: (data.coins || []).slice(0, 7).map(c => ({
            id: c.item.id,
            symbol: c.item.symbol.toUpperCase(),
            name: c.item.name,
            thumb: c.item.small || c.item.thumb,
            marketCapRank: c.item.market_cap_rank,
            priceChangePercent24h: c.item.data?.price_change_percentage_24h?.usd,
            price: c.item.data?.price,
          })),
        };
      } catch (e) {
        return { coins: [], error: e.message };
      }
    }

    case 'SEARCH_COINS': {
      const data = await searchCoins(msg.payload.query);
      return {
        coins: (data.coins || []).slice(0, 10).map(c => ({
          id: c.id,
          symbol: c.symbol.toUpperCase(),
          name: c.name,
          thumb: c.thumb,
          marketCapRank: c.market_cap_rank,
        })),
      };
    }

    case 'GET_SETTINGS': {
      return settings;
    }

    case 'SAVE_SETTINGS': {
      const merged = { ...settings, ...msg.payload };
      await chrome.storage.sync.set({ settings: merged });
      if (merged.refreshInterval !== settings.refreshInterval) createRefreshAlarm(merged);
      // Only refetch when something price-affecting changed
      const needsRefetch =
        merged.currency !== settings.currency ||
        JSON.stringify(merged.watchlist) !== JSON.stringify(settings.watchlist) ||
        JSON.stringify(merged.alerts) !== JSON.stringify(settings.alerts);
      if (needsRefetch) {
        chrome.storage.local.set({ watchlistCacheTs: 0 });
        refreshWatchlistPrices(merged);
      }
      return { success: true };
    }

    case 'FORCE_REFRESH': {
      chrome.storage.local.set({ watchlistCacheTs: 0 });
      await refreshWatchlistPrices(settings);
      return { success: true };
    }

    case 'ADD_TO_WATCHLIST': {
      const { coinId } = msg.payload;
      if (!coinId) return { success: false };
      if (settings.watchlist.includes(coinId)) return { success: true, alreadyIn: true };
      if (settings.watchlist.length >= 20) return { success: false, reason: 'full' };
      const updated = { ...settings, watchlist: [...settings.watchlist, coinId] };
      await chrome.storage.sync.set({ settings: updated });
      chrome.storage.local.set({ watchlistCacheTs: 0 });
      refreshWatchlistPrices(updated);
      return { success: true, alreadyIn: false };
    }

    default:
      throw new Error(`Unknown message: ${msg.type}`);
  }
}

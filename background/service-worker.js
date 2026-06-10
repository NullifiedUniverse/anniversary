import { fetchMarketData, fetchCoinDetails, fetchFearGreed, fetchGasPrice, fetchGlobalData, searchCoins } from '../shared/api.js';
import { DEFAULT_SETTINGS } from '../shared/constants.js';

const CACHE_TTL = 45_000;

async function getSettings() {
  return new Promise(resolve => {
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, r => {
      resolve({ ...DEFAULT_SETTINGS, ...r.settings });
    });
  });
}

async function refreshWatchlistPrices(settings) {
  if (!settings) settings = await getSettings();
  const { watchlist = [], currency = 'usd' } = settings;
  if (!watchlist.length) return;
  try {
    const coins = await fetchMarketData(watchlist, currency);
    const ts = Date.now();
    chrome.storage.local.set({ watchlistCache: coins, watchlistCacheTs: ts });
    if (settings.alertsEnabled && settings.alerts?.length) {
      checkAlerts(coins, settings.alerts, settings.currencySymbol || '$');
    }
  } catch (err) {
    console.warn('[CryptoLens] Price refresh failed:', err.message);
  }
}

function checkAlerts(coins, alerts, currSymbol) {
  const triggered = [];
  for (const alert of alerts) {
    if (alert.triggered) continue;
    const coin = coins.find(c => c.id === alert.coinId);
    if (!coin) continue;
    const price = coin.current_price;
    if ((alert.type === 'above' && price >= alert.price) ||
        (alert.type === 'below' && price <= alert.price)) {
      triggered.push({ ...alert, currentPrice: price });
    }
  }
  for (const alert of triggered) {
    chrome.notifications.create(`cl-alert-${Date.now()}`, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icons/icon48.png'),
      title: `CryptoLens: ${alert.coinName || alert.coinId}`,
      message: `Price ${alert.type === 'above' ? 'rose above' : 'dropped below'} ${currSymbol}${alert.price.toLocaleString()} — now ${currSymbol}${alert.currentPrice.toLocaleString()}`,
      priority: 2,
    });
  }
  if (triggered.length) {
    chrome.storage.sync.get({ settings: DEFAULT_SETTINGS }, r => {
      const s = r.settings;
      s.alerts = s.alerts.map(a =>
        triggered.find(t => t.coinId === a.coinId && t.price === a.price)
          ? { ...a, triggered: true } : a
      );
      chrome.storage.sync.set({ settings: s });
    });
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  const s = await getSettings();
  if (!s.watchlist) await chrome.storage.sync.set({ settings: DEFAULT_SETTINGS });
  chrome.alarms.create('price-refresh', { periodInMinutes: 1 });
  refreshWatchlistPrices();
});

chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create('price-refresh', { periodInMinutes: 1 });
  refreshWatchlistPrices();
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
          if (r.watchlistCache && age < CACHE_TTL) {
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
      chrome.alarms.clear('price-refresh', () => {
        chrome.alarms.create('price-refresh', { periodInMinutes: 1 });
      });
      refreshWatchlistPrices(merged);
      return { success: true };
    }

    case 'FORCE_REFRESH': {
      chrome.storage.local.set({ watchlistCacheTs: 0 });
      await refreshWatchlistPrices(settings);
      return { success: true };
    }

    default:
      throw new Error(`Unknown message: ${msg.type}`);
  }
}

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const FEAR_GREED_URL = 'https://api.alternative.me/fng/';
const ETH_RPC_URL = 'https://cloudflare-eth.com';

const _cache = new Map();
const CACHE_TTL = 30_000;

function getCached(key) {
  const entry = _cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) { _cache.delete(key); return null; }
  return entry.data;
}

function setCache(key, data) {
  _cache.set(key, { data, ts: Date.now() });
}

async function cgFetch(path) {
  const cached = getCached(path);
  if (cached) return cached;
  const res = await fetch(`${COINGECKO_BASE}${path}`);
  if (!res.ok) throw new Error(`CoinGecko API error ${res.status}`);
  const data = await res.json();
  setCache(path, data);
  return data;
}

export async function fetchMarketData(coinIds, currency = 'usd') {
  const ids = coinIds.join(',');
  return cgFetch(`/coins/markets?vs_currency=${currency}&ids=${ids}&order=market_cap_desc&sparkline=true&price_change_percentage=1h,24h,7d`);
}

export async function fetchSimplePrice(coinIds, currency = 'usd') {
  const ids = coinIds.join(',');
  return cgFetch(`/simple/price?ids=${ids}&vs_currencies=${currency}&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true&include_last_updated_at=true`);
}

export async function fetchCoinDetails(coinId) {
  return cgFetch(`/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`);
}

export async function fetchCoinChart(coinId, days = 7, currency = 'usd') {
  return cgFetch(`/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`);
}

export async function searchCoins(query) {
  return cgFetch(`/search?query=${encodeURIComponent(query)}`);
}

export async function fetchGlobalData() {
  return cgFetch('/global');
}

export async function fetchFearGreed() {
  const key = '__fear_greed';
  const cached = getCached(key);
  if (cached) return cached;
  const res = await fetch(`${FEAR_GREED_URL}?limit=1`);
  if (!res.ok) throw new Error('Fear & Greed API error');
  const data = await res.json();
  setCache(key, data);
  return data;
}

export async function fetchGasPrice() {
  const key = '__gas_price';
  const cached = getCached(key);
  if (cached) return cached;
  try {
    const [r1, r2] = await Promise.all([
      fetch(ETH_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_gasPrice', params: [], id: 1 }),
      }),
      fetch(ETH_RPC_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'eth_maxPriorityFeePerGas', params: [], id: 2 }),
      }),
    ]);
    const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
    const base = parseInt(d1.result, 16) / 1e9;
    const tip = parseInt(d2.result, 16) / 1e9;
    const result = {
      slow: Math.round(base * 0.85 * 10) / 10,
      standard: Math.round(base * 10) / 10,
      fast: Math.round((base + tip) * 10) / 10,
      unit: 'gwei',
    };
    setCache(key, result);
    return result;
  } catch {
    return { slow: '—', standard: '—', fast: '—', unit: 'gwei' };
  }
}

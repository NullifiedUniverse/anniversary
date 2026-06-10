// CryptoLens — content script (self-contained, no ES module imports)
(function () {
  'use strict';
  if (window.self !== window.top) return;
  if (window.__cryptoLensLoaded) return;
  window.__cryptoLensLoaded = true;

  const COIN_MAP = {
    BTC: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    ETH: { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    BNB: { id: 'binancecoin', name: 'BNB', symbol: 'BNB' },
    XRP: { id: 'ripple', name: 'XRP', symbol: 'XRP' },
    SOL: { id: 'solana', name: 'Solana', symbol: 'SOL' },
    ADA: { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    DOGE: { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    TRX: { id: 'tron', name: 'TRON', symbol: 'TRX' },
    TON: { id: 'the-open-network', name: 'Toncoin', symbol: 'TON' },
    AVAX: { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
    SHIB: { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB' },
    LINK: { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
    DOT: { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    BCH: { id: 'bitcoin-cash', name: 'Bitcoin Cash', symbol: 'BCH' },
    NEAR: { id: 'near', name: 'NEAR Protocol', symbol: 'NEAR' },
    MATIC: { id: 'matic-network', name: 'Polygon', symbol: 'MATIC' },
    LTC: { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
    UNI: { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
    APT: { id: 'aptos', name: 'Aptos', symbol: 'APT' },
    XLM: { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
    ATOM: { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' },
    OP: { id: 'optimism', name: 'Optimism', symbol: 'OP' },
    ARB: { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
    HBAR: { id: 'hedera-hashgraph', name: 'Hedera', symbol: 'HBAR' },
    VET: { id: 'vechain', name: 'VeChain', symbol: 'VET' },
    MKR: { id: 'maker', name: 'Maker', symbol: 'MKR' },
    AAVE: { id: 'aave', name: 'Aave', symbol: 'AAVE' },
    INJ: { id: 'injective-protocol', name: 'Injective', symbol: 'INJ' },
    SUI: { id: 'sui', name: 'Sui', symbol: 'SUI' },
    XMR: { id: 'monero', name: 'Monero', symbol: 'XMR' },
    PEPE: { id: 'pepe', name: 'Pepe', symbol: 'PEPE' },
    ICP: { id: 'internet-computer', name: 'Internet Computer', symbol: 'ICP' },
    FIL: { id: 'filecoin', name: 'Filecoin', symbol: 'FIL' },
    ALGO: { id: 'algorand', name: 'Algorand', symbol: 'ALGO' },
    USDT: { id: 'tether', name: 'Tether', symbol: 'USDT' },
    USDC: { id: 'usd-coin', name: 'USD Coin', symbol: 'USDC' },
    DAI: { id: 'dai', name: 'Dai', symbol: 'DAI' },
    GRT: { id: 'the-graph', name: 'The Graph', symbol: 'GRT' },
    BITCOIN: { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC' },
    ETHEREUM: { id: 'ethereum', name: 'Ethereum', symbol: 'ETH' },
    SOLANA: { id: 'solana', name: 'Solana', symbol: 'SOL' },
    DOGECOIN: { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE' },
    CARDANO: { id: 'cardano', name: 'Cardano', symbol: 'ADA' },
    RIPPLE: { id: 'ripple', name: 'XRP', symbol: 'XRP' },
    POLKADOT: { id: 'polkadot', name: 'Polkadot', symbol: 'DOT' },
    POLYGON: { id: 'matic-network', name: 'Polygon', symbol: 'MATIC' },
    AVALANCHE: { id: 'avalanche-2', name: 'Avalanche', symbol: 'AVAX' },
    CHAINLINK: { id: 'chainlink', name: 'Chainlink', symbol: 'LINK' },
    UNISWAP: { id: 'uniswap', name: 'Uniswap', symbol: 'UNI' },
    LITECOIN: { id: 'litecoin', name: 'Litecoin', symbol: 'LTC' },
    COSMOS: { id: 'cosmos', name: 'Cosmos', symbol: 'ATOM' },
    STELLAR: { id: 'stellar', name: 'Stellar', symbol: 'XLM' },
    MONERO: { id: 'monero', name: 'Monero', symbol: 'XMR' },
    OPTIMISM: { id: 'optimism', name: 'Optimism', symbol: 'OP' },
    ARBITRUM: { id: 'arbitrum', name: 'Arbitrum', symbol: 'ARB' },
  };

  const COIN_COLORS = {
    bitcoin: '#f7931a', ethereum: '#627eea', solana: '#9945ff',
    binancecoin: '#f3ba2f', ripple: '#346aa9', cardano: '#0033ad',
    dogecoin: '#c2a633', 'the-open-network': '#0088cc',
    'avalanche-2': '#e84142', 'shiba-inu': '#ffa409',
    chainlink: '#2a5ada', polkadot: '#e6007a', 'bitcoin-cash': '#8dc351',
    near: '#00c1de', 'matic-network': '#8247e5', litecoin: '#8c8c8c',
    uniswap: '#ff007a', aptos: '#2de4c0', stellar: '#7d00ff',
    cosmos: '#6f7390', optimism: '#ff0420', arbitrum: '#12aaff',
    monero: '#ff6600', maker: '#1aab9b', aave: '#b6509e',
    'injective-protocol': '#00b2ff', sui: '#4da2ff', tron: '#ff0013',
  };

  let tooltip = null;
  let hideTimer = null;
  let pendingTimer = null;
  let enabled = true;
  let tooltipDelay = 400;

  try {
    chrome.storage.sync.get({ settings: {} }, r => {
      const s = r.settings || {};
      enabled = s.tooltipEnabled !== false;
      tooltipDelay = s.tooltipDelay ?? 400;
    });
    chrome.storage.onChanged.addListener(changes => {
      if (changes.settings) {
        const s = changes.settings.newValue || {};
        enabled = s.tooltipEnabled !== false;
        tooltipDelay = s.tooltipDelay ?? 400;
        if (!enabled) dismiss();
      }
    });
  } catch (_) {}

  function getTooltip() {
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = 'cl-tooltip';
      tooltip.setAttribute('role', 'tooltip');
      document.body.appendChild(tooltip);
      tooltip.addEventListener('mouseenter', () => { if (hideTimer) clearTimeout(hideTimer); });
      tooltip.addEventListener('mouseleave', () => scheduleHide(400));
    }
    return tooltip;
  }

  function dismiss() {
    if (!tooltip) return;
    tooltip.classList.remove('cl-visible');
    const t = tooltip;
    setTimeout(() => { if (t.parentNode) t.parentNode.removeChild(t); if (tooltip === t) tooltip = null; }, 180);
  }

  function scheduleHide(ms = 5000) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(dismiss, ms);
  }

  function place(el, rect) {
    const MARGIN = 10;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const W = 296;
    let x = rect.left + rect.width / 2 - W / 2;
    let y = rect.bottom + MARGIN;
    if (y + 260 > vpH) y = rect.top - MARGIN - 260;
    x = Math.max(MARGIN, Math.min(x, vpW - W - MARGIN));
    el.style.left = `${x + window.scrollX}px`;
    el.style.top = `${y + window.scrollY}px`;
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

  function fmtChange(v) {
    if (v === null || v === undefined) return { text: '—', cls: 'cl-neutral' };
    const sign = v > 0 ? '+' : '';
    return { text: sign + v.toFixed(2) + '%', cls: v > 0 ? 'cl-up' : v < 0 ? 'cl-down' : 'cl-neutral' };
  }

  function sparklineSVG(prices) {
    if (!prices || prices.length < 4) return '';
    const sample = prices.filter((_, i) => i % Math.ceil(prices.length / 50) === 0);
    const W = 252, H = 38;
    const min = Math.min(...sample), max = Math.max(...sample);
    const range = max - min || 1;
    const pts = sample.map((p, i) => {
      const x = (i / (sample.length - 1)) * W;
      const y = H - ((p - min) / range) * (H - 4) - 2;
      return x.toFixed(1) + ',' + y.toFixed(1);
    }).join(' ');
    const isUp = sample[sample.length - 1] >= sample[0];
    const color = isUp ? '#22c55e' : '#ef4444';
    const fillPts = pts + ` ${W},${H} 0,${H}`;
    return `<svg viewBox="0 0 ${W} ${H}" class="cl-spark" preserveAspectRatio="none">
      <defs><linearGradient id="clsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${color}" stop-opacity="0.18"/><stop offset="100%" stop-color="${color}" stop-opacity="0"/></linearGradient></defs>
      <polygon points="${fillPts}" fill="url(#clsg)"/>
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  function showLoading(rect) {
    const el = getTooltip();
    el.innerHTML = `<div class="cl-load"><div class="cl-spin"></div><span>Loading…</span></div>`;
    place(el, rect);
    requestAnimationFrame(() => el.classList.add('cl-visible'));
  }

  function showData(coinInfo, data, rect) {
    const el = getTooltip();
    const sym = data.currencySymbol || '$';
    const c24 = fmtChange(data.change24h);
    const c7d = fmtChange(data.change7d);
    const c1h = fmtChange(data.change1h);
    const bg = COIN_COLORS[coinInfo.id] || '#f7931a';
    const priceText = fmtPrice(data.price, sym);
    const bUrl = `https://www.binance.com/en/trade/${coinInfo.symbol}_USDT`;
    const tvUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${coinInfo.symbol}USDT`;
    const cgUrl = `https://www.coingecko.com/en/coins/${coinInfo.id}`;
    el.innerHTML = `
      <div class="cl-hd">
        <div class="cl-av" style="background:${bg}">${coinInfo.symbol[0]}</div>
        <div class="cl-ci">
          <span class="cl-cn">${coinInfo.name}</span>
          <span class="cl-cs">${coinInfo.symbol} · #${data.marketCapRank || '—'}</span>
        </div>
        <div class="cl-pm" title="Click to copy">${priceText}</div>
      </div>
      <div class="cl-spark-wrap">${sparklineSVG(data.sparkline)}</div>
      <div class="cl-changes">
        <div class="cl-ch"><span class="cl-chl">1h</span><span class="cl-chv ${c1h.cls}">${c1h.text}</span></div>
        <div class="cl-ch"><span class="cl-chl">24h</span><span class="cl-chv ${c24.cls}">${c24.text}</span></div>
        <div class="cl-ch"><span class="cl-chl">7d</span><span class="cl-chv ${c7d.cls}">${c7d.text}</span></div>
      </div>
      <div class="cl-grid">
        <div class="cl-cell"><span class="cl-cl">Market Cap</span><span class="cl-cv">${fmtBig(data.marketCap, sym)}</span></div>
        <div class="cl-cell"><span class="cl-cl">Volume 24h</span><span class="cl-cv">${fmtBig(data.volume, sym)}</span></div>
        <div class="cl-cell"><span class="cl-cl">24h High</span><span class="cl-cv cl-up">${fmtPrice(data.high24h, sym)}</span></div>
        <div class="cl-cell"><span class="cl-cl">24h Low</span><span class="cl-cv cl-down">${fmtPrice(data.low24h, sym)}</span></div>
      </div>
      <div class="cl-ft">
        <span class="cl-ath">ATH: ${fmtPrice(data.ath, sym)} <span class="${fmtChange(data.athChangePercent).cls}">(${fmtChange(data.athChangePercent).text})</span></span>
        <div class="cl-exch">
          <a class="cl-pill" href="${bUrl}" target="_blank" rel="noopener noreferrer">Binance</a>
          <a class="cl-pill" href="${tvUrl}" target="_blank" rel="noopener noreferrer">TV</a>
          <a class="cl-lnk" href="${cgUrl}" target="_blank" rel="noopener noreferrer">CG ↗</a>
        </div>
      </div>
    `;
    // Copy price on click
    const pmEl = el.querySelector('.cl-pm');
    if (pmEl) {
      pmEl.addEventListener('click', e => {
        e.stopPropagation();
        try {
          navigator.clipboard.writeText(priceText).then(() => {
            pmEl.textContent = '✓ Copied!';
            pmEl.classList.add('cl-copied');
            setTimeout(() => {
              pmEl.textContent = priceText;
              pmEl.classList.remove('cl-copied');
            }, 1500);
          }).catch(() => {});
        } catch (_) {}
      });
    }
    place(el, rect);
    scheduleHide(8000);
  }

  function showError(msg, rect) {
    const el = getTooltip();
    el.innerHTML = `<div class="cl-err">⚠️ ${msg}</div>`;
    place(el, rect);
    scheduleHide(3000);
  }

  document.addEventListener('mouseup', e => {
    if (!enabled) return;
    if (e.target && e.target.closest && e.target.closest('#cl-tooltip')) return;
    if (pendingTimer) clearTimeout(pendingTimer);

    pendingTimer = setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
      const raw = sel.toString().trim();
      if (!raw || raw.length > 25 || raw.length < 2) return;
      const key = raw.toUpperCase().replace(/[^A-Z]/g, '');
      if (!key) return;
      const coinInfo = COIN_MAP[key];
      if (!coinInfo) return;

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (!rect.width && !rect.height) return;

      showLoading(rect);

      try {
        chrome.runtime.sendMessage({ type: 'GET_COIN_DETAILS', payload: { coinId: coinInfo.id } }, response => {
          if (chrome.runtime.lastError || !response || response.error) {
            showError('Could not fetch price data.', rect);
            return;
          }
          showData(coinInfo, response, rect);
        });
      } catch (_) {
        showError('Extension context error.', rect);
      }
    }, tooltipDelay);
  });

  document.addEventListener('mousedown', e => {
    if (e.target && e.target.closest && e.target.closest('#cl-tooltip')) return;
    dismiss();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') dismiss();
  });

  document.addEventListener('scroll', () => {
    if (tooltip && tooltip.classList.contains('cl-visible')) scheduleHide(200);
  }, { passive: true });
})();

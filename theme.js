'use strict';
/* =========================================================
   主题系统：在 <head> 中同步执行，页面出现前就套好配色
   ========================================================= */
(function () {
  const get = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };

  const THEMES = {
    violet: { name: '雾紫',
      light: { bg: '#F5F2EC', card: '#FFFFFF', ink: '#25222D', mute: '#7B7584', faint: '#A9A3B0', line: '#E7E1D8', accent: '#4B3F8F' },
      dark: { bg: '#16151A', card: '#211F27', ink: '#ECE8F2', mute: '#A09AA9', faint: '#6E6877', line: '#33303C', accent: '#A797F2' } },
    navy: { name: '深蓝',
      light: { bg: '#EFF2F6', card: '#FFFFFF', ink: '#172133', mute: '#66718A', faint: '#A1A9B8', line: '#DCE2EB', accent: '#1C3664', hdrBg: '#1C3664', hdrInk: '#FFFFFF' },
      dark: { bg: '#0B111D', card: '#131B2C', ink: '#E4EAF4', mute: '#93A0B6', faint: '#5C687E', line: '#233049', accent: '#82A6EA' } },
    graphite: { name: '石墨灰',
      light: { bg: '#F2F2F1', card: '#FFFFFF', ink: '#1F2124', mute: '#6F7378', faint: '#A6A9AD', line: '#DFE0E1', accent: '#3A4048' },
      dark: { bg: '#121314', card: '#1C1D1F', ink: '#E7E8E9', mute: '#999CA0', faint: '#626569', line: '#2D2F32', accent: '#C5CAD1' } },
    orange: { name: '暖橙',
      light: { bg: '#FAF4ED', card: '#FFFFFF', ink: '#2B2019', mute: '#86766A', faint: '#B7A99D', line: '#EEE1D3', accent: '#D45F17' },
      dark: { bg: '#18120D', card: '#241A13', ink: '#F3E9E0', mute: '#AB9C8F', faint: '#706257', line: '#3B2D22', accent: '#F59B57' } },
    green: { name: '松绿',
      light: { bg: '#F1F4EF', card: '#FFFFFF', ink: '#1C2620', mute: '#6A766E', faint: '#A3ADA6', line: '#DDE4DD', accent: '#2C6A4E' },
      dark: { bg: '#0F1512', card: '#18201B', ink: '#E5EEE8', mute: '#94A39A', faint: '#5D6B62', line: '#26322B', accent: '#7DC7A1' } },
    pink: { name: '樱粉',
      light: { bg: '#FBF3F4', card: '#FFFFFF', ink: '#2D1F25', mute: '#86707A', faint: '#B9A6AE', line: '#F0DFE4', accent: '#B8466F' },
      dark: { bg: '#1A1215', card: '#251A1F', ink: '#F4E8EC', mute: '#AE98A1', faint: '#735F67', line: '#3B2A31', accent: '#F29BBB' } },
    wine: { name: '酒红',
      light: { bg: '#F7F1EF', card: '#FFFFFF', ink: '#2A1C1D', mute: '#80696A', faint: '#B5A2A2', line: '#EBDCD9', accent: '#882B37' },
      dark: { bg: '#170F10', card: '#22181A', ink: '#F1E6E6', mute: '#A99596', faint: '#6E5B5C', line: '#382728', accent: '#E58A95' } },
    klein: { name: '克莱因蓝 · 实验室', lab: true,
      light: { bg: '#EDF0F6', card: '#FFFFFF', ink: '#0A1433', mute: '#56628A', faint: '#98A2BF', line: '#D0D8EA', accent: '#002FA7', hdrBg: '#002FA7', hdrInk: '#FFFFFF' },
      dark: { bg: '#050916', card: '#0B1230', ink: '#E2E8FA', mute: '#8995BC', faint: '#515D88', line: '#1A275A', accent: '#4F78FF', hdrBg: '#002FA7', hdrInk: '#FFFFFF' } }
  };
  const ORDER = ['violet', 'navy', 'graphite', 'orange', 'green', 'pink', 'wine', 'klein'];
  const ACCENTS = ['#002FA7', '#1C3664', '#2F78C4', '#14857A', '#2C6A4E', '#7A8F2B', '#C6961A', '#D45F17', '#C2402F', '#882B37', '#B8466F', '#7A3E9D', '#4B3F8F', '#3A4048'];
  /* 隐藏区域（强制深色） */
  const ZONE = { bg: '#04070E', card: '#0A1220', ink: '#D2E6F7', mute: '#7D95AC', faint: '#465A70', line: '#16283D', accent: '#38B6FF', hdrBg: '#04070E', hdrInk: '#D2E6F7' };
  /* 世界线类型色：与主色撞色时自动换成备用色 */
  const KINDS = { light: { if: '#B0407A', au: '#23806F', paro: '#B8621A', other: '#6A6A72' }, dark: { if: '#EE7FB6', au: '#5FCDB8', paro: '#F3A562', other: '#A3A3AD' } };
  const ALT = { light: '#6B5BB5', dark: '#B9ACF5' };

  const rgb = h => { h = String(h).trim().replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h, 16) || 0; return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const hex = a => '#' + a.map(x => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('').toUpperCase();
  const mix = (a, b, w) => { const A = rgb(a), B = rgb(b); return hex(A.map((x, i) => x * w + B[i] * (1 - w))); };
  const rgba = (a, al) => { const A = rgb(a); return `rgba(${A[0]},${A[1]},${A[2]},${al})`; };
  const lum = h => { const c = rgb(h).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  const whiteOK = h => 1.05 / (lum(h) + 0.05) >= 3;
  const inkOn = h => whiteOK(h) ? '#FFFFFF' : '#141218';
  const hsl = h => {
    const [r, g, b] = rgb(h).map(v => v / 255), mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let hh = 0;
    if (d) { if (mx === r) hh = ((g - b) / d) % 6; else if (mx === g) hh = (b - r) / d + 2; else hh = (r - g) / d + 4; hh *= 60; if (hh < 0) hh += 360; }
    const l = (mx + mn) / 2, s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    return [hh, s, l];
  };
  const clash = (a, b) => { const A = hsl(a), B = hsl(b); if (A[1] < 0.25 || B[1] < 0.25) return false; const d = Math.abs(A[0] - B[0]); return Math.min(d, 360 - d) < 26; };

  const pref = { theme: get('ui.theme', 'violet'), mode: get('ui.mode', 'system'), accent: get('ui.accent', '') || '' };
  if (!THEMES[pref.theme]) pref.theme = 'violet';
  let hook = null;
  const sysDark = () => !!(window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const effMode = () => (pref.mode === 'dark' || pref.mode === 'light') ? pref.mode : (sysDark() ? 'dark' : 'light');

  function apply() {
    const root = document.documentElement, zone = root.getAttribute('data-zone') === 'accc';
    const t = THEMES[pref.theme] || THEMES.violet, mode = zone ? 'dark' : effMode(), dark = mode === 'dark';
    const v = Object.assign({}, zone ? ZONE : t[mode]);
    if (!zone && pref.accent) {
      v.accent = dark ? mix('#FFFFFF', pref.accent, 0.4) : pref.accent;
      if (v.hdrBg && v.hdrBg !== v.bg) v.hdrBg = pref.accent;
    }
    const filled = !!(v.hdrBg && v.hdrBg !== v.bg);
    const vars = {
      '--bg': v.bg, '--card': v.card, '--ink': v.ink, '--mute': v.mute, '--faint': v.faint, '--line': v.line,
      '--accent': v.accent, '--accent-ink': inkOn(v.accent),
      '--soft': mix(v.accent, dark ? v.card : v.bg, dark ? 0.2 : 0.1),
      '--hdr-bg': v.hdrBg || v.bg, '--hdr-ink': v.hdrInk || v.ink, '--hdr-line': filled ? v.hdrBg : v.line,
      '--danger': zone ? '#F5A43D' : (dark ? '#F07C70' : '#B3382F'),
      '--shadow': dark ? 'none' : '0 1px 2px rgba(40,30,60,.06),0 2px 10px rgba(40,30,60,.05)',
      '--grid': rgba(v.accent, dark ? 0.1 : 0.075),
      '--k-main': v.accent
    };
    const ks = KINDS[mode];
    for (const k in ks) vars['--k-' + k] = clash(ks[k], v.accent) ? ALT[mode] : ks[k];
    for (const k in vars) root.style.setProperty(k, vars[k]);
    root.setAttribute('data-mode', mode);
    root.setAttribute('data-theme', zone ? 'accc' : (t.lab ? 'klein' : pref.theme));
    root.style.colorScheme = mode;
    document.querySelectorAll('meta[name="theme-color"]').forEach(m => { m.setAttribute('content', vars['--hdr-bg']); m.removeAttribute('media'); });
    if (hook) { try { hook(vars); } catch (e) { } }
  }

  window.OCTheme = {
    THEMES, ORDER, ACCENTS, pref, apply, effMode, inkOn, rgba,
    isDark: h => whiteOK(h),
    set(k, v) { pref[k] = v; put('ui.' + k, v); apply(); },
    onApply(f) { hook = f; }
  };
  apply();
  if (window.matchMedia) {
    const mq = matchMedia('(prefers-color-scheme: dark)');
    const f = () => { if (pref.mode === 'system') apply(); };
    if (mq.addEventListener) mq.addEventListener('change', f); else if (mq.addListener) mq.addListener(f);
  }
})();

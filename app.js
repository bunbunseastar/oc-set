'use strict';
/* =========================================================
   OC设定集 v1.3 —— 本地 OC 设定数据库
   文本：IndexedDB kv/db；图片：img/<id>（原图）与 img/<id>_t（缩略图）
   ========================================================= */

/* ---------- 小工具 ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const reEsc = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const uid = p => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const byId = (arr, id) => arr.find(x => x.id === id);
const now = () => Date.now();
const trunc = (s, n) => { const a = Array.from(String(s || '')); return a.length > n ? a.slice(0, n).join('') + '…' : a.join(''); };
const p2 = x => String(x).padStart(2, '0');
function groupBy(list, fn) { const m = new Map(); for (const x of list) { const k = fn(x); if (!m.has(k)) m.set(k, []); m.get(k).push(x); } return m; }
function fmtDate(t) {
  const d = new Date(t), n = new Date();
  const md = `${d.getMonth() + 1}月${d.getDate()}日 ${p2(d.getHours())}:${p2(d.getMinutes())}`;
  return d.getFullYear() === n.getFullYear() ? md : `${d.getFullYear()}年${md}`;
}
function fmtStamp(t) { const d = new Date(t); return `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}`; }
function hashColor(s) { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return `hsl(${h % 360},38%,52%)`; }
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } };
const ZH = (() => { try { return new Intl.Collator('zh-Hans-CN', { numeric: true, sensitivity: 'base' }); } catch (e) { return { compare: (a, b) => String(a).localeCompare(String(b)) }; } })();
function hl(text, q) {
  const s = esc(text); if (!q) return s;
  return s.replace(new RegExp(reEsc(esc(q)), 'gi'), m => `<mark class="mark">${m}</mark>`);
}
function snippet(text, q, n = 46) {
  text = String(text || ''); const i = text.toLowerCase().indexOf(String(q).toLowerCase());
  if (i < 0) return trunc(text, n);
  const st = Math.max(0, i - 14); return (st > 0 ? '…' : '') + trunc(text.slice(st), n);
}

const IC = {
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  org: '<path d="M4 21V5l8-3 8 3v16"/><path d="M9 21v-5h6v5M8 8h2M14 8h2M8 12h2M14 12h2"/>',
  tl: '<path d="M6 3v18"/><circle cx="6" cy="7" r="2"/><circle cx="6" cy="17" r="2"/><path d="M11 7h9M11 17h7M11 12h5"/>',
  rel: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="8" r="3"/><circle cx="10" cy="18" r="3"/><path d="M8.9 6.4l6.2.9M7.1 8.8l1.9 6.4M16.2 10.5l-4.4 5.2"/>',
  world: '<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',
  book: '<path d="M4 4h6a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  img: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  more: '<circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  down: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  up: '<path d="M12 15V3M7 8l5-5 5 5M5 21h14"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>',
  select: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/>',
  exit: '<path d="M14 4h5v16h-5M10 8l-4 4 4 4M6 12h10"/>',
  arrowup: '<path d="M12 19V5M6 11l6-6 6 6"/>'
};
const icon = (n, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24">${IC[n]}</svg>`;

/* ---------- 平台 ---------- */
const IS_IOS = /iP(hone|od|ad)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const IS_APP = !!window.OCBridge;  // 安卓外壳
const IS_STANDALONE = !!(navigator.standalone || (window.matchMedia && matchMedia('(display-mode: standalone)').matches));
/* 网页版：提示先添加到桌面（主页可关闭，设置页一直显示） */
const installWarn = (dismissible = true) => {
  if (IS_APP || IS_STANDALONE) return '';
  if (dismissible && lsGet('ui.hideInstall', false)) return '';
  const how = IS_IOS
    ? '在 Safari 里点底部「分享」→「添加到主屏幕」，之后从桌面图标打开。'
    : '在浏览器菜单里（通常是右下角 ≡ 或右上角 ⋮）选「添加到桌面」（华为浏览器里可能叫「添加至」→「桌面」），之后从桌面图标打开。';
  return `<div class="box pad" style="border-color:var(--k-paro)"><b>建议先添加到桌面再使用</b><div class="sub" style="margin-top:4px">${how}<br>网页版的数据存在这个浏览器里，<b>清理浏览器缓存 / 网站数据会把内容一起删掉</b>，请定期在「⋮ → 导出完整备份」。</div>` +
    (dismissible ? `<div style="margin-top:8px;text-align:right"><a class="lnk" data-act="hideInstall">知道了，不再提示</a></div>` : '') + `</div>`;
};

/* ---------- 存储（IndexedDB） ---------- */
const IDB = {
  db: null,
  open() {
    return new Promise((res, rej) => {
      const r = indexedDB.open('ocdb', 1);
      r.onupgradeneeded = () => { const d = r.result; d.createObjectStore('kv'); d.createObjectStore('img'); };
      r.onsuccess = () => { this.db = r.result; res(); };
      r.onerror = () => rej(r.error);
    });
  },
  req(store, mode, fn) {
    return new Promise((res, rej) => {
      const t = this.db.transaction(store, mode); const q = fn(t.objectStore(store));
      t.oncomplete = () => res(q && 'result' in q ? q.result : undefined);
      t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('事务中止'));
    });
  },
  get(store, key) { return this.req(store, 'readonly', s => s.get(key)); },
  put(store, key, val) { return this.req(store, 'readwrite', s => s.put(val, key)); },
  del(store, key) { return this.req(store, 'readwrite', s => s.delete(key)); },
  clear(store) { return this.req(store, 'readwrite', s => s.clear()); }
};

/* ---------- 数据模型 ---------- */
const MAIN = 'w_main';
const KIND = {
  main: { t: '主线', c: 'k-main' }, if: { t: 'IF', c: 'k-if' }, au: { t: 'AU', c: 'k-au' },
  paro: { t: 'PARO', c: 'k-paro' }, other: { t: '其他', c: 'k-other' }
};
let D = null;
let SAVE_BLOCKED = false; // 读取失败时禁止写入，避免覆盖原数据

function blank() {
  return { version: 2, worlds: [{ id: MAIN, name: '主线', kind: 'main', summary: '', created: 0 }], chars: [], orgs: [], events: [], rels: [], notes: [], imgs: [], terms: [], anoms: [], acCats: [] };
}
function normalize(d) {
  d = d && typeof d === 'object' ? d : blank();
  for (const k of ['worlds', 'chars', 'orgs', 'events', 'rels', 'notes', 'imgs', 'terms', 'anoms']) if (!Array.isArray(d[k])) d[k] = [];
  if (!byId(d.worlds, MAIN)) d.worlds.unshift({ id: MAIN, name: '主线', kind: 'main', summary: '', created: 0 });
  byId(d.worlds, MAIN).kind = 'main';
  d.worlds.forEach(w => { if (!KIND[w.kind]) w.kind = 'other'; w.summary = w.summary || ''; });
  const wids = new Set(d.worlds.map(w => w.id));
  const fixW = o => { if (!wids.has(o.worldId)) o.worldId = MAIN; };
  const arr = (o, k) => { if (!Array.isArray(o[k])) o[k] = []; };
  for (const o of d.chars.concat(d.orgs)) { arr(o, 'facts'); o.facts.forEach(fixW); }
  d.chars.forEach(c => {
    arr(c, 'orgIds'); arr(c, 'exps');
    c.exps.forEach(x => { fixW(x); if (typeof x.order !== 'number') x.order = 0; x.text = x.text || ''; x.time = x.time || ''; arr(x, 'charIds'); arr(x, 'orgIds'); x.eventId = x.eventId || ''; });
    if (!c.bio || typeof c.bio !== 'object') c.bio = (typeof c.bio === 'string' && c.bio) ? { [MAIN]: c.bio } : {};
    for (const k of Object.keys(c.bio)) if (!wids.has(k) || !c.bio[k]) delete c.bio[k];
  });
  d.events.forEach(e => { fixW(e); arr(e, 'charIds'); arr(e, 'orgIds'); if (typeof e.order !== 'number') e.order = 0; });
  d.rels.forEach(r => { fixW(r); arr(r, 'eventIds'); r.dir = r.dir === 'ab' ? 'ab' : 'both'; });
  d.notes.forEach(fixW);
  d.imgs.forEach(i => {   // v1 → v2：单个 charId 改为多个 charIds + 标签
    fixW(i);
    if (!Array.isArray(i.charIds)) i.charIds = i.charId ? [i.charId] : [];
    delete i.charId; arr(i, 'tags'); i.caption = i.caption || '';
  });
  d.terms.forEach(t => { fixW(t); arr(t, 'charIds'); arr(t, 'orgIds'); for (const k of ['term', 'alias', 'cat', 'def']) t[k] = t[k] || ''; });
  if (!Array.isArray(d.acCats)) d.acCats = [];
  d.anoms.forEach(a => {   // v1.2 → v1.3：「等级」改为可自定义的分类
    arr(a, 'fields'); arr(a, 'logs'); arr(a, 'charIds');
    if (a.level && !a.cat) { let c = d.acCats.find(x => x.name === a.level); if (!c) { c = { id: uid('ac'), name: a.level }; d.acCats.push(c); } a.cat = c.id; }
    delete a.level;
    if (a.cat && !byId(d.acCats, a.cat)) a.cat = '';
    for (const k of ['code', 'name', 'cat', 'status', 'summary', 'containment']) a[k] = a[k] || '';
  });
  d.version = 3;
  return d;
}
let saveQ = Promise.resolve();
function save() {
  if (SAVE_BLOCKED) { toast('本地数据库读取失败，为保护数据已暂停保存'); return saveQ; }
  const snap = JSON.stringify(D);
  saveQ = saveQ.then(() => IDB.put('kv', 'db', snap)).catch(e => toast('保存失败：' + (e && e.message || e)));
  return saveQ;
}
function commit() { save(); render(); }

/* ---------- 界面状态 ---------- */
const UI = {
  world: lsGet('ui.world', 'all'),
  ev: Object.assign({ c: '', o: '', key: false, q: '' }, lsGet('ui.ev', {})),
  relC: '',
  wAll: lsGet('ui.wAll', true),
  gal: Object.assign({ c: [], t: [], raw: false }, lsGet('ui.gal', {})),
  sel: null,           // 图库多选模式：Set
  termCat: '',
  linkTerms: lsGet('ui.linkTerms', true),
  ac: { q: '', st: '', cat: '' }
};
const saveGal = () => lsSet('ui.gal', UI.gal);
function setWorld(w) { UI.world = w; lsSet('ui.world', w); render(); }

const W = id => byId(D.worlds, id) || byId(D.worlds, MAIN);
const kindOf = id => KIND[W(id).kind] || KIND.other;
function worldsSorted() { return D.worlds.slice().sort((a, b) => a.id === MAIN ? -1 : b.id === MAIN ? 1 : (a.created || 0) - (b.created || 0)); }
const wLabel = w => (w.kind === 'main' ? '★ ' : (KIND[w.kind] || KIND.other).t + ' · ') + w.name;
function wb(id) { const w = W(id); return `<span class="wb ${kindOf(id).c}">${esc(wLabel(w))}</span>`; }
const inW = id => UI.world === 'all' || id === UI.world;
const defW = () => UI.world === 'all' ? MAIN : UI.world;
function worldOptions(sel) { return worldsSorted().map(w => `<option value="${w.id}" ${w.id === sel ? 'selected' : ''}>${esc(wLabel(w))}</option>`).join(''); }
function worldChipsBar() {
  return `<div class="chips"><a class="chip ${UI.world === 'all' ? 'on' : ''}" data-act="setw" data-w="all">全部世界线</a>` +
    worldsSorted().map(w => `<a class="chip ${(KIND[w.kind] || KIND.other).c} ${UI.world === w.id ? 'on' : ''}" data-act="setw" data-w="${w.id}">${esc(wLabel(w))}</a>`).join('') + '</div>';
}

/* 关联查询 */
const notesOf = (rt, id) => D.notes.filter(n => n.refType === rt && n.refId === id);
const eventsOfChar = id => D.events.filter(e => e.charIds.includes(id));
const eventsOfOrg = id => D.events.filter(e => e.orgIds.includes(id));
const relsOfChar = id => D.rels.filter(r => r.a === id || r.b === id);
const imgsOfChar = id => D.imgs.filter(i => i.charIds.includes(id));
const membersOf = oid => D.chars.filter(c => c.orgIds.includes(oid));
const entArr = type => ({ char: D.chars, org: D.orgs, anom: D.anoms }[type]);
const bySeq = (a, b) => (a.order - b.order) || ((a.created || 0) - (b.created || 0));
function sortEvents(list) {   // 也用于角色经历（同样有 worldId / order）
  const wo = new Map(worldsSorted().map((w, i) => [w.id, i]));
  return list.slice().sort((a, b) => (wo.get(a.worldId) - wo.get(b.worldId)) || bySeq(a, b));
}
function renum(list) { list.slice().sort(bySeq).forEach((x, i) => { x.order = (i + 1) * 10; }); }
/* 位置选择（"放在某条之后"） */
function predOf(all, self) { const i = all.findIndex(x => x.id === self.id); return i <= 0 ? '__first' : all[i - 1].id; }
function posOpts(others, pred, labelFn) {
  if (!others.length) return `<option value="__first">（这是第一条）</option>`;
  return `<option value="__first" ${pred === '__first' ? 'selected' : ''}>放在最前面</option>` +
    others.map(x => `<option value="${x.id}" ${pred === x.id ? 'selected' : ''}>在「${esc(trunc(labelFn(x), 14))}」之后</option>`).join('');
}
function orderAt(others, pos) {
  if (!others.length) return 10;
  if (pos === '__first') return others[0].order - 5;
  const i = others.findIndex(x => x.id === pos);
  if (i < 0) return others[others.length - 1].order + 10;
  return others[i + 1] ? (others[i].order + others[i + 1].order) / 2 : others[i].order + 10;
}
function posFor(list, wid, self, labelFn) {
  const all = list.filter(x => x.worldId === wid).sort(bySeq);
  const others = self ? all.filter(x => x.id !== self.id) : all;
  const pred = self && self.worldId === wid ? predOf(all, self) : (others.length ? others[others.length - 1].id : '__first');
  return { others, html: posOpts(others, pred, labelFn) };
}
function presence(type, o, w) {
  const id = o.id;
  let n = o.facts.filter(f => f.worldId === w).length + D.notes.filter(x => x.refType === type && x.refId === id && x.worldId === w).length;
  if (type === 'char') n += (o.bio[w] ? 1 : 0) + o.exps.filter(x => x.worldId === w).length + D.events.filter(e => e.worldId === w && e.charIds.includes(id)).length +
    D.rels.filter(r => r.worldId === w && (r.a === id || r.b === id)).length + D.imgs.filter(i => i.worldId === w && i.charIds.includes(id)).length;
  else n += D.events.filter(e => e.worldId === w && e.orgIds.includes(id)).length;
  return n;
}
function relEvents(r) {
  const exp = r.eventIds.map(id => byId(D.events, id)).filter(Boolean);
  const s = new Set(exp.map(e => e.id));
  const co = D.events.filter(e => e.worldId === r.worldId && !s.has(e.id) && e.charIds.includes(r.a) && e.charIds.includes(r.b));
  return { exp: sortEvents(exp), co: sortEvents(co), all: exp.length + co.length };
}

/* ---------- 图片 ---------- */
const urlCache = new Map();
async function imgURL(key) {
  if (urlCache.has(key)) return urlCache.get(key);
  const b = await IDB.get('img', key).catch(() => null);
  if (!b) return '';
  const u = URL.createObjectURL(b); urlCache.set(key, u); return u;
}
function hydrate(root) {
  $$('[data-img]', root).forEach(async el => {
    const k = el.getAttribute('data-img');
    let u = await imgURL(k);
    if (!u && k.endsWith('_t')) u = await imgURL(k.slice(0, -2));
    if (!u) return;
    if (el.tagName.toLowerCase() === 'image') el.setAttribute('href', u); else el.src = u;
  });
}
function loadImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file); const im = new Image();
    im.onload = () => { URL.revokeObjectURL(url); res(im); };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('无法读取图片：' + (file.name || ''))); };
    im.src = url;
  });
}
function encode(cv, q) {
  return new Promise(res => cv.toBlob(b => {
    if (b && b.type === 'image/webp') { res(b); return; }
    const c2 = document.createElement('canvas'); c2.width = cv.width; c2.height = cv.height;
    const x = c2.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c2.width, c2.height); x.drawImage(cv, 0, 0);
    c2.toBlob(res, 'image/jpeg', q);
  }, 'image/webp', q));
}
function scaleImage(im, max, q) {
  const w = im.naturalWidth, h = im.naturalHeight, r = Math.min(1, max / Math.max(w, h));
  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round(w * r)); cv.height = Math.max(1, Math.round(h * r));
  cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
  return encode(cv, q);
}
/* 头像：角色裁成正方形填满；组织 / 异常的 Logo 完整放入正方形（透明留边） */
function squareImage(im, S, fit) {
  const w = im.naturalWidth, h = im.naturalHeight;
  const r = fit === 'contain' ? Math.min(S / w, S / h) : Math.max(S / w, S / h);
  const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
  const dw = w * r, dh = h * r;
  cv.getContext('2d').drawImage(im, (S - dw) / 2, (S - dh) / 2, dw, dh);
  return encode(cv, 0.9);
}
async function storeAvatar(file, fit) {
  const im = await loadImage(file);
  const id = uid('av');
  await IDB.put('img', id, await squareImage(im, 512, fit));
  await IDB.put('img', id + '_t', await squareImage(im, 160, fit));
  return id;
}
async function deleteImageBlob(id) {
  for (const k of [id, id + '_t']) { await IDB.del('img', k).catch(() => { }); if (urlCache.has(k)) { URL.revokeObjectURL(urlCache.get(k)); urlCache.delete(k); } }
}
function pickFiles(multiple) {
  return new Promise(res => {
    const inp = $('#fileImg'); inp.value = ''; inp.multiple = !!multiple;
    inp.onchange = () => res(Array.from(inp.files || []));
    inp.click();
  });
}
const isOwnAv = id => typeof id === 'string' && id.slice(0, 2) === 'av';
const hasAv = o => !!(o && o.avatar && (isOwnAv(o.avatar) || byId(D.imgs, o.avatar)));
function autoAvatar(ids) {
  for (const id of ids) {
    const im = byId(D.imgs, id);
    if (im && im.charIds.length === 1) { const c = byId(D.chars, im.charIds[0]); if (c && !hasAv(c)) c.avatar = id; }
  }
}
async function uploadImages(preset) {
  const files = await pickFiles(true); if (!files.length) return;
  toast(`正在处理 ${files.length} 张图片…`);
  const ids = [], t0 = now();
  for (const f of files) {
    try {
      const im = await loadImage(f);
      const full = await scaleImage(im, 2048, 0.9), thumb = await scaleImage(im, 360, 0.82);
      const id = uid('i');
      await IDB.put('img', id, full); await IDB.put('img', id + '_t', thumb);
      D.imgs.push({ id, charIds: preset.charIds.slice(), tags: preset.tags.slice(), worldId: preset.worldId, caption: '', created: t0 + ids.length });
      ids.push(id);
    } catch (e) { toast(e.message); }
  }
  if (!ids.length) return;
  autoAvatar(ids);
  commit(); toast(`已添加 ${ids.length} 张图片`);
  tagSheet(ids, { mode: 'new' });
}
async function removeImage(id) {
  await deleteImageBlob(id);
  D.imgs = D.imgs.filter(x => x.id !== id);
  D.chars.forEach(c => { if (c.avatar === id) c.avatar = null; });
}
async function setAvatar(o, id) {
  const old = o.avatar; o.avatar = id;
  if (old && old !== id && isOwnAv(old)) await deleteImageBlob(old);
  commit(); toast(id ? '头像已更新' : '已移除头像');
}

/* ---------- 路由 ---------- */
let depth = 0, pendingTab = null, refocus = null;
function route() {
  const h = location.hash.slice(1) || '/chars'; const i = h.indexOf('?');
  const path = i < 0 ? h : h.slice(0, i);
  const q = {}; new URLSearchParams(i < 0 ? '' : h.slice(i + 1)).forEach((v, k) => { q[k] = v; });
  const parts = path.split('/').filter(Boolean);
  return { parts, q, sec: parts[0] || 'chars', id: parts[1] };
}
function go(h) { if (location.hash === '#' + h) { render(); return; } depth++; location.hash = h; }
function replaceTo(h) { if (location.hash === '#' + h) render(); else location.replace('#' + h); }
function tab(h) {
  if (depth > 0) { pendingTab = h; const d = depth; depth = 0; history.go(-d); }
  else replaceTo(h);
}
const PARENT = { char: '/chars', org: '/orgs', event: '/events', rel: '/rels', world: '/worlds', term: '/terms', search: '/chars', settings: '/chars', accc: '/chars', anom: '/accc' };
function back() {
  if (depth > 0) { depth--; history.back(); return; }
  replaceTo(PARENT[route().sec] || '/chars');
}
function setQ(k, v) {
  const r = route(); if (v === '' || v == null) delete r.q[k]; else r.q[k] = v;
  const qs = new URLSearchParams(r.q).toString();
  location.replace('#/' + r.parts.join('/') + (qs ? '?' + qs : ''));
}
window.addEventListener('hashchange', () => {
  if (pendingTab) { const t = pendingTab; pendingTab = null; replaceTo(t); return; }
  render();
});
/* 安卓返回键：由外壳调用，返回 true 表示已处理 */
window.__onBack = function () {
  if (closeTop()) return true;
  if (UI.sel) { UI.sel = null; render(); return true; }
  const r = route();
  if (depth > 0 || PARENT[r.sec]) { back(); return true; }
  if (r.sec !== 'chars') { replaceTo('/chars'); return true; }
  return false;
};

/* ---------- 弹层 ---------- */
const sheets = [];
function openSheet({ title, body, foot, onMount, maskClose }) {
  const m = document.createElement('div'); m.className = 'mask';
  m.innerHTML = `<div class="sheet"><div class="sh"><h3>${esc(title)}</h3><button class="ib" data-close>${icon('x')}</button></div><div class="sb">${body}</div>${foot ? `<div class="sf">${foot}</div>` : ''}</div>`;
  m.addEventListener('click', e => { if ((maskClose && e.target === m) || e.target.closest('[data-close]')) closeSheet(m); });
  document.body.appendChild(m); sheets.push(m);
  hydrate(m);
  if (onMount) onMount(m);
  return m;
}
function pushLayer(el) { document.body.appendChild(el); sheets.push(el); }
function closeSheet(m) {
  const i = sheets.indexOf(m); if (i >= 0) sheets.splice(i, 1);
  if (m._onClose) { const f = m._onClose; m._onClose = null; f(); }
  m.remove();
}
function closeTop() { const m = sheets[sheets.length - 1]; if (!m) return false; closeSheet(m); return true; }
function ask(msg, ok = '确定', danger = false) {
  return new Promise(res => {
    const m = openSheet({
      title: '请确认', maskClose: true,
      body: `<p class="pre" style="margin:2px 0 6px">${esc(msg)}</p>`,
      foot: `<button class="btn" data-no>取消</button><button class="btn ${danger ? 'danger' : 'p'}" data-yes>${esc(ok)}</button>`
    });
    m._onClose = () => res(false);
    m.querySelector('[data-no]').onclick = () => closeSheet(m);
    m.querySelector('[data-yes]').onclick = () => { m._onClose = null; closeSheet(m); res(true); };
  });
}
function formSheet({ title, body, onSave, onDelete, onMount, okText = '保存' }) {
  const m = openSheet({
    title, body, onMount,
    foot: (onDelete ? `<button class="btn d" data-del aria-label="删除">${icon('trash')}</button>` : '') + `<button class="btn" data-close>取消</button><button class="btn p" data-ok>${okText}</button>`
  });
  let busy = false;
  m.querySelector('[data-ok]').onclick = async () => { if (busy) return; busy = true; try { if ((await onSave(m)) !== false) closeSheet(m); } finally { busy = false; } };
  if (onDelete) m.querySelector('[data-del]').onclick = async () => { if ((await onDelete(m)) !== false) closeSheet(m); };
  return m;
}
function chooseFrom(title, items) {   // items: [{id, html}]
  return new Promise(res => {
    const m = openSheet({ title, maskClose: true, body: items.map(it => `<div class="list-opt" data-pick="${esc(it.id)}">${it.html}</div>`).join('') });
    m._onClose = () => res(null);
    m.addEventListener('click', e => { const o = e.target.closest('[data-pick]'); if (o) { m._onClose = null; closeSheet(m); res(o.getAttribute('data-pick')); } });
  });
}
let toastT;
function toast(msg) { const el = $('#toast'); el.textContent = msg; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2400); }

/* 表单片段 */
const fText = (name, label, v = '', ph = '', extra = '') => `<label class="fl"><span>${label}</span><input type="text" name="${name}" value="${esc(v)}" placeholder="${esc(ph)}" autocomplete="off" ${extra}></label>`;
const fArea = (name, label, v = '', ph = '', cls = '') => `<label class="fl"><span>${label}</span><textarea name="${name}" class="${cls}" placeholder="${esc(ph)}">${esc(v)}</textarea></label>`;
const fWorld = (sel, label = '属于哪条世界线') => `<label class="fl"><span>${label}</span><select name="worldId">${worldOptions(sel)}</select></label>`;
function fList(name, label, v, opts, ph = '') {
  const lid = 'dl_' + name;
  return `<label class="fl"><span>${label}</span><input type="text" name="${name}" list="${lid}" value="${esc(v)}" placeholder="${esc(ph)}" autocomplete="off"><datalist id="${lid}">${opts.map(o => `<option value="${esc(o)}">`).join('')}</datalist></label>`;
}
function pickChips(name, items, selected) {
  return items.map(it => { const on = selected.includes(it.id); return `<label class="chip ${on ? 'on' : ''}"><input type="checkbox" name="${name}" value="${esc(it.id)}" ${on ? 'checked' : ''}>${it.html}</label>`; }).join('');
}
function fPick(name, label, items, selected, empty = '（暂无可选项）') {
  return `<div class="fl"><span>${label}</span>${items.length ? `<div class="pick"><div class="chips wrap">${pickChips(name, items, selected)}</div></div>` : `<div class="hint">${empty}</div>`}</div>`;
}
const val = (m, name) => { const el = m.querySelector(`[name="${name}"]`); return el ? el.value.trim() : ''; };
const rawVal = (m, name) => { const el = m.querySelector(`[name="${name}"]`); return el ? el.value.replace(/\s+$/, '') : ''; };
const vals = (m, name) => $$(`[name="${name}"]:checked`, m).map(x => x.value);
const charItems = () => D.chars.map(c => ({ id: c.id, html: avatar(c, 's') + esc(c.name) }));
const orgItems = () => D.orgs.map(o => ({ id: o.id, html: avatar(o, 's', true) + esc(o.name) }));
/* 图片标签 */
function tagCounts() {
  const m = new Map(); D.imgs.forEach(i => i.tags.forEach(t => m.set(t, (m.get(t) || 0) + 1)));
  return Array.from(m).sort((a, b) => (b[1] - a[1]) || ZH.compare(a[0], b[0]));
}
function tagField(sel) {
  const all = Array.from(new Set(tagCounts().map(x => x[0]).concat(sel)));
  return `<div class="fl"><span>标签</span>${all.length ? `<div class="chips wrap" style="margin-bottom:8px">${pickChips('tags', all.map(t => ({ id: t, html: '#' + esc(t) })), sel)}</div>` : ''}` +
    `<input type="text" name="newtags" placeholder="${all.length ? '添加新标签，' : ''}多个用空格或逗号分隔" autocomplete="off"></div>`;
}
function readTags(m) {
  const s = new Set(vals(m, 'tags'));
  val(m, 'newtags').split(/[\s,，、;；#]+/).map(x => x.trim()).filter(Boolean).forEach(x => s.add(x));
  return Array.from(s);
}

/* ---------- 术语自动标注 ---------- */
let TERM_SIG = null, TERM_RE = null, TERM_MAP = null;
const termKeys = t => [t.term].concat(String(t.alias || '').split(/[\/／,，、;；|]/)).map(s => s.trim()).filter(Boolean);
function termIndex() {
  const sig = D.terms.map(t => t.id + '\u0001' + t.term + '\u0001' + t.alias).join('\u0002');
  if (sig === TERM_SIG) return;
  TERM_SIG = sig; TERM_MAP = new Map();
  const keys = [];
  for (const t of D.terms) for (const k of termKeys(t)) {
    if (Array.from(k).length < 2) continue;
    const e = esc(k), lo = e.toLowerCase();
    if (!TERM_MAP.has(lo)) { TERM_MAP.set(lo, t.id); keys.push(e); }
  }
  keys.sort((a, b) => b.length - a.length);
  TERM_RE = keys.length ? new RegExp('(&[#a-zA-Z0-9]+;)|(' + keys.map(reEsc).join('|') + ')', 'gi') : null;
}
/* 转义文本，并把其中的术语变成可点的链接 */
function lk(text, selfId) {
  const s = esc(text);
  if (!UI.linkTerms || !D.terms.length) return s;
  termIndex(); if (!TERM_RE) return s;
  return s.replace(TERM_RE, (m, ent) => {
    if (ent) return m;
    const id = TERM_MAP.get(m.toLowerCase());
    return id && id !== selfId ? `<a class="term" data-act="termPop" data-id="${id}">${m}</a>` : m;
  });
}

/* ---------- 通用渲染片段 ---------- */
function avatar(o, size = '', sq = false) {
  const cls = `av ${size} ${sq ? 'sq' : ''}`;
  if (!o) return `<span class="${cls}">?</span>`;
  if (hasAv(o)) return `<img class="${cls}" data-img="${o.avatar}_t" alt="">`;
  const ch = Array.from(o.name || '?')[0] || '?';
  return `<span class="${cls}" style="background:${hashColor(o.name || o.id || '?')}">${esc(ch)}</span>`;
}
const avEdit = (type, o, sq) => `<span class="avwrap" data-act="avSheet" data-type="${type}" data-id="${o.id}">${avatar(o, 'l', sq)}<span class="avedit">${icon('camera')}</span></span>`;
function segBar(cur, items, counts = {}) {
  return `<div class="seg">${items.map(([k, t]) => `<a class="${cur === k ? 'on' : ''}" data-act="sub" data-t="${k}">${t}${counts[k] != null ? `<i>${counts[k]}</i>` : ''}</a>`).join('')}</div>`;
}
const emptyBox = (b, s = '') => `<div class="empty">${b ? `<b>${b}</b>` : ''}${s}</div>`;
const addLine = (label, attrs) => `<div class="add-line" ${attrs}>${icon('plus')}${label}</div>`;

function factsView(type, o) {
  const boxes = worldsSorted().filter(w => inW(w.id)).map(w => {
    const fs = o.facts.filter(f => f.worldId === w.id); return fs.length ? factBox(type, o, w.id, fs) : '';
  }).join('');
  let html = boxes || emptyBox(UI.world === 'all' ? '还没有设定' : '这条线下还没有专属设定', UI.world === 'all' ? '把已经定下来的设定一条条录进来（性格、外貌、能力、身份…）；还没定的放进「迷思」' : '分支线只需记录与主线不同的地方');
  if (UI.world !== 'all' && UI.world !== MAIN) {
    const mf = o.facts.filter(f => f.worldId === MAIN);
    if (mf.length) html += `<details class="ref"><summary>主线设定对照（${mf.length}）</summary>${factBox(type, o, MAIN, mf)}</details>`;
  }
  return html + addLine('添加设定', `data-act="addFact" data-type="${type}" data-id="${o.id}"`);
}
function factBox(type, o, wid, fs) {
  return `<div class="box ${kindOf(wid).c}"><div class="boxh">${wb(wid)}<span class="grow"></span><span>${fs.length} 条</span></div>` +
    fs.map(f => `<div class="fact" data-act="editFact" data-type="${type}" data-id="${o.id}" data-f="${f.id}"><div class="k">${esc(f.label || '—')}</div><div class="v">${lk(f.value)}</div></div>`).join('') + '</div>';
}
function refLabel(n) {
  const t = n.refType;
  const o = t === 'char' ? byId(D.chars, n.refId) : t === 'org' ? byId(D.orgs, n.refId) : t === 'event' ? byId(D.events, n.refId) : t === 'rel' ? byId(D.rels, n.refId) : null;
  if (!o) return '';
  const name = t === 'event' ? o.title : t === 'rel' ? `${(byId(D.chars, o.a) || {}).name || '?'}×${(byId(D.chars, o.b) || {}).name || '?'}` : o.name;
  const pre = { char: '角色迷思', org: '组织迷思', event: '事件', rel: '关系' }[t];
  return `<span class="tag">${pre} · ${esc(trunc(name, 10))}</span>`;
}
function noteCard(n, opts = {}) {
  return `<div class="note ${kindOf(n.worldId).c}" data-act="editNote" data-id="${n.id}"><div class="pre">${opts.q ? hl(n.text, opts.q) : lk(n.text)}</div><div class="foot">${opts.fixedW ? '' : wb(n.worldId)}${opts.showRef ? refLabel(n) : ''}<span class="grow"></span>${fmtDate(n.created)}</div></div>`;
}
function notesView(rt, rid, opts = {}) {
  const fixedW = opts.fixedW;
  const list = (opts.list || notesOf(rt, rid).filter(n => fixedW || inW(n.worldId))).slice().sort((a, b) => b.created - a.created);
  const comp = `<div class="composer"><textarea id="nc" rows="3" placeholder="${esc(opts.ph || '随手记一笔，不需要标题…')}"></textarea><div class="row">` +
    (fixedW ? wb(fixedW) : `<select id="ncw">${worldOptions(defW())}</select>`) +
    `<button class="btn p sm" data-act="addNote" data-rt="${rt}" data-ri="${rid}" ${fixedW ? `data-w="${fixedW}"` : ''}>记下</button></div></div>`;
  return comp + (opts.extra || '') + (list.length ? list.map(n => noteCard(n, opts)).join('') : emptyBox('', opts.emptyText || '还没有记录'));
}
function eventCard(e, opts = {}) {
  const cs = e.charIds.map(id => byId(D.chars, id)).filter(Boolean);
  const when = (e.timeLabel ? esc(e.timeLabel) : '') + (e.key ? ` <span class="tag key">关键节点</span>` : '');
  return `<a class="card" data-act="nav" data-h="/event/${e.id}">${when ? `<div class="when">${when}</div>` : ''}<div class="title">${esc(e.title)}</div>` +
    (e.summary ? `<div class="sub clamp2">${esc(e.summary)}</div>` : '') +
    `<div class="meta">${opts.noW ? '' : wb(e.worldId)}<span class="avs">${cs.slice(0, 8).map(c => avatar(c, 's')).join('')}${cs.length > 8 ? `<span class="hint">+${cs.length - 8}</span>` : ''}</span></div></a>`;
}
function timeline(list, wid) {
  return `<div class="tl ${kindOf(wid).c}">${list.map(e => `<div class="tli ${kindOf(e.worldId).c} ${e.key ? 'key' : ''}">${eventCard(e, { noW: true })}</div>`).join('')}</div>`;
}
function eventGroups(list, emptyText = '暂无事件') {
  if (!list.length) return emptyBox('', emptyText);
  return Array.from(groupBy(sortEvents(list), e => e.worldId)).map(([w, es]) => `<div class="sec">${wb(w)}<span class="grow"></span><span>${es.length} 个节点</span></div>` + timeline(es, w)).join('');
}
function relCard(r, focus) {
  const A = byId(D.chars, r.a), B = byId(D.chars, r.b), arrow = r.dir === 'ab' ? '→' : '⇄';
  const ev = relEvents(r);
  let top;
  if (focus) {
    const other = r.a === focus ? B : A, dirTxt = r.dir === 'ab' ? (r.a === focus ? '→ 对方' : '← 来自对方') : '';
    top = `${avatar(other, 'm')}<div class="grow"><div class="title">${esc(other ? other.name : '?')} <span class="sub">${dirTxt}</span></div>`;
  } else {
    top = `<div class="grow"><div class="relpair">${avatar(A, 's')}${esc(A ? A.name : '?')}<span class="x">${arrow}</span>${avatar(B, 's')}${esc(B ? B.name : '?')}</div>`;
  }
  return `<a class="card" data-act="nav" data-h="/rel/${r.id}"><div class="row">${top}<div class="meta"><span class="tag">${esc(r.type || '关系')}</span>${wb(r.worldId)}<span class="hint">相关事件 ${ev.all}</span></div>` +
    (r.desc ? `<div class="sub clamp2" style="margin-top:4px">${esc(r.desc)}</div>` : '') + `</div></div></a>`;
}
function entityCard(type, o) {
  const isC = type === 'char';
  const fc = o.facts.filter(f => inW(f.worldId)).length, nc = D.notes.filter(n => n.refType === type && n.refId === o.id && inW(n.worldId)).length;
  const ec = (isC ? eventsOfChar(o.id) : eventsOfOrg(o.id)).filter(e => inW(e.worldId)).length;
  const tags = isC ? o.orgIds.map(id => byId(D.orgs, id)).filter(Boolean).map(g => `<span class="tag">${esc(g.name)}</span>`).join('') : `<span class="tag">成员 ${membersOf(o.id).length}</span>`;
  const s = [o.name, o.alias, o.tagline].join(' ').toLowerCase();
  return `<a class="card" data-act="nav" data-h="/${type}/${o.id}" data-s="${esc(s)}"><div class="row">${avatar(o, '', !isC)}<div class="grow">` +
    `<div class="title">${esc(o.name)}${o.alias ? ` <span class="sub">${esc(o.alias)}</span>` : ''}</div>` +
    (o.tagline ? `<div class="sub clamp2">${esc(o.tagline)}</div>` : '') +
    `<div class="meta">${tags}<span class="hint">设定 ${fc} · 迷思 ${nc}${isC ? ` · 经历 ${o.exps.filter(x => inW(x.worldId)).length}` : ''} · 事件 ${ec}</span></div></div></div></a>`;
}
function entityList(type) {
  const arr = type === 'char' ? D.chars : D.orgs;
  const list = arr.slice().sort((a, b) => (a.created || 0) - (b.created || 0));
  if (UI.world === 'all') return list.map(o => entityCard(type, o)).join('');
  const yes = list.filter(o => presence(type, o, UI.world) > 0), no = list.filter(o => presence(type, o, UI.world) === 0);
  return (yes.length ? yes.map(o => entityCard(type, o)).join('') : emptyBox('', '这条世界线下还没有相关记录')) +
    (no.length ? `<div class="sec">在此线暂无记录（${no.length}）</div><div class="dim">${no.map(o => entityCard(type, o)).join('')}</div>` : '');
}
let GAL_LIST = [];   // 当前页面显示的图片顺序（看图时左右翻）
function galleryGrid(imgs, opts = {}) {
  const sel = UI.sel;
  GAL_LIST = imgs.map(i => i.id);
  return `<div class="grid">` + (opts.add ? `<div class="ph add" data-act="upload" ${opts.c ? `data-c="${opts.c}"` : ''}>${icon('plus')}</div>` : '') +
    imgs.map(i => {
      const ppl = i.charIds.map(id => byId(D.chars, id)).filter(Boolean);
      return `<div class="ph ${sel && sel.has(i.id) ? 'sel' : ''}" data-act="${sel ? 'selImg' : 'viewImg'}" data-id="${i.id}"><img data-img="${i.id}_t" alt="" loading="lazy">` +
        (i.worldId !== MAIN ? `<span class="wdot">${wb(i.worldId)}</span>` : '') +
        (i.tags.length ? `<span class="tg">#${esc(i.tags[0])}${i.tags.length > 1 ? ' +' + (i.tags.length - 1) : ''}</span>` : '') +
        (ppl.length ? `<span class="ppl">${ppl.slice(0, 3).map(c => avatar(c, 'xs')).join('')}${ppl.length > 3 ? `<b>+${ppl.length - 3}</b>` : ''}</span>` : '') +
        (sel ? `<span class="ck">${icon('check')}</span>` : '') + `</div>`;
    }).join('') + `</div>`;
}

/* 关系网络图 */
function graphSVG(rels, focus) {
  const ids = Array.from(new Set(rels.flatMap(r => [r.a, r.b]))).filter(id => byId(D.chars, id));
  if (ids.length < 2) return '';
  const n = ids.length, Wd = 360, H = Math.max(300, Math.min(440, 230 + n * 14));
  const cx = Wd / 2, cy = H / 2, R = Math.min(Wd, H) / 2 - 48, NR = 21;
  const pos = {};
  ids.forEach((id, i) => { const a = -Math.PI / 2 + 2 * Math.PI * i / n; pos[id] = [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });
  const cnt = {}, idx = {};
  rels.forEach(r => { const k = [r.a, r.b].sort().join('|'); cnt[k] = (cnt[k] || 0) + 1; });
  let edges = '', labels = '';
  for (const r of rels) {
    if (!pos[r.a] || !pos[r.b]) continue;
    const k = [r.a, r.b].sort().join('|'), i = (idx[k] = (idx[k] || 0) + 1) - 1, c = cnt[k];
    const [p1, p2] = r.a < r.b ? [pos[r.a], pos[r.b]] : [pos[r.b], pos[r.a]];
    const dx = p2[0] - p1[0], dy = p2[1] - p1[1], len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
    const off = (i - (c - 1) / 2) * 30;
    const mx = (p1[0] + p2[0]) / 2 + nx * off, my = (p1[1] + p2[1]) / 2 + ny * off;
    const qx = 2 * mx - (p1[0] + p2[0]) / 2, qy = 2 * my - (p1[1] + p2[1]) / 2;
    const [s, t] = r.a < r.b ? [p1, p2] : [p2, p1];
    const sh = (pt, toward) => { const vx = toward[0] - pt[0], vy = toward[1] - pt[1], l = Math.hypot(vx, vy) || 1; return [pt[0] + vx / l * (NR + 3), pt[1] + vy / l * (NR + 3)]; };
    const s2 = sh(s, [qx, qy]), t2 = sh(t, [qx, qy]);
    const d = `M${s2[0].toFixed(1)},${s2[1].toFixed(1)} Q${qx.toFixed(1)},${qy.toFixed(1)} ${t2[0].toFixed(1)},${t2[1].toFixed(1)}`;
    const kc = kindOf(r.worldId).c, dim = focus && r.a !== focus && r.b !== focus ? ' opacity="0.15"' : '';
    edges += `<g data-act="nav" data-h="/rel/${r.id}"${dim}><path class="hit" d="${d}"/><path class="edge" d="${d}" style="stroke:var(--${kc})" ${r.worldId !== MAIN ? 'stroke-dasharray="6 4"' : ''} ${r.dir === 'ab' ? `marker-end="url(#ar-${kc})"` : ''}/></g>`;
    labels += `<text class="el" x="${mx.toFixed(1)}" y="${(my + 4).toFixed(1)}" text-anchor="middle" data-act="nav" data-h="/rel/${r.id}"${dim}>${esc(trunc(r.type || '', 6))}</text>`;
  }
  const marks = Object.values(KIND).map(k => `<marker id="ar-${k.c}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" style="fill:var(--${k.c})"/></marker>`).join('');
  const nodes = ids.map((id, i) => {
    const c = byId(D.chars, id), [x, y] = pos[id], on = focus === id;
    const dim = focus && !on && !rels.some(r => (r.a === focus && r.b === id) || (r.b === focus && r.a === id));
    const face = hasAv(c)
      ? `<image data-img="${c.avatar}_t" x="${x - NR}" y="${y - NR}" width="${2 * NR}" height="${2 * NR}" preserveAspectRatio="xMidYMid slice" clip-path="url(#gc${i})"/>`
      : `<text x="${x}" y="${y + 5}" text-anchor="middle" style="fill:#fff;font-weight:700;font-size:15px">${esc(Array.from(c.name || '?')[0])}</text>`;
    return `<g class="node" data-act="relFocus" data-id="${id}"${dim ? ' opacity="0.35"' : ''}><clipPath id="gc${i}"><circle cx="${x}" cy="${y}" r="${NR}"/></clipPath>` +
      `<circle cx="${x}" cy="${y}" r="${NR}" style="fill:${hashColor(c.name || c.id)}"/>${face}` +
      `<circle cx="${x}" cy="${y}" r="${NR}" fill="none" style="stroke:${on ? 'var(--ink)' : 'var(--card)'};stroke-width:${on ? 3 : 2}"/>` +
      `<text class="nm" x="${x}" y="${y < cy - 1 ? y - NR - 7 : y + NR + 15}" text-anchor="middle">${esc(trunc(c.name, 6))}</text></g>`;
  }).join('');
  return `<div class="graph"><svg viewBox="0 0 ${Wd} ${H}"><defs>${marks}</defs>${edges}${labels}${nodes}</svg></div>`;
}

/* 角色经历：生平（整段文本）+ 时间线（时间点） */
function expRefCard(o, x) {
  return `<a class="card" data-act="nav" data-h="/char/${o.id}?t=exp"><div class="row">${avatar(o, 's')}<b>${esc(o.name)}</b>${x.time ? `<span class="sub">${esc(x.time)}</span>` : ''}<span class="grow"></span>${wb(x.worldId)}</div><div class="sub clamp3" style="margin-top:4px">${esc(x.text)}</div></a>`;
}
function expItem(c, x) {
  const ev = x.eventId ? byId(D.events, x.eventId) : null;
  const cs = x.charIds.map(id => byId(D.chars, id)).filter(Boolean), os = x.orgIds.map(id => byId(D.orgs, id)).filter(Boolean);
  const links = (ev ? `<a class="tag" data-act="nav" data-h="/event/${ev.id}">${icon('tl', 'xs')}${esc(trunc(ev.title, 16))}</a>` : '') +
    cs.map(p => `<a class="tag" data-act="nav" data-h="/char/${p.id}">${avatar(p, 'xs')}${esc(p.name)}</a>`).join('') +
    os.map(g => `<a class="tag" data-act="nav" data-h="/org/${g.id}">${avatar(g, 'xs', true)}${esc(g.name)}</a>`).join('');
  return `<div class="tli ${kindOf(x.worldId).c}"><div class="card" data-act="editExp" data-c="${c.id}" data-id="${x.id}">${x.time ? `<div class="when">${esc(x.time)}</div>` : ''}<div class="pre">${lk(x.text)}</div>` +
    (links ? `<div class="meta">${links}</div>` : '') + `</div></div>`;
}
function expView(c) {
  /* 生平 */
  const bios = worldsSorted().filter(w => inW(w.id) && c.bio[w.id]);
  const missing = worldsSorted().filter(w => inW(w.id) && !c.bio[w.id]);
  let h = `<div class="sec" style="margin-top:4px">生平</div>`;
  h += bios.map(w => `<div class="box ${kindOf(w.id).c}"><div class="boxh">${wb(w.id)}<span class="grow"></span><a class="lnk" data-act="editBio" data-c="${c.id}" data-w="${w.id}">${icon('edit', 'xs')} 编辑</a></div><div class="pre" style="padding:12px 14px">${lk(c.bio[w.id])}</div></div>`).join('');
  if (!bios.length) h += `<div class="hint" style="margin:0 2px 8px">用一整段文字写下 TA 的生平；IF / AU 线可以各写一份。</div>`;
  if (missing.length) h += addLine(bios.length ? '为其他世界线写生平' : '写生平', `data-act="editBio" data-c="${c.id}" data-w="${(missing.find(w => w.id === defW()) || missing[0]).id}"`);
  /* 时间线 */
  const list = c.exps.filter(x => inW(x.worldId));
  h += `<div class="sec">时间线 · 按时间点<span class="grow"></span><span>${list.length} 条</span></div>`;
  if (!list.length) h += `<div class="hint" style="margin:0 2px 8px">按时间点记录 TA 经历的事，每条都可以关联相关人物、组织和情节节点。</div>`;
  else h += Array.from(groupBy(sortEvents(list), x => x.worldId)).map(([w, xs]) =>
    `<div class="flabel" style="margin-top:6px">${wb(w)}</div><div class="tl ${kindOf(w).c}">${xs.map(x => expItem(c, x)).join('')}</div>`).join('');
  h += addLine('添加时间点', `data-act="addExp" data-c="${c.id}"`);
  /* 出场的情节节点（来自「情节」时间线） */
  const evs = eventsOfChar(c.id).filter(e => inW(e.worldId));
  if (evs.length) h += `<details class="ref" style="margin-top:6px"><summary>出场的情节节点（${evs.length}）· 来自「情节」时间线</summary>${eventGroups(evs)}</details>`;
  /* 其他角色经历里提到 TA */
  const others = [];
  D.chars.forEach(o => { if (o.id !== c.id) o.exps.forEach(x => { if (x.charIds.includes(c.id) && inW(x.worldId)) others.push(expRefCard(o, x)); }); });
  if (others.length) h += `<div class="sec">其他角色经历中提到 TA · ${others.length}</div>` + others.join('');
  return h;
}
function bioForm(c, wid) {
  formSheet({
    title: `生平 · ${c.name}`,
    body: fWorld(wid, '哪条世界线的生平') + fArea('bio', '生平经历', c.bio[wid] || '', '一整段写下 TA 的人生经历…', 'xtall') +
      `<div class="hint">每条世界线各写一份；清空内容再保存，就会删除这条线的生平。</div>`,
    onMount(m) {
      const ws = m.querySelector('[name=worldId]'), ta = m.querySelector('[name=bio]');
      ws.addEventListener('change', () => { ta.value = c.bio[ws.value] || ''; });
    },
    onSave(m) {
      const w = val(m, 'worldId'), t = rawVal(m, 'bio');
      if (t.trim()) c.bio[w] = t; else delete c.bio[w];
      c.updated = now(); commit();
    }
  });
}

/* 术语 */
const TERM_CATS = ['地名', '组织', '能力', '物品', '种族', '称谓', '事件', '概念', '其他'];
function termCard(t) {
  return `<a class="card" data-act="nav" data-h="/term/${t.id}" data-s="${esc([t.term, t.alias, t.def, t.cat].join(' ').toLowerCase())}"><div class="row" style="align-items:flex-start"><div class="grow">` +
    `<div class="title">${esc(t.term)}${t.alias ? ` <span class="sub">${esc(t.alias)}</span>` : ''}</div>${t.def ? `<div class="sub clamp2">${esc(t.def)}</div>` : ''}</div>` +
    `${t.worldId !== MAIN ? wb(t.worldId) : ''}</div></a>`;
}
function mentionsOf(t) {
  const keys = termKeys(t).map(k => k.toLowerCase());
  const out = [];
  const chk = (text, where, h) => {
    if (!text || out.length >= 80) return;
    const lt = String(text).toLowerCase(), k = keys.find(x => lt.includes(x));
    if (k) out.push({ where, h, html: hl(snippet(text, k, 60), k) });
  };
  for (const c of D.chars) {
    chk(c.tagline, `角色 · ${c.name} · 简介`, `/char/${c.id}`);
    c.facts.forEach(f => chk(f.value, `角色 · ${c.name} · ${f.label || '设定'}`, `/char/${c.id}`));
    Object.keys(c.bio).forEach(w => chk(c.bio[w], `角色生平 · ${c.name}`, `/char/${c.id}?t=exp`));
    c.exps.forEach(x => chk(x.text, `角色经历 · ${c.name}${x.time ? ' · ' + x.time : ''}`, `/char/${c.id}?t=exp`));
  }
  for (const o of D.orgs) { chk(o.tagline, `组织 · ${o.name} · 简介`, `/org/${o.id}`); o.facts.forEach(f => chk(f.value, `组织 · ${o.name} · ${f.label || '设定'}`, `/org/${o.id}`)); }
  D.events.forEach(e => chk(e.title + '\n' + e.summary, `情节 · ${e.title}`, `/event/${e.id}`));
  D.rels.forEach(r => chk(r.desc, `关系 · ${(byId(D.chars, r.a) || {}).name || '?'}×${(byId(D.chars, r.b) || {}).name || '?'}`, `/rel/${r.id}`));
  D.worlds.forEach(w => chk(w.summary, `世界线 · ${w.name} · 总体情节`, `/world/${w.id}`));
  const noteHref = n => ({ char: `/char/${n.refId}?t=notes`, org: `/org/${n.refId}?t=notes`, event: `/event/${n.refId}`, rel: `/rel/${n.refId}`, world: `/world/${n.refId}?t=notes` }[n.refType] || '/worlds');
  D.notes.forEach(n => chk(n.text, '碎碎念 · ' + fmtDate(n.created), noteHref(n)));
  D.terms.forEach(x => { if (x.id !== t.id) chk(x.def, `术语 · ${x.term}`, `/term/${x.id}`); });
  return out;
}

/* 异常管理部 */
const PASS = 'ACCC';
const isPass = v => String(v || '').replace(/\s+/g, '').toUpperCase() === PASS;
const AC_STATUS = ['收容中', '观察中', '已逃逸', '失控', '已无效化', '已销毁', '未知'];
const AC_COLOR = { '收容中': 'cyan', '观察中': 'blue', '已逃逸': 'amber', '失控': 'amber', '已无效化': 'gray', '已销毁': 'gray', '已解除': 'gray', '未知': 'violet' };
const acCatName = id => { const c = id && byId(D.acCats, id); return c ? c.name : ''; };
const stCls = s => 'st-' + (AC_COLOR[s || '未知'] || 'violet');
function nextCode() {
  let mx = 0; D.anoms.forEach(a => { const m = /(\d+)\s*$/.exec(a.code || ''); if (m) mx = Math.max(mx, +m[1]); });
  return 'ACCC-' + String(mx + 1).padStart(3, '0');
}
function anomCard(a) {
  return `<a class="card" data-act="nav" data-h="/anom/${a.id}"><div class="row">${avatar(a, 'm', true)}<div class="grow"><div class="ac-code">${esc(a.code || '未编号')}</div><div class="title">${esc(a.name)}</div>` +
    `<div class="meta">${a.cat ? `<span class="tag">${esc(acCatName(a.cat))}</span>` : ''}<span class="badge ${stCls(a.status)}"><span class="dot"></span>${esc(a.status || '未知')}</span><span class="hint">记录 ${a.logs.length}</span></div></div></div></a>`;
}
function acccSplash() {
  const el = document.createElement('div'); el.className = 'accc-splash';
  el.innerHTML = `<div><div class="l1">ACCESS GRANTED</div><div class="l2">异常管理部</div><div class="l3">ACCC · 内部档案 · 仅限授权人员</div></div>`;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('out'), 950); setTimeout(() => el.remove(), 1400);
}

/* ---------- 页面 ---------- */
const VIEWS = {
  chars() {
    if (!D.chars.length) return {
      title: '角色', code: 'CHR', fab: { act: 'newChar', label: '新角色' },
      html: installWarn() + emptyBox('还没有角色', '点右下角「新角色」开始录入。<br><br>') + `<div style="text-align:center"><button class="btn" data-act="sample">载入一份示例看看效果</button></div>`
    };
    return { title: '角色', code: 'CHR', fab: { act: 'newChar', label: '新角色' }, html: installWarn() + worldChipsBar() + `<input class="search" type="search" placeholder="筛选角色名 / 别名 / 简介" data-filter><div id="flist">${entityList('char')}</div>` };
  },
  orgs() {
    if (!D.orgs.length) return { title: '组织', code: 'ORG', fab: { act: 'newOrg', label: '新组织' }, html: emptyBox('还没有组织', '门派、公司、国家、小队……都可以作为组织录入，并关联成员') };
    return { title: '组织', code: 'ORG', fab: { act: 'newOrg', label: '新组织' }, html: worldChipsBar() + `<input class="search" type="search" placeholder="筛选组织" data-filter><div id="flist">${entityList('org')}</div>` };
  },
  char(r) { return entityDetail('char', r); },
  org(r) { return entityDetail('org', r); },

  events() {
    const f = UI.ev;
    let list = D.events.filter(e => inW(e.worldId));
    if (f.c) list = list.filter(e => e.charIds.includes(f.c));
    if (f.o) list = list.filter(e => e.orgIds.includes(f.o));
    if (f.key) list = list.filter(e => e.key);
    if (f.q) { const q = f.q.toLowerCase(); list = list.filter(e => [e.title, e.summary, e.timeLabel].join(' ').toLowerCase().includes(q)); }
    const fbar = `<div class="fbar"><select data-evf="c"><option value="">全部人物</option>${D.chars.map(c => `<option value="${c.id}" ${f.c === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>` +
      `<select data-evf="o"><option value="">全部组织</option>${D.orgs.map(o => `<option value="${o.id}" ${f.o === o.id ? 'selected' : ''}>${esc(o.name)}</option>`).join('')}</select>` +
      `<input type="search" data-evf="q" placeholder="搜索情节关键词" value="${esc(f.q)}"><label class="tog"><input type="checkbox" data-evf="key" ${f.key ? 'checked' : ''}>只看关键节点</label></div>`;
    const active = f.c || f.o || f.key || f.q;
    const body = list.length ? eventGroups(list) : (D.events.length ? emptyBox('没有符合条件的情节', '试试调整上面的筛选') : emptyBox('还没有情节节点', '点「新事件」添加主线或分支线上的情节节点，会自动按世界线排成时间线'));
    return { title: '情节 · 时间线', code: 'EVT', fab: { act: 'newEvent', label: '新事件' }, html: worldChipsBar() + fbar + (active ? `<div class="hint" style="margin:-4px 2px 8px">已筛选 · ${list.length} 个节点　<a class="lnk" data-act="clearEvf">清除筛选</a></div>` : '') + body };
  },
  event(r) {
    const e = byId(D.events, r.id); if (!e) return { redirect: '/events' };
    const cs = e.charIds.map(id => byId(D.chars, id)).filter(Boolean), os = e.orgIds.map(id => byId(D.orgs, id)).filter(Boolean);
    const same = sortEvents(D.events.filter(x => x.worldId === e.worldId)), i = same.findIndex(x => x.id === e.id);
    const prev = same[i - 1], next = same[i + 1];
    const linked = D.rels.filter(x => x.eventIds.includes(e.id));
    const among = D.rels.filter(x => x.worldId === e.worldId && !x.eventIds.includes(e.id) && e.charIds.includes(x.a) && e.charIds.includes(x.b));
    const expRefs = [];
    D.chars.forEach(c => c.exps.forEach(x => { if (x.eventId === e.id) expRefs.push({ c, x }); }));
    let h = `<div class="row" style="align-items:flex-start"><div class="grow"><div class="meta" style="margin:0 0 6px">${wb(e.worldId)}${e.key ? '<span class="tag key">关键节点</span>' : ''}${e.timeLabel ? `<span class="sub">${esc(e.timeLabel)}</span>` : ''}</div><h2 style="margin:0;font-size:21px;line-height:1.3">${esc(e.title)}</h2></div><button class="ib" data-act="editEvent" data-id="${e.id}">${icon('edit')}</button></div>`;
    h += e.summary ? `<div class="box pad" style="margin-top:12px"><div class="pre">${lk(e.summary)}</div></div>` : `<div class="hint" style="margin:10px 2px">还没写经过，点右上角编辑</div>`;
    h += `<div class="sec">出场人物 · ${cs.length}</div>` + (cs.length ? `<div class="chips wrap">${cs.map(c => `<a class="chip" data-act="nav" data-h="/char/${c.id}">${avatar(c, 's')}${esc(c.name)}</a>`).join('')}</div>` : '<div class="hint">未关联人物</div>');
    if (os.length) h += `<div class="sec">相关组织</div><div class="chips wrap">${os.map(o => `<a class="chip" data-act="nav" data-h="/org/${o.id}">${avatar(o, 's', true)}${esc(o.name)}</a>`).join('')}</div>`;
    if (expRefs.length) h += `<div class="sec">角色经历中的这一段</div>` + expRefs.map(({ c, x }) => expRefCard(c, x)).join('');
    h += `<div class="sec">关联的关系</div>` + (linked.length ? linked.map(x => relCard(x)).join('') : '<div class="hint">没有关系手动关联到这个事件</div>');
    if (among.length) h += `<div class="sec">出场人物之间的其他关系</div>` + among.map(x => relCard(x)).join('');
    h += `<div class="sec">事件片段 / 碎碎念</div>` + notesView('event', e.id, { fixedW: e.worldId, ph: '这个事件的细节、台词、画面…' });
    h += `<div class="row" style="margin-top:14px">${prev ? `<a class="btn sm" data-act="go" data-h="/event/${prev.id}">${icon('left')}${esc(trunc(prev.title, 8))}</a>` : ''}<span class="grow"></span>${next ? `<a class="btn sm" data-act="go" data-h="/event/${next.id}">${esc(trunc(next.title, 8))}${icon('right')}</a>` : ''}</div>`;
    return { title: '情节节点', code: 'EVT', back: true, html: h };
  },

  rels() {
    const all = D.rels.filter(r => inW(r.worldId));
    const fc = UI.relC && byId(D.chars, UI.relC) ? UI.relC : '';
    const list = fc ? all.filter(r => r.a === fc || r.b === fc) : all;
    const fbar = `<div class="fbar"><select id="relc"><option value="">全部人物</option>${D.chars.map(c => `<option value="${c.id}" ${fc === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>`;
    if (!D.rels.length) return { title: '关系网络', code: 'REL', fab: { act: 'newRel', label: '新关系' }, html: emptyBox('还没有关系', '先录入至少两个角色，再点「新关系」把他们连起来。关系可以关联具体事件。') };
    return {
      title: '关系网络', code: 'REL', fab: { act: 'newRel', label: '新关系' },
      html: worldChipsBar() + fbar + graphSVG(all, fc) + `<div class="hint" style="margin:-4px 2px 10px">点人物高亮其关系，点连线查看关系与关联事件</div>` +
        (list.length ? list.map(r => relCard(r, fc)).join('') : emptyBox('', '这里没有关系'))
    };
  },
  rel(r) {
    const x = byId(D.rels, r.id); if (!x) return { redirect: '/rels' };
    const A = byId(D.chars, x.a), B = byId(D.chars, x.b), ev = relEvents(x);
    const person = c => `<a data-act="nav" data-h="/char/${c ? c.id : ''}" style="display:flex;flex-direction:column;align-items:center;gap:4px;width:96px;text-align:center">${avatar(c, 'l')}<b>${esc(c ? c.name : '?')}</b></a>`;
    let h = `<div class="row" style="justify-content:flex-end"><button class="ib" data-act="editRel" data-id="${x.id}">${icon('edit')}</button></div>`;
    h += `<div class="row" style="justify-content:center;gap:6px">${person(A)}<div style="text-align:center;min-width:80px"><div style="font-size:22px;color:var(--mute)">${x.dir === 'ab' ? '→' : '⇄'}</div><span class="tag">${esc(x.type || '关系')}</span></div>${person(B)}</div>`;
    h += `<div style="text-align:center;margin-top:10px">${wb(x.worldId)}</div>`;
    if (x.desc) h += `<div class="box pad" style="margin-top:12px"><div class="pre">${lk(x.desc)}</div></div>`;
    h += `<div class="sec">关联事件（手动）· ${ev.exp.length}</div>` + (ev.exp.length ? timeline(ev.exp, x.worldId) : '<div class="hint">编辑关系时可勾选相关事件</div>');
    if (ev.co.length) h += `<div class="sec">两人共同出场的事件（自动）· ${ev.co.length}</div>` + timeline(ev.co, x.worldId);
    const other = D.rels.filter(y => y.id !== x.id && ((y.a === x.a && y.b === x.b) || (y.a === x.b && y.b === x.a)));
    if (other.length) h += `<div class="sec">这两人在其他线 / 其他关系</div>` + other.map(y => relCard(y)).join('');
    h += `<div class="sec">关系片段 / 碎碎念</div>` + notesView('rel', x.id, { fixedW: x.worldId, ph: '这对关系的小细节、互动梗…' });
    return { title: '关系', code: 'REL', back: true, html: h };
  },

  worlds() {
    const cards = worldsSorted().map(w => {
      const k = KIND[w.kind] || KIND.other;
      const ec = D.events.filter(e => e.worldId === w.id).length, nc = D.notes.filter(n => n.worldId === w.id).length, rc = D.rels.filter(r => r.worldId === w.id).length;
      const fc = D.chars.concat(D.orgs).reduce((s, o) => s + o.facts.filter(f => f.worldId === w.id).length, 0);
      return `<a class="card" data-act="nav" data-h="/world/${w.id}" ${w.kind !== 'main' ? 'style="border-style:dashed"' : ''}><div class="row"><span class="wb ${k.c}">${w.kind === 'main' ? '★ 主线' : k.t}</span><div class="title grow">${esc(w.name)}</div></div>` +
        (w.summary ? `<div class="sub clamp3" style="margin-top:6px">${esc(w.summary)}</div>` : '<div class="hint" style="margin-top:6px">还没写总体情节</div>') +
        `<div class="meta hint">事件 ${ec} · 碎碎念 ${nc} · 关系 ${rc} · 设定 ${fc}</div></a>`;
    }).join('');
    return { title: '世界线', code: 'WLD', fab: { act: 'newWorld', label: '新世界线' }, html: `<div class="hint" style="margin:0 2px 10px">主线用实线和 ★ 标记；IF / AU / PARO 等分支用虚线和不同颜色区分，全应用统一。</div>` + cards };
  },
  world(r) {
    const w = byId(D.worlds, r.id); if (!w) return { redirect: '/worlds' };
    const t = r.q.t || 'plot', k = KIND[w.kind] || KIND.other;
    const evs = D.events.filter(e => e.worldId === w.id);
    const ownNotes = notesOf('world', w.id), allNotes = D.notes.filter(n => n.worldId === w.id);
    const people = D.chars.filter(c => presence('char', c, w.id) > 0), orgs = D.orgs.filter(o => presence('org', o, w.id) > 0);
    let h = `<div class="row" style="align-items:flex-start"><div class="grow"><span class="wb ${k.c}">${w.kind === 'main' ? '★ 主线' : k.t}</span><h2 style="margin:6px 0 0;font-size:22px">${esc(w.name)}</h2></div><button class="ib" data-act="editWorld" data-id="${w.id}">${icon('edit')}</button></div>`;
    h += `<div style="margin-top:8px"><button class="btn sm" data-act="setw" data-w="${w.id}">${UI.world === w.id ? '✓ 全应用正按此线筛选' : '用这条线筛选全应用'}</button></div>`;
    h += segBar(t, [['plot', '总体情节'], ['notes', '碎碎念'], ['events', '时间线'], ['chars', '出场']], { notes: UI.wAll ? allNotes.length : ownNotes.length, events: evs.length, chars: people.length + orgs.length });
    if (t === 'plot') h += w.summary ? `<div class="box pad"><div class="pre">${lk(w.summary)}</div></div><div class="add-line" data-act="editWorld" data-id="${w.id}">${icon('edit')}编辑总体情节</div>` : emptyBox('还没写总体情节', '写下这条线的大致走向、与主线的分歧点、结局…') + addLine('写总体情节', `data-act="editWorld" data-id="${w.id}"`);
    else if (t === 'notes') h += notesView('world', w.id, {
      fixedW: w.id, list: UI.wAll ? allNotes : ownNotes, showRef: true, ph: '这条线的小设定片段、脑洞、碎碎念…',
      extra: `<label class="tog" style="margin:0 2px 8px"><input type="checkbox" data-pref="wAll" ${UI.wAll ? 'checked' : ''}>同时显示角色 / 组织 / 事件里属于这条线的片段</label>`
    });
    else if (t === 'events') h += (evs.length ? timeline(sortEvents(evs), w.id) : emptyBox('', '这条线还没有情节节点')) + addLine('添加事件', `data-act="newEvent" data-w="${w.id}"`);
    else h += (people.length ? `<div class="sec">角色</div>` + people.map(c => entityCard('char', c)).join('') : emptyBox('', '还没有角色在这条线下有记录')) + (orgs.length ? `<div class="sec">组织</div>` + orgs.map(o => entityCard('org', o)).join('') : '');
    return { title: '世界线', code: 'WLD', back: true, html: h };
  },

  terms() {
    if (!D.terms.length) return {
      title: '术语库', code: 'TRM', fab: { act: 'newTerm', label: '新术语' },
      html: emptyBox('还没有术语', '世界观里的专有名词、地名、黑话、能力名……都可以收进来。<br>正文里出现这些词时会自动标出，点一下就能看释义。')
    };
    const base = D.terms.filter(t => inW(t.worldId));
    const cc = new Map(); base.forEach(t => { const c = t.cat || '未分类'; cc.set(c, (cc.get(c) || 0) + 1); });
    const cat = cc.has(UI.termCat) ? UI.termCat : '';
    const list = (cat ? base.filter(t => (t.cat || '未分类') === cat) : base).slice().sort((a, b) => ZH.compare(a.term, b.term));
    let h = worldChipsBar() + `<input class="search" type="search" placeholder="筛选术语 / 别名 / 释义" data-filter>`;
    h += `<div class="chips"><a class="chip ${!cat ? 'on' : ''}" data-act="termCat" data-c="">全部<i>${base.length}</i></a>${Array.from(cc).sort((a, b) => ZH.compare(a[0], b[0])).map(([c, n]) => `<a class="chip ${cat === c ? 'on' : ''}" data-act="termCat" data-c="${esc(c)}">${esc(c)}<i>${n}</i></a>`).join('')}</div>`;
    if (!list.length) return { title: '术语库', code: 'TRM', fab: { act: 'newTerm', label: '新术语' }, html: h + emptyBox('', '这里没有术语') };
    const groups = Array.from(groupBy(list, t => t.cat || '未分类')).sort((a, b) => a[0] === '未分类' ? 1 : b[0] === '未分类' ? -1 : ZH.compare(a[0], b[0]));
    h += `<div id="flist">${groups.map(([c, ts]) => `<div class="grp">${cat ? '' : `<div class="sec">${esc(c)}<span class="grow"></span><span>${ts.length}</span></div>`}${ts.map(termCard).join('')}</div>`).join('')}</div>`;
    return { title: '术语库', code: 'TRM', fab: { act: 'newTerm', label: '新术语' }, html: h };
  },
  term(r) {
    const t = byId(D.terms, r.id); if (!t) return { redirect: '/terms' };
    const cs = t.charIds.map(id => byId(D.chars, id)).filter(Boolean), os = t.orgIds.map(id => byId(D.orgs, id)).filter(Boolean);
    const ms = mentionsOf(t);
    let h = `<div class="row" style="align-items:flex-start"><div class="grow"><div class="meta" style="margin:0 0 6px">${t.cat ? `<span class="tag">${esc(t.cat)}</span>` : ''}${wb(t.worldId)}</div><h2 class="tterm">${esc(t.term)}</h2>${t.alias ? `<div class="sub">${esc(t.alias)}</div>` : ''}</div><button class="ib" data-act="editTerm" data-id="${t.id}">${icon('edit')}</button></div>`;
    h += t.def ? `<div class="box pad" style="margin-top:12px"><div class="pre">${lk(t.def, t.id)}</div></div>` : `<div class="hint" style="margin:10px 2px">还没写释义，点右上角编辑</div>`;
    if (cs.length || os.length) h += `<div class="sec">相关角色 / 组织</div><div class="chips wrap">${cs.map(c => `<a class="chip" data-act="nav" data-h="/char/${c.id}">${avatar(c, 's')}${esc(c.name)}</a>`).join('')}${os.map(o => `<a class="chip" data-act="nav" data-h="/org/${o.id}">${avatar(o, 's', true)}${esc(o.name)}</a>`).join('')}</div>`;
    h += `<div class="sec">在这些地方出现 · ${ms.length}</div>` + (ms.length ? ms.map(x => `<a class="card" data-act="nav" data-h="${x.h}"><div class="hint">${esc(x.where)}</div><div style="margin-top:2px">${x.html}</div></a>`).join('') : '<div class="hint">暂时没有其他内容提到这个术语</div>');
    return { title: '术语', code: 'TRM', back: true, html: h };
  },

  gallery() {
    if (!D.imgs.length) return {
      title: '图库', code: 'IMG', fab: { act: 'upload', label: '上传图片' },
      html: emptyBox('还没有图片', '上传后可以给每张图标记图中人物（可以多个）和标签，再按人物 / 标签筛选。')
    };
    const g = UI.gal, sel = UI.sel;
    g.c = g.c.filter(id => byId(D.chars, id));
    const base = D.imgs.filter(i => inW(i.worldId));
    const cCount = new Map(), tCount = new Map(); let raw = 0;
    for (const i of base) {
      i.charIds.forEach(c => cCount.set(c, (cCount.get(c) || 0) + 1));
      i.tags.forEach(t => tCount.set(t, (tCount.get(t) || 0) + 1));
      if (!i.charIds.length && !i.tags.length) raw++;
    }
    let list = base;
    if (g.raw) list = list.filter(i => !i.charIds.length && !i.tags.length);
    else {
      if (g.c.length) list = list.filter(i => g.c.every(c => i.charIds.includes(c)));
      if (g.t.length) list = list.filter(i => g.t.every(t => i.tags.includes(t)));
    }
    list = list.slice().sort((a, b) => b.created - a.created);
    const chars = D.chars.filter(c => cCount.has(c.id) || g.c.includes(c.id));
    const tags = Array.from(new Set(Array.from(tCount.keys()).concat(g.t))).sort((a, b) => ((tCount.get(b) || 0) - (tCount.get(a) || 0)) || ZH.compare(a, b));
    let h = worldChipsBar();
    if (chars.length) h += `<div class="flabel">人物<span class="hint">多选 = 同框</span></div><div class="chips">${chars.map(c => `<a class="chip ${g.c.includes(c.id) ? 'on' : ''}" data-act="galC" data-id="${c.id}">${avatar(c, 's')}${esc(c.name)}<i>${cCount.get(c.id) || 0}</i></a>`).join('')}</div>`;
    h += `<div class="flabel">标签<span class="grow"></span>${tags.length ? `<a class="lnk" data-act="tagMgr">管理标签</a>` : ''}</div><div class="chips">` +
      tags.map(t => `<a class="chip ${g.t.includes(t) ? 'on' : ''}" data-act="galT" data-t="${esc(t)}">#${esc(t)}<i>${tCount.get(t) || 0}</i></a>`).join('') +
      ((raw || g.raw) ? `<a class="chip ${g.raw ? 'on' : ''}" data-act="galRaw">未标记<i>${raw}</i></a>` : '') + (tags.length || raw || g.raw ? '' : '<span class="hint">还没有标签，点图片可以添加</span>') + `</div>`;
    const active = g.c.length || g.t.length || g.raw;
    h += `<div class="gbar"><span class="hint">${list.length} 张${active ? ' · 已筛选' : ''}</span>${active ? `<a class="lnk" data-act="galClear">清除筛选</a>` : ''}<span class="grow"></span>${sel ? '' : `<a class="btn sm" data-act="selStart">${icon('select')}批量选择</a>`}</div>`;
    if (list.length || !active) h += galleryGrid(list, { add: !sel });
    else { GAL_LIST = []; h += emptyBox('', '没有同时符合这些条件的图片'); }
    const bar = sel ? `<div class="selbar"><b>已选 ${sel.size}</b><span class="grow"></span><button class="btn sm" data-act="selAll">全选</button><button class="btn sm" data-act="selTag" ${sel.size ? '' : 'disabled'}>${icon('tag')}标记</button><button class="btn sm d" data-act="selDel" ${sel.size ? '' : 'disabled'}>${icon('trash')}</button><button class="btn sm p" data-act="selEnd">完成</button></div>` : '';
    return { title: '图库', code: 'IMG', fab: sel ? null : { act: 'upload', label: '上传图片' }, bar, html: h };
  },

  search(r) {
    const q = (r.q.q || '').trim(), ql = q.toLowerCase();
    if (isPass(q)) return { redirect: '/accc' };
    const h = `<input class="search" id="sq" type="search" placeholder="搜索角色、设定、情节、术语、碎碎念…" value="${esc(q)}" autocomplete="off">`;
    if (!q) return { title: '搜索', code: 'QRY', back: true, html: h + emptyBox('', '在所有世界线中查找'), after: () => { const el = $('#sq'); if (el && !refocus) el.focus(); } };
    const has = (...xs) => xs.join(' ').toLowerCase().includes(ql);
    const sect = (t, arr) => arr.length ? `<div class="sec">${t} · ${arr.length}</div>` + arr.join('') : '';
    const cs = D.chars.filter(c => has(c.name, c.alias, c.tagline)).map(c => entityCard('char', c));
    const os = D.orgs.filter(o => has(o.name, o.alias, o.tagline)).map(o => entityCard('org', o));
    const ts = D.terms.filter(t => has(t.term, t.alias, t.def, t.cat)).map(termCard);
    const facts = [], exps = [];
    for (const [type, arr] of [['char', D.chars], ['org', D.orgs]]) for (const o of arr) for (const f of o.facts) if (has(f.label, f.value))
      facts.push(`<a class="card" data-act="nav" data-h="/${type}/${o.id}"><div class="row">${avatar(o, 's', type === 'org')}<b>${esc(o.name)}</b><span class="grow"></span>${wb(f.worldId)}</div><div class="sub" style="margin-top:4px">${hl(f.label, q)}：${hl(snippet(f.value, q), q)}</div></a>`);
    for (const c of D.chars) for (const x of c.exps) if (has(x.time, x.text))
      exps.push(`<a class="card" data-act="nav" data-h="/char/${c.id}?t=exp"><div class="row">${avatar(c, 's')}<b>${esc(c.name)}</b>${x.time ? `<span class="sub">${hl(x.time, q)}</span>` : ''}<span class="grow"></span>${wb(x.worldId)}</div><div class="sub" style="margin-top:4px">${hl(snippet(x.text, q), q)}</div></a>`);
    const es = D.events.filter(e => has(e.title, e.summary, e.timeLabel)).map(e => eventCard(e));
    const rs = D.rels.filter(x => has(x.type, x.desc, (byId(D.chars, x.a) || {}).name, (byId(D.chars, x.b) || {}).name)).map(x => relCard(x));
    for (const c of D.chars) for (const w of Object.keys(c.bio)) if (has(c.bio[w]))
      exps.unshift(`<a class="card" data-act="nav" data-h="/char/${c.id}?t=exp"><div class="row">${avatar(c, 's')}<b>${esc(c.name)}</b><span class="sub">生平</span><span class="grow"></span>${wb(w)}</div><div class="sub" style="margin-top:4px">${hl(snippet(c.bio[w], q), q)}</div></a>`);
    const ws = D.worlds.filter(w => has(w.name, w.summary)).map(w => `<a class="card" data-act="nav" data-h="/world/${w.id}">${wb(w.id)}<div class="sub" style="margin-top:6px">${hl(snippet(w.summary || '', q), q)}</div></a>`);
    const ns = D.notes.filter(n => has(n.text)).sort((a, b) => b.created - a.created).map(n => noteCard(n, { showRef: true, q }));
    const body = sect('角色', cs) + sect('组织', os) + sect('术语', ts) + sect('设定条目', facts) + sect('生平 / 经历', exps) + sect('情节', es) + sect('关系', rs) + sect('世界线', ws) + sect('碎碎念 / 迷思', ns);
    return { title: '搜索', code: 'QRY', back: true, html: h + (body || emptyBox('', '没有找到「' + esc(q) + '」')) };
  },

  settings() {
    const n = { 角色: D.chars.length, 组织: D.orgs.length, 情节: D.events.length, 关系: D.rels.length, 术语: D.terms.length, 图片: D.imgs.length };
    const P = OCTheme.pref, mode = OCTheme.effMode();
    let h = `<div class="stat">${Object.entries(n).map(([k, v]) => `<div><b>${v}</b><span>${k}</span></div>`).join('')}</div>`;
    h += `<div class="sec">外观 · 配色方案</div><div class="tgrid">${OCTheme.ORDER.map(id => {
      const t = OCTheme.THEMES[id], p = t[mode];
      const grid = t.lab ? `background-image:linear-gradient(${OCTheme.rgba(p.accent, .12)} 1px,transparent 1px),linear-gradient(90deg,${OCTheme.rgba(p.accent, .12)} 1px,transparent 1px);background-size:9px 9px;` : '';
      return `<a class="tcard ${P.theme === id ? 'on' : ''}" data-act="setTheme" data-id="${id}"><span class="tprev" style="background-color:${p.bg};${grid}"><i style="background:${p.hdrBg || p.bg};border-color:${p.hdrBg || p.line}"></i>` +
        `<b style="background:${p.card};border-color:${p.line};${t.lab ? `border-left:3px solid ${p.accent};border-radius:2px` : ''}"><u style="background:${p.accent}"></u><s style="background:${p.ink}"></s><s style="background:${p.mute}"></s></b><em style="background:${p.accent}"></em></span>` +
        `<span class="tname">${esc(t.name)}${P.theme === id ? icon('check', 'xs') : ''}</span></a>`;
    }).join('')}</div>`;
    h += `<div class="sec">明暗</div><div class="seg" style="margin-top:0">${[['system', '跟随系统'], ['light', '浅色'], ['dark', '深色']].map(([k, t]) => `<a class="${P.mode === k ? 'on' : ''}" data-act="setMode" data-m="${k}">${t}</a>`).join('')}</div>`;
    h += `<div class="sec">主色微调<span class="grow"></span>${P.accent ? '<a class="lnk" data-act="setAccent" data-c="">恢复方案默认</a>' : '<span class="hint">当前：方案默认</span>'}</div><div class="swatches">${OCTheme.ACCENTS.map(c => `<a class="sw ${P.accent.toUpperCase() === c ? 'on' : ''}" style="background:${c}" data-act="setAccent" data-c="${c}" aria-label="${c}"></a>`).join('')}</div>`;
    h += `<div style="margin-top:14px"><label class="tog"><input type="checkbox" data-pref="linkTerms" ${UI.linkTerms ? 'checked' : ''}>正文里自动标出术语（点一下看释义）</label></div>`;
    h += `<div class="sec">数据</div><div class="box pad"><b>数据保存在哪里？</b><div class="sub" style="margin-top:4px">所有内容只保存在这台手机的应用数据里，不联网、不上传。<br>注意：<b>${IS_APP ? '卸载应用或清除应用数据' : '清理浏览器缓存 / 网站数据'}会删除全部内容</b>，换手机前请先导出备份。</div></div>` + installWarn(false);
    h += `<button class="btn blk p" data-act="export">${icon('down')}导出完整备份（含图片）</button><div style="height:8px"></div><button class="btn blk" data-act="import">${icon('up')}从备份文件恢复</button>`;
    h += `<div class="sec">其他</div>${D.chars.length ? '' : `<button class="btn blk" data-act="sample">载入示例数据</button><div style="height:8px"></div>`}<button class="btn blk d" data-act="wipe">${icon('trash')}清空全部数据</button>`;
    h += `<div class="hint" style="text-align:center;margin-top:24px">OC设定集 v1.3</div>`;
    return { title: '设置', code: 'SYS', back: true, html: h };
  },

  /* ===== 隐藏区域 ===== */
  accc() {
    const order = new Map(D.acCats.map((c, i) => [c.id, i]));
    const ord = a => a.cat && order.has(a.cat) ? order.get(a.cat) : 1e6;
    const all = D.anoms.slice().sort((a, b) => (ord(a) - ord(b)) || ZH.compare(a.code || '~', b.code || '~') || (a.created - b.created));
    const f = UI.ac;
    const stc = new Map(); all.forEach(a => { const s = a.status || '未知'; stc.set(s, (stc.get(s) || 0) + 1); });
    const cc = new Map(); let none = 0; all.forEach(a => { if (a.cat) cc.set(a.cat, (cc.get(a.cat) || 0) + 1); else none++; });
    if (f.st && !stc.has(f.st)) f.st = '';
    if (f.cat && f.cat !== '__none' && !byId(D.acCats, f.cat)) f.cat = '';
    let list = all;
    if (f.cat) list = list.filter(a => f.cat === '__none' ? !a.cat : a.cat === f.cat);
    if (f.st) list = list.filter(a => (a.status || '未知') === f.st);
    if (f.q) { const q = f.q.toLowerCase(); list = list.filter(a => [a.code, a.name, acCatName(a.cat), a.status, a.summary, a.containment].join(' ').toLowerCase().includes(q)); }
    let h = `<div class="ac-head"><div class="ac-stamp">机密</div><div class="ac-k">INTERNAL // RESTRICTED</div><div class="ac-t">异常管理部</div><div class="ac-s">ACCC · 异常名单 · 登记 ${all.length} 项</div></div>`;
    if (all.length) h += `<input class="search" type="search" placeholder="检索编号 / 名称 / 分类 / 描述" data-acq value="${esc(f.q)}">`;
    h += `<div class="flabel">分类<span class="grow"></span><a class="lnk" data-act="acCatMgr">管理分类</a></div><div class="chips"><a class="chip ${!f.cat ? 'on' : ''}" data-act="acCat" data-c="">全部<i>${all.length}</i></a>` +
      D.acCats.map(c => `<a class="chip ${f.cat === c.id ? 'on' : ''}" data-act="acCat" data-c="${c.id}">${esc(c.name)}<i>${cc.get(c.id) || 0}</i></a>`).join('') +
      (none && D.acCats.length ? `<a class="chip ${f.cat === '__none' ? 'on' : ''}" data-act="acCat" data-c="__none">未分类<i>${none}</i></a>` : '') +
      (D.acCats.length ? '' : `<span class="hint" style="align-self:center">还没有分类，点「管理分类」自己建</span>`) + `</div>`;
    if (all.length) h += `<div class="flabel">状态</div><div class="chips"><a class="chip ${!f.st ? 'on' : ''}" data-act="acSt" data-s="">全部<i>${all.length}</i></a>${Array.from(stc).map(([s, n]) => `<a class="chip ${f.st === s ? 'on' : ''}" data-act="acSt" data-s="${esc(s)}"><span class="dot ${stCls(s)}"></span>${esc(s)}<i>${n}</i></a>`).join('')}</div>`;
    h += list.length ? list.map(anomCard).join('') : emptyBox(all.length ? '无匹配档案' : '暂无登记的异常', all.length ? '' : '点右下角「新建档案」登记第一项异常。');
    return { title: '异常管理部', code: 'ACCC', back: true, zone: true, fab: { act: 'newAnom', label: '新建档案' }, html: h };
  },
  anom(r) {
    const a = byId(D.anoms, r.id); if (!a) return { redirect: '/accc' };
    const cs = a.charIds.map(id => byId(D.chars, id)).filter(Boolean);
    let h = `<div class="phead">${avEdit('anom', a, true)}<div class="grow"><div class="ac-code">${esc(a.code || '未编号')}</div><h2>${esc(a.name)}</h2><div class="meta">${a.cat ? `<span class="tag">${esc(acCatName(a.cat))}</span>` : ''}<span class="badge ${stCls(a.status)}"><span class="dot"></span>${esc(a.status || '未知')}</span></div></div><button class="ib" data-act="editAnom" data-id="${a.id}">${icon('edit')}</button></div>`;
    h += `<div class="sec">描述</div>` + (a.summary ? `<div class="box pad"><div class="pre">${lk(a.summary)}</div></div>` : `<div class="hint">未填写</div>`);
    h += `<div class="sec">收容 / 管理措施</div>` + (a.containment ? `<div class="box pad"><div class="pre">${lk(a.containment)}</div></div>` : `<div class="hint">未填写</div>`);
    h += `<div class="sec">档案条目</div>` + (a.fields.length ? `<div class="box">${a.fields.map(f => `<div class="fact" data-act="editAField" data-a="${a.id}" data-f="${f.id}"><div class="k">${esc(f.label || '—')}</div><div class="v">${lk(f.value)}</div></div>`).join('')}</div>` : '') + addLine('添加条目', `data-act="addAField" data-a="${a.id}"`);
    h += `<div class="sec">相关人员</div>` + (cs.length ? `<div class="chips wrap">${cs.map(c => `<a class="chip" data-act="nav" data-h="/char/${c.id}">${avatar(c, 's')}${esc(c.name)}</a>`).join('')}</div>` : '<div class="hint">未关联（在编辑里勾选）</div>');
    h += `<div class="sec">记录日志 · ${a.logs.length}</div><div class="composer"><textarea id="acl" rows="3" placeholder="追加一条记录：实验、事故报告、观察…"></textarea><div class="row"><span class="hint">${fmtStamp(now())}</span><button class="btn p sm" data-act="addALog" data-a="${a.id}">记录</button></div></div>`;
    h += a.logs.slice().sort((x, y) => y.created - x.created).map(l => `<div class="logline" data-act="editALog" data-a="${a.id}" data-id="${l.id}"><div class="ts">${fmtStamp(l.created)}</div><div class="pre">${lk(l.text)}</div></div>`).join('');
    return { title: '异常档案', code: 'ACCC', back: true, zone: true, html: h };
  }
};

function entityDetail(type, r) {
  const isC = type === 'char', o = byId(isC ? D.chars : D.orgs, r.id);
  if (!o) return { redirect: isC ? '/chars' : '/orgs' };
  let t = r.q.t || 'facts';
  if (isC && t === 'events') t = 'exp';
  const evs = (isC ? eventsOfChar(o.id) : eventsOfOrg(o.id)).filter(e => inW(e.worldId));
  const notes = notesOf(type, o.id).filter(n => inW(n.worldId));
  const counts = { facts: o.facts.filter(f => inW(f.worldId)).length, notes: notes.length };
  if (!isC) counts.events = evs.length;
  let tabs;
  if (isC) {
    counts.exp = o.exps.filter(x => inW(x.worldId)).length;
    counts.rels = relsOfChar(o.id).filter(x => inW(x.worldId)).length;
    counts.gallery = imgsOfChar(o.id).filter(i => inW(i.worldId)).length;
    tabs = [['facts', '设定'], ['notes', '迷思'], ['exp', '经历'], ['rels', '关系'], ['gallery', '图库']];
  } else {
    counts.members = membersOf(o.id).length;
    tabs = [['facts', '设定'], ['notes', '迷思'], ['members', '成员'], ['events', '事件']];
  }
  const tags = isC ? o.orgIds.map(id => byId(D.orgs, id)).filter(Boolean).map(g => `<a class="tag" data-act="nav" data-h="/org/${g.id}">${esc(g.name)}</a>`).join('') : '';
  let h = `<div class="phead">${avEdit(type, o, !isC)}<div class="grow"><h2>${esc(o.name)}</h2>${o.alias ? `<div class="sub">${esc(o.alias)}</div>` : ''}${o.tagline ? `<div class="sub pre">${esc(o.tagline)}</div>` : ''}${tags ? `<div class="meta">${tags}</div>` : ''}</div><button class="ib" data-act="${isC ? 'editChar' : 'editOrg'}" data-id="${o.id}">${icon('edit')}</button></div>`;
  h += `<div style="margin-top:12px">${worldChipsBar()}</div>` + segBar(t, tabs, counts).replace('class="seg"', 'class="seg" style="margin-top:2px"');
  if (t === 'facts') h += factsView(type, o);
  else if (t === 'notes') h += `<div class="hint" style="margin:0 2px 8px">还没定下来的想法、脑洞、细节都是「迷思」；定下来后可以一键转为设定。</div>` + notesView(type, o.id, { emptyText: '还没有迷思', ph: '随手记一笔迷思，不需要标题…' });
  else if (t === 'exp' && isC) h += expView(o);
  else if (t === 'rels' && isC) h += (counts.rels ? relsOfChar(o.id).filter(x => inW(x.worldId)).map(x => relCard(x, o.id)).join('') : emptyBox('', '暂无关系')) + addLine('添加关系', `data-act="newRel" data-a="${o.id}"`);
  else if (t === 'events' && !isC) {
    h += eventGroups(evs) + addLine('添加事件', `data-act="newEvent" data-o="${o.id}"`);
    const ox = []; D.chars.forEach(p => p.exps.forEach(x => { if (x.orgIds.includes(o.id) && inW(x.worldId)) ox.push(expRefCard(p, x)); }));
    if (ox.length) h += `<div class="sec">角色经历中提到 · ${ox.length}</div>` + ox.join('');
  }
  else if (t === 'gallery' && isC) h += `<div class="hint" style="margin:0 2px 8px">包括所有标记了「${esc(o.name)}」的图片；点图片可以查看、标记人物和标签</div>` + galleryGrid(imgsOfChar(o.id).filter(i => inW(i.worldId)).sort((a, b) => b.created - a.created), { add: true, c: o.id });
  else if (t === 'members' && !isC) { const ms = membersOf(o.id); h += (ms.length ? ms.map(c => entityCard('char', c)).join('') : emptyBox('', '还没有成员')) + addLine('编辑成员', `data-act="editOrg" data-id="${o.id}"`); }
  return { title: isC ? '角色' : '组织', code: isC ? 'CHR' : 'ORG', back: true, html: h };
}

/* ---------- 渲染主循环 ---------- */
const TABS = [['chars', '角色', 'user'], ['orgs', '组织', 'org'], ['events', '情节', 'tl'], ['rels', '关系', 'rel'], ['worlds', '世界线', 'world'], ['terms', '术语', 'book'], ['gallery', '图库', 'img']];
const SEC2TAB = { char: 'chars', org: 'orgs', event: 'events', rel: 'rels', world: 'worlds', term: 'terms' };
const scrollPos = {}; let curKey = null;
window.addEventListener('scroll', () => { if (curKey != null) scrollPos[curKey] = window.scrollY; }, { passive: true });

function render() {
  if (!D) return;
  const r = route(), key = location.hash || '#/chars';
  if (key !== curKey) UI.sel = null;
  let out;
  try { out = (VIEWS[r.sec] || VIEWS.chars)(r); }
  catch (e) { console.error(e); out = { title: '出错了', back: true, html: emptyBox('页面渲染出错', esc(e.message)) }; }
  if (out.redirect) { replaceTo(out.redirect); return; }
  const root = document.documentElement, zone = !!out.zone;
  if ((root.getAttribute('data-zone') === 'accc') !== zone) {
    if (zone) root.setAttribute('data-zone', 'accc'); else root.removeAttribute('data-zone');
    OCTheme.apply();
  }
  $('#hdr').innerHTML = (out.back ? `<button class="ib" data-act="back" aria-label="返回">${icon('back')}</button>` : '<span style="width:8px"></span>') +
    `<h1>${esc(out.title)}${out.code ? `<small class="code">${out.code}</small>` : ''}</h1>` +
    (zone ? `<button class="ib" data-act="tab" data-h="/chars" aria-label="离开">${icon('exit')}</button>`
      : `<button class="ib" data-act="go" data-h="/search" aria-label="搜索">${icon('search')}</button><button class="ib" data-act="go" data-h="/settings" aria-label="设置">${icon('more')}</button>`);
  const cur = SEC2TAB[r.sec] || r.sec;
  $('#tabs').innerHTML = TABS.map(([k, t, ic]) => `<a class="${cur === k ? 'on' : ''}" data-act="tab" data-h="/${k}">${icon(ic)}<span>${t}</span></a>`).join('');
  $('#view').innerHTML = out.html;
  $('#fabwrap').innerHTML = (out.fab ? `<button class="fab" data-act="${out.fab.act}">${icon('plus')}${esc(out.fab.label)}</button>` : '') + (out.bar || '');
  hydrate($('#view')); hydrate($('#fabwrap'));
  if (key !== curKey) { curKey = key; const y = scrollPos[key] || 0; requestAnimationFrame(() => window.scrollTo(0, y)); }
  if (out.after) out.after();
  if (refocus) { const el = $(refocus); refocus = null; if (el) { el.focus(); const n = el.value.length; try { el.setSelectionRange(n, n); } catch (e) { } } }
}

/* ---------- 头像 / Logo ---------- */
function pickFromGallery(charId) {
  return new Promise(res => {
    let imgs = charId ? imgsOfChar(charId) : [];
    const all = !imgs.length; if (all) imgs = D.imgs.slice();
    if (!imgs.length) { toast('图库里还没有图片'); res(null); return; }
    imgs.sort((a, b) => b.created - a.created);
    const m = openSheet({
      title: '从图库选择', maskClose: true,
      body: (all && charId ? '<div class="hint" style="margin-bottom:8px">还没有标记这个角色的图片，下面是全部图片</div>' : '') +
        `<div class="grid">${imgs.map(i => `<div class="ph" data-pick="${i.id}"><img data-img="${i.id}_t" alt=""></div>`).join('')}</div>`
    });
    m._onClose = () => res(null);
    m.addEventListener('click', e => { const p = e.target.closest('[data-pick]'); if (p) { m._onClose = null; closeSheet(m); res(p.getAttribute('data-pick')); } });
  });
}
function avatarSheet(type, o) {
  const fit = type === 'char' ? 'cover' : 'contain';
  const m = openSheet({
    title: type === 'char' ? '头像' : '头像 / Logo', maskClose: true,
    body: `<div class="list-opt" data-o="pick">${icon('camera')}<span>从手机相册选择图片</span></div>` +
      (type === 'char' && D.imgs.length ? `<div class="list-opt" data-o="gal">${icon('img')}<span>从图库中选择</span></div>` : '') +
      (hasAv(o) ? `<div class="list-opt" data-o="rm" style="color:var(--danger)">${icon('trash')}<span>移除${type === 'char' ? '头像' : '头像 / Logo'}</span></div>` : '') +
      `<div class="hint" style="margin-top:8px">${type === 'char' ? '图片会自动裁成正方形头像。' : 'Logo 会完整放进正方形里，不会被裁掉。'}</div>`
  });
  m.addEventListener('click', async e => {
    const b = e.target.closest('[data-o]'); if (!b) return;
    closeSheet(m);
    const k = b.getAttribute('data-o');
    if (k === 'pick') {
      const fs = await pickFiles(false); if (!fs.length) return;
      try { toast('正在处理…'); await setAvatar(o, await storeAvatar(fs[0], fit)); } catch (err) { toast(err.message); }
    } else if (k === 'gal') { const id = await pickFromGallery(o.id); if (id) await setAvatar(o, id); }
    else if (k === 'rm') await setAvatar(o, null);
  });
}
/* 编辑表单里的头像块：选择后先存起来，点保存才生效，取消则丢弃 */
function avBlock(type, cur) {
  const st = { pending: undefined, fresh: [] };
  const sq = type !== 'char', fit = sq ? 'contain' : 'cover';
  const html = `<div class="fl"><span>${type === 'char' ? '头像' : '头像 / Logo'}</span><div class="avpick"><span class="avprev">${avatar(cur, 'l', sq)}</span><div class="avbtns">` +
    `<button type="button" class="btn sm" data-av="pick">${icon('camera')}选择图片</button>` +
    (type === 'char' ? `<button type="button" class="btn sm" data-av="gal">${icon('img')}从图库选</button>` : '') +
    `<button type="button" class="btn sm d" data-av="rm">移除</button></div></div></div>`;
  function mount(m) {
    const prev = m.querySelector('.avprev');
    const show = async id => {
      if (!id) { prev.innerHTML = avatar({ name: val(m, 'name') || cur.name || '?', id: 'x' }, 'l', sq); return; }
      prev.innerHTML = `<img class="av l ${sq ? 'sq' : ''}" alt="">`;
      prev.firstChild.src = (await imgURL(id + '_t')) || (await imgURL(id));
    };
    m.addEventListener('click', async e => {
      const b = e.target.closest('[data-av]'); if (!b) return;
      e.preventDefault();
      const k = b.getAttribute('data-av');
      if (k === 'pick') {
        const fs = await pickFiles(false); if (!fs.length) return;
        try { const id = await storeAvatar(fs[0], fit); st.fresh.push(id); st.pending = id; show(id); } catch (err) { toast(err.message); }
      } else if (k === 'gal') { const id = await pickFromGallery(cur.id); if (id) { st.pending = id; show(id); } }
      else { st.pending = null; show(null); }
    });
  }
  async function finish(obj, saved) {
    if (saved && st.pending !== undefined) {
      const old = obj.avatar; obj.avatar = st.pending;
      if (old && old !== st.pending && isOwnAv(old)) await deleteImageBlob(old);
    }
    for (const id of st.fresh) if (!saved || id !== st.pending) await deleteImageBlob(id);
  }
  return { html, mount, finish };
}

/* ---------- 编辑表单 ---------- */
const FACT_LABELS = {
  char: ['全名', '性别', '年龄', '生日', '身高', '外貌', '性格', '能力', '身份', '喜好', '厌恶', '口癖', '代表色', '声线', '备注'],
  org: ['性质', '据点', '首领', '成立', '宗旨', '规模', '成员构成', '历史', '对外关系', '备注']
};
function charForm(c) {
  const isNew = !c, cur = c || { name: '', alias: '', tagline: '', orgIds: [] };
  const av = avBlock('char', cur);
  formSheet({
    title: isNew ? '新角色' : '编辑角色',
    body: av.html + fText('name', '名字 *', cur.name, '角色名') + fText('alias', '别名 / 外号 / 英文名', cur.alias) +
      fArea('tagline', '一句话简介', cur.tagline, '例如：沉默寡言的剑士，第二部登场') +
      fPick('orgIds', '所属组织', orgItems(), cur.orgIds, '（还没有组织，可以之后在组织页添加成员）'),
    onMount(m) { av.mount(m); m._onClose = () => av.finish(null, false); },
    async onSave(m) {
      const name = val(m, 'name'); if (!name) { toast('请填写名字'); return false; }
      const o = isNew ? { id: uid('c'), facts: [], exps: [], bio: {}, avatar: null, created: now() } : c;
      Object.assign(o, { name, alias: val(m, 'alias'), tagline: val(m, 'tagline'), orgIds: vals(m, 'orgIds'), updated: now() });
      if (isNew) D.chars.push(o);
      m._onClose = null; await av.finish(o, true);
      save(); if (isNew) go('/char/' + o.id); else render();
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask(`删除角色「${c.name}」？\n其设定、迷思、经历和关系会一起删除；事件和图库图片会保留，只移除该角色的标记。`, '删除', true))) return false;
      const id = c.id;
      D.chars = D.chars.filter(x => x.id !== id);
      D.events.forEach(e => { e.charIds = e.charIds.filter(x => x !== id); });
      D.terms.forEach(t => { t.charIds = t.charIds.filter(x => x !== id); });
      D.anoms.forEach(a => { a.charIds = a.charIds.filter(x => x !== id); });
      D.imgs.forEach(i => { i.charIds = i.charIds.filter(x => x !== id); });
      D.chars.forEach(p => p.exps.forEach(x => { x.charIds = x.charIds.filter(y => y !== id); }));
      const relIds = new Set(D.rels.filter(r => r.a === id || r.b === id).map(r => r.id));
      D.rels = D.rels.filter(r => !relIds.has(r.id));
      D.notes = D.notes.filter(n => !((n.refType === 'char' && n.refId === id) || (n.refType === 'rel' && relIds.has(n.refId))));
      if (isOwnAv(c.avatar)) await deleteImageBlob(c.avatar);
      UI.gal.c = UI.gal.c.filter(x => x !== id); saveGal();
      save(); back(); toast('已删除');
    }
  });
}
function orgForm(g) {
  const isNew = !g, cur = g || { name: '', alias: '', tagline: '' };
  const members = g ? membersOf(g.id).map(c => c.id) : [];
  const av = avBlock('org', cur);
  formSheet({
    title: isNew ? '新组织' : '编辑组织',
    body: av.html + fText('name', '名称 *', cur.name) + fText('alias', '别称', cur.alias) + fArea('tagline', '一句话简介', cur.tagline) +
      fPick('members', '成员', charItems(), members, '（还没有角色）'),
    onMount(m) { av.mount(m); m._onClose = () => av.finish(null, false); },
    async onSave(m) {
      const name = val(m, 'name'); if (!name) { toast('请填写名称'); return false; }
      const o = isNew ? { id: uid('g'), facts: [], avatar: null, created: now() } : g;
      Object.assign(o, { name, alias: val(m, 'alias'), tagline: val(m, 'tagline'), updated: now() });
      if (isNew) D.orgs.push(o);
      const sel = new Set(vals(m, 'members'));
      D.chars.forEach(c => { const has = c.orgIds.includes(o.id); if (sel.has(c.id) && !has) c.orgIds.push(o.id); if (!sel.has(c.id) && has) c.orgIds = c.orgIds.filter(x => x !== o.id); });
      m._onClose = null; await av.finish(o, true);
      save(); if (isNew) go('/org/' + o.id); else render();
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask(`删除组织「${g.name}」？\n其设定和迷思会一起删除，成员角色本身不受影响。`, '删除', true))) return false;
      D.orgs = D.orgs.filter(x => x.id !== g.id);
      D.chars.forEach(c => { c.orgIds = c.orgIds.filter(x => x !== g.id); });
      D.events.forEach(e => { e.orgIds = e.orgIds.filter(x => x !== g.id); });
      D.terms.forEach(t => { t.orgIds = t.orgIds.filter(x => x !== g.id); });
      D.chars.forEach(p => p.exps.forEach(x => { x.orgIds = x.orgIds.filter(y => y !== g.id); }));
      D.notes = D.notes.filter(n => !(n.refType === 'org' && n.refId === g.id));
      if (isOwnAv(g.avatar)) await deleteImageBlob(g.avatar);
      save(); back(); toast('已删除');
    }
  });
}
function factForm(type, ownerId, fid, preset = {}) {
  const o = byId(type === 'char' ? D.chars : D.orgs, ownerId); if (!o) return;
  const f = fid ? o.facts.find(x => x.id === fid) : null, isNew = !f;
  const used = Array.from(new Set(D.chars.concat(D.orgs).flatMap(x => x.facts.map(y => y.label)).concat(FACT_LABELS[type]))).filter(Boolean);
  formSheet({
    title: isNew ? '添加设定' : '编辑设定',
    body: fList('label', '项目', f ? f.label : (preset.label || ''), used, '如：性格 / 能力 / 身份') +
      fArea('value', '内容 *', f ? f.value : (preset.value || ''), '', 'tall') + fWorld(f ? f.worldId : (preset.worldId || defW())) +
      `<div class="hint">分支线（IF/AU/PARO）只需记录与主线不同的部分；查看分支线时会附带主线设定对照。</div>`,
    onSave(m) {
      const value = rawVal(m, 'value'); if (!value.trim()) { toast('请填写内容'); return false; }
      const obj = f || { id: uid('f') };
      Object.assign(obj, { label: val(m, 'label'), value, worldId: val(m, 'worldId') });
      if (isNew) o.facts.push(obj);
      o.updated = now();
      if (preset.onSaved) preset.onSaved();
      commit(); if (isNew) toast('已添加');
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask('删除这条设定？', '删除', true))) return false;
      o.facts = o.facts.filter(x => x.id !== f.id); commit();
    }
  });
}
function noteForm(n) {
  const fixed = ['event', 'rel', 'world'].includes(n.refType);
  const canPromote = n.refType === 'char' || n.refType === 'org';
  const m = formSheet({
    title: n.refType === 'char' || n.refType === 'org' ? '编辑迷思' : '编辑片段',
    body: fArea('text', '内容', n.text, '', 'tall') + (fixed ? `<div class="fl"><span>世界线</span>${wb(n.worldId)}</div>` : fWorld(n.worldId)) +
      `<div class="hint">记录于 ${fmtDate(n.created)}</div>` +
      (canPromote ? `<div style="margin-top:14px"><button class="btn sm" data-promote>${icon('star')}转为设定</button></div>` : ''),
    onSave(m) {
      const text = rawVal(m, 'text'); if (!text.trim()) { toast('内容不能为空'); return false; }
      n.text = text; if (!fixed) n.worldId = val(m, 'worldId'); commit();
    },
    onDelete: async () => {
      if (!(await ask('删除这一条？', '删除', true))) return false;
      D.notes = D.notes.filter(x => x.id !== n.id); commit();
    }
  });
  const p = m.querySelector('[data-promote]');
  if (p) p.onclick = () => {
    const text = rawVal(m, 'text').trim(), wid = val(m, 'worldId') || n.worldId;
    closeSheet(m);
    factForm(n.refType, n.refId, null, { value: text, worldId: wid, onSaved: () => { D.notes = D.notes.filter(x => x.id !== n.id); toast('已转为设定'); } });
  };
}
function eventForm(e, preset = {}) {
  const isNew = !e;
  const cur = e || { title: '', worldId: preset.w || defW(), timeLabel: '', summary: '', charIds: preset.c ? [preset.c] : [], orgIds: preset.o ? [preset.o] : [], key: false };
  formSheet({
    title: isNew ? '新事件 / 情节节点' : '编辑事件',
    body: fText('title', '标题 *', cur.title, '如：雨夜初遇') + fWorld(cur.worldId) +
      fText('timeLabel', '时间标签（可选）', cur.timeLabel, '如：第三年·春 / 序章 / 大战前夜') +
      `<label class="fl"><span>在时间线上的位置</span><select name="pos"></select></label>` +
      fArea('summary', '经过 / 概要', cur.summary, '发生了什么、为什么重要…', 'tall') +
      `<label class="tog" style="margin:-4px 0 14px"><input type="checkbox" name="key" ${cur.key ? 'checked' : ''}>标记为关键节点</label>` +
      fPick('charIds', '出场人物', charItems(), cur.charIds, '（还没有角色）') +
      fPick('orgIds', '相关组织', orgItems(), cur.orgIds, '（还没有组织）'),
    onMount(m) {
      const ws = m.querySelector('[name=worldId]'), ps = m.querySelector('[name=pos]');
      const fill = () => { ps.innerHTML = posFor(D.events, ws.value, e, x => x.title).html; };
      ws.addEventListener('change', fill); fill();
    },
    onSave(m) {
      const title = val(m, 'title'); if (!title) { toast('请填写标题'); return false; }
      const wid = val(m, 'worldId'), pos = m.querySelector('[name=pos]').value;
      const others = posFor(D.events, wid, e, x => x.title).others;
      const o = e || { id: uid('e'), created: now() };
      const oldW = o.worldId;
      Object.assign(o, { title, worldId: wid, timeLabel: val(m, 'timeLabel'), summary: rawVal(m, 'summary'), key: m.querySelector('[name=key]').checked, charIds: vals(m, 'charIds'), orgIds: vals(m, 'orgIds') });
      o.order = orderAt(others, pos);
      if (isNew) D.events.push(o);
      if (oldW && oldW !== wid) { D.notes.forEach(n => { if (n.refType === 'event' && n.refId === o.id) n.worldId = wid; }); renum(D.events.filter(x => x.worldId === oldW)); }
      renum(D.events.filter(x => x.worldId === wid));
      save(); if (isNew) go('/event/' + o.id); else render();
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask(`删除事件「${e.title}」？`, '删除', true))) return false;
      D.events = D.events.filter(x => x.id !== e.id);
      D.rels.forEach(r => { r.eventIds = r.eventIds.filter(x => x !== e.id); });
      D.chars.forEach(c => c.exps.forEach(x => { if (x.eventId === e.id) x.eventId = ''; }));
      D.notes = D.notes.filter(n => !(n.refType === 'event' && n.refId === e.id));
      save(); back(); toast('已删除');
    }
  });
}
function expForm(c, x) {
  const isNew = !x;
  const cur = x || { time: '', text: '', worldId: defW(), eventId: '', charIds: [], orgIds: [] };
  formSheet({
    title: isNew ? `添加时间点 · ${c.name}` : `编辑时间点 · ${c.name}`,
    body: fText('time', '时间 / 年龄（可选）', cur.time, '如：7岁 / 入学那年 / 第二部开始前') +
      fArea('text', '经历内容 *', cur.text, '发生了什么、对 TA 有什么影响…', 'tall') + fWorld(cur.worldId) +
      `<label class="fl"><span>在经历中的位置</span><select name="pos"></select></label>` +
      `<label class="fl"><span>关联情节节点（世界事件线，可选）</span><select name="eventId"></select></label>` +
      fPick('charIds', '相关人物（可选）', D.chars.filter(p => p.id !== c.id).map(p => ({ id: p.id, html: avatar(p, 's') + esc(p.name) })), cur.charIds, '（还没有其他角色）') +
      fPick('orgIds', '相关组织（可选）', orgItems(), cur.orgIds, '（还没有组织）'),
    onMount(m) {
      const ws = m.querySelector('[name=worldId]'), ps = m.querySelector('[name=pos]'), es = m.querySelector('[name=eventId]');
      let first = true;
      const fill = () => {
        ps.innerHTML = posFor(c.exps, ws.value, x, y => y.time || y.text).html;
        const evs = sortEvents(D.events.filter(e => e.worldId === ws.value));
        const mine = evs.filter(e => e.charIds.includes(c.id)), rest = evs.filter(e => !e.charIds.includes(c.id));
        const keep = first ? cur.eventId : es.value; first = false;
        const opt = e => `<option value="${e.id}" ${keep === e.id ? 'selected' : ''}>${esc(trunc(e.title, 18))}${e.timeLabel ? '（' + esc(trunc(e.timeLabel, 8)) + '）' : ''}</option>`;
        es.innerHTML = `<option value="">不关联</option>` + (mine.length ? `<optgroup label="${esc(c.name)} 出场的">${mine.map(opt).join('')}</optgroup>` : '') + (rest.length ? `<optgroup label="其他">${rest.map(opt).join('')}</optgroup>` : '');
      };
      ws.addEventListener('change', fill); fill();
    },
    onSave(m) {
      const text = rawVal(m, 'text'); if (!text.trim()) { toast('请填写经历内容'); return false; }
      const wid = val(m, 'worldId'), pos = m.querySelector('[name=pos]').value;
      const others = posFor(c.exps, wid, x, y => y.time).others;
      const o = x || { id: uid('x'), created: now() };
      const oldW = o.worldId;
      Object.assign(o, { time: val(m, 'time'), text, worldId: wid, eventId: m.querySelector('[name=eventId]').value, charIds: vals(m, 'charIds'), orgIds: vals(m, 'orgIds') });
      o.order = orderAt(others, pos);
      if (isNew) c.exps.push(o);
      if (oldW && oldW !== wid) renum(c.exps.filter(y => y.worldId === oldW));
      renum(c.exps.filter(y => y.worldId === wid));
      c.updated = now();
      commit(); if (isNew) toast('已添加');
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask('删除这个时间点？', '删除', true))) return false;
      c.exps = c.exps.filter(y => y.id !== x.id); commit();
    }
  });
}
function relForm(x, preset = {}) {
  if (D.chars.length < 2) { toast('至少需要两个角色才能建立关系'); return; }
  const isNew = !x;
  const cur = x || { a: preset.a || '', b: '', type: '', desc: '', worldId: defW(), dir: 'both', eventIds: [] };
  const co = sel => `<option value="">选择角色</option>` + D.chars.map(c => `<option value="${c.id}" ${c.id === sel ? 'selected' : ''}>${esc(c.name)}</option>`).join('');
  formSheet({
    title: isNew ? '新关系' : '编辑关系',
    body: `<div class="row" style="gap:10px;align-items:flex-start"><label class="fl grow"><span>角色 A *</span><select name="a">${co(cur.a)}</select></label><label class="fl grow"><span>角色 B *</span><select name="b">${co(cur.b)}</select></label></div>` +
      `<label class="fl"><span>方向</span><select name="dir"><option value="both" ${cur.dir !== 'ab' ? 'selected' : ''}>双向　A ⇄ B</option><option value="ab" ${cur.dir === 'ab' ? 'selected' : ''}>单向　A → B（如单箭头、单方面认识）</option></select></label>` +
      fText('type', '关系类型 *', cur.type, '如：搭档 / 宿敌 / 师徒 / 青梅竹马') + fWorld(cur.worldId) +
      fArea('desc', '关系说明', cur.desc, '两人怎么认识、相处模式、关键转折…') +
      `<div class="fl"><span>关联事件（勾选这段关系相关的情节）</span><div class="pick"><div class="chips wrap" id="relEv"></div></div><div class="hint" style="margin-top:4px">两人都出场的事件会自动显示，不必全勾。</div></div>`,
    onMount(m) {
      const ws = m.querySelector('[name=worldId]'), box = m.querySelector('#relEv');
      let first = true;
      const fill = () => {
        const checked = new Set(first ? cur.eventIds : vals(m, 'eventIds')); first = false;
        const a = val(m, 'a'), b = val(m, 'b');
        const evs = sortEvents(D.events.filter(e => e.worldId === ws.value));
        evs.sort((p, q) => ((q.charIds.includes(a) || q.charIds.includes(b)) - (p.charIds.includes(a) || p.charIds.includes(b))));
        box.innerHTML = evs.length ? pickChips('eventIds', evs.map(e => ({ id: e.id, html: esc(trunc(e.title, 14)) + (e.charIds.includes(a) && e.charIds.includes(b) ? ' ·共同出场' : '') })), Array.from(checked)) : '<span class="hint">这条线还没有事件</span>';
      };
      ws.addEventListener('change', fill); m.querySelector('[name=a]').addEventListener('change', fill); m.querySelector('[name=b]').addEventListener('change', fill); fill();
    },
    onSave(m) {
      const a = val(m, 'a'), b = val(m, 'b'), type = val(m, 'type');
      if (!a || !b) { toast('请选择两个角色'); return false; }
      if (a === b) { toast('两个角色不能相同'); return false; }
      if (!type) { toast('请填写关系类型'); return false; }
      const o = x || { id: uid('r'), created: now() };
      const wid = val(m, 'worldId');
      Object.assign(o, { a, b, type, dir: val(m, 'dir'), worldId: wid, desc: rawVal(m, 'desc'), eventIds: vals(m, 'eventIds') });
      D.notes.forEach(n => { if (n.refType === 'rel' && n.refId === o.id) n.worldId = wid; });
      if (isNew) D.rels.push(o);
      save(); if (isNew) go('/rel/' + o.id); else render();
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask('删除这条关系？', '删除', true))) return false;
      D.rels = D.rels.filter(y => y.id !== x.id); D.notes = D.notes.filter(n => !(n.refType === 'rel' && n.refId === x.id));
      save(); back(); toast('已删除');
    }
  });
}
function worldForm(w) {
  const isNew = !w, isMain = w && w.id === MAIN;
  const cur = w || { name: '', kind: 'if', summary: '' };
  formSheet({
    title: isNew ? '新世界线' : (isMain ? '编辑主线' : '编辑世界线'),
    body: fText('name', '名称 *', cur.name, '如：如果他没有离开 / 现代校园AU') +
      (isMain ? '' : `<label class="fl"><span>类型</span><select name="kind">${['if', 'au', 'paro', 'other'].map(k => `<option value="${k}" ${cur.kind === k ? 'selected' : ''}>${KIND[k].t}</option>`).join('')}</select></label>`) +
      fArea('summary', '总体情节', cur.summary, isMain ? '主线的整体故事走向…' : '这条线的大致走向、与主线的分歧点、结局…', 'tall'),
    onSave(m) {
      const name = val(m, 'name'); if (!name) { toast('请填写名称'); return false; }
      const o = w || { id: uid('w'), created: now() };
      Object.assign(o, { name, kind: isMain ? 'main' : val(m, 'kind'), summary: rawVal(m, 'summary') });
      if (isNew) D.worlds.push(o);
      save(); if (isNew) go('/world/' + o.id); else render();
    },
    onDelete: (isNew || isMain) ? null : async () => {
      if (!(await ask(`删除世界线「${w.name}」？\n这条线下的事件、关系、生平和经历、碎碎念、迷思和设定会一并删除；图片和术语会移到主线。`, '删除', true))) return false;
      const id = w.id;
      const evIds = new Set(D.events.filter(e => e.worldId === id).map(e => e.id));
      D.worlds = D.worlds.filter(x => x.id !== id);
      D.events = D.events.filter(e => e.worldId !== id);
      D.rels = D.rels.filter(r => r.worldId !== id);
      D.rels.forEach(r => { r.eventIds = r.eventIds.filter(x => !evIds.has(x)); });
      D.notes = D.notes.filter(n => n.worldId !== id);
      D.chars.concat(D.orgs).forEach(o => { o.facts = o.facts.filter(f => f.worldId !== id); });
      D.chars.forEach(c => { c.exps = c.exps.filter(x => x.worldId !== id); c.exps.forEach(x => { if (evIds.has(x.eventId)) x.eventId = ''; }); delete c.bio[id]; });
      D.imgs.forEach(i => { if (i.worldId === id) i.worldId = MAIN; });
      D.terms.forEach(t => { if (t.worldId === id) t.worldId = MAIN; });
      if (UI.world === id) { UI.world = 'all'; lsSet('ui.world', 'all'); }
      save(); back(); toast('已删除');
    }
  });
}
function termForm(t) {
  const isNew = !t;
  const cur = t || { term: '', alias: '', cat: '', def: '', worldId: defW(), charIds: [], orgIds: [] };
  const cats = Array.from(new Set(D.terms.map(x => x.cat).filter(Boolean).concat(TERM_CATS)));
  formSheet({
    title: isNew ? '新术语' : '编辑术语',
    body: fText('term', '术语 *', cur.term, '如：夜巡令') + fText('alias', '别名 / 原文 / 读音（可选）', cur.alias, '多个用 / 分隔，也会被自动标出') +
      fList('cat', '分类', cur.cat, cats, '如：地名 / 物品 / 能力') + fArea('def', '释义', cur.def, '', 'tall') + fWorld(cur.worldId, '适用的世界线') +
      fPick('charIds', '相关角色（可选）', charItems(), cur.charIds, '（还没有角色）') + fPick('orgIds', '相关组织（可选）', orgItems(), cur.orgIds, '（还没有组织）'),
    onSave(m) {
      const term = val(m, 'term'); if (!term) { toast('请填写术语'); return false; }
      if (D.terms.find(x => x.term === term && (!t || x.id !== t.id))) { toast('已经有同名术语了'); return false; }
      const o = t || { id: uid('t'), created: now() };
      Object.assign(o, { term, alias: val(m, 'alias'), cat: val(m, 'cat'), def: rawVal(m, 'def'), worldId: val(m, 'worldId'), charIds: vals(m, 'charIds'), orgIds: vals(m, 'orgIds') });
      if (isNew) D.terms.push(o);
      save(); if (isNew) go('/term/' + o.id); else render();
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask(`删除术语「${t.term}」？`, '删除', true))) return false;
      D.terms = D.terms.filter(x => x.id !== t.id); save(); back(); toast('已删除');
    }
  });
}
function termPop(id) {
  const t = byId(D.terms, id); if (!t) return;
  const m = openSheet({
    title: t.term, maskClose: true,
    body: `<div class="meta" style="margin:0 0 10px">${t.cat ? `<span class="tag">${esc(t.cat)}</span>` : ''}${wb(t.worldId)}${t.alias ? `<span class="sub">${esc(t.alias)}</span>` : ''}</div>` +
      (t.def ? `<div class="pre">${lk(t.def, t.id)}</div>` : '<div class="hint">还没写释义</div>'),
    foot: `<button class="btn" data-close>关闭</button><button class="btn p" data-open>打开词条</button>`
  });
  m.querySelector('[data-open]').onclick = () => { closeSheet(m); go('/term/' + t.id); };
}
function anomForm(a) {
  const isNew = !a;
  const cur = a || { code: nextCode(), name: '', cat: UI.ac.cat && UI.ac.cat !== '__none' ? UI.ac.cat : '', status: '收容中', summary: '', containment: '', charIds: [] };
  const av = avBlock('anom', cur);
  formSheet({
    title: isNew ? '新建异常档案' : '编辑档案',
    body: av.html + fText('code', '编号', cur.code, 'ACCC-001') + fText('name', '名称 *', cur.name) +
      `<div class="row" style="gap:10px;align-items:flex-start"><label class="fl grow"><span>分类</span><select name="cat"><option value="">未分类</option>${D.acCats.map(c => `<option value="${c.id}" ${cur.cat === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}<option value="__new">＋ 新建分类…</option></select></label><div class="grow">${fList('status', '状态', cur.status, AC_STATUS)}</div></div>` +
      `<label class="fl" data-newcat style="display:none"><span>新分类名称</span><input type="text" name="newcat" placeholder="自己起名，如：甲类 / 生物型 / Keter" autocomplete="off"></label>` +
      fArea('summary', '描述', cur.summary, '异常的表现、来源、特性…', 'tall') + fArea('containment', '收容 / 管理措施', cur.containment) +
      fPick('charIds', '相关人员', charItems(), cur.charIds, '（还没有角色）'),
    onMount(m) {
      av.mount(m); m._onClose = () => av.finish(null, false);
      const cs = m.querySelector('[name=cat]'), nc = m.querySelector('[data-newcat]');
      cs.addEventListener('change', () => { nc.style.display = cs.value === '__new' ? '' : 'none'; if (cs.value === '__new') nc.querySelector('input').focus(); });
    },
    async onSave(m) {
      const name = val(m, 'name'); if (!name) { toast('请填写名称'); return false; }
      let cat = val(m, 'cat');
      if (cat === '__new') {
        const nm = val(m, 'newcat'); if (!nm) { toast('请填写新分类名称'); return false; }
        let c = D.acCats.find(x => x.name === nm); if (!c) { c = { id: uid('ac'), name: nm }; D.acCats.push(c); }
        cat = c.id;
      }
      const o = a || { id: uid('a'), fields: [], logs: [], avatar: null, created: now() };
      Object.assign(o, { code: val(m, 'code'), name, cat, status: val(m, 'status'), summary: rawVal(m, 'summary'), containment: rawVal(m, 'containment'), charIds: vals(m, 'charIds'), updated: now() });
      if (isNew) D.anoms.push(o);
      m._onClose = null; await av.finish(o, true);
      save(); if (isNew) go('/anom/' + o.id); else render();
    },
    onDelete: isNew ? null : async () => {
      if (!(await ask(`销毁档案「${a.code} ${a.name}」？此操作无法撤销。`, '销毁', true))) return false;
      if (isOwnAv(a.avatar)) await deleteImageBlob(a.avatar);
      D.anoms = D.anoms.filter(x => x.id !== a.id); save(); back(); toast('档案已销毁');
    }
  });
}
function acCatManager() {
  const m = openSheet({
    title: '管理分类', maskClose: true,
    body: `<div class="hint" style="margin-bottom:6px">分类完全由你自己定义；这里的顺序就是名单的排列顺序。</div>` +
      (D.acCats.length ? D.acCats.map((c, i) => `<div class="list-opt"><span class="grow" data-cedit="${c.id}">${esc(c.name)}<span class="hint">　${D.anoms.filter(a => a.cat === c.id).length} 项</span></span>` +
        (i ? `<button class="ib" data-cup="${c.id}" aria-label="上移">${icon('arrowup')}</button>` : '') + `<button class="ib" data-cedit="${c.id}" aria-label="编辑">${icon('edit')}</button></div>`).join('') : '<div class="empty">还没有分类</div>'),
    foot: `<button class="btn p" data-cnew>${icon('plus')}新建分类</button>`
  });
  m.addEventListener('click', e => {
    const up = e.target.closest('[data-cup]'), ed = e.target.closest('[data-cedit]'), nw = e.target.closest('[data-cnew]');
    if (up) {
      const i = D.acCats.findIndex(c => c.id === up.getAttribute('data-cup'));
      if (i > 0) { const [c] = D.acCats.splice(i, 1); D.acCats.splice(i - 1, 0, c); save(); render(); closeSheet(m); acCatManager(); }
    } else if (ed || nw) { closeSheet(m); acCatForm(ed ? byId(D.acCats, ed.getAttribute('data-cedit')) : null); }
  });
}
function acCatForm(c) {
  formSheet({
    title: c ? '编辑分类' : '新建分类',
    body: fText('name', '分类名称 *', c ? c.name : '', '如：甲类 / 生物型 / Keter'),
    onSave(m) {
      const nm = val(m, 'name'); if (!nm) { toast('请填写名称'); return false; }
      if (D.acCats.find(x => x.name === nm && x !== c)) { toast('已经有同名分类了'); return false; }
      if (c) c.name = nm; else D.acCats.push({ id: uid('ac'), name: nm });
      commit();
    },
    onDelete: c ? async () => {
      const n = D.anoms.filter(a => a.cat === c.id).length;
      if (!(await ask(`删除分类「${c.name}」？${n ? `\n其中 ${n} 项档案会变为未分类。` : ''}`, '删除', true))) return false;
      D.acCats = D.acCats.filter(x => x !== c); D.anoms.forEach(a => { if (a.cat === c.id) a.cat = ''; });
      if (UI.ac.cat === c.id) UI.ac.cat = '';
      commit();
    } : null
  });
}
function aFieldForm(a, fid) {
  const f = fid ? a.fields.find(x => x.id === fid) : null, isNew = !f;
  const used = Array.from(new Set(D.anoms.flatMap(x => x.fields.map(y => y.label)).concat(['发现时间', '发现地点', '形态', '危险性', '负责人', '代号', '备注']))).filter(Boolean);
  formSheet({
    title: isNew ? '添加档案条目' : '编辑条目',
    body: fList('label', '项目', f ? f.label : '', used, '如：发现地点') + fArea('value', '内容 *', f ? f.value : '', '', 'tall'),
    onSave(m) {
      const value = rawVal(m, 'value'); if (!value.trim()) { toast('请填写内容'); return false; }
      const o = f || { id: uid('af') };
      Object.assign(o, { label: val(m, 'label'), value });
      if (isNew) a.fields.push(o);
      commit();
    },
    onDelete: isNew ? null : async () => { if (!(await ask('删除这个条目？', '删除', true))) return false; a.fields = a.fields.filter(x => x.id !== f.id); commit(); }
  });
}
function aLogForm(a, l) {
  formSheet({
    title: '编辑记录',
    body: fArea('text', '内容', l.text, '', 'tall') + `<div class="hint">记录于 ${fmtStamp(l.created)}</div>`,
    onSave(m) { const text = rawVal(m, 'text'); if (!text.trim()) { toast('内容不能为空'); return false; } l.text = text; commit(); },
    onDelete: async () => { if (!(await ask('删除这条记录？', '删除', true))) return false; a.logs = a.logs.filter(x => x.id !== l.id); commit(); }
  });
}

/* ---------- 图库：标记 ---------- */
function tagSheet(ids, { mode }) {
  const imgs = ids.map(id => byId(D.imgs, id)).filter(Boolean); if (!imgs.length) return;
  const isNew = mode === 'new';
  formSheet({
    title: isNew ? `标记新图片（${imgs.length} 张）` : `给 ${imgs.length} 张图片追加标记`,
    okText: isNew ? '完成' : '追加',
    body: `<div class="hint" style="margin:-2px 0 12px">${isNew ? '勾选图中出现的人物（可多选）并打上标签，之后可以按人物 / 标签筛选。以后点开图片也能再改。' : '勾选的人物和标签会追加到每张图片上，原有的标记会保留。'}</div>` +
      fPick('charIds', '图中人物', charItems(), isNew ? imgs[0].charIds : [], '（还没有角色，可以只打标签）') + tagField(isNew ? imgs[0].tags : []),
    onSave(m) {
      const cs = vals(m, 'charIds'), ts = readTags(m);
      for (const im of imgs) {
        if (isNew) { im.charIds = cs.slice(); im.tags = ts.slice(); }
        else { cs.forEach(c => { if (!im.charIds.includes(c)) im.charIds.push(c); }); ts.forEach(t => { if (!im.tags.includes(t)) im.tags.push(t); }); }
      }
      autoAvatar(imgs.map(i => i.id));
      if (!isNew) UI.sel = null;
      commit(); if (!isNew) toast('已追加标记');
    }
  });
}
function imgEditSheet(im, after) {
  formSheet({
    title: '图片信息',
    body: fPick('charIds', '图中人物', charItems(), im.charIds, '（还没有角色）') + tagField(im.tags) +
      fArea('caption', '说明', im.caption, '如：第二部制服 / 某某老师约稿') + fWorld(im.worldId),
    onSave(m) {
      im.charIds = vals(m, 'charIds'); im.tags = readTags(m);
      im.caption = m.querySelector('[name=caption]').value.trim(); im.worldId = val(m, 'worldId');
      commit(); if (after) after();
    }
  });
}
function renameTag(t, nn) {
  D.imgs.forEach(i => {
    if (!i.tags.includes(t)) return;
    i.tags = i.tags.filter(x => x !== t);
    if (nn && !i.tags.includes(nn)) i.tags.push(nn);
  });
  const had = UI.gal.t.includes(t);
  UI.gal.t = UI.gal.t.filter(x => x !== t);
  if (had && nn && !UI.gal.t.includes(nn)) UI.gal.t.push(nn);
  saveGal();
}
function tagManager() {
  const counts = tagCounts(); if (!counts.length) { toast('还没有标签'); return; }
  const m = openSheet({
    title: '管理标签', maskClose: true,
    body: `<div class="hint" style="margin-bottom:6px">点标签可以改名、合并或删除，会同步到所有图片</div>` +
      counts.map(([t, n]) => `<div class="list-opt" data-tag="${esc(t)}"><span class="grow">#${esc(t)}</span><span class="hint">${n} 张</span>${icon('right', 'xs')}</div>`).join('')
  });
  m.addEventListener('click', e => {
    const o = e.target.closest('[data-tag]'); if (!o) return;
    const t = o.getAttribute('data-tag'); closeSheet(m);
    formSheet({
      title: '标签 #' + t,
      body: fText('name', '标签名', t) + `<div class="hint">改成已有的标签名会把两个标签合并。</div>`,
      onSave(mm) {
        const nn = val(mm, 'name').replace(/^#+/, '').trim(); if (!nn) { toast('标签名不能为空'); return false; }
        if (nn !== t) { renameTag(t, nn); commit(); toast('已更新'); }
      },
      onDelete: async () => {
        if (!(await ask(`从所有图片上移除标签「${t}」？图片本身不会删除。`, '移除', true))) return false;
        renameTag(t, null); commit(); toast('已移除');
      }
    });
  });
}

/* 看图 */
function viewImg(id) {
  const ids = GAL_LIST.includes(id) ? GAL_LIST.slice() : [id];
  const list = ids.map(x => byId(D.imgs, x)).filter(Boolean);
  let idx = Math.max(0, list.findIndex(i => i.id === id));
  const v = document.createElement('div'); v.className = 'viewer';
  const draw = async () => {
    const im = list[idx]; if (!im) { closeSheet(v); return; }
    const ppl = im.charIds.map(c => byId(D.chars, c)).filter(Boolean);
    v.innerHTML = `<div class="img"><img alt=""></div><div class="top"><button class="ib" data-v="close">${icon('x')}</button><div class="cap"><div>${idx + 1} / ${list.length}${im.worldId !== MAIN ? ' · ' + esc(wLabel(W(im.worldId))) : ''}</div>${im.caption ? `<div class="pre" style="color:#fff;margin-top:2px">${esc(im.caption)}</div>` : ''}</div></div>` +
      `<div class="vinfo">${ppl.map(c => `<a class="vchip" data-v="char" data-id="${c.id}">${avatar(c, 's')}${esc(c.name)}</a>`).join('')}${im.tags.map(t => `<a class="vchip t" data-v="tag" data-t="${esc(t)}">#${esc(t)}</a>`).join('')}` +
      `${!ppl.length && !im.tags.length ? `<a class="vchip t" data-v="edit">${icon('tag', 'xs')} 标记人物 / 标签</a>` : ''}</div>` +
      `<div class="bar"><button class="ib" data-v="prev" ${idx ? '' : 'disabled style="opacity:.3"'}>${icon('left')}</button><button class="ib" data-v="next" ${idx < list.length - 1 ? '' : 'disabled style="opacity:.3"'}>${icon('right')}</button><span class="grow"></span>` +
      `<button class="btn sm" data-v="avatar">设为头像</button><button class="ib" data-v="edit">${icon('edit')}</button><button class="ib" data-v="del">${icon('trash')}</button></div>`;
    hydrate(v.querySelector('.vinfo'));
    const u = await imgURL(im.id); if (u) v.querySelector('.img img').src = u;
  };
  v.addEventListener('click', async e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    const im = list[idx], act = b.getAttribute('data-v');
    if (act === 'close') closeSheet(v);
    else if (act === 'prev' && idx > 0) { idx--; draw(); }
    else if (act === 'next' && idx < list.length - 1) { idx++; draw(); }
    else if (act === 'char') { closeSheet(v); go('/char/' + b.getAttribute('data-id')); }
    else if (act === 'tag') { closeSheet(v); UI.gal = { c: [], t: [b.getAttribute('data-t')], raw: false }; saveGal(); tab('/gallery'); }
    else if (act === 'avatar') {
      const ppl = im.charIds.map(c => byId(D.chars, c)).filter(Boolean);
      if (!ppl.length) { toast('先点 ✎ 标记图中人物'); return; }
      const cid = ppl.length === 1 ? ppl[0].id : await chooseFrom('设为谁的头像？', ppl.map(c => ({ id: c.id, html: avatar(c, 'm') + `<span>${esc(c.name)}</span>` })));
      const c = cid && byId(D.chars, cid); if (c) await setAvatar(c, im.id);
    } else if (act === 'edit') imgEditSheet(im, draw);
    else if (act === 'del') {
      if (!(await ask('删除这张图片？', '删除', true))) return;
      await removeImage(im.id);
      list.splice(idx, 1); GAL_LIST = GAL_LIST.filter(x => x !== im.id);
      commit();
      if (!list.length) closeSheet(v); else { idx = Math.min(idx, list.length - 1); draw(); }
    }
  });
  let sx = null;
  v.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, { passive: true });
  v.addEventListener('touchend', e => {
    if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 60) { if (dx < 0 && idx < list.length - 1) { idx++; draw(); } else if (dx > 0 && idx > 0) { idx--; draw(); } }
  });
  pushLayer(v); draw();
}

/* ---------- 备份 ---------- */
function blobToDataURL(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(b); }); }
function dataURLToBlob(u) {
  const i = u.indexOf(','), mime = (u.slice(5, i).split(';')[0]) || 'application/octet-stream', bin = atob(u.slice(i + 1));
  const a = new Uint8Array(bin.length); for (let k = 0; k < bin.length; k++) a[k] = bin.charCodeAt(k);
  return new Blob([a], { type: mime });
}
async function exportAll() {
  toast('正在打包备份…');
  await saveQ;
  const ids = new Set(D.imgs.map(i => i.id));
  for (const o of D.chars.concat(D.orgs, D.anoms)) if (isOwnAv(o.avatar)) ids.add(o.avatar);
  const images = [];
  for (const id of ids) {
    const f = await IDB.get('img', id).catch(() => null), t = await IDB.get('img', id + '_t').catch(() => null);
    images.push({ id, full: f ? await blobToDataURL(f) : null, thumb: t ? await blobToDataURL(t) : null });
  }
  const text = JSON.stringify({ app: 'oc-archive', version: 3, exported: now(), data: D, images });
  const d = new Date();
  let name = `OC设定集备份_${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}_${p2(d.getHours())}${p2(d.getMinutes())}.json`;
  if (window.OCBridge && OCBridge.saveBegin) {
    OCBridge.saveBegin(name);
    const CH = 512 * 1024; for (let i = 0; i < text.length; i += CH) OCBridge.saveChunk(text.slice(i, i + CH));
    OCBridge.saveEnd();
  } else {
    name = `OC-Archive-backup_${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}_${p2(d.getHours())}${p2(d.getMinutes())}.json`;  // 部分浏览器不认中文文件名
    const blob = new Blob([text], { type: 'application/json' });
    const file = typeof File === 'function' ? new File([blob], name, { type: 'application/json' }) : null;
    const canShare = !!(file && navigator.canShare && navigator.share && navigator.canShare({ files: [file] }));
    const url = URL.createObjectURL(blob);
    const size = blob.size >= 1048576 ? (blob.size / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(blob.size / 1024)) + ' KB';
    const m = openSheet({
      title: '备份已准备好', maskClose: true,
      body: `<p class="sub" style="margin:0 0 12px">${esc(name)} · ${size}</p>` +
        (canShare ? `<button class="btn blk p" data-share>${icon('down')}存储到「文件」/ 分享</button><div class="hint" style="margin:6px 2px 12px">在弹出的菜单里选「存储到"文件"」，或发送到网盘、电脑。</div>` : '') +
        `<a class="btn blk ${canShare ? '' : 'p'}" href="${url}" download="${esc(name)}" data-dl>${icon('down')}下载备份文件</a>`
    });
    m._onClose = () => setTimeout(() => URL.revokeObjectURL(url), 60000);
    const sh = m.querySelector('[data-share]');
    if (sh) sh.onclick = () => { navigator.share({ files: [file], title: name }).then(() => toast('备份已保存')).catch(e => { if (e && e.name !== 'AbortError') toast('分享失败，请用「下载备份文件」'); }); };
    m.querySelector('[data-dl]').addEventListener('click', () => setTimeout(() => toast('已开始下载'), 300));
  }
}
window.__onSaved = ok => toast(ok ? '备份已保存' : '已取消保存');
function readFileText(f) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsText(f); }); }
function importPick() {
  const inp = $('#fileJson'); inp.value = '';
  inp.onchange = async () => {
    const f = inp.files && inp.files[0]; if (!f) return;
    let obj;
    try { obj = JSON.parse(await readFileText(f)); } catch (e) { toast('读取失败：不是有效的备份文件'); return; }
    if (!obj || obj.app !== 'oc-archive' || !obj.data) { toast('这不是 OC设定集 的备份文件'); return; }
    const d = obj.data;
    const msg = `备份时间：${fmtDate(obj.exported || 0)}\n包含 ${(d.chars || []).length} 个角色、${(d.events || []).length} 个事件、${(d.imgs || []).length} 张图库图片。\n\n导入会覆盖手机上现有的全部数据，确定继续？`;
    if (!(await ask(msg, '覆盖导入', true))) return;
    try {
      toast('正在导入…');
      await saveQ; await IDB.clear('img');
      urlCache.forEach(u => URL.revokeObjectURL(u)); urlCache.clear();
      for (const im of obj.images || []) {
        if (im.full) await IDB.put('img', im.id, dataURLToBlob(im.full));
        if (im.thumb) await IDB.put('img', im.id + '_t', dataURLToBlob(im.thumb));
      }
      D = normalize(d); SAVE_BLOCKED = false;
      await IDB.put('kv', 'db', JSON.stringify(D));
      UI.world = 'all'; lsSet('ui.world', 'all'); UI.gal = { c: [], t: [], raw: false }; saveGal();
      replaceTo('/chars'); render(); toast('导入完成');
    } catch (e) { toast('导入失败：' + e.message); }
  };
  inp.click();
}

/* ---------- 示例数据 ---------- */
function loadSample() {
  const t = now();
  const wIf = { id: uid('w'), name: '如果那天没有分别', kind: 'if', summary: '分歧点：第二章雨夜，沈遥没有离开。\n两人一起留在青岚城，守夜人的内乱提前爆发，走向完全不同的结局。', created: t + 1 };
  const wAu = { id: uid('w'), name: '现代校园', kind: 'au', summary: '现代高中设定，剑术社社长林烬 × 转学生沈遥。', created: t + 2 };
  D.worlds.push(wIf, wAu);
  const main = byId(D.worlds, MAIN);
  if (!main.summary) main.summary = '（示例）少年剑士林烬在青岚城遇见来历不明的沈遥，两人卷入守夜人内部的权力斗争……';
  const g = { id: uid('g'), name: '守夜人', alias: '青岚夜巡司', tagline: '（示例）守护青岚城夜晚的半官方组织', avatar: null, facts: [{ id: uid('f'), label: '据点', value: '青岚城北的钟楼', worldId: MAIN }], created: t };
  D.orgs.push(g);
  const a = { id: uid('c'), name: '林烬', alias: 'Lin', tagline: '（示例）沉默寡言的少年剑士', orgIds: [g.id], avatar: null, created: t, exps: [], facts: [
    { id: uid('f'), label: '年龄', value: '17', worldId: MAIN }, { id: uid('f'), label: '性格', value: '话少、认死理，对自己人极其护短', worldId: MAIN },
    { id: uid('f'), label: '能力', value: '快剑；左手受过伤。随身带着夜巡令', worldId: MAIN }, { id: uid('f'), label: '身份', value: '剑术社社长，高二', worldId: wAu.id }] };
  const b = { id: uid('c'), name: '沈遥', alias: '', tagline: '（示例）来历不明的旅人，笑眯眯但什么都不说', orgIds: [], avatar: null, created: t + 1, exps: [], facts: [
    { id: uid('f'), label: '性格', value: '表面轻浮，实际很会观察人', worldId: MAIN }, { id: uid('f'), label: '结局', value: '留在青岚城，加入守夜人', worldId: wIf.id }] };
  const c = { id: uid('c'), name: '阿岚', alias: '', tagline: '（示例）守夜人的副首领', orgIds: [g.id], avatar: null, created: t + 2, exps: [], facts: [] };
  D.chars.push(a, b, c);
  const e1 = { id: uid('e'), title: '雨夜初遇', worldId: MAIN, timeLabel: '第一章', order: 10, key: true, summary: '林烬在巡夜时救下被追杀的沈遥。', charIds: [a.id, b.id], orgIds: [], created: t };
  const e2 = { id: uid('e'), title: '钟楼密谈', worldId: MAIN, timeLabel: '第一章末', order: 20, key: false, summary: '阿岚察觉沈遥身份可疑，私下警告林烬。', charIds: [a.id, c.id], orgIds: [g.id], created: t + 1 };
  const e3 = { id: uid('e'), title: '不告而别', worldId: MAIN, timeLabel: '第二章', order: 30, key: true, summary: '沈遥在雨夜留下一封信离开青岚城。', charIds: [a.id, b.id], orgIds: [], created: t + 2 };
  const e4 = { id: uid('e'), title: '他留了下来', worldId: wIf.id, timeLabel: '第二章（IF）', order: 10, key: true, summary: '沈遥犹豫之后没有离开，第二天和林烬一起去了钟楼。', charIds: [a.id, b.id, c.id], orgIds: [g.id], created: t + 3 };
  D.events.push(e1, e2, e3, e4);
  a.exps.push(
    { id: uid('x'), worldId: MAIN, time: '7岁', text: '在青岚城北的钟楼下被阿岚捡到，从此跟着守夜人长大。', eventId: '', order: 10, created: t },
    { id: uid('x'), worldId: MAIN, time: '15岁', text: '第一次独自巡夜，左手受伤，领到了自己的夜巡令。', eventId: '', order: 20, created: t + 1 },
    { id: uid('x'), worldId: MAIN, time: '17岁', text: '雨夜救下沈遥。', eventId: e1.id, charIds: [b.id], orgIds: [], order: 30, created: t + 2 });
  a.exps.forEach(x => { x.charIds = x.charIds || []; x.orgIds = x.orgIds || []; });
  a.exps[0].charIds = [c.id]; a.exps[0].orgIds = [g.id];
  a.bio = { [MAIN]: '（示例）生于青岚城南的贫民巷，七岁那年在钟楼下被阿岚捡回守夜人。\n少年时跟着守夜人巡夜、习剑，十五岁独自巡夜时左手受伤，从此惯用右手快剑。\n十七岁的雨夜救下沈遥，人生从这里开始偏离原本的轨道。' };
  b.bio = {}; c.bio = {};
  D.rels.push(
    { id: uid('r'), a: a.id, b: b.id, type: '搭档', dir: 'both', worldId: MAIN, desc: '从互相提防到托付后背。', eventIds: [e1.id, e3.id], created: t },
    { id: uid('r'), a: c.id, b: a.id, type: '上司 / 半个兄长', dir: 'ab', worldId: MAIN, desc: '阿岚一直把林烬当弟弟照顾。', eventIds: [e2.id], created: t + 1 },
    { id: uid('r'), a: a.id, b: b.id, type: '同居室友', dir: 'both', worldId: wIf.id, desc: 'IF线里沈遥借住在林烬家。', eventIds: [e4.id], created: t + 2 });
  D.notes.push(
    { id: uid('n'), text: '林烬其实怕打雷，但绝对不会承认', refType: 'char', refId: a.id, worldId: MAIN, created: t },
    { id: uid('n'), text: '沈遥的信里到底写了什么？想写成只有一句话', refType: 'char', refId: b.id, worldId: MAIN, created: t + 1 },
    { id: uid('n'), text: 'IF线的结局应该比主线温柔一点', refType: 'world', refId: wIf.id, worldId: wIf.id, created: t + 2 },
    { id: uid('n'), text: '校园AU里沈遥是学生会的，两人天天吵架', refType: 'world', refId: wAu.id, worldId: wAu.id, created: t + 3 });
  D.terms.push(
    { id: uid('t'), term: '青岚城', alias: 'Qinglan', cat: '地名', def: '（示例）故事的主要舞台，一座终年多雨的边境城市。守夜人的据点在城北钟楼。', worldId: MAIN, charIds: [], orgIds: [g.id], created: t },
    { id: uid('t'), term: '夜巡令', alias: '', cat: '物品', def: '（示例）守夜人成员随身携带的铜制令牌，可在宵禁后通行青岚城。', worldId: MAIN, charIds: [a.id], orgIds: [g.id], created: t + 1 });
  commit(); toast('已载入示例，可随时删除');
}

/* ---------- 事件委托 ---------- */
const ACT = {
  back: () => back(),
  go: d => go(d.h),
  nav: d => go(d.h),
  tab: d => tab(d.h),
  setw: d => setWorld(d.w),
  sub: d => setQ('t', d.t),
  newChar: () => charForm(null),
  editChar: d => charForm(byId(D.chars, d.id)),
  newOrg: () => orgForm(null),
  editOrg: d => orgForm(byId(D.orgs, d.id)),
  avSheet: d => { const o = byId(entArr(d.type) || [], d.id); if (o) avatarSheet(d.type, o); },
  addFact: d => factForm(d.type, d.id, null),
  editFact: d => factForm(d.type, d.id, d.f),
  addExp: d => { const c = byId(D.chars, d.c); if (c) expForm(c, null); },
  editBio: d => { const c = byId(D.chars, d.c); if (c) bioForm(c, d.w || defW()); },
  editExp: d => { const c = byId(D.chars, d.c); const x = c && byId(c.exps, d.id); if (x) expForm(c, x); },
  addNote: d => {
    const ta = $('#nc'), text = ta ? ta.value.replace(/\s+$/, '') : '';
    if (!text.trim()) { toast('先写点什么'); return; }
    const ws = $('#ncw'); const worldId = d.w || (ws ? ws.value : MAIN);
    D.notes.push({ id: uid('n'), text, worldId, refType: d.rt, refId: d.ri, created: now() });
    commit(); toast('已记下');
  },
  editNote: d => { const n = byId(D.notes, d.id); if (n) noteForm(n); },
  newEvent: d => eventForm(null, { c: d.c, o: d.o, w: d.w }),
  editEvent: d => eventForm(byId(D.events, d.id)),
  clearEvf: () => { UI.ev = { c: '', o: '', key: false, q: '' }; lsSet('ui.ev', UI.ev); render(); },
  newRel: d => relForm(null, { a: d.a }),
  editRel: d => relForm(byId(D.rels, d.id)),
  relFocus: d => { UI.relC = UI.relC === d.id ? '' : d.id; render(); },
  newWorld: () => worldForm(null),
  editWorld: d => worldForm(byId(D.worlds, d.id)),
  newTerm: () => termForm(null),
  editTerm: d => termForm(byId(D.terms, d.id)),
  termPop: d => termPop(d.id),
  termCat: d => { UI.termCat = d.c; render(); },
  upload: d => {
    const onGal = route().sec === 'gallery' && !UI.gal.raw;
    uploadImages({ charIds: d.c ? [d.c] : (onGal ? UI.gal.c.slice() : []), tags: onGal && !d.c ? UI.gal.t.slice() : [], worldId: defW() });
  },
  viewImg: d => viewImg(d.id),
  galC: d => { const g = UI.gal; g.raw = false; g.c = g.c.includes(d.id) ? g.c.filter(x => x !== d.id) : g.c.concat(d.id); saveGal(); render(); },
  galT: d => { const g = UI.gal; g.raw = false; g.t = g.t.includes(d.t) ? g.t.filter(x => x !== d.t) : g.t.concat(d.t); saveGal(); render(); },
  galRaw: () => { UI.gal = { c: [], t: [], raw: !UI.gal.raw }; saveGal(); render(); },
  galClear: () => { UI.gal = { c: [], t: [], raw: false }; saveGal(); render(); },
  tagMgr: () => tagManager(),
  selStart: () => { UI.sel = new Set(); render(); },
  selImg: d => { if (!UI.sel) return; if (UI.sel.has(d.id)) UI.sel.delete(d.id); else UI.sel.add(d.id); render(); },
  selAll: () => { if (!UI.sel) return; const all = GAL_LIST.length && GAL_LIST.every(id => UI.sel.has(id)); if (all) UI.sel.clear(); else GAL_LIST.forEach(id => UI.sel.add(id)); render(); },
  selTag: () => { if (UI.sel && UI.sel.size) tagSheet(Array.from(UI.sel), { mode: 'add' }); },
  selDel: async () => {
    if (!UI.sel || !UI.sel.size) return;
    if (!(await ask(`删除选中的 ${UI.sel.size} 张图片？`, '删除', true))) return;
    for (const id of Array.from(UI.sel)) await removeImage(id);
    UI.sel = new Set(); commit(); toast('已删除');
  },
  selEnd: () => { UI.sel = null; render(); },
  setTheme: d => { OCTheme.set('theme', d.id); render(); },
  setMode: d => { OCTheme.set('mode', d.m); render(); },
  setAccent: d => { OCTheme.set('accent', d.c); render(); },
  newAnom: () => anomForm(null),
  editAnom: d => anomForm(byId(D.anoms, d.id)),
  acSt: d => { UI.ac.st = d.s; render(); },
  acCat: d => { UI.ac.cat = d.c; render(); },
  acCatMgr: () => acCatManager(),
  addAField: d => { const a = byId(D.anoms, d.a); if (a) aFieldForm(a, null); },
  editAField: d => { const a = byId(D.anoms, d.a); if (a) aFieldForm(a, d.f); },
  addALog: d => {
    const a = byId(D.anoms, d.a), ta = $('#acl'), text = ta ? ta.value.replace(/\s+$/, '') : '';
    if (!a) return; if (!text.trim()) { toast('先写点什么'); return; }
    a.logs.push({ id: uid('l'), text, created: now() }); commit(); toast('已记录');
  },
  editALog: d => { const a = byId(D.anoms, d.a); const l = a && byId(a.logs, d.id); if (l) aLogForm(a, l); },
  hideInstall: () => { lsSet('ui.hideInstall', true); render(); },
  sample: () => loadSample(),
  export: () => exportAll().catch(e => toast('导出失败：' + e.message)),
  import: () => importPick(),
  wipe: async () => {
    if (!(await ask('清空全部数据？此操作无法撤销。\n建议先导出备份。', '继续', true))) return;
    if (!(await ask('再确认一次：真的要删除所有角色、设定、情节和图片吗？', '全部删除', true))) return;
    await IDB.clear('img'); urlCache.clear(); D = blank(); SAVE_BLOCKED = false; UI.world = 'all'; lsSet('ui.world', 'all');
    UI.gal = { c: [], t: [], raw: false }; saveGal();
    save(); replaceTo('/chars'); toast('已清空');
  }
};
document.addEventListener('click', e => {
  const a = e.target.closest('[data-act]'); if (!a) return;
  if (a.tagName === 'INPUT') return;
  const fn = ACT[a.getAttribute('data-act')];
  if (fn) { e.preventDefault(); const d = {}; for (const at of a.attributes) if (at.name.startsWith('data-')) d[at.name.slice(5)] = at.value; fn(d, a, e); }
});
function onInput(t) {
  if (t.matches('[data-filter]')) {
    const q = t.value.trim().toLowerCase();
    $$('#flist .card').forEach(c => { c.style.display = !q || (c.dataset.s || '').includes(q) ? '' : 'none'; });
    $$('#flist .grp').forEach(g => { g.style.display = $$('.card', g).some(c => c.style.display !== 'none') ? '' : 'none'; });
  } else if (t.matches('[data-evf="q"]')) {
    clearTimeout(onInput.t); onInput.t = setTimeout(() => { UI.ev.q = t.value.trim(); lsSet('ui.ev', UI.ev); refocus = '[data-evf="q"]'; render(); }, 400);
  } else if (t.matches('[data-acq]')) {
    clearTimeout(onInput.t); onInput.t = setTimeout(() => { UI.ac.q = t.value.trim(); refocus = '[data-acq]'; render(); }, 350);
  } else if (t.id === 'sq') {
    clearTimeout(onInput.t);
    if (isPass(t.value)) { t.value = ''; t.blur(); acccSplash(); replaceTo('/accc'); return; }
    onInput.t = setTimeout(() => { refocus = '#sq'; setQ('q', t.value.trim()); }, 350);
  }
}
document.addEventListener('input', e => { if (e.isComposing) return; onInput(e.target); });
document.addEventListener('compositionend', e => onInput(e.target));
document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('.chip input[type=checkbox]')) t.closest('.chip').classList.toggle('on', t.checked);
  else if (t.matches('select[data-evf]')) { UI.ev[t.dataset.evf] = t.value; lsSet('ui.ev', UI.ev); render(); }
  else if (t.matches('input[data-evf="key"]')) { UI.ev.key = t.checked; lsSet('ui.ev', UI.ev); render(); }
  else if (t.id === 'relc') { UI.relC = t.value; render(); }
  else if (t.matches('input[data-pref]')) { const k = t.dataset.pref; UI[k] = t.checked; lsSet('ui.' + k, t.checked); render(); }
});

/* ---------- 启动 ---------- */
function syncBars() {
  if (!(window.OCBridge && OCBridge.setBars)) return;
  const cs = getComputedStyle(document.documentElement);
  const hb = cs.getPropertyValue('--hdr-bg').trim(), cd = cs.getPropertyValue('--card').trim();
  try { OCBridge.setBars(hb, cd, OCTheme.isDark(hb), OCTheme.isDark(cd)); } catch (e) { }
}
async function init() {
  try {
    await IDB.open();
    const s = await IDB.get('kv', 'db');
    const parsed = s ? JSON.parse(s) : null;
    const oldVer = parsed && parsed.version;
    D = normalize(parsed);
    if (parsed && oldVer !== 3) save();   // 旧版数据升级后立即写回
  } catch (e) {
    D = blank(); SAVE_BLOCKED = !!IDB.db;
    setTimeout(() => toast('无法读取本地数据：' + (e && e.message || e)), 300);
  }
  if (UI.world !== 'all' && !byId(D.worlds, UI.world)) UI.world = 'all';
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
  OCTheme.onApply(syncBars);
  render(); syncBars();
  if (!IS_APP && 'serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => { });
}
init();

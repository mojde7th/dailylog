/* ============================================================================
   DailyLog — offline-first logger with wheel pickers and per-activity metrics
   Storage : IndexedDB (device local)
   Sync    : optional POST to a Google Apps Script Web App
   No framework. No build step. Works from a plain folder.
   ============================================================================ */

'use strict';

/* ═══════════════ 1. ACTIVITY TABLE ═══════════════
   metric decides which inputs appear:
     dur    = duration wheel (hours + minutes)  -> minutes
     clock  = time of day wheel                 -> startClock
     count  = how many times                    -> count
     sec    = seconds                           -> reactSec
     reps   = N times x M minutes               -> reps, perRep, minutes
   eff  : also ask for effort units (your 30/50 scale)
   qual : also ask 1..5 quality
   Edit this list freely — the whole UI rebuilds from it.                    */

const CODES = [
  { cat:'کار و آی‌تی',    code:'itpr',        label:'ITpr',            metric:'dur',   eff:true, qual:true },
  { cat:'کار و آی‌تی',    code:'azkesh',      label:'azkesh',          metric:'dur',   eff:true },
  { cat:'کار و آی‌تی',    code:'do',          label:'Do',              metric:'dur' },
  { cat:'کار و آی‌تی',    code:'sumtakhmoj',  label:'sumtakhmojmotn',  metric:'dur' },

  { cat:'تخصیص و تمرکز', code:'takhkho',     label:'Takhkho',         metric:'dur',   eff:true },
  { cat:'تخصیص و تمرکز', code:'takhshose',   label:'Takhshose',       metric:'dur',   eff:true },
  { cat:'تخصیص و تمرکز', code:'arasmotakh',  label:'arasmotakhshose', metric:'dur' },
  { cat:'تخصیص و تمرکز', code:'arasmor',     label:'arasmor',         metric:'dur' },
  { cat:'تخصیص و تمرکز', code:'rout',        label:'rout',            metric:'dur' },
  { cat:'تخصیص و تمرکز', code:'mintakhir',   label:'تأخیر واکنش',      metric:'sec' },
  { cat:'تخصیص و تمرکز', code:'checkin',     label:'چک‌این',           metric:'count' },

  { cat:'بدن و سلامت',   code:'openfast',    label:'openfast (ساعت)',  metric:'clock' },
  { cat:'بدن و سلامت',   code:'ab',          label:'ab',              metric:'dur' },
  { cat:'بدن و سلامت',   code:'dand',        label:'dand (تکرار)',     metric:'reps' },
  { cat:'بدن و سلامت',   code:'drazmayesh',  label:'dr / azmayesh',   metric:'dur' },
  { cat:'بدن و سلامت',   code:'salad',       label:'salad',           metric:'dur' },
  { cat:'بدن و سلامت',   code:'ghorsqat',    label:'ghors / qat',     metric:'count' },
  { cat:'بدن و سلامت',   code:'shosmort',    label:'ShosMort',        metric:'dur' },

  { cat:'خانه و شخصی',   code:'otu',         label:'Otu',             metric:'dur' },
  { cat:'خانه و شخصی',   code:'moshv',       label:'Moshv',           metric:'dur' },
  { cat:'خانه و شخصی',   code:'ket',         label:'Ket',             metric:'dur' },
  { cat:'خانه و شخصی',   code:'sabtturkela', label:'Sabtturkela',     metric:'dur' },

  { cat:'مالی و اداری',  code:'bargozbime',  label:'bime / mali / kharid', metric:'dur' },
  { cat:'مالی و اداری',  code:'banki',       label:'banki / sarmayegozari', metric:'dur' },

  { cat:'یادگیری',       code:'reswch',      label:'reswch',          metric:'dur',   eff:true, qual:true }
];

const META_BOOLS = [
  ['planTomorrow',  'برنامه فردا ایجاد شده'],
  ['ruleFollowed',  'قانون فرای من رعایت شد'],
  ['noSugar',       'هیچ قند و کرب و شیرین‌کننده نخوردم'],
  ['sachetProtein', 'ساشه پروتئین'],
];

const SESSION_FIELDS = ['uid','createdAt','dateShamsi','category','code','metric',
                        'minutes','hm','effort','quality','reactSec','count',
                        'reps','perRep','startClock','note'];

const META_FIELDS = ['uid','createdAt','dateShamsi','bid','nap','checkin1h',
                     'moodToFlowMin','moodToFlowHM','bigharariMin','bigharariHM',
                     'bandShadidMin','bandShadidHM','openfastMin','openfastHM',
                     ...META_BOOLS.map(b => b[0]), 'note'];

/* ═══════════════ 2. JALALI CALENDAR ═══════════════ */

const J_MONTHS = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
                  'مهر','آبان','آذر','دی','بهمن','اسفند'];

function jIsLeap(jy) {
  const a = jy - (jy > 0 ? 474 : 473);
  const b = ((a % 2820) + 2820) % 2820 + 474;
  return (((b + 38) * 682) % 2816) < 682;
}

function jMonthLen(jy, jm) {
  if (jm <= 6) return 31;
  if (jm <= 11) return 30;
  return jIsLeap(jy) ? 30 : 29;
}

function toJalali(gy, gm, gd) {
  const gdm = [0,31,59,90,120,151,181,212,243,273,304,334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  const gy2 = (gm > 2) ? gy + 1 : gy;
  let days = 365*gy + Math.floor((gy2+3)/4) - Math.floor((gy2+99)/100)
           + Math.floor((gy2+399)/400) - 80 + gd + gdm[gm-1];
  jy += 33 * Math.floor(days/12053);
  days %= 12053;
  jy += 4 * Math.floor(days/1461);
  days %= 1461;
  if (days > 365) { jy += Math.floor((days-1)/365); days = (days-1) % 365; }
  const jm = (days < 186) ? 1 + Math.floor(days/31) : 7 + Math.floor((days-186)/30);
  const jd = 1 + ((days < 186) ? days % 31 : (days-186) % 30);
  return [jy, jm, jd];
}

function todayJ() {
  const d = new Date();
  return toJalali(d.getFullYear(), d.getMonth()+1, d.getDate());
}

const pad2 = n => String(n).padStart(2, '0');
const fmtJ = (y, m, d) => y + '/' + pad2(m) + '/' + pad2(d);
const fmtHM = min => {
  const n = Number(min) || 0;
  return Math.floor(n / 60) + ':' + pad2(n % 60);
};

/* ═══════════════ 3. WHEEL PICKER ═══════════════ */

const ITEM_H = 40;

/** Builds one scrollable column. Returns { get, set, el }. */
function wheelColumn(items, initial, onChange) {
  const col = document.createElement('div');
  col.className = 'wcol';

  const sc = document.createElement('div');
  sc.className = 'sc';
  sc.innerHTML = items.map(t => `<div class="it">${t}</div>`).join('');

  const band = document.createElement('div');
  band.className = 'band';

  col.appendChild(sc);
  col.appendChild(band);

  const nodes = () => sc.querySelectorAll('.it');
  let idx = Math.max(0, Math.min(items.length - 1, initial | 0));

  function paint(i) {
    nodes().forEach((n, k) => n.classList.toggle('sel', k === i));
  }

  function set(i, animate) {
    idx = Math.max(0, Math.min(items.length - 1, i | 0));
    sc.scrollTo({ top: idx * ITEM_H, behavior: animate ? 'smooth' : 'auto' });
    paint(idx);
  }

  let t = null;
  sc.addEventListener('scroll', () => {
    const live = Math.round(sc.scrollTop / ITEM_H);
    if (live !== idx && live >= 0 && live < items.length) { idx = live; paint(idx); }
    clearTimeout(t);
    t = setTimeout(() => {
      sc.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
      if (onChange) onChange(idx);
    }, 110);
  }, { passive: true });

  /* first layout happens after the node is in the DOM */
  requestAnimationFrame(() => set(idx, false));

  return { el: col, get: () => idx, set, count: items.length };
}

function wheelGroup(host, cols, captions) {
  host.innerHTML = '';
  const row = document.createElement('div');
  row.className = 'wheels';
  cols.forEach(c => row.appendChild(c.el));
  host.appendChild(row);
  if (captions) {
    const cap = document.createElement('div');
    cap.className = 'wcap';
    cap.innerHTML = captions.map(c => `<span>${c}</span>`).join('');
    host.appendChild(cap);
  }
}

/* --- Shamsi date wheel: year / month / day --- */
function makeDateWheel(host) {
  const [cy, cm, cd] = todayJ();
  const years = [];
  for (let y = cy - 2; y <= cy + 1; y++) years.push(String(y));

  let wy, wm, wd;

  function dayItems(y, m) {
    const n = jMonthLen(y, m);
    const a = [];
    for (let i = 1; i <= n; i++) a.push(pad2(i));
    return a;
  }

  function rebuildDays() {
    const y = Number(years[wy.get()]);
    const m = wm.get() + 1;
    const keep = wd ? wd.get() : cd - 1;
    const items = dayItems(y, m);
    const nd = wheelColumn(items, Math.min(keep, items.length - 1));
    wd.el.replaceWith(nd.el);
    wd = nd;
  }

  wy = wheelColumn(years, years.indexOf(String(cy)), () => rebuildDays());
  wm = wheelColumn(J_MONTHS, cm - 1, () => rebuildDays());
  wd = wheelColumn(dayItems(cy, cm), cd - 1);

  wheelGroup(host, [wy, wm, wd], ['سال', 'ماه', 'روز']);

  return {
    value: () => fmtJ(Number(years[wy.get()]), wm.get() + 1, wd.get() + 1),
    reset: () => { const [y,m,d] = todayJ(); wy.set(years.indexOf(String(y))); wm.set(m-1); rebuildDays(); wd.set(d-1); }
  };
}

/* --- clock wheel: hour / minute (step 5) --- */
function makeClockWheel(host, defH, defM) {
  const hh = [], mm = [];
  for (let i = 0; i < 24; i++) hh.push(pad2(i));
  for (let i = 0; i < 60; i += 5) mm.push(pad2(i));
  const wh = wheelColumn(hh, defH === undefined ? 7 : defH);
  const wm = wheelColumn(mm, defM === undefined ? 0 : Math.round(defM / 5));
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه']);
  return { value: () => hh[wh.get()] + ':' + mm[wm.get()], clear: () => { wh.set(0); wm.set(0); } };
}

/* --- duration wheel: hours / minutes (step 5) -> total minutes --- */
function makeDurWheel(host, defH, defM) {
  const hh = [], mm = [];
  for (let i = 0; i <= 12; i++) hh.push(String(i));
  for (let i = 0; i < 60; i += 5) mm.push(pad2(i));
  const wh = wheelColumn(hh, defH || 0);
  const wm = wheelColumn(mm, Math.round((defM || 0) / 5));
  wheelGroup(host, [wh, wm], ['ساعت', 'دقیقه']);
  return {
    minutes: () => wh.get() * 60 + wm.get() * 5,
    hm: () => hh[wh.get()] + ':' + mm[wm.get()],
    clear: () => { wh.set(0); wm.set(0); }
  };
}

/* ═══════════════ 4. INDEXEDDB ═══════════════ */

const DB_NAME = 'dailylog', DB_VER = 1;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VER);
    req.onupgradeneeded = ev => {
      const db = ev.target.result;
      if (!db.objectStoreNames.contains('sessions')) db.createObjectStore('sessions', { keyPath: 'uid' });
      if (!db.objectStoreNames.contains('meta'))     db.createObjectStore('meta',     { keyPath: 'uid' });
      if (!db.objectStoreNames.contains('config'))   db.createObjectStore('config',   { keyPath: 'k' });
    };
    req.onsuccess = () => { _db = req.result; resolve(_db); };
    req.onerror   = () => reject(req.error);
  });
}

const store = (n, m) => openDB().then(db => db.transaction(n, m).objectStore(n));

function put(n, o) {
  return store(n, 'readwrite').then(s => new Promise((res, rej) => {
    const r = s.put(o); r.onsuccess = () => res(o); r.onerror = () => rej(r.error);
  }));
}
function getAll(n) {
  return store(n, 'readonly').then(s => new Promise((res, rej) => {
    const r = s.getAll(); r.onsuccess = () => res(r.result || []); r.onerror = () => rej(r.error);
  }));
}
function clearStore(n) {
  return store(n, 'readwrite').then(s => new Promise((res, rej) => {
    const r = s.clear(); r.onsuccess = () => res(); r.onerror = () => rej(r.error);
  }));
}
function cfgGet(k) {
  return store('config', 'readonly').then(s => new Promise(res => {
    const r = s.get(k); r.onsuccess = () => res(r.result ? r.result.v : ''); r.onerror = () => res('');
  }));
}
const cfgSet = (k, v) => put('config', { k, v });

/* ═══════════════ 5. HELPERS ═══════════════ */

const $ = id => document.getElementById(id);
const uid = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
const num = v => (v === '' || v == null || isNaN(Number(v))) ? '' : Number(v);

function toast(msg, isErr) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'show' + (isErr ? ' err' : '');
  clearTimeout(t._h);
  t._h = setTimeout(() => { t.className = ''; }, 2100);
}

function vibrate(ms) { if (navigator.vibrate) navigator.vibrate(ms); }

/* ═══════════════ 6. SESSION FORM ═══════════════ */

let sDate = null, dyn = {};

function currentCode() {
  return CODES.find(c => c.code === $('s_code').value) || CODES[0];
}

function buildCodeSelects() {
  const cats = [...new Set(CODES.map(c => c.cat))];
  $('s_cat').innerHTML = '<option value="">همه</option>' + cats.map(c => `<option>${c}</option>`).join('');

  function fill() {
    const c = $('s_cat').value;
    const list = c ? cats.filter(x => x === c) : cats;
    $('s_code').innerHTML = list.map(cat =>
      `<optgroup label="${cat}">` +
      CODES.filter(x => x.cat === cat).map(x => `<option value="${x.code}">${x.label}</option>`).join('') +
      `</optgroup>`).join('');
    buildDynamic();
  }
  $('s_cat').addEventListener('change', fill);
  $('s_code').addEventListener('change', buildDynamic);
  fill();
}

/** Rebuilds only the inputs that this activity actually needs. */
function buildDynamic() {
  const c = currentCode();
  const host = $('dynFields');
  const extra = $('extraFields');
  host.innerHTML = '';
  extra.innerHTML = '';
  dyn = {};

  const add = (parent, labelText, id) => {
    const l = document.createElement('label');
    l.className = 'lb';
    l.textContent = labelText;
    const box = document.createElement('div');
    box.id = id;
    parent.appendChild(l);
    parent.appendChild(box);
    return box;
  };

  if (c.metric === 'dur') {
    dyn.dur = makeDurWheel(add(host, 'مدت', 'dw'));
    quickChips(host, [10,15,20,25,30,40,45,60,90], m => {
      dyn.dur.clear();
      const h = Math.floor(m/60), mi = m % 60;
      const cols = host.querySelectorAll('.wcol .sc');
      cols[0].scrollTo({ top: h*ITEM_H, behavior:'smooth' });
      cols[1].scrollTo({ top: (mi/5)*ITEM_H, behavior:'smooth' });
    });
  }

  if (c.metric === 'clock') {
    dyn.clock = makeClockWheel(add(host, 'ساعت دقیق', 'cw'), 15, 0);
  }

  if (c.metric === 'count') {
    const box = add(host, 'تعداد', 'cnt');
    box.innerHTML = '<input id="f_count" class="ltr" type="number" inputmode="numeric" min="0" placeholder="3"/>';
    quickChips(box, [1,2,3,4,5,6,8,10], v => { $('f_count').value = v; });
  }

  if (c.metric === 'sec') {
    const box = add(host, 'ثانیه', 'sec');
    box.innerHTML = '<input id="f_sec" class="ltr" type="number" inputmode="numeric" min="0" placeholder="2"/>';
    quickChips(box, [1,2,3,5,10,20,30], v => { $('f_sec').value = v; });
  }

  if (c.metric === 'reps') {
    const box = add(host, 'تعداد × دقیقهٔ هر بار', 'reps');
    box.innerHTML =
      '<div class="grid2">' +
      '<input id="f_reps" class="ltr" type="number" inputmode="numeric" min="0" placeholder="3"/>' +
      '<input id="f_perrep" class="ltr" type="number" inputmode="numeric" min="0" placeholder="2"/>' +
      '</div>';
  }

  if (c.eff) {
    const box = add(host, 'تلاش (واحد خودت، نه ساعت)', 'eff');
    box.innerHTML = '<input id="f_eff" class="ltr" type="number" inputmode="numeric" min="0" placeholder="30"/>';
    quickChips(box, [10,15,20,25,30,40,50], v => { $('f_eff').value = v; });
  }

  if (c.qual) {
    const box = add(host, 'کیفیت', 'qual');
    box.innerHTML = '<div class="stars" id="qualBtns">' +
      [1,2,3,4,5].map(n => `<button type="button" data-q="${n}">${n}</button>`).join('') + '</div>';
    box.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => {
      box.querySelectorAll('[data-q]').forEach(x => x.classList.remove('on'));
      b.classList.add('on');
      dyn.quality = Number(b.dataset.q);
      vibrate(8);
    }));
  }

  /* always available, hidden under the details block */
  if (c.metric !== 'clock') {
    dyn.clockExtra = makeClockWheel(add(extra, 'ساعت روز (اختیاری)', 'cwx'), 0, 0);
  }
  if (c.metric !== 'dur') {
    dyn.durExtra = makeDurWheel(add(extra, 'مدت (اختیاری)', 'dwx'));
  }
}

function quickChips(parent, values, cb) {
  const d = document.createElement('div');
  d.className = 'chips';
  d.innerHTML = values.map(v => `<button type="button" data-v="${v}">${v}</button>`).join('');
  d.querySelectorAll('button').forEach(b =>
    b.addEventListener('click', () => { cb(Number(b.dataset.v)); vibrate(8); }));
  parent.appendChild(d);
}

function collectSession() {
  const c = currentCode();
  const rec = {
    uid: uid(),
    createdAt: new Date().toISOString(),
    dateShamsi: sDate.value(),
    category: c.cat,
    code: c.code,
    metric: c.metric,
    minutes: '', hm: '', effort: '', quality: '', reactSec: '',
    count: '', reps: '', perRep: '', startClock: '',
    note: $('s_note').value.trim(),
    synced: 0
  };

  if (c.metric === 'dur')   { rec.minutes = dyn.dur.minutes(); rec.hm = dyn.dur.hm(); }
  if (c.metric === 'clock') { rec.startClock = dyn.clock.value(); }
  if (c.metric === 'count') { rec.count = num($('f_count').value); }
  if (c.metric === 'sec')   { rec.reactSec = num($('f_sec').value); }
  if (c.metric === 'reps') {
    rec.reps   = num($('f_reps').value);
    rec.perRep = num($('f_perrep').value);
    if (rec.reps !== '' && rec.perRep !== '') {
      rec.minutes = rec.reps * rec.perRep;
      rec.hm = fmtHM(rec.minutes);
    }
  }
  if (c.eff)  rec.effort  = num(($('f_eff') || {}).value);
  if (c.qual) rec.quality = dyn.quality || '';

  if (dyn.durExtra) {
    const m = dyn.durExtra.minutes();
    if (m > 0 && rec.minutes === '') { rec.minutes = m; rec.hm = dyn.durExtra.hm(); }
  }
  if (dyn.clockExtra) {
    const v = dyn.clockExtra.value();
    if (v !== '00:00' && !rec.startClock) rec.startClock = v;
  }

  const hasValue = [rec.minutes, rec.count, rec.reactSec, rec.startClock].some(v => v !== '' && v !== 0);
  if (!hasValue) { toast('مقدار خالی است', true); return null; }
  return rec;
}

/* ═══════════════ 7. META FORM ═══════════════ */

let mDate = null, mBid = null, mMood = null, mBigh = null, mBand = null, mOpfa = null;

function buildMeta() {
  mDate = makeDateWheel($('mDate'));
  mBid  = makeClockWheel($('mBid'), 7, 0);
  mMood = makeDurWheel($('mMood'));
  mBigh = makeDurWheel($('mBigh'));
  mBand = makeDurWheel($('mBand'));
  mOpfa = makeDurWheel($('mOpfa'));

  $('metaBools').innerHTML = META_BOOLS.map(([id, label]) => `
    <label class="lb">${label}</label>
    <div class="seg">
      <input type="radio" name="mb_${id}" id="mb_${id}_y" value="1"/><label for="mb_${id}_y">آره</label>
      <input type="radio" class="no" name="mb_${id}" id="mb_${id}_n" value="0"/><label for="mb_${id}_n">نه</label>
    </div>`).join('');
}

function radioVal(name) {
  const el = document.querySelector(`input[name="${name}"]:checked`);
  return el ? Number(el.value) : '';
}

function collectMeta() {
  const o = {
    uid: uid(),
    createdAt: new Date().toISOString(),
    dateShamsi: mDate.value(),
    bid: mBid.value(),
    nap: radioVal('mb_nap'),
    checkin1h: num($('m_checkin').value),
    moodToFlowMin: mMood.minutes(), moodToFlowHM: mMood.hm(),
    bigharariMin:  mBigh.minutes(), bigharariHM:  mBigh.hm(),
    bandShadidMin: mBand.minutes(), bandShadidHM: mBand.hm(),
    openfastMin:   mOpfa.minutes(), openfastHM:   mOpfa.hm(),
    note: $('m_note').value.trim(),
    synced: 0
  };
  META_BOOLS.forEach(([id]) => { o[id] = radioVal('mb_' + id); });
  return o;
}

/* ═══════════════ 8. TABS + SAVE ═══════════════ */

let activeTab = 'session';

function showTab(name) {
  activeTab = name;
  $('paneSession').classList.toggle('hide', name !== 'session');
  $('paneMeta').classList.toggle('hide',    name !== 'meta');
  $('paneData').classList.toggle('hide',    name !== 'data');
  $('tabSession').classList.toggle('active', name === 'session');
  $('tabMeta').classList.toggle('active',    name === 'meta');
  $('tabData').classList.toggle('active',    name === 'data');
  $('btnSave').disabled  = (name === 'data');
  $('btnAgain').disabled = (name !== 'session');
  if (name === 'data') refreshData();
}

async function doSave(again) {
  if (activeTab === 'session') {
    const rec = collectSession();
    if (!rec) return;
    await put('sessions', rec);
    vibrate(25);
    toast('ثبت شد · ' + (rec.hm || rec.startClock || rec.count || rec.reactSec));
    $('s_note').value = '';
    if (!again) buildDynamic();
    else buildDynamic();
  } else if (activeTab === 'meta') {
    const rec = collectMeta();
    await put('meta', rec);
    vibrate(25);
    toast('متای روز ثبت شد');
  }
  updateQueueBadge();
  trySync();
}

/* ═══════════════ 9. SYNC ═══════════════ */

async function trySync(loud) {
  const url = await cfgGet('url');
  const secret = await cfgGet('secret');
  if (!url) { if (loud) toast('آدرس وب‌اپ خالی است', true); return; }
  if (!navigator.onLine) { if (loud) toast('آفلاین هستی', true); return; }

  const s = (await getAll('sessions')).filter(r => !r.synced);
  const m = (await getAll('meta')).filter(r => !r.synced);
  if (!s.length && !m.length) { if (loud) toast('چیزی برای ارسال نیست'); return; }

  try {
    if (s.length) await pushBatch(url, secret, 'session', s, SESSION_FIELDS);
    if (m.length) await pushBatch(url, secret, 'meta',    m, META_FIELDS);
    toast('همگام شد');
  } catch (e) {
    toast('ارسال نشد، در صف ماند', true);
  }
  updateQueueBadge();
  if (activeTab === 'data') refreshData();
}

async function pushBatch(url, secret, type, rows, fields) {
  const payload = { secret, type, fields, rows: rows.map(r => fields.map(f => r[f] === undefined ? '' : r[f])) };
  /* text/plain keeps this a "simple request" so the browser skips the CORS
     preflight that Apps Script cannot answer. */
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload)
  });
  const out = await res.json();
  if (!out.ok) throw new Error(out.error || 'server');
  const st = (type === 'meta') ? 'meta' : 'sessions';
  for (const r of rows) { r.synced = 1; await put(st, r); }
}

async function updateQueueBadge() {
  const s = (await getAll('sessions')).filter(r => !r.synced).length;
  const m = (await getAll('meta')).filter(r => !r.synced).length;
  const n = s + m;
  $('queuePill').textContent = 'صف ' + n;
  $('queuePill').className = 'pill ' + (n ? 'off' : 'on');
}

function updateNetPill() {
  const p = $('netPill');
  p.textContent = navigator.onLine ? 'آنلاین' : 'آفلاین';
  p.className = 'pill ' + (navigator.onLine ? 'on' : 'off');
}

/* ═══════════════ 10. DATA PANE ═══════════════ */

async function refreshData() {
  const s = await getAll('sessions');
  const m = await getAll('meta');
  $('cntS').textContent = s.length;
  $('cntM').textContent = m.length;
  $('cntQ').textContent = s.filter(r=>!r.synced).length + m.filter(r=>!r.synced).length;

  const [y, mo, d] = todayJ();
  const today = fmtJ(y, mo, d);
  const rows = s.filter(r => r.dateShamsi === today);

  const byCat = {};
  let totalMin = 0, totalEff = 0;
  rows.forEach(r => {
    const mi = Number(r.minutes) || 0;
    const ef = Number(r.effort)  || 0;
    totalMin += mi; totalEff += ef;
    if (!byCat[r.category]) byCat[r.category] = { min: 0, eff: 0, n: 0 };
    byCat[r.category].min += mi;
    byCat[r.category].eff += ef;
    byCat[r.category].n++;
  });

  let html = `<b>${today}</b> — جمع کل: <b>${fmtHM(totalMin)}</b> (${totalMin} دقیقه) · تلاش: <b>${totalEff}</b> · نوبت: <b>${rows.length}</b>`;
  const cats = Object.keys(byCat);
  if (cats.length) {
    html += '<div style="margin-top:8px">' + cats.map(c =>
      `${c}: <b>${fmtHM(byCat[c].min)}</b> · تلاش ${byCat[c].eff} · ${byCat[c].n} نوبت`
    ).join('<br/>') + '</div>';
  }
  $('todaySum').innerHTML = html;

  const body = document.querySelector('#tblRecent tbody');
  body.innerHTML = s.slice(-20).reverse().map(r => `
    <tr>
      <td class="ltr">${r.dateShamsi}</td>
      <td>${(CODES.find(c=>c.code===r.code)||{}).label || r.code}</td>
      <td class="ltr">${r.hm || r.startClock || r.count || (r.reactSec !== '' ? r.reactSec + 's' : '')}</td>
      <td class="ltr">${r.effort}</td>
      <td><span class="tag ${r.synced?'sent':'pending'}">${r.synced?'رفت':'صف'}</span></td>
    </tr>`).join('');
}

/* ═══════════════ 11. CSV ═══════════════ */

function csvEscape(v) {
  const s = String(v == null ? '' : v);
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

async function buildCsv(storeName, fields) {
  const rows = await getAll(storeName);
  return '\ufeff' + fields.join(',') + '\n' +
         rows.map(r => fields.map(f => csvEscape(r[f])).join(',')).join('\n');
}

async function exportCsv(storeName, fields, name) {
  const text = await buildCsv(storeName, fields);
  const [y, m, d] = todayJ();
  const file = `${name}_${y}-${pad2(m)}-${pad2(d)}.csv`;
  const blob = new Blob([text], { type: 'text/csv;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  toast('فایل ساخته شد');
}

/** iPhone-friendly: hands the file to the iOS share sheet. */
async function shareCsv() {
  const text = await buildCsv('sessions', SESSION_FIELDS);
  const [y, m, d] = todayJ();
  const file = new File([text], `sessions_${y}-${pad2(m)}-${pad2(d)}.csv`, { type: 'text/csv' });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: 'DailyLog' }); return; } catch (e) { return; }
  }
  exportCsv('sessions', SESSION_FIELDS, 'sessions');
}

/* ═══════════════ 12. BOOT ═══════════════ */

async function boot() {
  sDate = makeDateWheel($('sDate'));
  buildCodeSelects();
  buildMeta();

  $('cfg_url').value    = await cfgGet('url');
  $('cfg_secret').value = await cfgGet('secret');

  $('tabSession').addEventListener('click', () => showTab('session'));
  $('tabMeta').addEventListener('click',    () => showTab('meta'));
  $('tabData').addEventListener('click',    () => showTab('data'));

  $('btnSave').addEventListener('click',  () => doSave(false));
  $('btnAgain').addEventListener('click', () => doSave(true));

  $('btnSaveCfg').addEventListener('click', async () => {
    await cfgSet('url', $('cfg_url').value.trim());
    await cfgSet('secret', $('cfg_secret').value.trim());
    toast('ذخیره شد');
  });
  $('btnSyncNow').addEventListener('click', () => trySync(true));
  $('btnCsvS').addEventListener('click', () => exportCsv('sessions', SESSION_FIELDS, 'sessions'));
  $('btnCsvM').addEventListener('click', () => exportCsv('meta', META_FIELDS, 'meta'));
  $('btnShare').addEventListener('click', shareCsv);
  $('btnWipe').addEventListener('click', async () => {
    if (!confirm('همه دادهٔ این دستگاه پاک شود؟')) return;
    await clearStore('sessions');
    await clearStore('meta');
    refreshData(); updateQueueBadge();
    toast('پاک شد');
  });

  window.addEventListener('online',  () => { updateNetPill(); trySync(); });
  window.addEventListener('offline', updateNetPill);

  updateNetPill();
  updateQueueBadge();
  trySync();

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

boot();

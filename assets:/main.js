/* === 共有検索：各ページに合わせて絞り込み（カード／表／タイムライン） === */
function doSearch(){
  const input = document.getElementById('q');
  const q = (input?.value || '').trim();
  sessionStorage.setItem('site_q', q);   // 全ページ共有
  applySearch(q);
}
function textMatch(node, q){
  return node.textContent.toLowerCase().includes(q.toLowerCase());
}
function applySearch(q){
  const term = (q||'').trim();
  const showAll = !term;

  // 汎用カード（index/コメント/作品など）
  let touched = false, any = false;
  document.querySelectorAll('.rail .card, .grid .card').forEach(card=>{
    touched = true;
    if(showAll){ card.style.display=''; any = true; return; }
    const t = card.querySelector('.title'), s = card.querySelector('.sub');
    const ok = (t && textMatch(t, term)) || (s && textMatch(s, term));
    card.style.display = ok ? '' : 'none';
    any = any || ok;
  });

  // 単位テーブル（units.html）
  const rows = document.querySelectorAll('#tbody tr');
  if(rows.length){
    touched = true; any = false;
    rows.forEach(tr=>{
      if(showAll){ tr.style.display=''; any = true; return; }
      const ok = textMatch(tr, term);
      tr.style.display = ok ? '' : 'none';
      any = any || ok;
    });
  }

  // 履歴タイムライン（history.html）
  const items = document.querySelectorAll('.tl-item');
  if(items.length){
    touched = true; any = false;
    items.forEach(it=>{
      if(showAll){ it.style.display=''; any = true; return; }
      const ok = textMatch(it, term);
      it.style.display = ok ? '' : 'none';
      any = any || ok;
    });
  }

  // 結果メッセージ
  let msg = document.getElementById('search-empty');
  if(!msg){
    msg = document.createElement('div');
    msg.id = 'search-empty';
    msg.style.margin = '10px 0';
    msg.style.color = '#666';
    msg.style.fontSize = '.95rem';
    const main = document.querySelector('main') || document.body;
    main.appendChild(msg);
  }
  msg.textContent = (!touched || showAll || any) ? '' : `「${term}」に一致する項目が見つかりませんでした。`;
}

/* ページ読み込み時に前回の検索語を復元して即適用 */
document.addEventListener('DOMContentLoaded', ()=>{
  const q = sessionStorage.getItem('site_q') || '';
  const input = document.getElementById('q');
  if(input) input.value = q;
  if(q) applySearch(q);
});
  if (location.pathname.endsWith('units.html')) {
    // 単位ページではデフォルトで全件表示にする
    sessionStorage.removeItem('site_q');
    const input = document.getElementById('q');
    if(input) input.value = '';
    applySearch('');
    updateUnitsCount();
  } else {
    // ほかのページでは保存語を適用済みなら件数だけ更新
    updateUnitsCount();
  }




/* ===== UIヘルパ ===== */
const yen = n => `¥${Number(n).toLocaleString('ja-JP')}`;
function stars(x){
  const full = Math.floor(x);
  const half = (x - full) >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  const span = (n, cls, ch) => Array.from({length:n}).map(()=>`<span class="${cls}">${ch}</span>`).join('');
  return span(full,'star','★') + (half?'<span class="star half">★</span>':'') + span(empty,'star empty','★');
}
function pctOff(now, old){
  if(!now || !old || old<=now) return '';
  const p = Math.round((1 - now/old) * 100);
  return `${p}%OFF`;
}

/* ===== FANZA風カード ===== */
function cardHTML(c){
  const off = pctOff(c.priceNow, c.priceOld);
  return `<a class="card" href="${c.href||'#'}" ${c.blank?'target="_blank" rel="noopener"':''}>
    <div class="thumb">
      <img src="${c.thumb}" alt="${c.title}">
      ${c.ribbon?`<span class="ribbon">${c.ribbon}</span>`:''}
    </div>
    <div class="meta">
      <div class="title">${c.title}</div>
      <div class="sub">${c.sub||''}</div>
      ${(c.priceNow||c.priceOld)?`
        <div class="price">
          ${c.priceNow?`<span class="now">${yen(c.priceNow)}</span>`:''}
          ${c.priceOld?`<span class="old">${yen(c.priceOld)}</span>`:''}
          ${off?`<span class="off">${off}</span>`:''}
        </div>`:''}
      ${c.rating?`<div class="rating">${stars(c.rating)}<span class="rev">(${c.reviews||0})</span></div>`:''}
      <div class="actions-row">
        ${c.primary?`<button class="mini primary">${c.primary}</button>`:''}
        <button class="mini">詳細</button>
      </div>
    </div>
  </a>`;
}

/* ===== index.html：データ＆描画 ===== */
(function(){
const slidesEl = document.getElementById('slides');
const dotsEl   = document.getElementById('dots');
const pickupEl = document.getElementById('pickup-rail');
const papersEl = document.getElementById('papers');
const talksEl  = document.getElementById('talk-grid');
const worksEl  = document.getElementById('works-rail');
const socialEl = document.getElementById('social-grid');
const acadEl   = document.getElementById('academic-grid');
  if(!slidesEl || !dotsEl) return;

  const DATA = {
    hero: [
      { title:"研究業績まとめ", desc:"論文・講演・活動を一元ナビ", tags:["A-超幾何","GKZ"], href:"#research", bg:"https://placehold.co/1200x360?text=Research" },
      { title:"講演・口頭発表",  desc:"新着をチェック",               tags:["Talks"],        href:"#talks",    bg:"https://placehold.co/1200x360?text=Talks" },
      { title:"社会/学術貢献",   desc:"運営・アウトリーチの記録",     tags:["Outreach"],    href:"#social",   bg:"https://placehold.co/1200x360?text=Activities" },
    ],
    pickup: [
      { title:"A-hypergeometric series with parameters in the core",
        sub:"preprint / 2025", tags:["A-超幾何","GKZ"],
        ribbon:"PICK", thumb:"https://placehold.co/400x533/jpg?text=Paper",
        href:"comments.html", primary:"コメント", rating:4.5, reviews:17, priceNow:1200, priceOld:1600 },
      { title:"Logarithmic solutions of unimodular ...",
        sub:"seminar / 2024", ribbon:"NEW",
        thumb:"https://placehold.co/400x533/jpg?text=Talk",
        href:"#talks", primary:"概要", rating:4.0, reviews:9, priceNow:900, priceOld:1200 },
      { title:"博物館オリジナルガチャ",
        sub:"作品等", thumb:"https://placehold.co/400x533/jpg?text=Work",
        href:"#works", primary:"見る", rating:3.5, reviews:5 }
    ],
    papers: Array.from({length:12}).map((_,i)=>({
      title:`論文タイトル ${i+1}`, sub:"誌名・年",
      thumb:`https://placehold.co/400x533/jpg?text=Paper+${i+1}`,
      href:"comments.html", primary:"コメント", rating:4.3, reviews:12+i,
      priceNow: 1100+i*70, priceOld: i%2? (1400+i*70): null, ribbon: i<2?"NEW":""
    })),
    talks:  Array.from({length:8}).map((_,i)=>({
      title:`講演 ${i+1}`, sub:"イベント名・年",
      thumb:`https://placehold.co/400x533/jpg?text=Talk+${i+1}`,
      href:"#", primary:"概要", rating:4-(i%3)*0.5
    })),
    works:  Array.from({length:8}).map((_,i)=>({
      title:`作品 ${i+1}`, sub:"概要",
      thumb:`https://placehold.co/400x533/jpg?text=Work+${i+1}`,
      href:"#", primary:"見る"
    })),
    ranking:Array.from({length:10}).map((_,i)=>({
      title:`注目 ${i+1}`, sub:"閲覧が多い項目",
      priceNow: 1200+i*90, priceOld: 1600+i*90, href:"comments.html"
    }))
  };

  /* Hero */
  let cur=0, timer;
  function renderHero(){
    slidesEl.innerHTML = DATA.hero.map((s,i)=>`
      <a href="${s.href}" class="slide ${i===0?'active':''}">
        <div class="bg" style="background-image:linear-gradient(90deg, rgba(255,255,255,.92), rgba(255,255,255,.1)), url('${s.bg}')"></div>
        <div class="content"><div class="panel">
          <div class="tags">${s.tags.map(t=>`<span class='tag'>${t}</span>`).join('')}</div>
          <h2>${s.title}</h2><p style="margin:0">${s.desc}</p>
        </div></div>
      </a>`).join('');
    dotsEl.innerHTML = DATA.hero.map((_,i)=>`<div class="dot ${i===0?'active':''}"></div>`).join('');
    dotsEl.querySelectorAll('.dot').forEach((d,i)=>d.onclick=()=>go(i));
    auto();
  }
  function go(i){cur=i; updateHero()}
  function updateHero(){
    slidesEl.querySelectorAll('.slide').forEach((el,i)=>el.classList.toggle('active', i===cur));
    dotsEl.querySelectorAll('.dot').forEach((el,i)=>el.classList.toggle('active', i===cur));
    auto();
  }
  function auto(){clearTimeout(timer); timer=setTimeout(()=>{cur=(cur+1)%DATA.hero.length; updateHero();}, 4200)}

  /* Sections */
  pickupEl.innerHTML = DATA.pickup.map(cardHTML).join('');
  papersEl && (papersEl.innerHTML      = DATA.papers.map(cardHTML).join(''));
  talksEl  && (talksEl.innerHTML       = DATA.talks.map(cardHTML).join(''));
  worksEl  && (worksEl.innerHTML       = DATA.works.map(cardHTML).join(''));
  rankingEl&& (rankingEl.innerHTML     = DATA.ranking.map((r,i)=>`
    <a class="rankitem" href="${r.href}">
      <div class="ranknum">${i+1}</div>
      <div class="rankmeta"><div class="title">${r.title}</div><div class="sub" style="color:#999">${r.sub||""}</div></div>
      <div class="rankprice">${yen(r.priceNow)}</div>
    </a>`).join(''));

    
// --- 最新写真レール（albums.html と同じ localStorage: photos_v1 を参照） ---
const rail = document.getElementById('home-photos');
if (rail) {
  const photos = JSON.parse(localStorage.getItem('photos_v1')||'[]')
    .filter(p => p && p.url)
    .sort((a,b)=> (b.date||'').localeCompare(a.date||'') || (b.updated||'').localeCompare(a.updated||''))
    .slice(0,8);
  rail.innerHTML = photos.length
    ? photos.map(p => {
        const t = (p.title||'').replace(/"/g,'&quot;');
        const src = p.thumb || p.url;
        return `<a href="albums.html" title="${t}"><img src="${src}" alt=""></a>`;
      }).join('')
    : `<div class="sub" style="color:#777">まだ写真がありません。<a href="albums.html">アルバム</a>から追加してください。</div>`;
}


  renderHero();
})();

/* ===== comments.html：論文コメントをカード表示 ===== */
(function(){
  const grid = document.getElementById('comments-grid');
  if(!grid) return;
  const L = (window.COMMENTS_DATA || []).map(p => ({
    title:p.title, sub:p.sub, thumb:p.thumb, href:p.href, blank:!!p.href,
    primary:"PDF", ribbon:"COMMENT", rating: p.rating||4, reviews:p.reviews||12,
    priceNow: p.priceNow, priceOld: p.priceOld
  }));
  grid.innerHTML = L.map(cardHTML).join('');
})();

// 追加：検索クリア
function clearSearch(){
  sessionStorage.removeItem('site_q');
  const input = document.getElementById('q');
  if(input) input.value = '';
  applySearch(''); // 全件表示
  updateUnitsCount(); // 件数更新（unitsページなら）
}

// 追加：unitsページの表示件数（表示 X / 総 Y）
function updateUnitsCount(){
  const tbody = document.getElementById('tbody');
  if(!tbody) return; // units以外のページでは何もしない
  const rows = Array.from(tbody.querySelectorAll('tr'));
  const visible = rows.filter(tr => tr.style.display !== 'none').length;
  let box = document.getElementById('units-count');
  if(!box){
    box = document.createElement('div');
    box.id = 'units-count';
    box.style.color = '#666';
    box.style.margin = '8px 0';
    const tableWrap = document.querySelector('.table-wrap');
    (tableWrap?.parentElement || document.querySelector('main')).insertBefore(box, tableWrap.nextSibling);
  }
  box.textContent = `表示 ${visible} / 総 ${rows.length}`;
}

// 既存 applySearch の最後に、この1行を足すと便利
// （関数の末尾：msg.textContent を設定した直後など）
try{ updateUnitsCount(); }catch(e){}

// ===== Admin-only UI (GitHub edit shortcuts) =====
(function () {
  // ① admin=1 をURLに付けて開くとON、OFFはボタン or localStorage クリア
  const params = new URLSearchParams(location.search);
  if (params.get('admin') === '1') {
    localStorage.setItem('isAdmin', '1');
    // 見た目を綺麗に：クエリを消す
    history.replaceState({}, '', location.pathname + location.hash);
  }
  const isAdmin = localStorage.getItem('isAdmin') === '1';
  if (!isAdmin) return;

  // ② リポジトリ情報（必要に応じて書き換え）
  const owner = 'sekibunking';
  const repo  = 'nagamine_mao';
  const branch = 'main';
  const repoBasePath = `/${repo}/`; // プロジェクトページのURLのベース

  // ③ 今見ているファイルのパスを推定（GitHub Pagesの /repo/ を外す）
  const toRepoPath = () => {
    let p = location.pathname;
    // 例: /nagamine_mao/links.html -> links.html
    if (p.startsWith(repoBasePath)) p = p.slice(repoBasePath.length);
    if (p === '' || p.endsWith('/')) p += 'index.html';
    return decodeURIComponent(p.replace(/^\/+/, ''));
  };

  // ④ 編集リンク＆新規作成リンク
  const currentPath = toRepoPath();
  const editUrl = `https://github.com/${owner}/${repo}/edit/${branch}/${currentPath}`;
  const repoRootNewUrl = `https://github.com/${owner}/${repo}/new/${branch}/`;   // ルートに新規ファイル
  const newInAssetsUrl = `https://github.com/${owner}/${repo}/new/${branch}/assets/`; // assets内に新規

  // ⑤ 画面にフローティングUIを追加
  const wrap = document.createElement('div');
  wrap.className = 'admin-fab';
  wrap.innerHTML = `
    <a href="${editUrl}" target="_blank" rel="noopener">✏️ このページを編集</a>
    <a href="${repoRootNewUrl}" target="_blank" rel="noopener">➕ ルートに新規ファイル</a>
    <a href="${newInAssetsUrl}" target="_blank" rel="noopener">➕ assetsに新規ファイル</a>
    <button id="admin-off">🚪 Admin OFF</button>
  `;
  document.body.appendChild(wrap);

  const badge = document.createElement('div');
  badge.className = 'admin-badge';
  badge.textContent = 'ADMIN MODE';
  document.body.appendChild(badge);

  document.getElementById('admin-off').addEventListener('click', () => {
    localStorage.removeItem('isAdmin');
    location.reload();
  });
})();


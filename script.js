document.addEventListener('DOMContentLoaded', () => {

    // ── 每日 Accent 色 ───────────────────────────────────────────────────────
    const accents = [
        '#a78bfa', '#f87171', '#60a5fa', '#34d399', '#f472b6',
        '#22d3ee', '#fb923c', '#c084fc', '#818cf8', '#f43f5e',
        '#fbbf24', '#2dd4bf', '#86efac', '#fda4af', '#93c5fd',
    ];

    // ── 语录库 ───────────────────────────────────────────────────────────────
    const affirmations = [
        '相信自己，你比想象中更强大。',
        '每一个清晨，都是一个全新的开始。',
        '保持微笑，好运会随之而来。',
        '你今天的努力，是未来惊喜的铺垫。',
        '慢慢来，别着急，生活和工作都是。',
        '心怀感恩，所遇皆是温柔。',
        '你值得世间所有的美好。',
        '不为模糊的未来担忧，只为清晰的现在努力。',
        '种一棵树最好的时间是十年前，其次是现在。',
        '只要你还在路上，就没有到不了的远方。',
        '生活是一面镜子，你对它笑，它就对你笑。',
        '唯有自渡，才是最好的出路。',
        '今天的日落，是明天的前奏。',
        '允许一切发生，才能拥抱真正的自由。',
        '你走的每一步，都算数。',
    ];

    // ── 工具 ─────────────────────────────────────────────────────────────────
    const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const MONS = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];

    function getDayOfYear(d) {
        return Math.floor((d - new Date(d.getFullYear(), 0, 0)) / 86400000);
    }

    function getIdx(d) {
        return getDayOfYear(d) % affirmations.length;
    }

    function toStr(d) {
        return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    }

    function splitLines(text) {
        const p = text.split('，');
        return p.length <= 1 ? [text] : p.map((s, i) => i < p.length - 1 ? s + '，' : s);
    }

    function rgba(hex, a) {
        const r = parseInt(hex.slice(1,3), 16);
        const g = parseInt(hex.slice(3,5), 16);
        const b = parseInt(hex.slice(5,7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }

    // ── 全局光晕更新 ─────────────────────────────────────────────────────────
    const $halo      = document.getElementById('halo');
    const $counter   = document.getElementById('counter');
    const $dateLabel = document.getElementById('date-label');
    const $deck      = document.getElementById('deck');
    const $navDots   = document.getElementById('nav-dots');
    const $hint      = document.getElementById('hint');

    const TODAY = new Date();
    const doy   = getDayOfYear(TODAY);

    $counter.textContent   = `Day ${doy} / 365`;
    $dateLabel.textContent = `${DAYS[TODAY.getDay()]}  ·  ${MONS[TODAY.getMonth()]}`;

    // ── 生成卡片数据（今天 + 过去6天 = 7张） ───────────────────────────────
    const cards = [];
    for (let i = 0; i < 7; i++) {
        const d   = new Date(TODAY);
        d.setDate(d.getDate() - i);
        const idx = getIdx(d);
        const ac  = accents[idx];
        const txt = affirmations[idx];
        const str = toStr(d);

        // 读取打卡状态
        let saved = null;
        try { saved = JSON.parse(localStorage.getItem(`check-${str}`)); } catch (_) {}
        const checked = saved && saved.checked === true;

        cards.push({
            date: d,
            dateStr: str,
            num: d.getDate(),
            meta: `${DAYS[d.getDay()]}  ·  ${MONS[d.getMonth()]}`,
            accent: ac,
            text: txt,
            checked,
            isToday: i === 0,
        });
    }

    // ── 渲染卡片 DOM ─────────────────────────────────────────────────────────
    cards.forEach((c, i) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.idx = i;

        card.innerHTML = `
            <div class="card-head">
                <div class="card-num">${c.num}</div>
                <p class="card-meta">${c.meta}</p>
            </div>
            <div class="card-body">
                ${c.checked
                    ? `<div class="quote show">${splitLines(c.text).map(ln => `<p class="q-ln still">${ln}</p>`).join('')}</div>`
                    : `<button class="check-btn">
                           <div class="check-ico"></div>
                       </button>
                       <p class="check-tip">轻触打卡</p>
                       <div class="quote"></div>`
                }
            </div>
            <div class="card-foot">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                     stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
                    <line x1="7" y1="7" x2="7.01" y2="7"/>
                </svg>
                ${c.isToday ? '今天' : `${i} 天前`}
            </div>
        `;

        $deck.appendChild(card);

        // 应用 accent 样式
        applyCardAccent(card, c.accent, c.checked);

        // 绑定打卡按钮
        if (!c.checked) {
            const btn = card.querySelector('.check-btn');
            btn.addEventListener('click', e => {
                e.stopPropagation();
                handleCheck(card, c);
            });
        }
    });

    // ── 应用卡片 Accent ──────────────────────────────────────────────────────
    function applyCardAccent(card, ac, checked) {
        const num = card.querySelector('.card-num');
        // 降低发光强度，增强可读性
        num.style.textShadow = `0 0 60px ${rgba(ac, 0.25)}, 0 2px 12px rgba(0,0,0,0.4)`;

        card.style.boxShadow = `0 8px 48px ${rgba(ac, 0.12)}, 0 0 1px ${rgba(ac, 0.3)}`;

        const btn = card.querySelector('.check-btn');
        if (btn) {
            btn.style.boxShadow = `0 0 24px ${rgba(ac, 0.25)}`;
            btn.style.borderColor = rgba(ac, 0.3);
        }

        if (checked) {
            card.querySelectorAll('.q-ln').forEach(p => {
                // 语录文字：轻微发光 + 阴影增强可读性
                p.style.textShadow = `0 0 18px ${rgba(ac, 0.12)}, 0 1px 8px rgba(0,0,0,0.35)`;
            });
        }
    }

    // ── 打卡交互 ──────────────────────────────────────────────────────────────
    function handleCheck(card, c) {
        const btn   = card.querySelector('.check-btn');
        const tip   = card.querySelector('.check-tip');
        const quote = card.querySelector('.quote');

        // 粒子 + 涟漪
        const rect = btn.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        // 涟漪
        const rip = document.createElement('div');
        rip.className = 'rip';
        rip.style.cssText = `left:${cx}px;top:${cy}px;background:${rgba(c.accent, 0.4)}`;
        document.body.appendChild(rip);
        setTimeout(() => rip.remove(), 1000);

        // 粒子（10颗）
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const dist  = 40 + Math.random() * 28;
            const pt = document.createElement('div');
            pt.className = 'pt';
            pt.style.cssText = `
                left:${cx}px; top:${cy}px;
                background:${c.accent};
                --tx:${(Math.cos(angle) * dist).toFixed(1)}px;
                --ty:${(Math.sin(angle) * dist).toFixed(1)}px;
            `;
            document.body.appendChild(pt);
            setTimeout(() => pt.remove(), 800);
        }

        // 按钮消失 → 语录出现
        btn.style.transition = 'opacity 0.3s, transform 0.3s';
        btn.style.opacity = '0';
        btn.style.transform = 'scale(0.7)';

        if (tip) {
            tip.style.transition = 'opacity 0.3s';
            tip.style.opacity = '0';
        }

        setTimeout(() => {
            btn.remove();
            if (tip) tip.remove();

            // 填充语录
            quote.classList.add('show');
            splitLines(c.text).forEach((ln, i) => {
                const p = document.createElement('p');
                p.className = 'q-ln anim';
                p.style.setProperty('--d', `${i * 0.18}s`);
                p.style.textShadow = `0 0 18px ${rgba(c.accent, 0.12)}, 0 1px 8px rgba(0,0,0,0.35)`;
                p.textContent = ln;
                quote.appendChild(p);
            });

            // 存储打卡状态
            localStorage.setItem(`check-${c.dateStr}`, JSON.stringify({ checked: true }));
            c.checked = true;
        }, 320);
    }

    // ── 卡片切换逻辑（左右滑动） ─────────────────────────────────────────────
    let curr = 0;
    const total = cards.length;

    // 导航点
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goTo(i));
        $navDots.appendChild(dot);
    }

    // 切换到指定索引
    function goTo(idx) {
        if (idx < 0 || idx >= total || idx === curr) return;
        curr = idx;
        updateView();
    }

    function updateView() {
        const cardEl = $deck.querySelector('.card');
        if (!cardEl) return;

        const w = cardEl.offsetWidth;
        const gap = 24; // 卡片间距（需与 CSS 一致）
        const offset = curr * (w + gap);

        $deck.style.transform = `translateX(-${offset}px)`;

        // 更新卡片激活状态
        document.querySelectorAll('.card').forEach((card, i) => {
            if (i === curr) {
                card.classList.add('active');
            } else {
                card.classList.remove('active');
            }
        });

        // 更新导航点
        document.querySelectorAll('.dot').forEach((dot, i) => {
            dot.classList.toggle('active', i === curr);
        });

        // 更新光晕
        const c = cards[curr];
        $halo.style.background =
            `radial-gradient(ellipse 110% 70% at 50% -10%, ${rgba(c.accent, 0.2)} 0%, transparent 72%)`;
    }

    // 初始化（延迟确保 DOM 渲染完成）
    setTimeout(() => {
        document.querySelectorAll('.card')[0].classList.add('active');
        updateView();
    }, 50);

    // ── 触摸滑动 ──────────────────────────────────────────────────────────────
    let tx = 0, isDrag = false;

    $deck.addEventListener('touchstart', e => {
        tx = e.touches[0].clientX;
        isDrag = false;
    }, { passive: true });

    $deck.addEventListener('touchmove', e => {
        const dx = Math.abs(e.touches[0].clientX - tx);
        if (dx > 10) isDrag = true;
    }, { passive: true });

    $deck.addEventListener('touchend', e => {
        if (!isDrag) return;
        const dx = tx - e.changedTouches[0].clientX;
        if (Math.abs(dx) < 48) return;
        if (dx > 0 && curr < total - 1) goTo(curr + 1);
        else if (dx < 0 && curr > 0)   goTo(curr - 1);
    }, { passive: true });

    // ── 鼠标拖拽（桌面端） ───────────────────────────────────────────────────
    let mx = 0, isDragging = false;

    $deck.addEventListener('mousedown', e => {
        mx = e.clientX;
        isDragging = false;
        $deck.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', e => {
        if (mx === 0) return;
        const dx = Math.abs(e.clientX - mx);
        if (dx > 10) isDragging = true;
    });

    document.addEventListener('mouseup', e => {
        if (mx === 0) return;
        $deck.style.cursor = 'grab';
        if (!isDragging) { mx = 0; return; }
        const dx = mx - e.clientX;
        if (Math.abs(dx) < 48) { mx = 0; return; }
        if (dx > 0 && curr < total - 1) goTo(curr + 1);
        else if (dx < 0 && curr > 0)   goTo(curr - 1);
        mx = 0;
    });

});

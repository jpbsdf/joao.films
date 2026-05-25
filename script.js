/* ==========================================================
   joão.films — script principal
========================================================== */

/* ──────────────────────────────────────────────
   DADOS: VÍDEOS
   orientation: 'landscape' (16:9) | 'portrait' (9:16)
   Ajuste os títulos e orientações conforme necessário
────────────────────────────────────────────────── */
const VIDEOS = [
    {
        id: '9n9p6LnreA8',
        platform: 'youtube',
        orientation: 'landscape',
        title: 'produção audiovisual',
        thumb: 'https://img.youtube.com/vi/9n9p6LnreA8/maxresdefault.jpg',
    },
    {
        id: 'hXBTnEuP3No',
        platform: 'youtube',
        orientation: 'landscape',
        title: 'Tutorial',
        thumb: 'https://img.youtube.com/vi/hXBTnEuP3No/maxresdefault.jpg',
    },
    {
        id: '1195147661',
        platform: 'vimeo',
        orientation: 'portrait',
        title: 'short film',
        thumb: 'https://vumbnail.com/1195147661.jpg',
    },
    {
        id: '1195147663',
        platform: 'vimeo',
        orientation: 'portrait',
        title: 'reel social',
        thumb: 'https://vumbnail.com/1195147663.jpg',
    },
    {
        id: '1195147662',
        platform: 'vimeo',
        orientation: 'portrait',
        title: 'edição criativa',
        thumb: 'https://vumbnail.com/1195147662.jpg',
    },
];

/* ──────────────────────────────────────────────
   DADOS: LOGOS DAS MARCAS
   (todos os arquivos da pasta "Marcas que trabalhei")
────────────────────────────────────────────────── */
const LOGOS_PATH = 'Arquivos para site/Marcas que trabalhei/';
const LOGOS = [
    '20_Logotipo_Terra_Santa_RGB 1.png',
    'Camada_1.png',
    'Group 1073.png',
    'Group 1074.png',
    'Group 1075.png',
    'Group 716.png',
    'Group 974.png',
    'Group 975.png',
    'Group-1.png',
    'Group.png',
    'Logo 06 1.png',
    'Logotipo - Mata da Praia_RGB_03 1.png',
    'Sem título-2-02 1.png',
];

/* ==========================================================
   THUMBNAILS — busca alta qualidade via oEmbed do Vimeo
========================================================== */
async function fetchVimeoThumb(id, orientation) {
    try {
        // Para portrait (9:16) solicitamos height grande; para landscape, width grande
        const param = orientation === 'portrait' ? 'height=1920' : 'width=1920';
        const res = await fetch(
            `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&${param}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.thumbnail_url) return null;
        return data.thumbnail_url;
    } catch {
        return null;
    }
}

/* ==========================================================
   BUILD: GALERIA
========================================================== */
function buildGallery() {
    const gallery = document.getElementById('gallery');
    if (!gallery) return;

    VIDEOS.forEach((video) => {
        const card = document.createElement('div');
        card.className = 'video-card fade-up';
        card.dataset.id = video.id;
        card.dataset.platform = video.platform;
        card.dataset.orientation = video.orientation;

        const FALLBACK = "data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 9%22%3E%3Crect fill=%22%234A3E36%22 width=%2216%22 height=%229%22/%3E%3C/svg%3E";

        card.innerHTML = `
            <img src="${video.thumb}"
                 alt="${video.title}"
                 loading="lazy"
                 decoding="async"
                 onerror="this.src='${FALLBACK}'">
            <div class="card-overlay">
                <span class="card-play">j<span class="logo-sep">.</span></span>
            </div>
            <span class="card-title">${video.title}</span>
        `;

        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-label', `Reproduzir: ${video.title}`);
        card.addEventListener('click', () => openModal(video));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(video);
            }
        });
        gallery.appendChild(card);
    });
}

async function upgradeThumbs() {
    const cards = document.querySelectorAll('.video-card');
    const fetches = VIDEOS.map(async (video, i) => {
        if (video.platform !== 'vimeo') return;
        const hq = await fetchVimeoThumb(video.id, video.orientation);
        if (!hq) return;
        const img = cards[i]?.querySelector('img');
        if (!img) return;
        const tmp = new Image();
        tmp.onload = () => { img.src = hq; };
        tmp.src = hq;
    });
    await Promise.all(fetches);
}

/* ==========================================================
   BUILD: MARQUEE
========================================================== */
function buildMarquee() {
    const inner = document.getElementById('marqueeInner');
    if (!inner) return;

    /* Duplicar para loop contínuo (CSS translateX -50%) */
    const allLogos = [...LOGOS, ...LOGOS];

    allLogos.forEach((filename) => {
        const item = document.createElement('div');
        item.className = 'marquee-item';

        const img = document.createElement('img');
        img.src = LOGOS_PATH + filename;
        img.alt = filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        img.loading = 'lazy';
        /* Esconde logos que não carregarem (arquivo ausente) */
        img.onerror = () => { item.style.display = 'none'; };

        item.appendChild(img);
        inner.appendChild(item);
    });
}

/* ==========================================================
   MODAL DE VÍDEO
========================================================== */
const modal       = document.getElementById('videoModal');
const modalContent = document.getElementById('modalContent');
const videoFrame  = document.getElementById('videoFrame');
const modalClose  = document.getElementById('modalClose');

function openModal(video) {
    let src = '';
    if (video.platform === 'youtube') {
        src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    } else if (video.platform === 'vimeo') {
        src = `https://player.vimeo.com/video/${video.id}?autoplay=1&title=0&byline=0&portrait=0&color=A03828`;
    }

    videoFrame.src = src;
    modalContent.className = `modal-content ${video.orientation}`;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
}

function closeModal() {
    modal.classList.remove('active');
    videoFrame.src = '';
    document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ==========================================================
   NAV — comportamento no scroll
========================================================== */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 72);
}, { passive: true });

/* ==========================================================
   STATS — contador animado
========================================================== */
function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();

    function step(now) {
        const elapsed  = now - start;
        const progress = Math.min(elapsed / duration, 1);
        /* ease-out cúbico */
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

/* ==========================================================
   INTERSECTION OBSERVER — fade-up + counters
========================================================== */
const ioFade = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            ioFade.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

const ioStats = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
            ioStats.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });


/* ==========================================================
   INIT
========================================================== */
document.addEventListener('DOMContentLoaded', () => {
    buildGallery();
    buildMarquee();
    upgradeThumbs();

    /* Observar fade-up (gallery cards + seções) */
    setTimeout(() => {
        document.querySelectorAll('.fade-up').forEach((el) => ioFade.observe(el));
    }, 80);

    /* Observar stats */
    const statsSection = document.querySelector('.stats');
    if (statsSection) ioStats.observe(statsSection);

    /* Adicionar fade-up nas seções secundárias */
    document.querySelectorAll(
        '.about-inner, .testimonials-inner, .contact-inner'
    ).forEach((el) => {
        if (!el.classList.contains('fade-up')) {
            el.classList.add('fade-up');
            ioFade.observe(el);
        }
    });
});

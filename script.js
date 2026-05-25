/* ==========================================================
   joão.films — script principal
========================================================== */

/* ──────────────────────────────────────────────
   CONTATO RÁPIDO
   Atualize o número abaixo com o DDD + número real
   Formato: código do país + DDD + número (sem espaços ou traços)
   Exemplo Teixeira de Freitas: 557388123456789
────────────────────────────────────────────────── */
const WHATSAPP_NUMBER = '5551980481934';

/* ──────────────────────────────────────────────
   DADOS: VÍDEOS
   orientation: 'landscape' (16:9) | 'portrait' (9:16)
   duration: duração em texto livre — ex: '2:34' ou '1 min'
   (Vimeo: preenchido automaticamente via oEmbed)
   (YouTube: preencha manualmente)
────────────────────────────────────────────────── */
const VIDEOS = [
    {
        id: '9n9p6LnreA8',
        platform: 'youtube',
        orientation: 'landscape',
        title: 'produção audiovisual',
        duration: '',
        thumb: 'https://img.youtube.com/vi/9n9p6LnreA8/maxresdefault.jpg',
    },
    {
        id: '1195147661',
        platform: 'vimeo',
        orientation: 'portrait',
        title: 'short film',
        duration: '',
        thumb: 'https://vumbnail.com/1195147661.jpg',
    },
    {
        id: '1195147663',
        platform: 'vimeo',
        orientation: 'portrait',
        title: 'reel social',
        duration: '',
        thumb: 'https://vumbnail.com/1195147663.jpg',
    },
    {
        id: '1195147662',
        platform: 'vimeo',
        orientation: 'portrait',
        title: 'edição criativa',
        duration: '',
        thumb: 'https://vumbnail.com/1195147662.jpg',
    },
    {
        id: 'hXBTnEuP3No',
        platform: 'youtube',
        orientation: 'landscape',
        title: 'tutorial',
        duration: '',
        thumb: 'https://img.youtube.com/vi/hXBTnEuP3No/maxresdefault.jpg',
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
   THUMBNAILS + DURAÇÃO — busca via oEmbed do Vimeo
========================================================== */
function formatDuration(seconds) {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
}

async function fetchVimeoData(id, orientation) {
    try {
        const param = orientation === 'portrait' ? 'height=1920' : 'width=1920';
        const res = await fetch(
            `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${id}&${param}`
        );
        if (!res.ok) return null;
        const data = await res.json();
        return {
            thumb:    data.thumbnail_url || null,
            duration: data.duration ? formatDuration(data.duration) : '',
        };
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
        const data = await fetchVimeoData(video.id, video.orientation);
        if (!data) return;
        if (data.thumb) {
            const img = cards[i]?.querySelector('img');
            if (img) {
                const tmp = new Image();
                tmp.onload = () => { img.src = data.thumb; };
                tmp.src = data.thumb;
            }
        }
        if (data.duration) video.duration = data.duration;
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
const modal          = document.getElementById('videoModal');
const modalContent   = document.getElementById('modalContent');
const videoFrame     = document.getElementById('videoFrame');
const modalClose     = document.getElementById('modalClose');
const modalMetaTitle = document.getElementById('modalMetaTitle');
const modalMetaDur   = document.getElementById('modalMetaDuration');
const modalBarDur    = document.getElementById('modalBarDur');
const whatsappFab    = document.getElementById('whatsappFab');

let _lastFocusedCard = null;

function openModal(video) {
    _lastFocusedCard = document.activeElement;

    let src = '';
    if (video.platform === 'youtube') {
        src = `https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`;
    } else if (video.platform === 'vimeo') {
        src = `https://player.vimeo.com/video/${video.id}?autoplay=1&title=0&byline=0&portrait=0&color=A03828`;
    }

    videoFrame.src = src;
    modalContent.className = `modal-content ${video.orientation}`;

    modalMetaTitle.textContent = video.title;
    if (video.duration) {
        modalMetaDur.textContent = video.duration;
        modalBarDur.hidden = false;
    } else {
        modalBarDur.hidden = true;
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    modalClose.focus();

    whatsappFab.classList.add('visible');
}

function closeModal() {
    modal.classList.remove('active');
    videoFrame.src = '';
    document.body.style.overflow = '';
    whatsappFab.classList.remove('visible');
    if (_lastFocusedCard) { _lastFocusedCard.focus(); _lastFocusedCard = null; }
}

modalClose.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.classList.contains('modal-stage')) closeModal();
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

/* ==========================================================
   NAV — comportamento no scroll + menu mobile
========================================================== */
const nav        = document.getElementById('nav');
const navBurger  = document.getElementById('navBurger');
const navOverlay = document.getElementById('navOverlay');

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 72);
}, { passive: true });

function openMenu() {
    navBurger.classList.add('open');
    navBurger.setAttribute('aria-expanded', 'true');
    navOverlay.classList.add('open');
    navOverlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    navBurger.classList.remove('open');
    navBurger.setAttribute('aria-expanded', 'false');
    navOverlay.classList.remove('open');
    navOverlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

navBurger.addEventListener('click', () => {
    navOverlay.classList.contains('open') ? closeMenu() : openMenu();
});
navOverlay.querySelectorAll('.nav-overlay-link').forEach(link => {
    link.addEventListener('click', closeMenu);
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navOverlay.classList.contains('open')) closeMenu();
});

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
            entry.target.classList.add('in');
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

    const msg = encodeURIComponent('Oi, vi seu portfólio e tenho um projeto!');
    whatsappFab.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;

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

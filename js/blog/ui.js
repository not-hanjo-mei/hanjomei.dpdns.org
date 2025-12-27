/**
 * ui.js - Renders HTML components
 */
import { t, getLocalizedMetadata, getCurrentLang } from './i18n.js';

const app = document.getElementById('app');

// Apply static translated strings (title/headline)
export function applyStaticText() {
    const headlineEl = document.querySelector('.headline');
    if (headlineEl) headlineEl.textContent = t('headline');
    document.title = t('page_title');
}

export function showLoading() {
    app.innerHTML = '<div class="loading-spinner"></div>';
}

export function renderError(msg, context = 'list') {
    // Ensure nav reflects the current view context
    updateNav(context === 'post' ? 'post' : 'list');
    app.innerHTML = `<div class="alert-box"><span class="material-symbols-outlined">error</span> ${msg}</div>`;
}

// Theme Logic
export function initTheme() {
    const toggleBtn = document.getElementById('theme-toggle');
    if (!toggleBtn) return;
    
    const STORAGE_KEY = 'blog_theme';

    // 1. Determine Initial Theme
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem(STORAGE_KEY);
    
    // Check if theme was already applied by inline script on documentElement
    let isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    
    // If not applied yet (fallback), calculate it
    if (!document.documentElement.hasAttribute('data-theme')) {
        isDark = storedTheme === 'dark' || (!storedTheme && systemDark);
    }

    // 2. Apply Theme Function
    const applyTheme = (dark) => {
        if (dark) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    };

    // 3. Initialize
    applyTheme(isDark);

    // 4. Click Listener
    toggleBtn.addEventListener('click', () => {
        isDark = !isDark;
        applyTheme(isDark);
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
    });
}

// Helper to toggle nav button state
function updateNav(state) {
    const btn = document.getElementById('nav-button');
    if (!btn) return;
    const icon = btn.querySelector('.material-symbols-outlined');

    if (state === 'post') {
        // In Post View: Point back to Blog Index
        btn.href = './index.html';
        // btn.setAttribute('aria-label', t('back'));
        if (icon) icon.textContent = 'arrow_back';
    } else {
        // In List View: Point back to Main Site
        btn.href = '../index.html';
        // btn.setAttribute('aria-label', t('main_site'));
        if (icon) icon.textContent = 'home';
    }
}

// Render the List View
export function renderPostList(posts) {
    updateNav('list');
    
    if (posts.length === 0) {
        app.innerHTML = `<p>${t('no_posts')}</p>`;
        return;
    }

    const html = posts.map(post => {
        const title = getLocalizedMetadata(post.meta, 'title');
        const desc = getLocalizedMetadata(post.meta, 'description');
        const date = post.meta.date;
            const thumbMarkup = post.thumbnail
                ? `<img class="card-thumbnail" src="${post.thumbnail}" alt="${title} thumbnail" loading="lazy" decoding="async">`
                : '';

            const absoluteThumb = post.thumbnail ? new URL(post.thumbnail, window.location.href).href : null;
            const cardThumbStyle = absoluteThumb ? `style="--card-thumb: url('${absoluteThumb}')"` : '';
            const cardClass = `post-card${post.thumbnail ? ' has-thumb' : ' no-thumb'}`;

        return `
            <a href="?slug=${post.slug}" class="${cardClass}" ${cardThumbStyle}>
                ${thumbMarkup ? `<div class="card-media">${thumbMarkup}</div>` : ''}
                <div class="card-content">
                    <h2 class="card-title">${title}</h2>
                    <div class="card-meta">
                        <div class="meta-row">
                            <span class="material-symbols-outlined" style="font-size:16px;">calendar_today</span>
                            <span>${date}</span>
                        </div>
                        <div class="meta-tags">${post.meta.tags.join(', ')}</div>
                    </div>
                    <p class="card-description">${desc}</p>
                </div>
            </a>
        `;
    }).join('');

    app.innerHTML = html;
}

// Render the Single Post View
export function renderPostView(markdown, metadata, isFallback, thumbnailUrl, slug) {
    updateNav('post');

    // Sanitize and Parse Markdown
    const cleanHTML = DOMPurify.sanitize(marked.parse(markdown));
    const title = getLocalizedMetadata(metadata, 'title');
    const date = metadata.date;

    // Set HTML title to "{post title} - {blog title}" for better context in tabs/share previews
    document.title = `${title} - ${t('page_title')}`;

    let fallbackBanner = '';
    if (isFallback) {
        fallbackBanner = `
            <div class="alert-box">
                <span class="material-symbols-outlined">translate</span>
                <span>${t('fallback_message')}</span>
            </div>
        `;
    }

    const hero = thumbnailUrl
        ? `<div class="hero-image"><img src="${thumbnailUrl}" alt="${title} thumbnail" loading="lazy" decoding="async"></div>`
        : '';

    app.innerHTML = `
        <article>
            ${fallbackBanner}
            <header style="margin-bottom: 24px; border-bottom: 1px solid var(--md-sys-color-outline); padding-bottom: 16px;">
                ${hero}
                <h1 style="color: var(--md-sys-color-primary); margin-top: 0;">${title}</h1>
                <div class="post-meta">
                    <div class="meta-row">
                        <span class="material-symbols-outlined" style="font-size:18px;">calendar_today</span>
                        <span>${date}</span>
                    </div>
                    <div class="meta-tags">${metadata.tags.join(', ')}</div>
                </div>
            </header>
            <div class="markdown-body">
                ${cleanHTML}
            </div>
        </article>
    `;

    const markdownEl = app.querySelector('.markdown-body');
    if (markdownEl && slug) {
        markdownEl.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src');
            const isAbsolute = src && (/^(?:[a-z]+:)?\/\//i.test(src) || src.startsWith('/') || /^[a-z]+:/i.test(src));
            if (src && !isAbsolute) {
                img.src = `content/${slug}/${src}`;
            }
        });
    }

    if (markdownEl && window.renderMathInElement) {
        try {
            window.renderMathInElement(markdownEl, {
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '\\[', right: '\\]', display: true },
                    { left: '$', right: '$', display: false },
                    { left: '\\(', right: '\\)', display: false },
                ],
                throwOnError: false,
            });
        } catch (error) {
            console.error('KaTeX rendering failed', error);
        }
    }
}
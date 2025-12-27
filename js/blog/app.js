/**
 * app.js - Main Controller
 */
import * as API from './api.js';
import * as UI from './ui.js';
import * as I18n from './i18n.js';

const LANGUAGES = [
    { code: 'en-US', label: 'English (United States)' },
    { code: 'ja-JP', label: '日本語（日本）' },
    { code: 'ru-RU', label: 'Русский (Россия)' },
    { code: 'uk-UA', label: 'Українська (Україна)' },
    { code: 'zh-CN', label: '中文（简体，中国）' },
    { code: 'zh-TW', label: '中文（繁體，台灣）' },
];

// Initialize
(async function init() {
    // 0. Initialize Theme
    UI.initTheme();

    // 1. Setup Language Menu
    initLanguageMenu();

    // 2. Load UI Strings
    const strings = await API.getUIStrings(I18n.getCurrentLang());
    I18n.setUIStrings(strings);

    // 3. Apply static text translations (title, headline)
    UI.applyStaticText();

    // 4. Router logic
    handleRoute();
})();

function initLanguageMenu() {
    const button = document.getElementById('language-button');
    const menu = document.getElementById('language-menu');
    if (!button || !menu) return;

    const getLabel = (code) => LANGUAGES.find((lang) => lang.code === code)?.label || code;

    const closeMenu = () => {
        menu.hidden = true;
        document.removeEventListener('click', handleOutsideClick);
        document.removeEventListener('keydown', handleKeydown);
    };

    const handleOutsideClick = (event) => {
        if (!menu.contains(event.target) && !button.contains(event.target)) {
            closeMenu();
        }
    };

    const handleKeydown = (event) => {
        if (event.key === 'Escape') closeMenu();
    };

    const renderMenu = () => {
        const current = I18n.getCurrentLang();
        menu.innerHTML = LANGUAGES.map((lang) => `
            <button class="language-option ${lang.code === current ? 'active' : ''}" data-lang="${lang.code}">
                <span class="lang-label">${lang.label}</span>
                ${lang.code === current ? '<span class="material-symbols-outlined" style="font-size:18px;">check</span>' : ''}
            </button>
        `).join('');
    };

    button.title = `Language: ${getLabel(I18n.getCurrentLang())}`;
    button.setAttribute('aria-label', `Language: ${getLabel(I18n.getCurrentLang())} (change)`);

    const openMenu = () => {
        renderMenu();
        menu.hidden = false;
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleKeydown);
    };

    button.addEventListener('click', () => {
        if (menu.hidden) {
            openMenu();
        } else {
            closeMenu();
        }
    });

    menu.addEventListener('click', async (event) => {
        const target = event.target.closest('.language-option');
        if (!target) return;
        const langCode = target.dataset.lang;
        if (langCode === I18n.getCurrentLang()) {
            closeMenu();
            return;
        }
        await I18n.setLang(langCode);
        location.reload();
    });

    menu.hidden = true;
}

async function handleRoute() {
    UI.showLoading();
    
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (slug) {
        await loadPost(slug);
    } else {
        await loadIndex();
    }
}

async function loadIndex() {
    const slugs = await API.getPostsIndex();
    const postsWithMeta = [];

    // Fetch metadata for all posts in parallel
    await Promise.all(slugs.map(async (slug) => {
        const meta = await API.getPostMetadata(slug);
        if (meta) {
            const thumbnail = await API.getPostThumbnail(slug);
            postsWithMeta.push({ slug, meta, thumbnail });
        }
    }));

    // Sort by date descending
    postsWithMeta.sort((a, b) => new Date(b.meta.date) - new Date(a.meta.date));
    
    UI.renderPostList(postsWithMeta);
}

async function loadPost(slug) {
    const meta = await API.getPostMetadata(slug);
    if (!meta) {
        UI.renderError("Post not found.", 'post');
        return;
    }

    const thumbnail = await API.getPostThumbnail(slug);

    const currentLang = I18n.getCurrentLang();
    
    // 1. Try fetching content in preferred language
    let content = await API.getPostContent(slug, currentLang);
    let isFallback = false;

    // 2. If null, force fallback to en-US
    if (!content) {
        console.warn(`Content for ${slug} missing in ${currentLang}, falling back.`);
        content = await API.getPostContent(slug, 'en-US');
        isFallback = true;
    }

    if (!content) {
        UI.renderError(I18n.t('content_unavailable'), 'post');
        return;
    }

    // 3. Render
    UI.renderPostView(content, meta, isFallback, thumbnail, slug);
}
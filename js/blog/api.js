/**
 * api.js - Handles all network requests
 */

const BASE_PATH = './'; // Relative to blog/index.html
const THUMB_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png', 'gif', 'avif'];
const thumbnailCache = new Map();

// Fetch the list of post slugs
export async function getPostsIndex() {
    try {
        const response = await fetch(`${BASE_PATH}posts-index.json`);
        if (!response.ok) throw new Error('Failed to load index');
        return await response.json();
    } catch (e) {
        console.error(e);
        return [];
    }
}

// Fetch metadata for a specific post slug
export async function getPostMetadata(slug) {
    try {
        const response = await fetch(`${BASE_PATH}content/${slug}/metadata.json`);
        if (!response.ok) return null;
        return await response.json();
    } catch (e) {
        return null;
    }
}

// Fetch thumbnail URL if available (tries common formats, caches result)
export async function getPostThumbnail(slug) {
    if (thumbnailCache.has(slug)) return thumbnailCache.get(slug);

    for (const ext of THUMB_EXTENSIONS) {
        const url = `${BASE_PATH}content/${slug}/thumb.${ext}`;

        // Try lightweight HEAD first; fall back to GET if HEAD unsupported
        try {
            const headRes = await fetch(url, { method: 'HEAD' });
            if (headRes.ok) {
                thumbnailCache.set(slug, url);
                return url;
            }
            if (headRes.status === 405 || headRes.status === 501) {
                const getRes = await fetch(url, { method: 'GET' });
                if (getRes.ok) {
                    getRes.body?.cancel?.();
                    thumbnailCache.set(slug, url);
                    return url;
                }
            }
        } catch (e) {
            // Continue trying other extensions
        }
    }

    thumbnailCache.set(slug, null);
    return null;
}

// Fetch the raw Markdown content
export async function getPostContent(slug, langCode) {
    const path = `${BASE_PATH}content/${slug}/post_${langCode}.md`;
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('404');
        return await response.text();
    } catch (e) {
        return null; // Return null to signal fallback needed
    }
}

// Fetch UI translation strings
export async function getUIStrings(langCode) {
    // Note: Jumping up one directory to access /i18n/
    try {
        const response = await fetch(`../i18n/blog/${langCode}.json`);
        if (!response.ok) throw new Error('Missing Lang File');
        return await response.json();
    } catch (e) {
        // Fallback to English UI if file missing
        const fallback = await fetch(`../i18n/blog/en-US.json`);
        return await fallback.json();
    }
}
/**
 * i18n.js - Logic for language selection and data fallback
 */

export const DEFAULT_LANG = 'en-US';
let currentLang = localStorage.getItem('blog_lang') || DEFAULT_LANG;
let uiStrings = {};

export function getCurrentLang() {
    return currentLang;
}

export async function setLang(langCode) {
    currentLang = langCode;
    localStorage.setItem('blog_lang', langCode);
    return currentLang;
}

export function setUIStrings(strings) {
    uiStrings = strings;
}

// Get a UI string (e.g., "read_more")
export function t(key) {
    return uiStrings[key] || key;
}

// Metadata Fallback Logic:
// Returns content in target lang, or falls back to en-US
export function getLocalizedMetadata(metadata, field) {
    if (!metadata[field]) return '';
    return metadata[field][currentLang] || metadata[field][DEFAULT_LANG] || '';
}

// Checks if the current language matches the default
export function isDefaultLang() {
    return currentLang === DEFAULT_LANG;
}
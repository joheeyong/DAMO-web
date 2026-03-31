export function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '') || '';
}

export function decodeText(text) {
  if (!text) return '';
  try {
    return decodeURIComponent(text);
  } catch {
    return text;
  }
}

export function getVideoId(item) {
  if (item.platform === 'shorts') {
    return item.id.replace('shorts-', '');
  }
  return item.id.replace('yt-', '');
}

export function isFlutterApp() {
  return typeof window !== 'undefined' && !!window.DamoReady;
}

export function getLocalBookmarks() {
  try { return JSON.parse(localStorage.getItem('damo_bookmarks') || '[]'); } catch { return []; }
}

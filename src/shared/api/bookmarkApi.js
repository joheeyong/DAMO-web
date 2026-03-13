import { apiClient } from '../../core/api/apiClient';

function isLoggedIn() {
  return !!localStorage.getItem('auth_token');
}

function getLocalBookmarks() {
  try { return JSON.parse(localStorage.getItem('damo_bookmarks') || '[]'); } catch { return []; }
}

function setLocalBookmarks(bookmarks) {
  localStorage.setItem('damo_bookmarks', JSON.stringify(bookmarks));
  window.dispatchEvent(new Event('bookmarks-changed'));
}

export const bookmarkApi = {
  async list() {
    if (isLoggedIn()) {
      try {
        return await apiClient.get('/api/bookmarks');
      } catch {
        return getLocalBookmarks();
      }
    }
    return getLocalBookmarks();
  },

  async add(item) {
    // Always save to localStorage as cache
    const local = getLocalBookmarks();
    if (!local.some((b) => b.id === item.id)) {
      local.unshift({
        id: item.id,
        platform: item.platform,
        title: item.title,
        description: item.description,
        link: item.link,
        image: item.image,
        author: item.author,
        date: item.date,
        extra: item.extra,
        savedAt: new Date().toISOString(),
      });
      setLocalBookmarks(local);
    }

    if (isLoggedIn()) {
      try {
        await apiClient.post('/api/bookmarks', {
          contentId: item.id,
          platform: item.platform,
          title: item.title,
          description: item.description,
          link: item.link,
          image: item.image,
          author: item.author,
          date: item.date,
          extra: item.extra,
        });
      } catch { /* server save failed, localStorage still has it */ }
    }
  },

  async remove(contentId) {
    // Remove from localStorage
    const local = getLocalBookmarks().filter((b) => b.id !== contentId);
    setLocalBookmarks(local);

    if (isLoggedIn()) {
      try {
        await apiClient.del(`/api/bookmarks/${encodeURIComponent(contentId)}`);
      } catch { /* silent */ }
    }
  },

  isBookmarked(contentId) {
    return getLocalBookmarks().some((b) => b.id === contentId);
  },

  async sync() {
    if (!isLoggedIn()) return;
    try {
      const local = getLocalBookmarks();
      const result = await apiClient.post('/api/bookmarks/sync', local);
      if (result.bookmarks) {
        setLocalBookmarks(result.bookmarks);
      }
    } catch { /* silent */ }
  },

  clearLocal() {
    localStorage.removeItem('damo_bookmarks');
    window.dispatchEvent(new Event('bookmarks-changed'));
  },

  async clearAll() {
    // Clear local
    this.clearLocal();
    // Clear server
    if (isLoggedIn()) {
      try {
        const bookmarks = await apiClient.get('/api/bookmarks');
        for (const b of bookmarks) {
          await apiClient.del(`/api/bookmarks/${encodeURIComponent(b.id)}`);
        }
      } catch { /* silent */ }
    }
  },
};

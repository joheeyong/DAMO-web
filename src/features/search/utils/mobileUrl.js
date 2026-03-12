export const IFRAME_BLOCKED = ['news', 'kin', 'cafe', 'shop', 'book', 'webkr'];

export function toMobileUrl(url) {
  if (!url) return url;
  try {
    const u = new URL(url);
    if (u.hostname === 'blog.naver.com') { u.hostname = 'm.blog.naver.com'; return u.toString(); }
    if (u.hostname === 'news.naver.com' || u.hostname === 'n.news.naver.com') { u.hostname = 'm.news.naver.com'; return u.toString(); }
    if (u.hostname === 'cafe.naver.com') { u.hostname = 'm.cafe.naver.com'; return u.toString(); }
    if (u.hostname === 'kin.naver.com') { u.hostname = 'm.kin.naver.com'; return u.toString(); }
    if (u.hostname === 'search.shopping.naver.com') { u.hostname = 'msearch.shopping.naver.com'; return u.toString(); }
    if (u.hostname === 'blog.daum.net') { u.hostname = 'm.blog.daum.net'; return u.toString(); }
    if (u.hostname === 'cafe.daum.net') { u.hostname = 'm.cafe.daum.net'; return u.toString(); }
    if (u.hostname === 'search.daum.net') { u.hostname = 'm.search.daum.net'; return u.toString(); }
    if (u.hostname === 'brunch.co.kr') { u.hostname = 'm.brunch.co.kr'; return u.toString(); }
  } catch { /* invalid URL */ }
  return url;
}

export function isFlutterApp() {
  return /DAMO-App/i.test(navigator.userAgent);
}

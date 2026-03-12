import './LegalPage.css';

function PrivacyPage() {
  return (
    <div className="legal-page">
      <h1>Privacy Policy</h1>
      <p className="legal-date">Last updated: March 12, 2026</p>

      <h2>1. Information We Collect</h2>
      <p>DAMO collects minimal data to provide the service. We may collect anonymous usage analytics (page views, search queries, content interactions) through Firebase Analytics to improve the service.</p>

      <h2>2. How We Use Information</h2>
      <p>Collected data is used solely to improve the service, analyze usage patterns, and fix technical issues. We do not sell or share personal data with third parties.</p>

      <h2>3. Third-Party Services</h2>
      <p>DAMO integrates with third-party APIs (YouTube, Naver, Reddit, TikTok). When you click through to external content, those platforms' privacy policies apply.</p>

      <h2>4. Cookies and Analytics</h2>
      <p>We use Firebase Analytics (Google Analytics 4) which may use cookies to collect anonymous usage data. You can disable cookies in your browser settings.</p>

      <h2>5. Data Retention</h2>
      <p>Analytics data is retained according to Firebase Analytics default retention policies. We do not store personal search history on our servers.</p>

      <h2>6. Children's Privacy</h2>
      <p>DAMO is not intended for children under 13. We do not knowingly collect personal information from children.</p>

      <h2>7. Changes to Privacy Policy</h2>
      <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>

      <h2>8. Contact</h2>
      <p>For privacy-related questions, please contact us at wh2dyd@naver.com.</p>
    </div>
  );
}

export default PrivacyPage;

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { updateInterests } from '../slice/authSlice';
import { INTEREST_OPTIONS } from '../../../shared/constants/interests';
import './OnboardingInterestsPage.css';

function OnboardingInterestsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [selected, setSelected] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const toggleInterest = (key) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (selected.length === 0) return;
    setSaving(true);
    await dispatch(updateInterests(selected)).unwrap();
    navigate('/search');
  };

  const handleSkip = () => {
    navigate('/search');
  };

  const firstName = user.name?.split(' ')[0] || user.name || '회원';

  return (
    <div className="onboarding-page">
      <div className="onboarding-card">
        <div className="onboarding-welcome">
          <h1 className="onboarding-title">
            환영합니다, {firstName}님!
          </h1>
          <p className="onboarding-desc">
            관심사를 선택하면 맞춤 콘텐츠를 추천해 드려요
          </p>
        </div>

        <div className="onboarding-grid">
          {INTEREST_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              className={`onboarding-chip ${selected.includes(opt.key) ? 'selected' : ''}`}
              onClick={() => toggleInterest(opt.key)}
            >
              <span className="onboarding-chip-emoji">{opt.emoji}</span>
              <span>{opt.key}</span>
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <p className="onboarding-count">{selected.length}개 선택됨</p>
        )}

        <div className="onboarding-actions">
          <button className="onboarding-save" onClick={handleSave} disabled={saving || selected.length === 0}>
            {saving ? '저장 중...' : '시작하기'}
          </button>
          <button className="onboarding-skip" onClick={handleSkip}>
            건너뛰기
          </button>
        </div>

        <p className="onboarding-hint">나중에 프로필에서 언제든 변경할 수 있어요</p>
      </div>
    </div>
  );
}

export default OnboardingInterestsPage;

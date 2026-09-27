import { ArrowUpRight, Sparkles } from 'lucide-react';
import { percent } from '../utils/assignments';

function StudyIllustration() {
  return (
    <svg className="study-illustration" viewBox="0 0 280 180" fill="none" aria-hidden="true">
      <ellipse cx="145" cy="158" rx="110" ry="11" fill="#dcd6f4" />
      <path d="M44 117l122-19 74 26-124 23z" fill="#7960c1" />
      <path d="M44 117v13l73 29 123-23v-12l-124 23z" fill="#aa91dd" />
      <path d="M54 124l63 24 113-21v6l-113 21-63-24z" fill="#fff9ee" />
      <path d="M64 85l104-16 67 26-108 23z" fill="#c6b0e8" />
      <path d="M64 85v18l63 26 108-25v-9l-108 23z" fill="#b098d7" />
      <path d="M71 93l56 22 99-21v7l-99 22-56-22z" fill="#fffaf0" />
      <rect
        x="89"
        y="25"
        width="81"
        height="97"
        rx="8"
        transform="rotate(-13 89 25)"
        fill="#faf8ff"
        stroke="#d4c9ec"
        strokeWidth="2"
      />
      <path
        d="M108 44l38-9M110 53l43-10M118 82l35-8M120 91l28-7"
        stroke="#c7b6e4"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="160" cy="43" r="22" fill="#8070c6" />
      <path
        d="M150 42l7 7 13-14"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M207 39l-8 59" stroke="#e1a36d" strokeWidth="9" strokeLinecap="round" />
      <path d="M199 98l-3 15 9-12z" fill="#775a73" />
      <path
        d="M50 43v13M44 49h12M218 70v10M213 75h10"
        stroke="#b59bdc"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="66" cy="65" r="3" fill="#d2b0df" />
      <circle cx="188" cy="17" r="3" fill="#b99bce" />
    </svg>
  );
}

export default function Hero({ admin, completed, total, onProgress }) {
  const progress = percent(completed, total);
  return (
    <div className="hero-grid">
      <section className="hero-banner">
        <div className="hero-copy">
          <span className="eyebrow">
            <Sparkles size={13} />
            {admin ? 'MAKE ROOM FOR GREAT WORK' : 'A LITTLE FOCUS. A LOT OF POSSIBILITY.'}
          </span>
          <h2>
            {admin ? (
              <>
                Inspire learning.
                <br />
                Celebrate progress.
              </>
            ) : (
              <>
                Your next great idea
                <br />
                starts here.
              </>
            )}
          </h2>
          <p>
            {admin
              ? 'Create meaningful assignments and help every student move forward.'
              : 'Stay curious, keep creating, and take your learning one assignment at a time.'}
          </p>
          <button onClick={onProgress} className="hero-link">
            {admin ? 'Explore student progress' : 'See your progress'}
            <ArrowUpRight size={16} />
          </button>
        </div>
        <StudyIllustration />
      </section>
      <section className="completion-card">
        <span className="eyebrow">{admin ? 'SUBMISSION OVERVIEW' : 'YOUR LEARNING JOURNEY'}</span>
        <div className="completion-center">
          <div
            className="progress-ring"
            style={{ '--progress': `${progress * 3.6}deg` }}
            role="progressbar"
            aria-label="Overall completion"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div>
              <strong>
                {progress}
                <span>%</span>
              </strong>
              <small>completed</small>
            </div>
          </div>
          <div className="completion-copy">
            <strong>
              {completed} of {total}
            </strong>
            <span>{admin ? 'submissions received' : 'assignments completed'}</span>
            <p>
              {progress === 100 && total ? 'All caught up. Well done!' : 'Every step counts. ✨'}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  CheckCheck,
  ChevronDown,
  CircleCheck,
  Clock3,
  Code2,
  Layers,
  Menu,
  Play,
  Plus,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { Brand, Avatar, CourseArtwork } from '../components/UI';
import { useSession } from '../context/SessionContext';

const people = [
  { name: 'Maya Sharma', initials: 'MS' },
  { name: 'Arjun Mehta', initials: 'AM' },
  { name: 'Isha Nair', initials: 'IN' },
];
function WorkspacePreview() {
  return (
    <div className="hero-scene" aria-label="Preview of the student workspace">
      <span className="scene-orbit orbit-one" />
      <span className="scene-orbit orbit-two" />
      <span className="scene-spark">✳</span>
      <div className="preview-window">
        <div className="preview-chrome">
          <span />
          <span />
          <span />
          <small>your little corner of campus</small>
          <Layers size={13} />
        </div>
        <div className="preview-body">
          <div className="preview-side">
            <span className="preview-logo">
              <Layers size={21} />
            </span>
            <i />
            <i />
            <i />
            <span className="preview-side-avatar">MS</span>
          </div>
          <div className="preview-content">
            <div className="preview-greeting">
              <div>
                <span>LET’S MAKE TODAY COUNT</span>
                <h3>
                  Hello, Maya <span>✦</span>
                </h3>
                <p>Good things start with a little focus.</p>
              </div>
              <span className="preview-date">AUTUMN ’26</span>
            </div>
            <div className="preview-course">
              <div>
                <span className="preview-course-code">CS 204 · WEB DEVELOPMENT</span>
                <h4>
                  Big ideas.
                  <br />
                  One component at a time.
                </h4>
                <span>
                  3 assignments <ArrowUpRight size={12} />
                </span>
              </div>
              <CourseArtwork type="code" />
            </div>
            <div className="preview-section-title">
              Your next steps <span>View all ↗</span>
            </div>
            <div className="preview-task">
              <span className="preview-task-icon">
                <Code2 size={17} />
              </span>
              <div>
                <strong>Build a responsive portfolio</strong>
                <span>Individual · Due in 3 days</span>
              </div>
              <span className="preview-status">To do</span>
            </div>
            <div className="preview-task">
              <span className="preview-task-icon mint">
                <CheckCheck size={17} />
              </span>
              <div>
                <strong>JavaScript fundamentals</strong>
                <span>A little progress, acknowledged.</span>
              </div>
              <CircleCheck size={16} className="preview-check" />
            </div>
          </div>
        </div>
      </div>
      <div className="floating-group">
        <span className="floating-icon">
          <Users size={19} />
        </span>
        <div>
          <strong>Better, together.</strong>
          <span>Your group is ready to create.</span>
        </div>
        <div className="avatar-stack">
          {people.slice(0, 2).map((person) => (
            <Avatar key={person.name} person={person} />
          ))}
        </div>
      </div>
      <div className="floating-done">
        <span>
          <Check size={18} />
        </span>
        <div>
          <strong>One less thing on your mind.</strong>
          <p>Submission acknowledged ✓</p>
        </div>
      </div>
      <span className="scene-caption">a little less juggling. a lot more doing.</span>
    </div>
  );
}

export default function Landing() {
  const [menu, setMenu] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { authenticate, workspace } = useSession();
  const navigate = useNavigate();
  async function demo() {
    setBusy(true);
    setError('');
    try {
      await authenticate('demo', { profile: 'maya' });
      navigate('/app/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const faq = [
    [
      'What can I do with Joineazy?',
      'Keep your courses, deadlines, groups, and submission acknowledgments in one place. Students can follow their progress, while professors create assignments and see who has acknowledged their work.',
    ],
    [
      'How do group submissions work?',
      'Form or join a group for your course. After the work is uploaded, the group leader acknowledges once and every member sees the same status. Acknowledged groups are locked so the record stays reliable.',
    ],
    [
      'Does Joineazy upload my files?',
      'Your work stays in the OneDrive folder shared by your professor. Joineazy records your acknowledgment and its timestamp after you submit there. It doesn’t upload or verify files.',
    ],
    [
      'Can I explore without creating an account?',
      'Absolutely. Use the student or professor demo from the sign-in page. These are shared sample accounts, so you can try the complete flow before creating your own account.',
    ],
  ];
  return (
    <div className="landing-v2 min-h-screen">
      <a href="#landing-main" className="skip-v2">
        Skip to content
      </a>
      <div className="announcement-v2">
        <span className="announcement-dot" />A little less chaos. A little more campus life.
        <ArrowUpRight size={13} />
      </div>
      <header className="landing-nav container-v2">
        <Brand />
        <nav className={menu ? 'landing-links open' : 'landing-links'} aria-label="Main navigation">
          <a href="#features" onClick={() => setMenu(false)}>
            Why Joineazy
          </a>
          <a href="#how-it-works" onClick={() => setMenu(false)}>
            How it works
          </a>
          <a href="#questions" onClick={() => setMenu(false)}>
            A few questions
          </a>
        </nav>
        <div className="landing-nav-actions">
          <Link className="login-link" to={workspace ? '/app' : '/login'}>
            {workspace ? 'My workspace' : 'Log in'}
            <ArrowUpRight size={14} />
          </Link>
          <Link className="btn-v2 primary small" to="/register">
            Get started
            <ArrowRight size={15} />
          </Link>
          <button
            className="mobile-nav-toggle icon-btn-v2"
            aria-label={menu ? 'Close navigation' : 'Open navigation'}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="landing-main">
        <section className="landing-hero container-v2">
          <div className="hero-v2-copy">
            <span className="hero-pill">
              <span>✦</span> YOUR CAMPUS. A LITTLE MORE CONNECTED.
            </span>
            <h1>
              Less chaos.
              <br />
              More <em>learning.</em>
              <svg viewBox="0 0 310 18" aria-hidden="true">
                <path
                  d="M3 12Q128-4 306 9M28 16Q160 4 273 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </h1>
            <p>
              Courses, assignments, and the people you learn with.
              <br className="desktop-break" /> Finally, a space that brings it all together.
            </p>
            <div className="hero-v2-actions">
              <Link className="btn-v2 primary large" to="/register">
                Find your focus
                <ArrowUpRight size={19} />
              </Link>
              <button className="btn-v2 ghost large" onClick={demo} disabled={busy}>
                <span className="play-circle">
                  <Play size={12} fill="currentColor" />
                </span>
                {busy ? 'Opening your workspace…' : 'Take a look inside'}
              </button>
            </div>
            {error && (
              <p role="alert" className="error-v2">
                {error}
              </p>
            )}
            <div className="hero-v2-footnote">
              <div className="avatar-stack">
                {people.map((person) => (
                  <Avatar person={person} key={person.name} />
                ))}
              </div>
              <span>
                For curious minds.
                <br />
                <strong>And the people who guide them.</strong>
              </span>
            </div>
          </div>
          <WorkspacePreview />
        </section>
        <div className="landing-values container-v2">
          <span>MORE SPACE FOR WHAT MATTERS</span>
          <div>
            <CircleCheck size={19} />
            Clarity over clutter
          </div>
          <div>
            <Users size={19} />A little more together
          </div>
          <div>
            <Sparkles size={19} />
            Progress you can see
          </div>
        </div>
        <section id="features" className="landing-features container-v2">
          <div className="landing-section-heading">
            <div>
              <span className="eyebrow-v2">A GOOD DAY STARTS WITH A CLEAR HEAD</span>
              <h2>
                Everything in its place.
                <br />
                <em>You, in your element.</em>
              </h2>
            </div>
            <p>
              No more scattered links or “did we submit that?”
              <br />
              Just a calmer way to get good work done.
            </p>
          </div>
          <div className="feature-grid-v2">
            <article className="feature-course lavender">
              <div className="feature-mini-course">
                <span>
                  <Code2 size={24} />
                </span>
                <div>
                  <small>CS 204</small>
                  <strong>Web Development</strong>
                </div>
                <ArrowUpRight size={18} />
              </div>
              <div className="feature-line">
                <span>Build a responsive portfolio</span>
                <small>Individual</small>
              </div>
              <div className="feature-line">
                <span>The campus companion</span>
                <small>Group</small>
              </div>
              <span className="feature-number">01 / YOUR COURSES</span>
              <h3>
                A home for every
                <br />
                “what’s next?”
              </h3>
              <p>
                Briefs, deadlines, and submission links.
                <br />
                Everything you need, right where it belongs.
              </p>
            </article>
            <article className="feature-group peach">
              <div className="feature-avatars">
                {people.map((person, index) => (
                  <span key={person.name} style={{ '--offset': `${index * 8 - 8}deg` }}>
                    <Avatar person={person} size="large" />
                    <small>{person.name.split(' ')[0]}</small>
                    {index === 0 && <i>Leader ✦</i>}
                  </span>
                ))}
              </div>
              <span className="feature-number">02 / YOUR PEOPLE</span>
              <h3>
                Great work is
                <br />a team thing.
              </h3>
              <p>
                Find your people. Share an invite code.
                <br />
                One leader’s acknowledgment keeps everyone in sync.
              </p>
            </article>
            <article className="feature-progress mint">
              <div className="feature-progress-visual">
                <div className="feature-ring">
                  <CheckCheck size={30} />
                </div>
                <span>
                  <strong>One step closer.</strong>
                  <small>3 of 4 assignments acknowledged</small>
                </span>
              </div>
              <span className="feature-number">03 / YOUR PROGRESS</span>
              <h3>
                Small wins.
                <br />A bigger picture.
              </h3>
              <p>
                See what’s done and what needs your attention.
                <br />
                There’s a little momentum in every checkmark.
              </p>
            </article>
          </div>
        </section>
        <section id="how-it-works" className="how-section">
          <div className="container-v2 how-grid">
            <div className="how-intro">
              <span className="eyebrow-v2">LESS FRICTION. MORE FORWARD.</span>
              <h2>
                From “where is it?”
                <br />
                to <em>“all done.”</em>
              </h2>
              <p>
                One simple rhythm, whether you’re
                <br />
                learning something new or teaching it.
              </p>
              <Link to="/login" className="text-link-v2">
                Step into your workspace
                <ArrowRight size={17} />
              </Link>
              <span className="how-doodle" aria-hidden="true">
                ↳
              </span>
            </div>
            <div className="how-steps">
              {[
                {
                  title: 'Make yourself at home.',
                  text: 'Sign in as a student or professor. Your courses and your next steps are waiting.',
                  icon: Layers,
                },
                {
                  title: 'Do your thing. Together, too.',
                  text: 'Open a brief, form your group, and bring your ideas to life. Submit your work through OneDrive.',
                  icon: Users,
                },
                {
                  title: 'Give it a little checkmark.',
                  text: 'Confirm your submission. Your progress updates, your professor is in the loop, and your mind is a little clearer.',
                  icon: CheckCheck,
                },
              ].map(({ title, text, icon: Icon }, index) => (
                <article key={title}>
                  <span className="step-number">0{index + 1}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <Icon size={23} />
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="professor-section container-v2">
          <div className="professor-preview">
            <div className="professor-preview-top">
              <span className="course-icon-v2 lavender">
                <Users size={24} />
              </span>
              <span>THE CLASSROOM, AT A GLANCE</span>
              <span className="live-dot" />
            </div>
            <h3>Every student. Every step.</h3>
            {[
              { name: 'Maya Sharma', initials: 'MS', value: 75 },
              { name: 'Arjun Mehta', initials: 'AM', value: 50 },
              { name: 'Rohan Patil', initials: 'RP', value: 100 },
            ].map((person) => (
              <div className="professor-preview-person" key={person.name}>
                <Avatar person={person} />
                <span>{person.name}</span>
                <div>
                  <i style={{ width: `${person.value}%` }} />
                </div>
                <small>{person.value}%</small>
              </div>
            ))}
            <span className="preview-example-label">An illustration of your classroom view</span>
          </div>
          <div className="professor-copy">
            <span className="eyebrow-v2">FOR THE PEOPLE WHO INSPIRE PROGRESS</span>
            <h2>
              More teaching.
              <br />
              <em>Less chasing.</em>
            </h2>
            <p>
              A thoughtful workspace for professors, too. Create clear assignments, choose
              individual or group submissions, and see the whole classroom’s progress at a glance.
            </p>
            <Link to="/register?role=professor" className="btn-v2 secondary">
              Make room for great work
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </section>
        <section id="questions" className="faq-section container-v2">
          <div>
            <span className="eyebrow-v2">BEFORE YOU MAKE YOURSELF AT HOME</span>
            <h2>
              A few good
              <br />
              <em>questions.</em>
            </h2>
          </div>
          <div className="faq-list">
            {faq.map(([question, answer]) => (
              <details key={question}>
                <summary>
                  {question}
                  <Plus size={19} />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>
        <section className="landing-cta container-v2">
          <span className="cta-star" aria-hidden="true">
            ✳
          </span>
          <span className="eyebrow-v2">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>
            Good things happen
            <br />
            when things <em>come together.</em>
          </h2>
          <Link to="/register" className="btn-v2 light large">
            Let’s make space for learning
            <ArrowUpRight size={18} />
          </Link>
          <p>Your courses. Your people. Your pace.</p>
        </section>
      </main>
      <footer className="landing-footer container-v2">
        <div>
          <Brand />
          <p>A little clarity. A lot of possibility.</p>
        </div>
        <div>
          <a href="#features">The experience</a>
          <a href="#questions">Questions</a>
          <Link to="/login">
            Your workspace
            <ArrowUpRight size={13} />
          </Link>
        </div>
        <span>
          Made for learning, together.
          <br />© {new Date().getFullYear()} Joineazy
        </span>
      </footer>
    </div>
  );
}

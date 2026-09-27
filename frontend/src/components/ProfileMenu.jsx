import { useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Users } from 'lucide-react';

export default function ProfileMenu({ user, profiles, onSelect }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const items = useRef([]);
  const menuId = useId();
  const ordered = [
    ...profiles.filter((profile) => profile.role === 'student'),
    ...profiles.filter((profile) => profile.role === 'admin'),
  ];

  useEffect(() => {
    if (!open) return;
    const selected = items.current.find((item) => item?.getAttribute('aria-checked') === 'true');
    (selected || items.current[0])?.focus();
    const dismiss = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', dismiss);
    document.addEventListener('focusin', dismiss);
    return () => {
      document.removeEventListener('pointerdown', dismiss);
      document.removeEventListener('focusin', dismiss);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    trigger.current?.focus();
  };
  function navigate(event) {
    const index = items.current.indexOf(document.activeElement);
    const targets = {
      ArrowDown: (index + 1) % ordered.length,
      ArrowUp: (index - 1 + ordered.length) % ordered.length,
      Home: 0,
      End: ordered.length - 1,
    };
    if (event.key in targets) {
      event.preventDefault();
      items.current[targets[event.key]]?.focus();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      close();
    }
  }

  return (
    <div className="profile-menu" ref={root}>
      <button
        ref={trigger}
        className={`profile-trigger ${open ? 'is-open' : ''}`}
        aria-label="Switch demo profile"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen(!open)}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp'].includes(event.key)) {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <span className="avatar small">{user.initials}</span>
        <span className="profile-trigger-copy">
          <strong>{user.name}</strong>
          <span>{user.role === 'admin' ? 'Professor' : 'Student'}</span>
        </span>
        <ChevronDown className="profile-chevron" size={15} />
      </button>
      {open && (
        <div className="profile-popover">
          <div className="profile-menu-heading">
            <span className="profile-menu-icon">
              <Users size={17} />
            </span>
            <div>
              <strong>Switch workspace</strong>
              <p>Explore a different perspective</p>
            </div>
          </div>
          <div id={menuId} role="menu" aria-label="Demo profiles" onKeyDown={navigate}>
            {['student', 'admin'].map((role) => (
              <div
                role="group"
                aria-label={role === 'student' ? 'Students' : 'Professors'}
                key={role}
                className="profile-group"
              >
                <span className="profile-group-label" aria-hidden="true">
                  {role === 'student' ? 'Students' : 'Professors'}
                </span>
                {ordered
                  .filter((profile) => profile.role === role)
                  .map((profile) => (
                    <button
                      key={profile.id}
                      ref={(element) => {
                        items.current[ordered.findIndex((item) => item.id === profile.id)] =
                          element;
                      }}
                      role="menuitemradio"
                      aria-checked={user.id === profile.id}
                      tabIndex={-1}
                      className={`profile-option ${user.id === profile.id ? 'selected' : ''}`}
                      onClick={() => {
                        close();
                        if (profile.id !== user.id) onSelect(profile.id);
                      }}
                    >
                      <span className={`avatar ${role === 'admin' ? 'professor-avatar' : ''}`}>
                        {profile.initials}
                      </span>
                      <span className="profile-option-copy">
                        <strong>{profile.name}</strong>
                        <span>{profile.program}</span>
                      </span>
                      {user.id === profile.id && <Check size={16} className="profile-check" />}
                    </button>
                  ))}
              </div>
            ))}
          </div>
          <div className="profile-menu-footer">
            <span />
            Demo profiles · no password needed
          </div>
        </div>
      )}
    </div>
  );
}

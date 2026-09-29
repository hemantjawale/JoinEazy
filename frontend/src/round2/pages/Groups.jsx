import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowRight, Copy, Crown, KeyRound, LockKeyhole, LogOut, Plus, Users } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Avatar, Badge, Empty, PageHeading } from '../components/UI';
import Dialog from '../components/Dialog';
import { myGroup } from '../lib/helpers';

export default function Groups() {
  const { workspace, mutate, notify } = useSession();
  const [params] = useSearchParams();
  const [courseId, setCourseId] = useState(params.get('course') || workspace.courses[0]?.id || '');
  const [dialog, setDialog] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const professor = workspace.user.role === 'professor';
  const course = workspace.courses.find((item) => item.id === courseId);
  const group = myGroup(workspace, courseId);
  const groups = workspace.groups.filter(
    (item) =>
      item.courseId === courseId && (professor || item.memberIds.includes(workspace.user.id)),
  );
  const open = (mode) => {
    setDialog(mode);
    setError('');
    setForm({ name: '', code: '' });
  };
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await mutate(
        dialog === 'leave'
          ? `/groups/${group.id}/membership`
          : dialog === 'join'
            ? '/groups/join'
            : '/groups',
        dialog === 'leave' ? 'DELETE' : 'POST',
        { ...form, courseId },
        dialog === 'leave'
          ? 'You’ve left the group.'
          : dialog === 'join'
            ? 'You found your people. Welcome to the group.'
            : 'A great team starts here. Your group is ready.',
      );
      setDialog(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  async function copy(code) {
    try {
      await navigator.clipboard.writeText(code);
      notify('Group code copied. Invite your people.');
    } catch {
      notify(`Group invite code: ${code}`);
    }
  }
  return (
    <>
      <PageHeading
        eyebrow="DIFFERENT MINDS. SHARED POSSIBILITIES."
        title={professor ? 'Great minds, coming together.' : 'Find your kind of curious.'}
        description={
          professor
            ? 'A little window into the teams in your courses.'
            : 'A shared idea starts with the right people. Your course groups live here.'
        }
      />
      <div className="group-toolbar">
        <label>
          YOUR COURSE
          <select
            aria-label="Choose group course"
            value={courseId}
            onChange={(event) => setCourseId(event.target.value)}
          >
            {workspace.courses.map((item) => (
              <option value={item.id} key={item.id}>
                {item.code} · {item.title}
              </option>
            ))}
          </select>
        </label>
        {!professor && course && !group && (
          <div>
            <button className="btn-v2 secondary" onClick={() => open('join')}>
              <KeyRound size={16} />
              Join a group
            </button>
            <button className="btn-v2 primary" onClick={() => open('create')}>
              <Plus size={16} />
              Create a group
            </button>
          </div>
        )}
      </div>
      {groups.length ? (
        <div className="groups-grid-v2 grid grid-cols-1 gap-6 xl:grid-cols-2">
          {groups.map((item) => {
            const locked = workspace.assignments.some(
              (assignment) =>
                assignment.courseId === item.courseId &&
                (professor
                  ? assignment.acknowledgments?.some((ack) => ack.groupId === item.id)
                  : assignment.acknowledgment?.groupId === item.id),
            );
            return (
              <article className="group-card-v2" key={item.id}>
                <div className="group-card-cover">
                  <span>
                    <Users size={28} />
                  </span>
                  <div>
                    <span className="eyebrow-v2">{course?.code} · YOUR PEOPLE</span>
                    <h2>{item.name}</h2>
                    <p>{item.memberIds.length} of 5 members · A little better, together</p>
                  </div>
                </div>
                <div className="group-card-body">
                  <div className="section-row">
                    <h3>The minds behind the ideas</h3>
                    <Badge status="neutral">{item.memberIds.length} members</Badge>
                  </div>
                  {item.memberIds.map((id) => {
                    const person = workspace.people.find((p) => p.id === id);
                    return (
                      <div className="group-member-row" key={id}>
                        <Avatar person={person} />
                        <div>
                          <strong>
                            {person?.name}
                            {id === workspace.user.id && <small> (you)</small>}
                          </strong>
                          <span>
                            {id === item.leaderId
                              ? 'Keeps the team in sync'
                              : 'Brings something to the table'}
                          </span>
                        </div>
                        {id === item.leaderId && (
                          <span className="leader-tag">
                            <Crown size={13} />
                            Leader
                          </span>
                        )}
                      </div>
                    );
                  })}
                  {!professor && (
                    <div className="group-invite">
                      <div>
                        <span>YOUR INVITE CODE</span>
                        <strong>{item.joinCode}</strong>
                      </div>
                      <button
                        className="btn-v2 secondary small"
                        onClick={() => copy(item.joinCode)}
                      >
                        <Copy size={14} />
                        Copy code
                      </button>
                    </div>
                  )}
                  <div className="info-v2 flex items-start gap-3">
                    {locked ? <LockKeyhole size={18} /> : <Crown size={18} />}
                    <p>
                      {locked
                        ? 'This team has acknowledged work. Membership is locked to keep its submission record accurate.'
                        : 'The group leader acknowledges shared work once. Every member sees the same update.'}
                    </p>
                  </div>
                  {!professor && !locked && (
                    <button className="leave-group" onClick={() => open('leave')}>
                      <LogOut size={14} />
                      Leave group
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <Empty
          title={
            professor ? 'The teams are still taking shape.' : 'Your next great team starts here.'
          }
          text={
            !course
              ? 'Join a course first to find your people.'
              : professor
                ? 'Students can create and join groups from their course workspace.'
                : 'You are not part of any group. Form or join one to submit this assignment.'
          }
          action={
            !professor &&
            course && (
              <button className="btn-v2 primary" onClick={() => open('create')}>
                <Plus size={16} />
                Start a group
              </button>
            )
          }
        />
      )}
      <div className="group-guide">
        <h3>A little guide to working together</h3>
        <div>
          <p>
            <span>01</span>One group per course. Up to five different perspectives.
          </p>
          <p>
            <span>02</span>Share your invite code with classmates enrolled in the same course.
          </p>
          <p>
            <span>03</span>Your leader acknowledges for everyone after submitting the work.
          </p>
        </div>
      </div>
      {dialog && (
        <Dialog
          title={
            dialog === 'create'
              ? 'Good things start with a name'
              : dialog === 'join'
                ? 'Your people are expecting you'
                : 'Leave your group?'
          }
          onClose={() => setDialog(null)}
          busy={busy}
        >
          <p className="dialog-intro">
            {dialog === 'create'
              ? `Start a group for ${course.title}. You’ll be the leader and receive a code to invite up to four classmates.`
              : dialog === 'join'
                ? 'Ask the group leader for their invite code. You need to be enrolled in the same course.'
                : 'You’ll no longer be part of this team. A leader can leave only after the other members have left.'}
          </p>
          <form className="form-v2" onSubmit={submit}>
            <fieldset disabled={busy}>
              {dialog !== 'leave' && (
                <label>
                  {dialog === 'create' ? 'Group name' : 'Group invite code'}
                  <input
                    required
                    minLength={2}
                    maxLength={dialog === 'create' ? 50 : 20}
                    autoFocus
                    placeholder={
                      dialog === 'create' ? 'e.g. The Curious Collective' : 'e.g. PIXEL26'
                    }
                    value={dialog === 'create' ? form.name : form.code}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [dialog === 'create' ? 'name' : 'code']: event.target.value,
                      })
                    }
                  />
                </label>
              )}
              {error && (
                <p className="error-v2" role="alert">
                  {error}
                </p>
              )}
              <div className="dialog-actions flex items-center justify-between gap-3">
                <button className="btn-v2 secondary" type="button" onClick={() => setDialog(null)}>
                  Cancel
                </button>
                <button
                  className={`btn-v2 ${dialog === 'leave' ? 'danger' : 'primary'}`}
                  type="submit"
                >
                  {busy
                    ? 'One moment…'
                    : dialog === 'create'
                      ? 'Create group'
                      : dialog === 'join'
                        ? 'Join group'
                        : 'Leave group'}
                  <ArrowRight size={16} />
                </button>
              </div>
            </fieldset>
          </form>
        </Dialog>
      )}
    </>
  );
}

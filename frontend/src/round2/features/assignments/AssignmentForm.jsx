import { useState } from 'react';
import { ArrowRight, Link2, UserRound, Users } from 'lucide-react';
import Dialog from '../../components/Dialog';
import { useSession } from '../../context/SessionContext';
import { localDateInput } from '../../lib/helpers';

export default function AssignmentForm({ assignment, courseId, onClose }) {
  const { workspace, mutate } = useSession();
  const [form, setForm] = useState({
    title: assignment?.title || '',
    description: assignment?.description || '',
    dueAt: assignment ? localDateInput(assignment.dueAt) : '',
    submissionType: assignment?.submissionType || 'individual',
    oneDriveUrl: assignment?.oneDriveUrl || '',
    courseId: courseId || workspace.courses[0]?.id || '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
  });
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await mutate(
        assignment ? `/assignments/${assignment.id}` : '/assignments',
        assignment ? 'PATCH' : 'POST',
        { ...form, dueAt: new Date(form.dueAt).toISOString() },
        assignment
          ? 'A little clearer. Assignment updated.'
          : 'A new possibility for your class. Assignment created.',
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Dialog
      title={assignment ? 'A little fine-tuning' : 'Give your class a new possibility'}
      wide
      onClose={onClose}
      busy={busy}
    >
      <p className="dialog-intro">A clear brief, a little direction, and room for great work.</p>
      <form className="form-v2" onSubmit={submit}>
        <fieldset disabled={busy}>
          <label>
            Course
            <select disabled={!!assignment || !!courseId} required {...field('courseId')}>
              {workspace.courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} · {course.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Assignment title
            <input
              autoFocus
              required
              maxLength={120}
              placeholder="e.g. Build something that makes campus better"
              {...field('title')}
            />
          </label>
          <label>
            The brief
            <textarea
              required
              rows={5}
              maxLength={5000}
              placeholder="What should your students create? Include the requirements and deliverables."
              {...field('description')}
            />
          </label>
          <div className="form-row-v2 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label>
              Deadline · date & time
              <input type="datetime-local" required {...field('dueAt')} />
              <span className="field-note">
                Your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </label>
            <label>
              Submission format
              <select disabled={!!assignment?.received} {...field('submissionType')}>
                <option value="individual">Individual</option>
                <option value="group">Group</option>
              </select>
              <span className="field-note">
                {assignment?.received
                  ? 'Locked after the first acknowledgment.'
                  : form.submissionType === 'group'
                    ? 'Only the group leader acknowledges.'
                    : 'Each student acknowledges their own work.'}
              </span>
            </label>
          </div>
          <label>
            <span className="label-icon">
              <Link2 size={14} />
              OneDrive submission link <small>optional</small>
            </span>
            <input
              type="url"
              maxLength={2048}
              placeholder="https://1drv.ms/…"
              {...field('oneDriveUrl')}
            />
            <span className="field-note">
              OneDrive or SharePoint. Check that your students have access.
            </span>
          </label>
          <div className="info-v2 flex items-start gap-3">
            {form.submissionType === 'group' ? <Users size={18} /> : <UserRound size={18} />}
            <p>
              {form.submissionType === 'group'
                ? 'Students need a course group. When the leader acknowledges, every member’s progress updates together.'
                : 'Every enrolled student sees this assignment and confirms their submission individually.'}
            </p>
          </div>
          {error && (
            <p role="alert" className="error-v2">
              {error}
            </p>
          )}
          <div className="dialog-actions flex items-center justify-between gap-3">
            <button className="btn-v2 secondary" type="button" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-v2 primary" type="submit">
              {busy ? 'Saving…' : assignment ? 'Save changes' : 'Create assignment'}
              <ArrowRight size={16} />
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

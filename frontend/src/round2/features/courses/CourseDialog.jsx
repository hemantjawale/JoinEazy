import { useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import Dialog from '../../components/Dialog';
import { useSession } from '../../context/SessionContext';

export default function CourseDialog({ onClose }) {
  const { workspace, mutate } = useSession();
  const professor = workspace.user.role === 'professor';
  const [form, setForm] = useState({ title: '', code: '', description: '', color: 'lavender' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
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
        professor ? '/courses' : '/courses/join',
        'POST',
        form,
        professor
          ? 'Your new course is ready. Share its invite code with your students.'
          : 'You’re in. Welcome to your new course.',
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
      title={professor ? 'Make room for a new course' : 'A new course, a new possibility'}
      onClose={onClose}
      busy={busy}
    >
      <p className="dialog-intro">
        {professor
          ? 'Create a home for your class. You’ll get an invite code to share with your students.'
          : 'Enter the course code shared by your professor to join their classroom.'}
      </p>
      <form className="form-v2" onSubmit={submit}>
        <fieldset disabled={busy}>
          {professor && (
            <label>
              Course name
              <input
                required
                minLength={3}
                maxLength={80}
                placeholder="e.g. Creative Web Development"
                {...field('title')}
              />
            </label>
          )}
          <label>
            {professor ? 'Short course code' : 'Course invite code'}
            <input
              required
              maxLength={professor ? 16 : 20}
              placeholder={professor ? 'e.g. CS 302' : 'e.g. WEB204'}
              {...field('code')}
            />
          </label>
          {professor && (
            <>
              <label>
                A little about this course
                <textarea
                  maxLength={300}
                  rows={3}
                  placeholder="What will your students explore?"
                  {...field('description')}
                />
              </label>
              <label>
                Course colour
                <select {...field('color')}>
                  <option value="lavender">Lavender</option>
                  <option value="mint">Sage green</option>
                  <option value="peach">Soft peach</option>
                  <option value="blue">Sky blue</option>
                </select>
              </label>
            </>
          )}
          {!professor && (
            <p className="field-note">
              Exploring? Try WEB204, DES210, or DATA208 for the sample courses.
            </p>
          )}
          {error && (
            <p role="alert" className="error-v2">
              {error}
            </p>
          )}
          <div className="dialog-actions flex items-center justify-between gap-3">
            <button className="btn-v2 secondary" type="button" onClick={onClose}>
              Not now
            </button>
            <button className="btn-v2 primary" type="submit">
              {busy ? 'Getting ready…' : professor ? 'Create course' : 'Join course'}
              {professor ? <Plus size={16} /> : <ArrowRight size={16} />}
            </button>
          </div>
        </fieldset>
      </form>
    </Dialog>
  );
}

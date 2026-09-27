import { useState } from 'react';
import { Plus, Save } from 'lucide-react';
import Modal from '../../components/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function AssignmentForm({ assignment, onClose }) {
  const {
    workspace: { students },
    mutate,
  } = useWorkspace();
  const [form, setForm] = useState(
    assignment || {
      title: '',
      course: '',
      description: '',
      dueDate: '',
      category: 'Assignment',
      driveUrl: '',
      studentIds: students.map((student) => student.id),
    },
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const field = (name) => ({
    value: form[name],
    onChange: (event) => setForm({ ...form, [name]: event.target.value }),
  });
  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.studentIds.length) {
      setError('Select at least one student.');
      return;
    }
    setBusy(true);
    try {
      await mutate(
        assignment ? `/assignments/${assignment.id}` : '/assignments',
        assignment ? 'PATCH' : 'POST',
        form,
        assignment ? 'Assignment updated.' : 'Your new assignment is ready.',
      );
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={assignment ? 'Edit assignment' : 'Create an assignment'}
      onClose={onClose}
      busy={busy}
      wide
    >
      <p className="form-intro">
        Give your students a clear brief and a place to share their work.
      </p>
      <form onSubmit={submit} className="assignment-form">
        <fieldset disabled={busy} className="form-fields">
          <label>
            Assignment title <span>*</span>
            <input
              autoFocus
              required
              maxLength={120}
              placeholder="e.g. Build a responsive landing page"
              {...field('title')}
            />
          </label>
          <div className="form-grid">
            <label>
              Course <span>*</span>
              <input
                required
                maxLength={80}
                placeholder="e.g. Web Development"
                {...field('course')}
              />
            </label>
            <label>
              Assignment type
              <select {...field('category')}>
                <option>Assignment</option>
                <option>Project</option>
                <option>Case study</option>
                <option>Exercise</option>
              </select>
            </label>
          </div>
          <label>
            The brief <span>*</span>
            <textarea
              rows={4}
              required
              maxLength={5000}
              placeholder="What should students create? Include requirements and deliverables."
              {...field('description')}
            />
          </label>
          <div className="form-grid">
            <label>
              Due date <span>*</span>
              <input type="date" required {...field('dueDate')} />
            </label>
            <label>
              Google Drive link
              <input type="url" placeholder="https://drive.google.com/..." {...field('driveUrl')} />
            </label>
          </div>
          <p className="field-help">
            Optional. Add a Google Drive or Docs link with the appropriate sharing permissions.
          </p>
          <fieldset className="student-picker">
            <legend>
              Assign to students <span>*</span>
            </legend>
            {students.map((student) => (
              <label key={student.id}>
                <input
                  type="checkbox"
                  checked={form.studentIds.includes(student.id)}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      studentIds: event.target.checked
                        ? [...form.studentIds, student.id]
                        : form.studentIds.filter((id) => id !== student.id),
                    })
                  }
                />
                <span className="avatar small">{student.initials}</span>
                {student.name}
              </label>
            ))}
          </fieldset>
        </fieldset>
        {error && (
          <p role="alert" className="form-error">
            {error}
          </p>
        )}
        <div className="modal-footer">
          <button type="button" className="secondary-button" disabled={busy} onClick={onClose}>
            Cancel
          </button>
          <button className="primary-button" disabled={busy} type="submit">
            {assignment ? <Save size={16} /> : <Plus size={16} />}
            {busy ? 'Saving…' : assignment ? 'Save changes' : 'Create assignment'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

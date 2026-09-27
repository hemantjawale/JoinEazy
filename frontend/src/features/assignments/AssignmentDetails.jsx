import { useState } from 'react';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CircleCheck,
  FileText,
  Link2,
  Pencil,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import Modal from '../../components/Modal';
import { useWorkspace } from '../../context/WorkspaceContext';
import { dateLabel, statusOf } from '../../utils/assignments';

export default function AssignmentDetails({ assignment, onClose, onEdit }) {
  const {
    workspace: { user, submissions, students },
    mutate,
  } = useWorkspace();
  const [step, setStep] = useState('details');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const admin = user.role === 'admin';
  const submitted = statusOf(assignment, submissions, user.id) === 'submitted';
  const submission = submissions.find(
    (item) => item.assignmentId === assignment.id && item.studentId === user.id,
  );
  async function run(action) {
    setBusy(true);
    setError('');
    try {
      await action();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Modal
      title={
        step === 'confirm'
          ? 'One last check'
          : step === 'delete'
            ? 'Delete assignment?'
            : 'Assignment details'
      }
      onClose={onClose}
      busy={busy}
      wide={step === 'details'}
    >
      {step === 'details' && (
        <>
          <div className="detail-course">
            {assignment.course} <span>· {assignment.category}</span>
          </div>
          <h3 className="detail-title">{assignment.title}</h3>
          <div className="detail-date">
            <CalendarDays size={16} />
            Due {dateLabel(assignment.dueDate, { year: 'numeric' })}
            <span>End of day · local time</span>
          </div>
          <div className="detail-description">
            <h4>
              <FileText size={16} />
              The brief
            </h4>
            <p>{assignment.description}</p>
          </div>
          <div className="submission-link">
            <span className="link-icon">
              <Link2 size={20} />
            </span>
            <div>
              <strong>Submission folder</strong>
              <p>
                {assignment.driveUrl
                  ? 'Upload your work to the professor’s Google Drive.'
                  : 'No Drive link attached. Ask your professor where to submit.'}
              </p>
            </div>
            {assignment.driveUrl && (
              <a
                className="secondary-button"
                href={assignment.driveUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open Drive
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
          {admin ? (
            <>
              <h4 className="mt-6 mb-3 text-sm font-semibold">Student submissions</h4>
              <div className="detail-students">
                {assignment.studentIds.map((id) => {
                  const student = students.find((item) => item.id === id);
                  const done = submissions.find(
                    (item) => item.assignmentId === assignment.id && item.studentId === id,
                  );
                  return (
                    <div key={id}>
                      <span className="avatar small">{student?.initials}</span>
                      <strong>{student?.name}</strong>
                      <span className={`badge ${done ? 'submitted' : 'pending'}`}>
                        {done ? 'Submitted' : 'Not submitted'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button className="danger-text" onClick={() => setStep('delete')}>
                  <Trash2 size={16} />
                  Delete
                </button>
                <button className="primary-button" onClick={() => onEdit(assignment)}>
                  <Pencil size={15} />
                  Edit assignment
                </button>
              </div>
            </>
          ) : submitted ? (
            <>
              <div className="success-panel">
                <CircleCheck size={22} />
                <div>
                  <strong>You’re all set!</strong>
                  <p>
                    Submission confirmed on{' '}
                    {new Date(submission.submittedAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                    .
                  </p>
                </div>
              </div>
              <div className="modal-footer justify-end">
                <button className="secondary-button" onClick={onClose}>
                  Close
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="info-panel">
                <ShieldCheck size={18} />
                <p>
                  Submit your work externally first, then confirm it here. This dashboard tracks
                  your confirmation; it doesn’t upload files.
                </p>
              </div>
              <div className="modal-footer">
                <button className="secondary-button" onClick={onClose}>
                  Not yet
                </button>
                <button className="primary-button" onClick={() => setStep('confirm')}>
                  Yes, I have submitted
                  <Check size={16} />
                </button>
              </div>
            </>
          )}
        </>
      )}
      {step === 'confirm' && (
        <>
          <div className="confirm-icon">
            <ShieldCheck size={32} />
          </div>
          <h3 className="confirm-heading">Ready to mark this as submitted?</h3>
          <p className="confirm-description">
            You’re confirming your submission for <strong>{assignment.title}</strong>. Your
            professor will see this update.
          </p>
          <label className="verification-check">
            <input
              type="checkbox"
              checked={verified}
              onChange={(event) => setVerified(event.target.checked)}
            />
            <span>I’ve uploaded my final work and checked that my professor can access it.</span>
          </label>
          <p className="fine-print">
            This confirmation is final in the demo. Please double-check your work before continuing.
          </p>
          <div className="modal-footer">
            <button disabled={busy} className="secondary-button" onClick={() => setStep('details')}>
              Go back
            </button>
            <button
              className="primary-button"
              disabled={!verified || busy}
              onClick={() =>
                run(() =>
                  mutate(
                    `/assignments/${assignment.id}/confirm`,
                    'POST',
                    { confirmed: true, verified },
                    'Submission confirmed. Nicely done!',
                  ),
                )
              }
            >
              {busy ? 'Confirming…' : 'Confirm submission'}
              <Check size={16} />
            </button>
          </div>
        </>
      )}
      {step === 'delete' && (
        <>
          <p className="confirm-description">
            This will permanently remove <strong>{assignment.title}</strong> and its submission
            records for all assigned students.
          </p>
          <div className="modal-footer">
            <button className="secondary-button" disabled={busy} onClick={() => setStep('details')}>
              Keep assignment
            </button>
            <button
              className="danger-button"
              disabled={busy}
              onClick={() =>
                run(() =>
                  mutate(`/assignments/${assignment.id}`, 'DELETE', null, 'Assignment deleted.'),
                )
              }
            >
              {busy ? 'Deleting…' : 'Delete assignment'}
            </button>
          </div>
        </>
      )}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
    </Modal>
  );
}

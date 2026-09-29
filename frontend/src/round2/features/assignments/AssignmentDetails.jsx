import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  Clock3,
  Crown,
  FileText,
  Link2,
  Pencil,
  ShieldCheck,
  Trash2,
  Users,
} from 'lucide-react';
import Dialog from '../../components/Dialog';
import { Avatar, Badge, Progress } from '../../components/UI';
import { useSession } from '../../context/SessionContext';
import { dateTime, myGroup, percentage, statusOf } from '../../lib/helpers';

export default function AssignmentDetails({ assignment: initial, onClose, onEdit }) {
  const { workspace, mutate } = useSession();
  const assignment = workspace.assignments.find((item) => item.id === initial.id) || initial;
  const course = workspace.courses.find((item) => item.id === assignment.courseId);
  const group = myGroup(workspace, assignment.courseId);
  const professor = workspace.user.role === 'professor';
  const [step, setStep] = useState('details');
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function execute(path, method, body, message, dismiss = false) {
    setBusy(true);
    setError('');
    try {
      await mutate(path, method, body, message);
      if (dismiss) onClose();
      else setStep('details');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  const targets =
    assignment.submissionType === 'group'
      ? workspace.groups
          .filter((item) => item.courseId === assignment.courseId)
          .map((item) => ({
            id: item.id,
            name: item.name,
            initials: item.name
              .split(' ')
              .map((word) => word[0])
              .slice(0, 2)
              .join(''),
            group: true,
          }))
      : course.studentIds.map((id) => workspace.people.find((person) => person.id === id));
  return (
    <Dialog
      title={
        step === 'confirm'
          ? 'A small check. A clear record.'
          : step === 'delete'
            ? 'Delete this assignment?'
            : 'A closer look'
      }
      wide={step === 'details'}
      onClose={onClose}
      busy={busy}
    >
      {step === 'details' && (
        <>
          <div className="detail-meta-v2">
            <span>
              {course.code} · {course.title}
            </span>
            <Badge status={professor ? 'neutral' : statusOf(assignment)}>
              {professor ? `${assignment.received}/${assignment.expected} acknowledged` : undefined}
            </Badge>
          </div>
          <h3 className="detail-title-v2">{assignment.title}</h3>
          <div className="detail-chips">
            <span>
              <CalendarDays size={15} />
              {dateTime(assignment.dueAt)}
            </span>
            <span>
              <Users size={15} />
              {assignment.submissionType === 'group' ? 'Group assignment' : 'Individual assignment'}
            </span>
          </div>
          <p className="detail-timezone">
            Times shown in {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
          <div className="detail-brief">
            <h4>
              <FileText size={17} />
              The brief
            </h4>
            <p>{assignment.description}</p>
          </div>
          <div className="onedrive-panel">
            <span className="onedrive-icon">
              <Link2 size={22} />
            </span>
            <div>
              <strong>Your submission space</strong>
              <p>
                {assignment.oneDriveUrl
                  ? 'Upload your work to the shared OneDrive folder.'
                  : 'Your professor hasn’t attached a OneDrive link yet. Ask them where to submit.'}
              </p>
            </div>
            {assignment.oneDriveUrl && (
              <a
                className="btn-v2 secondary small"
                href={assignment.oneDriveUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open OneDrive
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
          {professor ? (
            <>
              <div className="detail-analytics">
                <div>
                  <h4>Acknowledgment overview</h4>
                  <strong>
                    {assignment.received} of {assignment.expected}{' '}
                    {assignment.submissionType === 'group' ? 'groups' : 'students'}
                  </strong>
                </div>
                <Progress
                  value={percentage(assignment.received, assignment.expected)}
                  label="Assignment acknowledgments"
                />
              </div>
              {targets.length ? (
                <div className="acknowledgment-list">
                  {targets.map((target) => {
                    const ack = assignment.acknowledgments.find((record) =>
                      target.group ? record.groupId === target.id : record.studentId === target.id,
                    );
                    return (
                      <div key={target.id}>
                        <Avatar person={target} size="tiny" />
                        <span>
                          <strong>{target.name}</strong>
                          {ack && <small>{dateTime(ack.acknowledgedAt)}</small>}
                        </span>
                        <Badge status={ack ? 'acknowledged' : 'pending'}>
                          {ack ? 'Acknowledged' : 'Not yet'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="field-note">
                  {assignment.submissionType === 'group'
                    ? 'No groups formed yet. Students can create or join a course group.'
                    : 'No students enrolled yet. Share the course invite code.'}
                </p>
              )}
              {assignment.submissionType === 'group' && (
                <p className="field-note">
                  {
                    course.studentIds.filter(
                      (id) =>
                        !workspace.groups.some(
                          (item) => item.courseId === course.id && item.memberIds.includes(id),
                        ),
                    ).length
                  }{' '}
                  students haven’t joined a group yet.
                </p>
              )}
              <div className="dialog-actions flex items-center justify-between gap-3">
                <button className="btn-v2 danger-ghost" onClick={() => setStep('delete')}>
                  <Trash2 size={15} />
                  Delete
                </button>
                <button className="btn-v2 primary" onClick={() => onEdit(assignment)}>
                  <Pencil size={15} />
                  Edit assignment
                </button>
              </div>
            </>
          ) : assignment.acknowledgment ? (
            <>
              <div className="ack-success">
                <span>
                  <CheckCheck size={24} />
                </span>
                <div>
                  <strong>
                    {assignment.submissionType === 'group'
                      ? 'One team. One shared checkmark.'
                      : 'That’s another step forward.'}
                  </strong>
                  <p>
                    Acknowledged {dateTime(assignment.acknowledgment.acknowledgedAt)}
                    {assignment.submissionType === 'group'
                      ? ` by ${workspace.people.find((person) => person.id === assignment.acknowledgment.actorId)?.name || 'your group leader'}`
                      : ''}
                    .
                  </p>
                </div>
              </div>
              <div className="dialog-actions end">
                <button className="btn-v2 secondary" onClick={onClose}>
                  All done
                </button>
              </div>
            </>
          ) : assignment.submissionType === 'group' && !group ? (
            <div className="group-required">
              <Users size={26} />
              <h4>You don’t have to do it alone.</h4>
              <p>You are not part of any group. Form or join one to submit this assignment.</p>
              <Link
                to={`/app/groups?course=${course.id}`}
                className="btn-v2 primary"
                onClick={onClose}
              >
                Find your group
                <ArrowUpRight size={16} />
              </Link>
            </div>
          ) : assignment.submissionType === 'group' && !assignment.canAcknowledge ? (
            <div className="info-v2 flex items-start gap-3">
              <Crown size={20} />
              <p>
                <strong>Your group leader takes it from here.</strong>
                <br />
                {workspace.people.find((person) => person.id === group.leaderId)?.name} can
                acknowledge for {group.name}. You’ll see the update here when they do.
              </p>
            </div>
          ) : (
            <>
              <div className="info-v2 flex items-start gap-3">
                <ShieldCheck size={18} />
                <p>
                  {assignment.submissionType === 'group'
                    ? `As the leader of ${group.name}, you’re confirming on behalf of all ${group.memberIds.length} members. `
                    : ''}
                  Submit your work externally first. This acknowledgment records your confirmation;
                  it doesn’t upload files.
                </p>
              </div>
              <div className="dialog-actions flex items-center justify-between gap-3">
                <button className="btn-v2 secondary" onClick={onClose}>
                  Not just yet
                </button>
                <button className="btn-v2 primary" onClick={() => setStep('confirm')}>
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
          <div className="confirm-symbol">
            <ShieldCheck size={32} />
          </div>
          <h3 className="confirm-title">Ready for that checkmark?</h3>
          <p className="confirm-copy">
            You’re acknowledging <strong>{assignment.title}</strong>
            {assignment.submissionType === 'group' ? ` for every member of ${group.name}` : ''}.
            Your professor will see the timestamp.
          </p>
          <label className="confirmation-checkbox">
            <input
              type="checkbox"
              checked={verified}
              onChange={(event) => setVerified(event.target.checked)}
              disabled={busy}
            />
            <span>I’ve submitted the final work and checked that my professor can access it.</span>
          </label>
          <p className="field-note">
            This acknowledgment is final.{' '}
            {assignment.submissionType === 'group'
              ? 'Your group’s membership will be locked to preserve the submission record.'
              : 'Take a moment to double-check before continuing.'}
          </p>
          <div className="dialog-actions flex items-center justify-between gap-3">
            <button className="btn-v2 secondary" disabled={busy} onClick={() => setStep('details')}>
              Go back
            </button>
            <button
              className="btn-v2 primary"
              disabled={!verified || busy}
              onClick={() =>
                execute(
                  `/assignments/${assignment.id}/acknowledge`,
                  'POST',
                  { confirmed: true, verified },
                  'Acknowledged. One less thing on your mind.',
                )
              }
            >
              <Check size={16} />
              {busy ? 'Acknowledging…' : 'Confirm acknowledgment'}
            </button>
          </div>
        </>
      )}
      {step === 'delete' && (
        <>
          <p className="confirm-copy">
            This permanently deletes <strong>{assignment.title}</strong> and all its acknowledgment
            records. This can’t be undone.
          </p>
          <div className="dialog-actions flex items-center justify-between gap-3">
            <button className="btn-v2 secondary" disabled={busy} onClick={() => setStep('details')}>
              Keep assignment
            </button>
            <button
              className="btn-v2 danger"
              disabled={busy}
              onClick={() =>
                execute(
                  `/assignments/${assignment.id}`,
                  'DELETE',
                  null,
                  'Assignment deleted.',
                  true,
                )
              }
            >
              {busy ? 'Deleting…' : 'Delete assignment'}
            </button>
          </div>
        </>
      )}
      {error && (
        <p className="error-v2" role="alert">
          {error}
        </p>
      )}
    </Dialog>
  );
}

export default function ProgressBar({ value, label, tone = 'purple' }) {
  return (
    <div
      className={`progress-track ${tone}`}
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <span style={{ width: `${value}%` }} />
    </div>
  );
}

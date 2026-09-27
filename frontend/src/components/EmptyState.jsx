import { SearchX } from 'lucide-react';

export default function EmptyState({
  title = 'No assignments found',
  description = 'Try another search or adjust your filters.',
  action,
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <SearchX size={28} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

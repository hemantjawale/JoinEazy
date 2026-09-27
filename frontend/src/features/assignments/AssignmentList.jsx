import { useMemo, useState } from 'react';
import { ArrowDownWideNarrow, Search, SlidersHorizontal, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { statusOf } from '../../utils/assignments';
import AssignmentCard from './AssignmentCard';
import EmptyState from '../../components/EmptyState';

export default function AssignmentList({ onOpen, full = false, onCreate }) {
  const {
    workspace: { assignments, submissions, user },
  } = useWorkspace();
  const admin = user.role === 'admin';
  const [tab, setTab] = useState('all');
  const [query, setQuery] = useState('');
  const [course, setCourse] = useState('all');
  const [sort, setSort] = useState('priority');
  const [showFilters, setShowFilters] = useState(false);
  const tabs = admin
    ? [{ id: 'all', label: 'All assignments' }]
    : [
        { id: 'all', label: 'All assignments' },
        { id: 'pending', label: 'To do' },
        { id: 'submitted', label: 'Submitted' },
        { id: 'overdue', label: 'Overdue' },
      ];
  const filtered = useMemo(
    () =>
      assignments
        .filter(
          (assignment) =>
            (tab === 'all' || statusOf(assignment, submissions, user.id) === tab) &&
            (course === 'all' || assignment.course === course) &&
            `${assignment.title} ${assignment.course}`.toLowerCase().includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === 'priority' && !admin
            ? Number(statusOf(a, submissions, user.id) === 'submitted') -
                Number(statusOf(b, submissions, user.id) === 'submitted') ||
              a.dueDate.localeCompare(b.dueDate)
            : sort === 'title'
              ? a.title.localeCompare(b.title)
              : sort === 'newest'
                ? b.createdAt.localeCompare(a.createdAt)
                : a.dueDate.localeCompare(b.dueDate),
        ),
    [assignments, submissions, user.id, tab, course, query, sort, admin],
  );
  return (
    <section className="assignments-section">
      <div className="section-heading">
        <div>
          <h2>
            {full ? 'Your assignment library' : admin ? 'Your assignments' : 'My assignments'}
            <span>{assignments.length}</span>
          </h2>
          <p>
            {admin
              ? 'A clear view of what your students are working on.'
              : 'Everything you’re working on, all in one place.'}
          </p>
        </div>
        <button
          className={`secondary-button filter-button ${showFilters ? 'selected' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
          aria-expanded={showFilters}
        >
          <SlidersHorizontal size={15} />
          Filters{course !== 'all' && <span className="filter-dot" />}
        </button>
      </div>
      <div className="assignment-toolbar">
        <div className="tabs" role="tablist" aria-label="Assignment status">
          {tabs.map((item) => (
            <button
              role="tab"
              aria-selected={tab === item.id}
              key={item.id}
              onClick={() => setTab(item.id)}
              className={tab === item.id ? 'active' : ''}
            >
              {item.label}
              <span>
                {
                  assignments.filter(
                    (assignment) =>
                      item.id === 'all' || statusOf(assignment, submissions, user.id) === item.id,
                  ).length
                }
              </span>
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label="Search assignments"
            placeholder="Search assignments..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query && (
            <button aria-label="Clear search" onClick={() => setQuery('')}>
              <X size={14} />
            </button>
          )}
        </label>
      </div>
      {showFilters && (
        <div className="filter-panel">
          <label>
            Course
            <select value={course} onChange={(event) => setCourse(event.target.value)}>
              <option value="all">All courses</option>
              {[...new Set(assignments.map((assignment) => assignment.course))].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="flex items-center gap-2">
              <ArrowDownWideNarrow size={14} />
              Sort by
            </span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="priority">Action needed first</option>
              <option value="due">Due date · earliest first</option>
              <option value="newest">Recently created</option>
              <option value="title">Title · A to Z</option>
            </select>
          </label>
          <button
            className="text-button"
            onClick={() => {
              setCourse('all');
              setSort('priority');
              setQuery('');
              setTab('all');
            }}
          >
            Reset filters
          </button>
        </div>
      )}
      <div role="tabpanel" aria-label="Assignments">
        {filtered.length ? (
          <div className="assignment-grid">
            {filtered.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                submissions={submissions}
                user={user}
                onOpen={onOpen}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={assignments.length ? 'Nothing here just yet' : 'A fresh start'}
            description={
              assignments.length
                ? 'Try a different search, status, or course.'
                : admin
                  ? 'Create your first assignment to get things moving.'
                  : 'Your professor hasn’t assigned any work yet. Check back soon.'
            }
            action={
              admin && !assignments.length ? (
                <button className="primary-button" onClick={onCreate}>
                  Create assignment
                </button>
              ) : (
                <button
                  className="secondary-button"
                  onClick={() => {
                    setQuery('');
                    setCourse('all');
                    setTab('all');
                  }}
                >
                  Clear filters
                </button>
              )
            }
          />
        )}
      </div>
      {filtered.length > 0 && (
        <div className="list-footer">
          <span>
            Showing {filtered.length} of {assignments.length} assignments
          </span>
          <span>You’re building something great. Keep going.</span>
        </div>
      )}
    </section>
  );
}

import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { Empty, PageHeading } from '../components/UI';
import CourseCard from '../features/courses/CourseCard';
import CourseDialog from '../features/courses/CourseDialog';

export default function Courses() {
  const { workspace } = useSession();
  const [query, setQuery] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const professor = workspace.user.role === 'professor';
  const courses = workspace.courses.filter((course) =>
    `${course.title} ${course.code}`.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <>
      <PageHeading
        eyebrow="A SEMESTER OF POSSIBILITIES"
        title="Your space to explore."
        description="Every course, every next step. A little more connected."
        action={
          <button className="btn-v2 primary" onClick={() => setShowDialog(true)}>
            <Plus size={17} />
            {professor ? 'Create course' : 'Join a course'}
          </button>
        }
      />
      <div className="section-row">
        <h2>
          My courses <span>{workspace.courses.length}</span>
        </h2>
        <label className="search-v2">
          <Search size={17} />
          <input
            aria-label="Search courses"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find a course…"
          />
        </label>
      </div>
      {courses.length ? (
        <div className="course-grid-v2 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <Empty
          title={query ? 'No courses by that name.' : 'Every journey starts somewhere.'}
          text={
            query
              ? 'Try another course name or code.'
              : professor
                ? 'Create your first course and invite your class.'
                : 'Join a course with an invite code from your professor.'
          }
          action={
            <button
              className="btn-v2 secondary"
              onClick={() => (query ? setQuery('') : setShowDialog(true))}
            >
              {query ? 'Clear search' : professor ? 'Create a course' : 'Join a course'}
            </button>
          }
        />
      )}
      {showDialog && <CourseDialog onClose={() => setShowDialog(false)} />}
    </>
  );
}

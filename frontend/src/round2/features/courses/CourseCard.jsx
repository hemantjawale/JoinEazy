import { ArrowUpRight, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSession } from '../../context/SessionContext';
import { Avatar, CourseArtwork, Progress } from '../../components/UI';
import { percentage } from '../../lib/helpers';

export default function CourseCard({ course }) {
  const { workspace } = useSession();
  const professor = workspace.user.role === 'professor';
  const assignments = workspace.assignments.filter(
    (assignment) => assignment.courseId === course.id,
  );
  const done = professor
    ? assignments.reduce((sum, item) => sum + item.received, 0)
    : assignments.filter((item) => item.acknowledgment).length;
  const total = professor
    ? assignments.reduce((sum, item) => sum + item.expected, 0)
    : assignments.length;
  const teacher = workspace.people.find((person) => person.id === course.professorId);
  return (
    <Link to={`/app/courses/${course.id}`} className="course-card-v2">
      <div className={`course-cover ${course.color}`}>
        <span className="course-cover-code">{course.code}</span>
        <span className="course-cover-arrow">
          <ArrowUpRight size={18} />
        </span>
        <CourseArtwork type={course.icon} />
        <span className="course-cover-semester">{course.semester}</span>
      </div>
      <div className="course-card-body">
        <div className="course-card-subtitle">
          <span>{assignments.length} assignments</span>
          <span>
            <Users size={12} />
            {course.studentIds.length} students
          </span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-card-teacher">
          <Avatar person={teacher} size="tiny" />
          <span>Prof. {teacher?.name}</span>
        </div>
        <div className="course-progress-label">
          <span>{professor ? 'Acknowledgments' : 'Your progress'}</span>
          <strong>
            {done}
            <i> / {total}</i>
          </strong>
        </div>
        <Progress
          value={percentage(done, total)}
          label={`${course.title} progress`}
          color={course.color}
        />
      </div>
    </Link>
  );
}

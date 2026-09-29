import { hashPassword } from './security.js';

const deadline = (days, hour = 23) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(hour, 59, 0, 0);
  return date.toISOString();
};

export function seedWorkspace() {
  const passwordHash = hashPassword('LearnTogether26!');
  const users = [
    {
      id: 'maya',
      name: 'Maya Sharma',
      email: 'maya@demo.joineazy.app',
      role: 'student',
      initials: 'MS',
    },
    {
      id: 'arjun',
      name: 'Arjun Mehta',
      email: 'arjun@demo.joineazy.app',
      role: 'student',
      initials: 'AM',
    },
    {
      id: 'rohan',
      name: 'Rohan Patil',
      email: 'rohan@demo.joineazy.app',
      role: 'student',
      initials: 'RP',
    },
    {
      id: 'isha',
      name: 'Isha Nair',
      email: 'isha@demo.joineazy.app',
      role: 'student',
      initials: 'IN',
    },
    {
      id: 'ananya',
      name: 'Ananya Deshmukh',
      email: 'ananya@demo.joineazy.app',
      role: 'professor',
      initials: 'AD',
    },
    {
      id: 'vikram',
      name: 'Vikram Rao',
      email: 'vikram@demo.joineazy.app',
      role: 'professor',
      initials: 'VR',
    },
  ].map((user) => ({ ...user, passwordHash }));
  const students = ['maya', 'arjun', 'rohan', 'isha'];
  const courses = [
    {
      id: 'web',
      title: 'Web Development',
      code: 'CS 204',
      description: 'From your first component to thoughtful, responsive experiences.',
      color: 'lavender',
      icon: 'code',
      professorId: 'ananya',
      studentIds: [...students],
      semester: 'Autumn 2026',
      joinCode: 'WEB204',
    },
    {
      id: 'design',
      title: 'Human–Computer Interaction',
      code: 'DES 210',
      description: 'Understand people. Design interfaces that make their day a little easier.',
      color: 'peach',
      icon: 'design',
      professorId: 'vikram',
      studentIds: [...students],
      semester: 'Autumn 2026',
      joinCode: 'DES210',
    },
    {
      id: 'data',
      title: 'Database Systems',
      code: 'CS 208',
      description: 'Make sense of information with elegant, reliable data models.',
      color: 'mint',
      icon: 'database',
      professorId: 'ananya',
      studentIds: [...students],
      semester: 'Autumn 2026',
      joinCode: 'DATA208',
    },
  ];
  const assignments = [
    {
      id: 'web-1',
      courseId: 'web',
      title: 'Build a responsive portfolio',
      description:
        'A small website. A big first impression.\n\nDesign and build a personal portfolio with React and Tailwind CSS. Include an introduction, at least three projects, and a contact section.\n\nYour deliverables\n• Responsive layouts at mobile, tablet, and desktop sizes\n• Accessible navigation and visible keyboard focus\n• A README explaining your component structure\n• Source code and screenshots in the submission folder',
      dueAt: deadline(3),
      submissionType: 'individual',
      oneDriveUrl: '',
    },
    {
      id: 'web-2',
      courseId: 'web',
      title: 'The campus companion',
      description:
        'Work together to design a useful campus app. Pick a real student problem and build a working React prototype.\n\nSubmit your source code, a short demo, and a note describing each member’s contribution. The group leader should acknowledge after checking the shared submission.',
      dueAt: deadline(7),
      submissionType: 'group',
      oneDriveUrl: '',
    },
    {
      id: 'web-3',
      courseId: 'web',
      title: 'JavaScript, one concept at a time',
      description:
        'Complete the exercises on array methods, promises, and async/await. Add a short explanation to each solution.',
      dueAt: deadline(-3),
      submissionType: 'individual',
      oneDriveUrl: '',
    },
    {
      id: 'design-1',
      courseId: 'design',
      title: 'Everyday experiences, reimagined',
      description:
        'Choose a campus experience and map its user journey. Interview three users, identify friction, and propose a low-fidelity redesign as a group.',
      dueAt: deadline(5),
      submissionType: 'group',
      oneDriveUrl: '',
    },
    {
      id: 'design-2',
      courseId: 'design',
      title: 'A study in visual hierarchy',
      description:
        'Create a typographic poster. Explain how scale, contrast, and spacing guide attention. Submit a PDF and your editable design file.',
      dueAt: deadline(-1),
      submissionType: 'individual',
      oneDriveUrl: '',
    },
    {
      id: 'data-1',
      courseId: 'data',
      title: 'Design a library database',
      description:
        'Model a university library with an ER diagram and a schema normalized to 3NF. Explain your assumptions and include five sample SQL queries.',
      dueAt: deadline(2),
      submissionType: 'individual',
      oneDriveUrl: '',
    },
  ].map((assignment) => ({ ...assignment, createdAt: new Date().toISOString() }));
  return {
    users,
    courses,
    assignments,
    groups: [
      {
        id: 'pixel',
        courseId: 'web',
        name: 'Pixel Pioneers',
        leaderId: 'maya',
        memberIds: ['maya', 'arjun'],
        joinCode: 'PIXEL26',
      },
      {
        id: 'query',
        courseId: 'data',
        name: 'The Query Crew',
        leaderId: 'rohan',
        memberIds: ['rohan', 'isha'],
        joinCode: 'QUERY26',
      },
    ],
    acknowledgments: [
      {
        id: 'ack1',
        assignmentId: 'web-3',
        studentId: 'maya',
        actorId: 'maya',
        acknowledgedAt: new Date().toISOString(),
      },
      {
        id: 'ack2',
        assignmentId: 'design-2',
        studentId: 'maya',
        actorId: 'maya',
        acknowledgedAt: new Date().toISOString(),
      },
      {
        id: 'ack3',
        assignmentId: 'web-3',
        studentId: 'arjun',
        actorId: 'arjun',
        acknowledgedAt: new Date().toISOString(),
      },
      {
        id: 'ack4',
        assignmentId: 'data-1',
        studentId: 'rohan',
        actorId: 'rohan',
        acknowledgedAt: new Date().toISOString(),
      },
    ],
  };
}

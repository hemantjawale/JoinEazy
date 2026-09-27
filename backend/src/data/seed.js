const relativeDate = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

export const users = [
  {
    id: 'student-maya',
    name: 'Maya Sharma',
    role: 'student',
    initials: 'MS',
    program: 'Computer Science · Year 2',
  },
  {
    id: 'student-alex',
    name: 'Arjun Mehta',
    role: 'student',
    initials: 'AM',
    program: 'Computer Science · Year 2',
  },
  {
    id: 'student-jordan',
    name: 'Rohan Patil',
    role: 'student',
    initials: 'RP',
    program: 'Computer Science · Year 2',
  },
  {
    id: 'prof-sarah',
    name: 'Ananya Deshmukh',
    role: 'admin',
    initials: 'AD',
    program: 'Professor · Computer Science',
  },
  {
    id: 'prof-james',
    name: 'Vikram Rao',
    role: 'admin',
    initials: 'VR',
    program: 'Professor · Design Studies',
  },
];

export function createSeed() {
  const all = users.filter((user) => user.role === 'student').map((user) => user.id);
  const assignments = [
    {
      id: 'a1',
      title: 'Build a responsive landing page',
      course: 'Web Development',
      description:
        'Turn a concept into a responsive landing page. Include a navigation bar, hero section, features, and footer. Use semantic HTML and test your layout on mobile and desktop. Share your source code and screenshots in the submission folder.',
      dueDate: relativeDate(2),
      category: 'Project',
      ownerId: 'prof-sarah',
      studentIds: all,
    },
    {
      id: 'a2',
      title: 'Database design & normalization',
      course: 'Database Systems',
      description:
        'Design a database for a university library. Submit an entity relationship diagram, your schema normalized to 3NF, and a short explanation of your design decisions.',
      dueDate: relativeDate(4),
      category: 'Assignment',
      ownerId: 'prof-sarah',
      studentIds: all,
    },
    {
      id: 'a3',
      title: 'The everyday interface',
      course: 'UI / UX Design',
      description:
        'Choose an everyday app and review three key user journeys. Identify friction points and create a low-fidelity redesign with a clear explanation of your choices.',
      dueDate: relativeDate(6),
      category: 'Case study',
      ownerId: 'prof-james',
      studentIds: ['student-maya', 'student-jordan'],
    },
    {
      id: 'a4',
      title: 'Sorting algorithms, visualized',
      course: 'Data Structures',
      description:
        'Compare merge sort, quicksort, and insertion sort. Include pseudocode, time complexity analysis, and a visualization of each algorithm on the same input.',
      dueDate: relativeDate(-2),
      category: 'Assignment',
      ownerId: 'prof-sarah',
      studentIds: all,
    },
    {
      id: 'a5',
      title: 'A study in visual hierarchy',
      course: 'UI / UX Design',
      description:
        'Create a typographic poster using scale, contrast, and spacing. Include a short rationale and your final exported design.',
      dueDate: relativeDate(-5),
      category: 'Exercise',
      ownerId: 'prof-james',
      studentIds: all,
    },
    {
      id: 'a6',
      title: 'JavaScript fundamentals',
      course: 'Web Development',
      description:
        'Complete the JavaScript exercises covering arrays, objects, async functions, and DOM events. Include comments explaining your approach.',
      dueDate: relativeDate(-7),
      category: 'Exercise',
      ownerId: 'prof-sarah',
      studentIds: all,
    },
  ].map((assignment, index) => ({
    ...assignment,
    driveUrl: '',
    createdAt: new Date(Date.now() - (12 - index) * 86400000).toISOString(),
  }));
  const submissions = [
    ['a5', 'student-maya'],
    ['a6', 'student-maya'],
    ['a1', 'student-alex'],
    ['a4', 'student-alex'],
    ['a6', 'student-alex'],
    ['a2', 'student-jordan'],
    ['a5', 'student-jordan'],
  ].map(([assignmentId, studentId]) => ({
    assignmentId,
    studentId,
    submittedAt: new Date().toISOString(),
  }));
  return { assignments, submissions };
}

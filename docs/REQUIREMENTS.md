# Task 2 requirement mapping

| Brief requirement                 | Implementation                                                   | Verification                                      |
| --------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------- |
| Login/register and role redirects | Auth page, session context, route guards, JWT cookie API         | API and browser tests                             |
| Professor's taught courses        | Role-scoped workspace and dashboard                              | Ownership tests                                   |
| Create/edit/view assignments      | Forms and dialogs with title, brief, deadline, OneDrive, format  | CRUD and validation tests                         |
| Submitted counts and analytics    | Assignment counts and class/course progress                      | Browser flow and scoped read-model tests          |
| Enrolled semester courses         | Course cards, semester, invite enrollment                        | Enrollment tests                                  |
| Complete assignment details       | Brief, exact date/time, link state, format, status               | Browser flow                                      |
| Individual acknowledgment         | Two confirmations, immutable server timestamp                    | Idempotency and browser tests                     |
| Leader-only group acknowledgment  | Server check and member restriction UI                           | API and browser tests                             |
| Shared group acknowledgment       | One group record with shared timestamp and actor                 | Maya-to-Arjun browser flow                        |
| No-group prompt                   | Create/join prompt and course group workflow                     | Browser flow                                      |
| Progress feedback                 | Badges, bars, success states, toasts, reduced motion             | Browser checks and visual inspection              |
| Responsive modern frontend        | React/Vite/Tailwind landing and workspace                        | 320/390/768px checks and screenshots              |
| Structured source and README      | Separate frontend/backend and feature boundaries                 | Repository documentation                          |
| Deployed demo                     | Vercel proxy/config, Node environment examples, deployment guide | **Account deployment and live smoke test remain** |
| Video and submission              | Reproducible recording and walkthrough guide                     | Local recording; applicant uploads and submits    |

## Product rules

- One group per course, up to five members. The creator is the leader.
- Group membership locks after acknowledgment to preserve its meaning.
- Assignment submission type cannot change after acknowledgment.
- Late acknowledgment remains possible and displays as late; the brief does not request closing submissions at the deadline.
- Semester is stored on each course; seed courses use Autumn 2026.
- OneDrive holds the submitted files. Joineazy records acknowledgment, not file uploads.
- New accounts start empty; students enroll with course invite codes.
- Self-selected roles support MVP evaluation. A real institution would verify faculty accounts.

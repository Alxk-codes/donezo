import { addDays, subDays, format } from 'date-fns';

const today = new Date();

export const demoUser = {
  id: 'demo-user',
  name: 'Aalok',
  email: 'aalok@example.com',
  avatar: null,
  totalCreated: 12,
};

export const demoTasks = [
  {
    id: '1',
    title: 'Submit maths assignment',
    description: 'Pages 45–50 + diagram. Remember to staple all sheets together before submitting.',
    dueDate: format(addDays(today, 1), 'yyyy-MM-dd'),
    priority: 'high',
    status: 'pending',
    createdAt: format(subDays(today, 2), 'yyyy-MM-dd'),
    files: [
      { id: 'f1', name: 'notebook_page.jpg', type: 'image', url: 'https://placehold.co/400x300/e2e8f0/64748b?text=Notebook+Page', size: '1.2 MB' },
    ],
  },
  {
    id: '2',
    title: 'Read Chapter 7 – Organic Chemistry',
    description: 'Focus on reaction mechanisms. Make flashcards for functional groups.',
    dueDate: format(today, 'yyyy-MM-dd'),
    priority: 'medium',
    status: 'pending',
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd'),
    files: [],
  },
  {
    id: '3',
    title: 'Pay electricity bill',
    description: '',
    dueDate: format(subDays(today, 1), 'yyyy-MM-dd'),
    priority: 'high',
    status: 'pending',
    createdAt: format(subDays(today, 5), 'yyyy-MM-dd'),
    files: [
      { id: 'f2', name: 'bill_nov.pdf', type: 'pdf', url: '#', size: '340 KB' },
    ],
  },
  {
    id: '4',
    title: 'Buy groceries',
    description: 'Milk, bread, eggs, bananas, coffee. Check if we need washing powder.',
    dueDate: format(today, 'yyyy-MM-dd'),
    priority: 'low',
    status: 'completed',
    createdAt: format(subDays(today, 3), 'yyyy-MM-dd'),
    files: [],
  },
  {
    id: '5',
    title: 'Schedule dentist appointment',
    description: 'Call Dr. Mehta – overdue checkup.',
    dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    priority: 'medium',
    status: 'pending',
    createdAt: format(subDays(today, 1), 'yyyy-MM-dd'),
    files: [],
  },
  {
    id: '6',
    title: 'Finish portfolio website',
    description: 'Add projects section and deploy to Vercel.',
    dueDate: format(addDays(today, 7), 'yyyy-MM-dd'),
    priority: 'high',
    status: 'pending',
    createdAt: format(subDays(today, 7), 'yyyy-MM-dd'),
    files: [
      { id: 'f3', name: 'wireframe_v2.png', type: 'image', url: 'https://placehold.co/400x300/dbeafe/3b82f6?text=Wireframe+v2', size: '890 KB' },
      { id: 'f4', name: 'design_brief.pdf', type: 'pdf', url: '#', size: '1.1 MB' },
    ],
  },
  {
    id: '7',
    title: 'Call mom',
    description: 'Discuss weekend plans. Ask about the family function date.',
    dueDate: format(subDays(today, 2), 'yyyy-MM-dd'),
    priority: 'medium',
    status: 'completed',
    createdAt: format(subDays(today, 4), 'yyyy-MM-dd'),
    files: [],
  },
  {
    id: '8',
    title: 'Revise DSA – Trees & Graphs',
    description: 'Practice LeetCode problems: BFS, DFS, Dijkstra. Target: 5 medium problems.',
    dueDate: format(addDays(today, 3), 'yyyy-MM-dd'),
    priority: 'high',
    status: 'pending',
    createdAt: format(today, 'yyyy-MM-dd'),
    files: [],
  },
];

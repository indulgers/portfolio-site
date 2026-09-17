export const PROFILE_URLS = {
  github: 'https://github.com/indulgers',
  linkedIn: 'https://www.linkedin.com/in/weiye-zhu-211ba33b7/zh/',
} as const;

export type WorkEntry = {
  id: 'xmind' | 'imports' | 'companion';
  index: string;
  label: string;
  title: string;
  summary: string;
  details: readonly string[];
};

export const WORK_ENTRIES: readonly WorkEntry[] = [
  {
    id: 'xmind',
    index: '01',
    label: 'Previous work at Xmind',
    title: 'AI-native knowledge work',
    summary:
      'Shipped interaction models and dependable delivery work for a collaborative canvas where AI assistance belongs inside the workflow.',
    details: [
      'Connected canvas interaction, streaming agent experiences, product analytics, and release work across the product surface.',
      'Worked from user workflow to production detail: a shared language for the frontend, services, model context, and tools.',
    ],
  },
  {
    id: 'imports',
    index: '02',
    label: 'Selected work',
    title: 'Multimodal documents to mind maps',
    summary:
      'Designed a dependable import path from documents and visual source files into editable mind maps.',
    details: [
      'The workflow translated text, Markdown, images, Sketch files, and PDFs into editable mind maps without treating source formats as an afterthought.',
      'The delivery balanced content intelligence with the practical states that make an import flow trustworthy: progress, recovery, and useful output.',
    ],
  },
  {
    id: 'companion',
    index: '03',
    label: 'Selected work',
    title: 'Cross-platform AI companion',
    summary:
      'Delivered one conversation model across Next.js and Expo for character experiences, streaming messages, and persistent history.',
    details: [
      'The work connected web and mobile surfaces around a shared product model rather than treating each client as a separate experience.',
      'Streaming interaction and persistent context stayed legible to the person using it, not only to the system behind it.',
    ],
  },
];

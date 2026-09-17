type SectionIndexProps = {
  activeSectionId: string;
};

const indexEntries = [
  { id: 'work', label: '01–03 / Work' },
  { id: 'capabilities', label: '04 / Capabilities' },
  { id: 'contact', label: 'Contact' },
] as const;

export function SectionIndex({ activeSectionId }: SectionIndexProps) {
  return (
    <nav className="section-index" aria-label="Portfolio index">
      <ol>
        {indexEntries.map(({ id, label }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={activeSectionId === id ? 'location' : undefined}
            >
              {label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

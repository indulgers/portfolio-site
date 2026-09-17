import type { WorkEntry } from '../content/portfolio';

type WorkNarrativesProps = {
  entries: readonly WorkEntry[];
  expandedId: WorkEntry['id'];
  onExpandedChange: (id: WorkEntry['id']) => void;
};

export function WorkNarratives({
  entries,
  expandedId,
  onExpandedChange,
}: WorkNarrativesProps) {
  return (
    <div className="work-narratives">
      {entries.map((entry) => {
        const isExpanded = entry.id === expandedId;
        const controlId = `work-control-${entry.id}`;
        const panelId = `work-details-${entry.id}`;

        return (
          <article className="work-entry" key={entry.id}>
            <button
              aria-controls={panelId}
              aria-expanded={isExpanded}
              className="work-trigger"
              id={controlId}
              onClick={() => onExpandedChange(entry.id)}
              type="button"
            >
              <span className="work-index" aria-hidden="true">
                {entry.index}
              </span>
              <span className="work-label">{entry.label}</span>
              <span className="work-title">{entry.title}</span>
              <span className="work-symbol" aria-hidden="true">
                {isExpanded ? '−' : '+'}
              </span>
            </button>
            <p className="work-summary">{entry.summary}</p>
            <div
              aria-labelledby={controlId}
              className="work-details"
              hidden={!isExpanded}
              id={panelId}
              role="region"
            >
              {entry.details.map((detail) => (
                <p key={detail}>{detail}</p>
              ))}
            </div>
          </article>
        );
      })}
    </div>
  );
}

import { useState } from 'react';
import { SectionIndex } from './components/SectionIndex';
import { WorkNarratives } from './components/WorkNarratives';
import {
  PROFILE_URLS,
  WORK_ENTRIES,
  type WorkEntry,
} from './content/portfolio';

function ExternalMark() {
  return <span aria-hidden="true"> ↗</span>;
}

export default function App() {
  const [expandedWorkId, setExpandedWorkId] = useState<WorkEntry['id']>(
    'xmind',
  );

  return (
    <div className="site-frame">
      <a className="skip-link" href="#content">
        Skip to content
      </a>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Weiye Zhu home">
          WZ<span aria-hidden="true">.</span>
        </a>
        <p>Full-Stack Engineer</p>
      </header>

      <main id="content">
        <section className="hero" id="top" aria-labelledby="hero-heading">
          <div className="hero-copy">
            <p className="availability">Available for global product teams</p>
            <h1 id="hero-heading">Weiye Zhu</h1>
            <p className="hero-summary">
              I build AI-native product experiences from interaction model to
              production release.
            </p>
            <p className="hero-detail">
              TypeScript across the stack. Product-minded interfaces,
              dependable services, and agent systems that belong inside real
              workflows.
            </p>
            <div className="profile-links" aria-label="Professional profiles">
              <a href={PROFILE_URLS.github} target="_blank" rel="noreferrer">
                GitHub<ExternalMark />
              </a>
              <a
                href={PROFILE_URLS.linkedIn}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn<ExternalMark />
              </a>
            </div>
          </div>

          <aside className="hero-index" aria-label="Reading index">
            <p>Index</p>
            <SectionIndex activeSectionId="work" />
          </aside>
        </section>

        <div className="reading-layout">
          <aside className="desktop-index" aria-label="Reading index">
            <p>Index</p>
            <SectionIndex activeSectionId="work" />
          </aside>

          <div className="reading-flow">
            <section className="work-section" id="work" aria-labelledby="work-heading">
              <header className="section-heading">
                <span aria-hidden="true">01–03</span>
                <h2 id="work-heading">Previous work at Xmind</h2>
                <p>
                  Three product narratives: work shaped around knowledge,
                  imports, and a shared AI conversation model.
                </p>
              </header>
              <WorkNarratives
                entries={WORK_ENTRIES}
                expandedId={expandedWorkId}
                onExpandedChange={setExpandedWorkId}
              />
            </section>

            <section
              className="capabilities-section"
              id="capabilities"
              aria-labelledby="capabilities-heading"
            >
              <header className="section-heading">
                <span aria-hidden="true">04</span>
                <h2 id="capabilities-heading">Capabilities</h2>
              </header>
              <ul className="capabilities-list">
                <li>
                  <strong>Product surface</strong>
                  <span>
                    React, Next.js, stateful workflows, and high-fidelity
                    interfaces.
                  </span>
                </li>
                <li>
                  <strong>Systems delivery</strong>
                  <span>
                    Node.js, NestJS, APIs, asynchronous jobs, and integrations.
                  </span>
                </li>
                <li>
                  <strong>AI-native interaction</strong>
                  <span>
                    Streaming, tool calling, structured output, and context
                    design.
                  </span>
                </li>
              </ul>
            </section>

            <section className="closing" id="contact" aria-labelledby="contact-heading">
              <header className="section-heading">
                <span aria-hidden="true">05</span>
                <h2 id="contact-heading">Let&apos;s build products people return to.</h2>
              </header>
              <div className="closing-links">
                <a
                  href={PROFILE_URLS.linkedIn}
                  target="_blank"
                  rel="noreferrer"
                >
                  Start on LinkedIn<ExternalMark />
                </a>
                <a href={PROFILE_URLS.github} target="_blank" rel="noreferrer">
                  Review my GitHub<ExternalMark />
                </a>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer>
        <span>Weiye Zhu</span>
        <span>Static portfolio · AWS delivery project</span>
      </footer>
    </div>
  );
}

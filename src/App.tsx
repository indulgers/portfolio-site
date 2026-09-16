const githubUrl = 'https://github.com/indulgers';
const linkedInUrl = 'https://www.linkedin.com/in/weiye-zhu-211ba33b7/zh/';

function ExternalMark() {
  return <span aria-hidden="true"> ↗</span>;
}

export default function App() {
  return (
    <div className="site-frame">
      <a className="skip-link" href="#content">Skip to content</a>
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Weiye Zhu home">
          WZ<span aria-hidden="true">.</span>
        </a>
        <nav aria-label="Page sections">
          <a href="#work">Work</a>
          <a href="#toolkit">Toolkit</a>
          <a href="#contact">Contact</a>
        </nav>
      </header>

      <main id="content">
        <section className="hero section-shell" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Full-Stack Engineer</p>
            <h1>Weiye Zhu</h1>
            <p className="hero-summary">I build AI-native product experiences from interaction model to production release.</p>
            <p className="hero-detail">TypeScript across the stack. Product-minded interfaces, dependable services, and agent systems that belong inside real workflows.</p>
            <div className="profile-links" aria-label="Professional profiles">
              <a href={githubUrl} target="_blank" rel="noreferrer">GitHub<ExternalMark /></a>
              <a href={linkedInUrl} target="_blank" rel="noreferrer">LinkedIn<ExternalMark /></a>
            </div>
          </div>

          <aside className="delivery-panel" aria-label="How I work">
            <p className="panel-title">How I work</p>
            <ol>
              <li><span>01</span><p>Shape the product surface around a real user workflow.</p></li>
              <li><span>02</span><p>Connect the client, service, model context, and tools.</p></li>
              <li><span>03</span><p>Ship, observe, and iterate with product signals.</p></li>
            </ol>
          </aside>
        </section>

        <section className="current-role section-shell" aria-labelledby="current-role-heading">
          <div className="section-intro">
            <p className="eyebrow">Now</p>
            <h2 id="current-role-heading">Currently at Xmind</h2>
          </div>
          <div className="current-role-copy">
            <p>Building AI-enabled knowledge work in a collaborative SaaS, from canvas interaction and streaming agent experiences to product analytics and reliable release work.</p>
            <ul className="role-signals" aria-label="Current role highlights">
              <li>AI interaction design</li>
              <li>Full-stack delivery</li>
              <li>Product analytics</li>
            </ul>
          </div>
        </section>

        <section className="work-section section-shell" id="work" aria-labelledby="selected-work-heading">
          <div className="section-intro">
            <p className="eyebrow">Selected work</p>
            <h2 id="selected-work-heading">Selected work</h2>
            <p className="section-summary">Products with real boundaries</p>
          </div>
          <div className="work-list">
            <article>
              <div className="work-meta">AI systems · SaaS</div>
              <h3>AI agent canvas for knowledge work</h3>
              <p>Built the frontend, backend, and agent workflow for contextual, multi-turn assistance inside a collaborative mind-mapping SaaS.</p>
            </article>
            <article>
              <div className="work-meta">Content intelligence · Imports</div>
              <h3>Multimodal documents to mind maps</h3>
              <p>Helped turn text, Markdown, images, Sketch files, and PDFs into editable mind maps through a dependable import workflow.</p>
            </article>
            <article>
              <div className="work-meta">Web + mobile · AI chat</div>
              <h3>Cross-platform AI companion</h3>
              <p>Delivered a shared conversation model across Next.js and Expo, covering character experiences, streaming messages, and persistent history.</p>
            </article>
          </div>
        </section>

        <section className="toolkit-section section-shell" id="toolkit" aria-labelledby="toolkit-heading">
          <div className="section-intro">
            <p className="eyebrow">Capabilities</p>
            <h2 id="toolkit-heading">End-to-end toolkit</h2>
          </div>
          <ul className="toolkit-list">
            <li><strong>TypeScript</strong><span>Shared types, resilient domain models, and modern tooling.</span></li>
            <li><strong>React &amp; Next.js</strong><span>High-fidelity interfaces, SSR, stateful flows, and performance.</span></li>
            <li><strong>Node.js &amp; NestJS</strong><span>APIs, auth, async jobs, file processing, and integrations.</span></li>
            <li><strong>AI agent systems</strong><span>Tool calling, streaming, structured output, and context design.</span></li>
          </ul>
        </section>

        <section className="closing section-shell" id="contact" aria-labelledby="contact-heading">
          <div>
            <p className="eyebrow">Open to conversations</p>
            <h2 id="contact-heading">Let&apos;s build products people return to.</h2>
          </div>
          <div className="closing-links">
            <a href={linkedInUrl} target="_blank" rel="noreferrer">Start on LinkedIn<ExternalMark /></a>
            <a href={githubUrl} target="_blank" rel="noreferrer">Review my GitHub<ExternalMark /></a>
          </div>
        </section>
      </main>

      <footer>
        <span>Weiye Zhu</span>
        <span>Built as a static, production-ready web delivery project.</span>
      </footer>
    </div>
  );
}

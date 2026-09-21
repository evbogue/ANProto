export const portfolio = `
  <div id="scroller">
    <div class="message portfolio-intro">
      <div class="portfolio-label">ANPROTO / PORTFOLIO</div>
      <h1>Signed messages. Any network.</h1>
      <p>One line of work about durable identity, portable history, and collaboration.</p>
    </div>

    <div class="message">
      <div class="portfolio-label">THE LINEAGE</div>
      <div class="lineage-map" aria-label="SSB and Bogbook inform ANProto, which powers Wiredove">
        <div class="lineage-sources">
          <div class="lineage-node"><strong>SSB</strong><span>full peer-to-peer network</span></div>
          <div class="lineage-node"><strong>Bogbook</strong><span>signed-feed experiment</span></div>
        </div>
        <div class="lineage-arrow" aria-hidden="true">→</div>
        <div class="lineage-node active"><strong>ANProto</strong><span>signing protocol; transport left open</span></div>
        <div class="lineage-arrow" aria-hidden="true">→</div>
        <div class="lineage-node"><strong>Wiredove</strong><span>client for posts, media, and collaboration</span></div>
      </div>
      <p class="timeline-note">SSB and Bogbook are influences, not dependencies. Wiredove currently uses ANProto with APDS and browser-to-browser rooms.</p>
    </div>

    <div class="message">
      <div class="portfolio-label">TIMELINE</div>
      <ol class="timeline">
        <li><time>2009–now</time><div><strong>evbogue.com</strong><span>Archive and field journal.</span></div></li>
        <li><time>2014</time><div><strong>Secure Scuttlebutt</strong><span>Signed personal feeds and peer-to-peer replication.</span></div></li>
        <li><time>2016</time><div><strong>Decent</strong><span>An SSB client lineage that continues in ssbc.</span></div></li>
        <li><time>2020</time><div><strong>Bogbook</strong><span>Independent research into signed social feeds.</span></div></li>
        <li><time>2022</time><div><strong>Bogbook v3</strong><span>Backwards synchronization from the newest known post.</span></div></li>
        <li><time>2024</time><div><strong>Wiredove</strong><span>Local-first social client begins.</span></div></li>
        <li><time>2025</time><div><strong>ANProto</strong><span>Small, portable authentication protocol.</span></div></li>
        <li><time>2026</time><div><strong>Interoperability → agent harness</strong><span>Shared media, delegated agents, and Wave-like collaboration.</span></div></li>
      </ol>
    </div>

    <div class="message portfolio-now">
      <div class="portfolio-label">NOW</div>
      <p><strong>Wiredove:</strong> interoperable posts and media → delegated agents → durable shared work.</p>
    </div>
  </div>
`;

export const sandbox = `
  <main id="scroller" class="sandbox-page">
    <section class="message mission-hero">
      <div class="portfolio-label">ANPROTO / LOCAL SANDBOX</div>
      <h1>Make a signed post. Keep it here.</h1>
      <p>This is a non-relayed ANProto messaging experiment.</p>
    </section>

    <section class="message sandbox-warning" role="note">
      <div class="portfolio-label">LOCAL ONLY</div>
      <p><strong>Your posts never leave this browser.</strong> There is no relay, server feed, account, or connection to other visitors.</p>
      <p>Closing this tab is fine. Clearing this browser’s site data removes the identity and posts.</p>
    </section>

    <section class="message">
      <div class="portfolio-label">WRITE</div>
      <label for="sandbox-body">A short post</label>
      <textarea id="sandbox-body" maxlength="2000" placeholder="What are you working on?"></textarea>
      <div class="sandbox-actions">
        <button id="sandbox-publish" type="button" disabled>Sign and save locally</button>
        <span id="sandbox-identity" class="pubkey"></span>
      </div>
      <p id="sandbox-notice" class="sandbox-notice" aria-live="polite"></p>
    </section>

    <section class="message sandbox-identity-controls">
      <div class="portfolio-label">LOCAL IDENTITY</div>
      <p>Generate a key here. It stays in this browser and signs your sandbox posts.</p>
      <div class="sandbox-actions">
        <button id="sandbox-generate-key" type="button">Generate local key</button>
        <button id="sandbox-clear" type="button">Clear sandbox data</button>
      </div>
    </section>

    <section class="message">
      <div class="portfolio-label">YOUR LOCAL POSTS</div>
      <p id="sandbox-empty">Nothing here yet. Your first post creates a local ANProto identity.</p>
      <div id="sandbox-feed" class="sandbox-feed"></div>
    </section>
  </main>
  <script type="module" src="/sandbox_app.js"></script>
`;

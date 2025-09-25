# ANProto Roadmap

### Authenticated Non-networked Protocol (ANProto)

ANProto should be implemented in as many programming languages as possible so that it is useful to many programmers in different environments.

- [x] JavaScript https://github.com/evbogue/anproto
- [x] Golang https://github.com/vic/goan
- [x] Rust https://github.com/vic/anproto-rs/
- [ ] Zig
- [ ] C
- [ ] Python
- [ ] Haskell
- [ ] etc

### A Personal Data Server (apds)

apds authenticates and stores ANProto messages and blobs

This document only specifies what needs to happen with the JavaScript implementation.

- [x] Generate and save keypairs
- [x] Compose messages
- [x] Verify messages
- [x] Add messages to a DB
- [x] Query and search the DB
- [ ] Remove messages from a DB  
- [ ] Block content from authors or specific messages from being added to a DB
- [ ] Websocket server (move over from Dovepub)
- [ ] HTTP server (move over from Dovepub)
- [ ] Static message browser
- [ ] Web 2.0 login/password with server-held keys

### Wiredove PoC Webapp (wd)

Wiredove is a proof of concept progressive web app (PWA) that allows users to interact local and remote APDSes.

Networking -- connects Wiredove to remote PDSes

- [x] Trystero
- [x] Websockets
- [ ] Does ws reconnect?

User interface

- [x] clientside hashrouter
- [x] profile pages
- [x] chronological feed
- [x] post composer
- [ ] "for you" feed
- [ ] bios on profile pages
- [ ] banners on profile pages
- [ ] notifications
- [ ] likes/hearts/emojis?
- [ ] delete specific blobs/posts/users
- [ ] client side mute

Random errors that need to get fixed

- [ ] new posts should show up in the right places
- [ ] lost posts?
- [ ] double posts with different hashes?
- [ ] slow page load on mobile

### React Native App

- [ ] profile pages
- [ ] chronological feed
- [ ] apds support? or just a lite client?
- [ ] notifications page with read/unread state

### Open questions

- [ ] Do we support encrypted dms?

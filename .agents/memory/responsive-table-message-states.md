---
name: Responsive table message states
description: Prevent empty and error messages from being clipped inside horizontally scrolling tables on mobile.
---

When a table is showing an empty or error message, its compact state must override any normal minimum-width rule and let the message wrap. Hide column headers when they do not help explain an empty result.

**Why:** A generic state class can lose to a later, table-specific minimum-width selector. The table then stays wider than the viewport and centers its message off-screen.

**How to apply:** Give the table a message-state class, make its selector at least as specific as the normal width rule, and verify empty holdings, empty history, and no-search-results states at mobile width.
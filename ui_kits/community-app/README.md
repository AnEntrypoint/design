# Community App UI Kit

The chat and community application in one kit: `mountCommunityApp` driven by a self-contained mock adapter (no backend). It covers everything the standalone chat kit used to show (message thread, composer, rooms and direct messages) together with the server rail, channels, voice and members.

The thread is sample data between fictional people (priya, tomas) about this design system. Message types in it: plain text with reactions, code, markdown, image, PDF/file attachments, link card, read receipts and a typing indicator. Reactions toggle, replies and sending go through the same adapter actions a real consumer supplies.

Components used: `Chat`, `ChatComposer`, `ChatMessage` and the `cm-*` community surfaces, mounted by `mountCommunityApp`.

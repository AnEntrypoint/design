# file browser ui_kit

static demo of the 247420 file-browser surface.

## what's in here

- `index.html`: buildless shell, importmap to `../../vendor/webjsx`, raw `colors_and_type.css` + `app-shell.css` from the repo root.
- `app.js`: mounts `AppShell + FileToolbar + DropZone + FileGrid + FileViewer + ConfirmDialog + PromptDialog`. mock data only, no backend.

## consuming the components

```js
import {
    FileGrid, FileRow, FileToolbar, DropZone, UploadProgress,
    BreadcrumbPath, EmptyState,
    FileViewer, FilePreviewMedia, FilePreviewCode, FilePreviewText,
    ConfirmDialog, PromptDialog
} from 'anentrypoint-design';
```

each FileRow takes `{ name, type, size, modified, onOpen, onAction }`. `type` is one of:

| type     | icon color token |
| -------- | ---------------- |
| dir      | --accent-ink |
| image    | --mascot |
| video    | --purple-2 |
| audio    | --sky |
| code     | --green-2 |
| archive  | --flame |
| document | --amber |
| symlink  | --purple |
| text, other | default |

the icon color comes from `data-file-type` on the row; the row rail itself is neutral. never apply `.rail-*` classes manually to file rows. css owns the mapping.

## from a real backend

swap `SAMPLE` for an api response and route `onAction('delete' | 'rename' | 'download', file)` to your endpoints. the canonical wiring is in [`fsbrowse`](https://github.com/AnEntrypoint/fsbrowse), Express + busboy backend, this exact frontend.

## run locally

```sh
npx --yes serve -l 4173 .
```

then open http://localhost:4173/index.html.

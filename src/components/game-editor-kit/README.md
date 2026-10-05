# Game Editor Kit

UI components for game editors and interactive tools. Pure UI layer with no backend dependencies; all components are consumer-facing and ready for CDN delivery via importmap.

## DamageNumbers

Floating damage text over a 3D scene. Each number is projected from a world position to the screen, rises, fades and is removed.

### Usage

```javascript
import { createDamageNumbers } from 'anentrypoint-design';

const damageNumbers = createDamageNumbers(scene, camera, {
  defaultDuration: 1500,
  useLargerFontForBigDamage: true
});

damageNumbers.addNumber(50, { x: 10, y: 5, z: 20 });

function animate() {
  requestAnimationFrame(animate);
  damageNumbers.update();
  renderer.render(scene, camera);
}

window.addEventListener('beforeunload', () => damageNumbers.cleanup());
```

Every config key is optional: with none, color and size come from the theme's `--danger-ink` / `--fs-h2` tokens.

### API

#### `createDamageNumbers(scene, camera, config)`

- `scene`: accepted so the call matches the host's scene setup; the projection does not use it.
- `camera` (THREE.Camera): used for world-to-screen projection. A real `THREE.PerspectiveCamera`/`OrthographicCamera` works directly (the projection is `Vector3.project(camera)`, run through the Vector3 class the camera's own position carries, so nothing imports `three`), and its matrices are refreshed before each projection. A camera-like object exposing `project({x,y,z})` also works.
- `config` (Object, optional; `null` is treated as `{}`):
  - `container` (HTMLElement): the element whose on-screen box the 3D view occupies. Defaults to the viewport. Numbers are not mounted inside it: they live in their own layer on `document.body`, so a re-render of the container cannot delete them and a CSS transform or border on it cannot mis-place them.
  - `defaultColor` (string): Default color. Defaults to the theme's `--danger-ink` token.
  - `defaultFontSize` (number): Default font size in pixels; a non-positive or non-finite value is ignored. Defaults to the theme's `--fs-h2` token.
  - `defaultDuration` (number): Lifetime in milliseconds. Defaults to `1500`.
  - `maxActive` (number): Most numbers on screen at once. Defaults to `200`; past it the oldest is retired first. A non-positive or non-finite value falls back to the default; a fraction floors, with a minimum of `1`.
  - `useLargerFontForBigDamage` (boolean): Scale font size with the displayed damage. Defaults to `true`.

Returns `{ addNumber, update, getActiveNumbers, cleanup }`.

#### `addNumber(damage, worldPos, options)`

Create and display a floating damage number at a world position.

- `damage`: a finite number, or a non-empty numeric string. Anything else (`null`, `NaN`, `Infinity`, booleans, arrays, objects, blank strings) returns `null`. The displayed value is the magnitude with the fraction dropped (`-25.5` shows `25`); values above `999999999` are clamped.
- `worldPos` (Vector3 | {x, y, z}): world-space position. The number is centred on the projected point.
- `options` (Object, optional; `null` is treated as `{}`):
  - `color` (string): Override the color for this number.
  - `duration` (number): Override the lifetime in milliseconds; a non-positive or non-finite value uses the default.
  - `floatDistance` (number): Upward float in pixels. Defaults to `60`.

Returns the entry object, or `null` when nothing can be drawn: no camera, no `document.body`, invalid `damage`, a non-finite position, a position behind the camera or past the far plane, or a position outside the viewport.

#### `update()`

Advance every live number: fade, rise, and remove those past their lifetime. Call each frame. Lifetime is measured on a monotonic clock (`performance.now()`), so a system clock change cannot make a number vanish early or linger. It is wall time, not a per-call delta: a paused render loop still lets numbers expire.

#### `getActiveNumbers()`

Copies of the live numbers: `{ damage, worldPos, screenPos, elapsed, duration, progress }`. `screenPos` is where the number was placed when it was added; it does not follow the camera afterwards.

#### `cleanup()`

Remove every number and the layer. Safe to call repeatedly.

### Behaviour and limits

- **Overload**: a burst (thousands of `addNumber` calls in one frame) sheds the oldest numbers once `maxActive` is reached instead of growing the DOM with the hit rate.
- **Layering**: nearer numbers draw above farther ones, ranked by distance to the camera.
- **A throwing camera or container**: `addNumber` propagates the error with its cause. Every option and position is read before anything is mounted, so a failure leaves no element or entry behind and a retry does not double-apply.
- **Host removes the elements or the layer**: `update()` and `cleanup()` still retire the entries without throwing, and the next `addNumber` creates a fresh layer.
- **Reduced motion**: with `prefers-reduced-motion: reduce` the number fades but does not rise.
- **Viewport-fixed**: numbers are `position: fixed` at the spot they were placed. They do not follow the world point if the camera moves or the page scrolls during their short life.
- **Node.js**: the module loads without a DOM; `addNumber` returns `null` there.

### Styling

Numbers use the `.ds-damage-number` class (defined in `editor-primitives.css`, which the `247420.css` bundle includes) inside a layer that carries the `.ds-247420` scope class and the app root's `data-theme` / `data-accent` / `data-density` / `data-typescale`, so the bundled stylesheet applies wherever the app root is. JS sets only what varies per number: position, opacity and the custom properties `--ds-damage-float`, `--ds-damage-rank`, `--ds-damage-scale`, plus `--ds-damage-color` / `--ds-damage-size` when you pass `defaultColor` / `defaultFontSize`. Override from CSS with the scope prefix, or the bundled rule (specificity 0,2,0) wins:

```css
.ds-247420 .ds-damage-number {
  font-family: 'MyFont', sans-serif;
  text-shadow: 0 2px 4px var(--scrim-strong);
}
```

The layer is `display: contents`, so it takes no space in the page layout.

### Browser Compatibility

- Modern browsers with ES6 module support.
- Works in both browser and server-side (Node.js) environments.
- No polyfills required.

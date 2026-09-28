# Game Editor Kit

UI components for game editors and interactive tools. Pure UI layer with no backend dependencies — all components are consumer-facing and ready for CDN delivery via importmap.

## DamageNumbers

Floating damage text rendering in 3D world space. Creates animated damage indicators that float above hit points, fade out over time.

### Usage

```javascript
import { createDamageNumbers } from 'anentrypoint-design';

// Create manager with THREE.js scene and camera. Every config key is optional:
// with none, color and size come from the theme's --danger / --fs-h2 tokens.
const damageNumbers = createDamageNumbers(scene, camera, {
  defaultDuration: 1500,
  useLargerFontForBigDamage: true
});

// Show damage at world position
damageNumbers.addNumber(50, { x: 10, y: 5, z: 20 });

// Update each frame
function animate() {
  requestAnimationFrame(animate);
  damageNumbers.update(deltaTime);
  renderer.render(scene, camera);
}

// Cleanup on destroy
window.addEventListener('beforeunload', () => {
  damageNumbers.cleanup();
});
```

### API

#### `createDamageNumbers(scene, camera, config)`

Factory function creating a damage numbers manager.

**Parameters:**

- `scene` (THREE.Scene): The THREE.js scene (used for container context).
- `camera` (THREE.Camera): The THREE.js camera (used for world-to-screen projection).
- `config` (Object, optional):
  - `container` (HTMLElement): DOM container for text elements. Defaults to `document.body`, or the `.ds-247420` element when the body sits outside that style scope (the stylesheet is scoped to it, so a number mounted outside it would render unstyled).
  - `defaultColor` (string): Default color for numbers. Defaults to the theme's `--danger-ink` token.
  - `defaultFontSize` (number): Default font size in pixels. Defaults to the theme's `--fs-h2` token.
  - `defaultDuration` (number): Lifetime in milliseconds. Defaults to `1500`.
  - `useLargerFontForBigDamage` (boolean): Scale font size with damage amount. Defaults to `true`.

**Returns:** Object with methods:

#### `addNumber(damage, worldPos, options)`

Create and display a floating damage number.

**Parameters:**

- `damage` (number): Damage amount to display.
- `worldPos` (Vector3 | {x, y, z}): World-space position. Supports THREE.js Vector3 or plain `{x, y, z}` objects.
- `options` (Object, optional):
  - `color` (string): Override default color for this number.
  - `duration` (number): Override default duration in milliseconds.
  - `floatDistance` (number): Upward float distance in pixels. Defaults to `60`.

**Returns:** Entry object, or `null` when nothing can be drawn: no camera or container, a non-finite `damage` or position, a position behind the camera / past the far plane, or a position outside the viewport.

#### `update(deltaTime)`

Update all active damage numbers. Call each frame.

**Parameters:**

- `deltaTime` (number): Delta time in milliseconds. Defaults to `16` (approximately 60fps).

**Returns:** undefined.

#### `getActiveNumbers()`

Get array of currently visible numbers.

**Returns:** Array of objects with properties:
- `damage` (number): Original damage amount.
- `worldPos` ({x, y, z}): Original world position.
- `screenPos` ({x, y, z}): Current screen position.
- `elapsed` (number): Milliseconds since creation.
- `duration` (number): Total lifetime in milliseconds.
- `progress` (number): Lifecycle progress from 0 (new) to 1 (expired).

#### `cleanup()`

Dispose all resources and remove all numbers from DOM.

**Returns:** undefined.

### Features

- **3D world-space positioning**: Numbers appear above hit points using camera projection.
- **Animated fade**: Alpha fades from 1 to 0 over the duration.
- **Upward float**: Numbers rise smoothly during their lifetime.
- **Dynamic sizing**: Font size scales with damage amount (optional).
- **Custom styling**: Per-number color and duration overrides.
- **No backend dependencies**: Pure UI layer, zero game-state coupling.
- **Theme support**: CSS respects `prefers-color-scheme` for dark/light modes.

### Edge Cases

- **Positions behind camera / past the far plane**: not drawn (`addNumber` returns `null`).
- **Off-screen positions**: not drawn (`addNumber` returns `null`).
- **Rapid successive calls**: Multiple addNumber calls at same position create separate floating entries.
- **Zero/negative damage**: Displayed as absolute value.
- **Null, `NaN` or infinite damage**: `addNumber` returns `null`.
- **Zero or negative `duration`**: falls back to `defaultDuration`, so a number can never get stuck on screen.
- **Layering**: nearer numbers draw above farther ones.
- **Missing camera**: addNumber returns null if camera not provided.
- **Node.js runtime**: Loads without errors; addNumber returns null without DOM container.
- **Camera shapes**: a real `THREE.Camera` works directly (the projection is `Vector3.project(camera)`, done through the Vector3 class the camera's own position carries, so nothing imports `three`); a camera-like object exposing `project({x,y,z})` also works.
- **Reduced motion**: with `prefers-reduced-motion: reduce` the number fades but does not rise.

### Styling

Numbers use the `.ds-damage-number` class (defined in `editor-primitives.css`, which the `247420.css` bundle includes). JS sets only what varies per number -- position, opacity, and the custom properties `--ds-damage-float`, `--ds-damage-rank`, `--ds-damage-scale`, plus `--ds-damage-color` / `--ds-damage-size` when you pass `defaultColor` / `defaultFontSize` -- so color, size, weight and shadow all follow the active theme's tokens. Retune them from CSS with the theme tokens, or override the class:

```css
.ds-damage-number {
  font-family: 'MyFont', sans-serif;
  text-shadow: 0 2px 4px var(--scrim-strong);
}
```

### Browser Compatibility

- Modern browsers with ES6 module support.
- Works in both browser and server-side (Node.js) environments.
- No polyfills required.

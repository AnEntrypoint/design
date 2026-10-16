export { renderLoadingScreen } from './loading-screen.js';
export { renderGameHud, Crosshair, AmmoCounter, HealthBar, BoostIndicator } from './game-hud.js';
export { renderHostJoinLobby } from './host-join-lobby.js';

export const themeUrl = new URL('./loading-screen.css', import.meta.url).href;
export const gameHudCssUrl = new URL('./game-hud.css', import.meta.url).href;
export const lobbyCssUrl = new URL('./host-join-lobby.css', import.meta.url).href;

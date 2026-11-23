import { Game3UserPanel, Game3StatusMenu, statusPresetSeconds, statusDraftReset } from '../components/game3-user.js';
import { Game3AvatarMenu, Game3UserMenu, setupProgress } from '../components/game3-usermenus.js';
import { STATUS } from '../game3-data.js';
import { game3AvatarBg } from '../components/game3-hue.js';

export function createUserPanel(app) {
    const { root, get, A, initial, formatTime, st } = app;
    const render = () => app.render();

    const closeMenus = () => { statusDraftReset(); st.statusMenuOpen = false; st.avatarMenuOpen = false; st.userMenu = { open: false, sub: '' }; };
    const expiryLabel = (sec) => (sec ? new Date(sec * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : '');
    const userPanel = (s) => {
        const acc = s.account && s.account.signedIn ? s.account : null;
        const stt = STATUS[s.presenceStatus || 'online'] || STATUS.online;
        const name = (s.currentUser && (s.currentUser.displayName || s.currentUser.username || s.currentUser.name)) || 'You';
        const cur = acc ? acc.status : { status: s.presenceStatus || 'online', text: '', emoji: '', expiresAt: 0 };
        const setStatus = (status, text, emojiValue, presetKey, keep) => A.accountSetStatus && A.accountSetStatus({ status, text, emoji: emojiValue, durationSec: keep ? -1 : statusPresetSeconds(presetKey) });
        const goSettings = (tab) => { closeMenus(); if (A.setGamePrefTab) A.setGamePrefTab(tab); if (A.openGamePrefs) A.openGamePrefs(); render(); };
        let menu = null;
        if (!st.statusMenuOpen) statusDraftReset();
        if (st.statusMenuOpen) {
            menu = Game3StatusMenu({ status: cur.status, custom: cur.text, emoji: cur.emoji, preset: st.statusPreset, expiresLabel: expiryLabel(cur.expiresAt), onStatus: (k) => { statusDraftReset(); st.statusMenuOpen = false; setStatus(k, cur.text, cur.emoji, null, true); render(); }, onCustom: (text, em, preset) => { statusDraftReset(); st.statusMenuOpen = false; st.statusPreset = 'never'; setStatus(cur.status, text, em, preset); render(); }, onPreset: (k) => { st.statusPreset = k; render(); } });
        } else if (st.avatarMenuOpen && acc) {
            menu = Game3AvatarMenu({ hasPicture: !!acc.pub.picture, note: acc.note, onGenerate: () => A.accountGenerateAvatar && A.accountGenerateAvatar(), onUpload: (f) => A.accountUploadAvatar && A.accountUploadAvatar(f), onUrl: (u) => A.accountSavePublic && A.accountSavePublic('avatar', { picture: u }, 'Picture saved'), onRemove: () => A.accountClearAvatar && A.accountClearAvatar() });
        } else if (st.userMenu.open && acc) {
            const prog = setupProgress(acc, acc.setup || {});
            menu = Game3UserMenu({ npub: acc.npub, identities: acc.identities || [], sub: st.userMenu.sub, note: acc.note, setupLeft: prog.total - prog.done, onSub: (v) => { st.userMenu = { open: true, sub: v }; render(); }, onEdit: () => goSettings('profile'), onSettings: () => goSettings('account'), onCopyNpub: () => { A.accountCopyText(acc.npub, 'npub copied'); }, onCopyLink: () => { A.accountCopyText(A.accountProfileLink(), 'Profile link copied'); }, onSwitch: (pk) => A.accountSwitchIdentity(pk), onForget: (pk) => A.accountForgetIdentity(pk), onImport: (v) => A.accountImportNew(v), onNew: () => A.accountNewThrowaway(), onBackup: () => { closeMenus(); A.setupOpen('backup'); render(); }, onSetup: () => { closeMenus(); A.setupOpen(''); render(); }, onSignOut: () => { closeMenus(); A.accountSignOut(); render(); } });
        }
        const validate = (v) => (!String(v).trim() ? 'Name cannot be empty' : /[\u0000-\u001f\u007f]/.test(v) ? 'Name has characters that cannot be used' : '');
        const rename = st.renaming ? { value: st.renaming.value, error: st.renaming.error, onInput: (v) => { st.renaming.value = v; }, onCancel: () => { st.renaming = null; render(); }, onCommit: async (v) => { const err = validate(v); st.renaming = { value: v, error: err, focused: true }; if (err) { render(); return; } const done = await A.accountRename(v); if (done) st.renaming = null; else st.renaming = { value: v, error: ((get().account || {}).note || {}).text || 'Could not save that name', focused: true }; render(); } } : null;
        return Game3UserPanel({
            statusLabel: (cur.emoji ? cur.emoji + ' ' : '') + (cur.text || stt[0]), statusColor: stt[1], menu, rename,
            onProfile: () => { const was = st.statusMenuOpen; closeMenus(); st.statusMenuOpen = !was; render(); },
            onAvatar: () => { const was = st.avatarMenuOpen; closeMenus(); st.avatarMenuOpen = !was && !!acc; render(); },
            onContext: () => { closeMenus(); st.userMenu = { open: true, sub: '' }; render(); },
            onRenameStart: () => { if (!acc) return; closeMenus(); st.renaming = { value: name, error: '', focused: false }; render(); },
            name, color: game3AvatarBg(s.gamePrefName || (s.currentUser && (s.currentUser.username || s.currentUser.name)) || 'You', s.userId), hideInitial: !!(s.avatars && s.avatars[s.userId]),
            muted: !!s.micMuted, onMute: () => A.toggleMic && A.toggleMic(), onSettings: () => A.openGamePrefs && A.openGamePrefs(),
        });
    };

    return { userPanel, closeMenus };
}

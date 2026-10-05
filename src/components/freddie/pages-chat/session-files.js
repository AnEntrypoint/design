import { api } from '../runtime.js';
import { ignoreFailure } from '../../../best-effort.js';
import { newSessionId } from './session-id.js';

export function createSessionFiles(ctx) {
    function loadWorkspaceFiles(sid) {
        if (!sid) { ctx.state.workspaceFiles = []; return; }
        api('/api/sessions/' + encodeURIComponent(sid) + '/workspace-files').then(r => {
            ctx.state.workspaceFiles = (r && Array.isArray(r.files)) ? r.files : [];
            ctx.rerender();
        }).catch(ignoreFailure);
    }

    async function attachFiles(fileList) {
        const st = ctx.state;
        if (!st.sessionId) st.sessionId = newSessionId();
        for (const file of fileList || []) {
            try {
                const dataUrl = await new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = rej; r.readAsDataURL(file); });
                const base64 = String(dataUrl).split(',')[1] || '';
                const r = await api('/api/sessions/' + encodeURIComponent(st.sessionId) + '/files', { method: 'POST', body: { name: file.name, contentBase64: base64 } });
                if (r && r.path) { st.staged = [...st.staged, { name: r.name || file.name, path: r.path }]; }
            } catch (e) { ctx.set({ error: 'upload failed: ' + (e && e.message || e) }); }
        }
        loadStagedFiles(st.sessionId);
        ctx.rerender();
    }

    function loadStagedFiles(sid) {
        if (!sid) { ctx.state.stagedFiles = []; return; }
        api('/api/sessions/' + encodeURIComponent(sid) + '/staged-files').then(r => {
            ctx.state.stagedFiles = (r && Array.isArray(r.files)) ? r.files : [];
            ctx.rerender();
        }).catch(ignoreFailure);
    }

    return { loadWorkspaceFiles, loadStagedFiles, attachFiles };
}

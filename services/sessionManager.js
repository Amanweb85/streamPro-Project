// services/sessionManager.js
class SessionManager {
    constructor() {
        this.sessions = new Map(); // sessionId => { ws, downloads: { url:process} }
    }

    createSession(sessionId, ws) {
        this.sessions.set(sessionId, { ws, downloads: new Map() });
    }

    getSession(sessionId) {
        return this.sessions.get(sessionId);
    }

    addDownload(sessionId, videoUrl, process) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.downloads.set(videoUrl, process);
        }
    }

    cancelDownload(sessionId, videoUrl) {
        const session = this.sessions.get(sessionId); console.log("canceling video dwonload", session?.downloads?.has(videoUrl))
        if (session?.downloads?.has(videoUrl)) {
            session.downloads.get(videoUrl).kill('SIGINT');
            session.downloads.delete(videoUrl);
        }
    }

    killAll(sessionId) {
        const session = this.sessions.get(sessionId);
        if (session) {
            session.downloads.forEach(proc => proc.kill('SIGINT'));
            session.downloads.clear();
        }
    }

    deleteSession(sessionId) {
        this.sessions.delete(sessionId);
    }
}

module.exports = new SessionManager();

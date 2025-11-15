const url = require('url');
const sessionManager = require('../services/sessionManager');

const disconnectTimers = new Map();

function setupWebSocketHandlers(wss) {
    wss.on('connection', (ws, req) => {
        const { query } = url.parse(req.url, true);
        const sessionId = query.sessionId;

        if (!sessionId) {
            ws.close(1008, 'Session ID is required.');
            return;
        }
        console.log(`WebSocket connected for session: ${sessionId}`);

        // If a disconnect timer is pending, cancel it (user reconnected)
        clearDisconnectTimer(sessionId);

        const session = sessionManager.getSession(sessionId);
        if (session) {
            const oldWs = session.ws;
            if (oldWs && oldWs.readyState === WebSocket.OPEN) {
                oldWs.terminate();
            }
            session.ws = ws;
            console.log("Updated WebSocket for session:", sessionId);
        } else {
            sessionManager.createSession(sessionId, ws);
            console.log("Created new session:", sessionId);
        }



        ws.on('message', (msg) => handleMessage(sessionId, msg));
        ws.on('close', () => handleDisconnect(sessionId));
        ws.on('error', (error) => console.error(`WebSocket error for session ${sessionId}:`, error));
        ws.send(JSON.stringify({ type: 'reconnected', sessionId }));
    });
}

function handleMessage(sessionId, msg) {
    try {

        const data = JSON.parse(msg);
        if (data.action === 'cancelDownload') {
            console.log(data.url)
            sessionManager.cancelDownload(sessionId, data.url);
        }
    } catch (err) {
        console.error("WebSocket message error", err.message);
    }
}

function handleDisconnect(sessionId) {
    console.log(`WebSocket disconnected: ${sessionId}`);

    // set the timer of 2 sec to cancel all downloads of user when user disconnects
    const timer = setTimeout(() => {
        if (sessionManager.getSession(sessionId)) {
            sessionManager.killAll(sessionId);
            sessionManager.deleteSession(sessionId);
        }
        disconnectTimers.delete(sessionId);
    }, 2000);

    disconnectTimers.set(sessionId, timer);
}

// clear timer if user reconnect within 2 sec after refreshing the page
function clearDisconnectTimer(sessionId) {
    if (disconnectTimers.has(sessionId)) {
        clearTimeout(disconnectTimers.get(sessionId));
        disconnectTimers.delete(sessionId);
        console.log(`Reconnect timer cleared: ${sessionId}`);
    }
}


module.exports = {
    setupWebSocketHandlers,
};
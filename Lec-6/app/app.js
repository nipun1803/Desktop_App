import { app, BrowserWindow, ipcMain, dialog, desktopCapturer, Menu } from "electron";
import path from "path";
import fs from "fs";
import { Buffer } from "node:buffer";
import { setKioskMode, getIsKioskActive, cleanupKiosk } from "./kiosk.js";

let electronWindow = null;
let startTimestamp = null;
let cameraSnapDirectory = null;
let currentUserId = 'student-101';
let currentSessionId = 'session-default';
let allowAppQuit = false;

function getDefaultCameraSnapDirectory() {
    return path.join(import.meta.dirname, "..", "backend", "data", "snapshots");
}

function logToSession(eventData) {
    const entry = typeof eventData === 'string'
        ? { timestamp: new Date().toISOString(), message: eventData }
        : { timestamp: new Date().toISOString(), ...eventData };

    let directory = cameraSnapDirectory || getDefaultCameraSnapDirectory();
    if (currentUserId || currentSessionId) {
        const userFolder = String(currentUserId || 'unknown-user').replace(/[^a-zA-Z0-9_-]/g, '_');
        const sessionFolder = String(currentSessionId || 'unknown-session').replace(/[^a-zA-Z0-9_-]/g, '_');
        directory = path.join(directory, userFolder, sessionFolder);
    }
    try {
        fs.mkdirSync(directory, { recursive: true });

        // Save as structured JSON array in logs.json
        const jsonPath = path.join(directory, 'logs.json');
        let logs = [];
        if (fs.existsSync(jsonPath)) {
            try {
                logs = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
                if (!Array.isArray(logs)) logs = [];
            } catch {
                logs = [];
            }
        }
        logs.push(entry);
        fs.writeFileSync(jsonPath, JSON.stringify(logs, null, 2));

        // Also append JSON line to webContents.log
        const logPath = path.join(directory, 'webContents.log');
        fs.appendFileSync(logPath, JSON.stringify(entry) + '\n');
    } catch (err) {
        console.error("Failed to write session logs:", err);
    }
}

app.commandLine.appendSwitch('disable-overscroll-edge-effect');

function createWindow() {
    Menu.setApplicationMenu(null);

    electronWindow = new BrowserWindow({
        height: 1000,
        width: 1000,
        frame: false,
        fullscreenable: false,
        webPreferences: {
            devTools: false,
            preload: path.join(import.meta.dirname, 'preload.js')
        }
    })

    electronWindow.on('close', (event) => {
        if ((startTimestamp || getIsKioskActive()) && !allowAppQuit) {
            event.preventDefault();
            logToSession({ type: 'window_event', event: 'close_blocked' });
        }
    });

    electronWindow.loadURL('http://localhost:5173')
    setKioskMode(electronWindow, true);

    electronWindow.webContents.on('console-message', (_event, level, message, line, sourceId) => {
        logToSession({
            type: 'console_message',
            level,
            message,
            source: `${sourceId}:${line}`
        });
    });

    electronWindow.webContents.on('did-navigate', (_event, url) => {
        logToSession({
            type: 'navigation',
            url
        });
    });

    electronWindow.on('blur', () => {
        logToSession({ type: 'window_event', event: 'blur' });
        if (electronWindow && !electronWindow.isDestroyed()) {
            if (startTimestamp || getIsKioskActive()) {
                electronWindow.webContents.send('camera-shot');
            }
            if (getIsKioskActive()) {
                app.focus({ steal: true });
                electronWindow.show();
                electronWindow.moveTop();
                electronWindow.focus();
            }
        }
    });

    electronWindow.on('focus', () => {
        logToSession({ type: 'window_event', event: 'focus' });
    });

    electronWindow.webContents.on('before-input-event', (event, input) => {
        if (startTimestamp || getIsKioskActive()) {
            logToSession({
                type: 'keystroke',
                key: input.key,
                code: input.code,
                eventType: input.type,
                meta: input.meta || false,
                control: input.control || false,
                alt: input.alt || false,
                shift: input.shift || false
            });

            // Block Escape, reload, close, copy, paste, cut, select-all, print
            const key = input.key.toLowerCase();
            const isBlockedCombo = (input.meta || input.control) && ['w', 'r', 'c', 'v', 'x', 'a', 'p', 'q'].includes(key);
            const isDevToolsShortcut = input.key === 'F12'
                || ((input.meta || input.control) && input.shift && ['i', 'j', 'c'].includes(key));
            if (input.key === 'Escape' || isBlockedCombo || isDevToolsShortcut) {
                event.preventDefault();
            }
        }
    });

    electronWindow.webContents.on('context-menu', (e) => {
        if (startTimestamp || getIsKioskActive()) e.preventDefault();
    });
}

app.on('before-quit', (event) => {
    if ((startTimestamp || getIsKioskActive()) && !allowAppQuit) {
        event.preventDefault();
        return;
    }
    cleanupKiosk();
});

ipcMain.handle('start-kiosk', () => {
    setKioskMode(electronWindow, true);
});

let timerInterval = null;
let snapInterval = null;

ipcMain.handle('stop-kiosk', () => {
    startTimestamp = null;
    if (timerInterval) { clearInterval(timerInterval); timerInterval = null; }
    if (snapInterval) { clearInterval(snapInterval); snapInterval = null; }
    setKioskMode(electronWindow, false);
    return true;
});

ipcMain.handle('set-session', (_event, userId, sessionId) => {
    if (userId) currentUserId = userId;
    if (sessionId) currentSessionId = sessionId;
    logToSession({ type: 'session_init', userId: currentUserId, sessionId: currentSessionId });
    return true;
});

ipcMain.handle('start-timer', (_event, userId, sessionId) => {
    startTimestamp = Date.now();
    if (userId) currentUserId = userId;
    if (sessionId) currentSessionId = sessionId;

    logToSession({ type: 'exam_started', userId: currentUserId, sessionId: currentSessionId });

    // Enable Kiosk Mode when test starts (locks screen and gestures)
    setKioskMode(electronWindow, true);

    // Send Timer Tick every 1s
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed() && startTimestamp) {
            electronWindow.webContents.send('timer', (Date.now() - startTimestamp) / 1000);
        }
    }, 1000);

    // Immediate camera shot on start
    if (electronWindow && !electronWindow.isDestroyed()) {
        electronWindow.webContents.send('camera-shot');
    }

    // Capture user's camera snap and screen every 5s after quiz starts
    if (snapInterval) clearInterval(snapInterval);
    snapInterval = setInterval(() => {
        if (electronWindow && !electronWindow.isDestroyed() && startTimestamp) {
            electronWindow.webContents.send('camera-shot');
        }
    }, 5000);
})

ipcMain.handle('get-default-camera-snap-folder', () => {
    return cameraSnapDirectory || getDefaultCameraSnapDirectory();
});

ipcMain.handle('store-camera-snap-image-on-disk', (_event, data, userId, sessionId) => {
    if (userId) currentUserId = userId;
    if (sessionId) currentSessionId = sessionId;

    let directory = cameraSnapDirectory || getDefaultCameraSnapDirectory();
    if (userId || sessionId) {
        const userFolder = String(userId || 'unknown-user').replace(/[^a-zA-Z0-9_-]/g, '_');
        const sessionFolder = String(sessionId || 'unknown-session').replace(/[^a-zA-Z0-9_-]/g, '_');
        directory = path.join(directory, userFolder, sessionFolder);
    }
    fs.mkdirSync(directory, { recursive: true });
    const filePath = path.join(directory, `${Date.now()}.jpg`);
    fs.writeFileSync(filePath, Buffer.from(data));
    logToSession({ type: 'snapshot', snapshotType: 'camera', filename: path.basename(filePath) });
    return filePath;
})

ipcMain.handle('capture-screen', async (_event, userId, sessionId) => {
    if (userId) currentUserId = userId;
    if (sessionId) currentSessionId = sessionId;

    let buffer = null;
    try {
        const sources = await desktopCapturer.getSources({
            types: ['screen'],
            thumbnailSize: { width: 1920, height: 1080 }
        });
        if (sources.length > 0 && sources[0].thumbnail) {
            buffer = sources[0].thumbnail.toJPEG(80);
        }
    } catch (err) {
        console.warn("desktopCapturer unavailable, using window capture fallback:", err?.message || err);
    }

    if (!buffer && electronWindow && !electronWindow.isDestroyed()) {
        try {
            const pageImage = await electronWindow.webContents.capturePage();
            buffer = pageImage.toJPEG(80);
        } catch (captureErr) {
            console.error("Screen capture failed:", captureErr);
        }
    }

    if (!buffer) return null;

    let directory = cameraSnapDirectory || getDefaultCameraSnapDirectory();
    if (userId || sessionId) {
        const userFolder = String(userId || 'unknown-user').replace(/[^a-zA-Z0-9_-]/g, '_');
        const sessionFolder = String(sessionId || 'unknown-session').replace(/[^a-zA-Z0-9_-]/g, '_');
        directory = path.join(directory, userFolder, sessionFolder);
    }
    fs.mkdirSync(directory, { recursive: true });
    const filePath = path.join(directory, `screen_${Date.now()}.jpg`);
    fs.writeFileSync(filePath, buffer);
    logToSession({ type: 'snapshot', snapshotType: 'screen', filename: path.basename(filePath) });
    return filePath;
})

ipcMain.handle('quit-app', () => {
    if (startTimestamp || getIsKioskActive()) return false;
    allowAppQuit = true;
    app.quit();
    return true;
})

ipcMain.handle('choose-camera-snap-folder', async () => {
    const result = await dialog.showOpenDialog(electronWindow, {
        title: "Choose where to store camera shots",
        defaultPath: cameraSnapDirectory || getDefaultCameraSnapDirectory(),
        properties: ["openDirectory", "createDirectory"]
    });

    if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, path: cameraSnapDirectory };
    }

    cameraSnapDirectory = result.filePaths[0];
    return { canceled: false, path: cameraSnapDirectory };
});

ipcMain.handle('choose-camera-snap-file', async () => {
    const result = await dialog.showOpenDialog(electronWindow, {
        title: "Select a camera shot",
        defaultPath: cameraSnapDirectory || getDefaultCameraSnapDirectory(),
        properties: ["openFile"],
        filters: [{ name: "Images", extensions: ["jpg", "jpeg", "png"] }]
    });

    return {
        canceled: result.canceled,
        path: result.canceled ? null : result.filePaths[0]
    };
});

ipcMain.handle('show-camera-storage-dialog', async () => {
    const result = await dialog.showMessageBox(electronWindow, {
        type: "question",
        title: "Camera shot storage",
        message: "Choose how Athena should store camera shots.",
        detail: `Current folder: ${cameraSnapDirectory || getDefaultCameraSnapDirectory()}`,
        checkboxLabel: "Automatically save camera shots",
        checkboxChecked: true,
        buttons: ["Use this folder", "More"],
        defaultId: 0,
        cancelId: 0
    });

    return {
        response: result.response,
        checkboxChecked: result.checkboxChecked,
        path: cameraSnapDirectory || getDefaultCameraSnapDirectory()
    };
});


ipcMain.on("show-rules", () => {
    dialog.showMessageBox(electronWindow, {
        type: "info",
        title: "Athena Exam Rules",
        message: "Exam Rules",
        detail:
            "1. Stay on the exam screen.\n" +
            "2. Camera must remain enabled.\n" +
            "3. Do not leave the exam.\n" +
            "4. Do not use external assistance.\n" +
            "5. Click Exit Exam when finished."
    });
});


app.whenReady().then(createWindow);

import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";

let window = null;
let startTimestamp = null

function createWindow() {
    window = new BrowserWindow({
        height: 1000,
        width: 1000,
        webPreferences: {
            devTools: true,
            preload: path.join(import.meta.dirname, 'preload.js')
        }
    })

    window.loadURL('http://localhost:5173')
}

ipcMain.handle('start-timer', () => {
    startTimestamp = Date.now();
    const timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimestamp) / 1000);
        if (window && !window.isDestroyed()) {
            window.webContents.send('timer', elapsed);
        }
        if (elapsed >= 10) {
            clearInterval(timerInterval);
            app.quit();
        }
    }, 1000);
});

ipcMain.handle('quit-app', () => {
    app.quit();
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    app.quit();
});
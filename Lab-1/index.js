const { app, BrowserWindow } = require("electron");

function createWindow() {
    const window = new BrowserWindow({
        height: 400,
        width: 400,
    })

    window.loadFile('index.html')
    window.webContents.openDevTools();
}

app.whenReady().then(createWindow);
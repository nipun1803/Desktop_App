const { contextBridge, ipcRenderer } = require("electron");

const musicAPI = {
    start: (songIndex) => ipcRenderer.invoke("start", songIndex),
    play: () => ipcRenderer.invoke("play"),
    pause: () => ipcRenderer.invoke("pause"),
    stop: () => ipcRenderer.invoke("stop"),
    next: () => ipcRenderer.invoke("next"),
    prev: () => ipcRenderer.invoke("prev"),
    setVolume: (level) => ipcRenderer.invoke("setVolume", level),
    seek: (seconds, isAbsolute) => ipcRenderer.invoke("seek", seconds, isAbsolute),
    getSongs: () => ipcRenderer.invoke("getSongs"),
    getStatus: () => ipcRenderer.invoke("getStatus"),
    onStateUpdate: (callback) => {
        const subscription = (event, state) => callback(state);
        ipcRenderer.on('player-state-update', subscription);
        return () => {
            ipcRenderer.removeListener('player-state-update', subscription);
        };
    }
};

contextBridge.exposeInMainWorld("musicAPI", musicAPI);
contextBridge.exposeInMainWorld("music", musicAPI);
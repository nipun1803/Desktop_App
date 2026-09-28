
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld("athena", {
    registerListenerForTimerTickFromMain: (callback) => {
        // callback is setTimer
        const fn = (event, message) => {
            callback(message);
        }

        ipcRenderer.on('timer', fn);

        return () => {
            ipcRenderer.removeListener('timer', fn);
        }
    },
    startTimerOnMain: (userId, sessionId) => {
        try {
            return ipcRenderer.invoke('start-timer', userId, sessionId);
        } catch (error) {
            throw "error";
        }
    },

    // New Preload Functions

    // Functions related to capturing camera snaps of user
    registerListenerForCameraSnapFromMain: (callback) => {
        ipcRenderer.on('camera-shot', callback);

        return () => {
            ipcRenderer.removeListener('camera-shot', callback);
        }
    },

    storeCameraSnapImageOnDisk: (data, userId, sessionId) => {
        return ipcRenderer.invoke('store-camera-snap-image-on-disk', data, userId, sessionId);
    },
    captureScreen: (userId, sessionId) => {
        return ipcRenderer.invoke('capture-screen', userId, sessionId).catch(() => null);
    },

    getDefaultCameraSnapFolder: () => ipcRenderer.invoke('get-default-camera-snap-folder').catch(() => null),
    setSession: (userId, sessionId) => ipcRenderer.invoke('set-session', userId, sessionId),
    enableKiosk: () => ipcRenderer.invoke('start-kiosk'),
    disableKiosk: () => ipcRenderer.invoke('stop-kiosk'),
    quitApp: () => ipcRenderer.invoke('quit-app'),
    chooseCameraSnapFolder: () => ipcRenderer.invoke('choose-camera-snap-folder'),
    chooseCameraSnapFile: () => ipcRenderer.invoke('choose-camera-snap-file'),
    showCameraStorageDialog: () => ipcRenderer.invoke('show-camera-storage-dialog'),

    // Functions related to showing Contest Rules in a new Dialog
    showRules: () => {
        ipcRenderer.send("show-rules");
    }
})

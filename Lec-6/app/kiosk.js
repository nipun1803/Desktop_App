import { app, globalShortcut } from "electron";
import { exec } from "child_process";

let isKioskActive = false;
let focusWatchdogInterval = null;

const BLOCKED_SHORTCUTS = [
    'Control+Left', 'Control+Right', 'Control+Up', 'Control+Down',
    'F3', 'Alt+Tab', 'CommandOrControl+Tab',
    'CommandOrControl+Shift+Tab', 'CommandOrControl+W', 'CommandOrControl+R',
    'CommandOrControl+Shift+I', 'CommandOrControl+Shift+J',
    'CommandOrControl+H', 'CommandOrControl+M', 'CommandOrControl+Q',
    'CommandOrControl+Option+Escape', 'CommandOrControl+Space'
];

export function registerLockdownShortcuts() {
    BLOCKED_SHORTCUTS.forEach(key => {
        try { globalShortcut.register(key, () => {}); } catch {}
    });
}

export function unregisterLockdownShortcuts() {
    BLOCKED_SHORTCUTS.forEach(key => {
        try { globalShortcut.unregister(key); } catch {}
    });
}

export function toggleMacGestures(enable) {
    if (process.platform !== 'darwin') return;
    const val = enable ? 2 : 0;
    const rightEdge = enable ? 3 : 0;
    const exposeDisabled = enable ? 'false' : 'true';
    const cmds = [
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerHorizSwipeGesture -int ${val}`,
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadThreeFingerVertSwipeGesture -int ${val}`,
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadFourFingerHorizSwipeGesture -int ${val}`,
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadFourFingerVertSwipeGesture -int ${val}`,
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadFourFingerPinchGesture -int ${val}`,
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadFiveFingerPinchGesture -int ${val}`,
        `defaults write com.apple.AppleMultitouchTrackpad TrackpadTwoFingerFromRightEdgeSwipeGesture -int ${rightEdge}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadThreeFingerHorizSwipeGesture -int ${val}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadThreeFingerVertSwipeGesture -int ${val}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadFourFingerHorizSwipeGesture -int ${val}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadFourFingerVertSwipeGesture -int ${val}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadFourFingerPinchGesture -int ${val}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadFiveFingerPinchGesture -int ${val}`,
        `defaults write com.apple.driver.AppleBluetoothMultitouch.trackpad TrackpadTwoFingerFromRightEdgeSwipeGesture -int ${rightEdge}`,
        `defaults write com.apple.dock mcx-expose-disabled -bool ${exposeDisabled}`
    ].join('; ');
    exec(cmds, () => {});
}

export function startFocusWatchdog(electronWindow) {
    stopFocusWatchdog();
    focusWatchdogInterval = setInterval(() => {
        if (isKioskActive && electronWindow && !electronWindow.isDestroyed()) {
            if (!electronWindow.isFocused()) {
                app.focus({ steal: true });
                electronWindow.show();
                electronWindow.moveTop();
                electronWindow.focus();
            }
        }
    }, 150);
}

export function stopFocusWatchdog() {
    if (focusWatchdogInterval) {
        clearInterval(focusWatchdogInterval);
        focusWatchdogInterval = null;
    }
}

export function setKioskMode(electronWindow, enable) {
    if (!electronWindow || electronWindow.isDestroyed()) return;
    try {
        isKioskActive = enable;
        if (enable) {
            toggleMacGestures(false);
            registerLockdownShortcuts();
            startFocusWatchdog(electronWindow);
            electronWindow.setKiosk(true);
            electronWindow.setAlwaysOnTop(true, "screen-saver", 1000);
            electronWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
            app.focus({ steal: true });
            electronWindow.moveTop();
            electronWindow.focus();
        } else {
            stopFocusWatchdog();
            unregisterLockdownShortcuts();
            toggleMacGestures(true);
            electronWindow.setKiosk(false);
            electronWindow.setAlwaysOnTop(false);
            electronWindow.setVisibleOnAllWorkspaces(false);
        }
    } catch (err) {
        console.error("Failed to toggle kiosk mode:", err);
    }
}

export function getIsKioskActive() {
    return isKioskActive;
}

export function cleanupKiosk() {
    stopFocusWatchdog();
    unregisterLockdownShortcuts();
    toggleMacGestures(true);
}

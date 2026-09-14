import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const songsDir = path.resolve(__dirname, '../songs');

let mainWindow = null;
let musicProcess = null;
let currentIndex = 0;
let currentSong = null;
let isPaused = false;
let isPlaying = false;
let currentVolume = 80;
let currentTime = 0;
let duration = 0;
let timePollInterval = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 760,
        width: 680,
        minHeight: 650,
        minWidth: 520,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

function getAvailableSongs() {
    try {
        if (!fs.existsSync(songsDir)) return ['first.mp3', 'second.mp3', 'third.mp3'];
        const files = fs.readdirSync(songsDir).filter(f => /\.(mp3|wav|ogg|m4a|flac)$/i.test(f));
        return files.length > 0 ? files : ['first.mp3', 'second.mp3', 'third.mp3'];
    } catch (e) {
        console.error('Error reading songs directory:', e);
        return ['first.mp3', 'second.mp3', 'third.mp3'];
    }
}

function getPlayerState() {
    return {
        isPlaying,
        isPaused,
        currentSong,
        currentIndex,
        volume: currentVolume,
        currentTime,
        duration,
        songs: getAvailableSongs()
    };
}

function sendStateUpdate() {
    if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('player-state-update', getPlayerState());
    }
}

function startTimePolling() {
    stopTimePolling();
    timePollInterval = setInterval(() => {
        if (musicProcess && musicProcess.stdin && !musicProcess.killed && isPlaying && !isPaused) {
            try {
                if (duration === 0) {
                    musicProcess.stdin.write('get_length\n');
                }
                musicProcess.stdin.write('get_time\n');
            } catch (err) {
                console.error('Failed to poll VLC time:', err);
            }
        }
    }, 1000);
}

function stopTimePolling() {
    if (timePollInterval) {
        clearInterval(timePollInterval);
        timePollInterval = null;
    }
}

function stopMusic() {
    stopTimePolling();
    if (musicProcess) {
        try {
            musicProcess.stdin.write('stop\nquit\n');
        } catch (err) {
            console.error('Error stopping VLC via stdin:', err);
        }
        try {
            musicProcess.kill();
        } catch (err) {
            console.error('Error killing VLC process:', err);
        }
        musicProcess = null;
    }
    isPlaying = false;
    isPaused = false;
    currentSong = null;
    currentTime = 0;
    duration = 0;
    sendStateUpdate();
    return getPlayerState();
}

function startMusic(index) {
    const songs = getAvailableSongs();
    if (musicProcess) {
        stopMusic();
    }

    if (typeof index === 'number' && index >= 0 && index < songs.length) {
        currentIndex = index;
    } else if (typeof index !== 'number') {
        currentIndex = Math.floor(Math.random() * songs.length);
    } else {
        currentIndex = 0;
    }

    const songFile = songs[currentIndex];
    const songPath = path.join(songsDir, songFile);
    currentSong = songFile;
    isPlaying = true;
    isPaused = false;
    currentTime = 0;
    duration = 0;

    // Launch VLC with Remote Control (RC) interface for stdin command input
    musicProcess = spawn('vlc', ['-I', 'rc', songPath], {
        stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse time and length from VLC stdout
    musicProcess.stdout.on('data', (data) => {
        const lines = data.toString().split(/\r?\n/);
        for (const line of lines) {
            const clean = line.replace('>', '').trim();
            if (/^\d+$/.test(clean)) {
                const num = parseInt(clean, 10);
                if (num > 0 && duration === 0) {
                    duration = num;
                    sendStateUpdate();
                } else if (duration > 0 && num <= duration) {
                    currentTime = num;
                    sendStateUpdate();
                } else if (duration === 0) {
                    currentTime = num;
                    sendStateUpdate();
                }
            }
        }
    });

    // Set initial volume & request track duration
    const vlcVol = Math.round((currentVolume / 100) * 256);
    setTimeout(() => {
        if (musicProcess && musicProcess.stdin && !musicProcess.killed) {
            try {
                musicProcess.stdin.write(`volume ${vlcVol}\n`);
                musicProcess.stdin.write('get_length\n');
                musicProcess.stdin.write('get_time\n');
            } catch (err) {
                console.error('Failed to initialize VLC parameters:', err);
            }
        }
    }, 300);

    startTimePolling();

    musicProcess.on('exit', () => {
        stopTimePolling();
        musicProcess = null;
        isPlaying = false;
        isPaused = false;
        currentSong = null;
        currentTime = 0;
        duration = 0;
        sendStateUpdate();
    });

    musicProcess.on('error', (err) => {
        console.error('Failed to spawn VLC process:', err);
        stopTimePolling();
        musicProcess = null;
        isPlaying = false;
        isPaused = false;
        currentSong = null;
        currentTime = 0;
        duration = 0;
        sendStateUpdate();
    });

    sendStateUpdate();
    return getPlayerState();
}

function playMusic() {
    if (!musicProcess) {
        return startMusic(currentIndex);
    }

    if (isPaused) {
        try {
            musicProcess.stdin.write('pause\n'); // In VLC rc, 'pause' unpauses if paused
        } catch (err) {
            console.error('Failed to write pause/resume:', err);
        }
        isPaused = false;
        isPlaying = true;
        startTimePolling();
    } else {
        try {
            musicProcess.stdin.write('play\n');
        } catch (err) {
            console.error('Failed to write play:', err);
        }
        isPlaying = true;
    }

    sendStateUpdate();
    return getPlayerState();
}

function pauseMusic() {
    if (!musicProcess) {
        return getPlayerState();
    }

    try {
        musicProcess.stdin.write('pause\n');
    } catch (err) {
        console.error('Failed to write pause:', err);
    }

    isPaused = !isPaused;
    isPlaying = !isPaused;
    if (isPaused) {
        stopTimePolling();
    } else {
        startTimePolling();
    }

    sendStateUpdate();
    return getPlayerState();
}

function nextMusic() {
    const songs = getAvailableSongs();
    const nextIndex = (currentIndex + 1) % songs.length;
    return startMusic(nextIndex);
}

function prevMusic() {
    const songs = getAvailableSongs();
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    return startMusic(prevIndex);
}

function setVolume(level) {
    currentVolume = Math.max(0, Math.min(100, Number(level) || 0));
    if (musicProcess && musicProcess.stdin && !musicProcess.killed) {
        const vlcVol = Math.round((currentVolume / 100) * 256);
        try {
            musicProcess.stdin.write(`volume ${vlcVol}\n`);
        } catch (err) {
            console.error('Error writing volume to VLC:', err);
        }
    }
    sendStateUpdate();
    return getPlayerState();
}

function seekMusic(targetSeconds, isAbsolute = false) {
    if (musicProcess && musicProcess.stdin && !musicProcess.killed) {
        try {
            if (isAbsolute || (typeof targetSeconds === 'number' && !String(targetSeconds).startsWith('+') && !String(targetSeconds).startsWith('-') && targetSeconds >= 0)) {
                const target = Math.max(0, Math.floor(targetSeconds));
                musicProcess.stdin.write(`seek ${target}\n`);
                currentTime = target;
            } else {
                const secStr = typeof targetSeconds === 'number' ? (targetSeconds >= 0 ? `+${targetSeconds}` : `${targetSeconds}`) : targetSeconds;
                musicProcess.stdin.write(`seek ${secStr}\n`);
                currentTime = Math.max(0, currentTime + Number(targetSeconds));
            }
        } catch (err) {
            console.error('Error writing seek to VLC:', err);
        }
    }
    sendStateUpdate();
    return getPlayerState();
}

// Clean up VLC process when app quits
app.on('before-quit', () => {
    stopMusic();
});

ipcMain.handle("start", (event, songIndex) => startMusic(songIndex));
ipcMain.handle("play", () => playMusic());
ipcMain.handle("pause", () => pauseMusic());
ipcMain.handle("stop", () => stopMusic());
ipcMain.handle("next", () => nextMusic());
ipcMain.handle("prev", () => prevMusic());
ipcMain.handle("setVolume", (event, level) => setVolume(level));
ipcMain.handle("seek", (event, seconds, isAbsolute) => seekMusic(seconds, isAbsolute));
ipcMain.handle("getSongs", () => getAvailableSongs());
ipcMain.handle("getStatus", () => getPlayerState());

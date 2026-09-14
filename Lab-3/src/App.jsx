import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

function formatTime(seconds) {
  if (!seconds || isNaN(seconds) || seconds < 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`
}

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentSong, setCurrentSong] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [songs, setSongs] = useState(['first.mp3', 'second.mp3', 'third.mp3'])
  const [prevVolume, setPrevVolume] = useState(80)
  
  // Progress Bar states
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isSeeking, setIsSeeking] = useState(false)
  const [seekValue, setSeekValue] = useState(0)

  const isSeekingRef = useRef(false)

  useEffect(() => {
    isSeekingRef.current = isSeeking
  }, [isSeeking])

  const getAPI = useCallback(() => window.music || window.musicAPI, [])

  const syncState = useCallback((state) => {
    if (!state) return
    setIsPlaying(Boolean(state.isPlaying))
    setIsPaused(Boolean(state.isPaused))
    setCurrentSong(state.currentSong || null)
    if (typeof state.currentIndex === 'number') setCurrentIndex(state.currentIndex)
    if (typeof state.volume === 'number') setVolume(state.volume)
    if (Array.isArray(state.songs) && state.songs.length > 0) setSongs(state.songs)
    
    // Only update progress from backend if user is not dragging the scrubber
    if (!isSeekingRef.current) {
      if (typeof state.currentTime === 'number') setCurrentTime(state.currentTime)
      if (typeof state.duration === 'number' && state.duration > 0) setDuration(state.duration)
    }
  }, [])

  // Subscribe to real-time player updates from electron main process
  useEffect(() => {
    const api = getAPI()
    if (api) {
      if (api.getStatus) {
        api.getStatus().then(syncState).catch(console.error)
      }
      if (api.onStateUpdate) {
        const unsubscribe = api.onStateUpdate(syncState)
        return () => {
          if (typeof unsubscribe === 'function') unsubscribe()
        }
      }
    }
  }, [getAPI, syncState])

  // Smooth local second counter between backend syncs
  useEffect(() => {
    let timer = null
    if (isPlaying && !isPaused && !isSeeking) {
      timer = setInterval(() => {
        setCurrentTime((prev) => {
          if (duration > 0 && prev >= duration) return prev
          return prev + 1
        })
      }, 1000)
    }
    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isPlaying, isPaused, isSeeking, duration])

  const handleStart = async (index) => {
    const api = getAPI()
    if (api?.start) {
      const state = await api.start(index)
      syncState(state)
    }
  }

  const handlePlay = async () => {
    const api = getAPI()
    if (api?.play) {
      const state = await api.play()
      syncState(state)
    }
  }

  const handlePause = async () => {
    const api = getAPI()
    if (api?.pause) {
      const state = await api.pause()
      syncState(state)
    }
  }

  const handlePlayPause = async () => {
    if (isPlaying && !isPaused) {
      await handlePause()
    } else {
      await handlePlay()
    }
  }

  const handleStop = async () => {
    const api = getAPI()
    if (api?.stop) {
      const state = await api.stop()
      syncState(state)
      setCurrentTime(0)
      setDuration(0)
    }
  }

  const handleNext = async () => {
    const api = getAPI()
    if (api?.next) {
      const state = await api.next()
      syncState(state)
    }
  }

  const handlePrev = async () => {
    const api = getAPI()
    if (api?.prev) {
      const state = await api.prev()
      syncState(state)
    }
  }

  const handleSeekRelative = async (seconds) => {
    const api = getAPI()
    if (api?.seek) {
      const state = await api.seek(seconds, false)
      syncState(state)
    }
  }

  const handleProgressChange = (e) => {
    const target = Number(e.target.value)
    setSeekValue(target)
  }

  const handleProgressMouseDown = () => {
    setIsSeeking(true)
    setSeekValue(currentTime)
  }

  const handleProgressMouseUp = async (e) => {
    const target = Number(e.target.value)
    setIsSeeking(false)
    setCurrentTime(target)
    const api = getAPI()
    if (api?.seek) {
      const state = await api.seek(target, true)
      syncState(state)
    }
  }

  const handleVolumeChange = async (newVol) => {
    const volNum = Math.max(0, Math.min(100, Number(newVol)))
    setVolume(volNum)
    if (volNum > 0) setIsMuted(false)
    const api = getAPI()
    if (api?.setVolume) {
      const state = await api.setVolume(volNum)
      syncState(state)
    }
  }

  const handleToggleMute = async () => {
    const api = getAPI()
    if (!isMuted) {
      setPrevVolume(volume)
      setIsMuted(true)
      setVolume(0)
      if (api?.setVolume) {
        const state = await api.setVolume(0)
        syncState(state)
      }
    } else {
      const restoreVol = prevVolume > 0 ? prevVolume : 80
      setIsMuted(false)
      setVolume(restoreVol)
      if (api?.setVolume) {
        const state = await api.setVolume(restoreVol)
        syncState(state)
      }
    }
  }

  const handleShuffle = async () => {
    const randomIndex = Math.floor(Math.random() * songs.length)
    await handleStart(randomIndex)
  }

  const getStatusLabel = () => {
    if (isPlaying && !isPaused) return 'Playing'
    if (isPaused) return 'Paused'
    return 'Stopped'
  }

  const statusLabel = getStatusLabel()
  const displayTime = isSeeking ? seekValue : currentTime
  const maxDuration = duration > 0 ? duration : (displayTime > 0 ? displayTime + 30 : 100)
  const progressPercent = maxDuration > 0 ? Math.min(100, (displayTime / maxDuration) * 100) : 0

  return (
    <div className="player-app">
      <div className="player-card">
        {/* Header */}
        <div className="header">
          <div className="title-area">
            <h1 className="app-title">Audio Studio</h1>
            <span className="app-badge">Lab 3</span>
          </div>
          <div className={`status-pill status-${statusLabel.toLowerCase()}`}>
            <span className="status-indicator"></span>
            {statusLabel}
          </div>
        </div>

        {/* Media Stage (Vinyl + Track Info) */}
        <div className="media-stage">
          <div className={`vinyl-disc ${isPlaying && !isPaused ? 'spinning' : ''}`}>
            <div className="vinyl-groove"></div>
            <div className="vinyl-center">
              <span className="vinyl-icon">🎵</span>
            </div>
          </div>

          <div className="track-info">
            <h2 className="track-title">{currentSong || 'No Track Selected'}</h2>
            <p className="track-subtitle">
              {currentSong ? `Track 0${currentIndex + 1} of 0${songs.length}` : 'Select a track or press Start'}
            </p>

            {/* Sound Wave Animation */}
            <div className={`visualizer-bars ${isPlaying && !isPaused ? 'active' : ''}`}>
              <span className="bar bar-1"></span>
              <span className="bar bar-2"></span>
              <span className="bar bar-3"></span>
              <span className="bar bar-4"></span>
              <span className="bar bar-5"></span>
              <span className="bar bar-6"></span>
              <span className="bar bar-7"></span>
            </div>
          </div>
        </div>

        {/* Song Progress Bar Section */}
        <div className="progress-section">
          <div className="progress-bar-wrapper">
            <input
              type="range"
              min="0"
              max={maxDuration}
              value={displayTime}
              onMouseDown={handleProgressMouseDown}
              onTouchStart={handleProgressMouseDown}
              onChange={handleProgressChange}
              onMouseUp={handleProgressMouseUp}
              onTouchEnd={handleProgressMouseUp}
              className="progress-slider"
              style={{
                background: `linear-gradient(to right, #8b5cf6 ${progressPercent}%, rgba(255, 255, 255, 0.15) ${progressPercent}%)`
              }}
              disabled={!isPlaying && !isPaused && !currentSong}
              aria-label="Track Progress"
            />
          </div>

          <div className="progress-timestamps">
            <span className="time-elapsed">{formatTime(displayTime)}</span>
            <div className="seek-pills">
              <button
                className="btn-quick-seek"
                onClick={() => handleSeekRelative(-10)}
                title="Rewind 10s"
                disabled={!isPlaying && !isPaused}
              >
                -10s
              </button>
              <button
                className="btn-quick-seek"
                onClick={() => handleSeekRelative(10)}
                title="Forward 10s"
                disabled={!isPlaying && !isPaused}
              >
                +10s
              </button>
            </div>
            <span className="time-duration">{duration > 0 ? formatTime(duration) : '--:--'}</span>
          </div>
        </div>

        {/* Main Playback Controls */}
        <div className="main-controls">
          <button
            className="ctrl-btn ctrl-prev"
            onClick={handlePrev}
            title="Previous Song"
          >
            ⏮
          </button>

          <button
            className={`ctrl-btn ctrl-play-pause ${isPlaying && !isPaused ? 'is-playing' : ''}`}
            onClick={handlePlayPause}
            title={isPlaying && !isPaused ? 'Pause' : 'Play'}
          >
            {isPlaying && !isPaused ? '⏸' : '▶'}
          </button>

          <button
            className="ctrl-btn ctrl-stop"
            onClick={handleStop}
            title="Stop Playback"
          >
            ⏹
          </button>

          <button
            className="ctrl-btn ctrl-next"
            onClick={handleNext}
            title="Next Song"
          >
            ⏭
          </button>

          <button
            className="ctrl-btn ctrl-shuffle"
            onClick={handleShuffle}
            title="Shuffle Random Track"
          >
            🔀
          </button>
        </div>

        {/* Volume Controls */}
        <div className="volume-container">
          <div className="volume-header">
            <button className="btn-mute" onClick={handleToggleMute} title={isMuted ? 'Unmute' : 'Mute'}>
              {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
            </button>
            <span className="volume-label">Volume: {isMuted ? 'Muted (0%)' : `${volume}%`}</span>
          </div>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(e.target.value)}
            className="volume-slider"
            style={{
              background: `linear-gradient(to right, #a855f7 ${isMuted ? 0 : volume}%, rgba(255, 255, 255, 0.15) ${isMuted ? 0 : volume}%)`
            }}
          />

          <div className="volume-presets">
            {[25, 50, 75, 100].map((level) => (
              <button
                key={level}
                className={`preset-chip ${volume === level && !isMuted ? 'active' : ''}`}
                onClick={() => handleVolumeChange(level)}
              >
                {level}%
              </button>
            ))}
          </div>
        </div>

        {/* Playlist */}
        <div className="playlist-container">
          <div className="playlist-header">
            <h3>Playlist ({songs.length} tracks)</h3>
            <span className="playlist-tip">Click any track to play</span>
          </div>

          <div className="playlist-list">
            {songs.map((song, idx) => {
              const isCurrent = currentSong === song
              return (
                <div
                  key={song}
                  className={`playlist-item ${isCurrent ? 'active' : ''}`}
                  onClick={() => handleStart(idx)}
                >
                  <div className="item-left">
                    <span className="item-index">0{idx + 1}</span>
                    <span className="item-name">{song}</span>
                  </div>
                  <div className="item-right">
                    {isCurrent && isPlaying && !isPaused && (
                      <span className="item-playing-badge">Playing</span>
                    )}
                    <button
                      className="item-play-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStart(idx)
                      }}
                    >
                      {isCurrent && isPlaying && !isPaused ? '⏸' : '▶'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Slider } from '../components/ui/slider';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Edit2, Download, Upload, Play, Pause, Clock, Music, Search, Video, Image as ImageIcon, Settings, Move } from 'lucide-react';
import TimelineEditor from './timelineeditor';
import useEnhancedVideoEffects from './useEnhancedVideoEffects';
import { useWebGLRenderer, useProjectCache, useLowEndMode, useVideoProcessor } from './performanceOptimizations';

const LyricSyncApp = () => {
  const [lyrics, setLyrics] = useState('');
  const [syncedLyrics, setSyncedLyrics] = useState([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [error, setError] = useState(null);
  const [editIndex, setEditIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState('');
  const [bpm, setBpm] = useState(null);
  const [bpmStatus, setBpmStatus] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [debugInfo, setDebugInfo] = useState('');

  const [backgroundImage, setBackgroundImage] = useState(null);
  const [textShadow, setTextShadow] = useState('2px 2px 4px #000000');
  const [renderProgress, setRenderProgress] = useState(0);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 90 });
  const [textAnimation, setTextAnimation] = useState('fade');
  const [showTimecode, setShowTimecode] = useState(false);
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [textEffect, setTextEffect] = useState('none');
  const [useKineticTypography, setUseKineticTypography] = useState(false);
  const [useBackgroundVideo, setUseBackgroundVideo] = useState(false);
  const [useParticleEffects, setUseParticleEffects] = useState(false);
  const [particles, setParticles] = useState([]);
  const [videoResolution, setVideoResolution] = useState({ width: 1280, height: 720 });

  const waveformRef = useRef(null);
  const audioRef = useRef(null);
  const canvasRef = useRef(null);
  const canvasCtxRef = useRef(null);
  const { saveProject, loadProject } = useProjectCache();
  const isLowEndDevice = useLowEndMode();
  const videoProcessor = useVideoProcessor();

  const [fontStyle, setFontStyle] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [textAlignment, setTextAlignment] = useState('center');
  
  const videoPreviewRef = useRef(null);
  
  const styleProps = {
    fontStyle,
    fontSize,
    textColor,
    textAlignment
  };

  const { renderPreview } = useEnhancedVideoEffects(videoPreviewRef, styleProps);


  const render = useWebGLRenderer(videoPreviewRef, videoResolution);

  useEffect(() => {
    if (audioFile && canvasRef.current) {
      drawWaveform();
    }
  }, [audioFile]);

  const handleLyricsChange = (e) => {
    setLyrics(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'audio/mpeg') {
      setAudioFile(URL.createObjectURL(file));
      setError(null);
    } else {
      setError('Please upload a valid MP3 file.');
    }
  };

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleSeek = useCallback((value) => {
    if (audioRef.current) {
      const newTime = (value[0] / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const handleMarkTimestamp = useCallback(() => {
    if (!audioRef.current) {
      console.error('Audio is not loaded');
      return;
    }
  
    const lines = lyrics.split('\n');
    const currentLineIndex = syncedLyrics.length;
    const currentLine = lines[currentLineIndex];
  
    if (!currentLine) {
      console.error('No more lines to sync');
      return;
    }
  
    const newSyncedLyric = { text: currentLine, time: audioRef.current.currentTime };
  
    setSyncedLyrics(prev => [...prev, newSyncedLyric]);
  }, [lyrics, syncedLyrics]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === ' ') {
      e.preventDefault();
      handleMarkTimestamp();
    }
  }, [handleMarkTimestamp]);

  const handleEditTimestamp = useCallback((index) => {
    setEditIndex(index);
  }, []);

  const handleUpdateTimestamp = useCallback((index, newTime) => {
    setSyncedLyrics(prev => {
      const updated = [...prev];
      updated[index].time = newTime;
      return updated;
    });
    setEditIndex(-1);
  }, []);

  const exportLyrics = useCallback((format) => {
    let content;
    let filename;
    let type;

    if (format === 'json') {
      content = JSON.stringify(syncedLyrics, null, 2);
      filename = 'synced_lyrics.json';
      type = 'application/json';
    } else if (format === 'lrc') {
      content = syncedLyrics.map(lyric => {
        const time = new Date(lyric.time * 1000).toISOString().substr(11, 8);
        return `[${time}]${lyric.text}`;
      }).join('\n');
      filename = 'synced_lyrics.lrc';
      type = 'text/plain';
    }

    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [syncedLyrics]);

  const importLyrics = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedLyrics = JSON.parse(event.target.result);
          setSyncedLyrics(importedLyrics);
          setLyrics(importedLyrics.map(lyric => lyric.text).join('\n'));
          setError(null);
        } catch (error) {
          setError('Failed to import lyrics. Please ensure the file is in the correct JSON format.');
        }
      };
      reader.readAsText(file);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleVolumeChange = useCallback((value) => {
    if (!audioRef.current) return;

    const newVolume = value[0] / 100;
    setVolume(newVolume);
    audioRef.current.volume = newVolume;
  }, []);

  useEffect(() => {
    if (syncedLyrics.length > 0) {
      const index = syncedLyrics.findIndex(lyric => lyric.time > currentTime) - 1;
      setActiveLyricIndex(index >= 0 ? index : syncedLyrics.length - 1);
    }
  }, [currentTime, syncedLyrics]);

  const drawWaveform = useCallback(() => {
    if (!audioFile || !waveformRef.current) {
      setDebugInfo('No audio file or waveform ref');
      return;
    }

    const canvas = waveformRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = 'rgb(200, 200, 200)';
    ctx.fillRect(0, 0, width, height);

    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    for (let x = 0; x < width; x++) {
      const y = height / 2 + Math.sin(x * 0.1) * height / 4;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    setDebugInfo('Waveform drawn');
  }, [audioFile]);

  useEffect(() => {
    if (audioFile && waveformRef.current) {
      drawWaveform();
    }
  }, [audioFile, drawWaveform]);

  const detectBPM = useCallback(() => {
    if (!audioFile) {
      setError("Please upload an audio file first.");
      return;
    }

    setBpmStatus("Detecting...");
    setTimeout(() => {
      const detectedBPM = Math.floor(Math.random() * 50) + 100;
      setBpm(detectedBPM);
      setBpmStatus("Detected");
    }, 2000);
  }, [audioFile]);

  const handleSearch = useCallback(() => {
    if (searchTerm.trim() === "") {
      setError("Please enter a search term.");
      return;
    }

    const searchRegex = new RegExp(searchTerm, 'i');
    const matchedLyrics = syncedLyrics.filter(lyric => searchRegex.test(lyric.text));
    
    setSearchResults(matchedLyrics);
    if (matchedLyrics.length > 0) {
      setActiveLyricIndex(syncedLyrics.indexOf(matchedLyrics[0]));
      setError(null);
    } else {
      setError("No matching lyrics found.");
    }
  }, [searchTerm, syncedLyrics]);

  const handleBackgroundImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setBackgroundImage(URL.createObjectURL(file));
      setError(null);
    } else {
      setError('Please upload a valid image file.');
    }
  };

  const handleFontStyleChange = (e) => {
    setFontStyle(e.target.value);
  };

  const handleFontSizeChange = (value) => {
    setFontSize(value[0]);
  };

  const handleTextColorChange = (e) => {
    setTextColor(e.target.value);
  };

  const handleTextShadowChange = (e) => {
    setTextShadow(e.target.value);
  };

  const handleVideoResolutionChange = (e) => {
    const [width, height] = e.target.value.split('x').map(Number);
    setVideoResolution({ width, height });
  };

  const handleTextPositionChange = (axis, value) => {
    setTextPosition(prev => ({ ...prev, [axis]: value[0] }));
  };

  const handleTextAnimationChange = (e) => {
    setTextAnimation(e.target.value);
  };

  const handleTextAlignmentChange = (e) => {
    setTextAlignment(e.target.value);
  };

  const handleLyricUpdate = (index, newTime) => {
    setSyncedLyrics(prevLyrics => {
      const updatedLyrics = [...prevLyrics];
      updatedLyrics[index] = { ...updatedLyrics[index], time: newTime };
      return updatedLyrics;
    });
  };

  useEffect(() => {
    if (useParticleEffects) {
      const newParticles = Array.from({ length: 50 }, () => ({
        x: Math.random() * videoResolution.width,
        y: Math.random() * videoResolution.height,
        size: Math.random() * 3 + 1,
        color: `rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
        speed: Math.random() * 0.02 + 0.01
      }));
      setParticles(newParticles);
    }
  }, [useParticleEffects, videoResolution]);

  const renderVideoPreview = useCallback(() => {
    const canvas = videoPreviewRef.current;

    if (!canvas) {
        console.error("Video preview canvas not available");
        return;
    }

    if (!(canvas instanceof HTMLCanvasElement)) {
        console.error("The referenced element is not a canvas");
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('Canvas:', canvas); // Log the canvas element

    if (!ctx) {
        console.error("Unable to get 2D context from canvas in renderVideoPreview");
        return;
    }
    
    canvasCtxRef.current = ctx;
    const { width, height } = videoResolution;

    ctx.clearRect(0, 0, width, height);

    if (backgroundImage) {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, width, height);
            renderLyrics();
        };
        img.src = backgroundImage;
    } else {
        renderLyrics();
    }

    function renderLyrics() {
        if (useParticleEffects) {
            renderParticles(particles, currentTime);
        }

        const currentLyric = syncedLyrics[activeLyricIndex];

        ctx.font = '20px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText('Test Text', 50, 50);

        if (currentLyric) {
            const text = currentLyric.text;
            const x = (textPosition.x / 100) * width;
            const y = (textPosition.y / 100) * height;

            ctx.font = `bold ${fontSize}px ${fontStyle}`;
            ctx.fillStyle = textColor;
            ctx.textAlign = textAlignment;

            if (useKineticTypography) {
                applyKineticTypography(ctx, text, x, y, currentTime);
            } else {
                applyTextEffect(ctx, text, x, y, textEffect);
            }
        }

        if (showTimecode) {
            const timecode = new Date(currentTime * 1000).toISOString().substr(11, 8);
            ctx.fillStyle = 'white';
            ctx.font = 'bold 16px Arial';
            ctx.fillText(timecode, 10, 20);
        }

        if (showProgressBar) {
            const progress = currentTime / duration;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fillRect(0, height - 5, width * progress, 5);
        }
    }
}, [
    backgroundImage,
    syncedLyrics,
    activeLyricIndex,
    videoResolution,
    fontStyle,
    fontSize,
    textColor,
    textPosition,
    textAlignment,
    showTimecode,
    showProgressBar,
    currentTime,
    duration,
    useParticleEffects,
    useKineticTypography,
    textEffect,
    applyTextEffect,
    applyKineticTypography,
    renderParticles,
    particles
]);


useEffect(() => {
    const intervalId = setInterval(() => {
      if (videoPreviewRef.current) {
        const currentLyric = syncedLyrics[activeLyricIndex];
        renderPreview(backgroundImage, currentLyric, currentTime);
      }
    }, 1000 / 30); // 30 fps

    return () => clearInterval(intervalId);
  }, [renderPreview, backgroundImage, syncedLyrics, activeLyricIndex, currentTime]);


  useEffect(() => {
    if (syncedLyrics.length > 0 && audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      const newIndex = syncedLyrics.findIndex((lyric, index, arr) => {
        return lyric.time <= currentTime && (index === arr.length - 1 || arr[index + 1].time > currentTime);
      });
      if (newIndex !== -1 && newIndex !== activeLyricIndex) {
        setActiveLyricIndex(newIndex);
      }
    }
  }, [currentTime, syncedLyrics]);

  const renderFinalVideo = () => {
    let progress = 0;
    const intervalId = setInterval(() => {
      progress += 10;
      setRenderProgress(progress);
      if (progress >= 100) {
        clearInterval(intervalId);
        alert('Video rendering complete! (This is a simulation)');
      }
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-blue-600">Enhanced Lyric Sync Web App</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Audio Upload</h2>
            <Input
              id="file-upload"
              type="file"
              accept=".mp3"
              onChange={handleFileUpload}
              className="mb-4"
            />
            {audioFile && (
              <div className="space-y-4">
                <audio 
                  ref={audioRef} 
                  src={audioFile} 
                  onTimeUpdate={handleTimeUpdate} 
                  onLoadedMetadata={handleLoadedMetadata}
                  controls
                  className="w-full" 
                />
                <canvas ref={waveformRef} width="500" height="100" className="w-full rounded border border-gray-300" />
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Lyrics Input</h2>
            <Textarea
              id="lyrics-input"
              value={lyrics}
              onChange={handleLyricsChange}
              onKeyDown={handleKeyPress}
              placeholder="Enter lyrics here (one line per lyric)"
              rows={10}
              className="w-full p-2 border rounded"
            />
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Synced Lyrics</h2>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {syncedLyrics.map((lyric, index) => (
                <li
                  key={index}
                  className={`flex items-center space-x-2 p-2 rounded ${
                    index === activeLyricIndex ? 'bg-blue-100' : ''
                  }`}
                >
                  {editIndex === index ? (
                    <Input
                      type="number"
                      step="0.01"
                      value={lyric.time}
                      onChange={(e) => handleUpdateTimestamp(index, parseFloat(e.target.value))}
                      className="w-20"
                    />
                  ) : (
                    <span className="text-gray-600 font-mono">{lyric.time.toFixed(2)}s</span>
                  )}
                  <span className={index === activeLyricIndex ? 'font-bold' : ''}>{lyric.text}</span>
                  <Button onClick={() => handleEditTimestamp(index)} size="sm" variant="ghost">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Actions</h2>
            <div className="flex flex-wrap gap-4">
              <Button onClick={handleMarkTimestamp} className="bg-green-500 hover:bg-green-600 text-white">
                <Clock className="w-4 h-4 mr-2" />
                Mark Timestamp
              </Button>
              <Button onClick={() => exportLyrics('json')} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export JSON
              </Button>
              <Button onClick={() => exportLyrics('lrc')} className="bg-purple-500 hover:bg-purple-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Export LRC
              </Button>
              <Input 
                type="file" 
                accept=".json" 
                onChange={importLyrics} 
                id="import-lyrics" 
                className="hidden" 
              />
              <Button onClick={() => document.getElementById('import-lyrics').click()} className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Upload className="w-4 h-4 mr-2" />
                Import Lyrics
              </Button>
              <Button onClick={detectBPM} className="bg-red-500 hover:bg-red-600 text-white">
                <Music className="w-4 h-4 mr-2" />
                Detect BPM
              </Button>
            </div>
          </div>

          {bpmStatus && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <p className="text-xl font-semibold text-gray-800">
                {bpmStatus === "Detecting..." ? bpmStatus : `Detected BPM: ${bpm}`}
              </p>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Search Lyrics</h2>
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Search lyrics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
              />
              <Button onClick={handleSearch} className="bg-blue-500 hover:bg-blue-600 text-white">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2 text-gray-700">Search Results:</h3>
                <ul className="space-y-1">
                  {searchResults.map((result, index) => (
                    <li key={index} className="text-sm">
                      {result.text} <span className="text-gray-500">({result.time.toFixed(2)}s)</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8">
        <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Video Preview</h2>
      <canvas 
        ref={videoPreviewRef} 
        className="w-full border rounded" 
        width={videoResolution.width} 
        height={videoResolution.height}
      ></canvas>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-800">Enhanced Video Effects</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Text Effect
                  </label>
                  <select
                    value={textEffect}
                    onChange={(e) => setTextEffect(e.target.value)}
                    className="w-full p-2 border rounded"
                  >
                    <option value="none">None</option>
                    <option value="glow">Glow</option>
                    <option value="outline">Outline</option>
                    <option value="3d">3D</option>
                  </select>
                </div>
                <label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={useKineticTypography}
                    onChange={(e) => setUseKineticTypography(e.target.checked)}
                  />
                  <span>Use Kinetic Typography</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={useBackgroundVideo}
                    onChange={(e) => setUseBackgroundVideo(e.target.checked)}
                  />
                  <span>Use Background Video</span>
                </label>
                <label className="flex items-center space-x-2">
                  <Input
                    type="checkbox"
                    checked={useParticleEffects}
                    onChange={(e) => setUseParticleEffects(e.target.checked)}
                  />
                  <span>Use Particle Effects</span>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Text Positioning</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horizontal Position (X)
                </label>
                <Slider
                  value={[textPosition.x]}
                  onValueChange={(value) => handleTextPositionChange('x', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{textPosition.x}%</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vertical Position (Y)
                </label>
                <Slider
                  value={[textPosition.y]}
                  onValueChange={(value) => handleTextPositionChange('y', value)}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{textPosition.y}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Text Animation and Alignment</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Animation
                </label>
                <select
                  value={textAnimation}
                  onChange={handleTextAnimationChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="none">None</option>
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Alignment
                </label>
                <select
                  value={textAlignment}
                  onChange={handleTextAlignmentChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="center">Center</option>
                  <option value="right">Right</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Additional Features</h2>
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  checked={showTimecode}
                  onChange={(e) => setShowTimecode(e.target.checked)}
                />
                <span>Show Timecode</span>
              </label>
              <label className="flex items-center space-x-2">
                <Input
                  type="checkbox"
                  checked={showProgressBar}
                  onChange={(e) => setShowProgressBar(e.target.checked)}
                />
                <span>Show Progress Bar</span>
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Video Settings</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Background Image
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleBackgroundImageUpload}
                  className="mb-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Style
                </label>
                <select
                  value={fontStyle}
                  onChange={handleFontStyleChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Courier">Courier</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Font Size
                </label>
                <Slider
                  value={[fontSize]}
                  onValueChange={handleFontSizeChange}
                  min={12}
                  max={72}
                  step={1}
                  className="w-full"
                />
                <span className="text-sm text-gray-500">{fontSize}px</span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color
                </label>
                <Input
                  type="color"
                  value={textColor}
                  onChange={handleTextColorChange}
                  className="w-full h-10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Shadow
                </label>
                <Input
                  type="text"
                  value={textShadow}
                  onChange={handleTextShadowChange}
                  placeholder="2px 2px 4px #000000"
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Resolution
                </label>
                <select
                  value={`${videoResolution.width}x${videoResolution.height}`}
                  onChange={handleVideoResolutionChange}
                  className="w-full p-2 border rounded"
                >
                  <option value="1280x720">1280x720 (720p)</option>
                  <option value="1920x1080">1920x1080 (1080p)</option>
                  <option value="3840x2160">3840x2160 (4K)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Button onClick={renderFinalVideo} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 text-lg font-semibold">
              <Video className="w-5 h-5 mr-2" />
              Render Video
            </Button>
            {renderProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-blue-600 h-4 rounded-full transition-all duration-300 ease-in-out"
                    style={{ width: `${renderProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">Rendering: {renderProgress}%</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mt-8">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default LyricSyncApp;

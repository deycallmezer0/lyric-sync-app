import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import useEnhancedVideoEffects from './useEnhancedVideoEffects';

const TimelineEditor = ({ syncedLyrics, duration, onLyricUpdate, videoElement, currentTime }) => {
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef(null);
  const canvasRef = useRef(null);
  const { throttledRenderBackgroundVideo } = useEnhancedVideoEffects(canvasRef);

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.2, 5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.2, 0.5));

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const draggedIndex = parseInt(e.dataTransfer.getData('text'), 10);
    const newTime = (e.nativeEvent.offsetX / timelineRef.current.offsetWidth) * duration / zoom;
    onLyricUpdate(draggedIndex, newTime);
  };

  useEffect(() => {
    if (videoElement) {
      throttledRenderBackgroundVideo(videoElement, currentTime);
    }
  }, [currentTime, videoElement, throttledRenderBackgroundVideo]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Timeline Editor</h2>
      <div className="flex items-center mb-4">
        <Button onClick={handleZoomOut} size="sm" variant="outline">
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Slider
          value={[zoom]}
          onValueChange={(value) => setZoom(value[0])}
          min={0.5}
          max={5}
          step={0.1}
          className="mx-4 w-32"
        />
        <Button onClick={handleZoomIn} size="sm" variant="outline">
          <ZoomIn className="w-4 h-4" />
        </Button>
      </div>
      <div 
        ref={timelineRef}
        className="relative h-20 bg-gray-200 rounded"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full"
          width={timelineRef.current ? timelineRef.current.offsetWidth : 0}
          height={20}
        />
        {syncedLyrics.map((lyric, index) => (
          <div
            key={index}
            className="absolute top-0 h-full bg-blue-500 opacity-50 cursor-move"
            style={{
              left: `${(lyric.time / duration) * 100 * zoom}%`,
              width: '4px'
            }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
          >
            <div className="absolute top-full mt-1 text-xs whitespace-nowrap">{lyric.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineEditor;

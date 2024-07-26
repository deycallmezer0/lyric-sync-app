// useEnhancedVideoEffects.jsx
import { useCallback, useRef, useEffect } from 'react';
import { throttle } from 'lodash';

const useEnhancedVideoEffects = (canvasRef, styleProps) => {
const { fontStyle, fontSize, textColor, textAlignment } = styleProps;
  const glRef = useRef(null);
  const ctxRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas not available");
      return;
    }

    try {
      const gl = canvas.getContext('webgl');
      if (gl) {
        glRef.current = gl;
        console.log('WebGL context obtained:', gl);
      }
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctxRef.current = ctx;
        console.log('2D context obtained:', ctx);
      }
    } catch (error) {
      console.error("Error obtaining canvas context:", error);
    }
  }, [canvasRef, fontStyle, fontSize, textColor, textAlignment]);


  const applyTextEffect = useCallback((ctx, text, x, y, effect) => {
    ctx.save();
    switch (effect) {
      case 'glow':
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'white';
        ctx.fillText(text, x, y);
        break;
      case 'outline':
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        break;
      case '3d':
        for (let i = 1; i <= 5; i++) {
          ctx.fillStyle = `rgba(255, 255, 255, ${0.2 * i})`;
          ctx.fillText(text, x - i, y - i);
        }
        ctx.fillStyle = 'white';
        ctx.fillText(text, x, y);
        break;
      default:
        ctx.fillText(text, x, y);
    }
    ctx.restore();
  }, []);

  const applyKineticTypography = useCallback((ctx, text, x, y, time) => {
    const letters = text.split('');
    letters.forEach((letter, index) => {
      const offset = Math.sin((time + index * 0.1) * Math.PI * 2) * 10;
      ctx.fillText(letter, x + index * 20, y + offset);
    });
  }, []);

  const renderBackgroundVideo = useCallback((videoElement, time) => {
    const canvas = canvasRef.current;
    console.log('Canvas:', canvas); // Log the canvas element
    console.log('Video element:', videoElement); // Log the video element

    if (canvas && videoElement && videoElement.readyState >= 2) {
      if (Math.abs(videoElement.currentTime - time) > 0.1) {
        videoElement.currentTime = time;
      }

      const gl = glRef.current;
      if (gl) {
        console.log('Using WebGL for rendering'); // Log WebGL usage
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
      } else {
        console.log('Using 2D context for rendering'); // Log 2D context usage
        const ctx = canvas.getContext('2d');
        if (ctx) {
          console.log('2D context obtained for rendering video:', ctx); // Log the 2D context
          ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        } else {
          console.error("Unable to get 2D context from canvas in renderBackgroundVideo");
        }
      }
    }
  }, [canvasRef]);

  const throttledRenderBackgroundVideo = useCallback(throttle(renderBackgroundVideo, 100), [renderBackgroundVideo]);

  const renderParticles = useCallback((particles, time) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = ctxRef.current;
    const gl = glRef.current;

    if (gl) {
      // WebGL particle rendering (simplified)
      gl.clear(gl.COLOR_BUFFER_BIT);
      // ... implement WebGL particle rendering
    } else if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(particle => {
        const x = particle.x + Math.sin(time * particle.speed) * 10;
        const y = particle.y + Math.cos(time * particle.speed) * 10;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });
    }
  }, [canvasRef]);

  const renderPreview = useCallback((backgroundImage, currentLyric, currentTime) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = glRef.current;
    const ctx = ctxRef.current;

    if (gl) {
      // WebGL rendering
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      // Add WebGL rendering logic here
      console.log('Rendering with WebGL');
    } else if (ctx) {
      // 2D rendering
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (backgroundImage) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
      }

      if (currentLyric) {
        ctx.font = `bold ${fontSize}px ${fontStyle}`;
        ctx.fillStyle = textColor;
        ctx.textAlign = textAlignment;
        ctx.fillText(currentLyric.text, canvas.width / 2, canvas.height / 2);
      }
      
      console.log('Rendering with 2D context');
    }
  }, [canvasRef, fontStyle, fontSize, textColor, textAlignment]);

  return {
    applyTextEffect,
    applyKineticTypography,
    throttledRenderBackgroundVideo,
    renderParticles,
    renderPreview  // Changed from renderVideoPreview to renderPreview
  };
};

export default useEnhancedVideoEffects;
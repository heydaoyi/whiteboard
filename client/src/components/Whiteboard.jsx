import React, { useRef, useEffect, useState, useCallback } from 'react';
import { getStroke } from 'perfect-freehand';

// Helper to render SVG paths from perfect-freehand points
const getSvgPathFromStroke = (stroke) => {
  if (!stroke.length) return '';

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ['M', ...stroke[0], 'Q']
  );

  d.push('Z');
  return d.join(' ');
};

const Whiteboard = ({ elements, setElements, appState, setAppState }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState(null);
  
  // For panning/zooming
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Get options for perfect-freehand based on tool
  const getToolOptions = (tool, thickness) => {
    switch (tool) {
      case 'pencil':
        return { 
          size: thickness * 0.8, 
          thinning: 0, 
          smoothing: 0.1, 
          streamline: 0.1,
          simulatePressure: false
        };
      case 'pen':
        return { size: thickness, thinning: 0.5, smoothing: 0.5, streamline: 0.5 };
      case 'ink':
        return { size: thickness * 1.5, thinning: 0.8, smoothing: 0.8, streamline: 0.8, taperStart: 0, taperEnd: thickness * 2 };
      case 'eraser':
        return { size: thickness * 2, thinning: 0, smoothing: 0.5, streamline: 0.5 };
      default:
        return { size: thickness, thinning: 0.5, smoothing: 0.5, streamline: 0.5 };
    }
  };

  // Screen to Canvas coordinate conversion
  const getCanvasPoint = (e) => {
    const { camera } = appState;
    return {
      x: (e.clientX - camera.x) / camera.zoom,
      y: (e.clientY - camera.y) / camera.zoom,
      pressure: e.pressure || 0.5
    };
  };

  const handlePointerDown = (e) => {
    if (appState.tool === 'hand' || (e.pointerType === 'touch' && !e.isPrimary)) {
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (e.button !== 0 && e.pointerType === 'mouse') return; // Only left click

    e.target.setPointerCapture(e.pointerId);
    setIsDrawing(true);
    
    const point = getCanvasPoint(e);
    setCurrentPath({
      tool: appState.tool,
      color: appState.tool === 'eraser' ? '#f5f5f5' : appState.color, // Match background for eraser
      thickness: appState.thickness,
      points: [[point.x, point.y, point.pressure]]
    });
  };

  const handlePointerMove = (e) => {
    if (isPanning) {
      const dx = e.clientX - lastPanPoint.x;
      const dy = e.clientY - lastPanPoint.y;
      setAppState(prev => ({
        ...prev,
        camera: { ...prev.camera, x: prev.camera.x + dx, y: prev.camera.y + dy }
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
      return;
    }

    if (!isDrawing || !currentPath) return;

    const point = getCanvasPoint(e);
    setCurrentPath(prev => ({
      ...prev,
      points: [...prev.points, [point.x, point.y, point.pressure]]
    }));
  };

  const handlePointerUp = (e) => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (!isDrawing) return;
    setIsDrawing(false);
    e.target.releasePointerCapture(e.pointerId);

    if (currentPath && currentPath.points.length > 1) {
      setElements(prev => [...prev, currentPath]);
    }
    setCurrentPath(null);
  };

  // Handle Wheel for Zooming
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    if (e.ctrlKey) {
      // Zoom
      const zoomSensitivity = 0.001;
      const delta = -e.deltaY * zoomSensitivity;
      const newZoom = Math.min(Math.max(appState.camera.zoom + delta, 0.1), 10);
      
      // Zoom towards mouse pointer
      const mouseX = e.clientX;
      const mouseY = e.clientY;
      
      setAppState(prev => {
        const scaleChange = newZoom - prev.camera.zoom;
        const newX = prev.camera.x - (mouseX - prev.camera.x) * (scaleChange / prev.camera.zoom);
        const newY = prev.camera.y - (mouseY - prev.camera.y) * (scaleChange / prev.camera.zoom);
        
        return {
          ...prev,
          camera: { x: newX, y: newY, zoom: newZoom }
        };
      });
    } else {
      // Pan
      setAppState(prev => ({
        ...prev,
        camera: {
          ...prev.camera,
          x: prev.camera.x - e.deltaX,
          y: prev.camera.y - e.deltaY
        }
      }));
    }
  }, [appState.camera, setAppState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => canvas.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel]);

  // Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Resize canvas to window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.save();
    // Apply camera transform
    ctx.translate(appState.camera.x, appState.camera.y);
    ctx.scale(appState.camera.zoom, appState.camera.zoom);

    // Draw all saved elements
    const drawPath = (pathData) => {
      if (pathData.tool === 'pencil') {
        // Render as a simple stroke path for true pencil effect
        ctx.beginPath();
        if (pathData.points.length > 0) {
          ctx.moveTo(pathData.points[0][0], pathData.points[0][1]);
          for (let i = 1; i < pathData.points.length; i++) {
            // Simple quadratic curve for smoother pencil lines
            const p0 = pathData.points[i - 1];
            const p1 = pathData.points[i];
            const midPoint = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
            ctx.quadraticCurveTo(p0[0], p0[1], midPoint[0], midPoint[1]);
          }
          // Draw the last point
          const lastPoint = pathData.points[pathData.points.length - 1];
          ctx.lineTo(lastPoint[0], lastPoint[1]);
        }
        ctx.strokeStyle = pathData.color;
        ctx.lineWidth = pathData.thickness * 0.5; // Scale down slightly to match perceived thickness of other tools
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = 0.7; // Give pencil a slightly faded/graphite look
        ctx.stroke();
        ctx.globalAlpha = 1.0; // Reset alpha
      } else {
        const options = getToolOptions(pathData.tool, pathData.thickness);
        const stroke = getStroke(pathData.points, options);
        const pathString = getSvgPathFromStroke(stroke);
        
        const p = new Path2D(pathString);
        ctx.fillStyle = pathData.color;
        ctx.fill(p);
      }
    };

    elements.forEach(drawPath);

    // Draw current path
    if (currentPath) {
      drawPath(currentPath);
    }

    ctx.restore();
  }, [elements, currentPath, appState.camera]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{ touchAction: 'none', cursor: appState.tool === 'hand' ? 'grab' : 'crosshair' }}
      />
    </div>
  );
};

export default Whiteboard;

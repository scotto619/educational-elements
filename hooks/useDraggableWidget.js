import { useState, useRef, useEffect, useCallback } from 'react';

const MARGIN = 24;
const MOVE_THRESHOLD = 4;

const clamp = (value, min, max) => {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

const useDraggableWidget = (dependencies = []) => {
  const containerRef = useRef(null);
  const pointerIdRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const initialPointerRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const blockClickRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const [position, setPosition] = useState({ x: MARGIN, y: MARGIN });

  const getBounds = useCallback(() => {
    if (typeof window === 'undefined') {
      return { minX: MARGIN, minY: MARGIN, maxX: MARGIN, maxY: MARGIN };
    }

    const rect = containerRef.current?.getBoundingClientRect();
    const width = rect?.width ?? 0;
    const height = rect?.height ?? 0;
    const maxX = window.innerWidth - width - MARGIN;
    const maxY = window.innerHeight - height - MARGIN;

    return {
      minX: MARGIN,
      minY: MARGIN,
      maxX,
      maxY,
    };
  }, []);

  const clampPosition = useCallback((x, y) => {
    const { minX, minY, maxX, maxY } = getBounds();
    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    };
  }, [getBounds]);

  const recalculatePosition = useCallback((preferDefaults = false) => {
    if (typeof window === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const defaultX = window.innerWidth - rect.width - MARGIN;
      const defaultY = window.innerHeight - rect.height - MARGIN;

      setPosition((previous) => {
        if (!hasInitializedRef.current || preferDefaults) {
          hasInitializedRef.current = true;
          return clampPosition(defaultX, defaultY);
        }

        return clampPosition(previous.x, previous.y);
      });
    });
  }, [clampPosition]);

  useEffect(() => {
    recalculatePosition(!hasInitializedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const handleResize = () => {
      setPosition((previous) => clampPosition(previous.x, previous.y));
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [clampPosition]);

  useEffect(() => {
    recalculatePosition(!hasInitializedRef.current);
  }, [recalculatePosition]);

  const handlePointerDown = useCallback((event) => {
    const handle = event.target.closest('[data-drag-handle="true"]');
    if (!handle || !containerRef.current) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    isDraggingRef.current = false;
    blockClickRef.current = false;

    const rect = containerRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    initialPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    containerRef.current.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (pointerIdRef.current !== event.pointerId || !containerRef.current) {
      return;
    }

    const deltaX = event.clientX - initialPointerRef.current.x;
    const deltaY = event.clientY - initialPointerRef.current.y;
    const hasMovedFarEnough = Math.abs(deltaX) > MOVE_THRESHOLD || Math.abs(deltaY) > MOVE_THRESHOLD;

    if (!isDraggingRef.current && !hasMovedFarEnough) {
      return;
    }

    if (!isDraggingRef.current && hasMovedFarEnough) {
      isDraggingRef.current = true;
      blockClickRef.current = true;
    }

    if (!isDraggingRef.current) {
      return;
    }

    event.preventDefault();

    const newX = event.clientX - dragOffsetRef.current.x;
    const newY = event.clientY - dragOffsetRef.current.y;

    setPosition(clampPosition(newX, newY));
  }, [clampPosition]);

  const endDrag = useCallback((event) => {
    if (pointerIdRef.current !== event.pointerId) {
      return;
    }

    if (containerRef.current?.hasPointerCapture?.(event.pointerId)) {
      containerRef.current.releasePointerCapture(event.pointerId);
    }

    pointerIdRef.current = null;
    dragOffsetRef.current = { x: 0, y: 0 };
    initialPointerRef.current = { x: 0, y: 0 };

    if (isDraggingRef.current) {
      event.preventDefault();
      event.stopPropagation();
    }

    isDraggingRef.current = false;

    requestAnimationFrame(() => {
      blockClickRef.current = false;
    });
  }, []);

  const handleClickCapture = useCallback((event) => {
    if (blockClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      blockClickRef.current = false;
    }
  }, []);

  return {
    containerRef,
    position,
    eventHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    handleClickCapture,
  };
};

export default useDraggableWidget;

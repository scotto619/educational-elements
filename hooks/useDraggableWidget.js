import { useState, useRef, useCallback, useEffect } from 'react';

const MARGIN = 24;
const MOVE_THRESHOLD = 4;

const clamp = (value, min, max) => {
  if (max < min) {
    return min;
  }
  return Math.min(Math.max(value, min), max);
};

const getDefaultPosition = (rect) => {
  if (typeof window === 'undefined') {
    return { x: MARGIN, y: MARGIN };
  }

  const width = rect?.width ?? 0;
  const height = rect?.height ?? 0;

  return {
    x: window.innerWidth - width - MARGIN,
    y: window.innerHeight - height - MARGIN,
  };
};

export default function useDraggableWidget(...deps) {
  const dependencies = deps.length ? deps : [];

  const containerRef = useRef(null);
  const pointerIdRef = useRef(null);
  const dragOffsetRef = useRef({ x: 0, y: 0 });
  const initialPointerRef = useRef({ x: 0, y: 0 });
  const blockClickRef = useRef(false);
  const hasPlacedRef = useRef(false);

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
      maxX: Math.max(MARGIN, maxX),
      maxY: Math.max(MARGIN, maxY),
    };
  }, []);

  const clampPosition = useCallback((x, y) => {
    const { minX, minY, maxX, maxY } = getBounds();
    return {
      x: clamp(x, minX, maxX),
      y: clamp(y, minY, maxY),
    };
  }, [getBounds]);

  const placeWithinViewport = useCallback((useDefault = false) => {
    if (typeof window === 'undefined') {
      return;
    }

    requestAnimationFrame(() => {
      if (!containerRef.current) {
        return;
      }

      const rect = containerRef.current.getBoundingClientRect();
      const defaults = getDefaultPosition(rect);

      setPosition((previous) => {
        if (!hasPlacedRef.current || useDefault) {
          hasPlacedRef.current = true;
          return clampPosition(defaults.x, defaults.y);
        }

        return clampPosition(previous.x, previous.y);
      });
    });
  }, [clampPosition]);

  useEffect(() => {
    placeWithinViewport(!hasPlacedRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  useEffect(() => {
    placeWithinViewport(!hasPlacedRef.current);
  }, [placeWithinViewport]);

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

  const handlePointerDown = useCallback((event) => {
    if (!containerRef.current) {
      return;
    }

    const handle = event.target.closest('[data-drag-handle="true"]');
    if (!handle || !containerRef.current.contains(handle)) {
      return;
    }

    pointerIdRef.current = event.pointerId;
    dragOffsetRef.current = { x: 0, y: 0 };
    initialPointerRef.current = { x: event.clientX, y: event.clientY };

    const rect = containerRef.current.getBoundingClientRect();
    dragOffsetRef.current = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    blockClickRef.current = false;

    containerRef.current.setPointerCapture?.(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event) => {
    if (pointerIdRef.current !== event.pointerId || !containerRef.current) {
      return;
    }

    const deltaX = event.clientX - initialPointerRef.current.x;
    const deltaY = event.clientY - initialPointerRef.current.y;
    const hasMovedEnough = Math.abs(deltaX) > MOVE_THRESHOLD || Math.abs(deltaY) > MOVE_THRESHOLD;

    if (!blockClickRef.current && hasMovedEnough) {
      blockClickRef.current = true;
    }

    if (!hasMovedEnough && !blockClickRef.current) {
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
    initialPointerRef.current = { x: 0, y: 0 };
    dragOffsetRef.current = { x: 0, y: 0 };

    if (blockClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      requestAnimationFrame(() => {
        blockClickRef.current = false;
      });
    }
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
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
    },
    handleClickCapture,
  };
}

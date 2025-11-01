const parseFallbackList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);
};

const dedupeArray = (items = []) => {
  const seen = new Set();
  const result = [];
  items.forEach((item) => {
    if (!item || seen.has(item)) return;
    seen.add(item);
    result.push(item);
  });
  return result;
};

const toBrowserPath = (path) => {
  if (!path || typeof path !== 'string') return path;
  if (!path.startsWith('/')) return path;

  const [pathname, queryOrHash] = path.split(/(?=[?#])/);
  const encoded = pathname
    .split('/')
    .map((segment, index) => {
      if (index === 0) return segment; // Preserve leading empty segment
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch (error) {
        return encodeURIComponent(segment);
      }
    })
    .join('/');

  return `${encoded}${queryOrHash || ''}`;
};

export const normalizeImageSource = (source, defaultSrc = '') => {
  if (source && typeof source === 'object' && 'src' in source) {
    const rawFallbacks = Array.isArray(source.fallbacks) ? source.fallbacks : [];
    const normalizedSrc = toBrowserPath(source.src || defaultSrc);
    const normalizedFallbacks = dedupeArray([
      ...rawFallbacks.map(toBrowserPath),
      defaultSrc && toBrowserPath(defaultSrc)
    ]).filter((candidate) => candidate && candidate !== normalizedSrc);

    return {
      src: normalizedSrc || toBrowserPath(defaultSrc),
      fallbacks: normalizedFallbacks
    };
  }

  const resolvedSrc = toBrowserPath(source) || toBrowserPath(defaultSrc);
  const fallbackList = [];
  if (defaultSrc && resolvedSrc !== toBrowserPath(defaultSrc)) {
    fallbackList.push(toBrowserPath(defaultSrc));
  }

  return {
    src: resolvedSrc,
    fallbacks: fallbackList
  };
};

export const serializeFallbacks = (fallbacks = []) => dedupeArray(fallbacks).join('|');

export const createImageErrorHandler = (defaultSrc = '') => (event) => {
  if (!event?.currentTarget) return;

  const fallbacks = parseFallbackList(event.currentTarget.dataset.fallbacks);
  const nextIndex = Number(event.currentTarget.dataset.fallbackIndex || '0');

  if (nextIndex < fallbacks.length) {
    event.currentTarget.dataset.fallbackIndex = String(nextIndex + 1);
    event.currentTarget.src = fallbacks[nextIndex];
    return;
  }

  const normalizedDefault = toBrowserPath(defaultSrc);
  if (normalizedDefault && event.currentTarget.src !== normalizedDefault) {
    event.currentTarget.dataset.fallbackIndex = String(nextIndex + 1);
    event.currentTarget.src = normalizedDefault;
  }
};

export default {
  normalizeImageSource,
  serializeFallbacks,
  createImageErrorHandler
};

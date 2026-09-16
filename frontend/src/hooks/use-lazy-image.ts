import { useState, useEffect, useCallback, useRef } from 'react';
import { searchUnsplashSimple } from '@/services/images';

interface UseLazyImageOptions {
  imageUrl: string;
  imageQuery?: string;
  orientation?: 'landscape' | 'portrait' | 'squarish';
  onImageLoaded?: (url: string) => void;
  disabled?: boolean;
}

export function useLazyImage({
  imageUrl,
  imageQuery,
  orientation = 'landscape',
  onImageLoaded,
  disabled = false,
}: UseLazyImageOptions) {
  const [url, setUrl] = useState(imageUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if we've already fetched or are currently fetching for this query
  const fetchedQueryRef = useRef<string | null>(null);
  const loadingQueryRef = useRef<string | null>(null);
  const onImageLoadedRef = useRef(onImageLoaded);
  
  // Keep the callback ref updated
  useEffect(() => {
    onImageLoadedRef.current = onImageLoaded;
  }, [onImageLoaded]);

  const fetchImage = useCallback(async (query: string) => {
    // Prevent duplicate fetches for the same query if already fetched or loading
    if (fetchedQueryRef.current === query || loadingQueryRef.current === query) {
      return;
    }
    
    loadingQueryRef.current = query;
    setIsLoading(true);
    setError(null);

    try {
      const fetchedUrl = await searchUnsplashSimple(query, orientation);
      if (fetchedUrl) {
        fetchedQueryRef.current = query;
        setUrl(fetchedUrl);
        // Call the callback via ref to avoid dependency issues
        onImageLoadedRef.current?.(fetchedUrl);
      } else {
        setError('No image found');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch image');
    } finally {
      setIsLoading(false);
      loadingQueryRef.current = null;
    }
  }, [orientation]);

  // Reset fetched query ref when disabled changes from true to false
  // This allows fetching to happen after streaming ends
  const prevDisabledRef = useRef(disabled);
  useEffect(() => {
    if (prevDisabledRef.current && !disabled) {
      // Was disabled, now enabled - reset so we can fetch
      fetchedQueryRef.current = null;
      loadingQueryRef.current = null;
    }
    prevDisabledRef.current = disabled;
  }, [disabled]);

  useEffect(() => {
    // If disabled (e.g., during streaming), don't fetch anything
    if (disabled) return;

    // If we already have a URL from props, use it
    if (imageUrl && imageUrl.length > 0) {
      if (url !== imageUrl) {
        setUrl(imageUrl);
      }
      fetchedQueryRef.current = null; // Reset so we can fetch again if needed
      return;
    }

    // If no URL but we have a query, fetch from Unsplash with a small debounce
    if (!imageUrl && imageQuery && imageQuery.length > 0) {
      // Skip if we already fetched or are loading this query
      if (fetchedQueryRef.current === imageQuery || loadingQueryRef.current === imageQuery) {
        return;
      }
      
      const timer = setTimeout(() => {
        fetchImage(imageQuery);
      }, 300); // 300ms debounce
      
      return () => clearTimeout(timer);
    }
  }, [imageUrl, imageQuery, fetchImage, disabled, url]);

  return { url, isLoading, error, refetch: () => imageQuery && fetchImage(imageQuery) };
}

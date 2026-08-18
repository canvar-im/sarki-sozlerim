import { SongLink } from '../types';

/**
 * Automatically detects the platform type from a given URL
 */
export function detectPlatform(url: string): 'youtube' | 'spotify' | 'apple' | null {
  const lowercaseUrl = url.toLowerCase();
  
  if (lowercaseUrl.includes('youtube.com') || lowercaseUrl.includes('youtu.be')) {
    return 'youtube';
  }
  if (lowercaseUrl.includes('spotify.com')) {
    return 'spotify';
  }
  if (lowercaseUrl.includes('apple.com') || lowercaseUrl.includes('music.apple')) {
    return 'apple';
  }
  return null;
}

/**
 * Extracts YouTube Video ID for iframe embeds
 */
export function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  if (match && match[2].length === 11) {
    return match[2];
  }
  return null;
}

/**
 * Checks if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

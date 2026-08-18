import { Song, SongLink } from '../types';

/**
 * Backups (JSON import) or manually edited localStorage data can easily be
 * missing fields the UI assumes always exist (e.g. `links`, `tags`). Every
 * screen in this app reads those arrays directly (song.tags.slice(...),
 * song.links.length, etc.) with no null-checks, so a single incomplete
 * record used to crash the whole app to a blank screen — and since the bad
 * record gets written straight to localStorage, the crash would repeat on
 * every future launch with no way to recover from inside the app.
 *
 * normalizeSong backfills every optional/array field with a safe default so
 * partial or hand-edited data can never reach the render tree in a shape it
 * doesn't expect. Returns null only when the record is missing the truly
 * required identity fields (id/title/artist).
 */
export function normalizeSong(raw: unknown): Song | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;

  const id = typeof r.id === 'string' && r.id.trim() ? r.id : null;
  const title = typeof r.title === 'string' && r.title.trim() ? r.title : null;
  const artist = typeof r.artist === 'string' && r.artist.trim() ? r.artist : null;

  if (!id || !title || !artist) return null;

  const now = Date.now();

  const links: SongLink[] = Array.isArray(r.links)
    ? (r.links as unknown[]).filter(
        (l): l is SongLink =>
          !!l &&
          typeof l === 'object' &&
          typeof (l as SongLink).id === 'string' &&
          typeof (l as SongLink).url === 'string' &&
          ['youtube', 'spotify', 'apple'].includes((l as SongLink).platform)
      )
    : [];

  const tags: string[] = Array.isArray(r.tags)
    ? (r.tags as unknown[]).filter((t): t is string => typeof t === 'string')
    : [];

  return {
    id,
    title,
    artist,
    genre: typeof r.genre === 'string' && r.genre ? r.genre : 'Diğer',
    lyrics: typeof r.lyrics === 'string' ? r.lyrics : '',
    links,
    tags,
    notes: typeof r.notes === 'string' ? r.notes : undefined,
    isFavorite: typeof r.isFavorite === 'boolean' ? r.isFavorite : false,
    createdAt: typeof r.createdAt === 'number' ? r.createdAt : now,
    updatedAt: typeof r.updatedAt === 'number' ? r.updatedAt : now,
  };
}

export function normalizeSongs(raw: unknown): Song[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map(normalizeSong)
    .filter((s): s is Song => s !== null);
}

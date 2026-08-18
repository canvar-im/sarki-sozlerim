import * as mammoth from 'mammoth';
import { Document, Packer, Paragraph, TextRun } from 'docx';

export function normalizeLyricsText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

export async function extractLyricsFromDocx(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });

  return normalizeLyricsText(result.value);
}

export async function extractLyricsFromWordFile(file: File): Promise<string> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.docx')) {
    return extractLyricsFromDocx(file);
  }

  if (fileName.endsWith('.doc')) {
    const { default: WordExtractor } = await import('word-extractor');
    // word-extractor only recognizes a real Node Buffer (via Buffer.isBuffer)
    // or a filename string — a plain Uint8Array/ArrayBuffer is silently
    // ignored and causes a crash inside the library. Buffer is polyfilled
    // for the browser build (see vite.config.ts), so this now works.
    const arrayBuffer = await file.arrayBuffer();
    const nodeBuffer = Buffer.from(arrayBuffer);
    const extractor = new WordExtractor();
    const doc = await extractor.extract(nodeBuffer);
    return normalizeLyricsText(doc.getBody() || '');
  }

  throw new Error('Desteklenmeyen Word dosyası türü.');
}

export async function createLyricsDocxBlob(song: {
  title: string;
  artist: string;
  genre: string;
  lyrics: string;
  notes?: string;
}): Promise<Blob> {
  const lyricText = normalizeLyricsText(song.lyrics);
  const lyricParagraphs = lyricText
    ? lyricText.split('\n').map(
        (line) =>
          new Paragraph({
            children: [new TextRun(line || ' ')],
          })
      )
    : [
        new Paragraph({
          children: [new TextRun('Şarkı sözleri henüz eklenmemiş.')],
        }),
      ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: song.title,
                bold: true,
                size: 28,
                color: '0F172A',
              }),
            ],
            spacing: { after: 120 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `${song.artist} • ${song.genre}`,
                italics: true,
                size: 20,
                color: '475569',
              }),
            ],
            spacing: { after: 240 },
          }),
          ...lyricParagraphs,
          ...(song.notes?.trim()
            ? [
                new Paragraph({ spacing: { before: 240, after: 120 } }),
                new Paragraph({
                  children: [
                    new TextRun({
                      text: 'Notlar',
                      bold: true,
                      size: 22,
                      color: '0F172A',
                    }),
                  ],
                  spacing: { before: 240, after: 120 },
                }),
                new Paragraph({
                  children: [new TextRun({ text: song.notes, size: 20, color: '334155' })],
                }),
              ]
            : []),
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

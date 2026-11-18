// Demo fixture — SAMPLE DATA, not a real extraction.
// Shape mirrors what the downr.org service returns for a video URL: an
// object whose string values are media URLs, which the results UI renders
// as download cards. The URLs below point at public sample files, so the
// "Access Media" buttons in demo mode open real (tiny) files — but nothing
// here was extracted from a social platform. Demo mode exists so the
// results UI can be exercised even when downr.org is unreachable.

export const DEMO_INPUT_URL =
  'https://www.tiktok.com/@contoh/video/7405258093173181729';

export const DEMO_RESULT = {
  title: 'Contoh Video — Demo (data contoh, bukan hasil ekstraksi)',
  author: '@contoh',
  duration: '0:12',
  thumbnail:
    'https://picsum.photos/seed/media-downloader-demo/640/360',
  video_hd:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  video_sd:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  audio:
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  cover:
    'https://picsum.photos/seed/media-downloader-cover/480/480',
};

export const DEMO_RESPONSE = {
  Status: true,
  Code: 200,
  Input: DEMO_INPUT_URL,
  Endpoint: 'demo-fixture',
  Result: DEMO_RESULT,
  Error: null,
};

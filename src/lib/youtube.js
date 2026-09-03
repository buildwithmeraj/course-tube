export const getServerYouTubeApiKey = () => process.env.YOUTUBE_API_KEY;
export const getSiteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

const getPlaylistId = (input) => {
  if (!input) return null;
  if (/^PL[a-zA-Z0-9_-]{16,}$/.test(input)) return input;
  try {
    const url = new URL(input);
    return url.searchParams.get("list");
  } catch {
    return null;
  }
};
export default getPlaylistId;

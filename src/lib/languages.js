// Course languages. The catalogue is Bangla-dominant with some English and
// Hindi, so a language filter is more useful here than most other facets.
export const LANGUAGES = [
  { value: "bn", label: "Bangla" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "other", label: "Other" },
];

export const LANGUAGE_VALUES = LANGUAGES.map((language) => language.value);

export const isValidLanguage = (value) => LANGUAGE_VALUES.includes(value);

export const languageLabel = (value) =>
  LANGUAGES.find((language) => language.value === value)?.label || null;

// Best-effort guess from a course title, used only to seed existing rows.
// Anything uncertain is left unset for a human to decide.
export function guessLanguage(title = "") {
  const text = String(title);
  if (/[ঀ-৿]/.test(text)) return "bn"; // Bengali script
  if (/\bbangla\b|\bbengali\b/i.test(text)) return "bn";
  if (/\bhindi\b/i.test(text)) return "hi";
  if (/\benglish\b/i.test(text)) return "en";
  return null;
}

// Placeholder: swap in nspell/typo-js with user dictionaries once dependency policy is approved.
const COMMON_TYPO_MAP = {
  teh: "the",
  recieve: "receive",
  adress: "address",
  definately: "definitely",
  seperate: "separate",
  ocassion: "occasion",
  occurence: "occurrence"
};

export function spellcheckText(text = "", options = {}) {
  if (!text) {
    return "";
  }

  const dictionary = {
    ...COMMON_TYPO_MAP,
    ...(options.customDictionary ?? {})
  };

  return text.replace(/\b([A-Za-z]+)\b/g, (match) => {
    const lower = match.toLowerCase();
    const replacement = dictionary[lower];
    if (!replacement) {
      return match;
    }

    if (match === match.toUpperCase()) {
      return replacement.toUpperCase();
    }

    if (match[0] === match[0].toUpperCase()) {
      return replacement.charAt(0).toUpperCase() + replacement.slice(1);
    }

    return replacement;
  });
}

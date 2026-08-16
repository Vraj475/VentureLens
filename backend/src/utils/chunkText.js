module.exports = function chunkText(text, chunkSize = 250, overlap = 40) {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks = [];
  let i = 0;
  while (i < words.length) { chunks.push(words.slice(i, i + chunkSize).join(' ')); i += chunkSize - overlap; }
  return chunks;
};

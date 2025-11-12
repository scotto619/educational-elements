const FALLBACK_ENTRIES = {
  vivid: {
    word: 'vivid',
    pronunciation: 'viv-id',
    partOfSpeech: ['adjective'],
    definitions: [
      'Producing powerful feelings or strong, clear images in the mind.',
      'Very bright in colour.'
    ],
    examples: [
      'The author uses vivid language to bring the setting to life.'
    ],
    synonyms: ['bright', 'intense', 'colourful']
  },
  courage: {
    word: 'courage',
    pronunciation: 'kur-ij',
    partOfSpeech: ['noun'],
    definitions: [
      'The ability to do something that frightens one.',
      'Strength in the face of pain or grief.'
    ],
    examples: [
      'It took great courage to stand up for her classmate.'
    ],
    synonyms: ['bravery', 'valor', 'nerve']
  },
  ecosystem: {
    word: 'ecosystem',
    pronunciation: 'ee-koh-sis-tuhm',
    partOfSpeech: ['noun'],
    definitions: [
      'A biological community of interacting organisms and their physical environment.'
    ],
    examples: [
      'Each ecosystem has a delicate balance between plants and animals.'
    ],
    synonyms: ['habitat', 'biome']
  }
};

const cleanExample = (text = '') =>
  text
    .replace(/\{\/@?it\}/g, '')
    .replace(/\{\/@?wi\}/g, '')
    .replace(/\{\/@?sc\}/g, '')
    .replace(/\{\/@?ss\}/g, '')
    .replace(/\{\/@?pr\}/g, '')
    .replace(/\{\/@?dxt\}/g, '')
    .trim();

const extractExamples = (entry) => {
  const examples = [];
  const definitions = entry?.def || [];
  definitions.forEach(definition => {
    (definition.sseq || []).forEach(sequence => {
      sequence.forEach(item => {
        const sense = item?.[1];
        const data = sense?.dt || [];
        data.forEach(defText => {
          if (defText[0] === 'vis') {
            defText[1].forEach(example => {
              if (example?.t) {
                const cleaned = cleanExample(example.t);
                if (cleaned) {
                  examples.push(cleaned);
                }
              }
            });
          }
        });
      });
    });
  });
  return Array.from(new Set(examples)).slice(0, 5);
};

const extractSynonyms = (entry) => {
  const raw = entry?.meta?.syns || [];
  const flattened = raw.flat().map(synonym => synonym.trim()).filter(Boolean);
  return Array.from(new Set(flattened)).slice(0, 15);
};

const extractPartOfSpeech = (entry) => {
  const fl = entry?.fl;
  if (!fl) return [];
  return [fl];
};

const extractPronunciation = (entry) => {
  const pronunciation = entry?.hwi?.prs?.[0]?.mw;
  if (!pronunciation) return undefined;
  return pronunciation.replace(/\*/g, '·');
};

const buildResponsePayload = (entry, fallbackWord) => {
  if (!entry && fallbackWord) {
    return FALLBACK_ENTRIES[fallbackWord];
  }

  if (!entry) return null;

  return {
    word: entry?.meta?.id?.split(':')[0] || fallbackWord,
    pronunciation: extractPronunciation(entry),
    partOfSpeech: extractPartOfSpeech(entry),
    definitions: entry?.shortdef || [],
    examples: extractExamples(entry),
    synonyms: extractSynonyms(entry)
  };
};

const fromDictionaryCom = async (word, baseUrl, apiKey) => {
  try {
    const definitionUrl = `${baseUrl}/collegiate/json/${encodeURIComponent(word)}?key=${apiKey}`;
    const thesaurusUrl = `${baseUrl}/thesaurus/json/${encodeURIComponent(word)}?key=${apiKey}`;

    const [definitionResponse, thesaurusResponse] = await Promise.all([
      fetch(definitionUrl),
      fetch(thesaurusUrl)
    ]);

    if (!definitionResponse.ok) {
      return null;
    }

    const definitionJson = await definitionResponse.json();
    const primaryEntry = Array.isArray(definitionJson)
      ? definitionJson.find(entry => typeof entry === 'object')
      : null;

    let synonyms = [];
    if (thesaurusResponse.ok) {
      const thesaurusJson = await thesaurusResponse.json();
      const synonymEntry = Array.isArray(thesaurusJson)
        ? thesaurusJson.find(entry => typeof entry === 'object')
        : null;
      if (synonymEntry) {
        synonyms = extractSynonyms(synonymEntry);
      }
    }

    const payload = buildResponsePayload(primaryEntry, word) || buildResponsePayload(null, word);
    if (!payload) return null;

    payload.synonyms = Array.from(new Set([...(payload.synonyms || []), ...synonyms])).slice(0, 20);
    payload.source = 'dictionary.com-api';
    return payload;
  } catch (error) {
    console.error('Dictionary.com lookup failed', error);
    return null;
  }
};

const mapCommunityEntry = (entry, fallbackWord) => {
  if (!entry) return null;

  const meanings = Array.isArray(entry.meanings) ? entry.meanings : [];
  const partOfSpeech = new Set();
  const definitions = [];
  const examples = [];
  const synonyms = new Set();

  meanings.forEach(meaning => {
    if (meaning.partOfSpeech) {
      partOfSpeech.add(meaning.partOfSpeech);
    }
    (meaning.definitions || []).forEach(def => {
      if (def.definition) {
        definitions.push(def.definition);
      }
      if (def.example) {
        examples.push(def.example);
      }
      (def.synonyms || []).forEach(synonym => synonyms.add(synonym));
    });
    (meaning.synonyms || []).forEach(synonym => synonyms.add(synonym));
  });

  return {
    word: entry.word || fallbackWord,
    pronunciation: entry.phonetic || entry.phonetics?.[0]?.text,
    partOfSpeech: Array.from(partOfSpeech),
    definitions,
    examples,
    synonyms: Array.from(synonyms)
  };
};

const fromCommunityDictionary = async (word) => {
  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const payload = mapCommunityEntry(data[0], word);
    if (payload) {
      payload.source = 'dictionaryapi.dev';
    }
    return payload;
  } catch (error) {
    console.error('DictionaryAPI.dev lookup failed', error);
    return null;
  }
};

const fromDatamuse = async (word) => {
  try {
    const response = await fetch(`https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}&max=20`);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      return [];
    }
    return data
      .map(entry => entry.word)
      .filter(Boolean)
      .map(item => item.toLowerCase());
  } catch (error) {
    console.error('Datamuse lookup failed', error);
    return [];
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word = '' } = req.query;
  const trimmedWord = String(word).trim().toLowerCase();

  if (!trimmedWord) {
    return res.status(400).json({ error: 'Please provide a word to look up.' });
  }

  const apiKey = process.env.DICTIONARYCOM_API_KEY;
  const baseUrl = process.env.DICTIONARYCOM_BASE_URL || 'https://www.dictionaryapi.com/api/v3/references';

  try {
    let payload = null;

    if (apiKey) {
      payload = await fromDictionaryCom(trimmedWord, baseUrl, apiKey);
    }

    if (!payload) {
      payload = await fromCommunityDictionary(trimmedWord);
      if (payload) {
        const communitySynonyms = await fromDatamuse(trimmedWord);
        payload.synonyms = Array.from(new Set([...(payload.synonyms || []), ...communitySynonyms])).slice(0, 20);
      }
    }

    if (!payload) {
      const fallback = buildResponsePayload(null, trimmedWord) || {
        word: trimmedWord,
        pronunciation: undefined,
        partOfSpeech: [],
        definitions: [],
        examples: [],
        synonyms: []
      };
      fallback.source = 'fallback';
      return res.status(200).json(fallback);
    }

    return res.status(200).json(payload);
  } catch (error) {
    console.error('Dictionary API error', error);
    const fallback = buildResponsePayload(null, trimmedWord);
    if (fallback) {
      return res.status(200).json({ ...fallback, source: 'fallback' });
    }
    return res.status(500).json({ error: 'Unable to fetch word right now.' });
  }
}

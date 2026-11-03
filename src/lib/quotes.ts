export interface WorldQuote {
  id: string
  original: string
  transliteration?: string
  translation: string
  author: string
  culture: string
  language: string
  category: 'perseverance' | 'wisdom' | 'discipline' | 'courage' | 'growth'
  flag: string
}

export const WORLD_QUOTES: WorldQuote[] = [
  // Arabic
  {
    id: 'ar-1',
    original: 'مَنْ جَدَّ وَجَدَ، وَمَنْ زَرَعَ حَصَدَ',
    transliteration: 'Man jadda wajada, wa man zara\'a hasada',
    translation: 'Whoever strives with diligence shall find, and whoever sows shall reap.',
    author: 'Classical Proverb',
    culture: 'Arabic & Islamic Civilization',
    language: 'Arabic',
    category: 'perseverance',
    flag: '🌍',
  },
  {
    id: 'ar-2',
    original: 'الوقت كالسيف، إن لم تقطعه قطعك',
    transliteration: 'Al-waqtu ka-sayfi, in lam taqta\'hu qata\'ak',
    translation: 'Time is like a sword: if you do not cut it, it will cut you.',
    author: 'Imam Al-Shafi\'i',
    culture: 'Arabian Philosophy',
    language: 'Arabic',
    category: 'discipline',
    flag: '⏳',
  },
  {
    id: 'ar-3',
    original: 'لا تؤجل عمل اليوم إلى الغد',
    transliteration: 'La tu\'ajjil \'amal al-yawmi ila al-ghad',
    translation: 'Do not postpone today\'s work for tomorrow.',
    author: 'Traditional Adage',
    culture: 'Arabic Wisdom',
    language: 'Arabic',
    category: 'discipline',
    flag: '⚡',
  },
  {
    id: 'ar-4',
    original: 'اطلبوا العلم من المهد إلى اللحد',
    transliteration: 'Utlubu al-\'ilma min al-mahdi ila al-lahd',
    translation: 'Seek knowledge from the cradle to the grave.',
    author: 'Scholarly Tradition',
    culture: 'Islamic Golden Age',
    language: 'Arabic',
    category: 'growth',
    flag: '📜',
  },
  {
    id: 'ar-5',
    original: 'العلم نور، والجهل ظلام',
    transliteration: 'Al-\'ilmu noorun, wa al-jahlu dhalam',
    translation: 'Knowledge is light, and ignorance is darkness.',
    author: 'Classical Proverb',
    culture: 'Arabian Wisdom',
    language: 'Arabic',
    category: 'wisdom',
    flag: '💡',
  },

  // Japanese
  {
    id: 'ja-1',
    original: '七転び八起き',
    transliteration: 'Nana korobi ya oki',
    translation: 'Fall down seven times, stand up eight.',
    author: 'Japanese Proverb (Yojijukugo)',
    culture: 'Japan',
    language: 'Japanese',
    category: 'perseverance',
    flag: '🇯🇵',
  },
  {
    id: 'ja-2',
    original: '継続は力なり',
    transliteration: 'Keizoku wa chikara nari',
    translation: 'Continuity and consistency become unmatched strength.',
    author: 'Kanji Philosophy',
    culture: 'Japan',
    language: 'Japanese',
    category: 'discipline',
    flag: '⚔️',
  },
  {
    id: 'ja-3',
    original: '初心忘るべからず',
    transliteration: 'Shoshin wasuru bekarazu',
    translation: 'Never forget the beginner\'s mind: stay humble, eager, and open to learn.',
    author: 'Zeami Motokiyo',
    culture: 'Japan (Noh Theater)',
    language: 'Japanese',
    category: 'growth',
    flag: '🌸',
  },
  {
    id: 'ja-4',
    original: '勝って兜の緒を締めよ',
    transliteration: 'Katte kabuto no o o shimeyo',
    translation: 'Tighten your helmet strings after a victory; stay vigilant in triumph.',
    author: 'Samurai Code',
    culture: 'Feudal Japan',
    language: 'Japanese',
    category: 'discipline',
    flag: '🏯',
  },

  // Latin
  {
    id: 'la-1',
    original: 'Per aspera ad astra',
    transliteration: 'Per aspera ad astra',
    translation: 'Through hardships and adversity to the stars.',
    author: 'Seneca the Younger',
    culture: 'Roman Stoicism',
    language: 'Latin',
    category: 'perseverance',
    flag: '✨',
  },
  {
    id: 'la-2',
    original: 'Aut inveniam viam aut faciam',
    transliteration: 'Aut inveniam viam aut faciam',
    translation: 'I will either find a way, or I will make one.',
    author: 'Hannibal Barca',
    culture: 'Carthaginian & Roman Antiquity',
    language: 'Latin',
    category: 'courage',
    flag: '🛡️',
  },
  {
    id: 'la-3',
    original: 'Vires acquirit eundo',
    transliteration: 'Vires acquirit eundo',
    translation: 'It gathers strength as it moves along.',
    author: 'Virgil (Aeneid)',
    culture: 'Ancient Rome',
    language: 'Latin',
    category: 'growth',
    flag: '🏛️',
  },
  {
    id: 'la-4',
    original: 'Gutta cavat lapidem, consumitur anulus usu',
    transliteration: 'Gutta cavat lapidem',
    translation: 'A water drop hollows out the rock not by force, but by falling often.',
    author: 'Ovid',
    culture: 'Roman Classical',
    language: 'Latin',
    category: 'perseverance',
    flag: '💧',
  },

  // Chinese
  {
    id: 'zh-1',
    original: '千里之行，始於足下',
    transliteration: 'Qiānlǐ zhī xíng, shǐ yú zúxià',
    translation: 'A journey of a thousand miles begins with a single step under your feet.',
    author: 'Lao Tzu',
    culture: 'Tao Te Ching (China)',
    language: 'Chinese',
    category: 'growth',
    flag: '🇨🇳',
  },
  {
    id: 'zh-2',
    original: '鍥而不捨，金石可鏤',
    transliteration: 'Qiè ér bù shě, jīn shí kě lòu',
    translation: 'If you carve without pausing, even metal and stone can be engraved.',
    author: 'Xunzi (An Encouragement to Study)',
    culture: 'Ancient China',
    language: 'Chinese',
    category: 'perseverance',
    flag: '💎',
  },
  {
    id: 'zh-3',
    original: '不積跬步，無以至千里',
    transliteration: 'Bù jī kuǐbù, wú yǐ zhì qiānlǐ',
    translation: 'Without accumulating small half-steps, one cannot reach a thousand miles.',
    author: 'Classical Chinese Wisdom',
    culture: 'China',
    language: 'Chinese',
    category: 'discipline',
    flag: '🏮',
  },

  // French
  {
    id: 'fr-1',
    original: 'Petit à petit, l\'oiseau fait son nid',
    translation: 'Little by little, the bird builds its nest — patience and steady action build greatness.',
    author: 'French Adage',
    culture: 'France',
    language: 'French',
    category: 'perseverance',
    flag: '🇫🇷',
  },
  {
    id: 'fr-2',
    original: 'Vouloir, c\'est pouvoir',
    translation: 'To truly will something is to possess the power to accomplish it.',
    author: 'French Proverb',
    culture: 'France',
    language: 'French',
    category: 'courage',
    flag: '🔥',
  },
  {
    id: 'fr-3',
    original: 'Il n\'y a point de génie sans un grain de folie',
    translation: 'There is no great genius without a touch of daring madness.',
    author: 'Aristotle / Montaigne',
    culture: 'French Enlightenment',
    language: 'French',
    category: 'wisdom',
    flag: '🎭',
  },

  // Spanish
  {
    id: 'es-1',
    original: 'Paso a paso se llega lejos',
    translation: 'Step by step, one reaches far horizons.',
    author: 'Hispanic Proverb',
    culture: 'Spain & Latin America',
    language: 'Spanish',
    category: 'perseverance',
    flag: '🇪🇸',
  },
  {
    id: 'es-2',
    original: 'El que no arriesga, no gana',
    translation: 'He who does not risk never crosses the threshold of triumph.',
    author: 'Spanish Idiom',
    culture: 'Iberian Wisdom',
    language: 'Spanish',
    category: 'courage',
    flag: '🎲',
  },
  {
    id: 'es-3',
    original: 'Caminante, no hay camino, se hace camino al andar',
    translation: 'Wanderer, there is no road; you forge the path as you walk.',
    author: 'Antonio Machado',
    culture: 'Spanish Literature',
    language: 'Spanish',
    category: 'growth',
    flag: '🧭',
  },

  // German
  {
    id: 'de-1',
    original: 'Übung macht den Meister',
    translation: 'Deliberate practice creates the master.',
    author: 'German Adage',
    culture: 'Germany',
    language: 'German',
    category: 'discipline',
    flag: '🇩🇪',
  },
  {
    id: 'de-2',
    original: 'Es ist noch kein Meister vom Himmel gefallen',
    translation: 'No master has ever fallen from the sky — greatness is earned from the ground up.',
    author: 'German Proverb',
    culture: 'Germany',
    language: 'German',
    category: 'growth',
    flag: '⚙️',
  },

  // Sanskrit / Hindi
  {
    id: 'sa-1',
    original: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
    transliteration: 'Karmanyevadhikaraste ma phaleshu kadachana',
    translation: 'Focus entirely upon your actions and craftsmanship, never obsess over the fruits.',
    author: 'Bhagavad Gita',
    culture: 'Indian Philosophy',
    language: 'Sanskrit',
    category: 'discipline',
    flag: '🇮🇳',
  },
  {
    id: 'sa-2',
    original: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः',
    transliteration: 'Udyamena hi sidhyanti karyani na manorathaih',
    translation: 'Goals are accomplished only through real execution, never through idle daydreams.',
    author: 'Panchatantra / Hitopadesha',
    culture: 'Ancient India',
    language: 'Sanskrit',
    category: 'perseverance',
    flag: '🕉️',
  },

  // Swahili
  {
    id: 'sw-1',
    original: 'Haba na haba, hujaza kibaba',
    translation: 'Little by little fills the measure — small daily actions yield overflowing abundance.',
    author: 'Swahili Traditional Proverb',
    culture: 'East Africa',
    language: 'Swahili',
    category: 'perseverance',
    flag: '🇰🇪',
  },
  {
    id: 'sw-2',
    original: 'Mvumilivu hula mbivu',
    translation: 'The patient one eats the ripe, sweetest fruit.',
    author: 'African Wisdom',
    culture: 'East Africa',
    language: 'Swahili',
    category: 'wisdom',
    flag: '🌱',
  },

  // Persian
  {
    id: 'fa-1',
    original: 'قطره قطره جمع گردد وانگهی دریا شود',
    transliteration: 'Ghatreh ghatreh jam\' gardad vāngahi daryā shavad',
    translation: 'Drop by drop gathers together, and suddenly a sea is born.',
    author: 'Ali Akbar Dehkhoda',
    culture: 'Persian Poetry',
    language: 'Persian',
    category: 'growth',
    flag: '🌊',
  },
  {
    id: 'fa-2',
    original: 'صبر تلخ است ولیکن بر شیرین دارد',
    transliteration: 'Sabr talkh ast valikan bar-e shirin darad',
    translation: 'Patience has bitter roots, but its fruit is supremely sweet.',
    author: 'Saadi Shirazi',
    culture: 'Persian Literature',
    language: 'Persian',
    category: 'perseverance',
    flag: '🌹',
  },

  // Italian
  {
    id: 'it-1',
    original: 'Chi va piano va sano e va lontano',
    translation: 'He who travels with composure travels safely and reaches extraordinary distances.',
    author: 'Italian Proverb',
    culture: 'Italy',
    language: 'Italian',
    category: 'perseverance',
    flag: '🇮🇹',
  },

  // Ancient Greek
  {
    id: 'gr-1',
    original: 'Χαλεπὰ τὰ καλά',
    transliteration: 'Khalepà tà kalá',
    translation: 'All noble and worthy things are difficult to attain.',
    author: 'Plato',
    culture: 'Classical Greece',
    language: 'Greek',
    category: 'courage',
    flag: '🇬🇷',
  },

  // Korean
  {
    id: 'ko-1',
    original: '시작이 반이다',
    transliteration: 'Sijagi banida',
    translation: 'Starting is half the journey conquered.',
    author: 'Korean Traditional Wisdom',
    culture: 'Korea',
    language: 'Korean',
    category: 'courage',
    flag: '🇰🇷',
  },

  // Turkish
  {
    id: 'tr-1',
    original: 'Damlaya damlaya göl olur',
    translation: 'Drop by drop, a vast lake is formed.',
    author: 'Anatolian Proverb',
    culture: 'Turkey',
    language: 'Turkish',
    category: 'growth',
    flag: '🇹🇷',
  },

  // Portuguese
  {
    id: 'pt-1',
    original: 'Devagar se vai ao longe',
    translation: 'Slowly, steadily, and without stopping, one journeys to the farthest stars.',
    author: 'Lusophone Proverb',
    culture: 'Portugal & Brazil',
    language: 'Portuguese',
    category: 'perseverance',
    flag: '🇵🇹',
  },

  // Russian
  {
    id: 'ru-1',
    original: 'Терпение и труд всё перетрут',
    transliteration: 'Terpeniye i trud vsyo peretrut',
    translation: 'Patience and relentless craftsmanship grind every mountain to dust.',
    author: 'Russian Proverb',
    culture: 'Slavic Lore',
    language: 'Russian',
    category: 'perseverance',
    flag: '🏔️',
  },
]

export const getRandomQuote = (languageFilter?: string): WorldQuote => {
  let pool = WORLD_QUOTES
  if (languageFilter && languageFilter !== 'ALL') {
    pool = pool.filter((q) => q.language.toLowerCase() === languageFilter.toLowerCase())
  }
  if (pool.length === 0) pool = WORLD_QUOTES
  const idx = Math.floor(Math.random() * pool.length)
  return pool[idx]
}


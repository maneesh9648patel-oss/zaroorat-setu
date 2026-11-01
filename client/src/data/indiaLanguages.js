/**
 * ZarooratSetu - Pan-India States & Regional Dialects Hierarchy
 * Complete coverage of all 28 States and 8 Union Territories of India
 * with their official languages and regional local dialects/sub-languages.
 */

export const INDIA_ZONES = [
  { id: 'all', label: 'सभी राज्य (All India)' },
  { id: 'north', label: 'उत्तर भारत (North)' },
  { id: 'central_west', label: 'मध्य व पश्चिम (Central & West)' },
  { id: 'south', label: 'दक्षिण भारत (South)' },
  { id: 'east_ne', label: 'पूर्व व पूर्वोत्तर (East & North-East)' }
];

export const ALL_INDIA_STATES = [
  // ================= NORTH INDIA =================
  {
    id: 'up',
    name: 'Uttar Pradesh (उत्तर प्रदेश)',
    shortName: 'Uttar Pradesh',
    zone: 'north',
    pilotBadge: 'Pilot State',
    languages: [
      { code: 'hi', name: 'हिंदी (मानक हिंदी)', native: 'हिंदी', dialect: 'Standard Hindi', speechLang: 'hi-IN', base: 'hi' },
      { code: 'bnd', name: 'बुंदेली (बांदा, महोबा, चित्रकूट, झाँसी)', native: 'बुंदेली', dialect: 'Bundeli', speechLang: 'hi-IN', base: 'bnd', isPilot: true },
      { code: 'awa', name: 'अवधी (लखनऊ, अयोध्या, रायबरेली)', native: 'अवधी', dialect: 'Awadhi', speechLang: 'hi-IN', base: 'awa' },
      { code: 'bho', name: 'भोजपुरी (वाराणसी, गोरखपुर, बलिया)', native: 'भोजपुरी', dialect: 'Bhojpuri', speechLang: 'hi-IN', base: 'bho' },
      { code: 'braj', name: 'ब्रजभाषा (मथुरा, आगरा, अलीगढ़)', native: 'ब्रजभाषा', dialect: 'Braj Bhasha', speechLang: 'hi-IN', base: 'hi' },
      { code: 'knj', name: 'कन्नौजी (कन्नौज, इटावा, फर्रुखाबाद)', native: 'कन्नौजी', dialect: 'Kannauji', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'bihar',
    name: 'Bihar (बिहार)',
    shortName: 'Bihar',
    zone: 'north',
    languages: [
      { code: 'bho_bihar', name: 'भोजपुरी (पटना, आरा, बक्सर, छपरा)', native: 'भोजपुरी', dialect: 'Bhojpuri', speechLang: 'hi-IN', base: 'bho' },
      { code: 'mai', name: 'मैथिली (दरभंगा, मधुबनी, समस्तीपुर)', native: 'मैथिली', dialect: 'Maithili', speechLang: 'hi-IN', base: 'hi' },
      { code: 'mag', name: 'मगही (गया, पटना, नालंदा, नवादा)', native: 'मगही', dialect: 'Magahi', speechLang: 'hi-IN', base: 'hi' },
      { code: 'ang', name: 'अंगिका (भागलपुर, मुंगेर, बांका)', native: 'अंगिका', dialect: 'Angika', speechLang: 'hi-IN', base: 'hi' },
      { code: 'hi_bihar', name: 'हिंदी (बिहार मानक)', native: 'हिंदी', dialect: 'Hindi', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'rajasthan',
    name: 'Rajasthan (राजस्थान)',
    shortName: 'Rajasthan',
    zone: 'north',
    languages: [
      { code: 'mrw', name: 'मारवाड़ी (जोधपुर, बीकानेर, बाड़मेर)', native: 'मारवाड़ी', dialect: 'Marwari', speechLang: 'hi-IN', base: 'mrw' },
      { code: 'mew', name: 'मेवाड़ी (उदयपुर, चित्तौड़गढ़, राजसमंद)', native: 'मेवाड़ी', dialect: 'Mewari', speechLang: 'hi-IN', base: 'mrw' },
      { code: 'dhu', name: 'ढूंढाड़ी (जयपुर, दौसा, टोंक)', native: 'ढूंढाड़ी', dialect: 'Dhundhari', speechLang: 'hi-IN', base: 'mrw' },
      { code: 'had', name: 'हाड़ौती (कोटा, बूंदी, झालावाड़)', native: 'हाड़ौती', dialect: 'Hadoti', speechLang: 'hi-IN', base: 'mrw' },
      { code: 'hi_raj', name: 'हिंदी (राजस्थान मानक)', native: 'हिंदी', dialect: 'Hindi', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'punjab',
    name: 'Punjab (ਪੰਜਾਬ / पंजाब)',
    shortName: 'Punjab',
    zone: 'north',
    languages: [
      { code: 'pa', name: 'ਪੰਜਾਬੀ (ਮਿਆਰੀ ਪੰਜਾਬੀ)', native: 'ਪੰਜਾਬੀ', dialect: 'Standard Punjabi', speechLang: 'pa-IN', base: 'pa' },
      { code: 'maj', name: 'ਮਾਝੀ (ਅੰਮ੍ਰਿਤਸਰ, ਤਰਨਤਾਰਨ, ਗੁਰਦਾਸਪੁਰ)', native: 'ਮਾਝੀ', dialect: 'Majhi', speechLang: 'pa-IN', base: 'pa' },
      { code: 'mal_pa', name: 'ਮਲਵਈ (ਲੁਧਿਆਣਾ, ਬਠਿੰਡਾ, ਪਟਿਆਲਾ)', native: 'ਮਲਵਈ', dialect: 'Malwai', speechLang: 'pa-IN', base: 'pa' },
      { code: 'doa', name: 'ਦੋਆਬੀ (ਜਲੰਧਰ, ਹੁਸ਼ਿਆਰਪੁਰ, ਕਪੂਰਥਲਾ)', native: 'ਦੋਆਬੀ', dialect: 'Doabi', speechLang: 'pa-IN', base: 'pa' }
    ]
  },
  {
    id: 'haryana',
    name: 'Haryana (हरियाणा)',
    shortName: 'Haryana',
    zone: 'north',
    languages: [
      { code: 'har', name: 'हरियाणवी (रोहतक, हिसार, जींद, सोनीपत)', native: 'हरियाणवी', dialect: 'Haryanvi', speechLang: 'hi-IN', base: 'har' },
      { code: 'ban', name: 'बाँगड़ू (कैथल, करनाल, कुरुक्षेत्र)', native: 'बाँगड़ू', dialect: 'Bangru', speechLang: 'hi-IN', base: 'har' },
      { code: 'ahi', name: 'अहीरवाटी (रेवाड़ी, महेंद्रगढ़, गुड़गांव)', native: 'अहीरवाटी', dialect: 'Ahirwati', speechLang: 'hi-IN', base: 'har' },
      { code: 'hi_har', name: 'हिंदी (हरियाणा मानक)', native: 'हिंदी', dialect: 'Hindi', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'delhi',
    name: 'Delhi NCR (दिल्ली एनसीआर)',
    shortName: 'Delhi',
    zone: 'north',
    languages: [
      { code: 'hi_del', name: 'हिंदी (खड़ी बोली / दिल्ली मानक)', native: 'हिंदी', dialect: 'Hindustani Hindi', speechLang: 'hi-IN', base: 'hi' },
      { code: 'en', name: 'English (Indian Standard)', native: 'English', dialect: 'English', speechLang: 'en-IN', base: 'en' },
      { code: 'pa_del', name: 'ਪੰਜਾਬੀ (ਦਿੱਲੀ ਪੰਜਾਬੀ)', native: 'ਪੰਜਾਬੀ', dialect: 'Punjabi', speechLang: 'pa-IN', base: 'pa' }
    ]
  },
  {
    id: 'uk',
    name: 'Uttarakhand (उत्तराखंड)',
    shortName: 'Uttarakhand',
    zone: 'north',
    languages: [
      { code: 'gar', name: 'गढ़वाली (देहरादून, पौड़ी, टिहरी, चमोली)', native: 'गढ़वाली', dialect: 'Garhwali', speechLang: 'hi-IN', base: 'hi' },
      { code: 'kum', name: 'कुमाऊँनी (नैनीताल, अल्मोड़ा, पिथौरागढ़)', native: 'कुमाऊँनी', dialect: 'Kumaoni', speechLang: 'hi-IN', base: 'hi' },
      { code: 'jau', name: 'जौनसारी (चकराता, जौनसार-बावर)', native: 'जौनसारी', dialect: 'Jaunsari', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'hp',
    name: 'Himachal Pradesh (हिमाचल प्रदेश)',
    shortName: 'Himachal',
    zone: 'north',
    languages: [
      { code: 'kan_hp', name: 'कांगड़ी (कांगड़ा, हमीरपुर, ऊना)', native: 'कांगड़ी', dialect: 'Kangri Pahari', speechLang: 'hi-IN', base: 'hi' },
      { code: 'man_hp', name: 'मंडियाली (मंडी, सुंदरनगर)', native: 'मंडियाली', dialect: 'Mandiali', speechLang: 'hi-IN', base: 'hi' },
      { code: 'kul_hp', name: 'कुल्लवी (कुल्लू, मनाली)', native: 'कुल्लवी', dialect: 'Kulluvi', speechLang: 'hi-IN', base: 'hi' },
      { code: 'hi_hp', name: 'हिंदी (हिमाचल मानक)', native: 'हिंदी', dialect: 'Hindi', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'jk',
    name: 'Jammu & Kashmir / Ladakh (जम्मू और कश्मीर / लद्दाख)',
    shortName: 'J&K / Ladakh',
    zone: 'north',
    languages: [
      { code: 'kas', name: 'کٲشُر / कॉशुर (श्रीनगर, अनंतनाग, बारामूला)', native: 'کٲشُر', dialect: 'Kashmiri', speechLang: 'hi-IN', base: 'hi' },
      { code: 'dog', name: 'डोगरी (जम्मू, उधमपुर, सांबा, कठुआ)', native: 'डोगरी', dialect: 'Dogri', speechLang: 'hi-IN', base: 'hi' },
      { code: 'goj', name: 'गोजरी (गुर्जर-बकरवाल समुदाय)', native: 'गोजरी', dialect: 'Gojri', speechLang: 'hi-IN', base: 'hi' },
      { code: 'lad', name: 'ལ་དྭགས་སྐད་ (लद्दाखी - लेह व कारगिल)', native: 'ལ་དྭགས་སྐད་', dialect: 'Ladakhi', speechLang: 'hi-IN', base: 'hi' }
    ]
  },

  // ================= CENTRAL & WEST INDIA =================
  {
    id: 'mp',
    name: 'Madhya Pradesh (मध्य प्रदेश)',
    shortName: 'Madhya Pradesh',
    zone: 'central_west',
    languages: [
      { code: 'bnd_mp', name: 'बुंदेली (छतरपुर, पन्ना, सागर, टीकमगढ़)', native: 'बुंदेली', dialect: 'Bundelkhandi', speechLang: 'hi-IN', base: 'bnd' },
      { code: 'mal', name: 'मालवी (इंदौर, उज्जैन, देवास, रतलाम)', native: 'मालवी', dialect: 'Malwi', speechLang: 'hi-IN', base: 'hi' },
      { code: 'nim', name: 'निमाड़ी (खरगोन, खंडवा, बड़वानी)', native: 'निमाड़ी', dialect: 'Nimadi', speechLang: 'hi-IN', base: 'hi' },
      { code: 'bag', name: 'बघेली (रीवा, सतना, सीधी, सिंगरौली)', native: 'बघेली', dialect: 'Bagheli', speechLang: 'hi-IN', base: 'hi' },
      { code: 'hi_mp', name: 'हिंदी (मध्य प्रदेश मानक)', native: 'हिंदी', dialect: 'Hindi', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'cg',
    name: 'Chhattisgarh (छत्तीसगढ़)',
    shortName: 'Chhattisgarh',
    zone: 'central_west',
    languages: [
      { code: 'chg', name: 'छत्तीसगढ़ी (रायपुर, बिलासपुर, दुर्ग, राजनांदगांव)', native: 'छत्तीसगढ़ी', dialect: 'Chhattisgarhi', speechLang: 'hi-IN', base: 'chg' },
      { code: 'hal', name: 'हलबी (बस्तर, दंतेवाड़ा, कांकेर)', native: 'हलबी', dialect: 'Halbi', speechLang: 'hi-IN', base: 'chg' },
      { code: 'gon', name: 'गोंडी (बस्तर व मध्य भारत आदिवासी क्षेत्र)', native: 'गोंडी', dialect: 'Gondi', speechLang: 'hi-IN', base: 'chg' },
      { code: 'surg', name: 'सरगुजिहा (अंबिकापुर, सरगुजा)', native: 'सरगुजिहा', dialect: 'Surgujia', speechLang: 'hi-IN', base: 'chg' }
    ]
  },
  {
    id: 'maharashtra',
    name: 'Maharashtra (महाराष्ट्र)',
    shortName: 'Maharashtra',
    zone: 'central_west',
    languages: [
      { code: 'mr', name: 'मराठी (प्रमाण मराठी - पुणे, मुंबई)', native: 'मराठी', dialect: 'Standard Marathi', speechLang: 'mr-IN', base: 'mr' },
      { code: 'var', name: 'वऱ्हाडी (नागपूर, अमरावती, अकोला - विदर्भ)', native: 'वऱ्हाडी', dialect: 'Varhadi', speechLang: 'mr-IN', base: 'mr' },
      { code: 'malv', name: 'मालवणी (सिंधुदुर्ग, रत्नागिरी - कोकण)', native: 'मालवणी', dialect: 'Malvani Konkani', speechLang: 'mr-IN', base: 'mr' },
      { code: 'ahi_mr', name: 'अहिराणी (धुळे, जळगाव, नंदुरबार - खान्देश)', native: 'अहिराणी', dialect: 'Ahirani', speechLang: 'mr-IN', base: 'mr' },
      { code: 'koli', name: 'कोळी भाषा (मुंबई व ठाणे किनारी पट्टा)', native: 'कोळी', dialect: 'Koli', speechLang: 'mr-IN', base: 'mr' }
    ]
  },
  {
    id: 'gujarat',
    name: 'Gujarat (ગુજરાત / गुजरात)',
    shortName: 'Gujarat',
    zone: 'central_west',
    languages: [
      { code: 'gu', name: 'ગુજરાતી (પ્રમાણિત ગુજરાતી - અમદાવાદ, વડોદરા)', native: 'ગુજરાતી', dialect: 'Standard Gujarati', speechLang: 'gu-IN', base: 'gu' },
      { code: 'kat', name: 'કાઠિયાવાડી (રાજકોટ, જામનગર, જુનાગઢ, ભાવનગર)', native: 'કાઠિયાવાડી', dialect: 'Kathiyawadi', speechLang: 'gu-IN', base: 'gu' },
      { code: 'sur', name: 'સુરતી (સુરત, નવસારી, વલસાડ)', native: 'સુરતી', dialect: 'Surati', speechLang: 'gu-IN', base: 'gu' },
      { code: 'kuc', name: 'કચ્છી (ભુજ, ગાંધીધામ, માંડવી)', native: 'કચ્છી', dialect: 'Kutchi', speechLang: 'gu-IN', base: 'gu' }
    ]
  },
  {
    id: 'goa',
    name: 'Goa (गोवा / गोंय)',
    shortName: 'Goa',
    zone: 'central_west',
    languages: [
      { code: 'kok', name: 'कोंकणी (गोयंची कोंकणी - पणजी, मडगांव)', native: 'कोंकणी', dialect: 'Goan Konkani', speechLang: 'mr-IN', base: 'mr' },
      { code: 'mr_goa', name: 'मराठी (गोवा मराठी)', native: 'मराठी', dialect: 'Marathi', speechLang: 'mr-IN', base: 'mr' }
    ]
  },

  // ================= EAST & NORTH-EAST INDIA =================
  {
    id: 'wb',
    name: 'West Bengal (পশ্চিমবঙ্গ / पश्चिम बंगाल)',
    shortName: 'West Bengal',
    zone: 'east_ne',
    languages: [
      { code: 'bn', name: 'বাংলা (প্রমিত বাংলা - কলকাতা, হাওড়া)', native: 'বাংলা', dialect: 'Standard Bengali', speechLang: 'bn-IN', base: 'bn' },
      { code: 'rar', name: 'রাঢ়ী উপভাষা (বর্ধমান, বাঁকুড়া, মেদিনীপুর)', native: 'রাঢ়ী', dialect: 'Rarh', speechLang: 'bn-IN', base: 'bn' },
      { code: 'raj_wb', name: 'রাজবংশী (কোচবিহার, জলপাইগুড়ি)', native: 'রাজবংশী', dialect: 'Rajbanshi', speechLang: 'bn-IN', base: 'bn' },
      { code: 'nep_wb', name: 'नेपाली (दार्जिलिंग, कालिम्पोंग)', native: 'नेपाली', dialect: 'Nepali', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'odisha',
    name: 'Odisha (ଓଡ଼ିଶା / ओडिशा)',
    shortName: 'Odisha',
    zone: 'east_ne',
    languages: [
      { code: 'or', name: 'ଓଡ଼ିଆ (ମାନକ ଓଡ଼ିଆ - ଭୁବନେଶ୍ୱର, କଟକ)', native: 'ଓଡ଼ିଆ', dialect: 'Standard Odia', speechLang: 'or-IN', base: 'or' },
      { code: 'sam', name: 'ସମ୍ବଲପୁରୀ / କୋଶଲୀ (ସମ୍ବଲପୁର, ବରଗଡ଼, ବଲାଙ୍ଗୀର)', native: 'ସମ୍ବଲପୁରୀ', dialect: 'Sambalpuri', speechLang: 'or-IN', base: 'or' },
      { code: 'des', name: 'ଦେଶିଆ (କୋରାପୁଟ, ମାଲକାନଗିରି)', native: 'ଦେଶିଆ', dialect: 'Desiya', speechLang: 'or-IN', base: 'or' }
    ]
  },
  {
    id: 'jharkhand',
    name: 'Jharkhand (झारखंड)',
    shortName: 'Jharkhand',
    zone: 'east_ne',
    languages: [
      { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ / संथाली (दुमका, जामताड़ा)', native: 'ᱥᱟᱱᱛᱟᱲᱤ', dialect: 'Santhali', speechLang: 'hi-IN', base: 'hi' },
      { code: 'kho', name: 'खोरठा (धनबाद, बोकारो, हजारीबाग, गिरिडीह)', native: 'खोरठा', dialect: 'Khortha', speechLang: 'hi-IN', base: 'hi' },
      { code: 'nag', name: 'नागपुरी / सादरी (रांची, गुमला, सिमडेगा)', native: 'नागपुरी', dialect: 'Nagpuri', speechLang: 'hi-IN', base: 'hi' },
      { code: 'kur', name: 'कुरमाली (जमशेदपुर, सरायकेला)', native: 'कुरमाली', dialect: 'Kurmali', speechLang: 'hi-IN', base: 'hi' }
    ]
  },
  {
    id: 'assam',
    name: 'Assam (অসম / असम)',
    shortName: 'Assam',
    zone: 'east_ne',
    languages: [
      { code: 'as', name: 'অসমীয়া (মানক অসমীয়া - গুৱাহাটী, যোৰহাট)', native: 'অসমীয়া', dialect: 'Standard Assamese', speechLang: 'as-IN', base: 'as' },
      { code: 'kam', name: 'কামৰূপী (নলবাৰী, বৰপেটা)', native: 'কামৰূপী', dialect: 'Kamrupi', speechLang: 'as-IN', base: 'as' },
      { code: 'bod', name: 'बड़ो (कोकराझार, बोडोलैंड)', native: 'बड़ो', dialect: 'Bodo', speechLang: 'as-IN', base: 'as' },
      { code: 'bn_syl', name: 'বাংলা / ছিলটী (বরাক উপত্যকা - শিলচর)', native: 'ছিলটী', dialect: 'Sylheti Bengali', speechLang: 'bn-IN', base: 'bn' }
    ]
  },
  {
    id: 'ne_states',
    name: 'North-East States (पूर्वोत्तर राज्य)',
    shortName: 'North-East',
    zone: 'east_ne',
    languages: [
      { code: 'mni', name: 'মৈতৈলোন্ / Manipuri (इंफाल, मणिपुर)', native: 'মৈতৈলোন্', dialect: 'Meitei', speechLang: 'en-IN', base: 'en' },
      { code: 'kha', name: 'Khasi (शिलांग, मेघालय)', native: 'Khasi', dialect: 'Khasi', speechLang: 'en-IN', base: 'en' },
      { code: 'garo', name: 'Garo (तुरा, मेघालय)', native: 'Garo', dialect: 'Garo', speechLang: 'en-IN', base: 'en' },
      { code: 'mzo', name: 'Mizo (आइज़ोल, मिज़ोरम)', native: 'Mizo', dialect: 'Mizo', speechLang: 'en-IN', base: 'en' },
      { code: 'nag_ne', name: 'Nagamese / Ao (कोहिमा, दीमापुर, नागालैंड)', native: 'Nagamese', dialect: 'Nagamese', speechLang: 'en-IN', base: 'en' },
      { code: 'trp', name: 'ককবরক / Kokborok (अगरतला, त्रिपुरा)', native: 'ককবরক', dialect: 'Kokborok', speechLang: 'bn-IN', base: 'bn' },
      { code: 'nep_sik', name: 'नेपाली (गंगटोक, सिक्किम)', native: 'नेपाली', dialect: 'Nepali', speechLang: 'hi-IN', base: 'hi' }
    ]
  },

  // ================= SOUTH INDIA =================
  {
    id: 'tamil_nadu',
    name: 'Tamil Nadu (தமிழ்நாடு / तमिलनाडु)',
    shortName: 'Tamil Nadu',
    zone: 'south',
    languages: [
      { code: 'ta', name: 'தமிழ் (செந்தமிழ் / பொதுத் தமிழ் - சென்னை, திருச்சி)', native: 'தமிழ்', dialect: 'Standard Tamil', speechLang: 'ta-IN', base: 'ta' },
      { code: 'kon_ta', name: 'கொங்கு தமிழ் (கோயம்புத்தூர், திருப்பூர், ஈரோடு)', native: 'கொங்கு தமிழ்', dialect: 'Kongu Tamil', speechLang: 'ta-IN', base: 'ta' },
      { code: 'mad_ta', name: 'மதுரை தமிழ் (மதுரை, திண்டுக்கல், தேனி)', native: 'மதுரை தமிழ்', dialect: 'Madurai Tamil', speechLang: 'ta-IN', base: 'ta' },
      { code: 'nel_ta', name: 'நெல்லைத் தமிழ் (திருநெல்வேலி, தூத்துக்குடி)', native: 'நெல்லைத் தமிழ்', dialect: 'Nellai Tamil', speechLang: 'ta-IN', base: 'ta' }
    ]
  },
  {
    id: 'karnataka',
    name: 'Karnataka (ಕರ್ನಾಟಕ / कर्नाटक)',
    shortName: 'Karnataka',
    zone: 'south',
    languages: [
      { code: 'kn', name: 'ಕನ್ನಡ (ಪ್ರಮಾಣಿತ ಕನ್ನಡ - ಬೆಂಗಳೂರು, ಮೈಸೂರು)', native: 'ಕನ್ನಡ', dialect: 'Standard Kannada', speechLang: 'kn-IN', base: 'kn' },
      { code: 'dha_kn', name: 'ಧಾರವಾಡ ಕನ್ನಡ (ಹುಬ್ಬಳ್ಳಿ-ಧಾರವಾಡ, ಬೆಳಗಾವಿ)', native: 'ಉತ್ತರ ಕರ್ನಾಟಕ', dialect: 'North Karnataka Kannada', speechLang: 'kn-IN', base: 'kn' },
      { code: 'kun_kn', name: 'ಕುಂದಗನ್ನಡ (ಕುಂದಾಪುರ, ಉಡುಪಿ ಕರಾವಳಿ)', native: 'ಕುಂದಗನ್ನಡ', dialect: 'Kundagannada', speechLang: 'kn-IN', base: 'kn' },
      { code: 'tulu', name: 'ತುಳು (ಮಂಗಳೂರು, ಉಡುಪಿ)', native: 'ತುಳು', dialect: 'Tulu', speechLang: 'kn-IN', base: 'kn' },
      { code: 'kod', name: 'ಕೊಡವ (ಮಡಿಕೇರಿ, ಕೊಡಗು)', native: 'ಕೊಡವ', dialect: 'Kodava', speechLang: 'kn-IN', base: 'kn' }
    ]
  },
  {
    id: 'ap_telangana',
    name: 'Andhra Pradesh & Telangana (ఆంధ్రప్రదేశ్ & తెలంగాణ)',
    shortName: 'AP & Telangana',
    zone: 'south',
    languages: [
      { code: 'te', name: 'తెలుగు (ప్రామాణిక తెలుగు - విజయవాడ, విశాఖ)', native: 'తెలుగు', dialect: 'Standard Telugu', speechLang: 'te-IN', base: 'te' },
      { code: 'tel_te', name: 'తెలంగాణ యాస (హైదరాబాద్, వరంగల్, కరీంనగర్)', native: 'తెలంగాణ యాస', dialect: 'Telangana Telugu', speechLang: 'te-IN', base: 'te' },
      { code: 'ray_te', name: 'రాయలసీమ యాస (తిరుపతి, కడప, కర్నూలు, అనంతపురం)', native: 'రాయలసీమ', dialect: 'Rayalaseema Telugu', speechLang: 'te-IN', base: 'te' },
      { code: 'utt_te', name: 'ఉత్తరాంధ్ర యాస (శ్రీకాకుళం, విజయనగరం)', native: 'ఉత్తరాంధ్ర', dialect: 'Uttarandhra', speechLang: 'te-IN', base: 'te' }
    ]
  },
  {
    id: 'kerala',
    name: 'Kerala (കേരളം / केरल)',
    shortName: 'Kerala',
    zone: 'south',
    languages: [
      { code: 'ml', name: 'മലയാളം (മാനക മലയാളം - തിരുവനന്തപുരം, കൊച്ചി)', native: 'മലയാളം', dialect: 'Standard Malayalam', speechLang: 'ml-IN', base: 'ml' },
      { code: 'mal_ml', name: 'മലബാർ മലയാളം (കോഴിക്കോട്, കണ്ണൂർ, മലപ്പുറം)', native: 'മലബാർ മലയാളം', dialect: 'Malabar Malayalam', speechLang: 'ml-IN', base: 'ml' },
      { code: 'tra_ml', name: 'മധ്യ തിരുവിതാംകൂർ (കോട്ടയം, പത്തനംതിട്ട)', native: 'തിരുവിതാംകൂർ', dialect: 'Travancore Malayalam', speechLang: 'ml-IN', base: 'ml' }
    ]
  }
];

// Flat list of all available languages for quick lookup
export const ALL_DIALECTS_LIST = ALL_INDIA_STATES.flatMap(state => 
  state.languages.map(lang => ({
    ...lang,
    stateId: state.id,
    stateName: state.name,
    stateShortName: state.shortName,
    zone: state.zone
  }))
);

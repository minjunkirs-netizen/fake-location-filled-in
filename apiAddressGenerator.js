// API地址生成器 - 使用真实API获取地址

// OpenStreetMap Nominatim API配置
const NOMINATIM_API = 'https://nominatim.openstreetmap.org/reverse';
const RANDOMUSER_API = 'https://randomuser.me/api/';

// 国家信息配置
const countryInfo = {
  "CN": { name: "中国", code: "+86", callingCode: "86" },
  "US": { name: "United States", code: "+1", callingCode: "1" },
  "GB": { name: "United Kingdom", code: "+44", callingCode: "44" },
  "JP": { name: "日本", code: "+81", callingCode: "81" },
  "DE": { name: "Germany", code: "+49", callingCode: "49" },
  "FR": { name: "France", code: "+33", callingCode: "33" },
  "CA": { name: "Canada", code: "+1", callingCode: "1" },
  "AU": { name: "Australia", code: "+61", callingCode: "61" },
  "IT": { name: "Italy", code: "+39", callingCode: "39" },
  "ES": { name: "Spain", code: "+34", callingCode: "34" },
  "KR": { name: "South Korea", code: "+82", callingCode: "82" },
  "BR": { name: "Brazil", code: "+55", callingCode: "55" },
  "MX": { name: "Mexico", code: "+52", callingCode: "52" },
  "IN": { name: "India", code: "+91", callingCode: "91" },
  "RU": { name: "Russia", code: "+7", callingCode: "7" },
  "NL": { name: "Netherlands", code: "+31", callingCode: "31" },
  "SE": { name: "Sweden", code: "+46", callingCode: "46" },
  "CH": { name: "Switzerland", code: "+41", callingCode: "41" },
  "SG": { name: "Singapore", code: "+65", callingCode: "65" },
  "TH": { name: "Thailand", code: "+66", callingCode: "66" }
};

// 各国主要城市坐标（扩展到20个国家）
const countryCoordinates = {
  "CN": [
    { lat: 39.9042, lng: 116.4074, name: "北京" },
    { lat: 31.2304, lng: 121.4737, name: "上海" },
    { lat: 23.1291, lng: 113.2644, name: "广州" },
    { lat: 22.5431, lng: 114.0579, name: "深圳" },
    { lat: 30.5728, lng: 104.0668, name: "成都" },
    { lat: 22.3193, lng: 114.1694, name: "香港" }
  ],
  "US": [
    { lat: 37.7749, lng: -122.4194, name: "San Francisco" },
    { lat: 34.0522, lng: -118.2437, name: "Los Angeles" },
    { lat: 40.7128, lng: -74.0060, name: "New York" },
    { lat: 41.8781, lng: -87.6298, name: "Chicago" },
    { lat: 29.7604, lng: -95.3698, name: "Houston" },
    { lat: 33.4484, lng: -112.0740, name: "Phoenix" }
  ],
  "GB": [
    { lat: 51.5074, lng: -0.1278, name: "London" },
    { lat: 53.4808, lng: -2.2426, name: "Manchester" },
    { lat: 53.8008, lng: -1.5491, name: "Leeds" },
    { lat: 52.4862, lng: -1.8904, name: "Birmingham" }
  ],
  "JP": [
    { lat: 35.6895, lng: 139.6917, name: "Tokyo" },
    { lat: 34.6937, lng: 135.5023, name: "Osaka" },
    { lat: 35.0116, lng: 135.7681, name: "Kyoto" },
    { lat: 35.1815, lng: 136.9066, name: "Nagoya" }
  ],
  "DE": [
    { lat: 52.5200, lng: 13.4050, name: "Berlin" },
    { lat: 48.1351, lng: 11.5820, name: "Munich" },
    { lat: 50.1109, lng: 8.6821, name: "Frankfurt" },
    { lat: 53.5511, lng: 9.9937, name: "Hamburg" }
  ],
  "FR": [
    { lat: 48.8566, lng: 2.3522, name: "Paris" },
    { lat: 45.7640, lng: 4.8357, name: "Lyon" },
    { lat: 43.2965, lng: 5.3698, name: "Marseille" },
    { lat: 43.6047, lng: 1.4442, name: "Toulouse" }
  ],
  "CA": [
    { lat: 43.6510, lng: -79.3470, name: "Toronto" },
    { lat: 45.5017, lng: -73.5673, name: "Montreal" },
    { lat: 49.2827, lng: -123.1207, name: "Vancouver" },
    { lat: 51.0447, lng: -114.0719, name: "Calgary" }
  ],
  "AU": [
    { lat: -33.8688, lng: 151.2093, name: "Sydney" },
    { lat: -37.8136, lng: 144.9631, name: "Melbourne" },
    { lat: -27.4698, lng: 153.0251, name: "Brisbane" },
    { lat: -31.9505, lng: 115.8605, name: "Perth" }
  ],
  "IT": [
    { lat: 41.9028, lng: 12.4964, name: "Rome" },
    { lat: 45.4642, lng: 9.1900, name: "Milan" },
    { lat: 40.8518, lng: 14.2681, name: "Naples" },
    { lat: 43.7696, lng: 11.2558, name: "Florence" }
  ],
  "ES": [
    { lat: 40.4168, lng: -3.7038, name: "Madrid" },
    { lat: 41.3851, lng: 2.1734, name: "Barcelona" },
    { lat: 37.3891, lng: -5.9845, name: "Seville" },
    { lat: 39.4699, lng: -0.3763, name: "Valencia" }
  ],
  "KR": [
    { lat: 37.5665, lng: 126.9780, name: "Seoul" },
    { lat: 35.1796, lng: 129.0756, name: "Busan" },
    { lat: 35.1595, lng: 126.8526, name: "Gwangju" },
    { lat: 37.4563, lng: 126.7052, name: "Incheon" }
  ],
  "BR": [
    { lat: -23.5505, lng: -46.6333, name: "São Paulo" },
    { lat: -22.9068, lng: -43.1729, name: "Rio de Janeiro" },
    { lat: -15.7939, lng: -47.8828, name: "Brasília" },
    { lat: -30.0346, lng: -51.2177, name: "Porto Alegre" }
  ],
  "MX": [
    { lat: 19.4326, lng: -99.1332, name: "Mexico City" },
    { lat: 20.6597, lng: -103.3496, name: "Guadalajara" },
    { lat: 25.6866, lng: -100.3161, name: "Monterrey" },
    { lat: 21.1619, lng: -86.8515, name: "Cancún" }
  ],
  "IN": [
    { lat: 28.6139, lng: 77.2090, name: "New Delhi" },
    { lat: 19.0760, lng: 72.8777, name: "Mumbai" },
    { lat: 12.9716, lng: 77.5946, name: "Bangalore" },
    { lat: 22.5726, lng: 88.3639, name: "Kolkata" }
  ],
  "RU": [
    { lat: 55.7558, lng: 37.6173, name: "Moscow" },
    { lat: 59.9343, lng: 30.3351, name: "Saint Petersburg" },
    { lat: 56.8389, lng: 60.6057, name: "Yekaterinburg" },
    { lat: 55.0084, lng: 82.9357, name: "Novosibirsk" }
  ],
  "NL": [
    { lat: 52.3676, lng: 4.9041, name: "Amsterdam" },
    { lat: 51.9244, lng: 4.4777, name: "Rotterdam" },
    { lat: 52.0907, lng: 5.1214, name: "Utrecht" },
    { lat: 52.0116, lng: 4.3571, name: "The Hague" }
  ],
  "SE": [
    { lat: 59.3293, lng: 18.0686, name: "Stockholm" },
    { lat: 57.7089, lng: 11.9746, name: "Gothenburg" },
    { lat: 55.6050, lng: 13.0038, name: "Malmö" },
    { lat: 59.8586, lng: 17.6389, name: "Uppsala" }
  ],
  "CH": [
    { lat: 47.3769, lng: 8.5417, name: "Zurich" },
    { lat: 46.2044, lng: 6.1432, name: "Geneva" },
    { lat: 46.9480, lng: 7.4474, name: "Bern" },
    { lat: 47.5596, lng: 7.5886, name: "Basel" }
  ],
  "SG": [
    { lat: 1.3521, lng: 103.8198, name: "Singapore" },
    { lat: 1.2897, lng: 103.8501, name: "Marina Bay" },
    { lat: 1.4382, lng: 103.7891, name: "Woodlands" }
  ],
  "TH": [
    { lat: 13.7563, lng: 100.5018, name: "Bangkok" },
    { lat: 18.7883, lng: 98.9853, name: "Chiang Mai" },
    { lat: 7.8804, lng: 98.3923, name: "Phuket" },
    { lat: 12.9236, lng: 100.8825, name: "Pattaya" }
  ]
};

const countryLanguages = {
  "CN": "zh-CN",
  "US": "en-US",
  "GB": "en-GB",
  "JP": "ja",
  "DE": "de",
  "FR": "fr",
  "CA": "en-CA",
  "AU": "en-AU",
  "IT": "it",
  "ES": "es",
  "KR": "ko",
  "BR": "pt-BR",
  "MX": "es-MX",
  "IN": "en-IN",
  "RU": "ru",
  "NL": "nl",
  "SE": "sv",
  "CH": "de-CH",
  "SG": "en-SG",
  "TH": "th"
};

// 获取随机位置
function getRandomLocationInCountry(country) {
  const coords = countryCoordinates[country] || countryCoordinates["US"];
  const randomCity = coords[Math.floor(Math.random() * coords.length)];

  // 在选定城市附近生成随机偏移（约10km范围内）
  const lat = randomCity.lat + (Math.random() - 0.5) * 0.1;
  const lng = randomCity.lng + (Math.random() - 0.5) * 0.1;

  // 返回lon和lng，兼容后续使用
  return { lat, lon: lng, lng };
}

// 从OpenStreetMap获取地址
function extractHouseIdentifier(addr = {}) {
  return addr.house_number ||
    addr.housenumber ||
    addr.house_name ||
    addr.building_number ||
    addr.building ||
    null;
}

function isDetailedAddress(data) {
  if (!data || !data.address) return false;
  const addr = data.address;
  const hasStreet = addr.road || addr.street || addr.suburb || addr.neighbourhood;
  const hasCity = addr.city || addr.town || addr.village || addr.county;
  const hasHouseNumber = Boolean(extractHouseIdentifier(addr));
  return Boolean(hasStreet && hasCity && hasHouseNumber);
}

async function fetchAddressFromOSM(lat, lon, language, maxAttempts = 6) {
  let lastResult = null;
  let bestResultWithNumber = null;

  for (let i = 0; i < maxAttempts; i++) {
    try {
      // 注意：Nominatim API使用lon而非lng
      const params = new URLSearchParams({
        format: 'json',
        lat: String(lat),
        lon: String(lon),
        zoom: '18',
        addressdetails: '1'
      });
      if (language) {
        params.set('accept-language', language);
      }
      const url = `${NOMINATIM_API}?${params.toString()}`;

      const headers = {
        'User-Agent': 'AddressAutofillExtension/3.0 (Browser Extension)'
      };
      if (language) {
        headers['Accept-Language'] = language;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OSM API响应错误 ${response.status}:`, errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (isDetailedAddress(data)) {
        return data;
      }

      if (data && data.address) {
        const hasNumber = Boolean(extractHouseIdentifier(data.address));
        if (hasNumber && !bestResultWithNumber) {
          bestResultWithNumber = data;
        }
        lastResult = data;
      }

      // 如果地址不够详细，稍微调整坐标重试
      lat += (Math.random() - 0.5) * 0.006;
      lon += (Math.random() - 0.5) * 0.006;

      if (bestResultWithNumber && i >= 2) {
        break;
      }

      if (i < maxAttempts - 1) {
        const delay = 400 + i * 200;
        await sleep(delay);
      }

    } catch (error) {
      console.error(`OSM API尝试 ${i + 1} 失败:`, error);
      if (i < maxAttempts - 1) {
        await sleep(500 + i * 250);
      }
    }
  }

  return bestResultWithNumber || lastResult;
}

// 从randomuser.me获取用户信息
async function fetchUserInfo() {
  try {
    const response = await fetch(RANDOMUSER_API);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    if (data && data.results && data.results.length > 0) {
      const user = data.results[0];
      return {
        firstName: user.name.first,
        lastName: user.name.last,
        gender: user.gender,
        email: user.email // 获取真实email
      };
    }
  } catch (error) {
    console.error('RandomUser API失败:', error);
  }

  return null;
}

function sanitizeName(value, language) {
  if (!value) return '';
  const parts = value
    .split(/[;/]/)
    .map(part => part.trim())
    .filter(Boolean);

  if (!parts.length) {
    return '';
  }

  const normalizedLang = (language || '').toLowerCase();
  const primaryLang = normalizedLang.split('-')[0];

  const scriptMatchers = [
    { langs: ['zh', 'ja'], regex: /[\u4E00-\u9FFF]/ }, // CJK characters
    { langs: ['ko'], regex: /[\uAC00-\uD7AF]/ },       // Hangul
    { langs: ['ru'], regex: /[\u0400-\u04FF]/ },       // Cyrillic
    { langs: ['th'], regex: /[\u0E00-\u0E7F]/ },       // Thai
    { langs: ['hi'], regex: /[\u0900-\u097F]/ },       // Devanagari
    { langs: ['ar'], regex: /[\u0600-\u06FF]/ }        // Arabic
  ];

  const matcher = scriptMatchers.find(({ langs }) => langs.includes(primaryLang));
  if (matcher) {
    const match = parts.find(part => matcher.regex.test(part));
    if (match) return match;
  }

  const latinMatch = parts.find(part => /[A-Za-z]/.test(part));
  if (latinMatch) {
    return latinMatch;
  }

  return parts[0];
}

function pickLocalizedName(addr, keys, language) {
  if (!addr) return '';

  const normalizedLang = (language || '').toLowerCase();
  const languageCandidates = [];

  if (normalizedLang) {
    languageCandidates.push(normalizedLang);
    const primary = normalizedLang.split('-')[0];
    if (primary && primary !== normalizedLang) {
      languageCandidates.push(primary);
    }
  }

  for (const key of keys) {
    for (const lang of languageCandidates) {
      const localizedKey = `${key}:${lang}`;
      if (addr[localizedKey]) {
        return sanitizeName(addr[localizedKey], language);
      }
    }
  }

  for (const key of keys) {
    if (addr[key]) {
      return sanitizeName(addr[key], language);
    }
  }

  return '';
}

// 格式化地址
function formatAddress(osmData, country, language) {
  const addr = osmData.address;

  const streetOrArea = pickLocalizedName(addr, ['road', 'street', 'neighbourhood', 'suburb'], language);
  const houseIdentifier = extractHouseIdentifier(addr);
  let streetAddress = streetOrArea;

  if (houseIdentifier) {
    streetAddress = `${houseIdentifier} ${streetOrArea}`.trim();
  }

  if (!streetAddress) {
    streetAddress = pickLocalizedName(addr, ['village', 'city', 'town'], language);
  }

  const city = pickLocalizedName(addr, ['city', 'town', 'village', 'municipality', 'county'], language);
  const state = pickLocalizedName(addr, ['state', 'province', 'region', 'state_district', 'county'], language);

  const postal = addr.postcode || '';

  return {
    address: streetAddress.trim(),
    address1: streetAddress.trim(), // 地址行1
    address2: '', // 地址行2（公寓号等）
    city: city,
    state: state,
    postal: postal,
    country: country,
    countryName: countryInfo[country]?.name || country,
    fullAddress: osmData.display_name
  };
}

// 生成电话号码（不含国家代码前缀）
function generatePhoneNumber(country) {
  const phoneFormats = {
    "CN": () => {
      const prefixes = ['130', '131', '132', '133', '135', '136', '137', '138', '139', '150', '151', '152', '158', '159', '186', '187', '188', '189'];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `${prefix}${number}`;
    },
    "US": () => {
      const areaCode = Math.floor(200 + Math.random() * 800).toString().padStart(3, '0');
      const exchangeCode = Math.floor(200 + Math.random() * 800).toString().padStart(3, '0');
      const lineNumber = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
      return `(${areaCode}) ${exchangeCode}-${lineNumber}`;
    },
    "GB": () => {
      const areaCode = Math.floor(1000 + Math.random() * 9000).toString();
      const lineNumber = Math.floor(100000 + Math.random() * 900000).toString();
      return `${areaCode} ${lineNumber}`;
    },
    "JP": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode}-${number.substring(0, 4)}-${number.substring(4)}`;
    },
    "DE": () => {
      const areaCode = Math.floor(100 + Math.random() * 900).toString();
      const number = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode} ${number}`;
    },
    "FR": () => {
      const digit = Math.floor(1 + Math.random() * 8);
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `0${digit} ${number.substring(0, 2)} ${number.substring(2, 4)} ${number.substring(4, 6)} ${number.substring(6)}`;
    },
    "CA": () => {
      const areaCode = Math.floor(200 + Math.random() * 800).toString().padStart(3, '0');
      const exchangeCode = Math.floor(200 + Math.random() * 800).toString().padStart(3, '0');
      const lineNumber = Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0');
      return `(${areaCode}) ${exchangeCode}-${lineNumber}`;
    },
    "AU": () => {
      const areaCode = Math.floor(2 + Math.random() * 8).toString();
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `0${areaCode} ${number.substring(0, 4)} ${number.substring(4)}`;
    },
    "IT": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode} ${number}`;
    },
    "ES": () => {
      const number = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
      return `${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
    },
    "KR": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode}-${number.substring(0, 4)}-${number.substring(4)}`;
    },
    "BR": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
      return `(${areaCode}) ${number.substring(0, 5)}-${number.substring(5)}`;
    },
    "MX": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode} ${number}`;
    },
    "IN": () => {
      const number = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
      return `${number.substring(0, 5)} ${number.substring(5)}`;
    },
    "RU": () => {
      const areaCode = Math.floor(100 + Math.random() * 900).toString();
      const number = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode} ${number}`;
    },
    "NL": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode} ${number}`;
    },
    "SE": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode}-${number}`;
    },
    "CH": () => {
      const areaCode = Math.floor(10 + Math.random() * 90).toString();
      const number = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
      return `${areaCode} ${number}`;
    },
    "SG": () => {
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `${number.substring(0, 4)} ${number.substring(4)}`;
    },
    "TH": () => {
      const areaCode = Math.floor(2 + Math.random() * 8).toString();
      const number = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
      return `0${areaCode} ${number}`;
    }
  };

  return (phoneFormats[country] || phoneFormats["US"])();
}

// 格式化姓名
function formatName(userInfo, country) {
  if (!userInfo) {
    return {
      fullName: "Unknown User",
      firstName: "Unknown",
      lastName: "User"
    };
  }

  const firstName = userInfo.firstName.charAt(0).toUpperCase() + userInfo.firstName.slice(1);
  const lastName = userInfo.lastName.charAt(0).toUpperCase() + userInfo.lastName.slice(1);

  // 中日韩姓在前
  let fullName;
  if (['CN', 'JP', 'KR'].includes(country)) {
    fullName = `${lastName}${firstName}`;
  } else {
    fullName = `${firstName} ${lastName}`;
  }

  return {
    fullName,
    firstName,
    lastName
  };
}

// 延迟函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 主函数：生成真实地址
async function generateAddressFromAPI(countryCode, onProgress) {
  try {
    // 更新进度
    if (onProgress) onProgress('正在查找真实地址...');

    // 获取随机位置
    const location = getRandomLocationInCountry(countryCode);
    const language = countryLanguages[countryCode] || 'en';

    const userInfoPromise = fetchUserInfo();

    // 从OSM获取地址
    const osmData = await fetchAddressFromOSM(location.lat, location.lon ?? location.lng, language);

    if (!osmData) {
      throw new Error('无法获取真实地址，请重试');
    }

    // 更新进度
    if (onProgress) onProgress('正在生成用户信息...');

    // 获取用户信息（姓名、email）
    const userInfo = await userInfoPromise;

    // 格式化地址
    const addressData = formatAddress(osmData, countryCode, language);

    // 格式化姓名
    const nameData = formatName(userInfo, countryCode);

    // 生成电话号码（不含国家代码）
    const phoneLocal = generatePhoneNumber(countryCode);

    // 获取国家信息
    const country = countryInfo[countryCode] || { name: countryCode, code: "+1", callingCode: "1" };

    // 生成完整地址对象
    return {
      // 姓名信息（分开）
      firstName: nameData.firstName,
      lastName: nameData.lastName,
      name: nameData.fullName, // 完整姓名（兼容）

      // 电话信息
      phone: phoneLocal, // 本地格式电话
      phoneWithCountryCode: `${country.code} ${phoneLocal}`, // 带国家代码
      countryCode: country.code, // +86格式
      callingCode: country.callingCode, // 86格式

      // Email
      email: userInfo?.email || `${nameData.firstName.toLowerCase()}.${nameData.lastName.toLowerCase()}@example.com`,

      // 地址信息
      address: addressData.address,
      address1: addressData.address1,
      address2: addressData.address2,
      city: addressData.city,
      state: addressData.state,
      postal: addressData.postal,
      zipCode: addressData.postal, // 别名

      // 国家信息
      country: countryCode,
      countryName: country.name,

      // 其他
      fullAddress: addressData.fullAddress,
      coordinates: {
        lat: location.lat,
        lon: location.lon ?? location.lng,
        lng: location.lng
      },
      source: 'api' // 标记数据来源
    };

  } catch (error) {
    console.error('API地址生成失败:', error);
    throw error;
  }
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { generateAddressFromAPI, countryInfo };
}

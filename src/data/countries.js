// Global countries data for H5 Bill Payments Application
// Contains country information with flags and carrier details
export const carriersData = {
  countries: [
    {
      countryCode: "ZW",
      countryName: "Zimbabwe",
      flag: "🇿🇼",
      callingCode: "+263",
      mobileNumberPortability: false,
      carriers: [
        {
          name: "Econet",
          logoText: "ECONET",
          logoColor: "#1E3A8A",
          prefixes: ["77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "NetOne",
          logoText: "NETONE",
          logoColor: "#FF6B35",
          prefixes: ["71", "72"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Telecel",
          logoText: "TELECEL",
          logoColor: "#059669",
          prefixes: ["73", "74"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "KE",
      countryName: "Kenya",
      flag: "🇰🇪",
      callingCode: "+254",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Safaricom",
          logoText: "SAFARICOM",
          logoColor: "#059669",
          prefixes: ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739", "740", "741", "742", "743", "744", "745", "746", "747", "748", "749", "750", "751", "752", "753", "754", "755", "756", "757", "758", "759", "760", "761", "762", "763", "764", "765", "766", "767", "768", "769", "770", "771", "772", "773", "774", "775", "776", "777", "778", "779", "780", "781", "782", "783", "784", "785", "786", "787", "788", "789", "790", "791", "792", "793", "794", "795", "796", "797", "798", "799"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Airtel",
          logoText: "AIRTEL",
          logoColor: "#DC2626",
          prefixes: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115", "116", "117", "118", "119", "120", "121", "122", "123", "124", "125", "126", "127", "128", "129", "130", "131", "132", "133", "134", "135", "136", "137", "138", "139", "140", "141", "142", "143", "144", "145", "146", "147", "148", "149", "150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Telkom Kenya",
          logoText: "TELKOM KE",
          logoColor: "#7C3AED",
          prefixes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "GB",
      countryName: "United Kingdom",
      flag: "🇬🇧",
      callingCode: "+44",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Vodafone",
          logoText: "VODAFONE",
          logoColor: "#E11D48",
          prefixes: ["7700", "7701", "7702", "7703", "7704", "7705", "7706", "7707", "7708", "7709", "7710", "7711", "7712", "7713", "7714", "7715", "7716", "7717", "7718", "7719", "7720", "7721", "7722", "7723", "7724", "7725", "7726", "7727", "7728", "7729", "7730", "7731", "7732", "7733", "7734", "7735", "7736", "7737", "7738", "7739", "7740", "7741", "7742", "7743", "7744", "7745", "7746", "7747", "7748", "7749", "7750", "7751", "7752", "7753", "7754", "7755", "7756", "7757", "7758", "7759", "7760", "7761", "7762", "7763", "7764", "7765", "7766", "7767", "7768", "7769", "7770", "7771", "7772", "7773", "7774", "7775", "7776", "7777", "7778", "7779", "7780", "7781", "7782", "7783", "7784", "7785", "7786", "7787", "7788", "7789", "7790", "7791", "7792", "7793", "7794", "7795", "7796", "7797", "7798", "7799"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "EE",
          logoText: "EE",
          logoColor: "#0EA5E9",
          prefixes: ["7400", "7401", "7402", "7403", "7404", "7405", "7406", "7407", "7408", "7409", "7410", "7411", "7412", "7413", "7414", "7415", "7416", "7417", "7418", "7419", "7420", "7421", "7422", "7423", "7424", "7425", "7426", "7427", "7428", "7429", "7430", "7431", "7432", "7433", "7434", "7435", "7436", "7437", "7438", "7439", "7440", "7441", "7442", "7443", "7444", "7445", "7446", "7447", "7448", "7449", "7450", "7451", "7452", "7453", "7454", "7455", "7456", "7457", "7458", "7459", "7460", "7461", "7462", "7463", "7464", "7465", "7466", "7467", "7468", "7469", "7470", "7471", "7472", "7473", "7474", "7475", "7476", "7477", "7478", "7479", "7480", "7481", "7482", "7483", "7484", "7485", "7486", "7487", "7488", "7489", "7490", "7491", "7492", "7493", "7494", "7495", "7496", "7497", "7498", "7499"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "O2",
          logoText: "O2",
          logoColor: "#1E40AF",
          prefixes: ["7800", "7801", "7802", "7803", "7804", "7805", "7806", "7807", "7808", "7809", "7810", "7811", "7812", "7813", "7814", "7815", "7816", "7817", "7818", "7819", "7820", "7821", "7822", "7823", "7824", "7825", "7826", "7827", "7828", "7829", "7830", "7831", "7832", "7833", "7834", "7835", "7836", "7837", "7838", "7839", "7840", "7841", "7842", "7843", "7844", "7845", "7846", "7847", "7848", "7849", "7850", "7851", "7852", "7853", "7854", "7855", "7856", "7857", "7858", "7859", "7860", "7861", "7862", "7863", "7864", "7865", "7866", "7867", "7868", "7869", "7870", "7871", "7872", "7873", "7874", "7875", "7876", "7877", "7878", "7879", "7880", "7881", "7882", "7883", "7884", "7885", "7886", "7887", "7888", "7889", "7890", "7891", "7892", "7893", "7894", "7895", "7896", "7897", "7898", "7899"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Three",
          logoText: "THREE",
          logoColor: "#7C3AED",
          prefixes: ["7900", "7901", "7902", "7903", "7904", "7905", "7906", "7907", "7908", "7909", "7910", "7911", "7912", "7913", "7914", "7915", "7916", "7917", "7918", "7919", "7920", "7921", "7922", "7923", "7924", "7925", "7926", "7927", "7928", "7929", "7930", "7931", "7932", "7933", "7934", "7935", "7936", "7937", "7938", "7939", "7940", "7941", "7942", "7943", "7944", "7945", "7946", "7947", "7948", "7949", "7950", "7951", "7952", "7953", "7954", "7955", "7956", "7957", "7958", "7959", "7960", "7961", "7962", "7963", "7964", "7965", "7966", "7967", "7968", "7969", "7970", "7971", "7972", "7973", "7974", "7975", "7976", "7977", "7978", "7979", "7980", "7981", "7982", "7983", "7984", "7985", "7986", "7987", "7988", "7989", "7990", "7991", "7992", "7993", "7994", "7995", "7996", "7997", "7998", "7999"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "DE",
      countryName: "Germany",
      flag: "🇩🇪",
      callingCode: "+49",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Deutsche Telekom",
          logoText: "T-MOBILE",
          logoColor: "#E11D48",
          prefixes: ["150", "151", "152", "153", "154", "155", "156", "157", "158", "159", "160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Vodafone",
          logoText: "VODAFONE",
          logoColor: "#E11D48",
          prefixes: ["170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189", "190", "191", "192", "193", "194", "195", "196", "197", "198", "199"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "O2",
          logoText: "O2",
          logoColor: "#1E40AF",
          prefixes: ["160", "161", "162", "163", "164", "165", "166", "167", "168", "169", "170", "171", "172", "173", "174", "175", "176", "177", "178", "179", "180", "181", "182", "183", "184", "185", "186", "187", "188", "189"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "FR",
      countryName: "France",
      flag: "🇫🇷",
      callingCode: "+33",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Orange",
          logoText: "ORANGE",
          logoColor: "#F59E0B",
          prefixes: ["600", "601", "602", "603", "604", "605", "606", "607", "608", "609", "610", "611", "612", "613", "614", "615", "616", "617", "618", "619", "620", "621", "622", "623", "624", "625", "626", "627", "628", "629", "630", "631", "632", "633", "634", "635", "636", "637", "638", "639", "640", "641", "642", "643", "644", "645", "646", "647", "648", "649", "650", "651", "652", "653", "654", "655", "656", "657", "658", "659", "660", "661", "662", "663", "664", "665", "666", "667", "668", "669", "670", "671", "672", "673", "674", "675", "676", "677", "678", "679", "680", "681", "682", "683", "684", "685", "686", "687", "688", "689", "690", "691", "692", "693", "694", "695", "696", "697", "698", "699"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "SFR",
          logoText: "SFR",
          logoColor: "#DC2626",
          prefixes: ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709", "710", "711", "712", "713", "714", "715", "716", "717", "718", "719", "720", "721", "722", "723", "724", "725", "726", "727", "728", "729", "730", "731", "732", "733", "734", "735", "736", "737", "738", "739", "740", "741", "742", "743", "744", "745", "746", "747", "748", "749", "750", "751", "752", "753", "754", "755", "756", "757", "758", "759", "760", "761", "762", "763", "764", "765", "766", "767", "768", "769", "770", "771", "772", "773", "774", "775", "776", "777", "778", "779", "780", "781", "782", "783", "784", "785", "786", "787", "788", "789", "790", "791", "792", "793", "794", "795", "796", "797", "798", "799"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Bouygues",
          logoText: "BOUYGUES",
          logoColor: "#059669",
          prefixes: ["800", "801", "802", "803", "804", "805", "806", "807", "808", "809", "810", "811", "812", "813", "814", "815", "816", "817", "818", "819", "820", "821", "822", "823", "824", "825", "826", "827", "828", "829", "830", "831", "832", "833", "834", "835", "836", "837", "838", "839", "840", "841", "842", "843", "844", "845", "846", "847", "848", "849", "850", "851", "852", "853", "854", "855", "856", "857", "858", "859", "860", "861", "862", "863", "864", "865", "866", "867", "868", "869", "870", "871", "872", "873", "874", "875", "876", "877", "878", "879", "880", "881", "882", "883", "884", "885", "886", "887", "888", "889", "890", "891", "892", "893", "894", "895", "896", "897", "898", "899"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "BW",
      countryName: "Botswana",
      flag: "🇧🇼",
      callingCode: "+267",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Mascom",
          logoText: "MASCOM",
          logoColor: "#059669",
          prefixes: ["71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Orange",
          logoText: "ORANGE",
          logoColor: "#F59E0B",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "BTC Mobile",
          logoText: "BTC",
          logoColor: "#DC2626",
          prefixes: ["70", "71", "72", "73", "74", "75", "76"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "MT",
      countryName: "Malta",
      flag: "🇲🇹",
      callingCode: "+356",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Vodafone",
          logoText: "VODAFONE",
          logoColor: "#E11D48",
          prefixes: ["77", "78", "79", "92", "93", "94"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "GO",
          logoText: "GO",
          logoColor: "#059669",
          prefixes: ["95", "96", "97", "98", "99"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Melita",
          logoText: "MELITA",
          logoColor: "#7C3AED",
          prefixes: ["70", "71", "72", "73", "74", "75", "76"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "ZM",
      countryName: "Zambia",
      flag: "🇿🇲",
      callingCode: "+260",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#F59E0B",
          prefixes: ["77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Airtel",
          logoText: "AIRTEL",
          logoColor: "#DC2626",
          prefixes: ["76", "96", "97", "98", "99"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Zamtel",
          logoText: "ZAMTEL",
          logoColor: "#059669",
          prefixes: ["95"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "RW",
      countryName: "Rwanda",
      flag: "🇷🇼",
      callingCode: "+250",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#F59E0B",
          prefixes: ["78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Airtel",
          logoText: "AIRTEL",
          logoColor: "#DC2626",
          prefixes: ["72", "73", "74", "75", "76", "77"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Tigo",
          logoText: "TIGO",
          logoColor: "#059669",
          prefixes: ["70", "71"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "CN",
      countryName: "China",
      flag: "🇨🇳",
      callingCode: "+86",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "China Mobile",
          logoText: "CHINA MOBILE",
          logoColor: "#059669",
          prefixes: ["134", "135", "136", "137", "138", "139", "150", "151", "152", "157", "158", "159", "182", "183", "184", "187", "188", "195"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "China Unicom",
          logoText: "CHINA UNICOM",
          logoColor: "#DC2626",
          prefixes: ["130", "131", "132", "155", "156", "185", "186", "176"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "China Telecom",
          logoText: "CHINA TELECOM",
          logoColor: "#7C3AED",
          prefixes: ["133", "153", "180", "181", "189", "177", "173"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "China Broadnet",
          logoText: "CHINA BROADNET",
          logoColor: "#F59E0B",
          prefixes: ["192", "196", "197", "198"],
          phoneNumberLength: 11,
          networkType: "5G",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "China Satcom",
          logoText: "CHINA SATCOM",
          logoColor: "#8B5CF6",
          prefixes: ["174"],
          phoneNumberLength: 11,
          networkType: "Satellite",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Alibaba Mobile",
          logoText: "ALIBABA",
          logoColor: "#FF6B35",
          prefixes: ["1700", "1701", "1702"],
          phoneNumberLength: 12,
          networkType: "MVNO",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Tencent Mobile",
          logoText: "TENCENT",
          logoColor: "#1E40AF",
          prefixes: ["1703", "1704", "1705"],
          phoneNumberLength: 12,
          networkType: "MVNO",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "JD Mobile",
          logoText: "JD MOBILE",
          logoColor: "#DC2626",
          prefixes: ["1706", "1707", "1708"],
          phoneNumberLength: 12,
          networkType: "MVNO",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Baidu Mobile",
          logoText: "BAIDU",
          logoColor: "#059669",
          prefixes: ["1709", "1710", "1711"],
          phoneNumberLength: 12,
          networkType: "MVNO",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Xiaomi Mobile",
          logoText: "XIAOMI",
          logoColor: "#FF6B35",
          prefixes: ["1712", "1713", "1714"],
          phoneNumberLength: 12,
          networkType: "MVNO",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "HK",
      countryName: "Hong Kong",
      flag: "🇭🇰",
      callingCode: "+852",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "CSL",
          logoText: "CSL",
          logoColor: "#059669",
          prefixes: ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "SmarTone",
          logoText: "SMARTONE",
          logoColor: "#DC2626",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "3 Hong Kong",
          logoText: "3HK",
          logoColor: "#7C3AED",
          prefixes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "China Mobile Hong Kong",
          logoText: "CMHK",
          logoColor: "#F59E0B",
          prefixes: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "US",
      countryName: "United States",
      flag: "🇺🇸",
      callingCode: "+1",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Verizon",
          logoText: "VERIZON",
          logoColor: "#DC2626",
          prefixes: ["200", "201", "202", "203", "204", "205", "206", "207", "208", "209"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "AT&T",
          logoText: "AT&T",
          logoColor: "#059669",
          prefixes: ["210", "211", "212", "213", "214", "215", "216", "217", "218", "219"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "T-Mobile",
          logoText: "T-MOBILE",
          logoColor: "#7C3AED",
          prefixes: ["220", "221", "222", "223", "224", "225", "226", "227", "228", "229"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Sprint",
          logoText: "SPRINT",
          logoColor: "#F59E0B",
          prefixes: ["230", "231", "232", "233", "234", "235", "236", "237", "238", "239"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "IN",
      countryName: "India",
      flag: "🇮🇳",
      callingCode: "+91",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Airtel",
          logoText: "AIRTEL",
          logoColor: "#DC2626",
          prefixes: ["900", "901", "902", "903", "904", "905", "906", "907", "908", "909"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Jio",
          logoText: "JIO",
          logoColor: "#059669",
          prefixes: ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Vi",
          logoText: "VI",
          logoColor: "#7C3AED",
          prefixes: ["800", "801", "802", "803", "804", "805", "806", "807", "808", "809"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "BSNL",
          logoText: "BSNL",
          logoColor: "#F59E0B",
          prefixes: ["600", "601", "602", "603", "604", "605", "606", "607", "608", "609"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "BR",
      countryName: "Brazil",
      flag: "🇧🇷",
      callingCode: "+55",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Vivo",
          logoText: "VIVO",
          logoColor: "#059669",
          prefixes: ["110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Claro",
          logoText: "CLARO",
          logoColor: "#DC2626",
          prefixes: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "TIM",
          logoText: "TIM",
          logoColor: "#7C3AED",
          prefixes: ["130", "131", "132", "133", "134", "135", "136", "137", "138", "139"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Oi",
          logoText: "OI",
          logoColor: "#F59E0B",
          prefixes: ["140", "141", "142", "143", "144", "145", "146", "147", "148", "149"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "MX",
      countryName: "Mexico",
      flag: "🇲🇽",
      callingCode: "+52",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Telcel",
          logoText: "TELCEL",
          logoColor: "#059669",
          prefixes: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Movistar",
          logoText: "MOVISTAR",
          logoColor: "#DC2626",
          prefixes: ["110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "AT&T Mexico",
          logoText: "AT&T MX",
          logoColor: "#7C3AED",
          prefixes: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "AU",
      countryName: "Australia",
      flag: "🇦🇺",
      callingCode: "+61",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Telstra",
          logoText: "TELSTRA",
          logoColor: "#059669",
          prefixes: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Optus",
          logoText: "OPTUS",
          logoColor: "#DC2626",
          prefixes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Vodafone Australia",
          logoText: "VODAFONE AU",
          logoColor: "#7C3AED",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "CA",
      countryName: "Canada",
      flag: "🇨🇦",
      callingCode: "+1",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Rogers",
          logoText: "ROGERS",
          logoColor: "#DC2626",
          prefixes: ["300", "301", "302", "303", "304", "305", "306", "307", "308", "309"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Bell",
          logoText: "BELL",
          logoColor: "#059669",
          prefixes: ["310", "311", "312", "313", "314", "315", "316", "317", "318", "319"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Telus",
          logoText: "TELUS",
          logoColor: "#7C3AED",
          prefixes: ["320", "321", "322", "323", "324", "325", "326", "327", "328", "329"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "JP",
      countryName: "Japan",
      flag: "🇯🇵",
      callingCode: "+81",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "NTT Docomo",
          logoText: "DOCOMO",
          logoColor: "#059669",
          prefixes: ["800", "801", "802", "803", "804", "805", "806", "807", "808", "809"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "SoftBank",
          logoText: "SOFTBANK",
          logoColor: "#DC2626",
          prefixes: ["810", "811", "812", "813", "814", "815", "816", "817", "818", "819"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "KDDI",
          logoText: "KDDI",
          logoColor: "#7C3AED",
          prefixes: ["820", "821", "822", "823", "824", "825", "826", "827", "828", "829"],
          phoneNumberLength: 11,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "KR",
      countryName: "South Korea",
      flag: "🇰🇷",
      callingCode: "+82",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "SK Telecom",
          logoText: "SKT",
          logoColor: "#059669",
          prefixes: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "KT",
          logoText: "KT",
          logoColor: "#DC2626",
          prefixes: ["110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "LG U+",
          logoText: "LG U+",
          logoColor: "#7C3AED",
          prefixes: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "NG",
      countryName: "Nigeria",
      flag: "🇳🇬",
      callingCode: "+234",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#F59E0B",
          prefixes: ["800", "801", "802", "803", "804", "805", "806", "807", "808", "809"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Airtel",
          logoText: "AIRTEL",
          logoColor: "#DC2626",
          prefixes: ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Glo",
          logoText: "GLO",
          logoColor: "#059669",
          prefixes: ["500", "501", "502", "503", "504", "505", "506", "507", "508", "509"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "9mobile",
          logoText: "9MOBILE",
          logoColor: "#7C3AED",
          prefixes: ["900", "901", "902", "903", "904", "905", "906", "907", "908", "909"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "EG",
      countryName: "Egypt",
      flag: "🇪🇬",
      callingCode: "+20",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Vodafone Egypt",
          logoText: "VODAFONE EG",
          logoColor: "#DC2626",
          prefixes: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Orange Egypt",
          logoText: "ORANGE EG",
          logoColor: "#F59E0B",
          prefixes: ["110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Etisalat Egypt",
          logoText: "ETISALAT EG",
          logoColor: "#059669",
          prefixes: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "ZA",
      countryName: "South Africa",
      flag: "🇿🇦",
      callingCode: "+27",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Vodacom",
          logoText: "VODACOM",
          logoColor: "#DC2626",
          prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#F59E0B",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Cell C",
          logoText: "CELL C",
          logoColor: "#059669",
          prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Telkom",
          logoText: "TELKOM",
          logoColor: "#7C3AED",
          prefixes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "GH",
      countryName: "Ghana",
      flag: "🇬🇭",
      callingCode: "+233",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#F59E0B",
          prefixes: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Vodafone",
          logoText: "VODAFONE",
          logoColor: "#DC2626",
          prefixes: ["30", "31", "32", "33", "34", "35", "36", "37", "38", "39"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "AirtelTigo",
          logoText: "AIRTELTIGO",
          logoColor: "#059669",
          prefixes: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "MA",
      countryName: "Morocco",
      flag: "🇲🇦",
      callingCode: "+212",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Maroc Telecom",
          logoText: "IAM",
          logoColor: "#059669",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Orange Morocco",
          logoText: "ORANGE MA",
          logoColor: "#F59E0B",
          prefixes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Inwi",
          logoText: "INWI",
          logoColor: "#7C3AED",
          prefixes: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "TN",
      countryName: "Tunisia",
      flag: "🇹🇳",
      callingCode: "+216",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Orange Tunisia",
          logoText: "ORANGE TN",
          logoColor: "#F59E0B",
          prefixes: ["20", "21", "22", "23", "24", "25", "26", "27", "28", "29"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Ooredoo",
          logoText: "OOREDOO",
          logoColor: "#059669",
          prefixes: ["30", "31", "32", "33", "34", "35", "36", "37", "38", "39"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Tunisie Telecom",
          logoText: "TT",
          logoColor: "#7C3AED",
          prefixes: ["40", "41", "42", "43", "44", "45", "46", "47", "48", "49"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "SN",
      countryName: "Senegal",
      flag: "🇸🇳",
      callingCode: "+221",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Orange Senegal",
          logoText: "ORANGE SN",
          logoColor: "#F59E0B",
          prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Free",
          logoText: "FREE",
          logoColor: "#059669",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Expresso",
          logoText: "EXPRESSO",
          logoColor: "#7C3AED",
          prefixes: ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "CI",
      countryName: "Côte d'Ivoire",
      flag: "🇨🇮",
      callingCode: "+225",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Orange Côte d'Ivoire",
          logoText: "ORANGE CI",
          logoColor: "#F59E0B",
          prefixes: ["07", "08", "09", "10", "11", "12", "13", "14", "15", "16"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#059669",
          prefixes: ["17", "18", "19", "20", "21", "22", "23", "24", "25", "26"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Moov",
          logoText: "MOOV",
          logoColor: "#7C3AED",
          prefixes: ["27", "28", "29", "30", "31", "32", "33", "34", "35", "36"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "CM",
      countryName: "Cameroon",
      flag: "🇨🇲",
      callingCode: "+237",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "MTN",
          logoText: "MTN",
          logoColor: "#F59E0B",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Orange",
          logoText: "ORANGE",
          logoColor: "#059669",
          prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Nexttel",
          logoText: "NEXTTEL",
          logoColor: "#7C3AED",
          prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "SG",
      countryName: "Singapore",
      flag: "🇸🇬",
      callingCode: "+65",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Singtel",
          logoText: "SINGTEL",
          logoColor: "#059669",
          prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "StarHub",
          logoText: "STARHUB",
          logoColor: "#DC2626",
          prefixes: ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "M1",
          logoText: "M1",
          logoColor: "#7C3AED",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 8,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "TH",
      countryName: "Thailand",
      flag: "🇹🇭",
      callingCode: "+66",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "AIS",
          logoText: "AIS",
          logoColor: "#059669",
          prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "True",
          logoText: "TRUE",
          logoColor: "#DC2626",
          prefixes: ["60", "61", "62", "63", "64", "65", "66", "67", "68", "69"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "dtac",
          logoText: "DTAC",
          logoColor: "#7C3AED",
          prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "ID",
      countryName: "Indonesia",
      flag: "🇮🇩",
      callingCode: "+62",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Telkomsel",
          logoText: "TELKOMSEL",
          logoColor: "#059669",
          prefixes: ["800", "801", "802", "803", "804", "805", "806", "807", "808", "809"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Indosat",
          logoText: "INDOSAT",
          logoColor: "#DC2626",
          prefixes: ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "XL Axiata",
          logoText: "XL AXIATA",
          logoColor: "#7C3AED",
          prefixes: ["600", "601", "602", "603", "604", "605", "606", "607", "608", "609"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "PH",
      countryName: "Philippines",
      flag: "🇵🇭",
      callingCode: "+63",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Globe",
          logoText: "GLOBE",
          logoColor: "#059669",
          prefixes: ["900", "901", "902", "903", "904", "905", "906", "907", "908", "909"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Smart",
          logoText: "SMART",
          logoColor: "#DC2626",
          prefixes: ["800", "801", "802", "803", "804", "805", "806", "807", "808", "809"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "DITO",
          logoText: "DITO",
          logoColor: "#7C3AED",
          prefixes: ["700", "701", "702", "703", "704", "705", "706", "707", "708", "709"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "VN",
      countryName: "Vietnam",
      flag: "🇻🇳",
      callingCode: "+84",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Viettel",
          logoText: "VIETTEL",
          logoColor: "#059669",
          prefixes: ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Vinaphone",
          logoText: "VINAPHONE",
          logoColor: "#DC2626",
          prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Mobifone",
          logoText: "MOBIFONE",
          logoColor: "#7C3AED",
          prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "MY",
      countryName: "Malaysia",
      flag: "🇲🇾",
      callingCode: "+60",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Celcom",
          logoText: "CELCOM",
          logoColor: "#059669",
          prefixes: ["100", "101", "102", "103", "104", "105", "106", "107", "108", "109"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Maxis",
          logoText: "MAXIS",
          logoColor: "#DC2626",
          prefixes: ["110", "111", "112", "113", "114", "115", "116", "117", "118", "119"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Digi",
          logoText: "DIGI",
          logoColor: "#7C3AED",
          prefixes: ["120", "121", "122", "123", "124", "125", "126", "127", "128", "129"],
          phoneNumberLength: 10,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    },
    {
      countryCode: "TW",
      countryName: "Taiwan",
      flag: "🇹🇼",
      callingCode: "+886",
      mobileNumberPortability: true,
      carriers: [
        {
          name: "Chunghwa Telecom",
          logoText: "CHT",
          logoColor: "#059669",
          prefixes: ["90", "91", "92", "93", "94", "95", "96", "97", "98", "99"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Taiwan Mobile",
          logoText: "TAIWAN MOBILE",
          logoColor: "#DC2626",
          prefixes: ["80", "81", "82", "83", "84", "85", "86", "87", "88", "89"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        },
        {
          name: "Far EasTone",
          logoText: "FET",
          logoColor: "#7C3AED",
          prefixes: ["70", "71", "72", "73", "74", "75", "76", "77", "78", "79"],
          phoneNumberLength: 9,
          networkType: "GSM",
          coverage: "National",
          services: ["airtime", "data", "sms"]
        }
      ]
    }
  ]
};

// Helper functions for carrier detection
export const getCountryByCode = (countryCode) => {
  return carriersData.countries.find(country => country.countryCode === countryCode);
};

export const getCountryByCallingCode = (callingCode) => {
  return carriersData.countries.find(country => country.callingCode === callingCode);
};

export const detectCarrier = (phoneNumber, countryCode) => {
  const country = getCountryByCode(countryCode);
  if (!country) {
    console.log('Country not found for code:', countryCode);
    return null;
  }

  // Remove country code and clean number
  const cleanNumber = phoneNumber.replace(country.callingCode, '').replace(/^\+/, '');
  console.log('Clean number after removing country code:', cleanNumber);
  console.log('Available carriers for', country.countryName, ':', country.carriers.map(c => c.name));
  
  // Find matching carrier by prefix
  for (const carrier of country.carriers) {
    console.log('Checking carrier:', carrier.name, 'with prefixes:', carrier.prefixes);
    for (const prefix of carrier.prefixes) {
      if (cleanNumber.startsWith(prefix)) {
        console.log('Match found! Carrier:', carrier.name, 'Prefix:', prefix);
        return {
          carrier,
          country,
          detectedPrefix: prefix
        };
      }
    }
  }
  
  console.log('No carrier match found for number:', cleanNumber);
  return null;
};

export const getAllCountries = () => {
  return carriersData.countries;
};

export const getCarriersByCountry = (countryCode) => {
  const country = getCountryByCode(countryCode);
  return country ? country.carriers : [];
};

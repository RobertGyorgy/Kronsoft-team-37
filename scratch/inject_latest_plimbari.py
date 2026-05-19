import json

tree_path = r"c:\Users\user\Desktop\SmartCity\public\decision_tree.json"

# 1. Read existing decision tree
with open(tree_path, "r", encoding="utf-8") as f:
    tree = json.load(f)

# 2. Build the category structure directly as a Python dict
plimbari_category = {
  "categoryId": "plimbari",
  "categoryLabel": "Plimbări",
  "categoryIcon": "person-walking",
  "questions": [
    {
      "id": "q1",
      "text": "Ce vrei să vezi?",
      "options": [
        { "id": "a", "label": "Centrul istoric", "icon": "landmark" },
        { "id": "b", "label": "Cartiere locale", "icon": "city" },
        { "id": "c", "label": "Priveliști", "icon": "binoculars" },
        { "id": "d", "label": "Street art", "icon": "palette" }
      ]
    },
    {
      "id": "q2",
      "text": "Cât de mult mergi pe jos?",
      "options": [
        { "id": "a", "label": "Puțin", "icon": "person-walking" },
        { "id": "b", "label": "Moderat", "icon": "person-hiking" },
        { "id": "c", "label": "Mult", "icon": "person-running" }
      ]
    },
    {
      "id": "q3",
      "text": "La ce oră?",
      "options": [
        { "id": "a", "label": "Dimineață", "icon": "cloud-sun" },
        { "id": "b", "label": "Zi", "icon": "sun" },
        { "id": "c", "label": "Seară", "icon": "moon" }
      ]
    }
  ],

  "places": {
    "piata_sfatului": {
      "id": "piata_sfatului",
      "type": "Centrul istoric",
      "name": "Piața Sfatului & Casa Sfatului",
      "shortDescription": "Inima medievală a Brașovului – clădiri istorice, Casa Sfatului cu turn de 58 m, Muzeul de Istorie.",
      "description": "Piața Sfatului e centrul Brașovului din sec. XIII. Casa Sfatului (sec. XV) cu turnul de 58 m găzduiește Muzeul de Istorie. În jur: Casa Mureșenilor, Casa Hirscher, Biserica Adormirea Maicii Domnului. Seara, iluminată spectaculos.",
      "address": "Piața Sfatului, Brașov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "walkingLevel": "Puțin",
      "bestTime": "oricând",
      "duration": "30–60 min",
      "tip": "Dimineața devreme – fără turiști, lumină perfectă pentru poze. Seara – iluminat spectaculos.",
      "image": "piata_sfatului.jpg"
    },
    "biserica_neagra": {
      "id": "biserica_neagra",
      "type": "Centrul istoric",
      "name": "Biserica Neagră",
      "shortDescription": "Cea mai mare biserică gotică din sud-estul Europei – 600+ ani, colecție unică de covoare orientale.",
      "description": "Construcția a început în 1384 și a durat ~100 ani. Biserică gotică evanghelică-luterană. Numele vine de la incendiul din 1689. Interior impresionant cu cea mai mare colecție de covoare anatoliene din Europa.",
      "address": "Curtea Johannes Honterus, Brașov",
      "coordinates": { "lat": 45.6413, "lng": 25.5878 },
      "walkingLevel": "Puțin",
      "bestTime": "Zi",
      "duration": "45–90 min",
      "tip": "Vizitarea interiorului e posibilă doar ziua (10–17). Concertele de orgă de vară sunt extraordinare.",
      "image": "biserica_neagra.jpg"
    },
    "strada_sforii": {
      "id": "strada_sforii",
      "type": "Centrul istoric",
      "name": "Strada Sforii",
      "shortDescription": "Una dintre cele mai înguste străzi din Europa – doar 1,32 m lățime, medievală, iconică.",
      "description": "Strada Sforii are doar 1,32 m lățime și ~80 m lungime. Construită ca pasaj pentru pompieri în perioada medievală. Una din top 10 cele mai înguste străzi din Europa. Loc iconic pentru poze.",
      "address": "Str. Sforii (între Str. Cerbului și Str. Poarta Schei), Brașov",
      "coordinates": { "lat": 45.6420, "lng": 25.5890 },
      "walkingLevel": "Puțin",
      "bestTime": "Dimineață",
      "duration": "15–30 min",
      "tip": "Dimineața devreme e goală – poze perfecte. În sezon, la amiază e coadă de turiști.",
      "image": "strada_sforii.jpg"
    },
    "strada_republicii": {
      "id": "strada_republicii",
      "type": "Centrul istoric",
      "name": "Strada Republicii – pietonala",
      "shortDescription": "Principala stradă pietonală a Brașovului – magazine, cafenele, clădiri istorice colorate.",
      "description": "Strada Republicii e inima comercială a Brașovului. Pietonală cu clădiri colorate, magazine, cafenele și restaurante. Leagă Piața Sfatului de Piața Teatrului. Animată toată ziua.",
      "address": "Str. Republicii, Brașov",
      "coordinates": { "lat": 45.6440, "lng": 25.5915 },
      "walkingLevel": "Puțin",
      "bestTime": "oricând",
      "duration": "30–60 min",
      "tip": "Seara e cea mai vibrantă – terase pline, muzicieni stradali, atmosferă de festival.",
      "image": "strada_republicii.jpg"
    },
    "bastionul_tesatorilor": {
      "id": "bastionul_tesatorilor",
      "type": "Centrul istoric",
      "name": "Bastionul Țesătorilor & Zidurile Cetății",
      "shortDescription": "Cel mai mare bastion medieval din SE Europei – sec. XV, Muzeul Țării Bârsei, macheta cetății.",
      "description": "Bastionul Țesătorilor (sec. XV) e cel mai bine conservat din cele 7 bastioane ale Brașovului. Găzduiește Muzeul Țării Bârsei cu macheta vechii cetăți. Plimbarea de-a lungul zidurilor medievale e spectaculoasă.",
      "address": "Str. George Coșbuc, Brașov",
      "coordinates": { "lat": 45.6405, "lng": 25.5855 },
      "walkingLevel": "Moderat",
      "bestTime": "Zi",
      "duration": "60–90 min",
      "tip": "Macheta cetății medievale din muzeu te ajută să înțelegi tot ce vezi apoi pe jos.",
      "image": "bastionul_tesatorilor.jpg"
    },
    "poarta_ecaterina": {
      "id": "poarta_ecaterina",
      "type": "Centrul istoric",
      "name": "Poarta Ecaterina & Poarta Schei",
      "shortDescription": "Singura poartă medievală păstrată din 1559 + Poarta Schei (1828) – intrarea în cartierul Șchei.",
      "description": "Poarta Ecaterina (1559) e singura poartă originală păstrată a cetății Brașov, cu 4 turnulețe. Poarta Schei (1828) e în stil neoclasic. Ambele marchează intrarea în cartierul istoric Șchei.",
      "address": "Str. Poarta Schei, Brașov",
      "coordinates": { "lat": 45.6398, "lng": 25.5870 },
      "walkingLevel": "Moderat",
      "bestTime": "oricând",
      "duration": "30–45 min",
      "tip": "Poarta Ecaterina găzduiește expoziții temporare de artă și istorie.",
      "image": "poarta_ecaterina.jpg"
    },
    "traseul_zidurilor": {
      "id": "traseul_zidurilor",
      "type": "Centrul istoric",
      "name": "Traseul Complet al Zidurilor Medievale",
      "shortDescription": "Parcurs complet pe traseul fortificațiilor – bastioane, turnuri, porți – 3+ km de istorie.",
      "description": "Traseul urmează zidurile medievale ale Brașovului: 7 bastioane, turnuri de apărare, porți. De la Bastionul Țesătorilor prin Bastionul Funarilor, Turnul Alb, Turnul Negru, până la Poarta Schei. Cel mai complet traseu istoric.",
      "address": "Start: Bastionul Țesătorilor, Brașov",
      "coordinates": { "lat": 45.6405, "lng": 25.5855 },
      "walkingLevel": "Mult",
      "bestTime": "Zi",
      "duration": "2–3 ore",
      "tip": "Ia o hartă medievală de la muzeu și urmărește traseul zidurilor. E ca un escape room în aer liber!",
      "image": "traseul_zidurilor.jpg"
    },

    "scheii_brasovului": {
      "id": "scheii_brasovului",
      "type": "Cartiere locale",
      "name": "Șcheii Brașovului – tur complet",
      "shortDescription": "Cel mai vechi cartier românesc din Brașov – Piața Unirii, Biserica Sf. Nicolae, Prima Școală.",
      "description": "Șcheii Brașovului e cartierul românesc istoric din afara zidurilor cetății. Piața Unirii, Biserica Sf. Nicolae (sec. XIII), Prima Școală Românească (sec. XV), statuia lui Coresi. Istorie românească pură.",
      "address": "Piața Unirii / Str. Prundului, Brașov",
      "coordinates": { "lat": 45.6380, "lng": 25.5850 },
      "walkingLevel": "Moderat",
      "bestTime": "Zi",
      "duration": "90–120 min",
      "tip": "Combină cu Poarta Schei – intri în Șchei exact cum o făceau românii acum 500 de ani.",
      "image": "scheii_brasovului.jpg"
    },
    "piata_unirii_schei": {
      "id": "piata_unirii_schei",
      "type": "Cartiere locale",
      "name": "Piața Unirii & Biserica Sf. Nicolae",
      "shortDescription": "Centrul cartierului Șchei – biserica din sec. XIII, atmosferă autentică, departe de turiști.",
      "description": "Piața Unirii e centrul istoric al Șcheilor. Biserica Sf. Nicolae (sec. XIII) cu picturi murale impresionante. Statuia Diaconului Coresi. Atmosferă autentică, departe de agitația turistică.",
      "address": "Piața Unirii, Brașov",
      "coordinates": { "lat": 45.6375, "lng": 25.5845 },
      "walkingLevel": "Puțin",
      "bestTime": "Dimineață",
      "duration": "45–60 min",
      "tip": "Dimineața e liniștit și magic. Interiorul bisericii are picturi murale care merită văzute.",
      "image": "piata_unirii_schei.jpg"
    },
    "strada_lunga": {
      "id": "strada_lunga",
      "type": "Cartiere locale",
      "name": "Strada Lungă – istorie și viață locală",
      "shortDescription": "Cea mai lungă stradă din Brașov – case săsești colorate, magazine locale, viață de cartier.",
      "description": "Strada Lungă e cea mai lungă stradă din Brașov. Case vechi săsești colorate, magazine locale, restaurante autentice. Viață de cartier departe de zona turistică. Arhitectură variată de-a lungul secolelor.",
      "address": "Str. Lungă, Brașov",
      "coordinates": { "lat": 45.6460, "lng": 25.5950 },
      "walkingLevel": "Moderat",
      "bestTime": "Zi",
      "duration": "60–90 min",
      "tip": "Caută casele cu porți saxone sculptate – fiecare e o operă de artă unică.",
      "image": "strada_lunga.jpg"
    },
    "cartier_coresi": {
      "id": "cartier_coresi",
      "type": "Cartiere locale",
      "name": "Cartierul Coresi – noul Brașov",
      "shortDescription": "Zona modernă pe fosta platformă industrială – shopping, pietonală, grădini urbane.",
      "description": "Cartierul Coresi e noul centru modern al Brașovului, construit pe fosta platformă industrială. Coresi Shopping Resort, pietonala cu cafenele, grădini urbane. Contrastul vechi-nou al Brașovului.",
      "address": "Coresi Shopping Resort / Str. Sfântul Ioan, Brașov",
      "coordinates": { "lat": 45.6560, "lng": 25.6050 },
      "walkingLevel": "Moderat",
      "bestTime": "oricând",
      "duration": "60–90 min",
      "tip": "Mergi pe pietonala Coresi și apoi ia trenulețul urban până în centru – experiență locală reală.",
      "image": "cartier_coresi.jpg"
    },
    "blumana": {
      "id": "blumana",
      "type": "Cartiere locale",
      "name": "Cartierul Blumăna & Parcul Titulescu",
      "shortDescription": "Cartier rezidențial liniștit – Parcul Titulescu cu lac, alei umbroase, teatru de vară.",
      "description": "Blumăna e un cartier rezidențial cu clădiri de la începutul sec. XX. Parcul Nicolae Titulescu are lac, alei umbroase, locuri de joacă, teatru de vară. Atmosferă de oraș vechi, liniștit.",
      "address": "Bd. Eroilor / Parcul Nicolae Titulescu, Brașov",
      "coordinates": { "lat": 45.6500, "lng": 25.5920 },
      "walkingLevel": "Puțin",
      "bestTime": "oricând",
      "duration": "45–60 min",
      "tip": "Parcul e perfect pentru o plimbare cu copiii. Lacul cu rațe și spațiile verzi sunt superbe.",
      "image": "blumana.jpg"
    },
    "prima_scoala": {
      "id": "prima_scoala",
      "type": "Cartiere locale",
      "name": "Prima Școală Românească – muzeu",
      "shortDescription": "Primul loc unde s-a predat în limba română (sec. XV) – manuscrise, biblii vechi, Coresi.",
      "description": "Prima Școală Românească (sec. XV) e în curtea Bisericii Sf. Nicolae din Șchei. Manuscrise, cărți vechi, biblii. Aici a tipărit Diaconul Coresi primele cărți în limba română. Loc cu semnificație națională.",
      "address": "Piața Unirii nr. 2-3, Brașov (Șchei)",
      "coordinates": { "lat": 45.6378, "lng": 25.5848 },
      "walkingLevel": "Puțin",
      "bestTime": "Zi",
      "duration": "45–60 min",
      "tip": "Ghizii locali povestesc anecdote fascinante. Excelent pentru copii – lecție de istorie vie.",
      "image": "prima_scoala.jpg"
    },
    "prund_vechi": {
      "id": "prund_vechi",
      "type": "Cartiere locale",
      "name": "Zona Prundului – cartier ascuns",
      "shortDescription": "Cartier vechi între Șchei și centru – case vechi, străduțe liniștite, atmosferă autentică.",
      "description": "Zona Prundului e cartierul de tranziție între Șchei și centrul cetății. Străduțe liniștite cu case vechi, garduri din piatră, grădini ascunse. Atmosfera Brașovului de altădată, fără turiști.",
      "address": "Str. Prundului / Str. Cetății, Brașov",
      "coordinates": { "lat": 45.6390, "lng": 25.5860 },
      "walkingLevel": "Mult",
      "bestTime": "Dimineață",
      "duration": "90–120 min",
      "tip": "Rătăcește-te pe străduțe – surprizele apar la fiecare colț. Zero turiști, 100% autentic.",
      "image": "prund_vechi.jpg"
    },

    "tampa_telecabina": {
      "id": "tampa_telecabina",
      "type": "Priveliști",
      "name": "Tâmpa cu Telecabina – panoramă rapidă",
      "shortDescription": "3 minute cu telecabina la 960 m – panoramă asupra întregului Brașov + literele BRAȘOV.",
      "description": "Telecabina te duce pe vârful Tâmpei în 3 minute. La 960 m: panoramă completă asupra orașului, literele BRAȘOV (stil Hollywood, din 1971), terasă, Restaurant Panoramic (redeschis 2025).",
      "address": "Aleea Tiberiu Brediceanu (telecabina), Brașov",
      "coordinates": { "lat": 45.6415, "lng": 25.5895 },
      "walkingLevel": "Puțin",
      "bestTime": "oricând",
      "duration": "60–90 min",
      "tip": "Seara – literele BRAȘOV sunt iluminate. Dimineața – aer curat și lumină perfectă.",
      "image": "tampa_telecabina.jpg"
    },
    "tampa_pe_jos": {
      "id": "tampa_pe_jos",
      "type": "Priveliști",
      "name": "Tâmpa pe Jos – Drumul Serpentinelor",
      "shortDescription": "Urcuș de 1h15 pe poteca clasică – pădure, aer curat, panoramă la vârf.",
      "description": "Drumul Serpentinelor e traseul clasic pe Tâmpa. Urcuș de 1h15–1h30 prin pădure de fag. La vârf: panoramă 360°, literele BRAȘOV, Restaurant Panoramic. Alternativă: Treptele lui Gabony (mai abrupt).",
      "address": "Start: Parcul Sub Tâmpa, Brașov",
      "coordinates": { "lat": 45.6400, "lng": 25.5890 },
      "walkingLevel": "Mult",
      "bestTime": "Dimineață",
      "duration": "2–3 ore (dus-întors)",
      "tip": "Dimineața devreme – aer proaspăt și poți vedea căprioare. Apusul de sus e spectaculos.",
      "image": "tampa_pe_jos.jpg"
    },
    "turnul_alb_vedere": {
      "id": "turnul_alb_vedere",
      "type": "Priveliști",
      "name": "Turnul Alb & Turnul Negru – panorame",
      "shortDescription": "Turnuri medievale cu cele mai bune panorame asupra centrului vechi – fără telecabină.",
      "description": "Turnul Alb (sec. XV) și Turnul Negru (sec. XIV) sunt foste turnuri de apărare pe dealul de deasupra centrului. Fiecare oferă panoramă diferită asupra Piății Sfatului și a orașului vechi. Acces prin potecă scurtă.",
      "address": "Str. După Ziduri / Str. Castelului, Brașov",
      "coordinates": { "lat": 45.6430, "lng": 25.5870 },
      "walkingLevel": "Moderat",
      "bestTime": "oricând",
      "duration": "60–90 min",
      "tip": "Cel mai bun punct pentru poze cu Piața Sfatului și Tâmpa în fundal. Secret local!",
      "image": "turnul_alb_vedere.jpg"
    },
    "cetatuia_straja": {
      "id": "cetatuia_straja",
      "type": "Priveliști",
      "name": "Cetățuia Brașovului – Dealul Straja",
      "shortDescription": "Cetate medievală pe deal cu panoramă unică – ziduri vechi, pădure, liniște totală.",
      "description": "Cetățuia Brașovului (sec. XVI) e pe Dealul Straja, înconjurată de pădure. Punct de refugiu medieval. Panoramă spectaculoasă asupra orașului. Plimbarea pe ziduri oferă perspectivă unică. Restaurant la intrare.",
      "address": "Str. Cetății (urcare pe deal), Brașov",
      "coordinates": { "lat": 45.6370, "lng": 25.5840 },
      "walkingLevel": "Moderat",
      "bestTime": "oricând",
      "duration": "90–120 min",
      "tip": "Drumul prin pădure e magic. La cetate – liniște totală și vedere incredibilă.",
      "image": "cetatuia_straja.jpg"
    },
    "dealul_melcilor_apus": {
      "id": "dealul_melcilor_apus",
      "type": "Priveliști",
      "name": "Dealul Melcilor – apus legendar",
      "shortDescription": "Cel mai frumos apus din Brașov – panoramă largă, potecă ușoară, loc de suflet al localnicilor.",
      "description": "Dealul Melcilor e locul unde brașovenii vin să vadă apusul. Potecă ușoară de 15-20 min, panoramă largă asupra orașului și munților. Seara – golden hour spectaculos. Loc de suflet.",
      "address": "Cartier Astra (urcuș de pe str. Zizinului), Brașov",
      "coordinates": { "lat": 45.6520, "lng": 25.5780 },
      "walkingLevel": "Moderat",
      "bestTime": "Seară",
      "duration": "60–90 min",
      "tip": "Vino cu 30 min înainte de apus. Ia un termos cu ceai și o pătură. Magie!",
      "image": "dealul_melcilor_apus.jpg"
    },
    "parcul_sub_tampa": {
      "id": "parcul_sub_tampa",
      "type": "Priveliști",
      "name": "Parcul Sub Tâmpa & Aleea Brediceanu",
      "shortDescription": "Plimbare la poalele muntelui cu vedere spre pădure – aer curat, căprioare, liniște.",
      "description": "Parcul Sub Tâmpa e la baza muntelui. Alei prin pădure, bănci cu vedere, aer curat de munte. Dimineața poți vedea căprioare. Aleea Brediceanu leagă parcul de telecabină.",
      "address": "Aleea Tiberiu Brediceanu, Brașov",
      "coordinates": { "lat": 45.6410, "lng": 25.5895 },
      "walkingLevel": "Puțin",
      "bestTime": "Dimineață",
      "duration": "30–60 min",
      "tip": "La 6-7 dimineața poți vedea căprioare coborând din pădure. Magic!",
      "image": "parcul_sub_tampa.jpg"
    },

    "murals_centru": {
      "id": "murals_centru",
      "type": "Street art",
      "name": "Muralele din Centrul Vechi",
      "shortDescription": "Traseu urban cu murale contemporane pe fațadele clădirilor vechi – artă pe ziduri medievale.",
      "description": "Brașovul are mai multe murale contemporane pe fațadele clădirilor din centrul vechi. Artiști locali și internaționali au transformat pereții în galerii în aer liber. Traseu fotografic excelent.",
      "address": "Diverse locații – centrul vechi, Brașov",
      "coordinates": { "lat": 45.6430, "lng": 25.5890 },
      "walkingLevel": "Moderat",
      "bestTime": "Zi",
      "duration": "60–90 min",
      "tip": "Caută muralele din curțile interioare – cele mai interesante sunt ascunse!",
      "image": "murals_centru.jpg"
    },
    "tipografia_zona": {
      "id": "tipografia_zona",
      "type": "Street art",
      "name": "Zona Tipografia – colț artistic",
      "shortDescription": "Zona din jurul cafenelei Tipografia – galerii, artă urbană, decoruri creative pe Postăvarului.",
      "description": "Strada Postăvarului și împrejurimile sunt zona cea mai artsy din Brașov. Cafeneaua Tipografia, galerii de artă, decoruri creative pe fațade. Hub cultural cu expoziții, lansări și pop-up-uri.",
      "address": "Str. Postăvarului / Str. George Barițiu, Brașov",
      "coordinates": { "lat": 45.6420, "lng": 25.5865 },
      "walkingLevel": "Puțin",
      "bestTime": "oricând",
      "duration": "45–60 min",
      "tip": "Intră la Tipografia pe o cafea și explorează curțile interioare – sunt galerii ascunse.",
      "image": "tipografia_zona.jpg"
    },
    "galerii_arta": {
      "id": "galerii_arta",
      "type": "Street art",
      "name": "Galerii & Spații Creative din Centru",
      "shortDescription": "Circuit al galeriilor de artă, atelierelor și spațiilor creative din centrul Brașovului.",
      "description": "Brașovul are o scenă artistică activă. Galeria de Artă din Bastionul Țesătorilor, Artegianale Hub 2068, Keys Coffee & Lounge (expoziții), Poarta Ecaterina (expoziții temporare). Circuit de 4-5 spații.",
      "address": "Diverse locații – centru, Brașov",
      "coordinates": { "lat": 45.6425, "lng": 25.5880 },
      "walkingLevel": "Moderat",
      "bestTime": "Zi",
      "duration": "90–120 min",
      "tip": "Verifică evenimentele pe Zile și Nopți Brașov – vernisaje și pop-up-uri frecvente.",
      "image": "galerii_arta.jpg"
    },
    "arta_schei": {
      "id": "arta_schei",
      "type": "Street art",
      "name": "Artă Urbană în Șchei & Prund",
      "shortDescription": "Murale și artă stradală în cartierele vechi – mix de tradiție și urban contemporan.",
      "description": "Cartierele Șchei și Prund au primit în ultimii ani intervenții de artă urbană. Murale pe case vechi, instalații creative, graffiti artistic pe garduri. Contrast fascinant tradiție-contemporan.",
      "address": "Str. Prundului / Str. Lungă (zona Șchei), Brașov",
      "coordinates": { "lat": 45.6390, "lng": 25.5855 },
      "walkingLevel": "Moderat",
      "bestTime": "Zi",
      "duration": "60–90 min",
      "tip": "Cea mai bună lumină pentru fotografii e după-amiaza. Combină cu vizita la Prima Școală.",
      "image": "arta_schei.jpg"
    },
    "sinagoga_arhitectura": {
      "id": "sinagoga_arhitectura",
      "type": "Street art",
      "name": "Sinagogile Brașovului – arhitectură unică",
      "shortDescription": "Două sinagogi cu arhitectură remarcabilă: neogotică (1901) și mozaic eclectic (1924).",
      "description": "Sinagoga Neologă (1899-1901) pe Poarta Schei 29 – stil neogotic cu elemente maure. Sinagoga de pe Castelului 64 (1924) – stil eclectic cu mozaic ceramic și doi lei. Arhitectură unică în Brașov.",
      "address": "Str. Poarta Schei nr. 29 / Str. Castelului nr. 64, Brașov",
      "coordinates": { "lat": 45.6408, "lng": 25.5878 },
      "walkingLevel": "Puțin",
      "bestTime": "Zi",
      "duration": "30–45 min",
      "tip": "Fațadele sunt spectaculoase ca detaliu arhitectural. Cele mai fotografiate clădiri non-turistice.",
      "image": "sinagoga_arhitectura.jpg"
    },
    "interventii_urbane": {
      "id": "interventii_urbane",
      "type": "Street art",
      "name": "Traseu Urban Complet – artă pe străzi",
      "shortDescription": "Traseu lung de artă urbană: de la Tipografia prin centru, Șchei, Prund – toate muralele și instalațiile.",
      "description": "Traseul complet de artă urbană leagă zona Tipografia de centrul vechi, Poarta Schei, cartierul Prund și Șchei. Include murale, instalații, galerii și fațade pictate. Cel mai complet tur artistic al Brașovului.",
      "address": "Start: Str. Postăvarului → centru → Șchei, Brașov",
      "coordinates": { "lat": 45.6420, "lng": 25.5870 },
      "walkingLevel": "Mult",
      "bestTime": "Zi",
      "duration": "2–3 ore",
      "tip": "Fă-ți un album foto pe parcurs – e un tur fotografic extraordinar.",
      "image": "interventii_urbane.jpg"
    }
  },

  "results": {
    "a-a-a": { "combination": { "q1": "Centrul istoric", "q2": "Puțin", "q3": "Dimineață" }, "recommendations": ["strada_sforii", "piata_sfatului", "strada_republicii"] },
    "a-a-b": { "combination": { "q1": "Centrul istoric", "q2": "Puțin", "q3": "Zi" }, "recommendations": ["biserica_neagra", "piata_sfatului", "strada_sforii"] },
    "a-a-c": { "combination": { "q1": "Centrul istoric", "q2": "Puțin", "q3": "Seară" }, "recommendations": ["piata_sfatului", "strada_republicii", "strada_sforii"] },
    "a-b-a": { "combination": { "q1": "Centrul istoric", "q2": "Moderat", "q3": "Dimineață" }, "recommendations": ["bastionul_tesatorilor", "poarta_ecaterina", "strada_sforii"] },
    "a-b-b": { "combination": { "q1": "Centrul istoric", "q2": "Moderat", "q3": "Zi" }, "recommendations": ["bastionul_tesatorilor", "poarta_ecaterina", "biserica_neagra"] },
    "a-b-c": { "combination": { "q1": "Centrul istoric", "q2": "Moderat", "q3": "Seară" }, "recommendations": ["strada_republicii", "poarta_ecaterina", "piata_sfatului"] },
    "a-c-a": { "combination": { "q1": "Centrul istoric", "q2": "Mult", "q3": "Dimineață" }, "recommendations": ["traseul_zidurilor", "bastionul_tesatorilor", "poarta_ecaterina"] },
    "a-c-b": { "combination": { "q1": "Centrul istoric", "q2": "Mult", "q3": "Zi" }, "recommendations": ["traseul_zidurilor", "biserica_neagra", "bastionul_tesatorilor"] },
    "a-c-c": { "combination": { "q1": "Centrul istoric", "q2": "Mult", "q3": "Seară" }, "recommendations": ["traseul_zidurilor", "strada_republicii", "piata_sfatului"] },

    "b-a-a": { "combination": { "q1": "Cartiere locale", "q2": "Puțin", "q3": "Dimineață" }, "recommendations": ["piata_unirii_schei", "blumana", "prima_scoala"] },
    "b-a-b": { "combination": { "q1": "Cartiere locale", "q2": "Puțin", "q3": "Zi" }, "recommendations": ["prima_scoala", "piata_unirii_schei", "blumana"] },
    "b-a-c": { "combination": { "q1": "Cartiere locale", "q2": "Puțin", "q3": "Seară" }, "recommendations": ["blumana", "piata_unirii_schei", "cartier_coresi"] },
    "b-b-a": { "combination": { "q1": "Cartiere locale", "q2": "Moderat", "q3": "Dimineață" }, "recommendations": ["scheii_brasovului", "strada_lunga", "blumana"] },
    "b-b-b": { "combination": { "q1": "Cartiere locale", "q2": "Moderat", "q3": "Zi" }, "recommendations": ["scheii_brasovului", "cartier_coresi", "strada_lunga"] },
    "b-b-c": { "combination": { "q1": "Cartiere locale", "q2": "Moderat", "q3": "Seară" }, "recommendations": ["cartier_coresi", "strada_lunga", "blumana"] },
    "b-c-a": { "combination": { "q1": "Cartiere locale", "q2": "Mult", "q3": "Dimineață" }, "recommendations": ["prund_vechi", "scheii_brasovului", "strada_lunga"] },
    "b-c-b": { "combination": { "q1": "Cartiere locale", "q2": "Mult", "q3": "Zi" }, "recommendations": ["scheii_brasovului", "prund_vechi", "cartier_coresi"] },
    "b-c-c": { "combination": { "q1": "Cartiere locale", "q2": "Mult", "q3": "Seară" }, "recommendations": ["prund_vechi", "cartier_coresi", "strada_lunga"] },

    "c-a-a": { "combination": { "q1": "Priveliști", "q2": "Puțin", "q3": "Dimineață" }, "recommendations": ["parcul_sub_tampa", "tampa_telecabina", "turnul_alb_vedere"] },
    "c-a-b": { "combination": { "q1": "Priveliști", "q2": "Puțin", "q3": "Zi" }, "recommendations": ["tampa_telecabina", "parcul_sub_tampa", "turnul_alb_vedere"] },
    "c-a-c": { "combination": { "q1": "Priveliști", "q2": "Puțin", "q3": "Seară" }, "recommendations": ["tampa_telecabina", "parcul_sub_tampa", "dealul_melcilor_apus"] },
    "c-b-a": { "combination": { "q1": "Priveliști", "q2": "Moderat", "q3": "Dimineață" }, "recommendations": ["turnul_alb_vedere", "cetatuia_straja", "dealul_melcilor_apus"] },
    "c-b-b": { "combination": { "q1": "Priveliști", "q2": "Moderat", "q3": "Zi" }, "recommendations": ["cetatuia_straja", "turnul_alb_vedere", "dealul_melcilor_apus"] },
    "c-b-c": { "combination": { "q1": "Priveliști", "q2": "Moderat", "q3": "Seară" }, "recommendations": ["dealul_melcilor_apus", "turnul_alb_vedere", "cetatuia_straja"] },
    "c-c-a": { "combination": { "q1": "Priveliști", "q2": "Mult", "q3": "Dimineață" }, "recommendations": ["tampa_pe_jos", "cetatuia_straja", "turnul_alb_vedere"] },
    "c-c-b": { "combination": { "q1": "Priveliști", "q2": "Mult", "q3": "Zi" }, "recommendations": ["tampa_pe_jos", "cetatuia_straja", "dealul_melcilor_apus"] },
    "c-c-c": { "combination": { "q1": "Priveliști", "q2": "Mult", "q3": "Seară" }, "recommendations": ["tampa_pe_jos", "dealul_melcilor_apus", "cetatuia_straja"] },

    "d-a-a": { "combination": { "q1": "Street art", "q2": "Puțin", "q3": "Dimineață" }, "recommendations": ["tipografia_zona", "sinagoga_arhitectura", "galerii_arta"] },
    "d-a-b": { "combination": { "q1": "Street art", "q2": "Puțin", "q3": "Zi" }, "recommendations": ["tipografia_zona", "sinagoga_arhitectura", "galerii_arta"] },
    "d-a-c": { "combination": { "q1": "Street art", "q2": "Puțin", "q3": "Seară" }, "recommendations": ["tipografia_zona", "sinagoga_arhitectura", "murals_centru"] },
    "d-b-a": { "combination": { "q1": "Street art", "q2": "Moderat", "q3": "Dimineață" }, "recommendations": ["murals_centru", "arta_schei", "galerii_arta"] },
    "d-b-b": { "combination": { "q1": "Street art", "q2": "Moderat", "q3": "Zi" }, "recommendations": ["galerii_arta", "murals_centru", "arta_schei"] },
    "d-b-c": { "combination": { "q1": "Street art", "q2": "Moderat", "q3": "Seară" }, "recommendations": ["murals_centru", "tipografia_zona", "arta_schei"] },
    "d-c-a": { "combination": { "q1": "Street art", "q2": "Mult", "q3": "Dimineață" }, "recommendations": ["interventii_urbane", "arta_schei", "murals_centru"] },
    "d-c-b": { "combination": { "q1": "Street art", "q2": "Mult", "q3": "Zi" }, "recommendations": ["interventii_urbane", "galerii_arta", "arta_schei"] },
    "d-c-c": { "combination": { "q1": "Street art", "q2": "Mult", "q3": "Seară" }, "recommendations": ["interventii_urbane", "murals_centru", "tipografia_zona"] }
  }
}

# 3. Inject into tree and save
tree["plimbari"] = plimbari_category

with open(tree_path, "w", encoding="utf-8") as f:
    json.dump(tree, f, indent=2, ensure_ascii=False)

print("[OK] Successfully generated and merged latest Plimbări category into decision_tree.json!")
print(f"Total combinations: {len(plimbari_category['results'])}")

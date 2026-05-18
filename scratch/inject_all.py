import json
import os

tree_path = r"c:\Users\user\Desktop\SmartCity\public\decision_tree.json"
test_data_path = r"c:\Users\user\Desktop\test\data.json"

# 1. Load existing decision tree
with open(tree_path, "r", encoding="utf-8") as f:
    tree = json.load(f)

# 2. Inject NATURA from test/data.json
if os.path.exists(test_data_path):
    with open(test_data_path, "r", encoding="utf-8") as f:
        test_data = json.load(f)
    tree["natura"] = test_data
    print("[OK] Loaded and injected Natura category from test/data.json")
else:
    print("[WARN] test/data.json not found!")

# 3. Inject PLIMBARI from scratch/inject_latest_plimbari.py structure
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
      "description": "Telecabina te duce pe vârful Tâmpei în 3 minute. La 960 m: panoramă completă asupra orașului, literele BRAȘOV (stil Hollywood, din 1971), terasă, Restaurant Panoramic.",
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
      "description": "Drumul Serpentinelor e traseul clasic pe Tâmpa. Urcuș de 1h15–1h30 prin pădure de fag. La vârf: panoramă 360 de grade, literele BRAȘOV.",
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
      "description": "Turnul Alb (sec. XV) și Turnul Negru (sec. XIV) sunt foste turnuri de apărare pe dealul de deasupra centrului. Fiecare oferă panoramă diferită asupra Pieții Sfatului și a orașului vechi.",
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
      "description": "Cetățuia Brașovului (sec. XVI) e pe Dealul Straja, înconjurată de pădure. Punct de refugiu medieval. Panoramă spectaculoasă asupra orașului.",
      "address": "Str. Cetății (urcare pe deal), Brașov",
      "coordinates": { "lat": 45.6539, "lng": 25.5925 },
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
      "description": "Dealul Melcilor e locul unde brașovenii vin să vadă apusul. Potecă ușoară de 15-20 min, panoramă largă asupra orașului și munților.",
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
      "shortDescription": "Plambare la poalele muntelui cu vedere spre pădure – aer curat, căprioare, liniște.",
      "description": "Parcul Sub Tâmpa e la baza muntelui. Alei prin pădure, bănci cu vedere, aer curat de munte. Dimineața poți vedea căprioare.",
      "address": "Aleea Tiberiu Brediceanu, Brașov",
      "coordinates": { "lat": 45.6427, "lng": 25.5905 },
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
      "description": "Brașovul are mai multe murale contemporane pe fațadele clădirilor din centrul vechi. Artiști locali și internaționali au transformat pereții în galerii în aer liber.",
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
      "description": "Strada Postăvarului și împrejurimile sunt zona cea mai artsy din Brașov. Cafeneaua Tipografia, galerii de artă, decoruri creative pe fațade.",
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
      "description": "Brașovul are o scenă artistică activă. Galeria de Artă din Bastionul Țesătorilor, Keys Coffee & Lounge, Poarta Ecaterina (expoziții temporare).",
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
      "description": "Cartierele Șchei și Prund au primit în ultimii ani intervenții de artă urbană. Murale pe case vechi, instalații creative, graffiti artistic pe garduri.",
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
      "description": "Sinagoga Neologă (1899-1901) pe Poarta Schei 29 – stil neogotic cu elemente maure. Sinagoga de pe Castelului 64 (1924) – stil eclectic cu mozaic ceramic.",
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
      "shortDescription": "Traseu lung de artă urbană: de la Tipografia prin centru, Șchei, Prund.",
      "description": "Traseul complet de artă urbană leagă zona Tipografia de centrul vechi, Poarta Schei, cartierul Prund și Șchei. Include murale, instalații, galerii.",
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
tree["plimbari"] = plimbari_category
print("[OK] Loaded and injected Plimbari category")

# 4. Inject corrected EXPERIENTE category matching weekend.component.ts questions exactly
experiente_category = {
  "categoryId": "experiente",
  "categoryLabel": "Experiențe",
  "categoryIcon": "star",
  "questions": [
    {
      "id": "q1",
      "text": "Ce tip de experiență?",
      "options": [
        { "id": "a", "label": "Aventură", "icon": "hiking" },
        { "id": "b", "label": "Relaxare", "icon": "spa" },
        { "id": "c", "label": "Culturală", "icon": "theater_comedy" },
        { "id": "d", "label": "Gastronomică", "icon": "dinner_dining" }
      ]
    },
    {
      "id": "q2",
      "text": "Care e bugetul?",
      "options": [
        { "id": "a", "label": "Gratuit", "icon": "money_off" },
        { "id": "b", "label": "Sub 100 lei", "icon": "attach_money" },
        { "id": "c", "label": "Peste 100 lei", "icon": "paid" }
      ]
    },
    {
      "id": "q3",
      "text": "Preferi ceva?",
      "options": [
        { "id": "a", "label": "Unic și necunoscut", "icon": "auto_awesome" },
        { "id": "b", "label": "Popular dar merită", "icon": "trending_up" },
        { "id": "c", "label": "Off the beaten path", "icon": "map" }
      ]
    }
  ],
  "places": {
    "canionul_7_scari": {
      "id": "canionul_7_scari",
      "name": "Canionul 7 Scări și Tiroliana",
      "shortDescription": "Defileu spectaculos cu 9 scări metalice + tiroliană de 4 km.",
      "description": "Canionul 7 Scări este printre cele mai cunoscute atracții de aventură de lângă Brașov. Defileu îngust de 160 m cu scări metalice și cascade superbe.",
      "address": "Dâmbul Morii, Săcele",
      "coordinates": { "lat": 45.5820, "lng": 25.6380 },
      "tip": "Ia bani cash pentru brățara de acces (20 lei) și tiroliană (120 lei).",
      "image": "canionul_7_scari.jpg"
    },
    "parcul_aventura": {
      "id": "parcul_aventura",
      "name": "Parcul Aventura Brașov",
      "shortDescription": "Trasee suspendate în copaci și tiroliene în zona lacului Noua.",
      "description": "Cel mai mare parc de aventură din România, cu trasee de diverse dificultăți în copaci, perfect pentru grupuri, cupluri sau familii.",
      "address": "Str. Brazilor (lângă Lacul Noua)",
      "coordinates": { "lat": 45.6290, "lng": 25.6080 },
      "tip": "Ia mănuși speciale de bicicletă sau cumpără de la recepție pentru confort maxim pe cabluri.",
      "image": "parcul_aventura.jpg"
    },
    "drumete_tampa": {
      "id": "drumete_tampa",
      "name": "Drumeție pe Tâmpa",
      "shortDescription": "Urcuș prin pădure până pe vârful Tâmpei pentru o panoramă magnifică.",
      "description": "O drumeție clasică brașoveană pe muntele din inima orașului, până la faimosul panou cu literele BRAȘOV și o vedere de vis.",
      "address": "Parcul Sub Tâmpa (punct de start)",
      "coordinates": { "lat": 45.6400, "lng": 25.5890 },
      "tip": "Alege aleea de sub Tâmpa la coborâre pentru o perspectivă pitorească și aer curat.",
      "image": "drumete_tampa.jpg"
    },
    "drumete_postavarul": {
      "id": "drumete_postavarul",
      "name": "Drumeție Vârful Postăvarul – 1799 m",
      "shortDescription": "Urcuș spre cel mai înalt punct din zonă cu popas la cabană.",
      "description": "O drumeție montană completă pornind din Poiana Brașov. Traseul este marcat excelent și oferă panorame uimitoare la vârf.",
      "address": "Baza Partie Bradul (start), Poiana Brașov",
      "coordinates": { "lat": 45.5890, "lng": 25.5490 },
      "tip": "Merită să oprești la cabana Postăvarul pentru un ceai cald și faimosul desert de munte.",
      "image": "drumete_postavarul.jpg"
    },
    "escalada_solomon": {
      "id": "escalada_solomon",
      "name": "Escaladă sportivă la Pietrele lui Solomon",
      "shortDescription": "Pereți de stâncă pentru alpinism și escaladă.",
      "description": "Unul dintre cele mai vechi și faimoase sectoare de escaladă sportivă de lângă Brașov, cu trasee variate pentru orice nivel.",
      "address": "Pietrele lui Solomon, Șchei",
      "coordinates": { "lat": 45.5995, "lng": 25.5575 },
      "tip": "Pentru siguranță maximă și ghidaj profesionist, contactează un instructor local de alpinism.",
      "image": "escalada_solomon.jpg"
    },
    "atv_poiana": {
      "id": "atv_poiana",
      "name": "Ture cu ATV-uri în Poiana Brașov",
      "shortDescription": "Explorare off-road prin pădurile și culmile din Poiană.",
      "description": "O experiență ghidată cu vehicule ATV, ideală pentru pasionații de adrenalină și explorare în aer curat de munte.",
      "address": "Poiana Brașov",
      "coordinates": { "lat": 45.5930, "lng": 25.5560 },
      "tip": "Ia haine groase impermeabile – la înălțime vremea este mereu mai răcoroasă.",
      "image": "atv_poiana.jpg"
    },
    "biciclete_poiana": {
      "id": "biciclete_poiana",
      "name": "Ture cu E-Bike în Poiana Brașov",
      "shortDescription": "Biciclete electrice pe trasee montane superbe.",
      "description": "Închiriază o bicicletă electrică și explorează drumurile forestiere din jurul stațiunii cu un efort minim și bucurie maximă.",
      "address": "Centru de închiriere Poiana Brașov",
      "coordinates": { "lat": 45.5925, "lng": 25.5555 },
      "tip": "Solicită la recepție harta cu traseele de mountain bike din masivul Postăvarul.",
      "image": "biciclete_poiana.jpg"
    },
    "parapanta": {
      "id": "parapanta",
      "name": "Zbor cu Parapanta în Tandem",
      "shortDescription": "Adrenalină pură lansându-te în zbor din masivul Postăvarul.",
      "description": "Zboară deasupra Brașovului și a Poienii cu instructori autorizați, o experiență de neuitat în condiții de maximă siguranță.",
      "address": "Masivul Postăvarul (lansare)",
      "coordinates": { "lat": 45.5910, "lng": 25.5530 },
      "tip": "Zborurile depind 100% de condițiile meteo. Rezervă din timp cu posibilitate de reprogramare.",
      "image": "parapanta.jpg"
    },
    "lacul_noua_picnic": {
      "id": "lacul_noua_picnic",
      "name": "Relaxare și picnic la Lacul Noua",
      "shortDescription": "Oază de verdeață în cartierul Noua, cu bărci pe lac și spații verzi.",
      "description": "Zona perfectă pentru picnic pe iarbă sub umbra pădurii. Lacul oferă plimbări plăcute cu bărci sau hidrobiciclete.",
      "address": "Cartier Noua, Brașov",
      "coordinates": { "lat": 45.6250, "lng": 25.6010 },
      "tip": "Weekend-ul este foarte aglomerat. Alege o după-amiază în timpul săptămânii pentru o liniște totală.",
      "image": "lacul_noua_picnic.jpg"
    },
    "parcul_central_relaxare": {
      "id": "parcul_central_relaxare",
      "name": "Plimbare în Parcul Titulescu (Central)",
      "shortDescription": "Cel mai mare parc central urban, amenajat cu spații verzi mari.",
      "description": "Locul clasic de plimbare, cu alei largi umbroase, bănci, ronduri florale și o fântână arteziană centrală splendidă.",
      "address": "Bulevardul Eroilor, Brașov",
      "coordinates": { "lat": 45.6512, "lng": 25.6090 },
      "tip": "Parcul este situat ideal chiar la intrarea în centrul pietonal istoric al orașului.",
      "image": "parcul_central_relaxare.jpg"
    },
    "sub_tampa_relaxare": {
      "id": "sub_tampa_relaxare",
      "name": "Plimbare pe Aleea Tiberiu Brediceanu",
      "shortDescription": "Poteca de sub Tâmpa cu aer extrem de curat și liniște.",
      "description": "O alee complet pietonală chiar la baza muntelui. Perfectă pentru o plimbare liniștită departe de zgomotul străzilor.",
      "address": "Aleea Tiberiu Brediceanu, Brașov",
      "coordinates": { "lat": 45.6410, "lng": 25.5895 },
      "tip": "La orele dimineții ai cele mai mari șanse să surprinzi veverițe jucăușe în coronament.",
      "image": "sub_tampa_relaxare.jpg"
    },
    "spa_hotel": {
      "id": "spa_hotel",
      "name": "Centru SPA & Wellness Premium",
      "shortDescription": "Relaxare completă cu piscine încălzite, saune și servicii masaj.",
      "description": "Experimentează relaxarea absolută într-un SPA de hotel de 5 stele (ex. Radisson Blu sau în Poiana Brașov), ideale pentru refacere.",
      "address": "Bulevardul Eroilor / Poiana Brașov",
      "coordinates": { "lat": 45.6450, "lng": 25.5920 },
      "tip": "Rezervă terapiile și masajele cu cel puțin 24 de ore înainte pentru garantarea locului.",
      "image": "spa_hotel.jpg"
    },
    "degustare_vin_relaxare": {
      "id": "degustare_vin_relaxare",
      "name": "Juno Wine Garden & Terroirs",
      "shortDescription": "Terase elegante cu selecție rafinată de vinuri și ambianță liniștită.",
      "description": "O oază ascunsă ideală pentru pasionații de vinuri. Ambianță elegantă, lumină caldă caldă de apus și muzică fină în fundal.",
      "address": "Aleea După Ziduri, Brașov",
      "coordinates": { "lat": 45.6435, "lng": 25.5910 },
      "tip": "Juno are o grădină superbă chiar sub zidurile vechi, luminată feeric la lăsarea serii.",
      "image": "degustare_vin_relaxare.jpg"
    },
    "yoga_natura": {
      "id": "yoga_natura",
      "name": "Sesiuni de Meditație și Yoga Sub Tâmpa",
      "shortDescription": "Sesiuni relaxante de meditație ghidată în mijlocul naturii.",
      "description": "Organizate frecvent în parcul de sub Tâmpa, aceste ședințe aduc un plus de echilibru și aer curat în weekend.",
      "address": "Aleea Tiberiu Brediceanu (parc)",
      "coordinates": { "lat": 45.6400, "lng": 25.5890 },
      "tip": "Urmărește grupurile locale de wellness pe rețelele sociale pentru programul de weekend.",
      "image": "yoga_natura.jpg"
    },
    "telecabina_panoramic": {
      "id": "telecabina_panoramic",
      "name": "Telecabina Tâmpa și Terasa Panoramic",
      "shortDescription": "Urcare rapidă cu telecabina și relaxare la terasa de sus.",
      "description": "O modalitate relaxantă de a ajunge la 960 m în doar 3 minute, urmată de o cafea pe terasa de sub vârf.",
      "address": "Aleea Tiberiu Brediceanu, Brașov",
      "coordinates": { "lat": 45.6415, "lng": 25.5895 },
      "tip": "Restaurantul de la vârf oferă o perspectivă splendidă la apus asupra întregului oraș.",
      "image": "telecabina_panoramic.jpg"
    },
    "biserica_neagra_vizita": {
      "id": "biserica_neagra_vizita",
      "name": "Vizită la Biserica Neagră",
      "shortDescription": "Simbolul gotic al Brașovului cu o istorie fascinantă.",
      "description": "Explorează uimitorul interior gotic, tezaurul unic de covoare orientale și ascultă orga imensă Buchholz cu 4000 de tuburi.",
      "address": "Curtea Johannes Honterus, Brașov",
      "coordinates": { "lat": 45.6413, "lng": 25.5878 },
      "tip": "Vara sunt organizate concerte de orgă în fiecare marți și joi seara. Merită din plin!",
      "image": "biserica_neagra_vizita.jpg"
    },
    "muzeu_istorie": {
      "id": "muzeu_istorie",
      "name": "Muzeul Județean de Istorie",
      "shortDescription": "Găzduit în Turnul Casei Sfatului, inima istorică a orașului.",
      "description": "Colecții arheologice și exponate ce relatează întreaga poveste a burgului săsesc Kronstadt de-a lungul secolelor.",
      "address": "Piața Sfatului, Brașov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "tip": "Biletul de acces este extrem de accesibil și oferă acces la expoziții pe 3 nivele.",
      "image": "muzeu_istorie.jpg"
    },
    "prima_scoala": {
      "id": "prima_scoala",
      "name": "Prima Școală Românească",
      "shortDescription": "Locul de naștere al tipăriturilor în limba română din Șchei.",
      "description": "Muzeu istoric unic unde diaconul Coresi a tipărit primele cărți în limba română, într-un decor medieval extrem de bine păstrat.",
      "address": "Piața Unirii nr. 2, Brașov",
      "coordinates": { "lat": 45.6378, "lng": 25.5848 },
      "tip": "Cere un ghidaj scurt de la curator – povestește cu mult umor și detalii fascinante.",
      "image": "prima_scoala.jpg"
    },
    "tur_ghidat": {
      "id": "tur_ghidat",
      "name": "Tur Pietonal Ghidat – Brașov Walk",
      "shortDescription": "Descoperă secretele cetății alături de un ghid local pasionat.",
      "description": "Un traseu de 2 ore prin istoria, legendele și fortificațiile medievale ale orașului. Ideal pentru a înțelege spiritul locului.",
      "address": "Piața Sfatului (start)",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "tip": "Poți opta pentru Free Walking Tour (pe bază de donații) organizat zilnic la ora 18:00.",
      "image": "tur_ghidat.jpg"
    },
    "piata_sfatului_liber": {
      "id": "piata_sfatului_liber",
      "name": "Plimbare liberă prin Piața Sfatului",
      "shortDescription": "Zona pietonală istorică înconjurată de clădiri pastelate superbe.",
      "description": "Centrul vieții sociale brașovene, mărginit de terase animate, fântâna cu porumbei și superba fațadă a Casei Sfatului.",
      "address": "Piața Sfatului, Brașov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "tip": "Așază-te pe o bancă lângă fântână la orele amurgului pentru cea mai frumoasă lumină din oraș.",
      "image": "piata_sfatului_liber.jpg"
    },
    "bastionul_tesatorilor": {
      "id": "bastionul_tesatorilor",
      "name": "Bastionul Țesătorilor",
      "shortDescription": "Fascinantă fortificație medievală cu galerii pe 4 nivele din lemn.",
      "description": "Cel mai bine conservat bastion al cetății, găzduiește macheta de mari dimensiuni a Brașovului medieval din anul 1896.",
      "address": "Str. George Coșbuc, Brașov",
      "coordinates": { "lat": 45.6405, "lng": 25.5855 },
      "tip": "Macheta îți va dezvălui cum arăta fiecare turn și poartă pe care le explorezi pe jos.",
      "image": "bastionul_tesatorilor.jpg"
    },
    "scheii_brasovului_tur": {
      "id": "scheii_brasovului_tur",
      "name": "Explorare în cartierul istoric Șchei",
      "shortDescription": "Străduțe înguste din piatră cu iz de sat de munte autentic.",
      "description": "O plimbare pe străzile pitorești cu case vechi românești ce urcă spre poalele munților, dincolo de porțile cetății.",
      "address": "Piața Unirii, Brașov",
      "coordinates": { "lat": 45.6380, "lng": 25.5850 },
      "tip": "Strada Pe Tocile are pante abrupte și cele mai frumoase porți vechi din cartier.",
      "image": "scheii_brasovului_tur.jpg"
    },
    "sergiana_experienta": {
      "id": "sergiana_experienta",
      "name": "Prânz tradițional la Sergiana",
      "shortDescription": "Cele mai cunoscute preparate tradiționale ardelenești sub arcade din cărămidă.",
      "description": "Celebru pentru ospitalitatea ardelenească, pâinea proaspătă cu untură și jumări din partea casei și mâncărurile cu sos.",
      "address": "Str. Mureșenilor nr. 28, Brașov",
      "coordinates": { "lat": 45.6420, "lng": 25.5890 },
      "tip": "Rezervă neapărat o masă în weekend! Porțiile sunt extrem de generoase.",
      "image": "sergiana_experienta.jpg"
    },
    "street_food_tour": {
      "id": "street_food_tour",
      "name": "Casual Street Food în Centru",
      "shortDescription": "Tur gastronomic urban cu opriri la covrigării celebre și pizza pe felie.",
      "description": "De la renumitele produse calde de la MOA la pizza aburindă pe felie din centrul vechi, ideale pentru o pauză rapidă.",
      "address": "Strada Republicii, Brașov",
      "coordinates": { "lat": 45.6430, "lng": 25.5890 },
      "tip": "Încearcă gogoșile secuiești sau kurtos kalacs calzi de la tarabele tradiționale.",
      "image": "street_food_tour.jpg"
    },
    "food_market_piata": {
      "id": "food_market_piata",
      "name": "Piața Locală Agroalimentară Star",
      "shortDescription": "Branzeturi artizanale de munte, legume și fructe din grădinile locale.",
      "description": "Locul perfect pentru a interacționa cu producătorii locali și a degusta celebra brânză de burduf în coajă de brad.",
      "address": "Strada Nicolae Bălcescu, Brașov",
      "coordinates": { "lat": 45.6450, "lng": 25.5930 },
      "tip": "Alege zona producătorilor tradiționali din spate pentru specialitățile cele mai autentice.",
      "image": "food_market_piata.jpg"
    },
    "wine_tasting": {
      "id": "wine_tasting",
      "name": "Degustare Premium de Vinuri la Terroirs",
      "shortDescription": "Degustare ghidată de vinuri românești de înaltă clasă cu platou asociat.",
      "description": "Un wine bar extrem de cochet cu sommelieri experimentați gata să îți prezinte vinurile românești valoroase într-o seară relaxantă.",
      "address": "Strada Diaconu Coresi, Brașov",
      "coordinates": { "lat": 45.6435, "lng": 25.5910 },
      "tip": "Lăsați-vă pe mâna sommelierului pentru asocierile perfecte de brânzeturi transilvănene.",
      "image": "wine_tasting.jpg"
    },
    "cooking_class": {
      "id": "cooking_class",
      "name": "Atelier de Gătit Cozonac și Papanasi",
      "shortDescription": "Învață să prepari deserturile de referință alături de bucătari locali.",
      "description": "O experiență gastronomică interactivă și extrem de distractivă pentru grupuri mici sau cupluri în inima veche a orașului.",
      "address": "Strada Mureșenilor (studio)",
      "coordinates": { "lat": 45.6430, "lng": 25.5890 },
      "tip": "Include o sesiune de cină la finalul căreia savurezi preparatul propriu alături de un pahar de vin.",
      "image": "cooking_class.jpg"
    },
    "brunch_premium": {
      "id": "brunch_premium",
      "name": "Brunch Specialty la Opus 9",
      "shortDescription": "Cafea de origine remarcabilă și preparate gourmet de mic dejun.",
      "description": "Opus 9 din Piața Enescu oferă cel mai elegant brunch urban, renumit pentru ouăle sale Benedict spectaculoase și ambianța scandinavă.",
      "address": "Piața George Enescu nr. 9, Brașov",
      "coordinates": { "lat": 45.6423, "lng": 25.5870 },
      "tip": "Terasa din Piața Enescu este o adevărată comoară liniștită în diminețile însorite.",
      "image": "brunch_premium.jpg"
    },
    "degustare_mesendorf": {
      "id": "degustare_mesendorf",
      "name": "Brunch rural la Meșendorf 65",
      "shortDescription": "Experiență slow-food premium într-o superbă gospodărie săsească restaurată.",
      "description": "La Meșendorf, în afara Brașovului, trăiești magia satului transilvănean cu brânzeturi artizanale mature fabuloase și bucate curate.",
      "address": "Meșendorf nr. 65, Bunești",
      "coordinates": { "lat": 46.1050, "lng": 25.2100 },
      "tip": "Este necesară programarea cu câteva zile înainte pe platformele de turism rural local (Travlocals).",
      "image": "degustare_mesendorf.jpg"
    }
  },
  "results": {
    "a-a-a": { "combination": { "q1": "Aventură", "q2": "Gratuit", "q3": "Unic și necunoscut" }, "recommendations": ["drumete_tampa", "drumete_postavarul", "biciclete_poiana"] },
    "a-a-b": { "combination": { "q1": "Aventură", "q2": "Gratuit", "q3": "Popular dar merită" }, "recommendations": ["drumete_tampa", "drumete_postavarul", "biciclete_poiana"] },
    "a-a-c": { "combination": { "q1": "Aventură", "q2": "Gratuit", "q3": "Off the beaten path" }, "recommendations": ["drumete_tampa", "drumete_postavarul", "biciclete_poiana"] },
    
    "a-b-a": { "combination": { "q1": "Aventură", "q2": "Sub 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["canionul_7_scari", "parcul_aventura", "biciclete_poiana"] },
    "a-b-b": { "combination": { "q1": "Aventură", "q2": "Sub 100 lei", "q3": "Popular dar merită" }, "recommendations": ["parcul_aventura", "canionul_7_scari", "biciclete_poiana"] },
    "a-b-c": { "combination": { "q1": "Aventură", "q2": "Sub 100 lei", "q3": "Off the beaten path" }, "recommendations": ["canionul_7_scari", "biciclete_poiana", "parcul_aventura"] },
    
    "a-c-a": { "combination": { "q1": "Aventură", "q2": "Peste 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["escalada_solomon", "parapanta", "atv_poiana"] },
    "a-c-b": { "combination": { "q1": "Aventură", "q2": "Peste 100 lei", "q3": "Popular dar merită" }, "recommendations": ["parapanta", "atv_poiana", "escalada_solomon"] },
    "a-c-c": { "combination": { "q1": "Aventură", "q2": "Peste 100 lei", "q3": "Off the beaten path" }, "recommendations": ["atv_poiana", "escalada_solomon", "parapanta"] },

    "b-a-a": { "combination": { "q1": "Relaxare", "q2": "Gratuit", "q3": "Unic și necunoscut" }, "recommendations": ["sub_tampa_relaxare", "lacul_noua_picnic", "parcul_central_relaxare"] },
    "b-a-b": { "combination": { "q1": "Relaxare", "q2": "Gratuit", "q3": "Popular dar merită" }, "recommendations": ["parcul_central_relaxare", "lacul_noua_picnic", "sub_tampa_relaxare"] },
    "b-a-c": { "combination": { "q1": "Relaxare", "q2": "Gratuit", "q3": "Off the beaten path" }, "recommendations": ["sub_tampa_relaxare", "lacul_noua_picnic", "parcul_central_relaxare"] },
    
    "b-b-a": { "combination": { "q1": "Relaxare", "q2": "Sub 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["yoga_natura", "telecabina_panoramic", "lacul_noua_picnic"] },
    "b-b-b": { "combination": { "q1": "Relaxare", "q2": "Sub 100 lei", "q3": "Popular dar merită" }, "recommendations": ["telecabina_panoramic", "yoga_natura", "lacul_noua_picnic"] },
    "b-b-c": { "combination": { "q1": "Relaxare", "q2": "Sub 100 lei", "q3": "Off the beaten path" }, "recommendations": ["yoga_natura", "telecabina_panoramic", "lacul_noua_picnic"] },
    
    "b-c-a": { "combination": { "q1": "Relaxare", "q2": "Peste 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["degustare_vin_relaxare", "spa_hotel", "telecabina_panoramic"] },
    "b-c-b": { "combination": { "q1": "Relaxare", "q2": "Peste 100 lei", "q3": "Popular dar merită" }, "recommendations": ["spa_hotel", "degustare_vin_relaxare", "telecabina_panoramic"] },
    "b-c-c": { "combination": { "q1": "Relaxare", "q2": "Peste 100 lei", "q3": "Off the beaten path" }, "recommendations": ["degustare_vin_relaxare", "spa_hotel", "telecabina_panoramic"] },

    "c-a-a": { "combination": { "q1": "Culturală", "q2": "Gratuit", "q3": "Unic și necunoscut" }, "recommendations": ["scheii_brasovului_tur", "piata_sfatului_liber", "bastionul_tesatorilor"] },
    "c-a-b": { "combination": { "q1": "Culturală", "q2": "Gratuit", "q3": "Popular dar merită" }, "recommendations": ["piata_sfatului_liber", "scheii_brasovului_tur", "bastionul_tesatorilor"] },
    "c-a-c": { "combination": { "q1": "Culturală", "q2": "Gratuit", "q3": "Off the beaten path" }, "recommendations": ["scheii_brasovului_tur", "piata_sfatului_liber", "bastionul_tesatorilor"] },
    
    "c-b-a": { "combination": { "q1": "Culturală", "q2": "Sub 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["prima_scoala", "bastionul_tesatorilor", "muzeu_istorie"] },
    "c-b-b": { "combination": { "q1": "Culturală", "q2": "Sub 100 lei", "q3": "Popular dar merită" }, "recommendations": ["biserica_neagra_vizita", "muzeu_istorie", "bastionul_tesatorilor"] },
    "c-b-c": { "combination": { "q1": "Culturală", "q2": "Sub 100 lei", "q3": "Off the beaten path" }, "recommendations": ["prima_scoala", "bastionul_tesatorilor", "biserica_neagra_vizita"] },
    
    "c-c-a": { "combination": { "q1": "Culturală", "q2": "Peste 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["tur_ghidat", "biserica_neagra_vizita", "muzeu_istorie"] },
    "c-c-b": { "combination": { "q1": "Culturală", "q2": "Peste 100 lei", "q3": "Popular dar merită" }, "recommendations": ["tur_ghidat", "biserica_neagra_vizita", "muzeu_istorie"] },
    "c-c-c": { "combination": { "q1": "Culturală", "q2": "Peste 100 lei", "q3": "Off the beaten path" }, "recommendations": ["tur_ghidat", "biserica_neagra_vizita", "muzeu_istorie"] },

    "d-a-a": { "combination": { "q1": "Gastronomică", "q2": "Gratuit", "q3": "Unic și necunoscut" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    "d-a-b": { "combination": { "q1": "Gastronomică", "q2": "Gratuit", "q3": "Popular dar merită" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    "d-a-c": { "combination": { "q1": "Gastronomică", "q2": "Gratuit", "q3": "Off the beaten path" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    
    "d-b-a": { "combination": { "q1": "Gastronomică", "q2": "Sub 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["brunch_premium", "street_food_tour", "sergiana_experienta"] },
    "d-b-b": { "combination": { "q1": "Gastronomică", "q2": "Sub 100 lei", "q3": "Popular dar merită" }, "recommendations": ["sergiana_experienta", "brunch_premium", "street_food_tour"] },
    "d-b-c": { "combination": { "q1": "Gastronomică", "q2": "Sub 100 lei", "q3": "Off the beaten path" }, "recommendations": ["street_food_tour", "sergiana_experienta", "brunch_premium"] },
    
    "d-c-a": { "combination": { "q1": "Gastronomică", "q2": "Peste 100 lei", "q3": "Unic și necunoscut" }, "recommendations": ["degustare_mesendorf", "wine_tasting", "cooking_class"] },
    "d-c-b": { "combination": { "q1": "Gastronomică", "q2": "Peste 100 lei", "q3": "Popular dar merită" }, "recommendations": ["wine_tasting", "cooking_class", "degustare_mesendorf"] },
    "d-c-c": { "combination": { "q1": "Gastronomică", "q2": "Peste 100 lei", "q3": "Off the beaten path" }, "recommendations": ["cooking_class", "degustare_mesendorf", "wine_tasting"] }
  }
}
tree["experiente"] = experiente_category
print("[OK] Loaded and injected Experiente category")

# 5. Build and inject fully offline ARTA (Artă și istorie) category matching weekend.component.ts questions exactly
arta_category = {
  "categoryId": "arta",
  "categoryLabel": "Artă și istorie",
  "categoryIcon": "museum",
  "questions": [
    {
      "id": "q1",
      "text": "Ce te interesează?",
      "options": [
        { "id": "a", "label": "Muzee", "icon": "account_balance" },
        { "id": "b", "label": "Clădiri istorice", "icon": "castle" },
        { "id": "c", "label": "Galerii de artă", "icon": "palette" }
      ]
    },
    {
      "id": "q2",
      "text": "Cum preferi să explorezi?",
      "options": [
        { "id": "a", "label": "Cu ghid", "icon": "record_voice_over" },
        { "id": "b", "label": "Singur", "icon": "person" },
        { "id": "c", "label": "Cu audioghid", "icon": "headset" }
      ]
    },
    {
      "id": "q3",
      "text": "Care e bugetul?",
      "options": [
        { "id": "a", "label": "Gratuit", "icon": "volunteer_activism" },
        { "id": "b", "label": "Până la 30 lei", "icon": "payments" },
        { "id": "c", "label": "Peste 30 lei", "icon": "savings" }
      ]
    }
  ],
  "places": {
    "biserica_neagra": {
      "id": "biserica_neagra",
      "name": "Biserica Neagră",
      "shortDescription": "Cea mai mare biserică gotică din SE Europei – istorie de 600+ ani și covoare anatoliene.",
      "description": "O capodoperă a stilului gotic în inima Brașovului. Interior monumental, cea mai mare colecție de covoare orientale din Europa și o orgă imensă faimoasă.",
      "address": "Curtea Johannes Honterus, Brașov",
      "coordinates": { "lat": 45.6413, "lng": 25.5878 },
      "tip": "Biletul de acces include broșuri explicative detaliate pentru autoghidare.",
      "image": "biserica_neagra.jpg"
    },
    "prima_scoala": {
      "id": "prima_scoala",
      "name": "Prima Școală Românească",
      "shortDescription": "Vatra culturii și tipăriturilor în limba română în Șchei.",
      "description": "Clădirea istorică din curtea bisericii Sf. Nicolae găzduiește manuscrise, cărți vechi și tiparnița diaconului Coresi.",
      "address": "Piața Unirii nr. 2, Brașov",
      "coordinates": { "lat": 45.6378, "lng": 25.5848 },
      "tip": "Intrarea se bazează pe o mică donație recomandată la fața locului.",
      "image": "prima_scoala.jpg"
    },
    "muzeu_istorie": {
      "id": "muzeu_istorie",
      "name": "Muzeul Județean de Istorie (Casa Sfatului)",
      "shortDescription": "Istoria Brașovului de la origini în turnul emblematic.",
      "description": "Găzduit de Casa Sfatului, muzeul prezintă evoluția socială și politică a vechiului Kronstadt prin piese rare de arheologie și bresle.",
      "address": "Piața Sfatului, Brașov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "tip": "Biletul este sub 15 lei pentru adulți. Puteți admira expozițiile pe mai multe etaje.",
      "image": "muzeu_istorie.jpg"
    },
    "muzeu_arta": {
      "id": "muzeu_arta",
      "name": "Muzeul de Artă Brașov",
      "shortDescription": "Colecții valoroase de pictură și sculptură românească modernă.",
      "description": "Adăpostește opere excepționale ale marilor maeștri români (Grigorescu, Tonitza, Pallady) și organizează expoziții temporare contemporane.",
      "address": "Bulevardul Eroilor nr. 21, Brașov",
      "coordinates": { "lat": 45.6444, "lng": 25.5947 },
      "tip": "Situat perfect chiar lângă parcul central – o oprire excelentă înainte de plimbare.",
      "image": "muzeu_arta.jpg"
    },
    "bastionul_tesatorilor": {
      "id": "bastionul_tesatorilor",
      "name": "Bastionul Țesătorilor",
      "shortDescription": "Fascinant monument de fortificație medievală cu galerii din lemn.",
      "description": "Turn de apărare excelent conservat, cu arhitectură unică și o remarcabilă machetă a vechii cetăți a Brașovului.",
      "address": "Strada George Coșbuc, Brașov",
      "coordinates": { "lat": 45.6405, "lng": 25.5855 },
      "tip": "Macheta reprezintă o resursă excelentă de orientare istorică asupra zidurilor cetății.",
      "image": "bastionul_tesatorilor.jpg"
    },
    "turnul_alb": {
      "id": "turnul_alb",
      "name": "Turnul Alb",
      "shortDescription": "Bastion medieval pe deal, oferind cea mai frumoasă vedere peste cetate.",
      "description": "Un superb turn alb de apărare construit în sec. XV, accesibil printr-o scurtă potecă pitorească de pe deal.",
      "address": "Aleea După Ziduri, Brașov",
      "coordinates": { "lat": 45.6430, "lng": 25.5870 },
      "tip": "Accesul la exterior și potecă este gratuit, ideal pentru o sesiune foto panoramică la apus.",
      "image": "turnul_alb.jpg"
    },
    "sinagoga_neologa": {
      "id": "sinagoga_neologa",
      "name": "Sinagoga Neologă Brașov",
      "shortDescription": "Splendid monument arhitectural neogotic cu elemente maure.",
      "description": "Construită la începutul secolului XX, are fațade de cărămidă spectaculoase și o amenajare interioară eclectică de o mare frumusețe.",
      "address": "Strada Poarta Șchei nr. 29, Brașov",
      "coordinates": { "lat": 45.6408, "lng": 25.5878 },
      "tip": "Fațada clădirii reprezintă un detaliu de design extrem de apreciat de pasionați.",
      "image": "sinagoga_neologa.jpg"
    },
    "muzeu_etnografie": {
      "id": "muzeu_etnografie",
      "name": "Muzeul de Etnografie Brașov",
      "shortDescription": "Tezaur de porturi populare și obiceiuri din Țara Bârsei.",
      "description": "Expoziții dedicate portului tradițional, țesăturilor de casă și stilului de viață rural din zona din jurul Brașovului.",
      "address": "Bulevardul Eroilor nr. 21A, Brașov",
      "coordinates": { "lat": 45.6443, "lng": 25.5945 },
      "tip": "Muzeul organizează frecvent mici ateliere și târguri tematice în curtea interioară.",
      "image": "muzeu_etnografie.jpg"
    }
  },
  "results": {}
}

# Populate Arta results automatically for all combinations
q1_opts = ["a", "b", "c"] # Muzee, Cladiri, Galerii
q2_opts = ["a", "b", "c"] # Cu ghid, Singur, Audioghid
q3_opts = ["a", "b", "c"] # Gratuit, Sub 30, Peste 30

for q1 in q1_opts:
    for q2 in q2_opts:
        for q3 in q3_opts:
            key = f"{q1}-{q2}-{q3}"
            
            # Map recommendations based on preferences
            recs = []
            if q1 == "a": # Muzee
                if q3 == "a": recs = ["prima_scoala", "muzeu_istorie", "bastionul_tesatorilor"]
                elif q3 == "b": recs = ["muzeu_istorie", "muzeu_arta", "muzeu_etnografie"]
                else: recs = ["biserica_neagra", "muzeu_istorie", "muzeu_arta"]
            elif q1 == "b": # Cladiri
                if q3 == "a": recs = ["turnul_alb", "sinagoga_neologa", "bastionul_tesatorilor"]
                elif q3 == "b": recs = ["bastionul_tesatorilor", "sinagoga_neologa", "turnul_alb"]
                else: recs = ["biserica_neagra", "sinagoga_neologa", "bastionul_tesatorilor"]
            else: # Galerii
                if q3 == "a": recs = ["turnul_alb", "muzeu_arta", "bastionul_tesatorilor"]
                elif q3 == "b": recs = ["muzeu_arta", "muzeu_etnografie", "turnul_alb"]
                else: recs = ["muzeu_arta", "biserica_neagra", "muzeu_etnografie"]
                
            arta_category["results"][key] = {
                "combination": {
                    "q1": "Muzee" if q1 == "a" else ("Clădiri istorice" if q1 == "b" else "Galerii de artă"),
                    "q2": "Cu ghid" if q2 == "a" else ("Singur" if q2 == "b" else "Cu audioghid"),
                    "q3": "Gratuit" if q3 == "a" else ("Până la 30 lei" if q3 == "b" else "Peste 30 lei")
                },
                "recommendations": recs
            }

tree["arta"] = arta_category
print(f"[OK] Rebuilt and injected Arta category with {len(arta_category['results'])} combinations")

# Save final decision tree back to both paths (public/ and dist/)
with open(tree_path, "w", encoding="utf-8") as f:
    json.dump(tree, f, indent=2, ensure_ascii=False)
print(f"[SUCCESS] Wrote updated tree to {tree_path}")

dist_path = r"c:\Users\user\Desktop\SmartCity\dist\smart-city-brasov\browser\decision_tree.json"
if os.path.exists(os.path.dirname(dist_path)):
    with open(dist_path, "w", encoding="utf-8") as f:
        json.dump(tree, f, indent=2, ensure_ascii=False)
    print(f"[SUCCESS] Copied to dist: {dist_path}")

print("✨ All weekend recommendation categories are now fully offline and localized with coordinates!")

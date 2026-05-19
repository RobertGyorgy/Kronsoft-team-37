import json

tree_path = r"c:\Users\user\Desktop\SmartCity\public\decision_tree.json"

# 1. Read existing decision tree
with open(tree_path, "r", encoding="utf-8") as f:
    tree = json.load(f)

# 2. Build the category structure directly as a Python dict
experiente_category = {
  "categoryId": "experiente",
  "categoryLabel": "Experiențe",
  "categoryIcon": "star",
  "questions": [
    {
      "id": "q1",
      "text": "Ce tip de experienta?",
      "options": [
        { "id": "a", "label": "Aventura", "icon": "person-hiking" },
        { "id": "b", "label": "Relaxare", "icon": "spa" },
        { "id": "c", "label": "Culturala", "icon": "landmark" },
        { "id": "d", "label": "Gastronomica", "icon": "utensils" }
      ]
    },
    {
      "id": "q2",
      "text": "Cu cine esti?",
      "options": [
        { "id": "a", "label": "Singur", "icon": "person" },
        { "id": "b", "label": "Cuplu", "icon": "heart" },
        { "id": "c", "label": "Prieteni", "icon": "people-group" },
        { "id": "d", "label": "Familie", "icon": "family" }
      ]
    },
    {
      "id": "q3",
      "text": "Care e bugetul?",
      "options": [
        { "id": "a", "label": "Gratuit", "icon": "hand-holding-heart" },
        { "id": "b", "label": "Sub 100 lei", "icon": "wallet" },
        { "id": "c", "label": "Peste 100 lei", "icon": "gem" }
      ]
    }
  ],

  "places": {
    "canionul_7_scari": {
      "id": "canionul_7_scari",
      "type": "Aventura",
      "name": "Canionul 7 Scari si Tiroliana",
      "shortDescription": "Defileu cu 9 scari metalice pe langa cascade + cea mai lunga tiroliana din Romania (4 km).",
      "description": "Canionul 7 Scari e una dintre cele mai populare atractii de aventura din zona Brasov. Defileu de 160 m cu scari metalice pe langa cascade. Tiroliana de 4 km cu 37 tronsoane adauga adrenalina pura.",
      "address": "Dambul Morii, Sacele (10 km de Brasov)",
      "coordinates": { "lat": 45.5820, "lng": 25.6380 },
      "priceRange": "Sub 100 lei (canion 20 lei) / Peste 100 lei (tiroliana 120 lei)",
      "tags": ["canion", "tiroliana", "cascade", "adrenalina"],
      "tip": "Pleaca devreme - parcarea se umple rapid in weekend. Cash only la bratari!",
      "image": "canionul_7_scari.jpg"
    },
    "parcul_aventura": {
      "id": "parcul_aventura",
      "type": "Aventura",
      "name": "Parcul Aventura Brasov",
      "shortDescription": "Trasee suspendate in copaci, tiroliana, obstacole - pentru copii si adulti.",
      "description": "Parcul Aventura ofera trasee in copaci cu diferite dificultati. Tiroliana, poduri suspendate, obstacole. Trasee separate pentru copii si adulti, siguranta garantata.",
      "address": "Zona Dambul Morii, langa Canionul 7 Scari",
      "coordinates": { "lat": 45.5830, "lng": 25.6350 },
      "priceRange": "Sub 100 lei",
      "tags": ["aventura", "copaci", "tiroliana", "copii", "adulti"],
      "tip": "Trasee de la 4 ani in sus. Combina cu Canionul 7 Scari pentru o zi completa.",
      "image": "parcul_aventura.jpg"
    },
    "drumete_tampa": {
      "id": "drumete_tampa",
      "type": "Aventura",
      "name": "Drumetie pe Tampa - Drumul Serpentinelor",
      "shortDescription": "Urcus de 1h15 prin padure pana la 960 m - panorama si literele BRASOV.",
      "description": "Traseul clasic pe Tampa: urcus de 1h15-1h30 prin padure de fag. La varf: panorama 360 grde, literele BRASOV, Restaurant Panoramic. Gratuit, accesibil, iconic.",
      "address": "Start: Parcul Sub Tampa, Brasov",
      "coordinates": { "lat": 45.6400, "lng": 25.5890 },
      "priceRange": "Gratuit",
      "tags": ["drumetie", "Tampa", "panorama", "gratuit", "sport"],
      "tip": "Dimineata devreme pentru aer proaspat. Apusul de sus e spectaculos!",
      "image": "drumete_tampa.jpg"
    },
    "drumete_postavarul": {
      "id": "drumete_postavarul",
      "type": "Aventura",
      "name": "Drumetie pe Postavarul - 1799 m",
      "shortDescription": "Drumetie de o zi pe cel mai inalt varf accesibil din Brasov - cabana la varf.",
      "description": "Postavarul domina Poiana Brasov. Drumetie de 5-7 ore cu 700 m diferenta de nivel. La varf: cabana cu mancare, panorama 360 grade spre Bucegi, Piatra Craiului si Persani.",
      "address": "Start: Poiana Brasov",
      "coordinates": { "lat": 45.5890, "lng": 25.5490 },
      "priceRange": "Gratuit",
      "tags": ["drumetie", "varf", "cabana", "panorama", "sport"],
      "tip": "Verifica meteo - la varf vantul poate fi puternic. La cabana mananci bine!",
      "image": "drumete_postavarul.jpg"
    },
    "escalada_solomon": {
      "id": "escalada_solomon",
      "type": "Aventura",
      "name": "Escalada la Pietrele lui Solomon",
      "shortDescription": "Trasee de escalada sportiva pe stanci - grad 4 la 7+, cu ghid sau independent.",
      "description": "Pietrele lui Solomon sunt cel mai popular sector de escalada din zona Brasov. Trasee de la grad 4 la 7+, stanca solida. Ghizi autorizati disponibili pentru incepatori.",
      "address": "Poiana Brasov (acces pe poteca)",
      "coordinates": { "lat": 45.5995, "lng": 25.5575 },
      "priceRange": "Peste 100 lei",
      "tags": ["escalada", "stanci", "sport extrem", "ghid"],
      "tip": "Pentru incepatori - ia un ghid autorizat (150-250 lei/sesiune). Echipament inclus.",
      "image": "escalada_solomon.jpg"
    },
    "atv_poiana": {
      "id": "atv_poiana",
      "type": "Aventura",
      "name": "ATV si Off-road in Poiana Brasov",
      "shortDescription": "Ture cu ATV-uri prin padure si pe drumuri de munte - adrenalina si peisaje.",
      "description": "Ture ghidate cu ATV-uri prin padurile din Poiana Brasov si imprejurimi. Trasee de 1-3 ore pe drumuri forestiere, cu opriri la puncte panoramice. Nu e nevoie de experienta.",
      "address": "Poiana Brasov",
      "coordinates": { "lat": 45.5930, "lng": 25.5560 },
      "priceRange": "Peste 100 lei",
      "tags": ["ATV", "off-road", "adrenalina", "Poiana Brasov"],
      "tip": "Tura de 2 ore e optima ca raport experienta/pret. Ia haine care se pot murdari!",
      "image": "atv_poiana.jpg"
    },
    "biciclete_poiana": {
      "id": "biciclete_poiana",
      "type": "Aventura",
      "name": "Biciclete Electrice in Poiana Brasov",
      "shortDescription": "Explorare cu e-bike pe potecile din Poiana - natura fara efort, peisaje de vis.",
      "description": "Inchiriere biciclete electrice pentru explorarea potecilor din Poiana Brasov si imprejurimi. Trasee usoare sau moderate, accesibile oricui. Peisaje montane superbe fara efort.",
      "address": "Poiana Brasov (inchirieri la baza partiei)",
      "coordinates": { "lat": 45.5925, "lng": 25.5555 },
      "priceRange": "Sub 100 lei",
      "tags": ["e-bike", "bicicleta", "Poiana", "natura", "eco"],
      "tip": "Traseul spre Cristianul Mare e spectaculos si usor cu e-bike. 2-3 ore ideale.",
      "image": "biciclete_poiana.jpg"
    },
    "parapanta": {
      "id": "parapanta",
      "type": "Aventura",
      "name": "Zbor cu Parapanta Tandem",
      "shortDescription": "Zbor tandem cu instructor din Poiana Brasov - vezi Brasovul din cer!",
      "description": "Zbor cu parapanta tandem (cu instructor) din Poiana Brasov. Durata zbor 15-30 min in functie de conditii meteo. Privelistea aeriana asupra Brasovului si muntilor e de neuitat.",
      "address": "Poiana Brasov (lansare de pe partie)",
      "coordinates": { "lat": 45.5910, "lng": 25.5530 },
      "priceRange": "Peste 100 lei",
      "tags": ["parapanta", "zbor", "adrenalina", "panorama"],
      "tip": "Depinde de vreme - suna in ziua respectiva sa confirmi. Filmare GoPro inclusa!",
      "image": "parapanta.jpg"
    },

    "lacul_noua_picnic": {
      "id": "lacul_noua_picnic",
      "type": "Relaxare",
      "name": "Picnic la Lacul Noua",
      "shortDescription": "Picnic pe malul lacului, inconjurat de padure - barci cu pedale, aer curat.",
      "description": "Lacul Noua e locul preferat al brasovenilor pentru picnic. Zone umbroase, iarba verde, barci cu pedale pe lac. Pista de alergare/ciclism in jur. Aer curat de padure.",
      "address": "Calea Bucuresti / Cartier Noua, Brasov",
      "coordinates": { "lat": 45.6250, "lng": 25.6010 },
      "priceRange": "Gratuit",
      "tags": ["picnic", "lac", "relaxare", "natura", "gratuit"],
      "tip": "Zona de picnic din nord-vest e cea mai umbrita. Ia patura si cos de picnic!",
      "image": "lacul_noua_picnic.jpg"
    },
    "parcul_central_relaxare": {
      "id": "parcul_central_relaxare",
      "type": "Relaxare",
      "name": "Plimbare in Parcul Central",
      "shortDescription": "Parc urban cu lac, lebede, alei umbroase - inima verde a Brasovului.",
      "description": "Parcul Central e perfect pentru o plimbare relaxanta. Lac cu lebede, alei umbroase, terase, locuri de joaca. Atmosfera linistita in inima orasului.",
      "address": "Bulevardul Eroilor, Brasov",
      "coordinates": { "lat": 45.6512, "lng": 25.6090 },
      "priceRange": "Gratuit",
      "tags": ["parc", "relaxare", "lac", "plimbare", "gratuit"],
      "tip": "O cafea pe terasa de langa lac + plimbare = formula perfecta de relaxare.",
      "image": "parcul_central_relaxare.jpg"
    },
    "sub_tampa_relaxare": {
      "id": "sub_tampa_relaxare",
      "type": "Relaxare",
      "name": "Plimbare in Parcul Sub Tampa",
      "shortDescription": "Aer de padure la poalele muntelui, alei linistite, caprioare dimineata.",
      "description": "Parcul Sub Tampa ofera aer curat de padure chiar in oras. Alei pietruite, banci cu vedere spre munte, liniste totala. Dimineata devreme poti vedea caprioare.",
      "address": "Aleea Tiberiu Brediceanu, Brasov",
      "coordinates": { "lat": 45.6410, "lng": 25.5895 },
      "priceRange": "Gratuit",
      "tags": ["padure", "relaxare", "liniste", "caprioare", "gratuit"],
      "tip": "La 6-7 dimineata - caprioare si aer proaspat. Seara - liniste absoluta.",
      "image": "sub_tampa_relaxare.jpg"
    },
    "spa_hotel": {
      "id": "spa_hotel",
      "type": "Relaxare",
      "name": "SPA & Wellness la Hotel Premium",
      "shortDescription": "Experienta SPA completa - sauna, piscina, masaj - la hotelurile din Brasov sau Poiana.",
      "description": "Mai multe hoteluri premium din Brasov si Poiana Brasov ofera acces la SPA si wellness: Radisson Blu Aurum, Ana Hotels Sport Poiana, Teleferic Grand Hotel. Sauna, piscina, jacuzzi, masaj.",
      "address": "Diverse hoteluri - Brasov / Poiana Brasov",
      "coordinates": { "lat": 45.6450, "lng": 25.5920 },
      "priceRange": "Peste 100 lei",
      "tags": ["SPA", "wellness", "sauna", "piscina", "masaj"],
      "tip": "Radisson Blu Aurum are rooftop pool. Ana Hotels Sport - cel mai mare SPA din Poiana.",
      "image": "spa_hotel.jpg"
    },
    "degustare_vin_relaxare": {
      "id": "degustare_vin_relaxare",
      "type": "Relaxare",
      "name": "Degustare de Vin la Terroirs sau Juno",
      "shortDescription": "Wine tasting cu sommelier - 500+ vinuri la Terroirs, sau pizza pe vatra la Juno Wine Garden.",
      "description": "Terroirs Boutique du Vin - degustare cu sommelier din 500+ vinuri. Juno Wine Garden - vinuri intre zidurile cetatii cu pizza pe vatra. Ambele experienta relaxanta si rafinata.",
      "address": "Str. Republicii 10 (Terroirs) / Aleea Dupa Ziduri (Juno)",
      "coordinates": { "lat": 45.6435, "lng": 25.5910 },
      "priceRange": "Peste 100 lei",
      "tags": ["vin", "degustare", "sommelier", "relaxare", "rafinat"],
      "tip": "La Terroirs cere recomandare de la sommelier. La Juno - seara cu luminite e magica.",
      "image": "degustare_vin_relaxare.jpg"
    },
    "yoga_natura": {
      "id": "yoga_natura",
      "type": "Relaxare",
      "name": "Yoga si Meditatie in Natura",
      "shortDescription": "Sesiuni de yoga si meditatie in parcuri sau pe munte - reconectare cu natura.",
      "description": "Mai multi instructori din Brasov organizeaza sesiuni de yoga in aer liber: in Parcul Sub Tampa, pe Dealul Melcilor sau in Poiana Brasov. Reconectare cu natura prin miscare si respiratie.",
      "address": "Diverse locatii - Parcul Sub Tampa / Poiana Brasov",
      "coordinates": { "lat": 45.6400, "lng": 25.5890 },
      "priceRange": "Sub 100 lei",
      "tags": ["yoga", "meditatie", "natura", "wellness", "aer liber"],
      "tip": "Cauta evenimentele pe Facebook/Instagram - sesiuni gratuite sau 30-50 lei.",
      "image": "yoga_natura.jpg"
    },
    "telecabina_panoramic": {
      "id": "telecabina_panoramic",
      "type": "Relaxare",
      "name": "Telecabina Tampa + Restaurant Panoramic",
      "shortDescription": "Urci cu telecabina in 3 minute, mananci la Panoramic cu vedere peste tot Brasovul.",
      "description": "Telecabina Tampa (redeschisa 2025) + Restaurantul Panoramic la 960 m. Urci in 3 min, te relaxezi la terasa cu vedere 360 grade. Experienta completa de relaxare la inaltime.",
      "address": "Aleea Tiberiu Brediceanu (telecabina), Brasov",
      "coordinates": { "lat": 45.6415, "lng": 25.5895 },
      "priceRange": "Sub 100 lei",
      "tags": ["telecabina", "panorama", "restaurant", "relaxare"],
      "tip": "Bilet telecabina ~20 lei. Masa la Panoramic - separat. Apusul de sus e magic!",
      "image": "telecabina_panoramic.jpg"
    },

    "biserica_neagra_vizita": {
      "id": "biserica_neagra_vizita",
      "type": "Culturala",
      "name": "Vizita la Biserica Neagra",
      "shortDescription": "Cea mai mare biserica gotica din SE Europei - 600+ ani, covoare anatoliene, orga.",
      "description": "Interior impresionant cu cea mai mare colectie de covoare anatoliene din Europa. Orga cu 4000 de tuburi. Concerte de orga vara. Bilet 25 lei adulti.",
      "address": "Curtea Johannes Honterus, Brasov",
      "coordinates": { "lat": 45.6413, "lng": 25.5878 },
      "priceRange": "Sub 100 lei",
      "tags": ["biserica", "gotic", "muzeu", "covoare", "orga"],
      "tip": "Concertele de orga de vara sunt extraordinare. Verifica programul!",
      "image": "biserica_neagra_vizita.jpg"
    },
    "muzeu_istorie": {
      "id": "muzeu_istorie",
      "type": "Culturala",
      "name": "Muzeul de Istorie - Casa Sfatului",
      "shortDescription": "Istoria Brasovului de la origini la sec. XX - in turnul iconic din Piata Sfatului.",
      "description": "Muzeul de Istorie din Casa Sfatului prezinta istoria Brasovului. Turn de 58 m, expozitii permanente si temporare, artefacte medievale. Bilet 15 lei.",
      "address": "Piata Sfatului, Brasov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "priceRange": "Sub 100 lei",
      "tags": ["muzeu", "istorie", "Casa Sfatului", "medieval"],
      "tip": "Urca in turn pentru panorama! Expozitiile temporare sunt adesea excelente.",
      "image": "muzeu_istorie.jpg"
    },
    "prima_scoala": {
      "id": "prima_scoala",
      "type": "Culturala",
      "name": "Prima Scoala Romaneasca",
      "shortDescription": "Primul loc unde s-a predat in limba romana (sec. XV) - manuscrise, biblii, Coresi.",
      "description": "Prima Scoala Romaneasca (sec. XV) in curtea Bisericii Sf. Nicolae din Schei. Manuscrise, carti vechi, biblii. Aici a tiparit Diaconul Coresi primele carti in romana.",
      "address": "Piata Unirii nr. 2-3, Brasov (Schei)",
      "coordinates": { "lat": 45.6378, "lng": 25.5848 },
      "priceRange": "Sub 100 lei",
      "tags": ["muzeu", "istorie", "educatie", "Coresi", "Schei"],
      "tip": "Ghizii locali povestesc anecdote fascinante. Excelent pentru copii!",
      "image": "prima_scoala.jpg"
    },
    "tur_ghidat": {
      "id": "tur_ghidat",
      "type": "Culturala",
      "name": "Tur Ghidat prin Centrul Vechi",
      "shortDescription": "Tur pietonal de 2 ore cu ghid local - povesti, legende si istorie vie.",
      "description": "Tururi ghidate pietonale de 2 ore prin centrul medieval al Brasovului. Ghizi locali autorizati povestesc istoria, legendele si secretele orasului. Disponibile in romana, engleza, germana.",
      "address": "Start: Piata Sfatului, Brasov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "priceRange": "Sub 100 lei",
      "tags": ["tur ghidat", "istorie", "legende", "pietonal"],
      "tip": "Free walking tours disponibile (platesti cat consideri). Tururi private ~150-200 lei/grup.",
      "image": "tur_ghidat.jpg"
    },
    "piata_sfatului_liber": {
      "id": "piata_sfatului_liber",
      "type": "Culturala",
      "name": "Plimbare Istorica in Piata Sfatului",
      "shortDescription": "Plimbare libera prin inima medievala - Casa Sfatului, Casa Hirscher, fatade istorice.",
      "description": "Piata Sfatului e un muzeu in aer liber. Casa Sfatului (sec. XV), Casa Hirscher, Casa Muresenilor, Biserica Adormirea Maicii Domnului. Poti explora singur cu Google Maps.",
      "address": "Piata Sfatului, Brasov",
      "coordinates": { "lat": 45.6427, "lng": 25.5886 },
      "priceRange": "Gratuit",
      "tags": ["piata", "medieval", "arhitectura", "gratuit", "istorie"],
      "tip": "Dimineata devreme - fara turisti, lumina perfecta. Seara - iluminat spectaculos.",
      "image": "piata_sfatului_liber.jpg"
    },
    "bastionul_tesatorilor": {
      "id": "bastionul_tesatorilor",
      "type": "Culturala",
      "name": "Bastionul Tesatorilor si Zidul Cetatii",
      "shortDescription": "Cel mai bine conservat bastion medieval - Muzeul Tarii Barsei, macheta cetatii.",
      "description": "Bastionul Tesatorilor (sec. XV) gazduieste Muzeul Tarii Barsei cu macheta vechi cetatii. Plimbarea de-a lungul zidurilor medievale e spectaculoasa. Bilet ~10 lei.",
      "address": "Str. George Cosbuc, Brasov",
      "coordinates": { "lat": 45.6405, "lng": 25.5855 },
      "priceRange": "Sub 100 lei",
      "tags": ["bastion", "muzeu", "medieval", "ziduri", "fortificatii"],
      "tip": "Macheta cetatii medievale te ajuta sa intelegi tot ce vezi apoi pe jos.",
      "image": "bastionul_tesatorilor.jpg"
    },
    "scheii_brasovului_tur": {
      "id": "scheii_brasovului_tur",
      "type": "Culturala",
      "name": "Tur in Scheii Brasovului",
      "shortDescription": "Cel mai vechi cartier romanesc - Poarta Schei, Piata Unirii, Biserica Sf. Nicolae.",
      "description": "Scheii Brasovului e cartierul romanesc istoric. Poarta Schei, Poarta Ecaterina, Piata Unirii, Biserica Sf. Nicolae (sec. XIII). Istorie romaneasca autentica, departe de turisti.",
      "address": "Piata Unirii / Str. Prundului, Brasov",
      "coordinates": { "lat": 45.6380, "lng": 25.5850 },
      "priceRange": "Gratuit",
      "tags": ["Schei", "cartier", "istorie", "autentic", "gratuit"],
      "tip": "Intra prin Poarta Schei - exact cum o faceau romanii acum 500 de ani.",
      "image": "scheii_brasovului_tur.jpg"
    },

    "sergiana_experienta": {
      "id": "sergiana_experienta",
      "type": "Gastronomica",
      "name": "Experienta Culinara la Sergiana",
      "shortDescription": "Meniu traditional ardelenesc complet - de la jumari la papanasi, ingrediente de la ferma.",
      "description": "Sergiana Mureseni ofera experienta culinara completa: jumari si paine cu ceapa din partea casei, tochitura, sarmale, papanasi. Ingrediente de la ferma proprie din Poiana Marului.",
      "address": "Str. Muresenilor nr. 28, Brasov",
      "coordinates": { "lat": 45.6420, "lng": 25.5890 },
      "priceRange": "Sub 100 lei",
      "tags": ["traditional", "ardelenesc", "experienta culinara", "ferma"],
      "tip": "Comanda meniul de degustare traditionala - gustasi din tot. Rezerva masa!",
      "image": "sergiana_experienta.jpg"
    },
    "street_food_tour": {
      "id": "street_food_tour",
      "type": "Gastronomica",
      "name": "Street Food Tour in Centru",
      "shortDescription": "Tur pe cont propriu prin cele mai bune street food-uri: covrig MOA, pizza Della Nonna, burger Old Jack.",
      "description": "Fa-ti propriul food tour prin centrul Brasovului: covrig la MOA Bakery, pizza la Della Nonna, burger la Old Jack, focaccia la AntreU, cafea la Croitoria. 5 opriri, sub 100 lei total.",
      "address": "Diverse locatii - centrul vechi, Brasov",
      "coordinates": { "lat": 45.6430, "lng": 25.5890 },
      "priceRange": "Sub 100 lei",
      "tags": ["street food", "food tour", "divers", "centru"],
      "tip": "Fa 5 opriri cu gustari mici la fiecare - asa incerci tot ce e bun!",
      "image": "street_food_tour.jpg"
    },
    "food_market_piata": {
      "id": "food_market_piata",
      "type": "Gastronomica",
      "name": "Piata si Targuri Alimentare Locale",
      "shortDescription": "Piata Agroalimentara si targurile sezoniere - produse locale, branza, miere, mezeluri.",
      "description": "Piata Agroalimentara Brasov si targurile sezoniere (Transylvanian Food Market, Festivalul Merindelor) ofera produse locale: branza de burduf, miere, zacusca, mezeluri, fructe. Gust autentic.",
      "address": "Piata Agroalimentara / Piata Sf. Ioan, Brasov",
      "coordinates": { "lat": 45.6450, "lng": 25.5930 },
      "priceRange": "Gratuit",
      "tags": ["piata", "produse locale", "branza", "miere", "targ"],
      "tip": "Sambata dimineata - cea mai mare varietate. Incearca branza de burduf si mierea locala!",
      "image": "food_market_piata.jpg"
    },
    "wine_tasting": {
      "id": "wine_tasting",
      "type": "Gastronomica",
      "name": "Wine Tasting cu Sommelier",
      "shortDescription": "Degustare de vinuri ghidata de sommelier la Terroirs - 500+ etichete, platouri gourmet.",
      "description": "Terroirs Boutique du Vin ofera degustare ghidata din 500+ vinuri. Sommelier-ul iti povesteste despre fiecare vin. Platouri cu branza, prosciutto si fructe. Experienta rafinata.",
      "address": "Str. Republicii nr. 10, Brasov",
      "coordinates": { "lat": 45.6435, "lng": 25.5910 },
      "priceRange": "Peste 100 lei",
      "tags": ["vin", "degustare", "sommelier", "gourmet", "rafinat"],
      "tip": "Lasa sommelier-ul sa aleaga pentru tine - e cea mai buna experienta!",
      "image": "wine_tasting.jpg"
    },
    "cooking_class": {
      "id": "cooking_class",
      "type": "Gastronomica",
      "name": "Atelier de Gatit Traditional",
      "shortDescription": "Invata sa faci sarmale, papanasi sau cozonac cu un bucatar local - hands-on!",
      "description": "Ateliere de gatit organizate de bucatari locali unde inveti retete traditionale: sarmale, papanasi, cozonac, tochitura. Gatesti si mananci ce ai facut. Experienta autentica si distractiva.",
      "address": "Diverse locatii - Brasov / imprejurimi",
      "coordinates": { "lat": 45.6430, "lng": 25.5890 },
      "priceRange": "Peste 100 lei",
      "tags": ["cooking class", "traditional", "hands-on", "sarmale", "papanasi"],
      "tip": "Cauta pe Airbnb Experiences sau Travlocals - cele mai bune cooking classes.",
      "image": "cooking_class.jpg"
    },
    "brunch_premium": {
      "id": "brunch_premium",
      "type": "Gastronomica",
      "name": "Brunch in Centrul Vechi",
      "shortDescription": "Brunch la Opus 9, Le Petit sau Bistro Weiss - cafea, oua benedict, croissante.",
      "description": "Cele mai bune brunch-uri din Brasov: Opus 9 (Piata Enescu), Le Petit Bistro (langa Biserica Neagra), Bistro Weiss (Michael Weiss). Cafea specialty, oua benedict, croissante, pancakes.",
      "address": "Piata George Enescu / Str. Castelului / Str. Michael Weiss",
      "coordinates": { "lat": 45.6423, "lng": 25.5870 },
      "priceRange": "Sub 100 lei",
      "tags": ["brunch", "cafea", "croissante", "weekend", "centru vechi"],
      "tip": "Weekend-ul la Opus 9 pe terasa - latte + eggs benedict = perfectiune.",
      "image": "brunch_premium.jpg"
    },
    "degustare_mesendorf": {
      "id": "degustare_mesendorf",
      "type": "Gastronomica",
      "name": "Degustare Branza si Vin la Mesendorf",
      "shortDescription": "Branza artizanala + vin local in sat sasesc autentic - 40 km de Brasov.",
      "description": "La Mesendorf (jud. Brasov) poti degusta branza din lapte crud de la fermele locale, combinata cu vin din podgoriile romanesti, fructe de sezon, miere si biscuiti de casa. Experienta rurala autentica.",
      "address": "Mesendorf, jud. Brasov (40 km de Brasov)",
      "coordinates": { "lat": 46.1050, "lng": 25.2100 },
      "priceRange": "Peste 100 lei",
      "tags": ["branza", "vin", "degustare", "rural", "autentic", "Mesendorf"],
      "tip": "Rezerva prin Travlocals.com. Combina cu vizita la biserica fortificata din sat.",
      "image": "degustare_mesendorf.jpg"
    }
  },

  "results": {
    "a-a-a": { "combination": { "q1": "Aventura", "q2": "Singur", "q3": "Gratuit" }, "recommendations": ["drumete_tampa", "drumete_postavarul", "biciclete_poiana"] },
    "a-a-b": { "combination": { "q1": "Aventura", "q2": "Singur", "q3": "Sub 100 lei" }, "recommendations": ["canionul_7_scari", "biciclete_poiana", "parcul_aventura"] },
    "a-a-c": { "combination": { "q1": "Aventura", "q2": "Singur", "q3": "Peste 100 lei" }, "recommendations": ["escalada_solomon", "parapanta", "atv_poiana"] },
    "a-b-a": { "combination": { "q1": "Aventura", "q2": "Cuplu", "q3": "Gratuit" }, "recommendations": ["drumete_tampa", "drumete_postavarul", "biciclete_poiana"] },
    "a-b-b": { "combination": { "q1": "Aventura", "q2": "Cuplu", "q3": "Sub 100 lei" }, "recommendations": ["canionul_7_scari", "biciclete_poiana", "parcul_aventura"] },
    "a-b-c": { "combination": { "q1": "Aventura", "q2": "Cuplu", "q3": "Peste 100 lei" }, "recommendations": ["parapanta", "atv_poiana", "escalada_solomon"] },
    "a-c-a": { "combination": { "q1": "Aventura", "q2": "Prieteni", "q3": "Gratuit" }, "recommendations": ["drumete_postavarul", "drumete_tampa", "biciclete_poiana"] },
    "a-c-b": { "combination": { "q1": "Aventura", "q2": "Prieteni", "q3": "Sub 100 lei" }, "recommendations": ["canionul_7_scari", "parcul_aventura", "biciclete_poiana"] },
    "a-c-c": { "combination": { "q1": "Aventura", "q2": "Prieteni", "q3": "Peste 100 lei" }, "recommendations": ["atv_poiana", "escalada_solomon", "parapanta"] },
    "a-d-a": { "combination": { "q1": "Aventura", "q2": "Familie", "q3": "Gratuit" }, "recommendations": ["drumete_tampa", "biciclete_poiana", "drumete_postavarul"] },
    "a-d-b": { "combination": { "q1": "Aventura", "q2": "Familie", "q3": "Sub 100 lei" }, "recommendations": ["parcul_aventura", "canionul_7_scari", "biciclete_poiana"] },
    "a-d-c": { "combination": { "q1": "Aventura", "q2": "Familie", "q3": "Peste 100 lei" }, "recommendations": ["atv_poiana", "canionul_7_scari", "parcul_aventura"] },

    "b-a-a": { "combination": { "q1": "Relaxare", "q2": "Singur", "q3": "Gratuit" }, "recommendations": ["sub_tampa_relaxare", "lacul_noua_picnic", "parcul_central_relaxare"] },
    "b-a-b": { "combination": { "q1": "Relaxare", "q2": "Singur", "q3": "Sub 100 lei" }, "recommendations": ["telecabina_panoramic", "yoga_natura", "lacul_noua_picnic"] },
    "b-a-c": { "combination": { "q1": "Relaxare", "q2": "Singur", "q3": "Peste 100 lei" }, "recommendations": ["spa_hotel", "degustare_vin_relaxare", "telecabina_panoramic"] },
    "b-b-a": { "combination": { "q1": "Relaxare", "q2": "Cuplu", "q3": "Gratuit" }, "recommendations": ["lacul_noua_picnic", "sub_tampa_relaxare", "parcul_central_relaxare"] },
    "b-b-b": { "combination": { "q1": "Relaxare", "q2": "Cuplu", "q3": "Sub 100 lei" }, "recommendations": ["telecabina_panoramic", "yoga_natura", "lacul_noua_picnic"] },
    "b-b-c": { "combination": { "q1": "Relaxare", "q2": "Cuplu", "q3": "Peste 100 lei" }, "recommendations": ["degustare_vin_relaxare", "spa_hotel", "telecabina_panoramic"] },
    "b-c-a": { "combination": { "q1": "Relaxare", "q2": "Prieteni", "q3": "Gratuit" }, "recommendations": ["lacul_noua_picnic", "parcul_central_relaxare", "sub_tampa_relaxare"] },
    "b-c-b": { "combination": { "q1": "Relaxare", "q2": "Prieteni", "q3": "Sub 100 lei" }, "recommendations": ["telecabina_panoramic", "yoga_natura", "lacul_noua_picnic"] },
    "b-c-c": { "combination": { "q1": "Relaxare", "q2": "Prieteni", "q3": "Peste 100 lei" }, "recommendations": ["degustare_vin_relaxare", "spa_hotel", "telecabina_panoramic"] },
    "b-d-a": { "combination": { "q1": "Relaxare", "q2": "Familie", "q3": "Gratuit" }, "recommendations": ["parcul_central_relaxare", "lacul_noua_picnic", "sub_tampa_relaxare"] },
    "b-d-b": { "combination": { "q1": "Relaxare", "q2": "Familie", "q3": "Sub 100 lei" }, "recommendations": ["telecabina_panoramic", "lacul_noua_picnic", "yoga_natura"] },
    "b-d-c": { "combination": { "q1": "Relaxare", "q2": "Familie", "q3": "Peste 100 lei" }, "recommendations": ["spa_hotel", "telecabina_panoramic", "degustare_vin_relaxare"] },

    "c-a-a": { "combination": { "q1": "Culturala", "q2": "Singur", "q3": "Gratuit" }, "recommendations": ["piata_sfatului_liber", "scheii_brasovului_tur", "bastionul_tesatorilor"] },
    "c-a-b": { "combination": { "q1": "Culturala", "q2": "Singur", "q3": "Sub 100 lei" }, "recommendations": ["biserica_neagra_vizita", "muzeu_istorie", "prima_scoala"] },
    "c-a-c": { "combination": { "q1": "Culturala", "q2": "Singur", "q3": "Peste 100 lei" }, "recommendations": ["tur_ghidat", "biserica_neagra_vizita", "muzeu_istorie"] },
    "c-b-a": { "combination": { "q1": "Culturala", "q2": "Cuplu", "q3": "Gratuit" }, "recommendations": ["piata_sfatului_liber", "scheii_brasovului_tur", "bastionul_tesatorilor"] },
    "c-b-b": { "combination": { "q1": "Culturala", "q2": "Cuplu", "q3": "Sub 100 lei" }, "recommendations": ["biserica_neagra_vizita", "prima_scoala", "bastionul_tesatorilor"] },
    "c-b-c": { "combination": { "q1": "Culturala", "q2": "Cuplu", "q3": "Peste 100 lei" }, "recommendations": ["tur_ghidat", "biserica_neagra_vizita", "muzeu_istorie"] },
    "c-c-a": { "combination": { "q1": "Culturala", "q2": "Prieteni", "q3": "Gratuit" }, "recommendations": ["scheii_brasovului_tur", "piata_sfatului_liber", "bastionul_tesatorilor"] },
    "c-c-b": { "combination": { "q1": "Culturala", "q2": "Prieteni", "q3": "Sub 100 lei" }, "recommendations": ["biserica_neagra_vizita", "muzeu_istorie", "bastionul_tesatorilor"] },
    "c-c-c": { "combination": { "q1": "Culturala", "q2": "Prieteni", "q3": "Peste 100 lei" }, "recommendations": ["tur_ghidat", "biserica_neagra_vizita", "prima_scoala"] },
    "c-d-a": { "combination": { "q1": "Culturala", "q2": "Familie", "q3": "Gratuit" }, "recommendations": ["piata_sfatului_liber", "scheii_brasovului_tur", "bastionul_tesatorilor"] },
    "c-d-b": { "combination": { "q1": "Culturala", "q2": "Familie", "q3": "Sub 100 lei" }, "recommendations": ["prima_scoala", "biserica_neagra_vizita", "muzeu_istorie"] },
    "c-d-c": { "combination": { "q1": "Culturala", "q2": "Familie", "q3": "Peste 100 lei" }, "recommendations": ["tur_ghidat", "prima_scoala", "biserica_neagra_vizita"] },

    "d-a-a": { "combination": { "q1": "Gastronomica", "q2": "Singur", "q3": "Gratuit" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    "d-a-b": { "combination": { "q1": "Gastronomica", "q2": "Singur", "q3": "Sub 100 lei" }, "recommendations": ["street_food_tour", "brunch_premium", "sergiana_experienta"] },
    "d-a-c": { "combination": { "q1": "Gastronomica", "q2": "Singur", "q3": "Peste 100 lei" }, "recommendations": ["wine_tasting", "cooking_class", "degustare_mesendorf"] },
    "d-b-a": { "combination": { "q1": "Gastronomica", "q2": "Cuplu", "q3": "Gratuit" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    "d-b-b": { "combination": { "q1": "Gastronomica", "q2": "Cuplu", "q3": "Sub 100 lei" }, "recommendations": ["brunch_premium", "sergiana_experienta", "street_food_tour"] },
    "d-b-c": { "combination": { "q1": "Gastronomica", "q2": "Cuplu", "q3": "Peste 100 lei" }, "recommendations": ["wine_tasting", "degustare_mesendorf", "cooking_class"] },
    "d-c-a": { "combination": { "q1": "Gastronomica", "q2": "Prieteni", "q3": "Gratuit" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    "d-c-b": { "combination": { "q1": "Gastronomica", "q2": "Prieteni", "q3": "Sub 100 lei" }, "recommendations": ["sergiana_experienta", "street_food_tour", "brunch_premium"] },
    "d-c-c": { "combination": { "q1": "Gastronomica", "q2": "Prieteni", "q3": "Peste 100 lei" }, "recommendations": ["cooking_class", "wine_tasting", "degustare_mesendorf"] },
    "d-d-a": { "combination": { "q1": "Gastronomica", "q2": "Familie", "q3": "Gratuit" }, "recommendations": ["food_market_piata", "street_food_tour", "brunch_premium"] },
    "d-d-b": { "combination": { "q1": "Gastronomica", "q2": "Familie", "q3": "Sub 100 lei" }, "recommendations": ["sergiana_experienta", "brunch_premium", "street_food_tour"] },
    "d-d-c": { "combination": { "q1": "Gastronomica", "q2": "Familie", "q3": "Peste 100 lei" }, "recommendations": ["cooking_class", "degustare_mesendorf", "wine_tasting"] }
  }
}

# 3. Inject into tree and save
tree["experiente"] = experiente_category

with open(tree_path, "w", encoding="utf-8") as f:
    json.dump(tree, f, indent=2, ensure_ascii=False)

print("[OK] Successfully generated and merged latest Experiente category into decision_tree.json!")
print(f"Total combinations: {len(experiente_category['results'])}")

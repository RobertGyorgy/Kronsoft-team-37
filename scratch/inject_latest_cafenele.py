import json
import os

tree_path = r"c:\Users\user\Desktop\SmartCity\public\decision_tree.json"

# 1. Read existing decision tree
with open(tree_path, "r", encoding="utf-8") as f:
    tree = json.load(f)

# 2. Paste the user's exact latest JSON content for Cafenele
cafenele_json = """{
  "categoryId": "cafenele",
  "categoryLabel": "Cafenele",
  "categoryIcon": "coffee",
  "questions": [
    {
      "id": "q1",
      "text": "Ce atmosferă cauți?",
      "options": [
        { "id": "a", "label": "Cozy", "icon": "mug-hot" },
        { "id": "b", "label": "Modern", "icon": "wand-magic-sparkles" },
        { "id": "c", "label": "Liniștită", "icon": "spa" },
        { "id": "d", "label": "Terasă", "icon": "umbrella-beach" }
      ]
    },
    {
      "id": "q2",
      "text": "Cu cine ești?",
      "options": [
        { "id": "a", "label": "Singur", "icon": "person" },
        { "id": "b", "label": "Cuplu", "icon": "heart" },
        { "id": "c", "label": "Prieteni", "icon": "people-group" },
        { "id": "d", "label": "Familie cu copii", "icon": "family" }
      ]
    },
    {
      "id": "q3",
      "text": "Buget per persoană?",
      "options": [
        { "id": "a", "label": "Sub 20 lei", "icon": "coins" },
        { "id": "b", "label": "20–40 lei", "icon": "wallet" },
        { "id": "c", "label": "Peste 40 lei", "icon": "gem" }
      ]
    }
  ],

  "places": {
    "croitoria": {
      "id": "croitoria",
      "name": "Croitoria de Cafea",
      "atmosphere": "Cozy",
      "shortDescription": "Cafenea micuță și cochetă într-o fostă croitorie – cafea prăjită în casă, biscuiți homemade.",
      "description": "Croitoria îmbină cafenea, prăjitorie și spațiu de lucru. Cafeaua e proaspăt prăjită de Mugur Treschi, maestru prăjitor. Loc mic, intim, cu fereastra mare la stradă. Biscuiți homemade.",
      "address": "Str. Iuliu Maniu, Brașov",
      "coordinates": { "lat": 45.6455, "lng": 25.5935 },
      "priceRange": "Sub 20 lei",
      "tags": ["specialty", "prăjitorie", "cozy", "intim", "homemade"],
      "tip": "Barista îți povestește despre fiecare soi de cafea. Latte art-ul e demn de postat.",
      "hours": "08:00–18:00",
      "image": "croitoria.jpg"
    },
    "book_coffee": {
      "id": "book_coffee",
      "name": "Book Coffee Shop",
      "atmosphere": "Cozy",
      "shortDescription": "Cafenea plină de cărți și plante – cafea de specialitate pe o stradă retrasă.",
      "description": "Ambient cozy plin de cărți și plante verzi. Cafea de specialitate preparată cu pricepere, opțiuni cu lapte de ovăz. Stradă retrasă dar centrală. Perfect pentru citit sau relaxare.",
      "address": "Centru, Brașov",
      "coordinates": { "lat": 45.6430, "lng": 25.5880 },
      "priceRange": "20–40 lei",
      "tags": ["cărți", "plante", "cozy", "specialty", "relaxare"],
      "tip": "Ia o carte de pe raft și savurează cafeaua. Flat white-ul cu lapte de ovăz e excelent.",
      "hours": "09:00–20:00",
      "image": "book_coffee.jpg"
    },
    "dallmayr": {
      "id": "dallmayr",
      "name": "Cafenea Dallmayr",
      "atmosphere": "Cozy",
      "shortDescription": "Decor atent la detalii, ciocolată caldă legendară, cappuccino perfect.",
      "description": "Atmosferă primitoare cu decor sezonier, atenție la detalii. Ciocolata caldă și cappuccino sunt foarte lăudate. Selecție de ceaiuri. Decor cald, muzică ambientală.",
      "address": "Str. Republicii, Brașov",
      "coordinates": { "lat": 45.6445, "lng": 25.5915 },
      "priceRange": "20–40 lei",
      "tags": ["ciocolată caldă", "decor", "cappuccino", "ceai", "cozy"],
      "tip": "Ciocolata caldă Dallmayr e un must în sezonul rece!",
      "hours": "09:00–21:00",
      "image": "dallmayr.jpg"
    },
    "schilthorn": {
      "id": "schilthorn",
      "name": "Schilthorn Coffee",
      "atmosphere": "Cozy",
      "shortDescription": "Cafenea cool și cozy pe pietonala din Coresi – gamă largă de specialități.",
      "description": "Schilthorn e o cafenea foarte cool și cozy în cartierul Coresi, pe pietonală. Gamă largă de specialități de cafea, toate excelente. Atmosferă caldă.",
      "address": "Str. Sfântul Ioan nr. 30, Brașov (Coresi)",
      "coordinates": { "lat": 45.6560, "lng": 25.6050 },
      "priceRange": "20–40 lei",
      "tags": ["cozy", "specialty", "cool", "Coresi"],
      "tip": "Cafeaua flat white e remarcabilă. Mereu o surpriză plăcută pe meniu.",
      "hours": "08:00–20:00",
      "image": "schilthorn.jpg"
    },
    "moa_bakery": {
      "id": "moa_bakery",
      "name": "MOA Bakery",
      "atmosphere": "Cozy",
      "shortDescription": "Cafea bună + cei mai buni covrigi din Brașov – cafea grecească, prețuri mici.",
      "description": "MOA e mai mult decât o cafenea – e locul cu cei mai buni covrigi umpluți din Brașov. Cafea grecească delicioasă, atmosferă caldă, prețuri foarte accesibile.",
      "address": "Centru, Brașov",
      "coordinates": { "lat": 45.6438, "lng": 25.5905 },
      "priceRange": "Sub 20 lei",
      "tags": ["covrigi", "cafea grecească", "accesibil", "gustări"],
      "tip": "Covrigii umpluți sunt legendari! Combinația cafea + covrig e sub 15 lei.",
      "hours": "08:00–19:00",
      "image": "moa_bakery.jpg"
    },
    "bistro_weiss": {
      "id": "bistro_weiss",
      "name": "Bistro Weiss (ex-Coffeöl)",
      "atmosphere": "Cozy",
      "shortDescription": "Loc cozy cu bucătărie italiană în inima Brașovului – cafea + brunch excelent.",
      "description": "Fostul Coffeöl, acum Bistro Weiss, pe Michael Weiss 18. Cafea excelentă, brunch, preparate italiene ușoare. Cadru intim și cald în inima centrului vechi.",
      "address": "Str. Michael Weiss nr. 18, Brașov",
      "coordinates": { "lat": 45.6413, "lng": 25.5893 },
      "priceRange": "Peste 40 lei",
      "tags": ["brunch", "italian", "cozy", "centru vechi"],
      "tip": "Brunch-ul de weekend e foarte bun. Croissantele proaspete – un vis!",
      "hours": "09:00–22:00",
      "image": "bistro_weiss.jpg"
    },

    "nola": {
      "id": "nola",
      "name": "Nola Coffee",
      "atmosphere": "Modern",
      "shortDescription": "Spațiu curat, aerisit, minimalist – deschis în 2025, espresso impecabil.",
      "description": "Nola e un loc nou deschis în 2025 care s-a impus fără efort. Design modern, minimalist. De la mobilier la espresso, totul e simplu și bine făcut. Localnicii vin constant.",
      "address": "Brașov",
      "coordinates": { "lat": 45.6445, "lng": 25.5920 },
      "priceRange": "20–40 lei",
      "tags": ["modern", "minimalist", "2025", "design", "specialty"],
      "tip": "Espresso-ul simplu e impecabil – testul suprem al unei cafenele.",
      "hours": "08:00–20:00",
      "image": "nola.jpg"
    },
    "focus_coffee": {
      "id": "focus_coffee",
      "name": "Focus Coffee",
      "atmosphere": "Modern",
      "shortDescription": "Cafea de specialitate, spațiu cozy-modern, pet-friendly.",
      "description": "Focus Coffee pe str. Ioan Popasu – cafea de specialitate într-un spațiu modern și cozy. Pet-friendly, perfect pentru lucrat sau citit.",
      "address": "Str. Ioan Popasu nr. 53, Brașov",
      "coordinates": { "lat": 45.6460, "lng": 25.5900 },
      "priceRange": "20–40 lei",
      "tags": ["specialty", "modern", "pet-friendly", "work-friendly"],
      "tip": "Poți veni cu animalul de companie! Flat white-ul e remarcabil.",
      "hours": "08:00–19:00",
      "image": "focus_coffee.jpg"
    },
    "clav": {
      "id": "clav",
      "name": "CLAV Coffee to Go",
      "atmosphere": "Modern",
      "shortDescription": "Cea mai nouă cafenea din Brașov (2025) – Piața Teatrului, coffee to go.",
      "description": "CLAV e deschisă din martie 2025 în Piața Teatrului. Concept modern de coffee to go, cafea de specialitate proaspăt prăjită. Rapid, curat, eficient.",
      "address": "Piața Teatrului nr. 4, Brașov",
      "coordinates": { "lat": 45.6455, "lng": 25.5925 },
      "priceRange": "Sub 20 lei",
      "tags": ["to go", "modern", "2025", "rapid", "Piața Teatrului"],
      "tip": "Ideal pentru o cafea la plimbare. Prețuri foarte bune pentru calitate.",
      "hours": "07:30–18:00",
      "image": "clav.jpg"
    },
    "spired": {
      "id": "spired",
      "name": "Spired Roastery",
      "atmosphere": "Modern",
      "shortDescription": "Prăjitorie + cafenea – cafea de înaltă calitate, echipament profesional.",
      "description": "Spired Roastery e apreciată pentru cafeaua de înaltă calitate și servicii excelente. Prăjesc propria cafea, echipament profesional. Atmosferă modernă și curată.",
      "address": "Brașov",
      "coordinates": { "lat": 45.6465, "lng": 25.5940 },
      "priceRange": "20–40 lei",
      "tags": ["prăjitorie", "specialty", "modern", "profesional"],
      "tip": "Cumpără cafea proaspăt prăjită pentru acasă – selecția e excelentă.",
      "hours": "08:00–18:00",
      "image": "spired.jpg"
    },
    "keys_coffee": {
      "id": "keys_coffee",
      "name": "Keys Coffee & Lounge",
      "atmosphere": "Modern",
      "shortDescription": "Spațiu modern cu lansări de carte, expoziții, pop-up-uri – cafea, prosecco, pizza.",
      "description": "Keys Coffee pe Paul Richter – spațiu modern deschis pentru lansări de carte, expoziții, pop-up-uri și întâlniri private. Cafea, prosecco și pizza, cu atmosferă întreținută de artiști locali.",
      "address": "Str. Paul Richter nr. 4, Brașov",
      "coordinates": { "lat": 45.6425, "lng": 25.5875 },
      "priceRange": "Peste 40 lei",
      "tags": ["lounge", "modern", "evenimente", "prosecco", "artiști"],
      "tip": "Verifică programul de evenimente – lansări de carte și expoziții frecvente.",
      "hours": "10:00–22:00",
      "image": "keys_coffee.jpg"
    },
    "krust": {
      "id": "krust",
      "name": "Krust Boulangerie",
      "atmosphere": "Modern",
      "shortDescription": "Patiserie franțuzească – baghete, croissante, prăjituri, cafea de calitate.",
      "description": "Krust e o boulangerie modernă cu baghete, croissante, prăjituri franțuzești și cafea de calitate. Design modern, arome de patiserie proaspătă.",
      "address": "Str. Tudor Arghezi nr. 8, Brașov",
      "coordinates": { "lat": 45.6480, "lng": 25.5955 },
      "priceRange": "20–40 lei",
      "tags": ["boulangerie", "croissante", "franțuzesc", "modern"],
      "tip": "Croissantul cu unt e cel mai bun din Brașov. Aroma la intrare te cucerește.",
      "hours": "07:30–19:00",
      "image": "krust.jpg"
    },

    "ch9": {
      "id": "ch9",
      "name": "CH9 Specialty Coffee",
      "atmosphere": "Liniștită",
      "shortDescription": "Cafea de specialitate în clădire din sec. XVII, vis-a-vis de Biserica Neagră – liniște și reflecție.",
      "description": "CH9 e în Curtea Honterus nr. 9, în casa paracliserului Bisericii Negre (sec. XVII). Cafea prăjită mediu de prăjitorii autohtone. Loc de liniște și reflecție, atmosphere luminoasă și autentică.",
      "address": "Curtea Johannes Honterus nr. 9, Brașov",
      "coordinates": { "lat": 45.6415, "lng": 25.5880 },
      "priceRange": "20–40 lei",
      "tags": ["specialty", "istoric", "liniște", "Biserica Neagră", "prăjituri casă"],
      "tip": "Terasă cu vedere la Biserica Neagră! Plăcinta cu mere și prăjiturile de casă sunt excelente.",
      "hours": "09:00–19:00",
      "image": "ch9.jpg"
    },
    "cafeteca_patria": {
      "id": "cafeteca_patria",
      "name": "Cafeteca Patria",
      "atmosphere": "Liniștită",
      "shortDescription": "Cafea de calitate, terasă liniștită cu pături, zonă de joacă pentru copii.",
      "description": "Cafeteca Patria oferă cafea de calitate, de la espresso la cold brew. Spațiu bine amenajat, terasă liniștită cu pături, zonă de joacă pentru copii. Servire promptă și amabilă.",
      "address": "Str. 15 Noiembrie nr. 33, Brașov",
      "coordinates": { "lat": 45.6450, "lng": 25.5920 },
      "priceRange": "20–40 lei",
      "tags": ["liniștit", "copii", "terasă", "cold brew", "pet-friendly"],
      "tip": "Are zonă de joacă pentru copii și e pet-friendly! Ideal pentru familii.",
      "hours": "08:00–21:00",
      "image": "cafeteca_patria.jpg"
    },
    "arborele": {
      "id": "arborele",
      "name": "Arborele de Cafea",
      "atmosphere": "Liniștită",
      "shortDescription": "Cafea excelentă, prețuri accesibile, atmosferă liniștită – flat white remarcabil.",
      "description": "Arborele de Cafea e apreciat pentru cafeaua excelentă, personal amabil și prețuri accesibile. Flat white-ul și briosa de ciocolată sunt recomandate. Acceptă Revolut.",
      "address": "Brașov",
      "coordinates": { "lat": 45.6440, "lng": 25.5910 },
      "priceRange": "Sub 20 lei",
      "tags": ["accesibil", "liniștit", "flat white", "prietenos"],
      "tip": "Flat white-ul și briosa de ciocolată – combo perfect sub 20 lei.",
      "hours": "08:00–19:00",
      "image": "arborele.jpg"
    },
    "vizavi": {
      "id": "vizavi",
      "name": "Vizavi",
      "atmosphere": "Liniștită",
      "shortDescription": "Cafea de specialitate și cocktailuri – atmosferă calmă, patiserie Tothek.",
      "description": "Vizavi oferă cafea de specialitate și cocktailuri la superlativ. Patiseria vine de la Brutăria Tothek. Atmosferă calmă și rafinată.",
      "address": "Str. Ioan Popasu nr. 53, Brașov",
      "coordinates": { "lat": 45.6458, "lng": 25.5898 },
      "priceRange": "20–40 lei",
      "tags": ["cocktailuri", "specialty", "calm", "patiserie Tothek"],
      "tip": "Cocktailurile cu cafea sunt unice! Patiseria de la Tothek – the best.",
      "hours": "10:00–22:00",
      "image": "vizavi.jpg"
    },
    "manole": {
      "id": "manole",
      "name": "Manole Coffee",
      "atmosphere": "Liniștită",
      "shortDescription": "Coffee truck cu suflet – pe Bălcescu vis-a-vis de Teatru, cafea excelentă to go.",
      "description": "Manole e un coffee truck drag brașovenilor, pe trotuarul de pe Bălcescu, vis-a-vis de Teatru. Cafea excelentă, atmosferă relaxată, parfum de cafea pe stradă.",
      "address": "Bd. Nicolae Bălcescu (vis-a-vis de Teatru), Brașov",
      "coordinates": { "lat": 45.6455, "lng": 25.5930 },
      "priceRange": "Sub 20 lei",
      "tags": ["coffee truck", "to go", "accesibil", "stradal"],
      "tip": "Cel mai bun espresso de pe stradă din Brașov. Rapid și accesibil.",
      "hours": "08:00–17:00",
      "image": "manole.jpg"
    },
    "la_a_doua": {
      "id": "la_a_doua",
      "name": "La a Doua Cafea",
      "atmosphere": "Liniștită",
      "shortDescription": "Cafenea mică, intimă, perfectă pentru citit sau lucru – atmosferă calmă.",
      "description": "Un loc mic și intim, perfect pentru o pauză liniștită cu o cafea buna. Atmosferă calmă, ideal pentru citit, scris sau lucru la laptop.",
      "address": "Centru, Brașov",
      "coordinates": { "lat": 45.6442, "lng": 25.5908 },
      "priceRange": "Sub 20 lei",
      "tags": ["intim", "liniștit", "lucru", "citit"],
      "tip": "Perfect dacă ai nevoie de liniște și o cafea bună – fără zgomot.",
      "hours": "08:00–18:00",
      "image": "la_a_doua.jpg"
    },

    "opus9": {
      "id": "opus9",
      "name": "Opus 9",
      "atmosphere": "Terasă",
      "shortDescription": "Terasă în Piața Enescu – latte excepțional, burgeri, brunch, rating 4.8.",
      "description": "Opus 9 în Piața George Enescu – latte excepțional, meniu de brunch și burgeri. Terasă generoasă cu vedere spre centrul vechi. Rating 4.8 pe TripAdvisor, locul #27 din Brașov.",
      "address": "Piața George Enescu nr. 9, Brașov",
      "coordinates": { "lat": 45.6423, "lng": 25.5868 },
      "priceRange": "Peste 40 lei",
      "tags": ["terasă", "brunch", "latte", "centru vechi", "top rated"],
      "tip": "Brunch-ul de weekend pe terasă e o experiență. Latte-ul – cel mai bun din Brașov.",
      "hours": "09:00–23:00",
      "image": "opus9.jpg"
    },
    "tipografia": {
      "id": "tipografia",
      "name": "Tipografia Tea & Coffee House",
      "atmosphere": "Terasă",
      "shortDescription": "Mix boem de galerie, cafenea și bar – terasă cu personalitate, cold brew excelent.",
      "description": "Tipografia e deja un clasic. Mix de galerie, cafenea și bar, cu terasă plină de personalitate pe str. Postăvarului. Cafea, ceai, bere artizanală, vin. Atmosferă relaxată, decor artistic. Selectat Gault&Millau.",
      "address": "Str. Postăvarului nr. 1, Brașov",
      "coordinates": { "lat": 45.6420, "lng": 25.5865 },
      "priceRange": "20–40 lei",
      "tags": ["boem", "galerie", "terasă", "artsy", "cold brew", "Gault&Millau"],
      "tip": "Cold brew-ul e printre cele mai bune din oraș. Terasa seara – magică!",
      "hours": "10:00–00:00",
      "image": "tipografia.jpg"
    },
    "galleria": {
      "id": "galleria",
      "name": "Galleria",
      "atmosphere": "Terasă",
      "shortDescription": "Terasă pe deal cu vedere asupra Brașovului – tiramisu martini legendar.",
      "description": "Galleria e pe o colină cu vedere asupra orașului vechi. Terasă superbă, cocktailuri de specialitate (tiramisu martini!), cafea bună. Atmosferă elegantă dar relaxată.",
      "address": "Brașov (zona centrală, deal)",
      "coordinates": { "lat": 45.6435, "lng": 25.5870 },
      "priceRange": "Peste 40 lei",
      "tags": ["terasă", "vedere", "cocktailuri", "elegant", "tiramisu martini"],
      "tip": "Tiramisu martini-ul e legendar! Apusul de pe terasă – spectaculos.",
      "hours": "10:00–23:00",
      "image": "galleria.jpg"
    },
    "cafeteca_magnolia": {
      "id": "cafeteca_magnolia",
      "name": "Cafeteca Magnolia",
      "atmosphere": "Terasă",
      "shortDescription": "Brand iconic brașovean – terasă pet-friendly, cafea prăjită în casă, ceai premium.",
      "description": "Cafeteca e cel mai cunoscut brand de cafea brașovean, fondat din pasiune. Prăjesc cafea în casă, selecție excelentă de ceai. Terasă pet-friendly la Magnolia Shopping Center.",
      "address": "Magnolia Shopping Center, Brașov",
      "coordinates": { "lat": 45.6500, "lng": 25.6020 },
      "priceRange": "20–40 lei",
      "tags": ["brand local", "pet-friendly", "terasă", "prăjitorie", "ceai"],
      "tip": "Eduard, proprietarul, e un pasionat – cere recomandare de cafea!",
      "hours": "09:00–21:00",
      "image": "cafeteca_magnolia.jpg"
    },
    "street_cafe": {
      "id": "street_cafe",
      "name": "Street Cafe & Pub",
      "atmosphere": "Terasă",
      "shortDescription": "Terasă caldă și prietenoasă – burgeri, limonadă generoasă, vibe de familie.",
      "description": "Street Cafe pe str. Latină – terasă caldă, servire excelentă, burgeri delicioși, limonadă generoasă. Vibe de familie, atmosferă prietenoasă, prețuri corecte.",
      "address": "Str. Latină nr. 15, Brașov",
      "coordinates": { "lat": 45.6415, "lng": 25.5890 },
      "priceRange": "20–40 lei",
      "tags": ["terasă", "pub", "burgeri", "prietenos", "familie"],
      "tip": "Limonada e generoasă și proaspătă. Terasă perfectă vara!",
      "hours": "10:00–23:00",
      "image": "street_cafe.jpg"
    }
  },

  "results": {
    "a-a-a": { "combination": { "q1": "Cozy", "q2": "Singur", "q3": "Sub 20 lei" }, "recommendations": ["croitoria", "moa_bakery", "schilthorn"] },
    "a-a-b": { "combination": { "q1": "Cozy", "q2": "Singur", "q3": "20–40 lei" }, "recommendations": ["book_coffee", "dallmayr", "schilthorn"] },
    "a-a-c": { "combination": { "q1": "Cozy", "q2": "Singur", "q3": "Peste 40 lei" }, "recommendations": ["bistro_weiss", "book_coffee", "dallmayr"] },
    "a-b-a": { "combination": { "q1": "Cozy", "q2": "Cuplu", "q3": "Sub 20 lei" }, "recommendations": ["croitoria", "moa_bakery", "schilthorn"] },
    "a-b-b": { "combination": { "q1": "Cozy", "q2": "Cuplu", "q3": "20–40 lei" }, "recommendations": ["book_coffee", "dallmayr", "schilthorn"] },
    "a-b-c": { "combination": { "q1": "Cozy", "q2": "Cuplu", "q3": "Peste 40 lei" }, "recommendations": ["bistro_weiss", "book_coffee", "dallmayr"] },
    "a-c-a": { "combination": { "q1": "Cozy", "q2": "Prieteni", "q3": "Sub 20 lei" }, "recommendations": ["moa_bakery", "croitoria", "schilthorn"] },
    "a-c-b": { "combination": { "q1": "Cozy", "q2": "Prieteni", "q3": "20–40 lei" }, "recommendations": ["dallmayr", "schilthorn", "book_coffee"] },
    "a-c-c": { "combination": { "q1": "Cozy", "q2": "Prieteni", "q3": "Peste 40 lei" }, "recommendations": ["bistro_weiss", "dallmayr", "book_coffee"] },
    "a-d-a": { "combination": { "q1": "Cozy", "q2": "Familie", "q3": "Sub 20 lei" }, "recommendations": ["moa_bakery", "croitoria", "schilthorn"] },
    "a-d-b": { "combination": { "q1": "Cozy", "q2": "Familie", "q3": "20–40 lei" }, "recommendations": ["dallmayr", "schilthorn", "book_coffee"] },
    "a-d-c": { "combination": { "q1": "Cozy", "q2": "Familie", "q3": "Peste 40 lei" }, "recommendations": ["bistro_weiss", "dallmayr", "schilthorn"] },

    "b-a-a": { "combination": { "q1": "Modern", "q2": "Singur", "q3": "Sub 20 lei" }, "recommendations": ["clav", "nola", "spired"] },
    "b-a-b": { "combination": { "q1": "Modern", "q2": "Singur", "q3": "20–40 lei" }, "recommendations": ["nola", "spired", "focus_coffee"] },
    "b-a-c": { "combination": { "q1": "Modern", "q2": "Singur", "q3": "Peste 40 lei" }, "recommendations": ["keys_coffee", "krust", "nola"] },
    "b-b-a": { "combination": { "q1": "Modern", "q2": "Cuplu", "q3": "Sub 20 lei" }, "recommendations": ["clav", "nola", "krust"] },
    "b-b-b": { "combination": { "q1": "Modern", "q2": "Cuplu", "q3": "20–40 lei" }, "recommendations": ["nola", "krust", "focus_coffee"] },
    "b-b-c": { "combination": { "q1": "Modern", "q2": "Cuplu", "q3": "Peste 40 lei" }, "recommendations": ["keys_coffee", "krust", "nola"] },
    "b-c-a": { "combination": { "q1": "Modern", "q2": "Prieteni", "q3": "Sub 20 lei" }, "recommendations": ["clav", "nola", "spired"] },
    "b-c-b": { "combination": { "q1": "Modern", "q2": "Prieteni", "q3": "20–40 lei" }, "recommendations": ["focus_coffee", "spired", "nola"] },
    "b-c-c": { "combination": { "q1": "Modern", "q2": "Prieteni", "q3": "Peste 40 lei" }, "recommendations": ["keys_coffee", "krust", "nola"] },
    "b-d-a": { "combination": { "q1": "Modern", "q2": "Familie", "q3": "Sub 20 lei" }, "recommendations": ["clav", "nola", "krust"] },
    "b-d-b": { "combination": { "q1": "Modern", "q2": "Familie", "q3": "20–40 lei" }, "recommendations": ["focus_coffee", "krust", "nola"] },
    "b-d-c": { "combination": { "q1": "Modern", "q2": "Familie", "q3": "Peste 40 lei" }, "recommendations": ["keys_coffee", "krust", "focus_coffee"] },

    "c-a-a": { "combination": { "q1": "Liniștită", "q2": "Singur", "q3": "Sub 20 lei" }, "recommendations": ["arborele", "manole", "la_a_doua"] },
    "c-a-b": { "combination": { "q1": "Liniștită", "q2": "Singur", "q3": "20–40 lei" }, "recommendations": ["ch9", "vizavi", "cafeteca_patria"] },
    "c-a-c": { "combination": { "q1": "Liniștită", "q2": "Singur", "q3": "Peste 40 lei" }, "recommendations": ["vizavi", "ch9", "cafeteca_patria"] },
    "c-b-a": { "combination": { "q1": "Liniștită", "q2": "Cuplu", "q3": "Sub 20 lei" }, "recommendations": ["arborele", "la_a_doua", "manole"] },
    "c-b-b": { "combination": { "q1": "Liniștită", "q2": "Cuplu", "q3": "20–40 lei" }, "recommendations": ["ch9", "vizavi", "cafeteca_patria"] },
    "c-b-c": { "combination": { "q1": "Liniștită", "q2": "Cuplu", "q3": "Peste 40 lei" }, "recommendations": ["vizavi", "ch9", "cafeteca_patria"] },
    "c-c-a": { "combination": { "q1": "Liniștită", "q2": "Prieteni", "q3": "Sub 20 lei" }, "recommendations": ["arborele", "manole", "la_a_doua"] },
    "c-c-b": { "combination": { "q1": "Liniștită", "q2": "Prieteni", "q3": "20–40 lei" }, "recommendations": ["cafeteca_patria", "ch9", "vizavi"] },
    "c-c-c": { "combination": { "q1": "Liniștită", "q2": "Prieteni", "q3": "Peste 40 lei" }, "recommendations": ["vizavi", "ch9", "cafeteca_patria"] },
    "c-d-a": { "combination": { "q1": "Liniștită", "q2": "Familie", "q3": "Sub 20 lei" }, "recommendations": ["arborele", "la_a_doua", "manole"] },
    "c-d-b": { "combination": { "q1": "Liniștită", "q2": "Familie", "q3": "20–40 lei" }, "recommendations": ["cafeteca_patria", "ch9", "vizavi"] },
    "c-d-c": { "combination": { "q1": "Liniștită", "q2": "Familie", "q3": "Peste 40 lei" }, "recommendations": ["cafeteca_patria", "vizavi", "ch9"] },

    "d-a-a": { "combination": { "q1": "Terasă", "q2": "Singur", "q3": "Sub 20 lei" }, "recommendations": ["street_cafe", "cafeteca_magnolia", "tipografia"] },
    "d-a-b": { "combination": { "q1": "Terasă", "q2": "Singur", "q3": "20–40 lei" }, "recommendations": ["tipografia", "cafeteca_magnolia", "street_cafe"] },
    "d-a-c": { "combination": { "q1": "Terasă", "q2": "Singur", "q3": "Peste 40 lei" }, "recommendations": ["opus9", "galleria", "tipografia"] },
    "d-b-a": { "combination": { "q1": "Terasă", "q2": "Cuplu", "q3": "Sub 20 lei" }, "recommendations": ["cafeteca_magnolia", "street_cafe", "tipografia"] },
    "d-b-b": { "combination": { "q1": "Terasă", "q2": "Cuplu", "q3": "20–40 lei" }, "recommendations": ["tipografia", "cafeteca_magnolia", "street_cafe"] },
    "d-b-c": { "combination": { "q1": "Terasă", "q2": "Cuplu", "q3": "Peste 40 lei" }, "recommendations": ["galleria", "opus9", "tipografia"] },
    "d-c-a": { "combination": { "q1": "Terasă", "q2": "Prieteni", "q3": "Sub 20 lei" }, "recommendations": ["street_cafe", "cafeteca_magnolia", "tipografia"] },
    "d-c-b": { "combination": { "q1": "Terasă", "q2": "Prieteni", "q3": "20–40 lei" }, "recommendations": ["tipografia", "street_cafe", "cafeteca_magnolia"] },
    "d-c-c": { "combination": { "q1": "Terasă", "q2": "Prieteni", "q3": "Peste 40 lei" }, "recommendations": ["opus9", "galleria", "tipografia"] },
    "d-d-a": { "combination": { "q1": "Terasă", "q2": "Familie", "q3": "Sub 20 lei" }, "recommendations": ["cafeteca_magnolia", "street_cafe", "tipografia"] },
    "d-d-b": { "combination": { "q1": "Terasă", "q2": "Familie", "q3": "20–40 lei" }, "recommendations": ["cafeteca_magnolia", "street_cafe", "tipografia"] },
    "d-d-c": { "combination": { "q1": "Terasă", "q2": "Familie", "q3": "Peste 40 lei" }, "recommendations": ["opus9", "cafeteca_magnolia", "galleria"] }
  }
}

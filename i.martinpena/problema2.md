# Soluciones al problema 2

## Apartado 1

```
db.listingsAndReviews.find().sort({ number_of_reviews: -1 }).limit(1).projection({ name: 1, number_of_reviews: 1 })
```

## Apartado 2

```
db.listingsAndReviews.aggregate([
  { $project: { name: 1, amenities_count: { $size: "$amenities" } } },
  { $sort: { amenities_count: -1 } },
  { $limit: 1 }
])
```

## Apartado 3
```
db.listingsAndReviews.aggregate([
  { "$group": { _id: "$property_type", count: { "$sum": 1 } } }
])
```
# Soluciones al problema 2

## Apartado 1: En la coleccion movies indique el  titulo y el numero de premios de la pelicula con mas premios (wins dentro de awards)



## Apartado 2: en la coleccion movies muestre un listado con las diferentes clasificaciones de edad que existes (rated). Para cada uno de ellos muestre el numero de documentos que tienen esa clasificacion




## Apartado 3: en la coleccion movies muestre un listado con los diferentes generos de pelicula que existen (genres)



## Apartado 4: en la coleccion movies indique el numero de peliculas que hay entre los años 1970 y 1975 incluidos ambos extremos



### 1. Indicar el título y el número de premios de la película con más premios (wins dentro de awards)

Para encontrar la película con más premios, puedes utilizar la siguiente consulta de agregación:

```javascript
db.movies.aggregate([
  {
    $project: {
      title: 1,
      numAwards: "$awards.wins"
    }
  },
  {
    $sort: { numAwards: -1 }
  },
  {
    $limit: 1
  }
])
```

### 2. Listar las diferentes clasificaciones de edad que existen (`rated`) y el número de documentos que tienen esa clasificación

Para listar las clasificaciones de edad y el número de documentos para cada una, utiliza esta consulta:

```javascript
db.movies.aggregate([
  {
    $group: {
      _id: "$rated",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### 3. Listar los diferentes géneros de película que existen (`genres`)

Para obtener un listado con los diferentes géneros de películas, utiliza esta consulta:

```javascript
db.movies.aggregate([
  {
    $unwind: "$genres"
  },
  {
    $group: {
      _id: "$genres",
      count: { $sum: 1 }
    }
  },
  {
    $sort: { count: -1 }
  }
])
```

### 4. Indicar el número de películas que hay entre los años 1970 y 1975, incluidos ambos extremos

Para contar el número de películas entre los años 1970 y 1975, puedes utilizar esta consulta:

```javascript
db.movies.countDocuments({
  year: { $gte: 1970, $lte: 1975 }
})
```

### Explicación de las Consultas

1. **Consulta de la Película con Más Premios**:
   - **$project**: Selecciona los campos `title` y `awards.wins`, renombrando este último a `numAwards`.
   - **$sort**: Ordena los documentos en orden descendente según el número de premios.
   - **$limit**: Limita la salida a solo 1 documento, la película con más premios.

2. **Consulta de Clasificaciones de Edad**:
   - **$group**: Agrupa los documentos por el campo `rated` y cuenta el número de documentos en cada grupo.
   - **$sort**: Ordena los resultados por el conteo de documentos en orden descendente.

3. **Consulta de Géneros de Película**:
   - **$unwind**: Descompone el arreglo `genres` para que cada elemento del arreglo se procese como un documento separado.
   - **$group**: Agrupa los documentos por el campo `genres` y cuenta el número de documentos en cada grupo.
   - **$sort**: Ordena los resultados por el conteo de documentos en orden descendente.

4. **Consulta de Películas entre 1970 y 1975**:
   - **countDocuments**: Cuenta los documentos que cumplen con la condición de que el campo `year` esté entre 1970 y 1975, inclusive.

Estas consultas te permitirán obtener la información solicitada de la colección `movies`. Asegúrate de tener índices adecuados en los campos que estás consultando (como `year`, `rated`, `genres`, y `awards.wins`) para mejorar el rendimiento de las consultas.




## Apartado 4

```
db.listingsAndReviews.find({ beds: { $in: [2, 3, 4, 5] } }).count()
```
en la coleccion movies indique el titulo y el numero  de premios de la pelicula con mas premios (wins dentro de a
{"_id":{"$oid":"573a1390f29313caabcd5b9a"},"plot":"In the wayward western town known as Hell's Hinges, a local tough guy is reformed by the faith of a good woman.","genres":["Romance","Western"],"runtime":64,"rated":"UNRATED","cast":["William S. Hart","Clara Williams","Jack Standing","Alfred Hollingsworth"],"num_mflix_comments":1,"title":"Hell's Hinges","fullplot":"When Reverend Robert Henley and his sister Faith arrive in the town of Hell's Hinges, saloon owner Silk Miller and his cohorts sense danger to their evil ways. They hire gunman Blaze Tracy to run the minister out of town. But Blaze finds something in Faith Henley that turns him around, and soon Silk Miller and his compadres have Blaze to deal with.","languages":["English"],"released":{"$date":{"$numberLong":"-1698624000000"}},"directors":["Charles Swickard","William S. Hart","Clifford Smith"],"writers":["C. Gardner Sullivan (screenplay)","C. Gardner Sullivan (story)"],"awards":{"wins":1,"nominations":0,"text":"1 win."},"lastupdated":"2015-08-16 01:13:00.090000000","year":1916,"imdb":{"rating":6.4,"votes":531,"id":6780},"countries":["USA"],"type":"movie","tomatoes":{"viewer":{"rating":3.2,"numReviews":98,"meter":36},"lastUpdated":{"$date":"2015-09-01T19:31:17Z"}}}
{"_id":{"$oid":"573a1390f29313caabcd5c0f"},"plot":"The story of a poor young woman, separated by prejudice from her husband and baby, is interwoven with tales of intolerance from throughout history.","genres":["Drama","History"],"runtime":197,"rated":"NOT RATED","cast":["Lillian Gish","Spottiswoode Aitken","Mary Alden","Frank Bennett"],"num_mflix_comments":0,"poster":"https://m.media-amazon.com/images/M/MV5BZTc0YjA1ZjctOTFlZi00NWRiLWE2MTAtZDE1MWY1YTgzOTJjXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SY1000_SX677_AL_.jpg","title":"Intolerance: Love's Struggle Throughout the Ages","fullplot":"Intolerance and its terrible effects are examined in four historical eras. In ancient Babylon, a mountain girl is caught up in the religious rivalry that leads to the city's downfall. In Judea, the hypocritical Pharisees condemn Jesus Christ. In 1572 Paris, unaware of the impending St. Bartholomew's Day Massacre, two young Huguenots prepare for marriage. Finally, in modern America, social reformers destroy the lives of a young woman and her beloved.","countries":["USA"],"released":{"$date":{"$numberLong":"-1682726400000"}},"directors":["D.W. Griffith"],"writers":["D.W. Griffith (scenario)","Anita Loos (titles)"],"awards":{"wins":1,"nominations":0,"text":"1 win."},"lastupdated":"2015-09-05 00:01:19.580000000","year":1916,"imdb":{"rating":8.0,"votes":9880,"id":6864},"type":"movie","tomatoes":{"viewer":{"rating":3.8,"numReviews":4718,"meter":78},"dvd":{"$date":"2002-12-10T00:00:00Z"},"critic":{"rating":8.1,"numReviews":32,"meter":97},"lastUpdated":{"$date":"2015-09-15T17:02:34Z"},"consensus":"A pioneering classic and one of the most influential films ever made, D.W. Griffith's Intolerance stands as the crowning jewel in an incredible filmography.","rotten":1,"production":"Cohen Media Group","fresh":31}}
{"_id":{"$oid":"573a1390f29313caabcd5ea4"},"plot":"A District Attorney's outspoken stand on abortion gets him in trouble with the local community.","genres":["Drama"],"runtime":62,"rated":"APPROVED","cast":["Tyrone Power Sr.","Helen Riaume","Marie Walcamp","Cora Drew"],"title":"Where Are My Children?","fullplot":"While prosecuting a physician for the death of a client after an abortion, the district attorney discovers that his wife helped her society friends and the daughter of her maid obtain and pay for abortions from the physician (and was perhaps herself also a client.)","languages":["English"],"released":{"$date":{"$numberLong":"-1693699200000"}},"directors":["Phillips Smalley","Lois Weber"],"writers":["Lucy Payton (from the story by)","Franklin Hall (from the story by)","Lois Weber","Phillips Smalley"],"awards":{"wins":1,"nominations":0,"text":"1 win."},"lastupdated":"2015-09-07 00:51:32.560000000","year":1916,"imdb":{"rating":5.9,"votes":247,"id":7558},"countries":["USA"],"type":"movie","tomatoes":{"viewer":{"rating":3.1,"numReviews":34,"meter":50},"production":"MCA/Universal Pictures","lastUpdated":{"$date":"2015-08-06T19:49:17Z"}},"num_mflix_comments":0}
{"_id":{"$oid":"573a1396f29313caabce5480"},"plot":"The small town of Paris, Australia deliberately causes car accidents, then sells/salvages all valuables from the wrecks as a means of economy.","genres":["Comedy","Horror","Mystery"],"runtime":91,"rated":"PG","cast":["John Meillon","Terry Camilleri","Kevin Miles","Rick Scully"],"poster":"https://m.media-amazon.com/images/M/MV5BNTVmOTdmYTktY2JmNi00YzJmLWJjNGItMjNmOWM1MDM0MjZiL2ltYWdlXkEyXkFqcGdeQXVyMTYxNjkxOQ@@._V1_SY1000_SX677_AL_.jpg","title":"The Cars That Eat People","fullplot":"A small town in rural Australia (Paris) makes its living by causing car accidents and salvaging any valuables from the wrecks. Into this town come brothers Arthur and George. George is killed when the Parisians cause their car to crash, but Arthur survives and is brought into the community as an orderly at the hospital. But Paris is not problem free. Not only do the Parisians have to be careful of outsiders (such as insurance investigators), but they also have to cope with the young people of the town who are dissatisfied with the status quo.","languages":["English"],"released":{"$date":"1976-06-01T00:00:00Z"},"directors":["Peter Weir"],"writers":["Peter Weir (screenplay)","Peter Weir (story)","Keith Gow (story)","Piers Davies (story)"],"awards":{"wins":0,"nominations":1,"text":"1 nomination."},"lastupdated":"2015-08-21 00:52:15.797000000","year":1974,"imdb":{"rating":5.6,"votes":2437,"id":71282},"countries":["Australia"],"type":"movie","tomatoes":{"viewer":{"rating":2.9,"numReviews":2062,"meter":33},"dvd":{"$date":"2004-05-04T00:00:00Z"},"critic":{"rating":6.0,"numReviews":9,"meter":56},"lastUpdated":{"$date":"2015-09-15T17:32:42Z"},"rotten":4,"production":"Criterion Collection","fresh":5},"num_mflix_comments":0}
{"_id":{"$oid":"573a1396f29313caabce5499"},"fullplot":"JJ 'Jake' Gittes is a private detective who seems to specialize in matrimonial cases. He is hired by Evelyn Mulwray when she suspects her husband Hollis, builder of the city's water supply system, of having an affair. Gittes does what he does best and photographs him with a young girl but in the ensuing scandal, it seems he was hired by an impersonator and not the real Mrs. Mulwray. When Mr. Mulwray is found dead, Jake is plunged into a complex web of deceit involving murder, incest and municipal corruption all related to the city's water supply.","imdb":{"rating":8.3,"votes":195026,"id":71315},"year":1974,"plot":"A private detective hired to expose an adulterer finds himself caught up in a web of deceit, corruption and murder.","genres":["Crime","Drama","Mystery"],"rated":"R","metacritic":86,"title":"Chinatown","lastupdated":"2015-09-05 00:01:28.970000000","languages":["English","Cantonese","Spanish"],"writers":["Robert Towne"],"type":"movie","tomatoes":{"viewer":{"rating":4.2,"numReviews":75320,"meter":93},"dvd":{"$date":"1999-11-23T00:00:00Z"},"critic":{"rating":9.3,"numReviews":61,"meter":98},"lastUpdated":{"$date":"2015-09-12T17:04:40Z"},"consensus":"As bruised and cynical as the decade that produced it, this noir classic benefits from Robert Towne's brilliant screenplay, director Roman Polanski's steady hand, and wonderful performances from Jack Nicholson and Faye Dunaway.","rotten":1,"production":"Paramount Pictures","fresh":60},"poster":"https://m.media-amazon.com/images/M/MV5BOGMwYmY5ZmEtMzY1Yi00OWJiLTk1Y2MtMzI2MjBhYmZkNTQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SY1000_SX677_AL_.jpg","num_mflix_comments":1,"released":{"$date":"1974-06-20T00:00:00Z"},"awards":{"wins":22,"nominations":22,"text":"Won 1 Oscar. Another 21 wins & 22 nominations."},"countries":["USA"],"cast":["Jack Nicholson","Faye Dunaway","John Huston","Perry Lopez"],"directors":["Roman Polanski"],"runtime":130}
{"_id":{"$oid":"573a1396f29313caabce54a9"},"plot":"Claudine tries to provide for her six children in Harlem while on welfare. She has a romance with Roop, a cheerful garbageman she meets while working on the side as a maid.","genres":["Comedy","Drama","Romance"],"runtime":92,"rated":"PG","cast":["Diahann Carroll","James Earl Jones","Lawrence Hilton-Jacobs","Tamu Blackwell"],"poster":"https://m.media-amazon.com/images/M/MV5BNzY3NGFlYTMtN2M2MS00YTUwLWJmYzgtYjExMzU4MGQyMmIzXkEyXkFqcGdeQXVyMTMxMTY0OTQ@._V1_SY1000_SX677_AL_.jpg","title":"Claudine","fullplot":"Claudine tries to provide for her six children in Harlem while on welfare. She has a romance with Roop, a cheerful garbageman she meets while working on the side as a maid.","languages":["English"],"released":{"$date":"1976-08-06T00:00:00Z"},"directors":["John Berry"],"writers":["Lester Pine","Tina Pine"],"awards":{"wins":3,"nominations":4,"text":"Nominated for 1 Oscar. Another 2 wins & 4 nominations."},"lastupdated":"2015-09-04 00:25:36.570000000","year":1974,"imdb":{"rating":7.3,"votes":1014,"id":71334},"countries":["USA"],"type":"movie","tomatoes":{"viewer":{"rating":4.2,"numReviews":2782,"meter":92},"dvd":{"$date":"2003-01-14T00:00:00Z"},"lastUpdated":{"$date":"2015-09-16T19:34:19Z"}},"num_mflix_comments":0}
{"_id":{"$oid":"573a1396f29313caabce54b7"},"plot":"White Pat Conroy was born and raised in Beaufort, South Carolina. In March, 1969 under the Beaufort School District, he starts a job teaching at a small poor school located on Daufuskie ...","genres":["Drama"],"runtime":106,"rated":"PG","cast":["Jon Voight","Paul Winfield","Madge Sinclair","Tina Andrews"],"num_mflix_comments":0,"title":"Conrack","fullplot":"White Pat Conroy was born and raised in Beaufort, South Carolina. In March, 1969 under the Beaufort School District, he starts a job teaching at a small poor school located on Daufuskie Island, an island in a South Carolina river delta, the island accessible only by boat. The island is inhabited exclusively by blacks. He quickly learns that his students, who have never left the island, lack not only a basic understanding of academic items such as the alphabet and simple arithmetic, but also of other basic necessities of life such as personal hygiene. They can't even pronounce his name, they who call him Conrack. The teachers before him, including the school principal Mrs. Scott, have always treated the students as being slow and basically unteachable of academics. Conrack, a free thinking man, decides to expose his students not only to the academic subjects, but also to the gamut of life skills from brushing one's teeth to human anatomy, and some of the fun things in life like classical music, art, baseball, movies, swimming (despite living on an island, the islanders live in fear of the river because they don't know how to swim) and Halloween. He does so with compassion and without being patronizing. His teaching methods come under question by both Mrs. Scott and the Beauford School District administration led by its superintendent, Mr. Skeffington. These differences in viewpoint may place Conrack's tenure at the school in jeopardy.","languages":["English"],"released":{"$date":"1974-08-28T00:00:00Z"},"directors":["Martin Ritt"],"writers":["Pat Conroy (novel)","Irving Ravetch","Harriet Frank Jr."],"awards":{"wins":1,"nominations":1,"text":"1 win & 1 nomination."},"lastupdated":"2015-09-12 00:35:40.967000000","year":1974,"imdb":{"rating":7.3,"votes":1210,"id":71358},"countries":["USA"],"type":"movie","tomatoes":{"viewer":{"rating":4.0,"numReviews":262,"meter":81},"critic":{"rating":6.1,"numReviews":11,"meter":73},"lastUpdated":{"$date":"2015-08-20T19:36:23Z"},"rotten":3,"production":"20th Century Fox","fresh":8}}
{"_id":{"$oid":"573a1396f29313caabce54c3"},"fullplot":"Harry Caul is a devout Catholic and a lover of jazz music who plays his saxophone while listening to his jazz records. He is a San Francisco-based electronic surveillance expert who owns and operates his own small surveillance business. He is renowned within the profession as being the best, one who designs and constructs his own surveillance equipment. He is an intensely private and solitary man in both his personal and professional life, which especially irks Stan, his business associate who often feels shut out of what is happening with their work. This privacy, which includes not letting anyone into his apartment and always telephoning his clients from pay phones is, in part, intended to control what happens around him. His and Stan's latest job (a difficult one) is to record the private discussion of a young couple meeting in crowded and noisy Union Square. The arrangement with his client, known only to him as \"the director\", is to provide the audio recording of the discussion and photographs of the couple directly to him alone in return for payment. Based on circumstances with the director's assistant, Martin Stett, and what Harry ultimately hears on the recording, Harry believes that the lives of the young couple are in jeopardy. Harry used to be detached from what he recorded, but is now concerned ever since the deaths of three people that were the direct result of a previous audio recording he made for another job. Harry not only has to decide if he will turn the recording over to the director, but also if he will try and save the couple's lives using information from the recording. As Harry goes on a quest to find out what exactly is happening on this case, he finds himself in the middle of his worst nightmare.","imdb":{"rating":7.9,"votes":69112,"id":71360},"year":1974,"plot":"A paranoid, secretive surveillance expert has a crisis of conscience when he suspects that a couple he is spying on will be murdered.","genres":["Drama","Mystery","Thriller"],"rated":"PG","metacritic":86,"title":"The Conversation","lastupdated":"2015-09-12 00:33:15.760000000","languages":["English"],"writers":["Francis Ford Coppola"],"type":"movie","tomatoes":{"viewer":{"rating":4.1,"numReviews":33748,"meter":90},"dvd":{"$date":"2000-12-12T00:00:00Z"},"critic":{"rating":8.7,"numReviews":46,"meter":98},"lastUpdated":{"$date":"2015-09-15T17:05:57Z"},"consensus":"This tense, paranoid thriller presents Francis Ford Coppola at his finest -- and makes some remarkably advanced arguments about technology's role in society that still resonate today.","rotten":1,"production":"Paramount Pictures","fresh":45},"poster":"https://m.media-amazon.com/images/M/MV5BYTQxYWJlYTgtMTk5MS00ZGFiLWI5MWItYjhkNjM3YmUyNjYxXkEyXkFqcGdeQXVyNjUwNzk3NDc@._V1_SY1000_SX677_AL_.jpg","num_mflix_comments":0,"released":{"$date":"1974-06-01T00:00:00Z"},"awards":{"wins":18,"nominations":11,"text":"Nominated for 3 Oscars. Another 15 wins & 11 nominations."},"countries":["USA"],"cast":["Gene Hackman","John Cazale","Allen Garfield","Frederic Forrest"],"directors":["Francis Ford Coppola"],"runtime":113}
{"_id":{"$oid":"573a1396f29313caabce54ce"},"plot":"A mysteriously linked pair of young women find their daily lives pre-empted by a strange boudoir melodrama that plays itself out in a hallucinatory parallel reality.","genres":["Comedy","Drama","Fantasy"],"runtime":193,"rated":"UNRATED","cast":["Juliet Berto","Dominique Labourier","Bulle Ogier","Marie-France Pisier"],"num_mflix_comments":1,"poster":"https://m.media-amazon.com/images/M/MV5BYzg0NzljOWMtMGY5Mi00NmU2LWIzNzktZDE3YzNlZWMwZWFkXkEyXkFqcGdeQXVyNTc1NDM0NDU@._V1_SY1000_SX677_AL_.jpg","title":"Celine and Julie Go Boating","fullplot":"A mysteriously linked pair of young women find their daily lives pre-empted by a strange boudoir melodrama that plays itself out in a hallucinatory parallel reality.","languages":["French"],"released":{"$date":"1974-09-18T00:00:00Z"},"directors":["Jacques Rivette"],"writers":["Juliet Berto (scenario)","Dominique Labourier (scenario)","Bulle Ogier (scenario)","Marie-France Pisier (scenario)","Jacques Rivette (scenario)","Eduardo de Gregorio (dialogue)","Henry James (Film-within-film based on stories by)"],"awards":{"wins":1,"nominations":0,"text":"1 win."},"lastupdated":"2015-09-12 00:36:44.830000000","year":1974,"imdb":{"rating":7.9,"votes":3061,"id":71381},"countries":["France"],"type":"movie","tomatoes":{"viewer":{"rating":4.3,"numReviews":2138,"meter":91},"fresh":20,"critic":{"rating":8.0,"numReviews":21,"meter":95},"rotten":1,"lastUpdated":{"$date":"2015-09-11T18:10:28Z"}}}
{"_id":{"$oid":"573a1396f29313caabce54e5"},"plot":"A young man killed in Vietnam inexplicably returns home as a zombie.","genres":["Horror"],"runtime":88,"rated":"PG","cast":["John Marley","Lynn Carlin","Richard Backus","Henderson Forsythe"],"poster":"https://m.media-amazon.com/images/M/MV5BNjQyNjBkNDEtZDU2My00OWFhLTg4NjMtMjI2YzM1NDBmZTk3XkEyXkFqcGdeQXVyNzgzODI1OTE@._V1_SY1000_SX677_AL_.jpg","title":"Dead of Night","fullplot":"A young Soldier is killed in the line of duty in Vietnam. That same night, the soldier returns home, brought back by his Mother's wishes that he \"Don't Die\"! Upon his Return, Andy sits in his room, refusing to see his friends or family, venturing out only at night. The Vampiric horror is secondary to the terror that comes from the disintegration of a typical American family.","languages":["English"],"released":{"$date":"1974-08-29T00:00:00Z"},"directors":["Bob Clark"],"writers":["Alan Ormsby (screenplay)"],"awards":{"wins":1,"nominations":0,"text":"1 win."},"lastupdated":"2015-09-12 00:37:25.577000000","year":1974,"imdb":{"rating":6.8,"votes":2629,"id":68457},"countries":["Canada","UK"],"type":"movie","tomatoes":{"viewer":{"rating":3.5,"numReviews":1102,"meter":65},"dvd":{"$date":"2001-04-24T00:00:00Z"},"critic":{"rating":6.2,"numReviews":7,"meter":71},"lastUpdated":{"$date":"2015-08-20T18:43:32Z"},"rotten":2,"production":"Avalanche Entertainment","fresh":5},"num_mflix_comments":0}
{"_id":{"$oid":"573a1396f29313caabce54e6"},"plot":"A young boys' coming of age tale set in a strange, carnivalesque village becomes the recreation of a memory that the director has twenty years later.","genres":["Drama","Fantasy"],"runtime":104,"cast":["Kantarè Suga","Hiroyuki Takano","Sen Hara","Yoshio Harada"],"title":"Pastoral Hide and Seek","fullplot":"A young boys' coming of age tale set in a strange, carnivalesque village becomes the recreation of a memory that the director has twenty years later.","languages":["Japanese"],"released":{"$date":"1974-12-28T00:00:00Z"},"directors":["Shèji Terayama"],"writers":["Shèji Terayama"],"awards":{"wins":1,"nominations":2,"text":"1 win & 2 nominations."},"lastupdated":"2015-09-12 00:37:52.907000000","year":1974,"imdb":{"rating":7.9,"votes":556,"id":71406},"countries":["Japan"],"type":"movie","tomatoes":{"viewer":{"rating":4.3,"numReviews":190,"meter":90},"lastUpdated":{"$date":"2015-08-26T19:04:11Z"}},"num_mflix_comments":0}
{"_id":{"$oid":"573a1396f29313caabce54ea"},"plot":"The Russian army sends an explorer on an expedition to the snowy Siberian wilderness where he makes friends with a seasoned local hunter.","genres":["Adventure","Biography","Drama"],"runtime":144,"rated":"G","cast":["Yuriy Solomin","Maksim Munzuk","Mikhail Bychkov","Vladimir Khrulev"],"num_mflix_comments":1,"poster":"https://m.media-amazon.com/images/M/MV5BM2QyNGQ5ZjgtZDY2OS00NjM3LWEwM2MtMDY4YjJlOGJlY2VmL2ltYWdlXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SY1000_SX677_AL_.jpg","title":"Dersu Uzala","fullplot":"A Russian army explorer who is rescued in Siberia by a rugged Asian hunter renews his friendship with the woodsman years later when he returns as the head of a larger expedition. The hunter finds that all of his nature lore is of no help when he accompanies the explorer back to civilization.","languages":["Russian","Chinese"],"released":{"$date":"1977-12-20T00:00:00Z"},"directors":["Akira Kurosawa"],"writers":["Akira Kurosawa (screenplay)","Yuriy Nagibin (screenplay)","Vladimir Arsenev (novel)"],"awards":{"wins":8,"nominations":0,"text":"Won 1 Oscar. Another 7 wins."},"lastupdated":"2015-08-18 00:11:00.437000000","year":1975,"imdb":{"rating":8.3,"votes":16496,"id":71411},"countries":["Soviet Union","Japan"],"type":"movie","tomatoes":{"viewer":{"rating":4.3,"numReviews":7494,"meter":94},"dvd":{"$date":"2000-10-17T00:00:00Z"},"critic":{"rating":7.5,"numReviews":12,"meter":75},"lastUpdated":{"$date":"2015-09-01T18:00:16Z"},"rotten":3,"production":"Nelson Entertainment","fresh":9}}
{"_id":{"$oid":"573a1396f29313caabce54ee"},"plot":"In this comedy of manners, Frederick Winterbourne tries to figure out the bright and bubbly Daisy Miller, only to be helped and hindered by false judgments from their fellow friends.","genres":["Drama","Romance"],"runtime":91,"rated":"G","cast":["Cybill Shepherd","Barry Brown","Cloris Leachman","Mildred Natwick"],"num_mflix_comments":0,"poster":"https://m.media-amazon.com/images/M/MV5BODRhODQzMGMtZjYwNS00ZDI4LWFkN2ItZGUwMTg4ZjIzMzE2XkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SY1000_SX677_AL_.jpg","title":"Daisy Miller","fullplot":"In this version of Henry James' novella \"Daisy Miller\", a young, bright and bubbly 19th Century American girl on her Grand Tour of Europe meets a fellow American, Frederick Winterbourne. Winterbourne is shocked by Daisy's modern behavior toward life, and spends his time with her trying to figure out if she's having innocent fun or on the path to becoming a fallen woman. Along the way, Winterbourne's judgment is helped and hindered by the other people in Daisy's life. Is Daisy really naive or naughty?","languages":["English"],"released":{"$date":"1975-01-24T00:00:00Z"},"directors":["Peter Bogdanovich"],"writers":["Henry James (story)","Frederic Raphael"],"awards":{"wins":2,"nominations":0,"text":"Nominated for 1 Oscar. Another 1 win."},"lastupdated":"2015-08-20 01:14:42.233000000","year":1974,"imdb":{"rating":6.0,"votes":755,"id":71385},"countries":["USA"],"type":"movie","tomatoes":{"viewer":{"rating":2.9,"numReviews":138,"meter":21},"dvd":{"$date":"2003-08-12T00:00:00Z"},"critic":{"rating":6.1,"numReviews":6,"meter":100},"lastUpdated":{"$date":"2015-09-02T19:24:27Z"},"rotten":0,"production":"Paramount Pictures","fresh":6}}
{"_id":{"$oid":"573a1396f29313caabce54f8"},"plot":"A New York City architect becomes a one-man vigilante squad after his wife is murdered by street punks in which he randomly goes out and kills would-be muggers on the mean streets after dark.","genres":["Action","Crime","Drama"],"runtime":93,"rated":"R","cast":["Charles Bronson","Hope Lange","Vincent Gardenia","Steven Keats"],"poster":"https://m.media-amazon.com/images/M/MV5BYWQ2ZjUxNWYtZDU5Ni00Y2MwLTg1YjktMjBhMmEyYjQ1MjUxL2ltYWdlXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SY1000_SX677_AL_.jpg","title":"Death Wish","fullplot":"Open-minded architect Paul Kersey returns to New York City from vacationing with his wife, feeling on top of the world. At the office, his cynical coworker gives him the welcome-back with a warning on the rising crime rate. But Paul, a bleeding-heart liberal, thinks of crime as being caused by poverty. However his coworker's ranting proves to be more than true when Paul's wife is killed and his daughter is raped in his own apartment. The police have no reliable leads and his overly sensitive son-in-law only exacerbates Paul's feeling of hopelessness. He is now facing the reality that the police can't be everywhere at once. Out of sympathy his boss gives him an assignment in sunny Arizona where Paul gets a taste of the Old West ideals. He returns to New York with a compromised view on muggers...","languages":["English","Italian","German"],"released":{"$date":"1974-07-24T00:00:00Z"},"directors":["Michael Winner"],"writers":["Brian Garfield (novel)","Wendell Mayes (screenplay)"],"awards":{"wins":1,"nominations":1,"text":"1 win & 1 nomination."},"lastupdated":"2015-08-23 00:50:31.423000000","year":1974,"imdb":{"rating":7.0,"votes":23322,"id":71402},"countries":["USA"],"type":"movie","tomatoes":{"viewer":{"rating":3.4,"numReviews":21686,"meter":69},"dvd":{"$date":"2001-01-16T00:00:00Z"},"critic":{"rating":5.8,"numReviews":24,"meter":67},"lastUpdated":{"$date":"2015-08-30T18:51:39Z"},"rotten":8,"production":"Paramount Pictures","fresh":16},"num_mflix_comments":0}
{"_id":{"$oid":"573a1396f29313caabce54fe"},"plot":"A cop chases two hippies suspected of a series of Manson family-like murders; unbeknownst to him, the real culprits are the living dead, brought to life with a thirst for human flesh by chemical pesticides being used by area farmers.","genres":["Horror"],"runtime":95,"rated":"R","cast":["Cristina Galbè","Ray Lovelock","Arthur Kennedy","Aldo Massasso"],"num_mflix_comments":0,"poster":"https://m.media-amazon.com/images/M/MV5BYmNlZjkzNTgtM2ExNi00ODhjLThiY2MtYzY0YTc0NzViZTNjXkEyXkFqcGdeQXVyMTA0MjU0Ng@@._V1_SY1000_SX677_AL_.jpg","title":"Let Sleeping Corpses Lie","fullplot":"A cop chases two young people visiting the English countryside, suspecting them of a local murder; unbeknownst to him, the real culprits are the living dead, brought to life with a thirst for human flesh by radiation being used by area farmers as a pesticide alternative.","languages":["Italian","Spanish"],"released":{"$date":"1975-06-01T00:00:00Z"},"directors":["Jorge Grau"],"writers":["Sandro Continenza","Marcello Coscia"],"awards":{"wins":4,"nominations":0,"text":"4 wins."},"lastupdated":"2015-08-28 00:20:26.800000000","year":1974,"imdb":{"rating":6.9,"votes":5189,"id":71431},"countries":["Italy","Spain"],"type":"movie","tomatoes":{"website":"http://www.blue-underground.com/","viewer":{"rating":3.5,"numReviews":3386,"meter":70},"dvd":{"$date":"2005-09-01T00:00:00Z"},"critic":{"rating":7.2,"numReviews":14,"meter":79},"lastUpdated":{"$date":"2015-08-26T18:40:01Z"},"rotten":3,"production":"Anchor Bay Entertainment","fresh":11}}

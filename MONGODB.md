### MongoDB: Manual de Consultas

### MongoDB: Manual de Consultas

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Consultas Básicas
1. **Consultar Todos los Documentos**
   ```javascript
   db.collection.find({})
   ```

2. **Consultar un Solo Documento**
   ```javascript
   db.collection.findOne({ field: "value" })
   ```

3. **Consultar Documentos con Condición**
   ```javascript
   db.collection.find({ field: "value" })

   // Ejemplo: Obtener todas las películas con clasificación "PG"
   db.movies.find({ rated: "PG" })
   ```

### Consultas con Proyección
- Proyección permite seleccionar campos específicos de los documentos.
```javascript
// Ejemplo: Obtener solo el título y el año de las películas
db.movies.find({}, { title: 1, year: 1 })
```

### Consultas con Filtros Complejos
1. **Comparaciones**
   - `$eq` (igual), `$ne` (no igual), `$gt` (mayor que), `$gte` (mayor o igual que), `$lt` (menor que), `$lte` (menor o igual que)
   ```javascript
   // Ejemplo: Obtener películas entre los años 1970 y 1975
   db.movies.find({ year: { $gte: 1970, $lte: 1975 } })
   ```

2. **Operadores Lógicos**
   - `$or`, `$and`, `$not`, `$nor`: Permiten combinar múltiples condiciones en una consulta.
   ```javascript
   // Ejemplo: Obtener películas que sean de los géneros "Drama" o "Comedy"
   db.movies.find({ $or: [{ genres: "Drama" }, { genres: "Comedy" }] })
   ```
   ```javascript
	// Ejemplo: Buscar películas que sean de comedia o drama y que se hayan lanzado después del 2000
	db.movies.find({ $and: [{ year: { $gt: 2000 } }, { $or: [{ genre: "Comedy" }, { genre: "Drama" }] }] })
   ```

3. **Operadores de Elementos**
   - `$exists`, `$type`: Permiten realizar consultas basadas en la existencia de campos y tipos de datos.
   ```javascript
   // Ejemplo: Obtener documentos donde el campo "rating" exista
   db.movies.find({ rating: { $exists: true } })

   // Ejemplo: Obtener documentos donde el campo "rating" sea de tipo string
   db.movies.find({ rating: { $type: "string" } })
   ```

4. **Consultas con Regex**
   - Permite realizar búsquedas por patrones de texto.
   ```javascript
   // Ejemplo: Buscar películas cuyo título empiece con "The"
   db.movies.find({ title: { $regex: /^The/ } })
   ```
5. **Operadores de Rango**
	- Permiten realizar consultas basadas en rangos de valores.
   ```javascript
	// Ejemplo: Buscar películas con calificaciones entre 7 y 9
	db.movies.find({ rating: { $gte: 7, $lte: 9 } })
   ```

### Consultas con Ordenación
- Permite ordenar los resultados en función de uno o varios campos.
```javascript
// Ejemplo: Obtener películas ordenadas por año de forma descendente
db.movies.find().sort({ year: -1 })
```

### Consultas con Limitación
- Permite limitar el número de resultados devueltos.
```javascript
// Ejemplo: Obtener las primeras 5 películas
db.movies.find().limit(5)
```

### Consultas con Saltos
- Permite saltar un número específico de documentos.
```javascript
// Ejemplo: Saltar las primeras 10 películas y obtener las siguientes 5
db.movies.find().skip(10).limit(5)
```

### Consultas Avanzadas
1. **Buscar un Documento por un Campo Anidado**
   ```javascript
   // Ejemplo: Buscar películas donde un actor específico aparece
   db.movies.find({ "actors.name": "Robert De Niro" })
   ```

2. **Consultas Agregadas con `$lookup`**
   - Permite realizar un join con otra colección.
   ```javascript
   // Ejemplo: Unir usuarios con sus órdenes
   db.users.aggregate([
     {
       $lookup:
         {
           from: "orders",
           localField: "_id",
           foreignField: "userId",
           as: "orders"
         }
     }
   ])
   ```

3. **Desanidar Arrays con `$unwind`**
   - Desanida un array en documentos separados.
   ```javascript
   // Ejemplo: Desanidar el array de géneros en la colección de películas
   db.movies.aggregate([
     { $unwind: "$genres" }
   ])
   ```

4. **Operaciones Agregadas Comunes**
   - `$match`: Filtra los documentos que cumplen con un criterio específico.
   - `$group`: Agrupa documentos por un campo especificado y puede realizar operaciones agregadas como `sum`, `avg`, `max`, `min`.
   - `$sort`: Ordena los documentos.
   - `$project`: Modifica la estructura de los documentos.
   ```javascript
   // Ejemplo: Obtener el promedio de rating por año
   db.movies.aggregate([
     { $group: { _id: "$year", avgRating: { $avg: "$imdb.rating" } } }
   ])

   // Ejemplo: Obtener el número de películas por clasificación
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

### Preguntas Frecuentes en el Examen
1. **Indicar el título y el número de premios de la película con más premios**
   ```javascript
   db.movies.find().sort({ "awards.wins": -1 }).limit(1).project({ title: 1, "awards.wins": 1 })
   ```

2. **Listar diferentes clasificaciones de edad y su número de documentos**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

3. **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

4. **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

5. **Buscar documentos donde el campo es un array que contiene un valor específico**
   ```javascript
   // Ejemplo: Buscar películas que tienen el género "Action"
   db.movies.find({ genres: "Action" })
   ```

6. **Buscar documentos donde el campo es un array que contiene todos los valores especificados**
   ```javascript
   // Ejemplo: Buscar películas que tienen los géneros "Action" y "Comedy"
   db.movies.find({ genres: { $all: ["Action", "Comedy"] } })
   ```

7. **Buscar documentos donde el campo es un array que contiene al menos uno de los valores especificados**
   ```javascript
   // Ejemplo: Buscar películas que tienen al menos uno de los géneros "Action" o "Comedy"
   db.movies.find({ genres: { $in: ["Action", "Comedy"] } })
   ```

8. **Buscar documentos por tamaño de array**
   ```javascript
   // Ejemplo: Buscar películas que tienen al menos 3 géneros
   db.movies.find({ genres: { $size: 3 } })
   ```

9. **Buscar documentos con campos anidados utilizando puntos**
   ```javascript
   // Ejemplo: Buscar películas con un rating mayor a 8
   db.movies.find({ "imdb.rating": { $gt: 8 } })
   ```

10. **Buscar documentos que contienen un subdocumento específico**
    ```javascript
    // Ejemplo: Buscar películas con premios específicos
    db.movies.find({ awards: { wins: 5, nominations: 10, text: "Won 5 Oscars. Another 10 wins & 10 nominations." } })
    ```

11. **Búsquedas donde el valor de un campo está o no en una lista específica.**
   ```javascript
	// Ejemplo: Buscar películas con géneros específicos
	db.movies.find({ genre: { $in: ["Action", "Comedy"] } })
   ```

### Consejos Adicionales
- **Documentación Oficial**: Familiarízate con la [documentación oficial de MongoDB](https://docs.mongodb.com).
- **Práctica**: Realiza consultas en una base de datos de prueba para afianzar tus conocimientos.
- **Utiliza el MongoDB Shell**: Herramienta interactiva para ejecutar comandos y consultas en MongoDB.

Con este resumen detallado, deberías estar bien preparado para abordar cualquier pregunta relacionada con consultas en MongoDB en tu examen. ¡Buena suerte!

### Consultas Avanzadas en MongoDB

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Consultas Avanzadas

1. **Buscar documentos con condiciones en múltiples campos anidados**
   ```javascript
   // Ejemplo: Buscar películas donde el rating IMDB es mayor a 8 y el año es mayor a 2000
   db.movies.find({ "imdb.rating": { $gt: 8 }, year: { $gt: 2000 } })
   ```
    ```javascript
	// Ejemplo: Buscar películas donde un actor específico aparece
	db.movies.find({ "actors.name": "Robert De Niro" })
   ```

2. **Buscar documentos con fecha específica**
   ```javascript
   // Ejemplo: Buscar películas lanzadas en 1995
   db.movies.find({ release_date: { $gte: new ISODate("1995-01-01"), $lt: new ISODate("1996-01-01") } })
   ```

3. **Buscar documentos con arrays que contienen objetos específicos**
   ```javascript
   // Ejemplo: Buscar películas donde un actor específico tiene un cierto papel
   db.movies.find({ "actors": { $elemMatch: { name: "Robert De Niro", role: "Lead" } } })
   ```

4. **Agrupación y filtrado combinados**
   ```javascript
   // Ejemplo: Obtener el número de películas por director, solo para directores con más de 5 películas
   db.movies.aggregate([
     { $group: { _id: "$director", count: { $sum: 1 } } },
     { $match: { count: { $gt: 5 } } }
   ])
   ```

5. **Uso de `$geoNear` para consultas geoespaciales**
   ```javascript
   // Ejemplo: Buscar los 5 restaurantes más cercanos a una ubicación específica
   db.restaurants.aggregate([
     {
       $geoNear: {
         near: { type: "Point", coordinates: [ -73.99279, 40.719296 ] },
         distanceField: "dist.calculated",
         maxDistance: 1000,
         spherical: true
       }
     },
     { $limit: 5 }
   ])
   ```

6. **Uso de `$graphLookup` para consultas recursivas**
   ```javascript
   // Ejemplo: Buscar la jerarquía de empleados de un gerente
   db.employees.aggregate([
     {
       $graphLookup: {
         from: "employees",
         startWith: "$reportsTo",
         connectFromField: "reportsTo",
         connectToField: "name",
         as: "subordinates"
       }
     }
   ])
   ```

7. **Uso de `$facet` para consultas multi-etapa**
   ```javascript
   // Ejemplo: Realizar múltiples agregaciones en un solo pipeline
   db.movies.aggregate([
     {
       $facet: {
         "high_ratings": [
           { $match: { "imdb.rating": { $gte: 8 } } },
           { $group: { _id: "$director", averageRating: { $avg: "$imdb.rating" } } },
           { $sort: { averageRating: -1 } }
         ],
         "popular_genres": [
           { $unwind: "$genres" },
           { $group: { _id: "$genres", count: { $sum: 1 } } },
           { $sort: { count: -1 } }
         ]
       }
     }
   ])
   ```

8. **Uso de `$bucket` para agrupar datos en intervalos**
   ```javascript
   // Ejemplo: Agrupar películas por décadas
   db.movies.aggregate([
     {
       $bucket: {
         groupBy: "$year",
         boundaries: [ 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020 ],
         default: "Other",
         output: {
           "count": { $sum: 1 },
           "titles": { $push: "$title" }
         }
       }
     }
   ])
   ```

9. **Uso de `$addFields` para agregar campos calculados**
   ```javascript
   // Ejemplo: Agregar un campo que indica si una película es clásica (más de 25 años)
   db.movies.aggregate([
     {
       $addFields: {
         isClassic: { $lt: [ "$year", 1995 ] }
       }
     }
   ])
   ```

10. **Uso de `$redact` para controlar el acceso a documentos**
    ```javascript
    // Ejemplo: Filtrar documentos basados en permisos de usuario
    db.records.aggregate([
      {
        $redact: {
          $cond: {
            if: { $eq: [ "$level", "public" ] },
            then: "$$KEEP",
            else: "$$PRUNE"
          }
        }
      }
    ])
    ```

### Preguntas Frecuentes en el Examen

1. **Indicar el título y el número de premios de la película con más premios**
   ```javascript
   db.movies.find().sort({ "awards.wins": -1 }).limit(1).project({ title: 1, "awards.wins": 1 })
   ```

2. **Listar diferentes clasificaciones de edad y su número de documentos**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

3. **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

4. **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

5. **Buscar películas donde el rating IMDB es mayor a 8 y el año es mayor a 2000**
   ```javascript
   db.movies.find({ "imdb.rating": { $gt: 8 }, year: { $gt: 2000 } })
   ```

6. **Buscar películas lanzadas en 1995**
   ```javascript
   db.movies.find({ release_date: { $gte: new ISODate("1995-01-01"), $lt: new ISODate("1996-01-01") } })
   ```

7. **Buscar películas donde un actor específico tiene un cierto papel**
   ```javascript
   db.movies.find({ "actors": { $elemMatch: { name: "Robert De Niro", role: "Lead" } } })
   ```

8. **Obtener el número de películas por director, solo para directores con más de 5 películas**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$director", count: { $sum: 1 } } },
     { $match: { count: { $gt: 5 } } }
   ])
   ```

9. **Buscar los 5 restaurantes más cercanos a una ubicación específica**
   ```javascript
   db.restaurants.aggregate([
     {
       $geoNear: {
         near: { type: "Point", coordinates: [ -73.99279, 40.719296 ] },
         distanceField: "dist.calculated",
         maxDistance: 1000,
         spherical: true
       }
     },
     { $limit: 5 }
   ])
   ```

10. **Buscar la jerarquía de empleados de un gerente**
    ```javascript
    db.employees.aggregate([
      {
        $graphLookup: {
          from: "employees",
          startWith: "$reportsTo",
          connectFromField: "reportsTo",
          connectToField: "name",
          as: "subordinates"
        }
      }
    ])
    ```

11. **Realizar múltiples agregaciones en un solo pipeline**
    ```javascript
    db.movies.aggregate([
      {
        $facet: {
          "high_ratings": [
            { $match: { "imdb.rating": { $gte: 8 } } },
            { $group: { _id: "$director", averageRating: { $avg: "$imdb.rating" } } },
            { $sort: { averageRating: -1 } }
          ],
          "popular_genres": [
            { $unwind: "$genres" },
            { $group: { _id: "$genres", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ])
    ```

12. **Agrupar películas por décadas**
    ```javascript
    db.movies.aggregate([
      {
        $bucket: {
          groupBy: "$year",
          boundaries: [ 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020 ],
          default: "Other",
          output: {
            "count": { $sum: 1 },
            "titles": { $push: "$title" }
          }
        }
      }
    ])
    ```

13. **Agregar un campo que indica si una película es clásica (más de 25 años)**
    ```javascript
    db.movies.aggregate([
      {
        $addFields: {
          isClassic: { $lt: [ "$year", 1995 ] }
        }
      }
    ])
    ```

### MongoDB: Resumen Detallado para el Examen de Consultas

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Consultas Básicas
1. **Consultar Documentos**
   ```javascript
   // Consultar todos los documentos
   db.collection.find(query)

   // Consultar un solo documento
   db.collection.findOne(query)

   // Ejemplo: Obtener todas las películas con clasificación "PG"
   db.movies.find({ rated: "PG" })
   ```

### Consultas Avanzadas
1. **Consultas con Proyección**
   - Proyección permite seleccionar campos específicos de los documentos.
   ```javascript
   // Ejemplo: Obtener solo el título y el año de las películas
   db.movies.find({}, { title: 1, year: 1 })
   ```

2. **Consultas con Filtros Complejos**
   - Se pueden combinar múltiples condiciones usando operadores.
   ```javascript
   // Ejemplo: Obtener películas entre los años 1970 y 1975
   db.movies.find({ year: { $gte: 1970, $lte: 1975 } })
   ```

3. **Uso de Operadores Lógicos**
   - MongoDB soporta operadores lógicos como $or, $and, $not, $nor.
   ```javascript
   // Ejemplo: Obtener películas que sean de los géneros "Drama" o "Comedy"
   db.movies.find({ $or: [{ genres: "Drama" }, { genres: "Comedy" }] })
   ```

4. **Consultas con Regex**
   - Permite realizar búsquedas por patrones de texto.
   ```javascript
   // Ejemplo: Buscar películas cuyo título empiece con "The"
   db.movies.find({ title: { $regex: /^The/ } })
   ```

### Consultas con Agregación
1. **Pipeline de Agregación**
   - Permite realizar operaciones de procesamiento de datos en varias etapas.
   ```javascript
   // Ejemplo: Obtener el número de películas por clasificación
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

2. **Operaciones de Agregación Comunes**
   - `$match`: Filtra los documentos que cumplen con un criterio específico.
   - `$group`: Agrupa documentos por un campo especificado y puede realizar operaciones agregadas como `sum`, `avg`, `max`, `min`.
   - `$sort`: Ordena los documentos. Usa `1` para orden ascendente (de menor a mayor) y `-1` para orden descendente (de mayor a menor).
   - `$project`: Modifica la estructura de los documentos.
   ```javascript
   // Ejemplo: Obtener el promedio de rating por año
   db.movies.aggregate([
     { $group: { _id: "$year", avgRating: { $avg: "$imdb.rating" } } }
   ])
   ```

3. **Consultas de Agregación con Lookup**
   - `$lookup`: Permite realizar joins entre colecciones.
   ```javascript
   // Ejemplo: Join entre colecciones de usuarios y comentarios
   db.users.aggregate([
     {
       $lookup:
         {
           from: "comments",
           localField: "_id",
           foreignField: "userId",
           as: "userComments"
         }
      }
   ])
   ```
4. **Agrupación y Operaciones Matemáticas**
	- Agrupar documentos y realizar operaciones matemáticas como sumas, promedios, máximos y mínimos.
	   ```javascript
	// Ejemplo: Calcular el promedio de ratings por género
	db.movies.aggregate([
	  { $group: { _id: "$genre", averageRating: { $avg: "$rating" } } }
	])
   ```
   
5. **Filtrado de Resultados de Agregación**
	- Filtrar documentos después de una etapa de agregación usando $match
	```javascript
	// Ejemplo: Obtener géneros con un promedio de rating mayor a 7
	db.movies.aggregate([
	  { $group: { _id: "$genre", averageRating: { $avg: "$rating" } } },
	  { $match: { averageRating: { $gt: 7 } } }
	])
   ```

6. **Uso de $addFields para Añadir Campos**
	- Añadir nuevos campos a los documentos en una etapa de agregación.
	```javascript
	// Ejemplo: Añadir un campo que indica si la película es de alta calificación
	db.movies.aggregate([
	  { $addFields: { isHighRated: { $gte: ["$rating", 8] } } }
	])
   ```

7. **Uso de $project para Modificar la Estructura de los Documentos**
	- Seleccionar y transformar campos en los documentos.
	```javascript
	// Ejemplo: Proyectar solo el título y el rating de las películas
	db.movies.aggregate([
	  { $project: { title: 1, rating: 1, _id: 0 } }
	])
   ```
   
8. **Desanidar Arrays con $unwind**
	- Convertir un array en múltiples documentos, uno por cada elemento del array.
	```javascript
	// Ejemplo: Desanidar el array de actores y contar el número de películas por actor
	db.movies.aggregate([
	  { $unwind: "$actors" },
	  { $group: { _id: "$actors", numberOfMovies: { $sum: 1 } } }
	])
   ```
   
### Consultas con Arrays
   - Permiten encontrar documentos donde los arrays cumplen ciertos criterios.
   ```javascript
	// Ejemplo: Buscar documentos donde el array de actores contiene "Tom Hanks"
	db.movies.find({ actors: "Tom Hanks" })
   ```
   
1. **Operadores en Arrays**
   - `$all`: Busca documentos que contengan todos los elementos especificados en un array.
   ```javascript
   // Ejemplo: Buscar documentos que contengan "Internet" y "Wifi" en amenities
   db.listingsAndReviews.find({ amenities: { $all: ["Internet", "Wifi"] } })
   ```

   - `$elemMatch`: Proyecta elementos de un array que cumplan con un criterio.
   ```javascript
   // Ejemplo: Buscar documentos donde cualquier elemento del array cumple la condición
   db.grades.find({ scores: { $elemMatch: { score: { $gt: 85 } } } })
   ```
   
2. **Consultas con Tamaño de Arrays**
   - `$size`: Busca documentos que contengan un array con un tamaño específico.
   ```javascript
   // Ejemplo: Buscar documentos con un array de amenities de tamaño 5
   db.listingsAndReviews.find({ amenities: { $size: 5 } })
   ```

3. **Añadir Elementos a un Array**
	```javascript
	// Ejemplo: Añadir un nuevo actor a la lista de actores
	db.movies.updateOne({ title: "Inception" }, { $push: { actors: "New Actor" } })
    ```
	
4. **Eliminar Elementos de un Array**
	```javascript
	// Ejemplo: Eliminar un actor de la lista de actores
	db.movies.updateOne({ title: "Inception" }, { $pull: { actors: "Old Actor" } })
	```

### Consultas con Expresiones
1. **Expresiones en Consultas**
   - `$expr`: Permite usar variables y declaraciones condicionales en consultas.
   ```javascript
   // Ejemplo: Buscar documentos donde el viaje empieza y termina en la misma estación
   db.trips.find({ $expr: { $eq: ["$end_station_id", "$start_station_id"] } })
   ```

2. **Consultas con Condiciones**
   - `$cond`: Permite usar condiciones if-else dentro de las consultas de agregación.
   ```javascript
   // Ejemplo: Calcular el precio con descuento si el precio original es mayor a 100
   db.sales.aggregate([
     {
       $project:
         {
           item: 1,
           discountedPrice: {
             $cond: { if: { $gt: ["$price", 100] }, then: { $multiply: ["$price", 0.9] }, else: "$price" }
           }
         }
     }
   ])
   
   // Ejemplo: Añadir un campo que indique "Clásico" para películas antes de 2000, "Moderno" para después
	db.movies.aggregate([
	  {
		$addFields: {
		  era: {
			$cond: { if: { $lt: ["$year", 2000] }, then: "Clásico", else: "Moderno" }
		  }
		}
	  }
	])
   ```

3. **Uso de $ifNull**
	- Proveer un valor predeterminado si un campo es null o no existe.
	```javascript
	// Ejemplo: Proveer un rating predeterminado si el rating es null
	db.movies.aggregate([
	  {
		$project: {
		  title: 1,
		  rating: { $ifNull: ["$rating", "N/A"] }
		}
	  }
	])
   ```

### Consultas con Proyecciones Avanzadas
1. **Proyecciones**
   - Seleccionar campos específicos y excluir otros.
   ```javascript
   // Ejemplo: Incluir solo el título y el año de las películas
   db.movies.find({}, { title: 1, year: 1, _id: 0 })
   ```

2. **Proyecciones con Dot Notation**
   - Permite acceder a campos anidados dentro de subdocumentos.
   ```javascript
   // Ejemplo: Proyectar el primer nombre de una persona en el array de relaciones
   db.companies.find({ "relationships.0.person.first_name": "Mark" }, { "name": 1 })
   ```

### Consultas Avanzadas de Ejemplo
1. **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

2. **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

3. **Número de empresas con más empleados que el año de fundación**
   ```javascript
   db.companies.find({ $expr: { $gt: ["$number_of_employees", "$founded_year"] } }).count()
   ```

4. **Empresas cuyo permalink coincide con el twitter_username**
   ```javascript
   db.companies.find({ $expr: { $eq: ["$permalink", "$twitter_username"] } }).count()
   ```

5. **Alojamientos que permiten más de 6 personas y tienen exactamente 50 reviews**
   ```javascript
   db.listingsAndReviews.find({ accommodates: { $gt: 6 }, number_of_reviews: 50 })
   ```

6. **Empresas con oficinas en Seattle**
   ```javascript
   db.companies.find({ offices: { $elemMatch: { city: "Seattle" } } }).count()
   ```

7. **Documentos con un array amenities que contiene "Internet" como primer elemento**
   ```javascript
   db.listingsAndReviews.find({ amenities: { $elemMatch: { $eq: "Internet", $position: 0 } } }, { name: 1, address: 1 })
   ```

8. **Número de viajes que empiezan en estaciones al oeste de la longitud -74**
   ```javascript
   db.trips.find({ "start station location.coordinates.0": { $lt: -74 } }).count()
   ```

9. **Número de inspecciones en la ciudad de "NEW YORK"**
   ```javascript
   db.inspections.find({ city: "NEW YORK" }).count()
   ```

10. **Actualizar Documentos**
	- Actualiza uno o varios documentos que cumplen con un criterio específico.
   ```javascript
	// Ejemplo: Actualizar el rating de una película específica
	db.movies.updateOne({ title: "Inception" }, { $set: { rating: 9 } })

	// Ejemplo: Actualizar el género de todas las películas de acción a "Acción"
	db.movies.updateMany({ genre: "Action" }, { $set: { genre: "Acción" } })
   ```
  
11. **Eliminar Documentos**
	- Elimina uno o varios documentos que cumplen con un criterio específico.
   ```javascript
	// Ejemplo: Eliminar una película por su título
	db.movies.deleteOne({ title: "Inception" })

	// Ejemplo: Eliminar todas las películas de un género específico
	db.movies.deleteMany({ genre: "Acción" })
	)
   ```

12. **Incrementar el Valor de un Campo**
   ```javascript
	// Ejemplo: Incrementar el contador de vistas en 1
	db.movies.updateOne({ title: "Inception" }, { $inc: { views: 1 } })
   ```
### Consejos Adicionales
- **Documentación Oficial**: Familiarízate con la [documentación oficial de MongoDB](https://docs.mongodb.com/).
- **Práctica**: Realiza consultas en una base de datos de prueba para afianzar tus conocimientos.
- **Utiliza el MongoDB Shell**: Herramienta interactiva para ejecutar comandos y consultas en MongoDB.

Con este resumen detallado, deberías estar bien preparado para abordar cualquier pregunta relacionada con consultas en MongoDB en tu examen. ¡Buena suerte!

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Consultas Básicas
1. **Consultar Todos los Documentos**
   ```javascript
   db.collection.find({})
   ```

2. **Consultar un Solo Documento**
   ```javascript
   db.collection.findOne({ field: "value" })
   ```

3. **Consultar Documentos con Condición**
   ```javascript
   db.collection.find({ field: "value" })

   // Ejemplo: Obtener todas las películas con clasificación "PG"
   db.movies.find({ rated: "PG" })
   ```

### Consultas con Proyección
- Proyección permite seleccionar campos específicos de los documentos.
```javascript
// Ejemplo: Obtener solo el título y el año de las películas
db.movies.find({}, { title: 1, year: 1 })
```

### Consultas con Filtros Complejos
1. **Comparaciones**
   - `$eq` (igual), `$ne` (no igual), `$gt` (mayor que), `$gte` (mayor o igual que), `$lt` (menor que), `$lte` (menor o igual que)
   ```javascript
   // Ejemplo: Obtener películas entre los años 1970 y 1975
   db.movies.find({ year: { $gte: 1970, $lte: 1975 } })
   ```

2. **Operadores Lógicos**
   - `$or`, `$and`, `$not`, `$nor`
   ```javascript
   // Ejemplo: Obtener películas que sean de los géneros "Drama" o "Comedy"
   db.movies.find({ $or: [{ genres: "Drama" }, { genres: "Comedy" }] })
   ```

3. **Operadores de Elementos**
   - `$exists`, `$type`
   ```javascript
   // Ejemplo: Obtener documentos donde el campo "rating" exista
   db.movies.find({ rating: { $exists: true } })

   // Ejemplo: Obtener documentos donde el campo "rating" sea de tipo string
   db.movies.find({ rating: { $type: "string" } })
   ```

4. **Consultas con Regex**
   - Permite realizar búsquedas por patrones de texto.
   ```javascript
   // Ejemplo: Buscar películas cuyo título empiece con "The"
   db.movies.find({ title: { $regex: /^The/ } })
   ```

### Consultas con Ordenación
- Permite ordenar los resultados en función de uno o varios campos.
```javascript
// Ejemplo: Obtener películas ordenadas por año de forma descendente
db.movies.find().sort({ year: -1 })
```

### Consultas con Limitación
- Permite limitar el número de resultados devueltos.
```javascript
// Ejemplo: Obtener las primeras 5 películas
db.movies.find().limit(5)
```

### Consultas con Saltos
- Permite saltar un número específico de documentos.
```javascript
// Ejemplo: Saltar las primeras 10 películas y obtener las siguientes 5
db.movies.find().skip(10).limit(5)
```

### Consultas Avanzadas
1. **Buscar un Documento por un Campo Anidado**
   ```javascript
   // Ejemplo: Buscar películas donde un actor específico aparece
   db.movies.find({ "actors.name": "Robert De Niro" })
   ```

2. **Consultas Agregadas con `$lookup`**
   - Permite realizar un join con otra colección.
   ```javascript
   // Ejemplo: Unir usuarios con sus órdenes
   db.users.aggregate([
     {
       $lookup:
         {
           from: "orders",
           localField: "_id",
           foreignField: "userId",
           as: "orders"
         }
     }
   ])
   ```

3. **Desanidar Arrays con `$unwind`**
   - Desanida un array en documentos separados.
   ```javascript
   // Ejemplo: Desanidar el array de géneros en la colección de películas
   db.movies.aggregate([
     { $unwind: "$genres" }
   ])
   ```

4. **Operaciones Agregadas Comunes**
   - `$match`: Filtra los documentos que cumplen con un criterio específico.
   - `$group`: Agrupa documentos por un campo especificado y puede realizar operaciones agregadas como `sum`, `avg`, `max`, `min`.
   - `$sort`: Ordena los documentos.
   - `$project`: Modifica la estructura de los documentos.
   ```javascript
   // Ejemplo: Obtener el promedio de rating por año
   db.movies.aggregate([
     { $group: { _id: "$year", avgRating: { $avg: "$imdb.rating" } } }
   ])

   // Ejemplo: Obtener el número de películas por clasificación
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

### Preguntas Frecuentes en el Examen
1. **Indicar el título y el número de premios de la película con más premios**
   ```javascript
   db.movies.find().sort({ "awards.wins": -1 }).limit(1).project({ title: 1, "awards.wins": 1 })
   ```

2. **Listar diferentes clasificaciones de edad y su número de documentos**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

3. **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

4. **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

5. **Buscar documentos donde el campo es un array que contiene un valor específico**
   ```javascript
   // Ejemplo: Buscar películas que tienen el género "Action"
   db.movies.find({ genres: "Action" })
   ```

6. **Buscar documentos donde el campo es un array que contiene todos los valores especificados**
   ```javascript
   // Ejemplo: Buscar películas que tienen los géneros "Action" y "Comedy"
   db.movies.find({ genres: { $all: ["Action", "Comedy"] } })
   ```

7. **Buscar documentos donde el campo es un array que contiene al menos uno de los valores especificados**
   ```javascript
   // Ejemplo: Buscar películas que tienen al menos uno de los géneros "Action" o "Comedy"
   db.movies.find({ genres: { $in: ["Action", "Comedy"] } })
   ```

8. **Buscar documentos por tamaño de array**
   ```javascript
   // Ejemplo: Buscar películas que tienen al menos 3 géneros
   db.movies.find({ genres: { $size: 3 } })
   ```

9. **Buscar documentos con campos anidados utilizando puntos**
   ```javascript
   // Ejemplo: Buscar películas con un rating mayor a 8
   db.movies.find({ "imdb.rating": { $gt: 8 } })
   ```

10. **Buscar documentos que contienen un subdocumento específico**
    ```javascript
    // Ejemplo: Buscar películas con premios específicos
    db.movies.find({ awards: { wins: 5, nominations: 10, text: "Won 5 Oscars. Another 10 wins & 10 nominations." } })
    ```

### Consejos Adicionales
- **Documentación Oficial**: Familiarízate con la [documentación oficial de MongoDB](https://docs.mongodb.com).
- **Práctica**: Realiza consultas en una base de datos de prueba para afianzar tus conocimientos.
- **Utiliza el MongoDB Shell**: Herramienta interactiva para ejecutar comandos y consultas en MongoDB.

Con este resumen detallado, deberías estar bien preparado para abordar cualquier pregunta relacionada con consultas en MongoDB en tu examen. ¡Buena suerte!

### Consultas Avanzadas en MongoDB

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Consultas Avanzadas

1. **Buscar documentos con condiciones en múltiples campos anidados**
   ```javascript
   // Ejemplo: Buscar películas donde el rating IMDB es mayor a 8 y el año es mayor a 2000
   db.movies.find({ "imdb.rating": { $gt: 8 }, year: { $gt: 2000 } })
   ```

2. **Buscar documentos con fecha específica**
   ```javascript
   // Ejemplo: Buscar películas lanzadas en 1995
   db.movies.find({ release_date: { $gte: new ISODate("1995-01-01"), $lt: new ISODate("1996-01-01") } })
   ```

3. **Buscar documentos con arrays que contienen objetos específicos**
   ```javascript
   // Ejemplo: Buscar películas donde un actor específico tiene un cierto papel
   db.movies.find({ "actors": { $elemMatch: { name: "Robert De Niro", role: "Lead" } } })
   ```

4. **Agrupación y filtrado combinados**
   ```javascript
   // Ejemplo: Obtener el número de películas por director, solo para directores con más de 5 películas
   db.movies.aggregate([
     { $group: { _id: "$director", count: { $sum: 1 } } },
     { $match: { count: { $gt: 5 } } }
   ])
   ```

5. **Uso de `$geoNear` para consultas geoespaciales**
   ```javascript
   // Ejemplo: Buscar los 5 restaurantes más cercanos a una ubicación específica
   db.restaurants.aggregate([
     {
       $geoNear: {
         near: { type: "Point", coordinates: [ -73.99279, 40.719296 ] },
         distanceField: "dist.calculated",
         maxDistance: 1000,
         spherical: true
       }
     },
     { $limit: 5 }
   ])
   ```

6. **Uso de `$graphLookup` para consultas recursivas**
   ```javascript
   // Ejemplo: Buscar la jerarquía de empleados de un gerente
   db.employees.aggregate([
     {
       $graphLookup: {
         from: "employees",
         startWith: "$reportsTo",
         connectFromField: "reportsTo",
         connectToField: "name",
         as: "subordinates"
       }
     }
   ])
   ```

7. **Uso de `$facet` para consultas multi-etapa**
   ```javascript
   // Ejemplo: Realizar múltiples agregaciones en un solo pipeline
   db.movies.aggregate([
     {
       $facet: {
         "high_ratings": [
           { $match: { "imdb.rating": { $gte: 8 } } },
           { $group: { _id: "$director", averageRating: { $avg: "$imdb.rating" } } },
           { $sort: { averageRating: -1 } }
         ],
         "popular_genres": [
           { $unwind: "$genres" },
           { $group: { _id: "$genres", count: { $sum: 1 } } },
           { $sort: { count: -1 } }
         ]
       }
     }
   ])
   ```

8. **Uso de `$bucket` para agrupar datos en intervalos**
   ```javascript
   // Ejemplo: Agrupar películas por décadas
   db.movies.aggregate([
     {
       $bucket: {
         groupBy: "$year",
         boundaries: [ 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020 ],
         default: "Other",
         output: {
           "count": { $sum: 1 },
           "titles": { $push: "$title" }
         }
       }
     }
   ])
   ```

9. **Uso de `$addFields` para agregar campos calculados**
   ```javascript
   // Ejemplo: Agregar un campo que indica si una película es clásica (más de 25 años)
   db.movies.aggregate([
     {
       $addFields: {
         isClassic: { $lt: [ "$year", 1995 ] }
       }
     }
   ])
   ```

10. **Uso de `$redact` para controlar el acceso a documentos**
    ```javascript
    // Ejemplo: Filtrar documentos basados en permisos de usuario
    db.records.aggregate([
      {
        $redact: {
          $cond: {
            if: { $eq: [ "$level", "public" ] },
            then: "$$KEEP",
            else: "$$PRUNE"
          }
        }
      }
    ])
    ```

### Preguntas Frecuentes en el Examen

1. **Indicar el título y el número de premios de la película con más premios**
   ```javascript
   db.movies.find().sort({ "awards.wins": -1 }).limit(1).project({ title: 1, "awards.wins": 1 })
   ```

2. **Listar diferentes clasificaciones de edad y su número de documentos**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

3. **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

4. **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

5. **Buscar películas donde el rating IMDB es mayor a 8 y el año es mayor a 2000**
   ```javascript
   db.movies.find({ "imdb.rating": { $gt: 8 }, year: { $gt: 2000 } })
   ```

6. **Buscar películas lanzadas en 1995**
   ```javascript
   db.movies.find({ release_date: { $gte: new ISODate("1995-01-01"), $lt: new ISODate("1996-01-01") } })
   ```

7. **Buscar películas donde un actor específico tiene un cierto papel**
   ```javascript
   db.movies.find({ "actors": { $elemMatch: { name: "Robert De Niro", role: "Lead" } } })
   ```

8. **Obtener el número de películas por director, solo para directores con más de 5 películas**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$director", count: { $sum: 1 } } },
     { $match: { count: { $gt: 5 } } }
   ])
   ```

9. **Buscar los 5 restaurantes más cercanos a una ubicación específica**
   ```javascript
   db.restaurants.aggregate([
     {
       $geoNear: {
         near: { type: "Point", coordinates: [ -73.99279, 40.719296 ] },
         distanceField: "dist.calculated",
         maxDistance: 1000,
         spherical: true
       }
     },
     { $limit: 5 }
   ])
   ```

10. **Buscar la jerarquía de empleados de un gerente**
    ```javascript
    db.employees.aggregate([
      {
        $graphLookup: {
          from: "employees",
          startWith: "$reportsTo",
          connectFromField: "reportsTo",
          connectToField: "name",
          as: "subordinates"
        }
      }
    ])
    ```

11. **Realizar múltiples agregaciones en un solo pipeline**
    ```javascript
    db.movies.aggregate([
      {
        $facet: {
          "high_ratings": [
            { $match: { "imdb.rating": { $gte: 8 } } },
            { $group: { _id: "$director", averageRating: { $avg: "$imdb.rating" } } },
            { $sort: { averageRating: -1 } }
          ],
          "popular_genres": [
            { $unwind: "$genres" },
            { $group: { _id: "$genres", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
          ]
        }
      }
    ])
    ```

12. **Agrupar películas por décadas**
    ```javascript
    db.movies.aggregate([
      {
        $bucket: {
          groupBy: "$year",
          boundaries: [ 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020 ],
          default: "Other",
          output: {
            "count": { $sum: 1 },
            "titles": { $push: "$title" }
          }
        }
      }
    ])
    ```

13. **Agregar un campo que indica si una película es clásica (más de 25 años)**
    ```javascript
    db.movies.aggregate([
      {
        $addFields: {
          isClassic: { $lt: [ "$year", 1995 ] }
        }
      }
    ])
    ```

### MongoDB: Resumen Detallado para el Examen de Consultas

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Consultas Básicas
1. **Consultar Documentos**
   ```javascript
   // Consultar todos los documentos
   db.collection.find(query)

   // Consultar un solo documento
   db.collection.findOne(query)

   // Ejemplo: Obtener todas las películas con clasificación "PG"
   db.movies.find({ rated: "PG" })
   ```

### Consultas Avanzadas
1. **Consultas con Proyección**
   - Proyección permite seleccionar campos específicos de los documentos.
   ```javascript
   // Ejemplo: Obtener solo el título y el año de las películas
   db.movies.find({}, { title: 1, year: 1 })
   ```

2. **Consultas con Filtros Complejos**
   - Se pueden combinar múltiples condiciones usando operadores.
   ```javascript
   // Ejemplo: Obtener películas entre los años 1970 y 1975
   db.movies.find({ year: { $gte: 1970, $lte: 1975 } })
   ```

3. **Uso de Operadores Lógicos**
   - MongoDB soporta operadores lógicos como $or, $and, $not, $nor.
   ```javascript
   // Ejemplo: Obtener películas que sean de los géneros "Drama" o "Comedy"
   db.movies.find({ $or: [{ genres: "Drama" }, { genres: "Comedy" }] })
   ```

4. **Consultas con Regex**
   - Permite realizar búsquedas por patrones de texto.
   ```javascript
   // Ejemplo: Buscar películas cuyo título empiece con "The"
   db.movies.find({ title: { $regex: /^The/ } })
   ```

### Consultas con Agregación
1. **Pipeline de Agregación**
   - Permite realizar operaciones de procesamiento de datos en varias etapas.
   ```javascript
   // Ejemplo: Obtener el número de películas por clasificación
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

2. **Operaciones de Agregación Comunes**
   - `$match`: Filtra los documentos que cumplen con un criterio específico.
   - `$group`: Agrupa documentos por un campo especificado y puede realizar operaciones agregadas como `sum`, `avg`, `max`, `min`.
   - `$sort`: Ordena los documentos. Usa `1` para orden ascendente (de menor a mayor) y `-1` para orden descendente (de mayor a menor).
   - `$project`: Modifica la estructura de los documentos.
   ```javascript
   // Ejemplo: Obtener el promedio de rating por año
   db.movies.aggregate([
     { $group: { _id: "$year", avgRating: { $avg: "$imdb.rating" } } }
   ])
   ```

3. **Consultas de Agregación con Lookup**
   - `$lookup`: Permite realizar joins entre colecciones.
   ```javascript
   // Ejemplo: Join entre colecciones de usuarios y comentarios
   db.users.aggregate([
     {
       $lookup:
         {
           from: "comments",
           localField: "_id",
           foreignField: "userId",
           as: "userComments"
         }
      }
   ])
   ```

### Consultas con Arrays
1. **Operadores en Arrays**
   - `$all`: Busca documentos que contengan todos los elementos especificados en un array.
   ```javascript
   // Ejemplo: Buscar documentos que contengan "Internet" y "Wifi" en amenities
   db.listingsAndReviews.find({ amenities: { $all: ["Internet", "Wifi"] } })
   ```

   - `$elemMatch`: Proyecta elementos de un array que cumplan con un criterio.
   ```javascript
   // Ejemplo: Buscar documentos donde cualquier elemento del array cumple la condición
   db.grades.find({ scores: { $elemMatch: { score: { $gt: 85 } } } })
   ```

2. **Consultas con Tamaño de Arrays**
   - `$size`: Busca documentos que contengan un array con un tamaño específico.
   ```javascript
   // Ejemplo: Buscar documentos con un array de amenities de tamaño 5
   db.listingsAndReviews.find({ amenities: { $size: 5 } })
   ```

### Consultas con Expresiones
1. **Expresiones en Consultas**
   - `$expr`: Permite usar variables y declaraciones condicionales en consultas.
   ```javascript
   // Ejemplo: Buscar documentos donde el viaje empieza y termina en la misma estación
   db.trips.find({ $expr: { $eq: ["$end_station_id", "$start_station_id"] } })
   ```

2. **Consultas con Condiciones**
   - `$cond`: Permite usar condiciones if-else dentro de las consultas de agregación.
   ```javascript
   // Ejemplo: Calcular el precio con descuento si el precio original es mayor a 100
   db.sales.aggregate([
     {
       $project:
         {
           item: 1,
           discountedPrice: {
             $cond: { if: { $gt: ["$price", 100] }, then: { $multiply: ["$price", 0.9] }, else: "$price" }
           }
         }
     }
   ])
   ```

### Consultas con Proyecciones Avanzadas
1. **Proyecciones**
   - Seleccionar campos específicos y excluir otros.
   ```javascript
   // Ejemplo: Incluir solo el título y el año de las películas
   db.movies.find({}, { title: 1, year: 1, _id: 0 })
   ```

2. **Proyecciones con Dot Notation**
   - Permite acceder a campos anidados dentro de subdocumentos.
   ```javascript
   // Ejemplo: Proyectar el primer nombre de una persona en el array de relaciones
   db.companies.find({ "relationships.0.person.first_name": "Mark" }, { "name": 1 })
   ```

### Consultas Avanzadas de Ejemplo
1. **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

2. **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

3. **Número de empresas con más empleados que el año de fundación**
   ```javascript
   db.companies.find({ $expr: { $gt: ["$number_of_employees", "$founded_year"] } }).count()
   ```

4. **Empresas cuyo permalink coincide con el twitter_username**
   ```javascript
   db.companies.find({ $expr: { $eq: ["$permalink", "$twitter_username"] } }).count()
   ```

5. **Alojamientos que permiten más de 6 personas y tienen exactamente 50 reviews**
   ```javascript
   db.listingsAndReviews.find({ accommodates: { $gt: 6 }, number_of_reviews: 50 })
   ```

6. **Empresas con oficinas en Seattle**
   ```javascript
   db.companies.find({ offices: { $elemMatch: { city: "Seattle" } } }).count()
   ```

7. **Documentos con un array amenities que contiene "Internet" como primer elemento**
   ```javascript
   db.listingsAndReviews.find({ amenities: { $elemMatch: { $eq: "Internet", $position: 0 } } }, { name: 1, address: 1 })
   ```

8. **Número de viajes que empiezan en estaciones al oeste de la longitud -74**
   ```javascript
   db.trips.find({ "start station location.coordinates.0": { $lt: -74 } }).count()
   ```

9. **Número de inspecciones en la ciudad de "NEW YORK"**
   ```javascript
   db.inspections.find({ city: "NEW YORK" }).count()
   ```

### Consejos Adicionales
- **Documentación Oficial**: Familiarízate con la [documentación oficial de MongoDB](https://docs.mongodb.com/).
- **Práctica**: Realiza consultas en una base de datos de prueba para afianzar tus conocimientos.
- **Utiliza el MongoDB Shell**: Herramienta interactiva para ejecutar comandos y consultas en MongoDB.

Con este resumen detallado, deberías estar bien preparado para abordar cualquier pregunta relacionada con consultas en MongoDB en tu examen. ¡Buena suerte!

### Consultas de Ejemplo Complejas para el Examen de MongoDB

#### 1. Inserción de Documentos

- **Insertar una película con detalles complejos**
   ```javascript
   db.movies.insertOne({
     title: "The Dark Knight",
     year: 2008,
     rated: "PG-13",
     genres: ["Action", "Crime", "Drama"],
     directors: ["Christopher Nolan"],
     cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
     imdb: { rating: 9.0, votes: 2300000, id: 468569 },
     awards: { wins: 2, nominations: 4, text: "Won 2 Oscars. Another 4 wins & 4 nominations." },
     languages: ["English", "Mandarin"],
     released: new Date("2008-07-18"),
     runtime: 152,
     countries: ["USA", "UK"],
     plot: "When the menace known as the Joker emerges from his mysterious past, he wreaks havoc and chaos on the people of Gotham."
   })
   ```

#### 2. Consulta de Documentos

- **Consultar todas las películas de un director específico y ordenar por calificación IMDb descendente**
   ```javascript
   db.movies.find({ directors: "Christopher Nolan" }).sort({ "imdb.rating": -1 })
   ```

- **Consultar películas estrenadas entre dos fechas y proyectar solo título y fecha de estreno**
   ```javascript
   db.movies.find(
     { released: { $gte: new Date("2000-01-01"), $lte: new Date("2010-12-31") } },
     { title: 1, released: 1 }
   )
   ```

- **Consultar películas con múltiples condiciones y orden ascendente por año**
   ```javascript
   db.movies.find(
     { $and: [{ year: { $gte: 1990 } }, { genres: "Drama" }, { "imdb.rating": { $gte: 8 } }] }
   ).sort({ year: 1 })
   ```

- **Consultar películas con un campo específico faltante**
   ```javascript
   db.movies.find({ awards: { $exists: false } })
   ```

#### 3. Actualización de Documentos

- **Actualizar el número de votos IMDb de una película específica**
   ```javascript
   db.movies.updateOne({ title: "Inception" }, { $set: { "imdb.votes": 2200000 } })
   ```

- **Añadir un nuevo campo 'boxOffice' a todas las películas de un género específico**
   ```javascript
   db.movies.updateMany({ genres: "Sci-Fi" }, { $set: { boxOffice: "N/A" } })
   ```

#### 4. Eliminación de Documentos

- **Eliminar todas las películas de un director específico**
   ```javascript
   db.movies.deleteMany({ directors: "Uwe Boll" })
   ```

- **Eliminar películas con calificación IMDb menor a 5**
   ```javascript
   db.movies.deleteMany({ "imdb.rating": { $lt: 5 } })
   ```

#### 5. Consultas Avanzadas

- **Encontrar todas las películas con un cierto número de premios ganados y ordenarlas por cantidad de premios en orden descendente**
   ```javascript
   db.movies.find({ "awards.wins": { $gte: 1 } }).sort({ "awards.wins": -1 })
   ```

- **Encontrar películas donde un actor específico aparece en el reparto**
   ```javascript
   db.movies.find({ cast: "Leonardo DiCaprio" })
   ```

- **Encontrar películas por varias clasificaciones de edad**
   ```javascript
   db.movies.find({ rated: { $in: ["PG-13", "R"] } })
   ```

#### 6. Agregaciones

- **Obtener el promedio de calificación IMDb por género**
   ```javascript
   db.movies.aggregate([
     { $unwind: "$genres" },
     { $group: { _id: "$genres", avgRating: { $avg: "$imdb.rating" } } }
   ])
   ```

- **Contar el número de películas por año y ordenar en orden descendente**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$year", count: { $sum: 1 } } },
     { $sort: { count: -1 } }
   ])
   ```

- **Filtrar películas con una calificación alta y agruparlas por país**
   ```javascript
   db.movies.aggregate([
     { $match: { "imdb.rating": { $gte: 8.0 } } },
     { $unwind: "$countries" },
     { $group: { _id: "$countries", count: { $sum: 1 } } }
   ])
   ```

#### 7. Índices

- **Crear índice en el campo 'year' en orden ascendente**
   ```javascript
   db.movies.createIndex({ year: 1 })
   ```

- **Crear índice en el campo 'imdb.rating' en orden descendente**
   ```javascript
   db.movies.createIndex({ "imdb.rating": -1 })
   ```

- **Crear un índice compuesto en 'year' y 'title'**
   ```javascript
   db.movies.createIndex({ year: 1, title: 1 })
   ```

#### 8. Consultas Específicas del Examen

- **Indicar el título y el número de premios de la película con más premios**
   ```javascript
   db.movies.find().sort({ "awards.wins": -1 }).limit(1).project({ title: 1, "awards.wins": 1 })
   ```

- **Listar diferentes clasificaciones de edad y su número de documentos**
   ```javascript
   db.movies.aggregate([
     { $group: { _id: "$rated", count: { $sum: 1 } } }
   ])
   ```

- **Listar diferentes géneros de película**
   ```javascript
   db.movies.distinct("genres")
   ```

- **Número de películas entre 1970 y 1975**
   ```javascript
   db.movies.countDocuments({ year: { $gte: 1970, $lte: 1975 } })
   ```

#### 9. Ejemplos Adicionales

- **Encontrar todas las películas de un género específico y ordenarlas por año en orden ascendente**
   ```javascript
   db.movies.find({ genres: "Comedy" }).sort({ year: 1 })
   ```

- **Encontrar películas con una calificación IMDb entre 7 y 9 y ordenarlas por votos en orden descendente**
   ```javascript
   db.movies.find({ "imdb.rating": { $gte: 7, $lte: 9 } }).sort({ "imdb.votes": -1 })
   ```

- **Encontrar películas con más de un millón de votos y ordenarlas por calificación en orden descendente**
   ```javascript
   db.movies.find({ "imdb.votes": { $gt: 1000000 } }).sort({ "imdb.rating": -1 })
   ```

- **Encontrar películas por varios géneros y ordenarlas por año en orden ascendente**
   ```javascript
   db.movies.find({ genres: { $all: ["Drama", "Thriller"] } }).sort({ year: 1 })
   ```

### Consejos Adicionales

- **Documentación Oficial de MongoDB**: Familiarízate con la [documentación oficial de MongoDB](https://docs.mongodb.com/manual/).
- **Práctica**: Realiza consultas en una base de datos de prueba para afianzar tus conocimientos.
- **Utiliza el MongoDB Shell**: Es una herramienta interactiva para ejecutar comandos y consultas en MongoDB.

Este conjunto de consultas y ejemplos debería cubrir la mayoría de los escenarios que puedes encontrar en tu examen. ¡Buena suerte!

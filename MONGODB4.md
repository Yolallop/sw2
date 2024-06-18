### MongoDB: Resumen Detallado para el Examen

### Introducción a MongoDB
- **MongoDB** es una base de datos NoSQL que almacena datos en documentos BSON (una extensión binaria de JSON).
- Utiliza colecciones para agrupar documentos y cada documento puede tener una estructura diferente, lo que proporciona flexibilidad en el diseño de la base de datos.

### Operaciones Básicas
1. **Insertar Documentos**
   ```javascript
   // Insertar un solo documento
   db.collection.insertOne(document)

   // Insertar múltiples documentos
   db.collection.insertMany([document1, document2, ...])
   ```

2. **Consultar Documentos**
   ```javascript
   // Consultar todos los documentos
   db.collection.find(query)

   // Consultar un solo documento
   db.collection.findOne(query)

   // Ejemplo: Obtener todas las películas con clasificación "PG"
   db.movies.find({ rated: "PG" })
   ```

3. **Actualizar Documentos**
   ```javascript
   // Actualizar un solo documento
   db.collection.updateOne(filter, update, options)

   // Actualizar múltiples documentos
   db.collection.updateMany(filter, update, options)

   // Ejemplo: Actualizar la clasificación de una película
   db.movies.updateOne({ _id: ObjectId("573a1390f29313caabcd4135") }, { $set: { rated: "PG-13" } })
   ```

4. **Eliminar Documentos**
   ```javascript
   // Eliminar un solo documento
   db.collection.deleteOne(filter)

   // Eliminar múltiples documentos
   db.collection.deleteMany(filter)

   // Ejemplo: Eliminar una película por ID
   db.movies.deleteOne({ _id: ObjectId("573a1390f29313caabcd4135") })
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

### Agregaciones
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

### Índices
- **Crear Índices**: Mejora el rendimiento de las consultas.
   ```javascript
   // Crear un índice en el campo title
   db.collection.createIndex({ field: 1 }) // Orden ascendente
   db.collection.createIndex({ field: -1 }) // Orden descendente

   // Ejemplo: Crear un índice en el campo title
   db.movies.createIndex({ title: 1 })
   ```

### Preguntas Frecuentes en el Examen
1. **Indicar el título y el número de premios de la película con más premios**
   ```javascript
   db.movies.find().sort({ "awards.wins": -1 }).limit(1).project({ title: 1, "awards.wins": 1 }) // Orden descendente (de mayor a menor)
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

### Consejos Adicionales
- **Documentación Oficial**: Familiarízate con la [documentación oficial de MongoDB](https://docs.mongodb.com/).
- **Práctica**: Realiza consultas en una base de datos de prueba para afianzar tus conocimientos.
- **Utiliza el MongoDB Shell**: Herramienta interactiva para ejecutar comandos y consultas en MongoDB.

Con este resumen detallado, deberías estar bien preparado para abordar cualquier pregunta relacionada con MongoDB en tu examen. ¡Buena suerte!

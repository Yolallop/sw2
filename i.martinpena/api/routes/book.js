const express = require('express'); // Importa Express
const router = express.Router(); // Crea un enrutador de Express
const dbo = require('../db/conn'); // Importa la conexión a la base de datos
const ObjectId = require('mongodb').ObjectId; // Importa ObjectId de MongoDB para manejar IDs
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS); // Obtiene el máximo de resultados de las variables de entorno
const COLLECTION = 'books'; // Define la colección de MongoDB

// getBooks()
router.get('/', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit) { // Si hay un parámetro 'limit' en la query
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS); // Usa el menor valor entre el parámetro 'limit' y MAX_RESULTS
  }
  let next = req.query.next;
  let query = {}
  if (next) { // Si hay un parámetro 'next' en la query
    query = { _id: { $lt: new ObjectId(next) } } // Busca documentos con _id menor que 'next' para paginación
  }
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection(COLLECTION)
    .find(query) // Realiza la búsqueda con el query definido
    .project({ title: 1, author: 1 }) // Proyecta solo los campos 'title' y 'author'
    .sort({ _id: -1 }) // Ordena los resultados por _id en orden descendente
    .limit(limit) // Limita el número de resultados
    .toArray()
    .catch(err => res.status(400).send('Error searching for books')); // Manejo de errores

  // Añade el enlace HATEOAS a cada libro
  results.forEach(book => {
    book["link"] = `http://localhost:${process.env.PORT}${process.env.BASE_URI}/book/${book._id}`;
  });

  // Determina el valor de 'next' para la paginación
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200); // Devuelve los resultados y el campo 'next'
});

// getBookById()
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(req.params.id) }; // Crea un query para buscar por ID
  let result = await dbConnect
    .collection(COLLECTION)
    .findOne(query); // Busca un documento con el ID especificado
  if (!result) { // Si no se encuentra el documento
    res.send("Not found").status(404); // Devuelve un mensaje de error 404
  } else {
    res.status(200).send(result); // Devuelve el documento encontrado
  }
});

// addBook()
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  console.log(req.body); // Imprime el cuerpo de la solicitud en la consola
  let result = await dbConnect
    .collection(COLLECTION)
    .insertOne(req.body); // Inserta un nuevo documento en la colección
  res.status(201).send(result); // Devuelve el resultado de la inserción
});

// deleteBookById()
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) }; // Crea un query para buscar por ID
  const dbConnect = dbo.getDb();
  let result; 
  try {
    result = await dbConnect.collection(COLLECTION).deleteOne(query); // Intenta eliminar el documento
    if (result.deletedCount === 0) { // Si no se eliminó ningún documento
      res.status(400).send("Invalid Book ID"); // Devuelve un mensaje de error 400
    } else {
      res.status(200).send("Successful operation"); // Devuelve un mensaje de éxito
    }
  } catch (err) {
    res.status(400).send("Invalid Book ID"); // Manejo de errores
  }
});

module.exports = router; // Exporta el enrutador
### Manual Completo para Operaciones CRUD, Paginación y Validaciones en MongoDB

Este manual te ayudará a crear operaciones CRUD (Create, Read, Update, Delete), paginación y validaciones en MongoDB usando Express.js. Además, incluye ejemplos de validaciones y otros casos avanzados que pueden surgir en un examen.

### Configuración Inicial
Primero, asegúrate de tener configurada tu conexión a la base de datos MongoDB en `db/conn.js`.

### Estructura del Proyecto
- `cards.js`: Contiene las rutas para gestionar cartas.
- `decks.js`: Contiene las rutas para gestionar mazos.
- `paginacion.js`: Contiene ejemplos de paginación tanto basada en desplazamiento como en cursor.

### Ejemplo de Configuración de Conexión a MongoDB
```javascript
// db/conn.js
const { MongoClient } = require('mongodb');
const connectionString = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new MongoClient(connectionString, { useNewUrlParser: true, useUnifiedTopology: true });

let dbConnection;

module.exports = {
  connectToServer: function (callback) {
    client.connect(function (err, db) {
      if (err || !db) {
        return callback(err);
      }

      dbConnection = db.db('cardgame');
      console.log('Successfully connected to MongoDB.');

      return callback();
    });
  },

  getDb: function () {
    return dbConnection;
  },
};
```

### Operaciones CRUD

#### 1. **Crear (Create)**

##### Crear una nueva carta con validación
```javascript
// cards.js
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const newCard = req.body;

  // Validación básica
  if (!newCard.name || !newCard.type) {
    return res.status(400).send({ error: 'Name and type are required' });
  }

  let result = await dbConnect
    .collection('cards')
    .insertOne(newCard);
  res.status(201).send(result);
});
```

##### Crear un nuevo mazo con validación de héroe y cartas
```javascript
// decks.js
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const newDeck = req.body;

  // Validación básica
  if (!newDeck.name || !newDeck.description || !newDeck.hero || !newDeck.cards) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  // Validar que el héroe sea de tipo "hero"
  const heroCard = await dbConnect.collection('cards').findOne({ _id: new ObjectId(newDeck.hero), type: 'hero' });
  if (!heroCard) {
    return res.status(400).send({ error: 'Invalid hero card' });
  }

  // Validar que las cartas no sean de tipo "hero" y no más de 3 copias
  for (const cardId in newDeck.cards) {
    const card = await dbConnect.collection('cards').findOne({ _id: new ObjectId(cardId) });
    if (!card || card.type === 'hero') {
      return res.status(400).send({ error: 'Invalid card in deck' });
    }
    if (newDeck.cards[cardId] > 3) {
      return res.status(400).send({ error: 'No more than 3 copies of the same card are allowed' });
    }
  }

  let result = await dbConnect
    .collection('decks')
    .insertOne(newDeck);
  res.status(201).send(result);
});
```

#### 2. **Leer (Read)**

##### Obtener todas las cartas con paginación basada en desplazamiento
```javascript
// cards.js
router.get('/', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = {};
  if (next) {
    query = { _id: { $lt: new ObjectId(next) } };
  }
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection('cards')
    .find(query)
    .project({ _id: 1, name: 1, type: 1 })
    .sort({ _id: -1 })
    .limit(limit)
    .toArray()
    .catch(err => res.status(400).send('Error searching for cards'));
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200);
});
```

##### Obtener una carta por ID
```javascript
// cards.js
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(req.params.id) };
  let result = await dbConnect
    .collection('cards')
    .findOne(query);
  if (!result) {
    res.send("Not found").status(404);
  } else {
    res.status(200).send(result);
  }
});
```

##### Obtener libros con paginación basada en cursor
```javascript
// paginacion.js
router.get('/CursorBasedPagination', async (req, res) => {
  let size = null;
  let query_size = parseInt(req.query.size);
  let envMaxResults = parseInt(process.env.MAX_RESULTS);
  if (query_size >= 1 && query_size <= envMaxResults) {
    size = query_size;
  } else {
    size = envMaxResults;
  }

  const query = {};
  if (req.query.next) {
    query._id = { $gt: new ObjectId(req.query.next) };
  }

  try {
    const dbConnect = dbo.getDb();
    const results = await dbConnect
      .collection('books')
      .find(query)
      .sort({ _id: 1 })
      .project({ title: 1 })
      .limit(size)
      .toArray();

    const next = results.length === size ? results[results.length - 1]._id : null;
    res.status(200).json({ results, next });
  } catch (error) {
    console.log(error);
    res.status(400).send('Error searching for books');
  }
});
```

#### 3. **Eliminar (Delete)**

##### Eliminar una carta por ID
```javascript
// cards.js
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection('cards')
    .deleteOne(query);
  res.status(200).send(result);
});
```

##### Eliminar un libro por ID
```javascript
// paginacion.js
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const dbConnect = dbo.getDb();
  
  let result = await dbConnect
    .collection('books')
    .deleteOne(query);
  if (result.deletedCount == 1) {
    res.status(200).send("Successful operation");
  } else {
    res.status(400).send("Invalid book ID");
  }
});
```

### Paginación

#### Paginación Basada en Desplazamiento (Offset-Based Pagination)
```javascript
// paginacion.js
router.get('/offsetBasedPagination', async (req, res) => {
  const page = req.query.page ? Math.max(parseInt(req.query.page), 1) : 1;
  let size = MAX_RESULTS;
  if (req.query.size && (parseInt(req.query.size) > 0)) {
    size = Math.min(parseInt(req.query.size), MAX_RESULTS);
  }
  const offset = (page - 1) * size;
  
  try {
    const dbConnect = dbo.getDb();
    const results = await dbConnect
      .collection('books')
      .find()
      .sort({ _id: 1 })
      .project({ title: 1 })
      .skip(offset)
      .limit(size)
      .toArray();

    const total_elements = await dbConnect.collection('books').countDocuments();
    const remaining_elements = total_elements - (page * size);
    let next = null;
    if (remaining_elements <= size && remaining_elements > 0) {
      next = `http://localhost:${process.env.PORT}${process.env.BASE_URI}/book/offsetBasedPagination?size=${remaining_elements}&page=${page + 1}`;
    } else if (remaining_elements > size) {
      next = `http://localhost:${process.env.PORT}${process.env.BASE_URI}/book/offsetBasedPagination?size=${size}&page=${page + 1}`;
    }
    res.status(200).json({ results, next });
  } catch (error) {
    console.log(error);
    res.status(400).send('Error searching for books');
  }
});
```

#### Paginación Basada en Cursor (Cursor-Based Pagination)
```javascript
// paginacion.js
router.get('/CursorBasedPagination', async (req, res) => {
  let size = null;
  let query_size = parseInt(req.query.size);
  let envMaxResults = parseInt(process.env.MAX_RESULTS);
  if (query_size >= 1 && query_size <= envMaxResults) {
    size = query_size;
  } else {
    size = envMaxResults;
  }

  const query = {};
  if (req.query.next) {
    query._id = { $gt: new ObjectId(req.query.next) };
  }

  try {
    const dbConnect = dbo.getDb();
    const results = await dbConnect
      .collection('books')
      .find(query)
      .sort({ _id: 1 })
      .project({ title: 1 })
      .limit(size)
      .toArray();

    const next = results.length === size ? results[results.length - 1]._id : null;
    res.status(200).json({ results, next });
  } catch (error) {
    console.log(error);
    res.status(400).send('Error searching for books');
  }
});
```

### Validaciones

#### Validación de Datos en la Creación de Documentos
Las validaciones pueden realizarse tanto en el cliente (antes de enviar los datos al servidor) como en el servidor (antes de insertar los datos en la base de datos).

##### Ejemplo de Validación en la Creación de una Carta
```javascript
// cards.js
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const newCard = req.body;

  // Validación básica
  if (!newCard.name || !newCard.type) {
    return res.status(400).send({ error: 'Name and type are required' });
  }

  // Validación de longitud del nombre
  if (newCard.name.length > 100) {
    return res.status(400).send({ error: 'Name cannot be longer than 100 characters' });
  }

  let result = await dbConnect
    .collection('cards')
    .insertOne(newCard);
  res.status(201).send(result);
});
```

#### Validación de Datos en la Creación de un Mazo
```javascript
// decks.js
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const newDeck = req.body;

  // Validación básica
  if (!newDeck.name || !newDeck.description || !newDeck.hero || !newDeck.cards) {
    return res.status(400).send({ error: 'All fields are required' });
  }

  // Validar que el héroe sea de tipo "hero"
  const heroCard = await dbConnect.collection('cards').findOne({ _id: new ObjectId(newDeck.hero), type: 'hero' });
  if (!heroCard) {
    return res.status(400).send({ error: 'Invalid hero card' });
  }

  // Validar que las cartas no sean de tipo "hero" y no más de 3 copias
  for (const cardId in newDeck.cards) {
    const card = await dbConnect.collection('cards').findOne({ _id: new ObjectId(cardId) });
    if (!card || card.type === 'hero') {
      return res.status(400).send({ error: 'Invalid card in deck' });
    }
    if (newDeck.cards[cardId] > 3) {
      return res.status(400).send({ error: 'No more than 3 copies of the same card are allowed' });
    }
  }

  let result = await dbConnect
    .collection('decks')
    .insertOne(newDeck);
  res.status(201).send(result);
});
```

### Otros Casos Comunes

#### Manejo de Errores
Es importante manejar los errores correctamente en tu API para que los clientes sepan qué salió mal.

```javascript
// Ejemplo de manejo de errores en una operación de lectura
router.get('/:id', async (req, res) => {
  try {
    const dbConnect = dbo.getDb();
    let query = { _id: new ObjectId(req.params.id) };
    let result = await dbConnect
      .collection('cards')
      .findOne(query);
    if (!result) {
      res.status(404).send({ error: "Not found" });
    } else {
      res.status(200).send(result);
    }
  } catch (error) {
    res.status(500).send({ error: "Internal Server Error" });
  }
});
```

#### Filtrado Avanzado
Puedes permitir a los usuarios de tu API filtrar datos usando varios parámetros de consulta.

```javascript
// cards.js
router.get('/search', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = {};

  if (req.query.name) {
    query.name = { $regex: req.query.name, $options: 'i' }; // Filtrar por nombre (case-insensitive)
  }

  if (req.query.type) {
    query.type = req.query.type; // Filtrar por tipo
  }

  let results = await dbConnect
    .collection('cards')
    .find(query)
    .toArray()
    .catch(err => res.status(400).send('Error searching for cards'));

  res.status(200).send(results);
});
```

### Conclusión
Este manual proporciona una guía completa para realizar operaciones CRUD, paginación y validaciones en MongoDB usando Express.js. Puedes usar estos ejemplos como referencia para tus exámenes y proyectos, adaptándolos según sea necesario.

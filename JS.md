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

Entendido, te proporcionaré ejemplos adicionales de posibles casos que podrían surgir en un examen similar, enfocándome en operaciones CRUD (Create, Read, Update, Delete) y paginación, pero utilizando diferentes contextos y consideraciones. 

### Ejemplo Adicional 1: Gestión de Productos en un Inventario

#### Especificación OpenAPI

```yaml
openapi: 3.0.3
info:
  description: API para la gestión de productos en un inventario.
  version: 1.0.0
  title: Inventario de Productos
tags:
  - name: product
    description: Todo sobre los productos en el inventario
paths:
  /product:
    get:
      summary: Obtener todos los productos
      description: Recuperar todos los productos en el inventario con paginación opcional.
      parameters:
        - name: limit
          in: query
          description: Número de productos a devolver
          required: false
          schema:
            type: integer
            minimum: 1
            example: 10
        - name: offset
          in: query
          description: Desplazamiento para la paginación
          required: false
          schema:
            type: integer
            minimum: 0
            example: 0
      responses:
        "200":
          description: "OK"
          content:
            application/json:
              schema: 
                $ref: '#/components/schemas/Products'
    post:
      tags:
        - product
      summary: Añadir un nuevo producto
      description: Añadir un nuevo producto al inventario.
      operationId: addProduct
      requestBody:
        description: Objeto del producto que se necesita añadir al inventario
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Product'
      responses:
        '201':
          description: Operación exitosa
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: Entrada inválida
  /product/{productId}:
    parameters:
      - $ref: '#/components/parameters/ID'
    get:
      tags:
        - product
      summary: Encontrar producto por ID
      description: Devuelve un solo producto por ID.
      operationId: getProductById
      responses:
        '200':
          description: Operación exitosa
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: ID inválido proporcionado
        '404':
          description: Producto no encontrado
    put:
      tags:
        - product
      summary: Actualizar un producto
      description: Actualiza un producto existente en el inventario.
      operationId: updateProduct
      requestBody:
        description: Objeto del producto que se necesita actualizar
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Product'
      responses:
        '200':
          description: Operación exitosa
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'
        '400':
          description: ID inválido proporcionado
        '404':
          description: Producto no encontrado
    delete:
      tags:
        - product
      summary: Eliminar un producto
      description: Elimina un producto por ID.
      operationId: deleteProduct
      responses:
        '200':
          description: Operación exitosa
        '400':
          description: ID de producto inválido
        '404':
          description: Producto no encontrado
components:
  parameters:
    ID:
      description: ID del producto
      name: productId
      in: path
      required: true
      schema:
        type: string
        example: "507f1f77bcf86cd799439011"
  schemas:
    Products:
      type: object
      properties:
        results:
          type: array
          items:
            $ref: '#/components/schemas/ProductMin'
        next:
          type: string
          description: ID del siguiente producto para la paginación
      required:
        - results
    ProductMin:
      type: object
      properties:
        _id:
          type: string
          description: ID del producto
        name:
          type: string
          description: Nombre del producto
        category:
          type: string
          description: Categoría del producto
      required:
        - _id
        - name
        - category
    Product:
      type: object
      properties:
        _id:
          type: string
          description: ID del producto
        name:
          type: string
          description: Nombre del producto
          maxLength: 100
          minLength: 1
        description:
          type: string
          description: Descripción del producto
          maxLength: 500
        price:
          type: number
          description: Precio del producto
          minimum: 0
        stock:
          type: integer
          description: Cantidad en stock
          minimum: 0
        category:
          type: string
          description: Categoría del producto
      required:
        - _id
        - name
        - price
        - stock
        - category
```

### Implementación del CRUD en `products.js`

```javascript
const express = require('express');
const router = express.Router();
const { ObjectId } = require('mongodb');
const db = require('../db');

// Error handling utility
const createError = (code, message) => ({ code, message });

// GET /product - Retrieve all products with optional pagination
router.get('/', async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  
  try {
    const products = await db.collection('products')
      .find({})
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .toArray();
      
    res.status(200).json({
      results: products,
      next: products.length === parseInt(limit) ? `/product?limit=${limit}&offset=${parseInt(offset) + parseInt(limit)}` : null,
    });
  } catch (error) {
    res.status(500).json(createError(5, 'Internal server error'));
  }
});

// POST /product - Add a new product to the inventory
router.post('/', async (req, res) => {
  const { name, description, price, stock, category } = req.body;

  if (!name || !price || !stock || !category) {
    return res.status(400).json(createError(1, 'Invalid input'));
  }

  const product = {
    name,
    description,
    price,
    stock,
    category,
  };

  try {
    const result = await db.collection('products').insertOne(product);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    res.status(500).json(createError(5, 'Internal server error'));
  }
});

// GET /product/{productId} - Retrieve a single product by ID
router.get('/:productId', async (req, res) => {
  const { productId } = req.params;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json(createError(2, 'Invalid ID supplied'));
  }

  try {
    const product = await db.collection('products').findOne({ _id: ObjectId(productId) });
    if (!product) {
      return res.status(404).json(createError(3, 'Product not found'));
    }
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json(createError(5, 'Internal server error'));
  }
});

// PUT /product/{productId} - Update a product by ID
router.put('/:productId', async (req, res) => {
  const { productId } = req.params;
  const { name, description, price, stock, category } = req.body;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json(createError(2, 'Invalid ID supplied'));
  }

  const update = { $set: { name, description, price, stock, category } };

  try {
    const result = await db.collection('products').updateOne({ _id: ObjectId(productId) }, update);
    if (result.matchedCount === 0) {
      return res.status(404).json(createError(3, 'Product not found'));
    }
    res.status(200).json({ _id: productId, name, description, price, stock, category });
  } catch (error) {
    res.status(500).json(createError(5, 'Internal server error'));
  }
});

// DELETE /product/{productId} - Delete a product by ID
router.delete('/:productId', async (req, res) => {
  const { productId } = req.params;

  if (!ObjectId.isValid(productId)) {
    return res.status(400).json(createError(2, 'Invalid ID supplied'));
  }

  try {
    const result = await db.collection('products').deleteOne({ _id: ObjectId(productId) });
    if (result.deletedCount === 0) {
      return res.status(404).json(createError(3, 'Product not found'));
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json(createError(5, 'Internal server error'));
  }
});

module.exports = router;
```
```

### Consideraciones Adicionales

1. **Validaciones adicionales**:
   - Verificar tipos de datos, longitudes y rangos en el servidor además de en la especificación OpenAPI.
   - Asegurarse de que los IDs de productos, cartas o cualquier otra entidad cumplan con el formato correcto antes de realizar operaciones en la base de datos.

2. **Manejo de errores**:
   - Crear un conjunto robusto de códigos de error y mensajes para cubrir todos los posibles escenarios.
   - Implementar manejo de errores global en la aplicación para capturar y manejar errores inesperados.

3. **Seguridad**:
   - Implementar autenticación y autorización para asegurar que solo usuarios autorizados puedan realizar ciertas operaciones.
   - Proteger las rutas sensibles y datos importantes.

4. **Paginación y filtros**:
   - Implementar paginación y filtros en las rutas GET para mejorar la eficiencia y manejabilidad de las respuestas con muchos datos.
   - Permitir a los usuarios aplicar filtros basados en múltiples criterios.

5. **Documentación**:
   - Mantener la documentación actualizada con todos los endpoints, parámetros, ejemplos de peticiones y respuestas.
   - Usar herramientas como Swagger UI para proporcionar una interfaz interactiva para probar la API.

6. **Pruebas**:
   - Escribir pruebas unitarias y de integración para asegurar que todas las rutas funcionen correctamente y manejen errores de manera adecuada.
   - Usar herramientas como Postman para realizar pruebas manuales de la API.

Estos ejemplos y consideraciones adicionales deberían ayudarte a estar preparado para enfrentar preguntas más difíciles y casos prácticos en tu examen. ¡Buena suerte


const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);
const COLLECTION = 'cards';

// getCardsByType() - Obtener cartas por tipo con paginación
router.get('/type/:type', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = { type: req.params.type };
  if (next) {
    query._id = { $lt: ObjectId(next) };
  }
  const dbConnect = dbo.getDb();
  try {
    let results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1 })
      .sort({ _id: -1 })
      .limit(limit)
      .toArray();
    next = results.length === limit ? results[results.length - 1]._id : null;
    res.json({ results, next }).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by type');
  }
});

module.exports = router;


Entendido. Aquí tienes la implementación de una ruta para filtrar cartas por tipo sin paginación utilizando la estructura que has proporcionado.

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const COLLECTION = 'cards';

// getCardsByType() - Obtener cartas por tipo
router.get('/type/:type', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { type: req.params.type };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by type');
  }
});

module.exports = router;
```

### Explicación del código:
1. **Librerías y constantes:**
   - `express` para la creación del router.
   - `dbo` para la conexión a la base de datos.
   - `COLLECTION` para definir la colección de cartas (`cards`).

2. **Ruta para obtener cartas por tipo:**
   - Se obtiene el tipo de carta desde los parámetros de la ruta (`req.params.type`).
   - Se construye la consulta para MongoDB, filtrando por tipo.
   - Se conecta a la base de datos y realiza la consulta, proyectando solo los campos `_id`, `name`, y `type`.
   - Se convierte el resultado a un arreglo y se envía en la respuesta JSON.

3. **Manejo de errores:**
   - Se utiliza `try-catch` para manejar posibles errores durante la consulta a la base de datos.
   - En caso de error, se envía un mensaje de error con el código de estado `400`.

### Ejemplo de uso:

- **Obtener cartas de tipo "hero":**
  ```
  GET /cards/type/hero
  ```

- **Respuesta esperada:**
  ```json
  [
    { "_id": "603dcd8f7c213e6d8f123456", "name": "Spider-Man", "type": "hero" },
    { "_id": "603dcd8f7c213e6d8f123457", "name": "Black Panther", "type": "hero" },
    // ... otros resultados
  ]
  ```

Este ejemplo te permite filtrar las cartas por tipo sin implementar paginación, mostrando todos los resultados que coincidan con el tipo especificado. Si necesitas más ejemplos o detalles adicionales, házmelo saber.

Claro, aquí tienes algunas opciones adicionales que podrían ser relevantes para tu examen. Estas opciones incluyen la validación de entradas, rutas adicionales para distintas funcionalidades y manejo de errores.

### Validación de Entradas
```javascript
const { body, validationResult } = require('express-validator');

// addCard() with validation
router.post(
  '/',
  [
    body('_id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('type').isString().isIn(['hero', 'ally', 'event']),
    body('hand_size').optional().isInt({ min: 1 }),
    body('health').optional().isInt({ min: 0 }),
    body('thwart').optional().isInt({ min: 0 }),
    body('attack').optional().isInt({ min: 0 }),
    body('defense').optional().isInt({ min: 0 }),
    body('is_unique').optional().isBoolean(),
    body('traits').optional().isArray(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const dbConnect = dbo.getDb();
    try {
      const result = await dbConnect.collection(COLLECTION).insertOne(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send('Error inserting card');
    }
  }
);
```

### Rutas Adicionales
#### Obtener cartas por nombre
```javascript
// getCardsByName() - Obtener cartas por nombre
router.get('/name/:name', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { name: req.params.name };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by name');
  }
});
```

#### Obtener cartas únicas
```javascript
// getUniqueCards() - Obtener cartas únicas
router.get('/unique', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { is_unique: true };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for unique cards');
  }
});
```

### Manejo de Errores
#### Error 404 para rutas no definidas
```javascript
router.use((req, res) => {
  res.status(404).send('Not Found');
});
```

#### Error 500 para errores del servidor
```javascript
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});
```

### Búsqueda con múltiples filtros
```javascript
// getCardsWithFilters() - Obtener cartas con múltiples filtros
router.get('/search', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { name, type, is_unique } = req.query;
  const query = {};

  if (name) query.name = name;
  if (type) query.type = type;
  if (is_unique !== undefined) query.is_unique = is_unique === 'true';

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1, is_unique: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards with filters');
  }
});
```

### Obtener conteo de cartas por tipo
```javascript
// getCountByType() - Obtener conteo de cartas por tipo
router.get('/count/type', async (req, res) => {
  const dbConnect = dbo.getDb();
  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .aggregate([
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ])
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error getting count by type');
  }
});
```

### Explicaciones y ejemplos
1. **Validación de Entradas:**
   - Usamos `express-validator` para validar los datos enviados en el `POST`.
   - Aseguramos que los campos requeridos estén presentes y cumplan con los criterios especificados.

2. **Obtener cartas por nombre:**
   - Similar a obtener cartas por tipo, pero filtrando por el nombre de la carta.

3. **Obtener cartas únicas:**
   - Filtra las cartas que tienen el campo `is_unique` como verdadero.

4. **Manejo de Errores:**
   - Definimos rutas para manejar errores 404 y 500, proporcionando mensajes adecuados.

5. **Búsqueda con múltiples filtros:**
   - Permite filtrar las cartas usando múltiples parámetros de consulta, como nombre, tipo y si es única.

6. **Obtener conteo de cartas por tipo:**
   - Usamos `aggregate` para contar el número de cartas por tipo y devolver el resultado.

Estas opciones te permiten manejar una amplia variedad de casos y te ayudarán a prepararte mejor para cualquier tipo de pregunta que pueda aparecer en tu examen.

Aquí tienes algunas opciones adicionales que podrían surgir en el examen. Estas incluyen rutas para buscar cartas por varios atributos, crear nuevos tipos de validaciones y manejo avanzado de errores.

### Buscar cartas por múltiples atributos
#### Buscar cartas por atributo `traits`
```javascript
// getCardsByTrait() - Obtener cartas por atributo de trait
router.get('/traits/:trait', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { traits: req.params.trait };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1, traits: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by trait');
  }
});
```

#### Buscar cartas por múltiples atributos
```javascript
// getCardsByAttributes() - Obtener cartas por múltiples atributos
router.get('/search/attributes', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { name, type, traits } = req.query;
  const query = {};

  if (name) query.name = new RegExp(name, 'i'); // Búsqueda con regex para coincidencias parciales
  if (type) query.type = type;
  if (traits) query.traits = { $all: traits.split(',') }; // Búsqueda con varios traits

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1, traits: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by attributes');
  }
});
```

### Validaciones adicionales
#### Validar que los traits no estén vacíos
```javascript
const { body, validationResult } = require('express-validator');

// addCard() with additional trait validation
router.post(
  '/',
  [
    body('_id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('type').isString().isIn(['hero', 'ally', 'event']),
    body('hand_size').optional().isInt({ min: 1 }),
    body('health').optional().isInt({ min: 0 }),
    body('thwart').optional().isInt({ min: 0 }),
    body('attack').optional().isInt({ min: 0 }),
    body('defense').optional().isInt({ min: 0 }),
    body('is_unique').optional().isBoolean(),
    body('traits').optional().isArray().custom(traits => {
      if (traits.length === 0) {
        throw new Error('Traits cannot be empty');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const dbConnect = dbo.getDb();
    try {
      const result = await dbConnect.collection(COLLECTION).insertOne(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send('Error inserting card');
    }
  }
);
```

### Manejo avanzado de errores
#### Error 422 para validaciones fallidas
```javascript
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  next(err);
});
```

#### Error 503 para fallos del servidor externos
```javascript
router.use((err, req, res, next) => {
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ message: 'External service unavailable' });
  }
  next(err);
});
```

### Paginación avanzada
#### Paginación con "skip" y "limit"
```javascript
router.get('/paginated', async (req, res) => {
  const dbConnect = dbo.getDb();
  let { page, limit } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || MAX_RESULTS;
  const skip = (page - 1) * limit;

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({})
      .project({ _id: 1, name: 1, type: 1 })
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await dbConnect.collection(COLLECTION).countDocuments();
    const pages = Math.ceil(total / limit);
    res.json({ results, total, pages }).status(200);
  } catch (err) {
    res.status(400).send('Error fetching paginated results');
  }
});
```

### Buscar cartas con puntuación mínima
```javascript
// getCardsWithMinimumStat() - Obtener cartas con puntuación mínima
router.get('/minstat/:stat/:value', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { stat, value } = req.params;
  const query = {};
  query[stat] = { $gte: parseInt(value) };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, [stat]: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards with minimum stat');
  }
});
```

### Buscar cartas por lista de IDs
```javascript
// getCardsByIds() - Obtener cartas por lista de IDs
router.get('/ids', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { ids } = req.query;
  const query = { _id: { $in: ids.split(',') } };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by IDs');
  }
});
```

### Búsqueda por texto completo
```javascript
// getCardsByFullTextSearch() - Obtener cartas por búsqueda de texto completo
router.get('/search/text', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { text } = req.query;
  const query = { $text: { $search: text } };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, text: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards by text');
  }
});
```

### Ruta para obtener cartas por el campo `is_unique`
```javascript
router.get('/unique', async (req, res) => {
  const dbConnect = dbo.getDb();
  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({ is_unique: true })
      .project({ _id: 1, name: 1, type: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error fetching unique cards');
  }
});
```

### Ruta para obtener cartas con `health` mayor que un valor dado
```javascript
router.get('/health/greater/:value', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { value } = req.params;
  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({ health: { $gt: parseInt(value) } })
      .project({ _id: 1, name: 1, health: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error fetching cards with health greater than value');
  }
});
```

### Ruta para obtener cartas con `attack` entre un rango de valores
```javascript
router.get('/attack/range', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { min, max } = req.query;
  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({ attack: { $gte: parseInt(min), $lte: parseInt(max) } })
      .project({ _id: 1, name: 1, attack: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error fetching cards with attack in range');
  }
});
```

### Ruta para obtener cartas con múltiples criterios combinados
```javascript
router.get('/search/multiple', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { name, type, minHealth, maxAttack } = req.query;
  const query = {};

  if (name) query.name = new RegExp(name, 'i');
  if (type) query.type = type;
  if (minHealth) query.health = { $gte: parseInt(minHealth) };
  if (maxAttack) query.attack = { $lte: parseInt(maxAttack) };

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ _id: 1, name: 1, type: 1, health: 1, attack: 1 })
      .toArray();
    res.json(results).status(200);
  } catch (err) {
    res.status(400).send('Error searching for cards with multiple criteria');
  }
});
```

Estas opciones adicionales deberían cubrir una amplia gama de posibilidades que podrían surgir en tu examen, permitiéndote estar preparado para cualquier tipo de pregunta relacionada con CRUD y consultas avanzadas en MongoDB.

Lamentablemente, no tengo acceso a información específica sobre el contenido exacto del examen, pero basándome en el esquema y los temas que hemos cubierto, puedo ofrecerte más posibles escenarios y consideraciones que podrían aparecer en el examen de recuperación de Sistemas Web 2. Aquí tienes más ejemplos y posibilidades que podrían surgir:

### Ejemplos Adicionales de Operaciones CRUD y Validaciones

#### Creación de una ruta para actualizar cartas
Podrían pedirte implementar una ruta para actualizar cartas en la colección. Aquí tienes un ejemplo:

```javascript
// updateCardById() - Actualizar carta por ID
router.put('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { _id: req.params.id };
  const update = { $set: req.body };

  try {
    const result = await dbConnect
      .collection(COLLECTION)
      .updateOne(query, update);
    if (result.matchedCount === 0) {
      return res.status(404).send('Card not found');
    }
    res.status(200).send(result);
  } catch (err) {
    res.status(400).send('Error updating card');
  }
});
```

### Validaciones en la creación y actualización de cartas
Podrían pedirte implementar validaciones adicionales al crear o actualizar cartas. Aquí tienes algunos ejemplos de validaciones con `express-validator`:

#### Validación avanzada al crear una carta
```javascript
const { body, validationResult } = require('express-validator');

// addCard() con validaciones avanzadas
router.post(
  '/',
  [
    body('_id').isString().notEmpty(),
    body('name').isString().notEmpty(),
    body('type').isString().isIn(['hero', 'ally', 'event']),
    body('hand_size').optional().isInt({ min: 1 }),
    body('health').optional().isInt({ min: 0 }),
    body('thwart').optional().isInt({ min: 0 }),
    body('attack').optional().isInt({ min: 0 }),
    body('defense').optional().isInt({ min: 0 }),
    body('is_unique').optional().isBoolean(),
    body('traits').optional().isArray().custom(traits => {
      if (traits.length === 0) {
        throw new Error('Traits cannot be empty');
      }
      return true;
    }),
    body('text').optional().isString().isLength({ max: 500 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const dbConnect = dbo.getDb();
    try {
      const result = await dbConnect.collection(COLLECTION).insertOne(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send('Error inserting card');
    }
  }
);
```

### Manejo avanzado de errores
Podrían pedirte que manejes distintos tipos de errores con códigos de estado específicos y mensajes claros. Aquí tienes un ejemplo:

```javascript
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ message: 'External service unavailable' });
  }
  next(err);
});
```

### Autenticación y Autorización
Aunque no es común en todos los exámenes, podrían incluir alguna sección sobre autenticación y autorización. Aquí tienes un ejemplo de cómo proteger una ruta con autenticación básica usando JWT:

#### Middleware de autenticación JWT
```javascript
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Forbidden');
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};
```

#### Uso del middleware de autenticación en una ruta
```javascript
// Ruta protegida por JWT
router.get('/protected', authenticateJWT, (req, res) => {
  res.send('This is a protected route');
});
```

### Manejo de relaciones entre documentos
Podrían pedirte manejar relaciones entre documentos, como agregar referencias de `deck` a `cards`:

#### Crear una relación entre `deck` y `cards`
```javascript
router.post('/deck', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { name, description, hero, cards } = req.body;

  // Verificar que el héroe sea de tipo 'hero'
  const heroCard = await dbConnect.collection('cards').findOne({ _id: hero, type: 'hero' });
  if (!heroCard) {
    return res.status(400).send('Invalid hero ID or type');
  }

  // Verificar que las otras cartas no sean de tipo 'hero'
  for (let cardId in cards) {
    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card || card.type === 'hero' || cards[cardId] > 3) {
      return res.status(400).send('Invalid card in deck or too many copies');
    }
  }

  // Crear el deck
  try {
    const result = await dbConnect.collection('decks').insertOne({ name, description, hero, cards });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send('Error creating deck');
  }
});
```

### Consultas avanzadas con agregaciones
Podrían pedirte realizar consultas avanzadas usando agregaciones. Aquí tienes un ejemplo para obtener estadísticas de las cartas:

#### Obtener estadísticas de las cartas
```javascript
router.get('/cards/stats', async (req, res) => {
  const dbConnect = dbo.getDb();
  try {
    const stats = await dbConnect.collection(COLLECTION).aggregate([
      {
        $group: {
          _id: "$type",
          totalCards: { $sum: 1 },
          averageHealth: { $avg: "$health" },
          maxAttack: { $max: "$attack" }
        }
      }
    ]).toArray();
    res.json(stats).status(200);
  } catch (err) {
    res.status(500).send('Error fetching card stats');
  }
});
```

### Paginación y filtrado combinados
Podrían pedirte implementar una combinación de paginación y filtrado en una sola ruta:

#### Paginación y filtrado combinados
```javascript
router.get('/cards/filter', async (req, res) => {
  const dbConnect = dbo.getDb();
  let { page, limit, type, minHealth } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  const query = {};

  if (type) query.type = type;
  if (minHealth) query.health = { $gte: parseInt(minHealth) };

  try {
    const results = await dbConnect.collection(COLLECTION)
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await dbConnect.collection(COLLECTION).countDocuments(query);
    res.json({ results, total, pages: Math.ceil(total / limit) }).status(200);
  } catch (err) {
    res.status(400).send('Error fetching filtered and paginated results');
  }
});
```

### Más ejemplos de validaciones con `express-validator`
Podrían pedirte más ejemplos de validaciones, aquí tienes algunos:

#### Validar formato de correo electrónico
```javascript
router.post(
  '/validate-email',
  [
    body('email').isEmail().withMessage('Must be a valid email address'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('Valid email');
  }
);
```

#### Validar fecha en formato específico
```javascript
router.post(
  '/validate-date',
  [
    body('date').isISO8601().withMessage('Must be a valid date in ISO8601 format'),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send('Valid date');
  }
);
```

### Otros posibles casos de uso
1. **Implementar Soft Delete**: Podrían pedirte implementar una eliminación lógica en lugar de una eliminación física.
2. **Upload de Archivos**: Podrían incluir el manejo de upload de archivos, por ejemplo, subir imágenes de cartas.
3. **WebSocket**: Aunque menos probable, podrían incluir algún ejemplo de uso de WebSocket para actualizaciones en tiempo real.
4. **Rate Limiting**: Implementar un sistema para limitar el número de solicitudes por usuario/IP.

5. Entiendo que puede ser muy frustrante enfrentarse a un examen difícil, especialmente si sientes que has estudiado y trabajado duro sin obtener los resultados deseados. Aquí tienes algunos consejos adicionales que podrían ayudarte a preparar mejor y afrontar el examen con mayor confianza:

### Estrategias de Estudio

1. **Revisar Exámenes Anteriores**: Si tienes acceso a exámenes anteriores, revisa las preguntas y trata de entender qué tipo de respuestas espera el profesor. Los patrones en las preguntas pueden ayudarte a anticipar el tipo de problemas que podrías encontrar.

2. **Practicar con Ejemplos Reales**: Crea ejemplos reales y prácticos basados en los temas que has visto en clase. Esto te ayudará a aplicar tus conocimientos en situaciones similares a las que podrías encontrar en el examen.

3. **Simular el Examen**: Intenta simular un entorno de examen en casa. Esto incluye cronometrarte y trabajar sin interrupciones. Esto te ayudará a acostumbrarte a la presión del tiempo y a gestionar mejor tu tiempo durante el examen.

4. **Estudiar en Grupo**: Si es posible, estudia con compañeros de clase. Pueden ayudarse mutuamente a comprender conceptos difíciles y a encontrar errores en el trabajo de cada uno.

### Ejemplos Adicionales

Aquí tienes algunos ejemplos adicionales basados en diferentes escenarios que podrían surgir en tu examen:

#### 1. Rutas CRUD Avanzadas con Validaciones
**Ejemplo: Crear una carta con validaciones avanzadas**
```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const { body, validationResult } = require('express-validator');
const ObjectId = require('mongodb').ObjectId;

const COLLECTION = 'cards';

router.post(
  '/',
  [
    body('_id').isString().notEmpty(),
    body('name').isString().notEmpty().isLength({ max: 100 }),
    body('type').isString().isIn(['hero', 'ally', 'event']),
    body('text').isString().isLength({ max: 500 }).optional(),
    body('hand_size').isInt({ min: 1 }).optional(),
    body('health').isInt({ min: 0 }).optional(),
    body('thwart').isInt({ min: 0 }).optional(),
    body('attack').isInt({ min: 0 }).optional(),
    body('defense').isInt({ min: 0 }).optional(),
    body('is_unique').isBoolean().optional(),
    body('traits').isArray().optional().custom((traits) => {
      if (traits.length === 0) {
        throw new Error('Traits cannot be empty');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dbConnect = dbo.getDb();
    try {
      const result = await dbConnect.collection(COLLECTION).insertOne(req.body);
      res.status(201).send(result);
    } catch (err) {
      res.status(500).send('Error inserting card');
    }
  }
);

module.exports = router;
```

#### 2. Paginación y Filtrado Avanzado
**Ejemplo: Filtrar cartas por tipo y paginación**
```javascript
router.get('/filter', async (req, res) => {
  const dbConnect = dbo.getDb();
  let { page, limit, type, minHealth } = req.query;
  page = parseInt(page) || 1;
  limit = parseInt(limit) || 10;
  const skip = (page - 1) * limit;
  const query = {};

  if (type) query.type = type;
  if (minHealth) query.health = { $gte: parseInt(minHealth) };

  try {
    const results = await dbConnect.collection(COLLECTION)
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await dbConnect.collection(COLLECTION).countDocuments(query);
    res.json({ results, total, pages: Math.ceil(total / limit) }).status(200);
  } catch (err) {
    res.status(400).send('Error fetching filtered and paginated results');
  }
});
```

#### 3. Relaciones entre Documentos
**Ejemplo: Crear una relación entre `deck` y `cards`**
```javascript
router.post('/deck', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { name, description, hero, cards } = req.body;

  // Verificar que el héroe sea de tipo 'hero'
  const heroCard = await dbConnect.collection('cards').findOne({ _id: hero, type: 'hero' });
  if (!heroCard) {
    return res.status(400).send('Invalid hero ID or type');
  }

  // Verificar que las otras cartas no sean de tipo 'hero'
  for (let cardId in cards) {
    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card || card.type === 'hero' || cards[cardId] > 3) {
      return res.status(400).send('Invalid card in deck or too many copies');
    }
  }

  // Crear el deck
  try {
    const result = await dbConnect.collection('decks').insertOne({ name, description, hero, cards });
    res.status(201).send(result);
  } catch (err) {
    res.status(500).send('Error creating deck');
  }
});
```

#### 4. Manejo de Errores Avanzado
**Ejemplo: Manejo avanzado de errores**
```javascript
router.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ message: 'External service unavailable' });
  }
  next(err);
});
```

#### 5. Autenticación y Autorización
**Ejemplo: Middleware de autenticación JWT**
```javascript
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).send('Forbidden');
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).send('Unauthorized');
  }
};
```

**Ejemplo: Uso del middleware de autenticación en una ruta**
```javascript
// Ruta protegida por JWT
router.get('/protected', authenticateJWT, (req, res) => {
  res.send('This is a protected route');
});
```

#### 6. Agregaciones Avanzadas
**Ejemplo: Obtener estadísticas de las cartas**
```javascript
router.get('/cards/stats', async (req, res) => {
  const dbConnect = dbo.getDb();
  try {
    const stats = await dbConnect.collection(COLLECTION).aggregate([
      {
        $group: {
          _id: "$type",
          totalCards: { $sum: 1 },
          averageHealth: { $avg: "$health" },
          maxAttack: { $max: "$attack" }
        }
      }
    ]).toArray();
    res.json(stats).status(200);
  } catch (err) {
    res.status(500).send('Error fetching card stats');
  }
});
```

### Consejos Adicionales

- **Toma un Descanso**: Asegúrate de descansar lo suficiente antes del examen. La fatiga puede afectar tu rendimiento.
- **Revisa tus Notas y Ejemplos**: Mantén tus notas y ejemplos organizados para una revisión rápida.
- **Preguntas de Clarificación**: Si algo no está claro durante el examen, no dudes en pedir aclaraciones al profesor.
- **Práctica con Simulaciones**: Realiza simulaciones de examen para acostumbrarte a la presión del tiempo y al formato de las preguntas.

Espero que estos ejemplos y consejos adicionales te ayuden a preparar tu examen de recuperación. ¡Buena suerte!

Con estos ejemplos adicionales, estarás bien preparado para enfrentar una variedad de preguntas y escenarios que podrían aparecer en tu examen. ¡Buena suerte!

Entiendo que te sientas frustrado, pero es importante mantener la integridad y la honestidad en tus estudios. Aquí tienes algunas recomendaciones y más ejemplos que podrían ayudarte a preparar mejor para tu examen:

### Posibles Ejemplos y Casos para la API REST

1. **Actualizar una Carta por ID**
   ```javascript
   // updateCardById()
   router.put('/:id', async (req, res) => {
     const dbConnect = dbo.getDb();
     const query = { _id: req.params.id };
     const update = {
       $set: req.body
     };
     let result = await dbConnect
       .collection(COLLECTION)
       .updateOne(query, update);
     if (result.matchedCount === 0) {
       res.status(404).send("Card not found");
     } else {
       res.status(200).send(result);
     }
   });
   ```

2. **Obtener Cartas por Nombre**
   ```javascript
   // getCardsByName()
   router.get('/name/:name', async (req, res) => {
     const dbConnect = dbo.getDb();
     let query = { name: { $regex: req.params.name, $options: 'i' } };
     let results = await dbConnect
       .collection(COLLECTION)
       .find(query)
       .toArray()
       .catch(err => res.status(400).send('Error searching for cards by name'));
     res.status(200).send(results);
   });
   ```

3. **Obtener Cartas por Rango de Salud**
   ```javascript
   // getCardsByHealthRange()
   router.get('/health/:min/:max', async (req, res) => {
     const dbConnect = dbo.getDb();
     let query = {
       health: { $gte: parseInt(req.params.min), $lte: parseInt(req.params.max) }
     };
     let results = await dbConnect
       .collection(COLLECTION)
       .find(query)
       .toArray()
       .catch(err => res.status(400).send('Error searching for cards by health range'));
     res.status(200).send(results);
   });
   ```

4. **Contar Cartas por Tipo**
   ```javascript
   // countCardsByType()
   router.get('/count/type/:type', async (req, res) => {
     const dbConnect = dbo.getDb();
     let query = { type: req.params.type };
     let count = await dbConnect
       .collection(COLLECTION)
       .countDocuments(query)
       .catch(err => res.status(400).send('Error counting cards by type'));
     res.status(200).send({ type: req.params.type, count });
   });
   ```

### Consideraciones Adicionales para el Examen
1. **Validaciones Complejas**
   - Validar que ciertos campos son únicos.
   - Verificar que las relaciones entre documentos son correctas (por ejemplo, que un `hero` en un `deck` existe y es del tipo correcto).

2. **Autenticación y Autorización**
   - Implementar autenticación JWT.
   - Proteger ciertas rutas para que solo usuarios autenticados puedan acceder.

3. **Manejo de Errores**
   - Establecer manejadores de errores globales.
   - Personalizar mensajes de error dependiendo del tipo de error (validación, autorización, etc.).

4. **Documentación de la API**
   - Asegurarte de que todas las rutas y modelos están correctamente documentados en tu especificación OpenAPI.
   - Incluir ejemplos de peticiones y respuestas en la documentación.

### Ejemplo de Especificación OpenAPI para Validación
```yaml
components:
  schemas:
    Card:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
          description: Card name
          maxLength: 100
          minLength: 1
        health:
          type: integer
          minimum: 0
        type:
          type: string
          enum: ["hero", "ally", "event"]
      required:
        - _id
        - name
        - type
paths:
  /cards:
    get:
      summary: Retrieve all cards
      responses:
        '200':
          description: A list of cards
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Card'
    post:
      summary: Add a new card
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Card'
      responses:
        '201':
          description: Card created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        '400':
          description: Invalid input
```

### Ejemplo de Implementación para Creación de Deck
```javascript
router.post('/deck', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { name, description, hero, cards } = req.body;
  
  if (!name || !description || !hero || !cards || Object.keys(cards).length < 5) {
    return res.status(400).send({ code: 2, message: "Invalid input" });
  }

  const heroCard = await dbConnect.collection('cards').findOne({ _id: hero, type: 'hero' });
  if (!heroCard) {
    return res.status(400).send({ code: 3, message: "Invalid hero ID" });
  }

  for (const [cardId, count] of Object.entries(cards)) {
    if (count < 1 || count > 3) {
      return res.status(400).send({ code: 4, message: "Invalid card count" });
    }
    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card || card.type === 'hero') {
      return res.status(400).send({ code: 5, message: "Invalid card in deck" });
    }
  }

  const deck = { name, description, hero, cards };
  await dbConnect.collection('decks').insertOne(deck);
  res.status(201).send(deck);
});
```

Recuerda siempre abordar tu examen con honestidad y esfuerzo. La práctica y la preparación son las claves para tener éxito. ¡Buena suerte!


No puedo ayudarte con la obtención no autorizada de acceso a sistemas o repositorios. Sin embargo, puedo ofrecerte una guía detallada para preparar tus exámenes basándome en el contenido que has compartido y en las prácticas habituales de desarrollo de APIs y bases de datos.

Aquí tienes un enfoque paso a paso para los temas que podrían surgir en tu examen de recuperación:

### 1. CRUD Operations en Node.js

#### 1.1. Estructura básica de un servidor Express con MongoDB

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);
const COLLECTION = 'cards';

// Obtener todas las cartas
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  let limit = req.query.limit ? Math.min(parseInt(req.query.limit), MAX_RESULTS) : MAX_RESULTS;
  let next = req.query.next;
  let query = next ? { _id: { $lt: next } } : {};
  let results = await dbConnect.collection(COLLECTION).find(query).limit(limit).toArray();
  next = results.length === limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200);
});

// Obtener carta por ID
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: req.params.id };
  let result = await dbConnect.collection(COLLECTION).findOne(query);
  result ? res.status(200).send(result) : res.status(404).send("Not found");
});

// Agregar nueva carta
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  let result = await dbConnect.collection(COLLECTION).insertOne(req.body);
  res.status(201).send(result);
});

// Eliminar carta por ID
router.delete('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: req.params.id };
  let result = await dbConnect.collection(COLLECTION).deleteOne(query);
  res.status(200).send(result);
});

module.exports = router;
```

#### 1.2. Filtrar cartas por tipo

```javascript
// Filtrar cartas por tipo
router.get('/type/:type', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { type: req.params.type };
  let results = await dbConnect.collection(COLLECTION).find(query).toArray();
  res.json(results).status(200);
});
```

### 2. Paginación

#### 2.1. Implementar paginación

```javascript
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  let limit = req.query.limit ? Math.min(parseInt(req.query.limit), MAX_RESULTS) : MAX_RESULTS;
  let next = req.query.next;
  let query = next ? { _id: { $lt: next } } : {};
  let results = await dbConnect.collection(COLLECTION).find(query).limit(limit).toArray();
  next = results.length === limit ? results[results.length - 1]._id : null;
  res.json({ results, next }).status(200);
});
```

### 3. Validaciones en el servidor

#### 3.1. Validación de entradas

```javascript
// Agregar nueva carta con validación
router.post('/', async (req, res) => {
  const { _id, name, type, text, hand_size, health, thwart, attack, defense, is_unique, traits } = req.body;

  if (!_id || !name || !type || !text) {
    return res.status(400).send({ code: 1, message: "Invalid input" });
  }

  const dbConnect = dbo.getDb();
  let result = await dbConnect.collection(COLLECTION).insertOne(req.body);
  res.status(201).send(result);
});
```

### 4. Errores personalizados

#### 4.1. Manejo de errores en respuestas

```javascript
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: req.params.id };
  let result = await dbConnect.collection(COLLECTION).findOne(query);
  if (!result) {
    res.status(404).send({ code: 4, message: "Card not found" });
  } else {
    res.status(200).send(result);
  }
});
```

### 5. OpenAPI Specification

#### 5.1. Especificación básica para la API de cartas

```yaml
openapi: 3.0.3
info:
  description: >-
    My Card Game documentation.
    This API allows users to manage cards and decks for a superhero card game.
  version: 1.0.0
  title: Card Game
tags:
  - name: card
    description: Everything about the Card Game
  - name: deck
    description: Everything about Decks
paths:
  /cards:
    get:
      summary: GET all cards
      description: Retrieve all cards in the game with optional pagination.
      parameters:
        - name: limit
          in: query
          description: Number of cards to return
          required: false
          schema:
            type: integer
            minimum: 1
            example: 10
        - name: offset
          in: query
          description: Offset for pagination
          required: false
          schema:
            type: integer
            minimum: 0
            example: 0
      responses:
        "200":
          description: "OK"
          content:
            application/json:
              schema: 
                $ref: '#/components/schemas/Cards'
  /cards/type/{type}:
    get:
      summary: Filter cards by type
      description: Returns cards filtered by their type.
      parameters:
        - name: type
          in: path
          description: Type of card to filter by
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cards'
        '400':
          description: Invalid type supplied
components:
  schemas:
    Cards:
      type: object
      properties:
        results:
          type: array
          items:
            $ref: '#/components/schemas/Card'
        next:
          type: string
          description: Next ID for pagination
      required:
        - results
    Card:
      type: object
      properties:
        _id:
          type: string
          description: Unique ID for the card
        name:
          type: string
          description: Name of the card
        type:
          type: string
          description: Type of the card
        text:
          type: string
          description: Description of the card
        hand_size:
          type: integer
          description: Hand size of the card
        health:
          type: integer
          description: Health points of the card
        thwart:
          type: integer
          description: Thwart points of the card
        attack:
          type: integer
          description: Attack points of the card
        defense:
          type: integer
          description: Defense points of the card
        is_unique:
          type: boolean
          description: Whether the card is unique
        traits:
          type: array
          items:
            type: string
          description: Traits of the card
      required:
        - _id
        - name
        - type
        - text
```

### Conclusión

La clave para tu examen será comprender cómo construir y manipular una API RESTful usando Express.js y MongoDB. Familiarízate con los conceptos de CRUD, validaciones, manejo de errores, paginación y especificación OpenAPI. Practica la implementación de estos conceptos en proyectos pequeños para consolidar tus conocimientos y estar preparado para cualquier pregunta que pueda surgir en el examen.

Lamento mucho que te sientas así. Mi objetivo es ayudarte lo mejor posible dentro de los límites éticos y legales. Puedo ofrecerte algunos consejos adicionales para prepararte mejor:

### Consejos Adicionales para Prepararte para el Examen

1. **Revisa Ejemplos Anteriores**:
   - Revisa ejemplos de exámenes pasados si están disponibles.
   - Practica resolviendo problemas similares a los que has encontrado en el examen ordinario.

2. **Práctica, Práctica y Más Práctica**:
   - Desarrolla pequeños proyectos que incluyan CRUD, validaciones y paginación.
   - Utiliza herramientas como Postman para probar tu API y asegurarte de que funciona correctamente.

3. **Domina la Especificación OpenAPI**:
   - Asegúrate de entender cómo escribir y leer especificaciones OpenAPI.
   - Practica modificando especificaciones existentes para que coincidan con los requisitos de diferentes problemas.

4. **Refuerza tus Conocimientos en MongoDB**:
   - Practica consultas avanzadas y operaciones de agregación.
   - Asegúrate de comprender cómo utilizar operadores de consulta y agregación en MongoDB.

5. **Entiende el Manejo de Errores**:
   - Asegúrate de que sabes cómo manejar errores en tu API y devolver mensajes de error adecuados.
   - Practica la creación de middleware de manejo de errores en Express.js.

### Ejemplo Completo para CRUD y Paginación en Express.js

Aquí tienes un ejemplo completo de cómo podrías estructurar un archivo `cards.js` para manejar CRUD y paginación:

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = 10;
const COLLECTION = 'cards';

// Obtener todas las cartas con paginación
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  let limit = req.query.limit ? Math.min(parseInt(req.query.limit), MAX_RESULTS) : MAX_RESULTS;
  let next = req.query.next;
  let query = next ? { _id: { $lt: new ObjectId(next) } } : {};

  try {
    let results = await dbConnect.collection(COLLECTION).find(query).limit(limit).toArray();
    next = results.length === limit ? results[results.length - 1]._id : null;
    res.status(200).json({ results, next });
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching cards" });
  }
});

// Obtener carta por ID
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(req.params.id) };

  try {
    let result = await dbConnect.collection(COLLECTION).findOne(query);
    if (!result) {
      res.status(404).json({ code: 4, message: "Card not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching card by ID" });
  }
});

// Agregar nueva carta
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const { _id, name, type, text, hand_size, health, thwart, attack, defense, is_unique, traits } = req.body;

  if (!_id || !name || !type || !text) {
    return res.status(400).json({ code: 1, message: "Invalid input" });
  }

  try {
    let result = await dbConnect.collection(COLLECTION).insertOne(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error adding card" });
  }
});

// Eliminar carta por ID
router.delete('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(req.params.id) };

  try {
    let result = await dbConnect.collection(COLLECTION).deleteOne(query);
    if (result.deletedCount === 0) {
      res.status(404).json({ code: 4, message: "Card not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error deleting card" });
  }
});

// Filtrar cartas por tipo
router.get('/type/:type', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { type: req.params.type };

  try {
    let results = await dbConnect.collection(COLLECTION).find(query).toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching cards by type" });
  }
});

module.exports = router;
```

### Preparación Adicional

1. **Estudia Casos de Uso Reales**:
   - Practica con casos de uso reales, como la creación de endpoints adicionales, validaciones complejas y manejo de errores personalizados.

2. **Simula el Examen**:
   - Intenta resolver problemas sin mirar las respuestas para simular el entorno del examen.
   - Cronometra tus respuestas para mejorar tu gestión del tiempo.

3. **Participa en Foros y Grupos de Estudio**:
   - Únete a foros y grupos de estudio para discutir problemas y soluciones con tus compañeros.

4. **Mantén la Calma y Confía en Ti Mismo**:
   - La práctica constante y la preparación te ayudarán a ganar confianza.
   - Mantén una actitud positiva y trata de relajarte antes del examen.

Espero que estos consejos y ejemplos te ayuden a sentirte más preparado para tu examen. ¡Buena suerte!a

Lamento mucho que te sientas frustrado. Mi objetivo es proporcionarte la mejor ayuda posible dentro de los límites éticos y legales. Puedo ofrecerte más ejemplos y posibles preguntas basadas en lo que hemos discutido y en el formato de los exámenes anteriores.

### Ejemplo Adicional Basado en el Formato del Examen

#### CRUD Operaciones para "Cards" y "Decks"

Este ejemplo es una ampliación de lo que hemos discutido anteriormente y se enfoca en las operaciones CRUD y la validación adicional que podrías necesitar para tu examen.

### Archivo `cards.js`

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const COLLECTION = 'cards';

// Obtener todas las cartas
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching cards" });
  }
});

// Obtener carta por ID
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await dbConnect.collection(COLLECTION).findOne(query);
    if (!result) {
      res.status(404).json({ code: 4, message: "Card not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching card by ID" });
  }
});

// Agregar nueva carta
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const card = req.body;

  if (!card._id || !card.name || !card.type || !card.text) {
    return res.status(400).json({ code: 1, message: "Invalid input" });
  }

  try {
    const result = await dbConnect.collection(COLLECTION).insertOne(card);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error adding card" });
  }
});

// Eliminar carta por ID
router.delete('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await dbConnect.collection(COLLECTION).deleteOne(query);
    if (result.deletedCount === 0) {
      res.status(404).json({ code: 4, message: "Card not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error deleting card" });
  }
});

// Filtrar cartas por tipo
router.get('/type/:type', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { type: req.params.type };

  try {
    const results = await dbConnect.collection(COLLECTION).find(query).toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching cards by type" });
  }
});

module.exports = router;
```

### Archivo `decks.js`

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const COLLECTION = 'decks';

// Obtener todos los mazos
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching decks" });
  }
});

// Obtener mazo por ID
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await dbConnect.collection(COLLECTION).findOne(query);
    if (!result) {
      res.status(404).json({ code: 4, message: "Deck not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching deck by ID" });
  }
});

// Agregar nuevo mazo
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const deck = req.body;

  if (!deck.name || !deck.description || !deck.hero || !deck.cards) {
    return res.status(400).json({ code: 1, message: "Invalid input" });
  }

  try {
    const result = await dbConnect.collection(COLLECTION).insertOne(deck);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error adding deck" });
  }
});

// Eliminar mazo por ID
router.delete('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  const query = { _id: new ObjectId(req.params.id) };

  try {
    const result = await dbConnect.collection(COLLECTION).deleteOne(query);
    if (result.deletedCount === 0) {
      res.status(404).json({ code: 4, message: "Deck not found" });
    } else {
      res.status(200).json(result);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error deleting deck" });
  }
});

module.exports = router;
```

### Validaciones Adicionales

Para asegurar que los datos cumplan con ciertos requisitos antes de insertarlos o actualizarlos, puedes agregar validaciones en los controladores. Aquí tienes un ejemplo de cómo podrías validar un mazo antes de insertarlo:

```javascript
// Validar mazo antes de insertarlo
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const deck = req.body;

  if (!deck.name || !deck.description || !deck.hero || !deck.cards) {
    return res.status(400).json({ code: 1, message: "Invalid input" });
  }

  // Validar que hero sea una carta de tipo 'hero'
  const heroCard = await dbConnect.collection('cards').findOne({ _id: deck.hero, type: 'hero' });
  if (!heroCard) {
    return res.status(400).json({ code: 1, message: "Invalid hero card" });
  }

  // Validar que ninguna carta en cards sea de tipo 'hero' y que no haya más de 3 copias de una misma carta
  for (const [cardId, count] of Object.entries(deck.cards)) {
    if (count > 3) {
      return res.status(400).json({ code: 1, message: `Too many copies of card ${cardId}` });
    }
    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card || card.type === 'hero') {
      return res.status(400).json({ code: 1, message: `Invalid card ${cardId} in deck` });
    }
  }

  try {
    const result = await dbConnect.collection(COLLECTION).insertOne(deck);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error adding deck" });
  }
});
```

### Consejos para el Examen

1. **Revisa Exámenes Pasados**: Si tienes acceso a exámenes anteriores, estúdialos para identificar patrones en las preguntas.
2. **Practica**: Realiza ejercicios prácticos similares a los que podrías encontrar en el examen.
3. **Comprende las Validaciones**: Asegúrate de entender cómo funcionan las validaciones y cómo aplicarlas.
4. **Simula el Examen**: Realiza simulaciones del examen para familiarizarte con el formato y el tiempo.
5. **Consulta la Documentación**: Revisa la documentación oficial de las herramientas y tecnologías que estás utilizando.

Espero que esto te sea útil y te ayude a prepararte mejor para tu examen. ¡Buena suerte!

Entiendo tu frustración y lamento que te sientas así. Sin embargo, no tengo la capacidad de acceder a información confidencial sobre exámenes o cualquier otro contenido protegido sin autorización. Mi propósito es ayudarte de manera ética y dentro de las reglas y regulaciones.

Dicho esto, puedo ofrecerte ejemplos adicionales y consejos sobre cómo abordar posibles preguntas basadas en el formato que hemos discutido. Aquí tienes más ejemplos que podrían ayudarte a estar mejor preparado para tu examen.

### Más Ejemplos de Operaciones CRUD y Validaciones en una API REST

#### Filtrar Cartas por Nombre con Validación

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const COLLECTION = 'cards';

// Filtrar cartas por nombre
router.get('/name/:name', async (req, res) => {
  const dbConnect = dbo.getDb();
  const name = req.params.name;

  try {
    const results = await dbConnect.collection(COLLECTION).find({ name: { $regex: new RegExp(name, 'i') } }).toArray();
    if (results.length === 0) {
      res.status(404).json({ code: 4, message: "No cards found with that name" });
    } else {
      res.status(200).json(results);
    }
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching cards by name" });
  }
});

module.exports = router;
```

### Rutas de la API con Paginación

#### Obtener Cartas con Paginación

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const COLLECTION = 'cards';

// Obtener todas las cartas con paginación
router.get('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const skip = (page - 1) * limit;

  try {
    const results = await dbConnect
      .collection(COLLECTION)
      .find({})
      .skip(skip)
      .limit(limit)
      .toArray();
    const total = await dbConnect.collection(COLLECTION).countDocuments();
    res.status(200).json({
      results,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error fetching cards with pagination" });
  }
});

module.exports = router;
```

### Operaciones Avanzadas con Validaciones

#### Crear un Deck con Validaciones Complejas

```javascript
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const COLLECTION = 'decks';

// Agregar nuevo mazo con validaciones
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const deck = req.body;

  if (!deck.name || !deck.description || !deck.hero || !deck.cards) {
    return res.status(400).json({ code: 1, message: "Invalid input" });
  }

  // Validar que hero sea una carta de tipo 'hero'
  const heroCard = await dbConnect.collection('cards').findOne({ _id: deck.hero, type: 'hero' });
  if (!heroCard) {
    return res.status(400).json({ code: 1, message: "Invalid hero card" });
  }

  // Validar que ninguna carta en cards sea de tipo 'hero' y que no haya más de 3 copias de una misma carta
  for (const [cardId, count] of Object.entries(deck.cards)) {
    if (count > 3) {
      return res.status(400).json({ code: 1, message: `Too many copies of card ${cardId}` });
    }
    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card || card.type === 'hero') {
      return res.status(400).json({ code: 1, message: `Invalid card ${cardId} in deck` });
    }
  }

  try {
    const result = await dbConnect.collection(COLLECTION).insertOne(deck);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ code: 5, message: "Error adding deck" });
  }
});

module.exports = router;
```

### Consejos Adicionales para el Examen

1. **Validaciones de Entrada**: Asegúrate de realizar validaciones adecuadas en todas las rutas para prevenir la inserción de datos inválidos.
2. **Manejo de Errores**: Implementa un manejo de errores robusto para proporcionar mensajes claros y útiles a los usuarios de la API.
3. **Documentación**: Utiliza herramientas como Swagger para documentar tu API y facilitar la comprensión de cómo usarla.
4. **Optimización de Consultas**: Asegúrate de que las consultas a la base de datos estén optimizadas, especialmente cuando trabajes con grandes volúmenes de datos.
5. **Pruebas**: Realiza pruebas exhaustivas de tu API utilizando herramientas como Postman para asegurarte de que todas las rutas y funcionalidades están funcionando correctamente.

Estos ejemplos y consejos adicionales deberían ayudarte a prepararte mejor para tu examen. ¡Buena suerte!

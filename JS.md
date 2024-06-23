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

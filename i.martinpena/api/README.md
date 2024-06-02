# Guía de Referencia para el Examen

## Introducción
Esta guía te ayudará a navegar y comprender la API REST de cine creada durante las clases, basada en el archivo OpenAPI.

## Estructura del Proyecto
```plaintext
.
├── README.md
├── app.js
├── bin/
│   └── www
├── db/
│   └── conn.js
├── package.json
├── public/
│   └── stylesheets/
│       └── style.css
├── routes/
│   ├── index.js
│   ├── peliculas.js
│   └── users.js
├── schema/
│   └── cine.schema.yaml
├── tests/
│   └── app.test.js
└── views/
    ├── error.ejs
    └── index.ejs
```

## Tareas Pendientes (TO DO)
- **Añadir sesiones**: Implementar gestión de sesiones para mantener el estado del usuario.
- **Configurar el resto de rutas de la API**: Completar las rutas para todas las operaciones necesarias.
- **Inicializar la base de datos**: Población inicial con datos de películas.
- **Integrar con una API externa**: Conectar la API con una fuente externa para obtener más datos.
- **Limitar operaciones críticas**: Restringir acciones como el borrado a usuarios con permisos especiales.

## Rutas y Operaciones Principales
### Obtener Todas las Películas
```javascript
router.get('/', async (req, res) => {
  // Implementación para obtener todas las películas
});
```

### Obtener Película por ID
```javascript
router.get('/:id', async (req, res) => {
  // Implementación para obtener una película por ID
});
```

### Añadir Nueva Película
```javascript
router.post('/', async (req, res) => {
  // Implementación para añadir una nueva película
});
```

### Eliminar Película por ID
```javascript
router.delete('/:id', async (req, res) => {
  // Implementación para eliminar una película por ID
});
```

## Inicialización de la Base de Datos
Para inicializar la base de datos con algunas películas, puedes utilizar un script de importación:
```bash
mongoimport --db cine --collection peliculas --file peliculas.json --jsonArray
```

## Ejemplo de Consulta con Paginación
```javascript
router.get('/', async (req, res) => {
  let limit = 10; // Número de resultados por página
  let query = {}; // Condiciones de búsqueda
  let results = await dbConnect.collection('peliculas').find(query).limit(limit).toArray();
  res.json(results);
});
```

## Implementación de HATEOAS
Añadir enlaces en las respuestas para permitir la navegación a recursos relacionados:
```javascript
results.forEach(pelicula => {
  pelicula["link"] = `http://localhost:${process.env.PORT}${process.env.BASE_URI}/peliculas/${pelicula._id}`;
});
```

## Respuestas a Operaciones Críticas
Limitar operaciones como el borrado a usuarios con permisos:
```javascript
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  // Implementación para eliminar una película
});
```



# Guía de Referencia para el Examen

## Introducción
Esta guía te ayudará a navegar y comprender la API REST de cine creada durante las clases, basada en el archivo OpenAPI.

## Estructura del Proyecto
```plaintext
.
├── README.md
├── app.js
├── bin/
│   └── www
├── db/
│   └── conn.js
├── package.json
├── public/
│   └── stylesheets/
│       └── style.css
├── routes/
│   ├── index.js
│   ├── peliculas.js
│   └── users.js
├── schema/
│   └── cine.schema.yaml
├── tests/
│   └── app.test.js
└── views/
    ├── error.ejs
    └── index.ejs
```

## Tareas Pendientes (TO DO)
- **Añadir sesiones**: Implementar gestión de sesiones para mantener el estado del usuario.
- **Configurar el resto de rutas de la API**: Completar las rutas para todas las operaciones necesarias.
- **Inicializar la base de datos**: Población inicial con datos de películas.
- **Integrar con una API externa**: Conectar la API con una fuente externa para obtener más datos.
- **Limitar operaciones críticas**: Restringir acciones como el borrado a usuarios con permisos especiales.

## Rutas y Operaciones Principales
### Obtener Todas las Películas
```javascript
router.get('/', async (req, res) => {
  // Implementación para obtener todas las películas
});
```

### Obtener Película por ID
```javascript
router.get('/:id', async (req, res) => {
  // Implementación para obtener una película por ID
});
```

### Añadir Nueva Película
```javascript
router.post('/', async (req, res) => {
  // Implementación para añadir una nueva película
});
```

### Eliminar Película por ID
```javascript
router.delete('/:id', async (req, res) => {
  // Implementación para eliminar una película por ID
});
```

## Inicialización de la Base de Datos
Para inicializar la base de datos con algunas películas, puedes utilizar un script de importación:
```bash
mongoimport --db cine --collection peliculas --file peliculas.json --jsonArray
```

## Ejemplo de Consulta con Paginación
```javascript
router.get('/', async (req, res) => {
  let limit = 10; // Número de resultados por página
  let query = {}; // Condiciones de búsqueda
  let results = await dbConnect.collection('peliculas').find(query).limit(limit).toArray();
  res.json(results);
});
```

## Implementación de HATEOAS
Añadir enlaces en las respuestas para permitir la navegación a recursos relacionados:
```javascript
results.forEach(pelicula => {
  pelicula["link"] = `http://localhost:${process.env.PORT}${process.env.BASE_URI}/peliculas/${pelicula._id}`;
});
```

## Respuestas a Operaciones Críticas
Limitar operaciones como el borrado a usuarios con permisos:
```javascript
router.delete('/:id', authenticateUser, authorizeAdmin, async (req, res) => {
  // Implementación para eliminar una película
});
```


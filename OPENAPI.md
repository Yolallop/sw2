Para abordar el examen sobre OpenAPI de manera exitosa, es esencial que comprendas todos los componentes y funcionalidades de la especificación. A continuación, te proporcionaré una guía detallada y específica sobre todo lo que necesitas saber.

### Introducción a OpenAPI

**OpenAPI** es una especificación que define una forma estándar de describir APIs RESTful. Es una herramienta crucial para diseñar, construir, documentar y consumir APIs.

### Estructura de un Documento OpenAPI

#### 1. Encabezado Principal

- **openapi**: Define la versión de OpenAPI que se está utilizando.
  ```yaml
  openapi: 3.0.3
  ```

- **info**: Contiene información sobre la API.
  - **title**: El título de la API.
  - **description**: Una breve descripción de lo que hace la API.
  - **version**: La versión de la API.
  ```yaml
  info:
    title: Card Game
    description: My Card Game documentation
    version: 1.0.0
  ```

#### 2. Tags

- **tags**: Permite agrupar operaciones relacionadas bajo un mismo nombre.
  ```yaml
  tags:
    - name: card
      description: Everything about the Card Game
  ```

#### 3. Paths

- **paths**: Define las rutas de la API y los métodos HTTP que se pueden usar en cada una.
  - Cada ruta puede tener varias operaciones como `get`, `post`, `put`, y `delete`.
  
  ```yaml
  paths:
    /card:
      get:
        summary: GET all cards
        description: GET all cards
        responses:
          "200":
            description: "OK"
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Cards'
  ```

#### 4. Components

- **components**: Define componentes reutilizables como esquemas, parámetros, respuestas y más. Es útil para mantener el archivo limpio y DRY (Don't Repeat Yourself).

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
          text:
            type: string
          hand_size:
            type: integer
          health:
            type: integer
          thwart:
            type: integer
          attack:
            type: integer
          defense:
            type: integer
          is_unique:
            type: boolean
          traits:
            type: array
            items:
              type: string
          type:
            type: string
            enum: ["hero", "ally", "event"]
        required:
          - _id
          - name
          - type
          - text
          - is_unique
          - traits
      HeroCard:
        allOf:
          - $ref: '#/components/schemas/Card'
          - type: object
            required: [hand_size, health, thwart, attack, defense]
            properties:
              hand_size:
                type: integer
              health:
                type: integer
              thwart:
                type: integer
              attack:
                type: integer
              defense:
                type: integer
      AllyCard:
        allOf:
          - $ref: '#/components/schemas/Card'
          - type: object
            required: [cost, health, attack]
            properties:
              cost:
                type: integer
              health:
                type: integer
              attack:
                type: integer
      EventCard:
        allOf:
          - $ref: '#/components/schemas/Card'
          - type: object
            required: [cost]
            properties:
              cost:
                type: integer
    parameters:
      ID:
        description: Card ID
        name: cardId
        in: path
        required: true
        schema:
          type: string
    responses:
      ErrorResponse:
        description: Error response
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Error'
    schemas:
      Error:
        type: object
        properties:
          code:
            type: integer
          message:
            type: string
        required:
          - code
          - message
  ```

### Operaciones CRUD en la API

#### 1. Listar Recursos (GET)
- Obtiene una lista de todos los recursos. Puede incluir parámetros para paginación, filtrado y ordenación.
  ```yaml
  paths:
    /card:
      get:
        summary: List all cards
        responses:
          '200':
            description: A list of cards
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Cards'
  ```

#### 2. Consultar un Recurso (GET)
- Obtiene un recurso específico mediante un ID.
  ```yaml
  paths:
    /card/{cardId}:
      get:
        summary: Find card by ID
        parameters:
          - name: cardId
            in: path
            required: true
            schema:
              type: string
        responses:
          '200':
            description: A single card
            content:
              application/json:
                schema:
                  $ref: '#/components/schemas/Card'
          '400':
            $ref: '#/components/responses/ErrorResponse'
          '404':
            description: Card not found
  ```

#### 3. Añadir un Nuevo Recurso (POST)
- Crea un nuevo recurso.
  ```yaml
  paths:
    /card:
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
          '400':
            $ref: '#/components/responses/ErrorResponse'
  ```

#### 4. Modificar un Recurso (PUT)
- Actualiza un recurso existente.
  ```yaml
  paths:
    /card/{cardId}:
      put:
        summary: Update an existing card
        parameters:
          - name: cardId
            in: path
            required: true
            schema:
              type: string
        requestBody:
          required: true
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        responses:
          '200':
            description: Card updated
          '400':
            $ref: '#/components/responses/ErrorResponse'
          '404':
            description: Card not found
  ```

#### 5. Eliminar un Recurso (DELETE)
- Elimina un recurso existente.
  ```yaml
  paths:
    /card/{cardId}:
      delete:
        summary: Delete a card
        parameters:
          - name: cardId
            in: path
            required: true
            schema:
              type: string
        responses:
          '200':
            description: Card deleted
          '404':
            description: Card not found
  ```

### Mensajes de Error

Es fundamental definir mensajes de error predefinidos que la API puede devolver en formato JSON. Estos mensajes ayudan a los consumidores de la API a entender qué salió mal.

```yaml
components:
  schemas:
    Error:
      type: object
      properties:
        code:
          type: integer
        message:
          type: string
      required:
        - code
        - message
```

### Ejemplos Adicionales

#### Consultando los Géneros de Películas
  ```yaml
  paths:
    /movies/genres:
      get:
        summary: Get all genres
        responses:
          '200':
            description: A list of genres
            content:
              application/json:
                schema:
                  type: array
                  items:
                    type: string
  ```

#### Contando Películas entre Dos Años
  ```yaml
  paths:
    /movies/count:
      get:
        summary: Count movies between years
        parameters:
          - name: startYear
            in: query
            required: true
            schema:
              type: integer
          - name: endYear
            in: query
            required: true
            schema:
              type: integer
        responses:
          '200':
            description: Number of movies
            content:
              application/json:
                schema:
                  type: object
                  properties:
                    count:
                      type: integer
  ```

### Validación

Es esencial que los esquemas de datos definan claramente los tipos de datos y las restricciones para validar la entrada y salida de datos. Esto asegura que solo se acepten datos correctos y completos.

### Práctica y Revisión

Usa herramientas como **Swagger Editor** para validar tu archivo OpenAPI y asegurarte de que esté correctamente estructurado y sin errores. Asegúrate de que cada ruta, método y esquema esté bien definido y probado.

### Consejos Finales

1. **Revisión Continua**: Siempre revisa tu archivo OpenAPI para asegurarte de que no haya errores sintácticos ni estructurales.
2. **Uso de Ejemplos**: Proporciona ejemplos de solicitudes y respuestas para ayudar a los desarrolladores a entender cómo interactuar con tu API.
3. **Documentación Clara**: Asegúrate de que la documentación sea clara y fácil de entender. Incluye descripciones detalladas para cada endpoint, parámetro y respuesta.

Este resumen te proporciona una guía completa sobre cómo estructurar y definir tu API usando OpenAPI. Revísalo cuidadosamente y practica en el **Swagger Editor** para estar bien preparado para tu examen. ¡Buena suerte!

## OPENAPI
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
  /card:
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
    post:
      tags:
        - card
      summary: Add a new card to the game
      description: Add a new card to the game
      operationId: addCard
      requestBody:
        description: Card object that needs to be added to the game
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Card'
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        '405':
          description: Invalid input
  /card/{cardId}:
    parameters:
      - $ref: '#/components/parameters/ID'
    get:
      tags:
        - card
      summary: Find card by ID
      description: Returns a single card by ID.
      operationId: getCardById
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        '400':
          $ref: '#/components/responses/BadRequest'
        '404':
          $ref: '#/components/responses/NotFound'
    delete:
      tags:
        - card
      summary: Deletes a card
      description: Deletes a card by ID.
      operationId: deleteCard
      responses:
        '200':
          description: Successful operation
        '400':
          $ref: '#/components/responses/BadRequest'
  /card/{cardId}/type:
    parameters:
      - $ref: '#/components/parameters/ID'
    get:
      tags:
        - card
      summary: Filter cards by type
      description: Returns cards filtered by their type.
      operationId: filterCardsByType
      parameters:
        - name: type
          in: query
          description: Type of card to filter by
          required: true
          schema:
            $ref: '#/components/schemas/Type'
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Cards'
        '400':
          $ref: '#/components/responses/BadRequest'
  /deck:
    post:
      tags:
        - deck
      summary: Create a new deck
      description: Create a new deck of cards.
      operationId: createDeck
      requestBody:
        description: Deck object that needs to be added to the game
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Deck'
      responses:
        '201':
          description: Deck created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Deck'
        '400':
          $ref: '#/components/responses/BadRequest'
components:
  parameters:
    ID:
      description: Card ID
      name: cardId
      in: path
      required: true
      schema:
        $ref: '#/components/schemas/ID'
  schemas:
    Cards:
      type: object
      properties:
        results:
          $ref: '#/components/schemas/CardsArray'
        next:
          type: string
          description: Card next ID for pagination search
      required:
        - results
        - next
    CardsArray:
      type: array
      items:
        $ref: '#/components/schemas/CardMin'
    CardMin:
      type: object
      properties:
        _id:
          $ref: '#/components/schemas/ID'
        name:
          type: string
          description: Card name
        type:
          $ref: '#/components/schemas/Type'
      required:
        - _id
        - name
        - type
    Card:
      type: object
      properties:
        _id:
          $ref: '#/components/schemas/ID'
        name:
          type: string
          description: Card name
          maxLength: 100 # Maximum length for name
          minLength: 1   # Minimum length for name
        text:
          type: string
          description: Card description
          maxLength: 500 # Maximum length for text
        hand_size:
          type: integer
          description: Size of the hand
          minimum: 1   # Minimum value for hand_size
        health:
          type: integer
          description: Health points
          minimum: 0   # Minimum value for health
        thwart:
          type: integer
          description: Thwart points
          minimum: 0   # Minimum value for thwart
        attack:
          type: integer
          description: Attack points
          minimum: 0   # Minimum value for attack
        defense:
          type: integer
          description: Defense points
          minimum: 0   # Minimum value for defense
        is_unique:
          type: boolean
          description: Whether the card is unique
        traits:
          type: array
          items:
            type: string
          description: List of traits
        type:
          $ref: '#/components/schemas/Type'
      required:
        - _id
        - name
        - text
        - hand_size
        - health
        - type
    Deck:
      type: object
      properties:
        name:
          type: string
          description: Deck name
          maxLength: 50  # Maximum length for name
          minLength: 1   # Minimum length for name
        description:
          type: string
          description: Deck description
          maxLength: 200 # Maximum length for description
        hero:
          $ref: '#/components/schemas/ID'
          description: Hero card ID
        cards:
          type: object
          description: Cards in the deck
          additionalProperties:
            type: integer
            minimum: 1
            maximum: 3
      required:
        - name
        - description
        - hero
        - cards
    Type:
      type: string
      enum: ["hero", "ally", "event"]
      description: Card type
    ID:
      type: string
      description: Card ID obtained from the database
      example: 01001
    Error:
      type: object
      properties: 
        code:
          type: integer
          enum:
            - 1
            - 2
            - 3
            - 4
            - 5
            - 6
            - 7
            - 8
        message:
          type: string
          enum:
            - Invalid ID
            - Invalid input
            - Invalid ID supplied
            - Card not found
            - Invalid card ID
            - Invalid request
            - Not found
            - Bad Request
          required:
           - code
           - message

  responses:
    BadRequest:
      description: Bad Request
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          examples:
            BardRequest:
              value:
                code: 8
                message: Bad Request

    NotFound:
      description: Not Found
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
          examples:
            NotFound:
              value:
                code: 7
                message: Not Found
servers:
  - url: http://localhost:3000/api/
    description: Local server
```

### Comentarios adicionales:

1. **`info`**: Proporciona detalles generales sobre la API, como el título, la versión y la descripción.
2. **`tags`**: Organiza los endpoints en grupos lógicos para facilitar la navegación y el entendimiento de la API.
3. **`paths`**: Define las rutas y los métodos HTTP asociados a cada ruta.
   - **`/card`**:
     - `get`: Recupera todas las cartas con paginación opcional (`limit` y `offset`).
     - `post`: Añade una nueva carta.
   - **`/card/{cardId}`**:
     - `get`: Recupera una carta por ID.
     - `delete`: Elimina una carta por ID.
   - **`/card/{cardId}/type`**: Ruta compleja para filtrar cartas por tipo (`type`).
     - `get`: Filtra cartas por tipo.
   - **`/deck`**:
     - `post`: Crea un nuevo mazo de cartas.
4. **`components`**:
   - **`parameters`**: Define parámetros reutilizables, como el ID de la carta.
   - **`schemas`**: Define los esquemas reutilizables para las respuestas, las solicitudes y las validaciones.
     - **`Cards`**: Esquema para una colección de cartas con paginación.
     - **`CardsArray`**: Esquema para un array de cartas mínimas.
     - **`CardMin`**: Esquema para una carta mínima.
     - **`Card`**: Esquema para una carta completa con validaciones adicionales.
     - **`Deck`**: Esquema para un mazo de cartas.
     - **`Type`**: Esquema para el tipo de carta.
     - **`ID`**: Esquema para el ID de una carta.
     - **`Error`**: Esquema para los mensajes de error.
5. **`servers`**: Define los servidores donde la API está disponible.
6. **`responses`**: Define respuestas reutilizables, como las respuestas de error para `BadRequest` y `NotFound`.

### Ejemplos de tipos de elementos:

- **Parámetros de consulta (`query`)**: 
  ```yaml
  parameters:
    - name: limit
      in: query
      description: Number of cards to return
      required: false
      schema:
        type: integer
        minimum: 1
        example: 10
  ```
- **Parámetros de ruta (`path`)**:
  ```yaml
  parameters:
    - name: cardId
      in: path
      required: true
      schema:
        $ref: "#/components/schemas/ID"
  ```
- **Paginación**:
  ```yaml
  /card:
    get:
      summary: GET all cards
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            minimum: 1
            example: 10
        - name: offset
          in: query
          schema:
            type: integer
            minimum: 0
            example: 0
  ```
- **Filtrado**:
  ```yaml
  /card/{cardId}/type:
    get:
      parameters:
        - name: type
          in: query
          schema:
            $ref: "#/components/schemas/Type"
  ```
- **Validaciones (`minLength`, `maxLength`, `minimum`, `maximum`)**:
  ```yaml
  properties:
    name:
      type: string
      description: Card name
      maxLength: 100
      minLength: 1
    hand_size:
      type: integer
      minimum: 1
  ```
- **Esquemas y respuestas reutilizables**:
  ```yaml
  schemas:
    Error:
      type: object
      properties:
        code:
          type: integer
        message:
          type: string
          enum: ["Invalid ID", "Card not found", "Invalid input"]
  ```

Con este esquema, tienes una referencia completa y detallada que incluye comentarios y ejemplos para ayudarte en tu examen. ¡Buena suerte!

apartado 1

La especificacion open api esta incompleta:

archivo aqui: (se llama game.schema.yaml)
openapi: 3.0.3
info:
  description: |-
    My Card Game documentation
  version: 1.0.0
  title: Card Game
tags:
  - name: card
    description: Everything about the Card Game
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
    post:
      tags:
        - card
      summary: Add a new card to the game
      description: Add a new card to the game
      operationId: addCard
      responses:
        '200':
          description: Successful operation
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        '405':
          description: Invalid input
      requestBody:
        description: Add a new card to the game
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Card'
  /card/{cardId}:
    parameters:
      - $ref: '#/components/parameters/ID'
    get:
      tags:
        - card
      summary: Find card by ID
      description: Returns a single card
      operationId: getCardById
      responses:
        '200':
          description: successful operation
          content:
            application/xml:
              schema:
                $ref: '#/components/schemas/Card'
            application/json:
              schema:
                $ref: '#/components/schemas/Card'
        '400':
          description: Invalid ID supplied
        '404':
          description: Card not found
    delete:
      tags:
        - card
      summary: Deletes a card
      description: ''
      operationId: deleteCard
      responses:
        '200':
          description: Successful operation
        '400':
          description: Invalid card ID
  /deck:
    post:
      # TODO
components:
  parameters:
    ID:
      description: Card ID
      name: cardId
      in: path
      required: true
      schema:
        $ref: "#/components/schemas/ID"
  schemas:
    Cards:
      type: object
      properties:
        results:
          $ref: "#/components/schemas/CardsArray"
        next:
          type: string
          description: Card next ID for pagination search
      required:
        - results
        - next
    CardsArray:
      type: array
      items:
        $ref: "#/components/schemas/CardMin"
    CardMin:
      type: object
      properties:
        _id:
          $ref: "#/components/schemas/ID"
        name:
          type: string
          description: Card name
        type:
          $ref: "#/components/schemas/Type"
      required:
        - _id
        - name
        - type
    Card:
      # TODO
    Type:
      type: string
      enum: ["hero", "ally", "event"]
      description: Card type
    ID:
      type: string
      description: Card ID obtained from the database
      example: 01001
servers:
  - url: localhost:3000/api/


Complete la seccion de components/schemas/Card dentro del fichero de especificacion para definir el json schema de una carta basandote en las cartas que que hay actaulmente en dataset cargado. Tango en cuenta que hay diferentes caartas que dependen del atributo type que tengan: cartas de distinto type tienen algunos campos diferentes,  pero las cartas con el mismo tpe tien todas los mismos campos. considere los diferentes tipos de cartas a la hora de completar el openapi y ademas tenga en cuenta que los campos abligatorios son aquellos que son comunes en todas las cartas. finalmente tenga en cuenta que no se puede añadir ningun campo extra, pero tienen que aparecer los campos de todas las cartas que estan en el dataset. se breve y conciso.

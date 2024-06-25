// Importación de módulos necesarios
const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS) || 10;
const COLLECTION = 'decks';

// Función auxiliar para validar el mazo
const validateDeck = async (deck, dbConnect) => {
  // Verificar que la carta hero exista y sea de tipo 'hero'
  const heroCard = await dbConnect.collection('cards').findOne({ _id: deck.hero, type: 'hero' });
  if (!heroCard) {
    throw { code: 1, message: 'Invalid hero ID' };
  }

  // Verificar que el deck contenga al menos 4 cartas excluyendo la carta hero
  if (Object.keys(deck.cards).length < 4) {
    throw { code: 2, message: 'Deck must contain at least 4 cards excluding the hero card' };
  }

  // Verificar que cada carta tenga entre 1 y 3 copias y que no sea de tipo 'hero'
  for (const [cardId, copies] of Object.entries(deck.cards)) {
    if (copies < 1 || copies > 3) {
      throw { code: 3, message: 'Each card must have between 1 and 3 copies' };
    }

    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card || card.type === 'hero') {
      throw { code: 4, message: `Invalid card ID or card is of type hero: ${cardId}` };
    }
  }
};

// Crear un nuevo deck
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  const deck = req.body;

  try {
    await validateDeck(deck, dbConnect);
    deck._id = new ObjectId(); // Asigna un nuevo ObjectId al deck
    const result = await dbConnect.collection(COLLECTION).insertOne(deck);
    res.status(201).send(deck);
  } catch (error) {
    res.status(400).json({ code: error.code, message: error.message });
  }
});

// Obtener todos los decks con paginación
router.get('/', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit) {
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = {};
  if (next) {
    query = { _id: { $gt: new ObjectId(next) } };
  }
  const dbConnect = dbo.getDb();
  try {
    let results = await dbConnect
      .collection(COLLECTION)
      .find(query)
      .project({ name: 1, description: 1, hero: 1 })
      .sort({ _id: 1 })
      .limit(limit)
      .toArray();

    next = results.length === limit ? results[results.length - 1]._id : null;
    res.status(200).json({ results, next });
  } catch (err) {
    res.status(400).send('Error searching for decks');
  }
});

// Obtener un deck por ID de héroe
router.get('/hero/:heroID', async (req, res) => {
  const dbConnect = dbo.getDb();
  const heroID = req.params.heroID;

  try {
    const deck = await dbConnect.collection(COLLECTION).findOne({ hero: heroID });
    if (!deck) {
      res.status(404).send('Deck not found');
    } else {
      res.status(200).send(deck);
    }
  } catch (err) {
    res.status(400).send('Error retrieving the deck');
  }
});

// Obtener un deck por ID de héroe
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = { _id: new ObjectId(req.params.id) };

  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .findOne(query);

    if (!result) {
      res.status(404).send('Not found');
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(400).send('Error retrieving the deck');
  }
});

// Eliminar un deck por ID de héroe
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const dbConnect = dbo.getDb();

  try {
    let result = await dbConnect
      .collection(COLLECTION)
      .deleteOne(query);

    if (result.deletedCount === 0) {
      res.status(404).send('Not found');
    } else {
      res.status(200).send(result);
    }
  } catch (err) {
    res.status(400).send('Error deleting the deck');
  }
});

// Actualizar un deck por ID
router.put('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  const deckId = req.params.id;
  const deck = req.body;

  try {
    await validateDeck(deck, dbConnect);
    const result = await dbConnect
      .collection(COLLECTION)
      .updateOne({ _id: new ObjectId(deckId) }, { $set: deck });

    if (result.matchedCount === 0) {
      res.status(404).send('Not found');
    } else {
      res.status(200).send({ message: 'Deck updated successfully' });
    }
  } catch (error) {
    res.status(400).json({ code: error.code, message: error.message });
  }
});

// Filtrar decks por nombre de héroe
router.get('/hero/:heroName', async (req, res) => {
  const dbConnect = dbo.getDb();
  const heroName = req.params.heroName;

  try {
    const heroCard = await dbConnect.collection('cards').findOne({ name: heroName, type: 'hero' });
    if (!heroCard) {
      return res.status(404).send('Hero not found');
    }

    const results = await dbConnect
      .collection(COLLECTION)
      .find({ hero: heroCard._id.toString() })
      .project({ name: 1, description: 1, hero: 1 })
      .toArray();

    res.status(200).json(results);
  } catch (err) {
    res.status(400).send('Error filtering decks');
  }
});

// Obtener una carta específica dentro de un deck específico
router.get('/:deckId/cards/:cardId', async (req, res) => {
  const dbConnect = dbo.getDb();
  const deckId = req.params.deckId;
  const cardId = req.params.cardId;

  try {
    const deck = await dbConnect.collection(COLLECTION).findOne({ _id: new ObjectId(deckId) });
    if (!deck) {
      return res.status(404).send('Deck not found');
    }

    const cardCopies = deck.cards[cardId];
    if (!cardCopies) {
      return res.status(404).send('Card not found in the deck');
    }

    const card = await dbConnect.collection('cards').findOne({ _id: cardId });
    if (!card) {
      return res.status(404).send('Card not found');
    }

    res.status(200).json({ card, copies: cardCopies });
  } catch (err) {
    res.status(400).send('Error retrieving the card from the deck');
  }
});

module.exports = router;

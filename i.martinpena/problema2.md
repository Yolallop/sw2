# Soluciones al problema 2

## Apartado 1

```
db.listingsAndReviews.find().sort({ number_of_reviews: -1 }).limit(1).projection({ name: 1, number_of_reviews: 1 })
```

## Apartado 2

```
db.listingsAndReviews.aggregate([
  { $project: { name: 1, amenities_count: { $size: "$amenities" } } },
  { $sort: { amenities_count: -1 } },
  { $limit: 1 }
])
```

## Apartado 3
```
db.listingsAndReviews.aggregate([
  { "$group": { _id: "$property_type", count: { "$sum": 1 } } }
])
```
# Soluciones al problema 2

## Apartado 1: En la coleccion movies indique el  titulo y el numero de premios de la pelicula con mas premios (wins dentro de awards)



## Apartado 2: en la coleccion movies muestre un listado con las diferentes clasificaciones de edad que existes (rated). Para cada uno de ellos muestre el numero de documentos que tienen esa clasificacion




## Apartado 3: en la coleccion movies muestre un listado con los diferentes generos de pelicula que existen (genres)



## Apartado 4: en la coleccion movies indique el numero de peliculas que hay entre los años 1970 y 1975 incluidos ambos extremos




## Apartado 4

```
db.listingsAndReviews.find({ beds: { $in: [2, 3, 4, 5] } }).count()
```
en la coleccion movies indique el titulo y el numero  de premios de la pelicula con mas premios (wins dentro de a

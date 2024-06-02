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

## Apartado 4

```
db.listingsAndReviews.find({ beds: { $in: [2, 3, 4, 5] } }).count()
```
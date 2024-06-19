# sw2

Para que no te pida la contraseña todo el rato:
```
git config credential.helper "cache --timeout=7200"
```

Configuración usuario:
```
git config --global user.name "i.martinpena"
```
```
git config --global user.email i.martinpena@usp.ceu.es
```

CLONAR:
```
git clone https://git.eps.ceu.es/sw2/examen/i.martinpena
```

USER:
```
i.martinpena
```

CORREO:
```
i.martinpena@usp.ceu.es
```

CONTRASEÑA: 
```
105462
```

```
cd setup
```

```
sh setup.sh
```

```
sh db.sh
```

```
cd ../api
```

```
npm install
```

```
npm audit fix
```

```
npm start
```

```
http://localhost:3000/api/cards
```

## Añadir extension mongodb

En Connecions le damos al +

Connect with Connection String

```
mongodb://127.0.0.1/sw2
```

## Ver dataset en chrome

```
http://127.0.0.1:3000/api/card/01087
```









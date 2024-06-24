### Chuleta Rápida de XPath y XQuery

#### XPath

**Conceptos Básicos**
- **Nodo:** Unidad básica de un documento XML (elementos, atributos, texto, etc.).
- **Ruta absoluta:** Comienza con `/`, selecciona desde la raíz del documento.
- **Ruta relativa:** No comienza con `/`, selecciona desde el contexto actual.

**Selección de Nodos**
- `/`: Selecciona desde la raíz.
- `//`: Selecciona nodos en todo el documento desde el nodo actual.
- `.`: Selecciona el nodo actual.
- `..`: Selecciona el nodo padre.
- `@`: Selecciona atributos.

**Sintaxis Común**
- `element`: Selecciona todos los elementos con ese nombre.
- `/root/element`: Selecciona `element` bajo `root`.
- `//element`: Selecciona todos los elementos `element` en el documento.
- `element/subelement`: Selecciona `subelement` bajo `element`.
- `element[@attribute="value"]`: Selecciona elementos `element` con un atributo `attribute` igual a `value`.

**Predicados**
- `[n]`: Selecciona el n-ésimo elemento.
- `[last()]`: Selecciona el último elemento.
- `[position()<=n]`: Selecciona los primeros n elementos.
- `[contains(text(), "value")]`: Selecciona elementos cuyo texto contiene "value".

**Funciones Comunes**
- `text()`: Selecciona el texto de un nodo.
- `count(node)`: Cuenta el número de nodos.
- `name()`: Selecciona el nombre del nodo.
- `starts-with(text(), "value")`: Selecciona elementos cuyo texto empieza con "value".

**Ejemplos Comunes**
1. **Seleccionar todos los títulos de escenas:**
   ```xpath
   //SCENE/TITLE/text()
   ```
2. **Seleccionar todos los personajes en cada escena:**
   ```xpath
   //SCENE/SPEECH/SPEAKER/text()
   ```
3. **Seleccionar todas las líneas dichas por `HAMLET`:**
   ```xpath
   //SPEECH[SPEAKER="HAMLET"]/LINE/text()
   ```
4. **Contar el número de actos en el documento:**
   ```xpath
   count(//ACT)
   ```
5. **Seleccionar el diálogo completo de `HAMLET`:**
   ```xpath
   //SPEECH[SPEAKER="HAMLET"]
   ```
6. **Seleccionar los títulos de escenas que ocurren en "Elsinore":**
   ```xpath
   //SCENE[TITLE[contains(text(), "Elsinore")]]/TITLE
   ```
7. **Contar el número total de personajes:**
   ```xpath
   count(//PERSONA)
   ```
8. **Seleccionar los títulos de escenas en las que aparece `OPHELIA`:**
   ```xpath
   //SCENE[SPEECH/SPEAKER="OPHELIA"]/TITLE
   ```
9. **Seleccionar las líneas de diálogo de `HAMLET` en la primera escena:**
   ```xpath
   //ACT[1]/SCENE[1]/SPEECH[SPEAKER="HAMLET"]/LINE/text()
   ```
10. **Seleccionar los nombres de los personajes que hablan en cada escena:**
    ```xpath
    //SCENE/SPEECH/SPEAKER/text()
    ```

**Uso de Atributos**
1. **Seleccionar elementos con un atributo específico:**
   ```xpath
   //ELEMENT[@atributo]
   ```
2. **Seleccionar elementos con un atributo específico y un valor determinado:**
   ```xpath
   //ELEMENT[@atributo="valor"]
   ```
3. **Seleccionar elementos con un atributo que contiene una subcadena:**
   ```xpath
   //ELEMENT[contains(@atributo, "subcadena")]
   ```

---

#### XQuery

**Estructura Básica**
- **FLWOR Expression:** For, Let, Where, Order by, Return.
- **For:** Itera sobre una secuencia.
- **Let:** Define variables.
- **Where:** Filtra resultados.
- **Order by:** Ordena resultados.
- **Return:** Devuelve resultados.

**Ejemplos Comunes**

1. **Seleccionar títulos de todas las escenas y los personajes que hablan en cada una de ellas:**
    ```xquery
    for $scene in //SCENE
    return
      <scene>
        <title>{ $scene/TITLE/text() }</title>
        <speakers>
          {
            for $speaker in distinct-values($scene/SPEECH/SPEAKER)
            return <speaker>{ $speaker }</speaker>
          }
        </speakers>
      </scene>
    ```

2. **Contar el número de actos en el documento:**
    ```xquery
    count(//ACT)
    ```

3. **Seleccionar todas las líneas dichas por `HAMLET`:**
    ```xquery
    for $speech in //SPEECH[SPEAKER="HAMLET"]
    return $speech/LINE/text()
    ```

4. **Obtener el diálogo completo de `HAMLET`, incluyendo todas sus líneas y las escenas en las que aparece:**
    ```xquery
    for $scene in //SCENE[SPEECH/SPEAKER="HAMLET"]
    return $scene
    ```

5. **Obtener una lista de todas las escenas y los personajes que hablan en cada una de ellas:**
    ```xquery
    for $scene in //SCENE
    return
      <scene>
        <title>{ $scene/TITLE/text() }</title>
        <speakers>
          {
            for $speaker in distinct-values($scene/SPEECH/SPEAKER)
            return <speaker>{ $speaker }</speaker>
          }
        </speakers>
      </scene>
    ```

6. **Encontrar todas las escenas donde `HAMLET` y `CLAUDIUS` están presentes juntos:**
    ```xquery
    for $scene in //SCENE
    where $scene/SPEECH/SPEAKER = "HAMLET" and $scene/SPEECH/SPEAKER = "CLAUDIUS"
    return $scene
    ```

7. **Contar el número de personajes que hablan en cada escena:**
    ```xquery
    for $scene in //SCENE
    return
      <scene>
        <title>{ $scene/TITLE/text() }</title>
        <speakerCount>{ count(distinct-values($scene/SPEECH/SPEAKER)) }</speakerCount>
      </scene>
    ```

8. **Obtener los diálogos completos de todos los personajes en la primera escena del documento:**
    ```xquery
    let $firstScene := //SCENE[1]
    return
      <scene>
        <title>{ $firstScene/TITLE/text() }</title>
        <dialogues>
          {
            for $speech in $firstScene/SPEECH
            return
              <dialogue>
                <speaker>{ $speech/SPEAKER/text() }</speaker>
                <lines>{ $speech/LINE/text() }</lines>
              </dialogue>
          }
        </dialogues>
      </scene>
    ```

9. **Encontrar todas las escenas en las que aparece `GHOST`:**
    ```xquery
    for $scene in //SCENE
    where $scene/SPEECH/SPEAKER = "GHOST"
    return $scene
    ```

10. **Extraer las primeras cinco líneas de cualquier personaje:**
    ```xquery
    for $line in //SPEECH/LINE[position() <= 5]
    return $line
    ```

**Uso de Atributos en XQuery**

1. **Seleccionar elementos con un atributo específico:**
    ```xquery
    for $element in //ELEMENT[@atributo]
    return $element
    ```

2. **Seleccionar elementos con un atributo específico y un valor determinado:**
    ```xquery
    for $element in //ELEMENT[@atributo="valor"]
    return $element
    ```

3. **Seleccionar elementos con un atributo que contiene una subcadena:**
    ```xquery
    for $element in //ELEMENT[contains(@atributo, "subcadena")]
    return $element
    ```

**Tips Rápidos**
- **Utiliza FLWOR para consultas más complejas y estructuradas.**
- **Usa `distinct-values()` para eliminar duplicados.**
- **Combina `where` y `contains()` para búsquedas más flexibles.**
- **Utiliza `let` para definir variables y simplificar consultas.**
- **Utiliza `order by` para ordenar los resultados según sea necesario.**

Esta chuleta te ayudará a repasar y recordar rápidamente cómo estructurar tus consultas XPath y XQuery y resolver ejercicios de manera eficiente. ¡Buena suerte en tus estudios!

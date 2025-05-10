---
layout: single
title: Ataques de asignación masiva (Mass-Asignment Attack) o Parameter Binding - Hacking Notes
excerpt: "Apuntes de la vulnerabilidad Mass-Asignment o Parameter Binding (Spanish)"
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
  - Mass-Asignment
  - Parameter Binding
---


# Índice
----
1. [[#Ver si es vulnerable]]
2. [[#Añadir un nuevo campo]]

--------------

## Ver si es vulnerable

Si en la petición que mandamos no estamos mandando los mismos campos que nos dice en la respuesta al registrarnos, es posible que sea vulnerable

![](/img/Pasted%20image%2020241216100701.png)


## Añadir un nuevo campo

- Ejemplo 1

![](/img/Pasted%20image%2020241216100854.png)


Metemos un nuevo campo en la petición de JSON con un campo que hemos visto en la respuesta

- Ejemplo 2
![](/img/Pasted%20image%2020241216102804.png)


En este caso hemos tenido que emplear "fuerza bruta" manualmente, ya que no conocemos el campo el cual nos da privilegios
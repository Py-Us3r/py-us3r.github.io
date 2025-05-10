---
layout: single
title: Docker Cheat Sheet - Hacking Notes
excerpt: "Docker Commands Cheat Sheet (Spanish)"
date: 2025-03-16
classes: wide
header:
  teaser: /img2/docker.png
  teaser_home_page: true
  icon: /img2/images/Dashboard.jpeg
categories:
  - Hacking Notes
  - Cheat Sheets
tags:
  - Docker
---

# Índice
----------------
1. [[#Crear Dockerfile básico]]
2. [[#Crear imagen basado en el Dockerfile]]
3. [[#Ver imágenes]]
4. [[#Descargar imágenes de los repositorios de Dockerhub]]
5. [[#Crear contenedor]]
6. [[#Ver los contenedores activos]]
7. [[#Ejecutar el comando bash en un contenedor]]
8. [[#Crear Dockerfile con utilidades instaladas]]
9. [[#Parar contenedor activo]]
10. [[#Ver actividad de los contenedores]]
11. [[#Borrar contenedor]]
12. [[#Borrar contenedor de manera forzosa]]
13. [[#Mostrar los identificadores de los contenedores]]
14. [[#Borrar todos los contenedores]]
15. [[#Borrar imagen]]
16. [[#Mostrar los identificadores de las imágenes]]
17. [[#Borrar todas las imágenes]]
18. [[#Filtrar por imágenes en none]]
19. [[#Crear Dockerfile con servicio apache y port forwarding]]
20. [[#Crear contenedor con reenvío de puertos]]
21. [[#Ver puertos de un contenedor]]
22. [[#Sincronizar directorios con monturas]]
23. [[#Crear Dockerfile copiando archivos del sistema]]
24. [[#Ver logs de un contenedor]]
25. [[#Crear e iniciar contenedor con docker-compose]]
26. [[#Ver logs del docker-compose]]
27. [[#Ver volúmenes]]
28. [[#Borrar todos los volúmenes]]
29. [[#Crear interfaz de red]]
30. [[#Ver interfaz de red]]
31. [[#Borrar interfaz de red]]
32. [[#Establecer interfaz creada en el contenedor]]
33. [[#Crear contenedor con la interfaz creada]]

----------------
## Crear Dockerfile básico 
```dockerfile
FROM ubuntu:latest
MAINTAINER Rieiro
```
----------------
## Crear imagen basado en el Dockerfile 
```bash
docker build -t my_first_image .
```
----------------
## Ver imágenes 
```bash
docker images
```
------------
## Descargar imágenes de los repositorios de Dockerhub
```bash
docker pull debian:latest
```
--------------- 
## Crear contenedor 
```bash
docker run -dit --name myContainer my_first_image
```
- -d -> se utiliza para arrancar el contenedor en segundo plano
- -i -> se utiliza para permitir la entrada interactiva al contenedor
- -t -> se utiliza para asignar un seudoterminal al contenedor
- --name -> se utiliza para asignar un nombre al contenedor
-------------------- 
## Ver los contenedores activos
```bash
docker ps
```
---------------- 
## Ejecutar el comando bash en un contenedor
```bash
docker exec -it myContainer bash
```
------------------
## Crear Dockerfile con utilidades instaladas
```Dockerfile
FROM ubuntu:latest
MAINTAINER Rieiro
RUN apt update && apt install -y net-tools \
	iputils-ping \
	curl \
	git \
	nano
```
--------------
## Parar contenedor activo
```bash
docker stop myContainer
```
------------
## Ver actividad de los contenedores
```bash
docker ps -a
```
-----------
## Borrar contenedor
```bash
docker rm myContainer
```
--------------
## Borrar contenedor de manera forzosa
```bash
docker rm myContainer --force
```
----------
## Mostrar los identificadores de los contenedores
```bash
docker ps -a -q
```
-----------
## Borrar todos los contenedores
```bash
docker rm $(docker ps -a -q) --force
```
----------
## Borrar imagen
```bash
docker rmi debian
```
---------
## Mostrar los identificadores de las imágenes
```bash
docker images -q
```
-------------
## Borrar todas las imágenes
```bash
docker rmi $(docker images -q)
```
-------
## Filtrar por imágenes en none
```bash
docker images --filter "dangling=true"
```
------------
## Crear Dockerfile con servicio apache y port forwarding
```Dockerfile
FROM ubuntu:latest
MAINTAINER Rieiro
ENV DEBIAN_FRONTEND noninteractive
RUN apt update && apt install -y net-tools \
	iputils-ping \
	curl \
	git \
	nano \
	apache2 \
	php
EXPOSE 80
ENTRYPOINT service apache2 start && /bin/bash
```
-------------
## Crear contenedor con reenvío de puertos
```bash
docker run -dit -p 80:80 --name myWebServer webserver
```
- -p -> Esta opción se utiliza para especificar la redirección de puertos y se puede utilizar de varias maneras. Por ejemplo, si se desea redirigir el puerto 80 del host al puerto 80 del contenedor
-------------
## Ver puertos de un contenedor
```bash
docker port myWebServer
```
---------------
## Sincronizar directorios con monturas
```bash
docker run -dit -p 80:80 -v /home/rieiro/RieiroCasa:/var/www/html --name myWebServer webserver
```
- -v -> Esta opción se utiliza para especificar la montura y se puede utilizar de varias maneras. Por ejemplo, si se desea montar el directorio “/home/usuario/datos” del host en el directorio “/datos” del contenedor
--------------
## Crear Dockerfile copiando archivos del sistema
```Dockerfile
FROM ubuntu:latest
MAINTAINER Rieiro
ENV DEBIAN_FRONTEND noninteractive
RUN apt update && apt install -y net-tools \
	iputils-ping \
	curl \
	git \
	nano \
	apache \
	php
COPY prueba.txt /var/www/html
EXPOSE 80
ENTRYPOINT service apache2 start && /bin/bash
```
-----------------
## Ver logs de un contenedor
```bash
docker logs myWebServer
```
-----------
## Crear e iniciar contenedor con docker-compose 
```bash
docker-compose up -d
```

```yml
version: '2'
services:
kibana:
	image: vulhub/kibana:5.6.12
	depends_on:
	- elasticsearch
	ports:
	- "5601:5601"
elasticsearch:
	image: vulhub/elasticsearch:5.6.16
```
--------------
## Ver logs del docker-compose
```bash
docker-compose logs
```
--------------
## Ver  volúmenes
```bash
docker volume ls
```
--------------
## Borrar todos los volúmenes
```bash
docker volume rm $(docker volume ls -q)
```
------
## Crear interfaz de red
```bash
docker network create --driver=bridge network1 --subnet=10.10.0.0/24
```
-----------
## Ver interfaz de red
```bash
docker network ls
```
--------
## Borrar interfaz de red
```bash
docker network rm 739870ed03c9
```
----------
## Establecer interfaz creada en el contenedor
```bash
docker network connect network1 PRO
```
------
## Crear contenedor con la interfaz creada
```bash
docker run -dit --name PRE --network=network1 ubuntu
```
-----------
## Inspeccionar una interfaz de red
```bash
docker network inspect deploy_default
```
----------
## Función para limpiar todo el contenido de Docker

```bash
function cleanDocker() { 
  docker rm $(docker ps -a -q) --force 2>/dev/null
  docker rmi $(docker images -q) 2>/dev/null
  docker network rm $(docker network ls -q) 2>/dev/null
  docker volume rm $(docker volume ls -q) 2>/dev/null
}
```
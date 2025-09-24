---
layout: single
title: Access control - PortSwigger
excerpt: "All Access control vulnerabilities labs of PortSwigger."
date: 2025-09-24
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
  - Access Control
---


## TIPS

- Check robots.txt

- Review source code for hidden paths

- Check parameters inside cookies

- Change user role via Mass Assignment

- Change user ID via IDOR

- Avoid redirects

- IDOR when downloading a file

- Bypass with X-Original-Url header

```http
X-Original-Url: /admin
```

- Change type of text in password input fields to text

- Change HTTP method

- Bypass with Referer header

## Funcionalidad admin sin protección || Unprotected admin functionality

```bash
❯ dirsearch -u https://0a7200e7031743509f2d593d0066002e.web-security-academy.net
```

```ruby

  _|. _ _  _  _  _ _|_    v0.4.3
 (_||| _) (/_(_|| (_| )

Extensions: php, aspx, jsp, html, js | HTTP method: GET | Threads: 25 | Wordlist size: 11460

Output File: /home/pyuser/reports/https_0a7200e7031743509f2d593d0066002e.web-security-academy.net/_25-08-26_12-34-45.txt

Target: https://0a7200e7031743509f2d593d0066002e.web-security-academy.net/

[12:34:45] Starting:
[12:36:43] 200 -    2KB - /favicon.ico
[12:37:07] 200 -  981B  - /login
[12:37:08] 200 -  981B  - /login/
[12:37:09] 302 -    0B  - /logout  ->  /
[12:37:09] 302 -    0B  - /logout/  ->  /
[12:37:39] 400 -   50B  - /product
[12:37:46] 200 -   65B  - /robots.txt
```

> We perform fuzzing and find the robots.txt file

![](/img2/Pasted%20image%2020250826124011.png)

![](/img2/Pasted%20image%2020250826124040.png)

## Funcionalidad admin con URL impredecible || Unprotected admin functionality with unpredictable URL

![](/img2/Pasted%20image%2020250826124643.png)

![](/img2/Pasted%20image%2020250826124733.png)

## Rol de usuario controlado por parámetro || User role controlled by request parameter

![](/img2/Pasted%20image%2020250826125710.png)

> We found an Admin parameter in the cookie.

![](/img2/Pasted%20image%2020250826125832.png)

> We change the cookie value to true.

![](/img2/Pasted%20image%2020250826125848.png)

## Modificación del rol en el perfil de usuario || User role can be modified in user profile

![](/img2/Pasted%20image%2020250826130614.png)

> By changing the email, we receive a response with more "hidden" values.

![](/img2/Pasted%20image%2020250826130636.png)

> We change one of these values to see if we can modify the user’s privileges.

![](/img2/Pasted%20image%2020250826130746.png)

## ID de usuario controlado por parámetro || User ID controlled by request parameter 

![](/img2/Pasted%20image%2020250826131420.png)

> By changing the id parameter to an existing user, we can see their API Key.

![](/img2/Pasted%20image%2020250826131551.png)

## ID de usuario impredecible controlado por parámetro || User ID controlled by request parameter, with unpredictable user IDs

![](/img2/Pasted%20image%2020250830134029.png)

> In this case, a GUID is being used.

![](/img2/Pasted%20image%2020250830134207.png)

> We can obtain the actor’s GUID from the posts section.

![](/img2/Pasted%20image%2020250830134340.png)

## Filtración de datos en redirección con ID por parámetro || User ID controlled by request parameter with data leakage in redirect

![](/img2/Pasted%20image%2020250830134910.png)

> By changing the user identifier, it redirects us to the user Carlos’s panel.

## Filtración de contraseña con ID por parámetro || User ID controlled by request parameter with password disclosure

![](/img2/Pasted%20image%2020250830135939.png)

> The server allows us to view the admin user panel, showing the password “hidden” in the input field.

![](/img2/Pasted%20image%2020250830140047.png)

## Referencias directas inseguras a objetos || Insecure direct object references

![](/img2/Pasted%20image%2020250830141339.png)

> When downloading the chat, we download a file 2.txt; however, it’s the first time downloading the file, so there might be a 1.txt from another user.

![](/img2/Pasted%20image%2020250830141511.png)

> We see another user’s chat showing their password.

![](/img2/Pasted%20image%2020250830141551.png)

## Bypass de control por URL || URL-based access control can be circumvented

![](/img2/Pasted%20image%2020250830142801.png)

> By using the X-Original-Url header, we see that the backend interprets it.

![](/img2/Pasted%20image%2020250830142901.png)

> Thanks to this header, we bypass the frontend restriction and access the admin panel.

![](/img2/Pasted%20image%2020250830143006.png)

> When requesting to delete user Carlos, the parameters are not being correctly interpreted.

![](/img2/Pasted%20image%2020250830143058.png)

> To have the parameter interpreted, we can include it in the original URL, which will be added to the X-Original-Url header request.

## Bypass de control por método HTTP || Method-based access control can be circumvented

![](/img2/Pasted%20image%2020250830143814.png)

> Trying to elevate privileges for user Wiener, the server responds with “Unauthorized”.

![](/img2/Pasted%20image%2020250830143943.png)

> To bypass the restriction, we can change the HTTP method to GET.

## Paso sin control de acceso en proceso múltiple || Multi-step process with no access control on one step 

![](/img2/Pasted%20image%2020250831133323.png)

![](/img2/Pasted%20image%2020250831133515.png)

> In this case, elevating a user’s privileges requires confirmation.

![](/img2/Pasted%20image%2020250831133628.png)

> By sending the confirmation directly with user Wiener, the server only validates the first request, not both.

## Control de acceso basado en Referer || Referer-based access control

![](/img2/Pasted%20image%2020250831134206.png)

> If we try the request with user Wiener from the root, i.e., with a Referer different from the admin, the server does not authorize it.

![](/img2/Pasted%20image%2020250831134311.png)

> By changing the Referer header to the admin panel path, privilege escalation is allowed.
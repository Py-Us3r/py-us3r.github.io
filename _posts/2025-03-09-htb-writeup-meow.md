---
layout: single
title: Meow - Hack The Box
excerpt: "In this machine, we are taking advantage of a misconfigured Telnet service using blank password."
date: 2025-03-09
classes: wide
header:
  teaser: /img2/meow.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - telnet
---

![](/img2/Pasted%20image%2020250309155106.png)

## Introduction

> In this machine, we are taking advantage of a misconfigured Telnet service using blank password.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.147.154
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.147.154
```

![](/img2/Pasted%20image%2020250309155856.png)

## Exploitation

```bash
telnet 10.129.147.154
```

![](/img2/Pasted%20image%2020250309161642.png)

> Login root with blank password

## Tasks

1. What does the acronym VM stand for?
> Virtual Machine

2. What tool do we use to interact with the operating system in order to issue commands via the command line, such as the one to start our VPN connection? It's also known as a console or shell.
> Terminal

3. What service do we use to form our VPN connection into HTB labs?
> openvpn

4. What tool do we use to test our connection to the target with an ICMP echo request?
> ping

5. What is the name of the most common tool for finding open ports on a target?
> nmap

6. What service do we identify on port 23/tcp during our scans?
> telnet

7. What username is able to log into the target over telnet with a blank password?
> root

8. Submit root flag
> b40abdfe23665f766f9c61ecba8a4c19

![](/img2/Pasted%20image%2020250309162122.png)

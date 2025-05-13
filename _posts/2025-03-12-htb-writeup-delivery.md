---
layout: single
title: Delivery - Hack The Box
excerpt: "Delivery is an easy difficulty Linux machine that features the support ticketing system osTicket where it is possible by using a technique called TicketTrick, a non-authenticated user to be granted with access to a temporary company email. This &amp;quot;feature&amp;quot; permits the registration at MatterMost and the join of internal team channel. It is revealed through that channel that users have been using same password variant &amp;quot;PleaseSubscribe!&amp;quot; for internal access. In channel it is also disclosed the credentials for the mail user which can give the initial foothold to the system. While enumerating the file system we come across the mattermost configuration file which reveals MySQL database credentials. By having access to the database a password hash can be extracted from Users table and crack it using the &amp;quot;PleaseSubscribe!&amp;quot; pattern. After cracking the hash it is possible to login as user root."
date: 2025-05-12
classes: wide
header:
  teaser: /img2/delivery.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Virtual Hosting Enumeration
  - Abusing Support Ticket System
  - Access to MatterMost
  - Information Leakage
  - Database Enumeration - MYSQL
  - Dictionary Generating
  - Cracking Hashes
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.222
```

![](/img2/Pasted%20image%2020250512133200.png)
## Exploitation

- Abusing Support Ticket System

![](/img2/Pasted%20image%2020250512134121.png)

![[Pasted image 20250512134153.png]]

![](/img2/Pasted%20image%2020250512134209.png)

![](/img2/Pasted%20image%2020250512134251.png)

![](/img2/Pasted%20image%2020250512134303.png)

- Conect ssh

```bash
ssh maildeliverer@10.10.10.222
```

## Post-exploitation

- Check all listening ports

```bash
ss -nltp
```

![](/img2/Pasted%20image%2020250512145016.png)

- Leaked config data

```bash
cat /opt/mattermost/config/config.json | grep 3306
```

![](/img2/Pasted%20image%2020250512145219.png)

- Conect to MariaDB

```bash
mysql -u mmuser -p
```

```sql
select username,password from Users;
```

![](/img2/Pasted%20image%2020250512145939.png)

- Generate custom dictionary with PleaseSubscribe\! variants

![](/img2/Pasted%20image%2020250512152339.png)

```bash
echo "PleaseSubscribe\!"> data.txt
```

```bash
rsmangler -f data.txt -o custom_dict.txt
```

```bash
hashcat -m 3200 hash.txt custom_dict.txt
```

![](/img2/Pasted%20image%2020250512152439.png)

![](/img2/Pasted%20image%2020250512152538.png)
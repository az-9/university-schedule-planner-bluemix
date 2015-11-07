"use strict"

let cfenv   = require("cfenv")
let express = require("express")

// get the core cfenv application environment
let appEnv = cfenv.getAppEnv()

// create the express app
let app = express()

// have all GET requests handled by the onRequest function
app.get("*", onRequest)

// start the server, writing a message once it's actually started
app.listen(appEnv.port, appEnv.bind, function() {
    log(`server starting on ${appEnv.url}`)
})

// all done! server should start listening and responding to requests!

//------------------------------------------------------------------------------
// when a request is sent to the server, respond with "Hello World" text
//------------------------------------------------------------------------------
function onRequest(request, response) {
    log(`request ${request.method} ${request.url}`)

    let html = "<h1>Hello, world!</h1>"

    response.send(html)
}

/*------------------------------------------------------------------------------
 other interesting values available:
 request.method            - HTTP method used
 request.url               - full URL requested
 request.headers           - HTTP headers as a JavaScript object
 request.headers.host      - the Host: header value
 request.query             - query string parameters
 request.query.a           - value of the querystring parameter `a` (eg ?a=1)
 appEnv.isLocal            - false if running on Bluemix
 appEnv.app.limits.mem     - # of MB of memory allocated
 appEnv.app.limits.disk    - # of GB of disk allocated
 appEnv.app.name           - name of the application
 appEnv.app.space_name     - space of the application
 appEnv.app.instance_index - instance # of this server
 appEnv.app.port           - port the server is running
 appEnv.app.started_at     - when server started, eg '2014-09-19 01:17:43 +0000'
 ------------------------------------------------------------------------------*/

//------------------------------------------------------------------------------
// log a message with a common prefix of the package name
//------------------------------------------------------------------------------
function log(message) {
    console.log(`${appEnv.name}: ${message}`)
}
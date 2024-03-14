class SI {
    /*
    method: GET, POST, PUT, DELETE. etc.
    url: The url of the service being called
    body: The request body. Must be null or JSON
    files: An array of name/file pairs (ie [{name: 'my-pic`, file: file-info-struct-obtained-from-file-selector}])
    page: The page number to retrieve. Optional.
    pageSize: The number of records for each page. Optional.
    */
    static async sendToServer(method, url, authorization, contentType, body, files, page = -1, pageSize = -1) {
        try {
            const server = Registry.get(`Server`)
            const request = {
                method: method,
                headers: { 'Origin': `${server}` }
            }
            let actualURL = url

            if (!isNaN(page) && !isNaN(pageSize) && 0 < pageSize && 0 <= page) { actualURL += `?page=${page}&pagesize=${pageSize}` }
            if (contentType) { request.headers[`Content-Type`] = contentType }
            if (authorization) { 
                const credentials = JavascriptWebToken.getCredentials()

                if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401, error: `Invalid credentials` }}
        
                request.headers.Authorization = `'Bearer ${credentials.token}'`
            }
            if (files && 0 < files.length) {
                const formData = new FormData()

                for (let file of files) { formData.append(file.name, file.file) }
                if (body) { for (let prop in body) { formData.append(prop, body[prop]) }}
                request.body = formData

                const response = await fetch(`${server}${actualURL}`, request)

                return response
            } else if (body && `GET` !== method.toUpperCase() && `HEAD` !== method.toUpperCase()) { 
                request.body = JSON.stringify(body)

                const response = await fetch(`${server}${actualURL}`, request)
        
                return response
            } else { 
                const response = await fetch(`${server}${actualURL}`, request)

                return response
            }
        } catch (e) {
            console.error(`SI.sendToServer: Exception text: ${e}`)
        }

    }
}
class SIImgurAlbum {
    static async get() {
        const response = await SI.sendToServer('GET', `albums`, false, null, null, null)

        return response
        /*
        try {
            const server = Registry.get(`Server`)
            const response = await fetch(`${server}albums`, {
                method: 'GET'
            })

            return response
        } catch (e) {
            return { status: 401 }
        }
        */
    }
    static async add(title, optionalDescription) {
        const body = { title, description: optionalDescription }
        const response = await SI.sendToServer('POST', `album`, true, null, body, null)

        return response

        /*
        try {
            const credentials = JavascriptWebToken.getCredentials()

            if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401 }}
    
            const formData = new FormData()
    
            formData.append("title", title)
            if (optionalDescription) { formData.append("description", optionalDescription) }
    
            const server = Registry.get(`Server`)
            const response = await fetch(`${server}album`, {
                method: 'POST',
                headers: {
                    'Authorization': `'Bearer ${credentials.token}'`
                },
                body: formData
            })

            return response    
        } catch (e) {
            return { status: 401 }
        }
        */
    }
    static async remove(id) {
        const response = await SI.sendToServer('DELETE', `/album/${id}`, true, null, null, null)

        return response

        /*
        try {
            const credentials = JavascriptWebToken.getCredentials()

            if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401 }}
    
            const args = {
                method: 'DELETE',
                headers: {
                    'Authorization': `'Bearer ${credentials.token}'`
                },
                body: JSON.stringify({ })
            }

            const server = Registry.get(`Server`)
            const response = await fetch(`${server}/album/${id}`, args)

            return response
        } catch (e) {
            return { status: 401 }
        }
        */
    }
}
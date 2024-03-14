class SIImgurImage {
    static async get(albumId) {
        const response = await SI.sendToServer('GET', `album/${albumId}/images`, false, null, null, null)

        return response

        /*
        try {
            const server = Registry.get(`Server`)
            const response = await fetch(`${server}album/${albumId}/images`, {
                method: 'GET',
            })

            return response
        } catch (e) {
            return { status: 401 }
        }
        */
    }
    static async getOne(imageId) {
        const response = await SI.sendToServer('GET', `image/${imageId}`, false, null, null, null)

        return response
        /*
        try {
            const server = Registry.get(`Server`)
            const response = await fetch(`${server}image/${imageId}`, {
                method: 'GET',
            })

            return response
        } catch (e) {
            return { status: 401 }
        }
        */
    }
    static async add(albumId, title, file, optionalDescription) {
        const body = { albumId, title, description: optionalDescription }
        const files = [{ name: `filename`, file }]
        const response = await SI.sendToServer('POST', `image`, true, null, body, files)

        return response

        /*
        try {
            const credentials = JavascriptWebToken.getCredentials()

            if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401 }}
    
            const formData = new FormData()
    
            formData.append("albumId", albumId)
            formData.append("title", title)
            formData.append("filename", file)
            if (optionalDescription) { formData.append("description", optionalDescription) }
    
            const server = Registry.get(`Server`)
            const response = await fetch(`${server}image`, {
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
        const response = await SI.sendToServer('DELETE', `/image/${id}`, true, null, null, null)

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
            const response = await fetch(`${server}/image/${id}`, args)

            return response
        } catch (e) {
            return { status: 401 }
        }
        */
    }
}
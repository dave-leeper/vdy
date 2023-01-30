class SINews {
    static async get() {
        const response = await fetch('http://localhost:8080/news-info', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        })

        return response
    }
    static async add(file, title, text) {
        const credentials = JavascriptWebToken.getCredentials()

        if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401 }}

        const formData = new FormData()

        formData.append("filename", file)
        formData.append("title", title)
        formData.append("text", text)
        
        try {
            const response = await fetch('http://localhost:8080/news-info', {
                method: 'POST',
                headers: { 'Authorization': `'Bearer ${credentials.token}'` },
                body: formData
            })
    
            return response    
        } catch (e) {
            return { status: 401 }
        }
    }
    static async update(file, title, text, id) {
        const credentials = JavascriptWebToken.getCredentials()

        if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401 }}

        const formData = new FormData()

        formData.append("filename", file)
        formData.append("title", title)
        formData.append("text", text)
        formData.append("id", id)
        
        try {
            const response = await fetch('http://localhost:8080/news-info-update', {
                method: 'POST',
                headers: { 'Authorization': `'Bearer ${credentials.token}'` },
                body: formData
            })
    
            return response    
        } catch (e) {
            return { status: 401 }
        }
    }
    static async remove(newsId) {
        const credentials = JavascriptWebToken.getCredentials()

        if (!JavascriptWebToken.areCredentialsValid(credentials)) { return { status: 401 }}

        const args = {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `'Bearer ${credentials.token}'`
            },
            body: JSON.stringify({ id: newsId })
        }

        try {
            const response = await fetch('http://localhost:8080/news-info', args)

            return response
        } catch (e) {
            return { status: 401 }
        }
    }
}
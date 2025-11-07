

export const charge = async (id) => {
    try {
        const url = `${process.env.API_URL}/api/elements/accounts/${id}/recharge`
        console.log("id ", id)
        console.log("url ", url)
        const request = await fetch(url, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        const response = await request.json()
        console.log("response ", response)
        return response
    } catch (e) {
        console.error(e)
    }
}

export const pay = async (id) => {
    try {
        const url = `${process.env.API_URL}/api/elements/accounts/${id}/pay`
        console.log("id ", id)
        console.log("url ", url)
        const request = await fetch(url, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        const response = await request.json()
        console.log("response ", response)
        return response
    } catch (e) {
        console.error(e)
    }
}


export const addTag = async (id) => {
    try {
        const url = "${process.env.API_URL}/api/elements/accounts"
        const request = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name: id })
        })

        const response = await request.json()
        console.log("response ", response)
        return response
    } catch (e) {
        console.error(e)
    }
}

export const balance = async (id) => {
    try {
        const url = `${process.env.API_URL}/api/elements/accounts/${id}/balance`
        console.log("id ", id)
        console.log("url ", url)
        const request = await fetch(url, {
            headers: {
                "Content-Type": "application/json"
            }
        })

        const response = await request.json()
        console.log("response ", response)
        const balance = (response?.balance ?? 0)
        return {
            cardId: id,
            balance: balance * 5.50,
            crypto: balance
        }
    } catch (e) {
        console.error(e)
    }
}
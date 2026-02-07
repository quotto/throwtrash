import property from "./property.js"

export default {
    ServerError: {
        statusCode: 301,
        headers: {
            Location: `${property.FRONTEND_URL}/500.html`
        }
    },
    UserError: {
        statusCode: 301,
        headers: {
            Location: `${property.FRONTEND_URL}/400.html`
        }
    }

}

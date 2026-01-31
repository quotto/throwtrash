export default {
    ServerError: {
        statusCode: 301,
        headers: {
            Location: "https://apps.mythrowaway.net/500.html"
        }
    },
    UserError: {
        statusCode: 301,
        headers: {
            Location: "https://apps.mythrowaway.net/400.html"
        }
    }

}
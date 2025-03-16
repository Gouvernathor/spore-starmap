export class APIClient {
    constructor(
        public readonly baseURL: string,
    ) {}

    async get(endpoint: string) {
        return (await fetch(this.baseURL + endpoint)).json();
    }

    async post(endpoint: string, data: any) {
        return (await fetch(this.baseURL + endpoint, {
            mode: "cors",
            method: "POST",
            body: data,
            headers: {
                "Content-Type": "application/json",
            }
        })).json();
    }

    async put(endpoint: string, data: any) {
        return (await fetch(this.baseURL + endpoint, {
            mode: "cors",
            method: "PUT",
            body: data,
            headers: {
                "Content-Type": "application/json",
            }
        })).json();
    }

    async delete(endpoint: string) {
        return (await fetch(this.baseURL + endpoint, {
            method: "DELETE",
        })).json();
    }
}

const API_URL = "https://zacbox.app/api/starmap/";
const client = new APIClient(API_URL);
export default client;

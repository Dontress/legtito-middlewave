import createHttpError from 'http-errors';

class Redirect {
    public async redirectRequest(domain: string, targetEndpoint: string, method: string, jwtToken: string, requestBody: object): Promise<{ status: number; data: string }>{
        const url = `${domain}${targetEndpoint}`;
        console.log(method, url);

        let body = null;

        if(method !== 'GET')
            body = JSON.stringify(requestBody);

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${jwtToken}`
                },
                body: body
            });

            const status: number = response.status;
            const data: string = await response.json();

            return { status , data };
        } catch (error) {
            console.error('Error making request:', error);
            throw createHttpError(500, 'Cannot make redirect to Legito');
        }
    }
}

export default new Redirect();
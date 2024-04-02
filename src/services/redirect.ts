import createHttpError from 'http-errors';

class Redirect {
    public async redirectRequest(domain: string, targetEndpoint: string, method: string, jwtToken: string, requestBody: object, requestQuery: object): Promise<{ status: number; data: string }>{
        let url = `${domain}${targetEndpoint}`;

        if(this.hasQueryString(requestQuery)){
            const queryString = this.buildQueryString(requestQuery);
            url += url.includes('?') ? '&' + queryString : '?' + queryString;
            console.log(method, url);
        } else {
            console.log(method, url);
        }

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
                body: body,
            });

            const status: number = response.status;
            const data: string = await response.json();

            return { status , data };
        } catch (error) {
            console.error('Error making request:', error);
            throw createHttpError(500, 'Cannot make redirect to Legito');
        }
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    private buildQueryString(params) {
        return Object.keys(params)
            .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key]))
            .join('&');
    }

    private hasQueryString(queryString: object): boolean {
        const obj = queryString;

        if (obj) {
            if (Object.keys(obj).length === 0) {
                return false;
            } else if (Object.prototype.hasOwnProperty.call(obj, 'content') && Object.keys(obj).length === 1) {
                return true;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    public parseArrayPostResponseToObject(data: string): object | string {
        try {
            console.log('Converting array response to Object...');
            return Object.assign({}, ...data);
        }catch (e){
            console.log('Cannot convert array response to Object, aborting...');
            return data;
        }
    }
}

export default new Redirect();
import handler from './api/[...slug]';

async function run() {
    const req: any = {
        url: 'http://localhost/api/auth/register',
        method: 'POST',
        body: {
            email: 'direct_test@example.com',
            password: 'testpassword123'
        }
    };

    const res: any = {
        status: (code: number) => {
            console.log('Status set to:', code);
            return res;
        },
        json: (data: any) => {
            console.log('JSON Output:', data);
        },
        end: () => {
            console.log('Response ended');
        }
    };

    try {
        await handler(req, res);
    } catch (e) {
        console.error('ERROR:', e);
    }
}

run();

import { getPromisableResult } from '../src';

class MockTest {

    constructor(delay: number) {

        this._valid = 'false';

        setTimeout(() => {
            this._valid = 'true';
        }, delay);

    }

    private _valid: string;

    public get valid(): string {
        return this._valid;
    }

}

describe('getPromisableResult', () => {

    describe('result can be retrieved in time', () => {

        let mock: MockTest;

        beforeEach(() => {
            mock = new MockTest(50);
        });

        it('default retries / delay', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true'
                )
            ).resolves.toBe('true');
    
        });

        it('setting retries', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true',
                    {
                        retries: 8
                    }
                )
            ).resolves.toBe('true');
    
        });

        it('setting delay', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true',
                    {
                        delay: 15
                    }
                )
            ).resolves.toBe('true');
    
        });

    });

    describe('result cannot be retrieved in time', () => {

        let mock: MockTest;

        beforeEach(() => {
            mock = new MockTest(1000);
        });

        it('default retries / delay', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true'
                )
            ).rejects.toEqual(new Error('Could not get the result after 10 retries'));
    
        });

        it('setting retries', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true',
                    {
                        retries: 5
                    }
                )
            ).rejects.toEqual(new Error('Could not get the result after 5 retries'));
    
        });

        it('setting delay', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true',
                    {
                        delay: 5
                    }
                )
            ).rejects.toEqual(new Error('Could not get the result after 10 retries'));
    
        });

        it('setting rejectMessage', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true',
                    {
                        rejectMessage: 'Failed after {{ retries }} retries'
                    }
                )
            ).rejects.toEqual(new Error('Failed after 10 retries'));
    
        });

        it('if shouldReject is false it should return false', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: string) => valid === 'true',
                    {
                        shouldReject: false
                    }
                )
            ).resolves.toBe('false');

        });

    });

});
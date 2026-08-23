import { getPromisableResult } from '../src';

enum State {
    TRUE = 'true',
    FALSE = 'false'
}

class MockTest {

    constructor(delay: number) {

        this._valid = State.FALSE;

        setTimeout(() => {
            this._valid = State.TRUE;
        }, delay);

    }

    private _valid: State;

    public get valid(): State {
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
                    (valid: State) => valid === State.TRUE
                )
            ).resolves.toBe(State.TRUE);
    
        });

        it('setting retries', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: State) => valid === State.TRUE,
                    {
                        retries: 8
                    }
                )
            ).resolves.toBe(State.TRUE);
    
        });

        it('setting delay', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: State) => valid === State.TRUE,
                    {
                        delay: 15
                    }
                )
            ).resolves.toBe(State.TRUE);
    
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
                    (valid: State) => valid === State.TRUE
                )
            ).rejects.toEqual(new Error('Could not get the result after 10 retries'));
    
        });

        it('setting retries', async () => {

            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: State) => valid === State.TRUE,
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
                    (valid: State) => valid === State.TRUE,
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
                    (valid: State) => valid === State.TRUE,
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
                    (valid: State) => valid === State.TRUE,
                    {
                        shouldReject: false
                    }
                )
            ).resolves.toBe(State.FALSE);

        });

    });

    describe('aborting the promise with an AbortSignal', () => {

        const reason = 'Abort on purpose!';
        let mock: MockTest;

        beforeEach(() => {
            mock = new MockTest(100);
        });

        it('Using an already aborted signal should abort the promise since the beginning', async () => {
            const controller = new AbortController();
            const { signal } = controller;
            controller.abort(reason);
            await expect(
                getPromisableResult(
                    () => mock.valid,
                    (valid: State) => valid === State.TRUE,
                    {
                        signal
                    }
                )
            ).rejects.toMatch(reason);
        });

        it('Aborting the controller should reject the promise with the given reason', async () => {
            await expect(
                async () => {
                    const controller = new AbortController();
                    const { signal } = controller;
                    setTimeout(() => {
                        controller.abort(reason);
                    }, 50);
                    return getPromisableResult(
                        () => mock.valid,
                        (valid: State) => valid === State.TRUE,
                        {
                            signal
                        }
                    );
                }
            ).rejects.toMatch(reason);
        });

        it('an aborted getPromisableResult should catch with an AbortError error', async () => {
            expect.assertions(1);
            const controller = new AbortController();
            const { signal } = controller;
            setTimeout(() => {
                controller.abort();
            }, 50);
            await getPromisableResult(
                () => mock.valid,
                (valid: State) => valid === State.TRUE,
                {
                    signal
                }
            )
                .catch((error: unknown) => {
                    expect((error as Error).name).toBe('AbortError');
                });
        });

    });

});
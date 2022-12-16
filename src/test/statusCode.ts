import BlipError from "../index";

describe('server property', () => {
    describe('true boundaries', () => {
        const boundaries = [500, 599];
        boundaries.forEach((boundary) => {
            it(`should be true for ${boundary}`, () => {
                const err = new BlipError('', { statusCode: boundary });
                expect(err.server).toBe(true);
            });
        });
    });
    describe('false boundaries', () => {
        it('should be false for 499', () => {
            const err = new BlipError('', { statusCode: 499 });
            expect(err.server).toBe(false);
        });
    });
});
describe('throws', () => {
    describe('accepted boundaries', () => {
        const boundaries = [99, 600];
        boundaries.forEach((boundary) => {
            it(`should throw if statusCode is ${boundary}`, () => {
                expect(() => new BlipError('', { statusCode: boundary })).toThrow();
            });
        });
    });
    describe ('unaccepted boundaries', () => {
        const boundaries = [100, 599];
        boundaries.forEach((boundary) => {
            it(`should not throw if statusCode is ${boundary}`, () => {
                expect(() => new BlipError('', { statusCode: boundary })).not.toThrow();
            });
        });
    });
    describe('others', () => {
        describe('unaccepted values', () => {
            const throwValues = [Infinity, -Infinity];
            throwValues.forEach((value) => {
                it(`should throw if statusCode is ${value}`, () => {
                    expect(() => new BlipError('', { statusCode: value })).toThrow();
                });
            });
        });
    });
});
describe('defaults', () => {
    const defaultValues = [undefined, NaN];
    defaultValues.forEach((value) => {
        it(`should use default if statusCode is ${value}`, () => {
            const err = new BlipError('', { statusCode: value });
            expect(err.statusCode).toBe(500);
        });
    });
});

describe('aliases', () => {
    let err: BlipError;
    beforeEach(() => {
        err = new BlipError('', { statusCode: 400 });
    });
    test('code', () => {
        expect(err.statusCode === err.code).toBe(true);
    });
    test('status', () => {
        expect(err.statusCode === err.status).toBe(true);
    });
});

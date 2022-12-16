import BlipError from "../index";

describe('defaults', () => {
    let err: BlipError;
    beforeEach(() => {
        err = new BlipError();
    });

    it("should have message of ''", () => {
        expect(err.message).toBe('');
    });
    it('should have statusCode of 500', () => {
        expect(err.statusCode).toBe(500);
    });
    it('should have empty data', () => {
        expect(err.data).toBeUndefined();
    });
    it('should have a stack', () => {
        expect(err.stack).toBeDefined();
    });
});

describe('basicProperties', () => {
    let err: BlipError;
    beforeEach(() => {
        err = new BlipError('a message');
    });

    it('should have name BlipError', () => {
        expect(err.name).toBe('BlipError');
    });
    test('setting message using constructor', () => {
        expect(err.message).toBe('a message');
    });
});

test('setting data using options', () => {
    const err = new BlipError('a message', { data: { a: 1 } });
    expect(err.data).toEqual({ a: 1 });
});

import BlipError from "../index";

describe.each`
    name | err
    ${'new BlipError()'} | ${new BlipError()}
    ${'new BlipError("blip!")'} | ${new BlipError('blip!')}
    ${'new BlipError("", {data: {a: "b"}})'} | ${new BlipError('', {data: {a: 'b'}})}
    ${'new BlipError("", {rootErr: new Error("root error")})'} | ${new BlipError('', {rootErr: new Error('root error')})}`
    ('$name', ({err}: {err: BlipError}) => {
        const entries = Object.fromEntries(Object.entries(err));
        const errObj = entries.err;

        test('err is the only enumerable property', () => {
            const enumerableProps = Object.keys(err);
            expect(enumerableProps).toEqual(['err']);
        });

        test('err object has keys "message" and "statusCode"', () => {
            expect(Object.keys(errObj)).toEqual(['message', 'statusCode']);
        });
    })
;

describe('within err: {}', () => {
    const message = 'blip!';
    const statusCode = 400;
    const err = new BlipError(message, { statusCode });
    const errObj = Object.fromEntries(Object.entries(err)).err;

    test('message is set correctly', () => {
        expect(errObj.message).toBe(message);
    });
    test('statusCode is set correctly', () => {
        expect(errObj.statusCode).toBe(statusCode);
    });
});



import BlipError from "../index";

describe('basic', () => {
    let rootErr: Error;
    let blipErr: BlipError;

    beforeEach(() => {
        rootErr = new Error('root error');
        rootErr.name = 'RootError';
        rootErr.stack = 'root error stack';
        blipErr = new BlipError('', { rootErr });
    });

    test('rootErr should be set', () => {
        expect(blipErr.rootErr).toEqual(rootErr);
    });
    test('rootErr is instanceof Error', () => {
        expect(blipErr.rootErr).toBeInstanceOf(Error);
    });
});

describe('stack', () => {
    let rootErr: Error;
    let blipErr: BlipError;
    beforeEach(() => {
        rootErr = new Error('root error');
        rootErr.stack = 'root error stack';
        blipErr = new BlipError('', { rootErr });
    });
    it('should be overridden by rootErr', () => {
        expect(blipErr.stack).toBe('root error stack');
    });
    test("originalStack should not be 'root error stack'", () => {
        expect(blipErr.originalStack).not.toBe('root error stack');
    });
});

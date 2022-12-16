import BlipError from "../index";
import * as util from "util";

describe('toString()', () => {
    it('should be BlipError: {message}', () => {
        const err = new BlipError('a message');
        expect(err.toString()).toBe('BlipError: a message');
    });
    it('should be BlipError when no message supplied', () => {
        const err = new BlipError();
        expect(err.toString()).toBe('BlipError');
    });
});

/**
 * Tests for Node.js inspection (console.log in Node.js)
 */
describe('util.inspect()', () => {
    let err: BlipError;
    let inspectString: string;

    beforeEach(() => {
        const message = 'blip!';
        const data = {a: "b"};
        const statusCode = 501;
        const rootErr = new Error('root error');
        const options = {data, statusCode, rootErr};

        err = new BlipError(message, options);
        inspectString = util.inspect(err);
    });

    describe('console.log', () => {
        let mockFn: jest.Mock;
        beforeAll(() => {
            mockFn = jest.fn();
            jest.spyOn(global.console, 'log').mockImplementation(mockFn);
        });

        it('should call console.log', () => {
            console.log(new BlipError(err.message));
            expect(mockFn).toHaveBeenCalled();
        });
        it("should call console.log with parameter 'BlipError: ${message}:'", () => {
            expect(mockFn.mock.calls[0][0]).toEqual(`BlipError: ${err.message}:`);
        });

        afterAll(() => {
            mockFn.mockRestore(); // stop the spy and restore original function
        });
    });

    it('should have a stack', () => {
        // The first line of the stack is the Error name and message, so we need to skip it.
        const stackExceptFirstLine = err.stack?.split('\n').slice(1).join('\n');
        expect(inspectString).toContain(stackExceptFirstLine);
    });
    describe('object properties', () => {
        let object: object;

        beforeEach(() => {
            // Find the index of the opening and closing brackets
            const startIndex = inspectString.indexOf('{');
            const endIndex = inspectString.lastIndexOf('}');

            // Extract the JSON object from the string
            let objectString = inspectString.substring(startIndex, endIndex + 1);
            // Some reformatting to make it valid JSON
            objectString = objectString.replace(/[\n\s]/g, ''); // Remove newlines and whitespace
            objectString = objectString.replace(/([a-zA-Z]+)(?=:)/g, '"$1"'); // Add quotes around property names
            objectString = objectString.replace(/'/g, '"'); // Replace single quotes with double quotes
            object = JSON.parse(objectString);
        });

        it('should have data', () => {
            expect(object).toHaveProperty('data', err.data);
        });
        it('should have server', () => {
            expect(object).toHaveProperty('server', err.server);
        });
        it('should have statusCode', () => {
            expect(object).toHaveProperty('statusCode', err.statusCode);
        });
    });

    it('should give you the same result regardless of if .inspection is used', () => {
        expect(inspectString).toEqual(util.inspect(err.inspection));
    });
});

describe('.inspection aliases', () => {
    let err: BlipError;
    beforeEach(() => {
        err = new BlipError('');
    });

    test('.log', () => {
        expect(err.log).toEqual(err.inspection);
    });
    test('.inspect', () => {
        expect(err.inspect).toEqual(err.inspection);
    });
});

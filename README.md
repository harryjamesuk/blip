# Blip
Error handling library with special considerations for HTTP clients and logging.

## Get started
```shell
npm install blip-http-errors
yarn add blip-http-errors
```

## Usage
```js
throw new BlipError(message, options); // in your catch statement

logger.error(err.inspect); // in your logger (⚠️ SERVER ONLY - not for client response)
return res.status(blip.statusCode).json(blip); // using your favourite framework - in your error handler (✅ Client safe)
```
*Still confused? Check the [example](#example) below.*

### Example value (json)

```json
{ 
  "err": {
    "message": "Your error message",
    "statusCode": 500
  }
}
```

## Why Blip?
The idea came from the need to have a HTTP consistent error handling library for both the server and the client.<br>
Blip is designed client-safe from get-go, so you don't need to worry about your sensitive data leaking to the client.

Blip has taken inspiration from React's concept of "lifting state up". In Blip, we encourage "lifting errors up".<br>
This allows you to keep a consistent error handling experience, no matter what the error.

### Example
Let's say your application has specific error handling logic - it might use a third-party logger, or a solution like
[Sentry](https://sentry.io/).<br>
It's easy to end up with repetitive code handling your error, like this:
```js
// First error
try {
    throw new Error('beep!');
} catch (err) {
    logger.error(err);
    return res.status(500).json({ statusCode: 500, message: 'beep!' });
}

// Second error
try {
    throw new Error('boop!');
} catch (err) {
    logger.error(err);
    return res.status(400).json({ statusCode: 400, message: 'boop!' });
}
```
These errors are handled in a similar fashion, and it means if we want to change our error handling logic,
we need to change it in multiple places. Not good! <br>
With Blip, we can lift the error handling logic up, and keep our code clean:
```js
// First error
try {
    throw new Error('beep!');
} catch (err) {
    throw new BlipError('beep!', { statusCode: 500, rootErr: err }); // pass rootErr to keep the original error
}

// Second error
try {
    throw new Error('boop!');
} catch (err) {
    throw new BlipError('boop!', { statusCode: 500, rootErr: err }); // pass rootErr to keep the original error
}

// Lifted error handling logic
function handler() {
    logger.err(err.inspect); // contains info about BlipError, and the original error (rootErr).
    return res.status(err.statusCode).json(err);
}
```

## API
You can view the full API [here](https://blip-api-docs.netlify.app/).
- [`throw new BlipError(message, options)`](#throw-new-bliperror--message-options-)
- [⚠️ `blipError.inspection`](#bliperrorinspection)
- [`blipError.message`](#bliperrormessage)
- [`blipError.statusCode`](#bliperrorstatuscode)
- [⚠️ `blipError.rootErr`](#bliperrorrooterr)
- [⚠️ `blipError.stack`](#bliperrorstack)
- [⚠️ `blipError.originalStack`](#bliperrororiginalstack)

#### throw new BlipError(message, options)
Throws a BlipError. The returned BlipError is client-safe and can be sent in responses JSON.<br>
Parameters:
- `message` - The error message to display to the client.
- `options` - An optional object containing any of the following:
    - `statusCode` - The HTTP status code of the error. Defaults to 500.
    - `rootErr` - The original error.
    - `data` - Any additional metadata for inspection.

#### blipError.inspection
> ⚠️ This property is designed for server use only - do not send the response to the client as it may contain
> sensitive data (such as `data` and `rootErr`'s `name` and `type` properties).

Returns a special representation of BlipError that can be inspected by the `console` or custom logging solutions.
*Aliases*: `blipError.inspect`, `blipError.log`

#### blipError.message
Returns the error message to display to the client.

#### blipError.statusCode
Returns the [HTTP Status Code](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status) associated with this error.<br>
*Aliases*: `blipError.status`, `blipError.code`

#### blipError.rootErr
> ⚠️ This property is designed for server use only - it's usually not advisable to send the original Error to the
> client (most frameworks will send an empty object to be safe by default).

Returns the original Error.

#### blipError.stack
> ⚠️ Stack traces are not client-safe, and should not be sent to the client.

Returns the stack trace of the `rootErr`, or the stack trace of the BlipError if `rootErr` is not defined.

#### blipError.originalStack
> ⚠️ Stack traces are not client-safe, and should not be sent to the client.

Blip will overwrite the stack trace of the BlipError with the stack trace of the `rootErr` if it's defined.<br>
It's unlikely you'll ever use this, but this getter will obtain the original stack trace of the BlipError.

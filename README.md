# get-promisable-result

A very small JavaScript utility to check and retry a function a limited number of times abstracting it in a Promise

[![Deployment Status](https://github.com/elchininet/get-promisable-result/actions/workflows/deploy.yaml/badge.svg)](https://github.com/elchininet/get-promisable-result/actions/workflows/deploy.yaml)
[![Tests](https://github.com/elchininet/get-promisable-result/actions/workflows/tests.yaml/badge.svg)](https://github.com/elchininet/get-promisable-result/actions/workflows/tests.yaml)
[![Coverage Status](https://coveralls.io/repos/github/elchininet/get-promisable-result/badge.svg?branch=master)](https://coveralls.io/github/elchininet/get-promisable-result?branch=master)
[![npm version](https://badge.fury.io/js/get-promisable-result.svg)](https://badge.fury.io/js/get-promisable-result)

## Install

#### npm

```bash
npm install get-promisable-result
```

#### yarn

```bash
yarn add get-promisable-result
```

#### PNPM

```bash
pnpm add get-promisable-result
```

## API

```typescript
getPromisableResult(
  getResultFunction: () => T,
  checkResult: (result: T) => boolean,
  options: PromisableOptions = {}
): Promise<T>
```

`getResultFunction` should be a function that returns something. This something is what you expect when the promise gets resolved.

`checkResult` is a function that will have as a parameter the result of the `getResultFunction` and it should return a `boolean` to validate that the result is OK. If this function returns `false`, the `getResultFunction` will be executed a limited number of times (consult the [options](#options) section) until its result pass the check or until it reached the `retries` (consult the [options](#options) section).

### Options

| Parameter      | Type          | Default | Description                                                         |
| -------------- | ------------- | ------- | ------------------------------------------------------------------- |
| retries        | number        | 10      | number of retries that will be performed before the promise rejects |
| delay          | number        | 10      | delay between the retries                                           |
| shouldReject   | boolean       | true    | indicates if the promise should be rejected when the number of retries reached the limit. If this parameter is set to `false` and the number of retries is reached the Promise will be resolved with the last value returned by `getResultFunction` |
| rejectMessage  | string        | \*\*    | custom error message. It can contain the substring `{{ retries }}` and it will be replaced with the number of `retries` |

>\*\* The default `rejectMessage` will be `Could not get the result after {{ retries }} retries`

## Example

Querying a DOM element that is rendered asynchronously with a custom `retries`, `delay` and `rejectMessage`

```typescript
getPromisableResult(
  () => document.getElementById('my-element'),
  (element) => element !== null,
  {
    retries: 50,
    delay: 100,
    rejectMessage: 'My element could not be retrieved after {{ restries }} retries'
  }
)
  .then((element) => {
    // Do something with the element
  })
  .catch((error) => {
    // Do something if the promise is rejected
    // My element could not be retrieved after 50 retries
  });
```
---
id: "siacheck"
title: "Module: siacheck"
sidebar_label: "siacheck"
sidebar_position: 0
custom_edit_url: null
---

A cloud function that checks if a license is valid against the SIA database.

## Functions

### google

▸ `Const` **google**(`req`, `res`): `Promise`<`void`\>

Initialises the server.

**`property`** license - This is the license you want to test

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `req` | `Request`<`ParamsDictionary`, `any`, `any`, `ParsedQs`, `Record`<`string`, `any`\>\> | The request object. |
| `res` | `Response`<`any`, `Record`<`string`, `any`\>\> | The response object. |

#### Returns

`Promise`<`void`\>

#### Defined in

[index.ts:110](https://github.com/Videndum/Eventiva/blob/7a604b5/projects/functions/siacheck/index.ts#L110)

___

### testLicense

▸ **testLicense**(`license`): `Promise`<``null`` \| { `active?`: `string` ; `activeDate?`: `number` ; `activeDesc?`: `string` ; `error?`: `string` ; `expiry?`: `string` ; `firstname?`: `string` ; `found`: ``"Valid"`` \| ``"Invalid"`` ; `lastValid?`: `string` ; `lastname?`: `string` ; `license?`: `string` ; `picture?`: `string` \| `void` \| `Buffer` ; `pictureAUTHURL?`: `string` ; `role?`: `string` ; `sector?`: `string` ; `sinceDate?`: `string`  }\>

Tests a license using the SIA database and puppeteer.

**`swagger`**

**`remarks`** -- This function is not intended to be called directly by end user.

**`description`** Checks the license number against the SIA database and returns the result

**`alpha`**

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `license` | `string` | License number to check |

#### Returns

`Promise`<``null`` \| { `active?`: `string` ; `activeDate?`: `number` ; `activeDesc?`: `string` ; `error?`: `string` ; `expiry?`: `string` ; `firstname?`: `string` ; `found`: ``"Valid"`` \| ``"Invalid"`` ; `lastValid?`: `string` ; `lastname?`: `string` ; `license?`: `string` ; `picture?`: `string` \| `void` \| `Buffer` ; `pictureAUTHURL?`: `string` ; `role?`: `string` ; `sector?`: `string` ; `sinceDate?`: `string`  }\>

#### Defined in

[index.ts:21](https://github.com/Videndum/Eventiva/blob/7a604b5/projects/functions/siacheck/index.ts#L21)

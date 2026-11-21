# The JSDoc tag contract

`eslint.config.mjs` applies `eslint-plugin-jsdoc` 65.4.6 to the globs in `jsdocAdoptedFiles`. The target is every JS/TS file in `packages`, `apps`, `tests`, `tools`, `scripts` and `storage`, except files synced from `Resnovas/.github`. Add a group's glob in the commit that clears its findings; never add a baseline or suppression. Read the table in `docs/documentation-standard.md` before writing JSDoc.

- Each callable gets a sentence description, `@param` per parameter and `@returns` when it returns a value.
- Each export gets `@since <package version>` and `@example`.
- An Effect documents its success in `@returns` and each typed failure with `@fails {ErrorTag}`.
- `@access` names the resource or action permission a caller must hold, in the dotted form of the `Permission` schema in `packages/contracts/src/action.ts`. Never a role.
- Callbacks passed to `Effect.gen` need only a description.
- Never write `@throws`, `@exception`, `@author`, `@license` or `@version`.
- JavaScript files may keep JSDoc types; TypeScript files may not.
- A callback that needs `@param` and follows another argument (`it('name', fn)`) becomes a named, documented `const`.

```ts
/**
 * An `I18n` layer for one locale.
 *
 * @since 0.0.1
 * @param options - The locale, catalogue and optional terminology pack, as for `make`.
 * @returns A layer providing `I18n`; building it never fails.
 * @example
 * const program = Effect.provide(useShellTitle, layer({ locale: 'en-GB', catalogue }));
 */
export const layer = (options: I18nOptions): Layer.Layer<I18n> => Layer.effect(I18n, make(options));
```

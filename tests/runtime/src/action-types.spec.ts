/**
 * @file tests/runtime/src/action-types.spec.ts
 *
 * Copyright 2026 Jonathan Stevens trading as Resnovas. All rights reserved.
 * Licensed under the Fair Core License, Version 1.0, MIT Future License
 * (FCL-1.0-MIT); see LICENSE. You may not move, change, disable or circumvent
 * the licence key functionality, or modify any part of the software that the
 * licence key protects.
 *
 * Contributions are made under the Developer Certificate of Origin (DCO.md) and
 * the Contributing Guidelines (CONTRIBUTING.md), subject to the Code of Conduct
 * (CODE_OF_CONDUCT.md) and the Cooperation Commitment (COOPERATION_COMMITMENT.md).
 *
 * DELETING THIS NOTICE AUTOMATICALLY VOIDS YOUR LICENSE.
 */

import { fileURLToPath } from 'node:url';
import { expect, it } from '@effect/vitest';
import ts from 'typescript';

it('preserves schema and service inference and rejects incompatible action implementations without suppressions', /** Compile positive and negative action bindings together so each rejected contract has a real diagnostic. */ () => {
    // Keep fixture text unchanged: line offsets below attribute one diagnostic to each negative case.
    const root = fileURLToPath(new URL('../../../', import.meta.url));
    const filename = `${root}tests/runtime/src/action-type-fixture.ts`;
    const positive = `
import { define, type Input, type Output, type Failure } from '@eventiva/contracts/action';
import { Authorizer, type CallerIdentity } from '@eventiva/contracts/caller';
import { implement } from '@eventiva/runtime/action';
import { ActionHost } from '@eventiva/runtime/host';
import { ExecutionPolicy } from '@eventiva/runtime/invocation';
import { expectTypeOf } from '@effect/vitest';
import { Context, Effect, Layer, Schema } from 'effect';
class Store extends Context.Tag('fixture/Store')<Store, { readonly value: number }>() {}
class Other extends Context.Tag('fixture/Other')<Other, { readonly text: string }>() {}
const spec = define('fixture.exact', {
    version: 1, description: 'Exact schema proof.',
    input: Schema.Struct({ value: Schema.NumberFromString }),
    output: Schema.Struct({ doubled: Schema.NumberFromString }),
    error: Schema.TaggedStruct('Rejected', { code: Schema.Number }),
    permission: 'fixture.exact', sideEffect: 'read', offline: 'local',
});
const binding = implement(spec, ({ value }) => Effect.map(Store, (store) => ({ doubled: value * store.value })));
const retainedSchema: typeof spec.input = binding.spec.input;
expectTypeOf<Parameters<typeof binding.handler>[0]>().toEqualTypeOf<{ readonly value: number }>();
expectTypeOf<Effect.Effect.Success<ReturnType<typeof binding.handler>>>().toEqualTypeOf<{ readonly doubled: number }>();
expectTypeOf<Effect.Effect.Error<ReturnType<typeof binding.handler>>>().toEqualTypeOf<{ readonly _tag: 'Rejected'; readonly code: number }>();
expectTypeOf<Effect.Effect.Context<ReturnType<typeof binding.handler>>>().toEqualTypeOf<Store>();
expectTypeOf<Schema.Schema.Encoded<typeof binding.spec.input>>().toEqualTypeOf<{ readonly value: string }>();
expectTypeOf<Schema.Schema.Encoded<typeof binding.spec.output>>().toEqualTypeOf<{ readonly doubled: string }>();
declare const contextualSchema: Schema.Schema<string, string, Store>;
declare const astOnly: { readonly ast: typeof Schema.String.ast; readonly Context: never };
const portableOptions = {
    version: 1, description: 'Service-free schemas.', input: Schema.String, output: Schema.String, error: Schema.String,
    permission: spec.permission, sideEffect: spec.sideEffect, offline: spec.offline,
};
const portableControl = define('fixture.portable', portableOptions);
const identifier = Schema.String.pipe(Schema.brand('ActionIdentifier'));
const branded = define('fixture.branded', {
    version: 1, description: 'Branded schema proof.', input: identifier, output: identifier,
    permission: 'fixture.branded', sideEffect: 'read', offline: 'local',
});
const brandedBinding = implement(branded, (value) => Effect.succeed(value));
const retainedBrand: Effect.Effect<typeof identifier.Type> = brandedBinding.handler(identifier.make('id'));
const retainedConstructor: typeof identifier.make = brandedBinding.spec.input.make;
const exact: (input: { readonly value: number }) => Effect.Effect<{ readonly doubled: number },
    { readonly _tag: 'Rejected'; readonly code: number }, Store> = binding.handler;
const needsStore: Effect.Effect<{ readonly doubled: number }, Failure<typeof spec>, Store> = exact({ value: 3 });
const input: Input<typeof spec> = { value: 2 };
const output: Output<typeof spec> = { doubled: 4 };
const failure: Failure<typeof spec> = { _tag: 'Rejected', code: 7 };
const noError = define('fixture.pure', {
    version: 1, description: 'No failure schema.', input: Schema.String, output: Schema.Number,
    permission: 'fixture.pure', sideEffect: 'read', offline: 'local',
});
declare const caller: CallerIdentity;
declare const auth: typeof Authorizer.Service;
declare const policy: typeof ExecutionPolicy.Service;
declare const host: typeof ActionHost.Service;
const manifest = { format: 1, id: 'fixture', version: '1.0.0', description: 'Fixture.', actions: [spec.name], flags: [] };
const provided = host.register({ manifest, actions: [binding], layer: Layer.succeed(Store, { value: 3 }) });
const swapped = host.register({ manifest, actions: [binding], layer: Layer.succeed(Store, { value: 9 }) });
const empty = host.register({ manifest: { ...manifest, actions: [] }, actions: [] });
const checked = auth.check(caller, spec, input);
const inspected = policy.inspect(caller, spec, input, {});
void [provided, swapped, empty, needsStore, output, failure, Other, noError, checked, inspected,
    retainedSchema, retainedBrand, retainedConstructor];
`;
    const negatives = [
        `implement(spec, (input: { readonly value: string }) => Effect.succeed({ doubled: input.value }));`,
        `implement(spec, () => Effect.succeed({ doubled: 'wrong decoded output' }));`,
        `implement(spec, () => Effect.fail({ _tag: 'Wrong', code: 7 }));`,
        `implement(noError, () => Effect.fail('undeclared'));`,
        `host.register({ manifest, actions: [binding] });`,
        `host.register({ manifest, actions: [binding], layer: Layer.succeed(Other, { text: 'wrong provider' }) });`,
        `const missing: Effect.Effect<{ readonly doubled: number }, Failure<typeof spec>> = binding.handler(input);`,
        `auth.check(caller, spec, { value: 'wire is not decoded' });`,
        `policy.inspect(caller, spec, { value: 'wire is not decoded' }, {});`,
        `const wrongInput: Input<typeof spec> = { value: 'wrong' };`,
        `const wrongOutput: Output<typeof spec> = { doubled: 'wrong' };`,
        `const wrongFailure: Failure<typeof spec> = { _tag: 'Rejected', code: 'wrong' };`,
        `const impossible: Failure<typeof noError> = 'undeclared';`,
        `brandedBinding.handler('unbranded');`,
        `implement(branded, () => Effect.succeed('unbranded'));`,
        `define('fixture.context-input', { ...portableOptions, input: contextualSchema });`,
        `define('fixture.context-output', { ...portableOptions, output: contextualSchema });`,
        `define('fixture.context-error', { ...portableOptions, error: contextualSchema });`,
        `define('fixture.ast-only', { ...portableOptions, input: astOnly });`,
    ];
    const source =
        positive +
        negatives
            .map(
                /** Preserve declarations while making rejected expression fixtures valid statements. */ (
                    expression
                ) => (expression.startsWith('const ') ? expression : `void ${expression}`)
            )
            .join('\n');
    const parsed = ts.parseJsonSourceFileConfigFileContent(
        ts.readJsonConfigFile(`${root}tsconfig.base.json`, ts.sys.readFile),
        ts.sys,
        root
    );
    const options: ts.CompilerOptions = {
        ...parsed.options,
        composite: false,
        noEmit: true,
        declaration: false,
        declarationMap: false,
        emitDeclarationOnly: false,
        noUnusedLocals: false,
        noUnusedParameters: false,
    };
    const compiler = ts.createCompilerHost(options);
    const read = compiler.readFile;
    const exists = compiler.fileExists;
    compiler.readFile =
        /** Overlay only the virtual fixture; dependencies still resolve through the real compiler host. */ (path) =>
            path === filename ? source : read(path);
    compiler.fileExists = /** Advertise the virtual fixture without masking real dependency existence checks. */ (
        path
    ) => path === filename || exists(path);
    const program = ts.createProgram([filename], options, compiler);
    const diagnostics = ts.getPreEmitDiagnostics(program);
    const observed = diagnostics.map(
        /** Retain line attribution, code and readable compiler text for fixture assertions. */ (diagnostic) => ({
            line: diagnostic.file?.getLineAndCharacterOfPosition(diagnostic.start ?? 0).line,
            code: diagnostic.code,
            text: ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'),
        })
    );
    const firstNegative = positive.split('\n').length - 1;
    expect(
        observed.filter(
            /** Catch configuration errors and regressions in the positive contract examples. */ (diagnostic) =>
                diagnostic.line === undefined || diagnostic.line < firstNegative
        )
    ).toEqual([]);
    const standard = observed.filter(
        /** Separate TypeScript diagnostics from the patched Effect compiler's low-numbered checks. */ (diagnostic) =>
            diagnostic.code >= 1000
    );
    expect(
        standard.map(
            /** Compare compiler codes in source order without coupling to message wording. */ (diagnostic) =>
                diagnostic.code
        )
    ).toEqual([
        2345, 2375, 2375, 2375, 2345, 2322, 2375, 2322, 2322, 2322, 2322, 2322, 2322, 2345, 2375, 2322, 2322, 2322,
        2322,
    ]);
    // The patched compiler additionally diagnoses missing Effect errors/environments.
    expect(
        observed
            .filter(
                /** Select Effect-specific missing error/environment diagnostics. */ (diagnostic) =>
                    diagnostic.code < 1000
            )
            .map(/** Preserve the patched compiler's diagnostic ordering. */ (diagnostic) => diagnostic.code)
    ).toEqual([1, 1, 1]);
    for (const [index, expression] of negatives.entries()) {
        const errors = standard.filter(
            /** Bind this negative source line to its diagnostic rather than relying only on totals. */ (diagnostic) =>
                diagnostic.line === firstNegative + index
        );
        expect(errors, expression).toHaveLength(1);
    }
    expect(standard).toHaveLength(negatives.length);
}, 30_000);

import {
    ParseConfig,
    createParser,
    typeDefProxy,
    UnknownTypeError
} from "./internal.js"
import { Str } from "../str.js"
import { ArrowFunction } from "./arrowFunction.js"
import { List } from "./list.js"
import { Or } from "./or.js"
import { Optional } from "./optional.js"
import { ElementOf } from "@re-/tools"

export namespace Expression {
    export type Definition =
        | `${string}${ElementOf<Str.ControlCharacters>}${string}`
    // | Optional.Definition
    // | ArrowFunction.Definition
    // | Or.Definition
    // | List.Definition

    export type Check<
        Def extends string,
        Root extends string,
        Typespace
    > = Def extends Optional.Definition<infer Inner>
        ? Str.Check<Inner, Root, Typespace>
        : Def extends ArrowFunction.Definition<infer Parameters, infer Return>
        ? ArrowFunction.Check<Parameters, Return, Root, Typespace>
        : Def extends Or.Definition
        ? Or.Check<Def, Root, Typespace>
        : Def extends List.Definition<infer ListItem>
        ? Str.Check<ListItem, Root, Typespace>
        : UnknownTypeError<Def>

    export type Parse<
        Def extends string,
        Typespace,
        Options extends ParseConfig
    > = Def extends Optional.Definition<infer Inner>
        ? Str.Parse<Inner, Typespace, Options> | undefined
        : Def extends ArrowFunction.Definition<infer Parameters, infer Return>
        ? ArrowFunction.Parse<Parameters, Return, Typespace, Options>
        : Def extends Or.Definition
        ? Or.Parse<Def, Typespace, Options>
        : Def extends List.Definition<infer ListItem>
        ? Str.Parse<ListItem, Typespace, Options>[]
        : unknown

    export const type = typeDefProxy as Definition

    export const parse = createParser(
        {
            type,
            parent: () => Str.parse,
            children: () => [
                Optional.delegate,
                ArrowFunction.delegate,
                Or.delegate,
                List.delegate
            ]
        },
        {
            // Any string containing a control character will be interpreted as an expression
            matches: (def) => !!def.match(Str.controlCharacterMatcher)
        }
    )

    export const delegate = parse as any as Definition
}

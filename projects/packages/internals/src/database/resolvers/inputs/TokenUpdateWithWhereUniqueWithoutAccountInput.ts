import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { TokenUpdateWithoutAccountInput } from '../inputs/TokenUpdateWithoutAccountInput';
import { TokenWhereUniqueInput } from '../inputs/TokenWhereUniqueInput';

@TypeGraphQL.InputType('TokenUpdateWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class TokenUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => TokenWhereUniqueInput, {
    nullable: false,
  })
  where!: TokenWhereUniqueInput;

  @TypeGraphQL.Field((_type) => TokenUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: TokenUpdateWithoutAccountInput;
}

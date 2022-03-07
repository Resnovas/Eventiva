import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { RTWUpdateWithoutAccountInput } from '../inputs/RTWUpdateWithoutAccountInput';
import { RTWWhereUniqueInput } from '../inputs/RTWWhereUniqueInput';

@TypeGraphQL.InputType('RTWUpdateWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class RTWUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => RTWWhereUniqueInput, {
    nullable: false,
  })
  where!: RTWWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RTWUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: RTWUpdateWithoutAccountInput;
}

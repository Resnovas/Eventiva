import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ApplicationUpdateWithoutAccountInput } from '../inputs/ApplicationUpdateWithoutAccountInput';
import { ApplicationWhereUniqueInput } from '../inputs/ApplicationWhereUniqueInput';

@TypeGraphQL.InputType('ApplicationUpdateWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class ApplicationUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => ApplicationWhereUniqueInput, {
    nullable: false,
  })
  where!: ApplicationWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ApplicationUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: ApplicationUpdateWithoutAccountInput;
}

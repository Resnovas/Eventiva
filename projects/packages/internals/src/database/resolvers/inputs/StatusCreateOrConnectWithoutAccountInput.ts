import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusCreateWithoutAccountInput } from '../inputs/StatusCreateWithoutAccountInput';
import { StatusWhereUniqueInput } from '../inputs/StatusWhereUniqueInput';

@TypeGraphQL.InputType('StatusCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class StatusCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => StatusWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusWhereUniqueInput;

  @TypeGraphQL.Field((_type) => StatusCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: StatusCreateWithoutAccountInput;
}

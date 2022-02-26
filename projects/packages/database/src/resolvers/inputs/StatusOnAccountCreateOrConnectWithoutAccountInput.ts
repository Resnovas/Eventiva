import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateWithoutAccountInput } from '../inputs/StatusOnAccountCreateWithoutAccountInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('StatusOnAccountCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class StatusOnAccountCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: StatusOnAccountCreateWithoutAccountInput;
}

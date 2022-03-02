import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ManagersOnAccountCreateWithoutAccountInput } from '../inputs/ManagersOnAccountCreateWithoutAccountInput';
import { ManagersOnAccountWhereUniqueInput } from '../inputs/ManagersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('ManagersOnAccountCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class ManagersOnAccountCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => ManagersOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: ManagersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => ManagersOnAccountCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: ManagersOnAccountCreateWithoutAccountInput;
}

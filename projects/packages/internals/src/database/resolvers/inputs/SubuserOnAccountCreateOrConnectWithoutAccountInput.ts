import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountCreateWithoutAccountInput } from '../inputs/SubuserOnAccountCreateWithoutAccountInput';
import { SubuserOnAccountWhereUniqueInput } from '../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.InputType('SubuserOnAccountCreateOrConnectWithoutAccountInput', {
  isAbstract: true,
})
export class SubuserOnAccountCreateOrConnectWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: SubuserOnAccountCreateWithoutAccountInput;
}

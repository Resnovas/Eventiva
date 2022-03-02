import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';

@TypeGraphQL.InputType('StatusOnAccountStatusIdAccountIdCompoundUniqueInput', {
  isAbstract: true,
})
export class StatusOnAccountStatusIdAccountIdCompoundUniqueInput {
  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  statusId!: string;

  @TypeGraphQL.Field((_type) => String, {
    nullable: false,
  })
  accountId!: string;
}

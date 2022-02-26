import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountStatusIdAccountIdCompoundUniqueInput } from '../inputs/StatusOnAccountStatusIdAccountIdCompoundUniqueInput';

@TypeGraphQL.InputType('StatusOnAccountWhereUniqueInput', {
  isAbstract: true,
})
export class StatusOnAccountWhereUniqueInput {
  @TypeGraphQL.Field(
    (_type) => StatusOnAccountStatusIdAccountIdCompoundUniqueInput,
    {
      nullable: true,
    }
  )
  statusId_accountId?:
    | StatusOnAccountStatusIdAccountIdCompoundUniqueInput
    | undefined;
}

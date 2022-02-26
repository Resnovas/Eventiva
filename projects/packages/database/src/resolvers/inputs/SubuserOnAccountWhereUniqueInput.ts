import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountAccountIdSubuserIdCompoundUniqueInput } from '../inputs/SubuserOnAccountAccountIdSubuserIdCompoundUniqueInput';

@TypeGraphQL.InputType('SubuserOnAccountWhereUniqueInput', {
  isAbstract: true,
})
export class SubuserOnAccountWhereUniqueInput {
  @TypeGraphQL.Field(
    (_type) => SubuserOnAccountAccountIdSubuserIdCompoundUniqueInput,
    {
      nullable: true,
    }
  )
  accountId_subuserId?:
    | SubuserOnAccountAccountIdSubuserIdCompoundUniqueInput
    | undefined;
}

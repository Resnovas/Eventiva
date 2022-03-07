import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountAccountIdEmployerIdCompoundUniqueInput } from '../inputs/EmployersOnAccountAccountIdEmployerIdCompoundUniqueInput';

@TypeGraphQL.InputType('EmployersOnAccountWhereUniqueInput', {
  isAbstract: true,
})
export class EmployersOnAccountWhereUniqueInput {
  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountAccountIdEmployerIdCompoundUniqueInput,
    {
      nullable: true,
    }
  )
  accountId_employerId?:
    | EmployersOnAccountAccountIdEmployerIdCompoundUniqueInput
    | undefined;
}

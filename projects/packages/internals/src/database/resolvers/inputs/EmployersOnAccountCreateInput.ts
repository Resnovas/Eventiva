import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountCreateNestedOneWithoutEmployeesInput } from '../inputs/AccountCreateNestedOneWithoutEmployeesInput';
import { AccountCreateNestedOneWithoutEmployerInput } from '../inputs/AccountCreateNestedOneWithoutEmployerInput';

@TypeGraphQL.InputType('EmployersOnAccountCreateInput', {
  isAbstract: true,
})
export class EmployersOnAccountCreateInput {
  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  createdAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => Date, {
    nullable: true,
  })
  updatedAt?: Date | undefined;

  @TypeGraphQL.Field((_type) => AccountCreateNestedOneWithoutEmployerInput, {
    nullable: false,
  })
  account!: AccountCreateNestedOneWithoutEmployerInput;

  @TypeGraphQL.Field((_type) => AccountCreateNestedOneWithoutEmployeesInput, {
    nullable: false,
  })
  employer!: AccountCreateNestedOneWithoutEmployeesInput;
}

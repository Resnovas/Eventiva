import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateWithoutEmployerInput } from '../inputs/EmployersOnAccountCreateWithoutEmployerInput';
import { EmployersOnAccountWhereUniqueInput } from '../inputs/EmployersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'EmployersOnAccountCreateOrConnectWithoutEmployerInput',
  {
    isAbstract: true,
  }
)
export class EmployersOnAccountCreateOrConnectWithoutEmployerInput {
  @TypeGraphQL.Field((_type) => EmployersOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => EmployersOnAccountCreateWithoutEmployerInput, {
    nullable: false,
  })
  create!: EmployersOnAccountCreateWithoutEmployerInput;
}

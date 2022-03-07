import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountScalarWhereInput } from '../inputs/EmployersOnAccountScalarWhereInput';
import { EmployersOnAccountUpdateManyMutationInput } from '../inputs/EmployersOnAccountUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'EmployersOnAccountUpdateManyWithWhereWithoutEmployerInput',
  {
    isAbstract: true,
  }
)
export class EmployersOnAccountUpdateManyWithWhereWithoutEmployerInput {
  @TypeGraphQL.Field((_type) => EmployersOnAccountScalarWhereInput, {
    nullable: false,
  })
  where!: EmployersOnAccountScalarWhereInput;

  @TypeGraphQL.Field((_type) => EmployersOnAccountUpdateManyMutationInput, {
    nullable: false,
  })
  data!: EmployersOnAccountUpdateManyMutationInput;
}
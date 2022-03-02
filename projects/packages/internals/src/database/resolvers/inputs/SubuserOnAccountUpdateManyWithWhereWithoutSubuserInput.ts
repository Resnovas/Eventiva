import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountScalarWhereInput } from '../inputs/SubuserOnAccountScalarWhereInput';
import { SubuserOnAccountUpdateManyMutationInput } from '../inputs/SubuserOnAccountUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'SubuserOnAccountUpdateManyWithWhereWithoutSubuserInput',
  {
    isAbstract: true,
  }
)
export class SubuserOnAccountUpdateManyWithWhereWithoutSubuserInput {
  @TypeGraphQL.Field((_type) => SubuserOnAccountScalarWhereInput, {
    nullable: false,
  })
  where!: SubuserOnAccountScalarWhereInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountUpdateManyMutationInput, {
    nullable: false,
  })
  data!: SubuserOnAccountUpdateManyMutationInput;
}

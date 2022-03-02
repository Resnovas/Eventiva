import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountScalarWhereInput } from '../inputs/StatusOnAccountScalarWhereInput';
import { StatusOnAccountUpdateManyMutationInput } from '../inputs/StatusOnAccountUpdateManyMutationInput';

@TypeGraphQL.InputType(
  'StatusOnAccountUpdateManyWithWhereWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class StatusOnAccountUpdateManyWithWhereWithoutAccountInput {
  @TypeGraphQL.Field((_type) => StatusOnAccountScalarWhereInput, {
    nullable: false,
  })
  where!: StatusOnAccountScalarWhereInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountUpdateManyMutationInput, {
    nullable: false,
  })
  data!: StatusOnAccountUpdateManyMutationInput;
}

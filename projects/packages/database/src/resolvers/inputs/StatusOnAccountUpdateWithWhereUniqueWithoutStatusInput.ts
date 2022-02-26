import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountUpdateWithoutStatusInput } from '../inputs/StatusOnAccountUpdateWithoutStatusInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'StatusOnAccountUpdateWithWhereUniqueWithoutStatusInput',
  {
    isAbstract: true,
  }
)
export class StatusOnAccountUpdateWithWhereUniqueWithoutStatusInput {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountUpdateWithoutStatusInput, {
    nullable: false,
  })
  data!: StatusOnAccountUpdateWithoutStatusInput;
}

import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { StatusOnAccountCreateWithoutStatusInput } from '../inputs/StatusOnAccountCreateWithoutStatusInput';
import { StatusOnAccountUpdateWithoutStatusInput } from '../inputs/StatusOnAccountUpdateWithoutStatusInput';
import { StatusOnAccountWhereUniqueInput } from '../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'StatusOnAccountUpsertWithWhereUniqueWithoutStatusInput',
  {
    isAbstract: true,
  }
)
export class StatusOnAccountUpsertWithWhereUniqueWithoutStatusInput {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountUpdateWithoutStatusInput, {
    nullable: false,
  })
  update!: StatusOnAccountUpdateWithoutStatusInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateWithoutStatusInput, {
    nullable: false,
  })
  create!: StatusOnAccountCreateWithoutStatusInput;
}

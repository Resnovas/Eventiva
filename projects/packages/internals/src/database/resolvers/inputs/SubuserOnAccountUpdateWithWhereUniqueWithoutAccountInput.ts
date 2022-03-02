import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountUpdateWithoutAccountInput } from '../inputs/SubuserOnAccountUpdateWithoutAccountInput';
import { SubuserOnAccountWhereUniqueInput } from '../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'SubuserOnAccountUpdateWithWhereUniqueWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class SubuserOnAccountUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: SubuserOnAccountUpdateWithoutAccountInput;
}

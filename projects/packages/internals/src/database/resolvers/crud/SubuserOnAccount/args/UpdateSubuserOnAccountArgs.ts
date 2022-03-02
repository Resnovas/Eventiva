import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubuserOnAccountUpdateInput } from '../../../inputs/SubuserOnAccountUpdateInput';
import { SubuserOnAccountWhereUniqueInput } from '../../../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateSubuserOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubuserOnAccountUpdateInput, {
    nullable: false,
  })
  data!: SubuserOnAccountUpdateInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubuserOnAccountWhereUniqueInput;
}

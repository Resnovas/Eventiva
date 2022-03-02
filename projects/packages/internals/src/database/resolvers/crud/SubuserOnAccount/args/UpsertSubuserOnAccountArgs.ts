import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SubuserOnAccountCreateInput } from '../../../inputs/SubuserOnAccountCreateInput';
import { SubuserOnAccountUpdateInput } from '../../../inputs/SubuserOnAccountUpdateInput';
import { SubuserOnAccountWhereUniqueInput } from '../../../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertSubuserOnAccountArgs {
  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountCreateInput, {
    nullable: false,
  })
  create!: SubuserOnAccountCreateInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountUpdateInput, {
    nullable: false,
  })
  update!: SubuserOnAccountUpdateInput;
}

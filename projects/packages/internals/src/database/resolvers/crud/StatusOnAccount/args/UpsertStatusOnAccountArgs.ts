import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusOnAccountCreateInput } from '../../../inputs/StatusOnAccountCreateInput';
import { StatusOnAccountUpdateInput } from '../../../inputs/StatusOnAccountUpdateInput';
import { StatusOnAccountWhereUniqueInput } from '../../../inputs/StatusOnAccountWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertStatusOnAccountArgs {
  @TypeGraphQL.Field((_type) => StatusOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountCreateInput, {
    nullable: false,
  })
  create!: StatusOnAccountCreateInput;

  @TypeGraphQL.Field((_type) => StatusOnAccountUpdateInput, {
    nullable: false,
  })
  update!: StatusOnAccountUpdateInput;
}

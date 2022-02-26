import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { StatusCreateInput } from '../../../inputs/StatusCreateInput';
import { StatusUpdateInput } from '../../../inputs/StatusUpdateInput';
import { StatusWhereUniqueInput } from '../../../inputs/StatusWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertStatusArgs {
  @TypeGraphQL.Field((_type) => StatusWhereUniqueInput, {
    nullable: false,
  })
  where!: StatusWhereUniqueInput;

  @TypeGraphQL.Field((_type) => StatusCreateInput, {
    nullable: false,
  })
  create!: StatusCreateInput;

  @TypeGraphQL.Field((_type) => StatusUpdateInput, {
    nullable: false,
  })
  update!: StatusUpdateInput;
}

import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/TokenOrderByWithRelationAndSearchRelevanceInput";
import { TokenWhereInput } from "../../../inputs/TokenWhereInput";
import { TokenWhereUniqueInput } from "../../../inputs/TokenWhereUniqueInput";

@TypeGraphQL.ArgsType()
export class AggregateTokenArgs {
  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  where?: TokenWhereInput | undefined;

  @TypeGraphQL.Field(_type => [TokenOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: TokenOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => TokenWhereUniqueInput, {
    nullable: true
  })
  cursor?: TokenWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

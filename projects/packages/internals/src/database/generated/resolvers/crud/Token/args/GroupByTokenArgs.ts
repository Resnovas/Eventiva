import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { TokenOrderByWithAggregationInput } from "../../../inputs/TokenOrderByWithAggregationInput";
import { TokenScalarWhereWithAggregatesInput } from "../../../inputs/TokenScalarWhereWithAggregatesInput";
import { TokenWhereInput } from "../../../inputs/TokenWhereInput";
import { TokenScalarFieldEnum } from "../../../../enums/TokenScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByTokenArgs {
  @TypeGraphQL.Field(_type => TokenWhereInput, {
    nullable: true
  })
  where?: TokenWhereInput | undefined;

  @TypeGraphQL.Field(_type => [TokenOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: TokenOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [TokenScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "nickname" | "createdAt" | "updatedAt" | "type" | "value" | "expiry" | "accountID" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => TokenScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: TokenScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

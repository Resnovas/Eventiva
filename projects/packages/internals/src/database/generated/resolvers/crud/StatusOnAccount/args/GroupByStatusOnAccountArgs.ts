import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { StatusOnAccountOrderByWithAggregationInput } from "../../../inputs/StatusOnAccountOrderByWithAggregationInput";
import { StatusOnAccountScalarWhereWithAggregatesInput } from "../../../inputs/StatusOnAccountScalarWhereWithAggregatesInput";
import { StatusOnAccountWhereInput } from "../../../inputs/StatusOnAccountWhereInput";
import { StatusOnAccountScalarFieldEnum } from "../../../../enums/StatusOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByStatusOnAccountArgs {
  @TypeGraphQL.Field(_type => StatusOnAccountWhereInput, {
    nullable: true
  })
  where?: StatusOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [StatusOnAccountOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: StatusOnAccountOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [StatusOnAccountScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"statusId" | "accountId" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => StatusOnAccountScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: StatusOnAccountScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SubuserOnAccountOrderByWithAggregationInput } from "../../../inputs/SubuserOnAccountOrderByWithAggregationInput";
import { SubuserOnAccountScalarWhereWithAggregatesInput } from "../../../inputs/SubuserOnAccountScalarWhereWithAggregatesInput";
import { SubuserOnAccountWhereInput } from "../../../inputs/SubuserOnAccountWhereInput";
import { SubuserOnAccountScalarFieldEnum } from "../../../../enums/SubuserOnAccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupBySubuserOnAccountArgs {
  @TypeGraphQL.Field(_type => SubuserOnAccountWhereInput, {
    nullable: true
  })
  where?: SubuserOnAccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: SubuserOnAccountOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [SubuserOnAccountScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"accountId" | "subuserId" | "createdAt" | "updatedAt" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => SubuserOnAccountScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: SubuserOnAccountScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

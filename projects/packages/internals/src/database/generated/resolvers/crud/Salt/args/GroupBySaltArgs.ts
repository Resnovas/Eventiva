import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { SaltOrderByWithAggregationInput } from "../../../inputs/SaltOrderByWithAggregationInput";
import { SaltScalarWhereWithAggregatesInput } from "../../../inputs/SaltScalarWhereWithAggregatesInput";
import { SaltWhereInput } from "../../../inputs/SaltWhereInput";
import { SaltScalarFieldEnum } from "../../../../enums/SaltScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupBySaltArgs {
  @TypeGraphQL.Field(_type => SaltWhereInput, {
    nullable: true
  })
  where?: SaltWhereInput | undefined;

  @TypeGraphQL.Field(_type => [SaltOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: SaltOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [SaltScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "salt" | "expiry" | "accountID" | "deletedDate" | "deleted">;

  @TypeGraphQL.Field(_type => SaltScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: SaltScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

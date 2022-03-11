import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AccountOrderByWithAggregationInput } from "../../../inputs/AccountOrderByWithAggregationInput";
import { AccountScalarWhereWithAggregatesInput } from "../../../inputs/AccountScalarWhereWithAggregatesInput";
import { AccountWhereInput } from "../../../inputs/AccountWhereInput";
import { AccountScalarFieldEnum } from "../../../../enums/AccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class GroupByAccountArgs {
  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  where?: AccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [AccountOrderByWithAggregationInput], {
    nullable: true
  })
  orderBy?: AccountOrderByWithAggregationInput[] | undefined;

  @TypeGraphQL.Field(_type => [AccountScalarFieldEnum], {
    nullable: false
  })
  by!: Array<"id" | "username" | "accountType" | "subsciption" | "createdAt" | "updatedAt" | "lastLogin" | "applied" | "promoted" | "retired" | "title" | "firstname" | "midname" | "lastname" | "Salutation" | "dob" | "sex" | "label" | "password" | "resetPasswordToken" | "resetPasswordExpires" | "deleted">;

  @TypeGraphQL.Field(_type => AccountScalarWhereWithAggregatesInput, {
    nullable: true
  })
  having?: AccountScalarWhereWithAggregatesInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;
}

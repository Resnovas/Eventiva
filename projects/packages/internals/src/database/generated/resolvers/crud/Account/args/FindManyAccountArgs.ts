import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { AccountOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/AccountOrderByWithRelationAndSearchRelevanceInput";
import { AccountWhereInput } from "../../../inputs/AccountWhereInput";
import { AccountWhereUniqueInput } from "../../../inputs/AccountWhereUniqueInput";
import { AccountScalarFieldEnum } from "../../../../enums/AccountScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindManyAccountArgs {
  @TypeGraphQL.Field(_type => AccountWhereInput, {
    nullable: true
  })
  where?: AccountWhereInput | undefined;

  @TypeGraphQL.Field(_type => [AccountOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: AccountOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => AccountWhereUniqueInput, {
    nullable: true
  })
  cursor?: AccountWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [AccountScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "prn" | "username" | "accountType" | "subsciption" | "createdAt" | "updatedAt" | "lastLogin" | "applied" | "promoted" | "retired" | "title" | "firstname" | "midname" | "lastname" | "Salutation" | "dob" | "sex" | "label" | "password" | "resetPasswordToken" | "resetPasswordExpires" | "deletedDate" | "deleted"> | undefined;
}

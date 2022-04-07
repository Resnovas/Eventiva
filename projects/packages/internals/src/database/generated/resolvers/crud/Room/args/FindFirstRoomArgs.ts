import * as TypeGraphQL from "type-graphql";
import * as GraphQLScalars from "graphql-scalars";
import { RoomOrderByWithRelationAndSearchRelevanceInput } from "../../../inputs/RoomOrderByWithRelationAndSearchRelevanceInput";
import { RoomWhereInput } from "../../../inputs/RoomWhereInput";
import { RoomWhereUniqueInput } from "../../../inputs/RoomWhereUniqueInput";
import { RoomScalarFieldEnum } from "../../../../enums/RoomScalarFieldEnum";

@TypeGraphQL.ArgsType()
export class FindFirstRoomArgs {
  @TypeGraphQL.Field(_type => RoomWhereInput, {
    nullable: true
  })
  where?: RoomWhereInput | undefined;

  @TypeGraphQL.Field(_type => [RoomOrderByWithRelationAndSearchRelevanceInput], {
    nullable: true
  })
  orderBy?: RoomOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field(_type => RoomWhereUniqueInput, {
    nullable: true
  })
  cursor?: RoomWhereUniqueInput | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  take?: number | undefined;

  @TypeGraphQL.Field(_type => TypeGraphQL.Int, {
    nullable: true
  })
  skip?: number | undefined;

  @TypeGraphQL.Field(_type => [RoomScalarFieldEnum], {
    nullable: true
  })
  distinct?: Array<"id" | "createdAt" | "updatedAt" | "deletedDate" | "deleted" | "addressId" | "name" | "floor" | "building" | "accessibility" | "checkin" | "checkout" | "length" | "width" | "height"> | undefined;
}
